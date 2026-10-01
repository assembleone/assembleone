/*
 * FittersIQ cloud copy-and-verify (Stage 2.2, slices 1 and 2).
 *
 * Copies the Studio browser master to the cloud master structure tested in Stage 2.1,
 * then reads everything back and compares it with the source. The browser stays the
 * master: this module is handed copies of what the browser stored and never writes to
 * browser storage. Nothing here switches FittersIQ to cloud master.
 *
 *   companies/{c}/fiqMaster/{env}                   switch record (mode stays 'local')
 *   companies/{c}/fiqMaster/{env}/lease/studio      Studio editing lock
 *   companies/{c}/fiqMaster/{env}/customers/{id}    { rev, data: <customer>, ... }
 *   companies/{c}/fiqMaster/{env}/jobs/{id}         { rev, file, sha256, deleted, ... }
 *   companies/{c}/fiqMaster/{env}/settings/studio   { rev, values: { key: string } }
 *   fiqmaster/{c}/{env}/jobs/{id}/r{rev}-{sha}.json job package (below)
 *   fiqmaster/{c}/{env}/media/{sha256}              drawings and photos, by content
 *
 * Job package (schema 2), built as text so the browser job is embedded byte for byte:
 *   {"fiqPackage":2,"job":<exact browser job or null>,"drawings":{unitId:{sha256,...}},
 *    "links":{<link text>:{sha256,...}},"lifecycle":[...],"recycleBin":{deletedAt}|null}
 * Slice 1 files (the plain job) are still readable; a changed job becomes a package.
 *
 * Input: copyAndVerify({ state, drawings, settings }, migrationId)
 *   state     the saved Studio state (customers, projects, deletedProjectIds,
 *             deletedProjects, jobLifecycle, units, fitters, lastChosenPartName, ...)
 *   drawings  IndexedDB drawings: [{ key: 'jobId:unitId', drawing: dataURL, drawingType, drawingName }]
 *   settings  durable browser setting keys: { key: rawString }
 * A plain state object is accepted too (slice 1 callers).
 *
 * Works in the browser (Firebase web SDK 12) and in Node (tests): the Firebase
 * functions, instances and the link fetcher are passed in.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FiqCloudCopy=api})(typeof self!=='undefined'?self:this,function(){
'use strict';
const SCHEMA=1;
const LEASE_MS=3*60*1000;// lock length; the rules allow at most 5 minutes
const RENEW_MS=60*1000;
const SETTINGS_LIMIT=900*1024;// Firestore records stop at 1 MiB
const STATE_SETTINGS=['units','fitters','lastChosenPartName'];// durable; screen state is not copied
const PRODUCTION_LINK=/assembleone-fabac/i;// Production media is never fetched in this phase

const hex=buf=>Array.from(new Uint8Array(buf),b=>b.toString(16).padStart(2,'0')).join('');
async function sha256Hex(text){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))}
async function sha256Bytes(bytes){return hex(await crypto.subtle.digest('SHA-256',bytes))}
const utf8Bytes=text=>new TextEncoder().encode(text).length;
// Firestore and Storage path segments: no "/", not "." or "..", not __name__, not too long.
const validId=id=>typeof id==='string'&&id.length>0&&id.length<=700&&!id.includes('/')&&id!=='.'&&id!=='..'&&!/^__.*__$/.test(id);
// Everything that must survive exactly: ids and the piece identities used by QR codes.
function identities(job){
 const out=['job:'+job.id];
 (job.rooms||[]).forEach(r=>out.push('room:'+(r&&r.id)));
 (job.cabinets||[]).forEach(c=>{out.push('unit:'+c.id);(c.parts||[]).forEach(p=>{out.push('panel:'+c.id+':'+p.id);const n=Math.max(1,Math.floor(Number(p.qty))||1);for(let i=1;i<=n;i++)out.push('piece:'+job.id+':'+c.id+':'+p.id+':'+i)})});
 return out;
}
function sortKeys(v){if(Array.isArray(v))return v.map(sortKeys);if(v&&typeof v==='object'){const o={};Object.keys(v).sort().forEach(k=>{o[k]=sortKeys(v[k])});return o}return v}
const sameValue=(a,b)=>JSON.stringify(sortKeys(a))===JSON.stringify(sortKeys(b));
function dataUrlToBytes(url){
 const m=/^data:([^;,]*)((?:;[^;,]*)*),([\s\S]*)$/.exec(String(url||''));
 if(!m)return null;
 const type=(m[1]||'application/octet-stream').toLowerCase();
 if(/;base64/i.test(m[2])){const bin=atob(m[3]);const b=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)b[i]=bin.charCodeAt(i);return {bytes:b,contentType:type}}
 return {bytes:new TextEncoder().encode(decodeURIComponent(m[3])),contentType:type};
}
// Links to Firebase Storage files inside a job (Mobile / Studio photos).
const LINK=/^(https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/|https:\/\/storage\.googleapis\.com\/|http:\/\/(127\.0\.0\.1|localhost):\d+\/v0\/b\/)/;
function findLinks(value){const out=new Set();(function walk(v){if(typeof v==='string'){if(LINK.test(v))out.add(v)}else if(v&&typeof v==='object')(Array.isArray(v)?v:Object.values(v)).forEach(walk)})(value);return [...out].sort()}
class CopyError extends Error{constructor(code,message,detail){super(message);this.code=code;this.detail=detail}}

function createCloudCopy(o){
 const {fb,st,db,storage,companyId,env,uid,sessionId,deviceId}=o;
 const deviceName=o.deviceName||'Studio';
 const fetchLink=o.fetchLink||null,isAllowedLink=o.isAllowedLink||(()=>false);
 const hook=async(name,arg)=>{if(o.hooks&&typeof o.hooks[name]==='function')return o.hooks[name](arg)};
 if(!validId(companyId)||!(env==='beta'||env==='production')||!uid||!sessionId||!deviceId)throw new CopyError('config','Cloud copy is not configured (company, env, user, session, device).');
 const base='companies/'+companyId+'/fiqMaster/'+env;
 const leaseRef=()=>fb.doc(db,base+'/lease/studio');
 const custRef=id=>fb.doc(db,base+'/customers/'+id);
 const jobRef=id=>fb.doc(db,base+'/jobs/'+id);
 const settingsRef=()=>fb.doc(db,base+'/settings/studio');
 const switchRef=()=>fb.doc(db,base);
 const filePath=(jobId,rev,sha)=>'fiqmaster/'+companyId+'/'+env+'/jobs/'+jobId+'/r'+rev+'-'+sha+'.json';
 const mediaPath=sha=>'fiqmaster/'+companyId+'/'+env+'/media/'+sha;
 let lastRenew=0;

 // ---- Studio lock ----
 async function takeLease(){
  const snap=await fb.getDoc(leaseRef());
  let takeOver=false;
  if(snap.exists()){const l=snap.data();const until=l.expiresAt&&l.expiresAt.toMillis?l.expiresAt.toMillis():0;
   if(l.sessionId!==sessionId&&until>Date.now()){
    // This browser's own earlier session (a finished run, a reload): take it over on
    // purpose. Two tabs of one browser are already kept apart by the Stage 1 tab lock.
    if(l.deviceId===deviceId&&l.holderUid===uid)takeOver=true;
    else throw new CopyError('lease-busy','Studio is being edited on another computer ('+(l.deviceName||'unknown')+') until '+new Date(until).toISOString()+'. Nothing was copied.',{holder:l.deviceName,until});
   }}
  await writeLease(LEASE_MS,takeOver);
 }
 async function writeLease(ms,takeOver){
  await fb.setDoc(leaseRef(),{holderUid:uid,sessionId,deviceId,deviceName,heartbeatAt:fb.serverTimestamp(),expiresAt:fb.Timestamp.fromMillis(Date.now()+ms),...(takeOver?{takenOverAt:fb.serverTimestamp()}:{})});
  lastRenew=Date.now();
 }
 async function keepLease(){if(Date.now()-lastRenew>RENEW_MS)await writeLease(LEASE_MS)}
 async function releaseLease(){try{await writeLease(10*1000)}catch(e){}}// cannot be deleted; expires by itself

 // ---- Source snapshot (made once, before any network work) ----
 async function readSource(input){
  const state=input&&input.state?input.state:input;
  const drawingList=input&&input.state?(input.drawings||[]):[];
  const settingsIn=input&&input.state?(input.settings||{}):{};
  if(!state||!Array.isArray(state.customers)||!Array.isArray(state.projects))throw new CopyError('source','The browser data has no customer or job list.');
  const problems=[];const seenC=new Set(),seenJ=new Set();
  state.customers.forEach(c=>{if(!c||!validId(c.id))problems.push('Customer id cannot be stored in the cloud: '+JSON.stringify(c&&c.id));else if(seenC.has(c.id))problems.push('Customer id appears twice: '+c.id);else seenC.add(c.id)});
  state.projects.forEach(p=>{if(!p||!validId(p.id))problems.push('Job id cannot be stored in the cloud: '+JSON.stringify(p&&p.id));else if(seenJ.has(p.id))problems.push('Job id appears twice: '+p.id);else seenJ.add(p.id)});
  const bin=Array.isArray(state.deletedProjects)?state.deletedProjects.filter(x=>x&&x.project&&x.project.id):[];
  const deletedIds=[...new Set([...(state.deletedProjectIds||[]),...bin.map(x=>x.project.id)])].sort();
  deletedIds.forEach(id=>{if(!validId(id))problems.push('Deleted job id cannot be stored in the cloud: '+JSON.stringify(id));else if(seenJ.has(id))problems.push('Job is both live and deleted in the browser: '+id)});
  const life=(Array.isArray(state.jobLifecycle)?state.jobLifecycle:[]).filter(e=>e&&e.jobId&&(e.event==='deleted'||e.event==='restored')).map(e=>({jobId:e.jobId,event:e.event,localAt:Number(e.at)||0,...(e.deletedAt?{deletedAt:Number(e.deletedAt)}:{})}));
  const settings={};
  for(const [k,v] of Object.entries(settingsIn)){if(typeof v!=='string'){problems.push('Setting is not text: '+k);continue}settings['ls:'+k]=v}
  STATE_SETTINGS.forEach(k=>{if(state[k]!==undefined)settings['state:'+k]=JSON.stringify(state[k])});
  if(problems.length)throw new CopyError('source','The browser data cannot be copied as it is. Nothing was copied.',problems);
  // Drawings by unit key; decoded and fingerprinted once.
  const drawings=new Map();
  for(const d of drawingList){
   if(!d||typeof d.key!=='string'||!d.drawing)continue;
   const dec=dataUrlToBytes(d.drawing);
   if(!dec){problems.push('Drawing cannot be read: '+d.key);continue}
   const contentType=d.drawingType==='pdf'?'application/pdf':dec.contentType;
   drawings.set(d.key,{key:d.key,bytes:dec.bytes,contentType,drawingType:d.drawingType||'image',drawingName:d.drawingName||'',sha256:await sha256Bytes(dec.bytes),size:dec.bytes.length});
  }
  if(problems.length)throw new CopyError('source','The browser data cannot be copied as it is. Nothing was copied.',problems);
  const used=new Set();
  const unitDrawings=job=>{const out={};(job&&job.cabinets||[]).forEach(c=>{const k=String(job.id)+':'+String(c.id);if(drawings.has(k)){used.add(k);out[c.id]=drawings.get(k)}});return out};
  const jobs=state.projects.map(p=>({id:p.id,text:JSON.stringify(p),drawings:unitDrawings(p),links:findLinks(p),lifecycle:life.filter(e=>e.jobId===p.id)}));
  const deleted=deletedIds.map(id=>{const e=bin.find(x=>x.project.id===id);
   return {id,text:e?JSON.stringify(e.project):'null',deletedAt:e?Number(e.deletedAt)||null:null,drawings:e?unitDrawings(e.project):{},links:e?findLinks(e.project):[],lifecycle:life.filter(x=>x.jobId===id)}});
  const orphans=[...drawings.values()].filter(d=>!used.has(d.key));
  return {customers:state.customers.map(c=>JSON.parse(JSON.stringify(c))),jobs,deleted,orphans,settings,drawings};
 }
 // Fingerprint of the whole browser master being copied. The verified marker stores it.
 async function sourceSha(src){
  const by=a=>a.slice().sort((x,y)=>x[0]<y[0]?-1:x[0]>y[0]?1:0);
  return sha256Hex(JSON.stringify({
   customers:by(src.customers.map(x=>[x.id,JSON.stringify(sortKeys(x))])),
   jobs:by(src.jobs.map(j=>[j.id,j.text,Object.entries(j.drawings).map(([u,d])=>u+'='+d.sha256).sort(),j.lifecycle])),
   deleted:by(src.deleted.map(j=>[j.id,j.text,j.deletedAt,Object.entries(j.drawings).map(([u,d])=>u+'='+d.sha256).sort(),j.lifecycle])),
   orphans:src.orphans.map(d=>d.key+'='+d.sha256).sort(),
   settings:sortKeys(src.settings)}));
 }

 // ---- Media ----
 const ownedMedia=new Map();// sha -> true once uploaded or checked this run
 async function putMedia(sha,bytes,contentType,report){
  if(ownedMedia.has(sha))return;
  if(!(/^image\//.test(contentType)||contentType==='application/pdf'))throw new CopyError('media-type','A drawing or photo has a type the cloud master does not accept: '+contentType);
  await keepLease();
  const r=st.ref(storage,mediaPath(sha));
  try{await st.uploadBytes(r,bytes,{contentType,customMetadata:{sessionId}});report.media.uploaded++}
  catch(e){
   let existing=null;try{existing=await st.getBytes(r)}catch(e2){}
   if(existing&&await sha256Bytes(existing)===sha){report.media.reused++}
   else throw e;
  }
  ownedMedia.set(sha,true);
 }
 const linkCache=new Map();// link -> {sha256, contentType, size} or {notOwned: reason}
 async function ownLink(url,report){
  if(linkCache.has(url))return linkCache.get(url);
  let res;
  if(PRODUCTION_LINK.test(url))res={notOwned:'Production photo; not copied in this phase'};
  else if(!fetchLink||!isAllowedLink(url))res={notOwned:'link host not allowed for copying'};
  else{
   const got=await fetchLink(url);
   const bytes=got.bytes instanceof Uint8Array?got.bytes:new Uint8Array(got.bytes);
   const sha=await sha256Bytes(bytes);
   await putMedia(sha,bytes,(got.contentType||'').toLowerCase(),report);
   res={sha256:sha,contentType:(got.contentType||'').toLowerCase(),size:bytes.length};
  }
  linkCache.set(url,res);return res;
 }

 // ---- Packages ----
 async function previousPackage(rec){
  if(!rec)return null;
  try{const text=new TextDecoder().decode(await st.getBytes(st.ref(storage,rec.file)));const p=JSON.parse(text);return p&&p.fiqPackage===2?p:{fiqPackage:1,job:p,lifecycle:[]}}
  catch(e){throw new CopyError('read-back','Cannot read the current cloud version of job '+rec.file+': '+(e.code||e.message))}
 }
 function mergeLifecycle(prev,local,binDeletedAt){
  const all=[...((prev&&prev.lifecycle)||[]),...local.map(e=>({event:e.event,localAt:e.localAt,...(e.deletedAt?{deletedAt:e.deletedAt}:{})}))];
  if(binDeletedAt&&!all.some(e=>e.event==='deleted'&&Math.abs(e.localAt-binDeletedAt)<5000))all.push({event:'deleted',localAt:binDeletedAt});
  const seen=new Set();return all.filter(e=>{const k=e.event+'@'+e.localAt;if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>a.localAt-b.localAt||(a.event<b.event?-1:1));
 }
 async function buildPackage(j,prev,report,recycle){
  const drawings={};
  for(const [unitId,d] of Object.entries(j.drawings).sort()){await putMedia(d.sha256,d.bytes,d.contentType,report);drawings[unitId]={sha256:d.sha256,contentType:d.contentType,drawingType:d.drawingType,drawingName:d.drawingName,bytes:d.size}}
  const links={},notOwned=[];
  for(const url of j.links){const r=await ownLink(url,report);if(r.notOwned)notOwned.push(url);else links[url]=r}
  const lifecycle=mergeLifecycle(prev,j.lifecycle,recycle?j.deletedAt:null);
  const text='{"fiqPackage":2,"job":'+j.text+',"drawings":'+JSON.stringify(sortKeys(drawings))+',"links":'+JSON.stringify(sortKeys(links))+',"lifecycle":'+JSON.stringify(lifecycle)+',"recycleBin":'+JSON.stringify(recycle?{deletedAt:j.deletedAt}:null)+'}';
  return {text,sha:await sha256Hex(text),notOwned,lifecycle};
 }
 async function uploadJobFile(path,text,sha){
  const r=st.ref(storage,path);
  try{await st.uploadString(r,text,'raw',{contentType:'application/json',customMetadata:{sessionId}});return 'uploaded'}
  catch(e){
   // A file with this exact name can only hold this exact content (the name carries its
   // fingerprint), e.g. left by an interrupted earlier run: reuse it after checking.
   let existing=null;try{existing=await st.getBytes(r)}catch(e2){}
   if(existing&&await sha256Hex(new TextDecoder().decode(existing))===sha)return 'reused';
   throw e;
  }
 }
 async function writeVersion(id,expectedRev,pkg,extra,report){
  const rev=expectedRev+1,path=filePath(id,rev,pkg.sha);
  await keepLease();
  if(await uploadJobFile(path,pkg.text,pkg.sha)==='reused')report.filesReused++;
  await hook('afterFile',{jobId:id,rev,path});
  await keepLease();
  const job=JSON.parse(pkg.text).job;
  await fb.runTransaction(db,async tx=>{
   const now=await tx.get(jobRef(id));const nowRev=now.exists()?now.data().rev:0;
   if(nowRev!==expectedRev)throw new CopyError('stale','Job '+id+' was changed in the cloud by someone else during the copy (version '+nowRev+', expected '+expectedRev+').');
   tx.set(jobRef(id),{rev,file:path,sha256:pkg.sha,bytes:utf8Bytes(pkg.text),name:String(job&&job.name||''),customerId:job&&job.customerId||null,schema:SCHEMA,deleted:!!extra.deleted,...(extra.deletedAt?{deletedAt:extra.deletedAt}:{}),...(extra.restoredAt?{restoredAt:extra.restoredAt}:{}),sessionId,deviceId,updatedAt:fb.serverTimestamp(),updatedBy:uid});
  });
  return rev;
 }

 // ---- Copy steps ----
 async function copyCustomer(c,report){
  const ref=custRef(c.id);
  const snap=await fb.getDoc(ref);const cur=snap.exists()?snap.data():null;
  if(cur&&cur.deleted===true){report.conflicts.push({type:'customer',id:c.id,reason:'deleted in the cloud; not brought back automatically'});return}
  if(cur&&sameValue(cur.data,c)){report.customers.unchanged++;return}
  if(cur&&cur.deviceId!==deviceId){report.conflicts.push({type:'customer',id:c.id,reason:'changed in the cloud by another computer ('+cur.deviceId+', version '+cur.rev+'); not overwritten'});return}
  const rev=cur?cur.rev+1:1;
  await keepLease();
  await fb.runTransaction(db,async tx=>{
   const now=await tx.get(ref);const nowRev=now.exists()?now.data().rev:0;
   if(nowRev!==rev-1)throw new CopyError('stale','Customer '+c.id+' was changed in the cloud by someone else during the copy (version '+nowRev+', expected '+(rev-1)+').');
   tx.set(ref,{rev,data:c,schema:SCHEMA,deleted:false,sessionId,deviceId,updatedAt:fb.serverTimestamp(),updatedBy:uid});
  });
  report.customers[cur?'updated':'created']++;
 }
 async function copyLiveJob(j,report){
  const snap=await fb.getDoc(jobRef(j.id));const cur=snap.exists()?snap.data():null;
  if(cur&&cur.deviceId!==deviceId){report.conflicts.push({type:'job',id:j.id,reason:'changed in the cloud by another computer ('+cur.deviceId+', version '+cur.rev+'); not overwritten'});return}
  // Deliberate restore only: the browser recorded a restore after its latest delete.
  const last=j.lifecycle.slice().sort((a,b)=>a.localAt-b.localAt).pop();
  if(cur&&cur.deleted===true&&(!last||last.event!=='restored')){report.conflicts.push({type:'job',id:j.id,reason:'deleted in the cloud and no restore recorded in this browser; not brought back automatically'});return}
  if(await hook('skipJob',j.id)===true)return;// test hook: a buggy copy that silently skips
  const prev=await previousPackage(cur);
  if(cur&&cur.deleted===true){
   const pkg=await buildPackage(j,prev,report,false);if(pkg.notOwned.length)report.mediaNotOwned.push({id:j.id,links:pkg.notOwned});
   await writeVersion(j.id,cur.rev,pkg,{deleted:false,deletedAt:cur.deletedAt,restoredAt:fb.serverTimestamp()},report);
   report.jobs.restored++;return;
  }
  const pkg=await buildPackage(j,prev,report,false);
  if(pkg.notOwned.length)report.mediaNotOwned.push({id:j.id,links:pkg.notOwned});
  if(cur&&cur.sha256===pkg.sha){report.jobs.unchanged++;return}
  await writeVersion(j.id,cur?cur.rev:0,pkg,{deleted:false},report);
  report.jobs[cur?'updated':'created']++;
 }
 async function copyDeletedJob(j,report){
  const snap=await fb.getDoc(jobRef(j.id));const cur=snap.exists()?snap.data():null;
  if(cur&&cur.deleted===true){report.tombstones.unchanged++;return}// a tombstone is final; never written again
  if(cur&&cur.deviceId!==deviceId){report.conflicts.push({type:'job',id:j.id,reason:'deleted in this browser but changed in the cloud by another computer ('+cur.deviceId+', version '+cur.rev+'); not overwritten'});return}
  const prev=await previousPackage(cur);
  const pkg=await buildPackage(j,prev,report,true);
  if(pkg.notOwned.length)report.mediaNotOwned.push({id:j.id,links:pkg.notOwned});
  let rev=cur?cur.rev:0;
  if(!cur)rev=await writeVersion(j.id,0,pkg,{deleted:false},report);// a record is born live, then deleted
  await writeVersion(j.id,rev,pkg,{deleted:true,deletedAt:fb.serverTimestamp()},report);
  report.tombstones.created++;
 }
 async function copySettings(src,report){
  const snap=await fb.getDoc(settingsRef());const cur=snap.exists()?snap.data():null;
  // Orphan drawings: append-only recovery list (an entry is never removed).
  let list=[];try{list=cur&&cur.values&&cur.values['recovery.orphanDrawings']?JSON.parse(cur.values['recovery.orphanDrawings']):[]}catch(e){list=[]}
  for(const d of src.orphans){
   await putMedia(d.sha256,d.bytes,d.contentType,report);
   if(!list.some(x=>x.key===d.key&&x.sha256===d.sha256))list.push({key:d.key,sha256:d.sha256,contentType:d.contentType,drawingType:d.drawingType,drawingName:d.drawingName,bytes:d.size,firstSeen:new Date().toISOString()});
  }
  const values={...src.settings};
  if(list.length)values['recovery.orphanDrawings']=JSON.stringify(list);
  report.orphanDrawings=src.orphans.map(d=>d.key);
  if(utf8Bytes(JSON.stringify(values))>SETTINGS_LIMIT)throw new CopyError('settings-too-large','The settings are too large for one cloud record. Nothing more was copied.');
  if(cur&&sameValue(cur.values,values)){report.settings='unchanged';return values}
  if(cur&&cur.deviceId!==deviceId){report.conflicts.push({type:'settings',id:'studio',reason:'changed in the cloud by another computer ('+cur.deviceId+'); not overwritten'});return values}
  const rev=cur?cur.rev+1:1;
  await keepLease();
  await hook('beforeSettings');
  await fb.runTransaction(db,async tx=>{
   const now=await tx.get(settingsRef());const nowRev=now.exists()?now.data().rev:0;
   if(nowRev!==rev-1)throw new CopyError('stale','Settings were changed in the cloud by someone else during the copy.');
   tx.set(settingsRef(),{rev,values,schema:SCHEMA,sessionId,deviceId,updatedAt:fb.serverTimestamp(),updatedBy:uid});
  });
  report.settings=cur?'updated':'created';
  return values;
 }

 // ---- Read-back of everything ----
 async function verifySnapshot(src){
  const problems=[],manifest=[];
  const mediaOk=new Map();
  const checkMedia=async(sha,label)=>{
   if(!mediaOk.has(sha)){let ok=false;try{ok=await sha256Bytes(await st.getBytes(st.ref(storage,mediaPath(sha))))===sha}catch(e){ok=false}mediaOk.set(sha,ok)}
   if(!mediaOk.get(sha))problems.push('Media file missing or changed: '+label);
  };
  for(const c of src.customers){
   const snap=await fb.getDoc(custRef(c.id));
   if(!snap.exists()){problems.push('Customer missing in the cloud: '+c.id);continue}
   const d=snap.data();
   if(d.deleted===true){problems.push('Customer is deleted in the cloud: '+c.id);continue}
   if(!sameValue(d.data,c)){problems.push('Customer differs in the cloud: '+c.id);continue}
   manifest.push(['customer',c.id,d.rev]);
  }
  const readPackage=async(j,label)=>{
   const snap=await fb.getDoc(jobRef(j.id));
   if(!snap.exists()){problems.push(label+' missing in the cloud: '+j.id);return null}
   const d=snap.data();
   if(d.file!==filePath(j.id,d.rev,d.sha256)){problems.push(label+' record names the wrong file: '+j.id);return null}
   let text;try{text=new TextDecoder().decode(await st.getBytes(st.ref(storage,d.file)))}catch(e){problems.push(label+' file cannot be read: '+j.id+' ('+(e.code||e.message)+')');return null}
   if(await sha256Hex(text)!==d.sha256){problems.push('Job file fingerprint does not match its record: '+j.id);return null}
   let pkg;try{pkg=JSON.parse(text)}catch(e){problems.push(label+' file is not valid: '+j.id);return null}
   if(!pkg||pkg.fiqPackage!==2){problems.push('Job in the cloud is a different version than the browser: '+j.id);return null}
   if(JSON.stringify(pkg.job)!==j.text){problems.push('Job in the cloud is a different version than the browser: '+j.id);return null}
   for(const [unitId,dr] of Object.entries(j.drawings)){const m=pkg.drawings&&pkg.drawings[unitId];if(!m||m.sha256!==dr.sha256){problems.push('Drawing missing or different in the cloud: '+j.id+' / '+unitId);continue}await checkMedia(dr.sha256,'drawing '+j.id+' / '+unitId)}
   for(const url of j.links){const m=pkg.links&&pkg.links[url];if(!m){problems.push('Photo not owned by the cloud master yet: '+j.id+' ('+(PRODUCTION_LINK.test(url)?'Production photo':'link')+')');continue}await checkMedia(m.sha256,'photo in '+j.id)}
   for(const e of j.lifecycle)if(!(pkg.lifecycle||[]).some(x=>x.event===e.event&&x.localAt===e.localAt))problems.push('Delete / restore history missing in the cloud: '+j.id);
   return {d,pkg};
  };
  for(const j of src.jobs){
   const r=await readPackage(j,'Job');if(!r)continue;
   if(r.d.deleted===true){problems.push('Job is deleted in the cloud: '+j.id);continue}
   if(identities(r.pkg.job).join('\n')!==identities(JSON.parse(j.text)).join('\n')){problems.push('Job ids or QR identities differ: '+j.id);continue}
   manifest.push(['job',j.id,r.d.rev,r.d.sha256]);
  }
  for(const j of src.deleted){
   const snap=await fb.getDoc(jobRef(j.id));
   if(!snap.exists()){problems.push('Deleted job has no tombstone in the cloud: '+j.id);continue}
   const d=snap.data();
   if(d.deleted!==true){problems.push('Deleted job is not a tombstone in the cloud: '+j.id);continue}
   let pkg=null;try{pkg=JSON.parse(new TextDecoder().decode(await st.getBytes(st.ref(storage,d.file))))}catch(e){}
   if(!pkg||pkg.fiqPackage!==2){problems.push('Tombstone package missing: '+j.id);continue}
   // A tombstone is final: a later recycle-bin purge in the browser does not change it.
   if(j.text!=='null'&&JSON.stringify(pkg.job)!==j.text)problems.push('Recycle-bin copy differs in the cloud: '+j.id);
   if(j.deletedAt&&!(pkg.recycleBin&&pkg.recycleBin.deletedAt===j.deletedAt))problems.push('Original delete time missing in the cloud: '+j.id);
   for(const [unitId,dr] of Object.entries(j.drawings)){const m=pkg.drawings&&pkg.drawings[unitId];if(!m||m.sha256!==dr.sha256)problems.push('Drawing of deleted job missing in the cloud: '+j.id+' / '+unitId);else await checkMedia(dr.sha256,'drawing of deleted '+j.id)}
   manifest.push(['tombstone',j.id,d.rev]);
  }
  const sSnap=await fb.getDoc(settingsRef());const sv=sSnap.exists()?sSnap.data().values||{}:null;
  if(!sv)problems.push('Settings missing in the cloud');
  else{
   for(const [k,v] of Object.entries(src.settings))if(sv[k]!==v)problems.push('Setting missing or different in the cloud: '+k);
   for(const k of Object.keys(sv))if(!(k in src.settings)&&k!=='recovery.orphanDrawings')problems.push('Setting in the cloud that the browser does not have: '+k);
   let list=[];try{list=JSON.parse(sv['recovery.orphanDrawings']||'[]')}catch(e){problems.push('Recovery list unreadable')}
   for(const d of src.orphans){if(!list.some(x=>x.key===d.key&&x.sha256===d.sha256))problems.push('Orphan drawing missing from the recovery list: '+d.key);await checkMedia(d.sha256,'orphan drawing '+d.key)}
  }
  const extra=[];
  if(fb.getDocs&&fb.collection){
   const want={customers:new Set(src.customers.map(c=>c.id)),jobs:new Set([...src.jobs.map(j=>j.id),...src.deleted.map(j=>j.id)])};
   for(const col of ['customers','jobs']){const qs=await fb.getDocs(fb.collection(db,base+'/'+col));qs.forEach(d=>{if(!want[col].has(d.id))extra.push(col.slice(0,-1)+' '+d.id+(d.data().deleted?' (deleted)':''))})}
  }
  return {ok:problems.length===0,problems,extraInCloud:extra,checked:{customers:src.customers.length,jobs:src.jobs.length,deletedJobs:src.deleted.length,drawings:src.drawings.size,orphanDrawings:src.orphans.length,settings:Object.keys(src.settings).length},manifest};
 }

 async function writeVerifiedMarker(migrationId,sourceSha256){
  const ref=switchRef();
  await fb.runTransaction(db,async tx=>{
   const now=await tx.get(ref);const cur=now.exists()?now.data():null;
   tx.set(ref,{rev:cur?cur.rev+1:1,mode:'local',migrationId,verifiedSha256:sourceSha256,switchedAt:cur&&cur.switchedAt?cur.switchedAt:fb.serverTimestamp(),switchedBy:cur&&cur.switchedBy?cur.switchedBy:uid,sessionId,updatedAt:fb.serverTimestamp(),updatedBy:uid});
  });
 }

 // Copy, then verify; the marker only after a complete, exact match with no conflicts and
 // every photo owned. A failed or incomplete run never touches an earlier marker, and every
 // run returns its own attempt record (outcome verified | failed | incomplete | conflicts).
 async function copyAndVerify(input,migrationId){
  const report={ok:false,migrationId,customers:{created:0,updated:0,unchanged:0},jobs:{created:0,updated:0,unchanged:0,restored:0},tombstones:{created:0,unchanged:0},media:{uploaded:0,reused:0},settings:null,orphanDrawings:[],mediaNotOwned:[],filesReused:0,conflicts:[],verify:null,markerWritten:false,error:null,
   attempt:{id:migrationId,startedAt:new Date().toISOString(),finishedAt:null,sourceSha256:null,outcome:null}};
  const finish=()=>{const a=report.attempt;a.finishedAt=new Date().toISOString();
   a.outcome=report.ok?'verified':report.error?'failed':report.conflicts.length?'conflicts':'incomplete';return report};
  let src;
  try{src=await readSource(input);report.attempt.sourceSha256=await sourceSha(src)}catch(e){report.error={code:e.code||'error',message:e.message,detail:e.detail};return finish()}
  let leased=false;
  try{
   await takeLease();leased=true;
   for(const c of src.customers){await keepLease();await copyCustomer(c,report)}
   for(const j of src.jobs)await copyLiveJob(j,report);
   for(const j of src.deleted)await copyDeletedJob(j,report);
   await copySettings(src,report);
   await hook('beforeVerify');
   report.verify=await verifySnapshot(src);
   if(report.verify.ok&&!report.conflicts.length&&!report.mediaNotOwned.length){await keepLease();await writeVerifiedMarker(migrationId,report.attempt.sourceSha256);report.markerWritten=true;report.ok=true}
  }catch(e){report.error={code:e.code||'error',message:e.message,detail:e.detail}}
  finally{if(leased)await releaseLease()}
  return finish();
 }
 async function verifyOnly(input){return verifySnapshot(await readSource(input))}
 // Is THIS browser state the one the cloud marker verified? Read-only.
 async function checkVerified(input){
  const current=await sourceSha(await readSource(input));
  const snap=await fb.getDoc(switchRef());const m=snap.exists()?snap.data():null;
  return {verified:!!m&&m.verifiedSha256===current,currentSha256:current,marker:m?{migrationId:m.migrationId,verifiedSha256:m.verifiedSha256,rev:m.rev,mode:m.mode}:null};
 }
 return {copyAndVerify,verifyOnly,checkVerified,filePath,mediaPath};
}
return {createCloudCopy,identities,sha256Hex,sha256Bytes,findLinks,dataUrlToBytes,CopyError,SCHEMA};
});
