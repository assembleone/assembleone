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
// MD5 of bytes as base64, the form Cloud Storage reports as md5Hash (computed by the server
// on the stored bytes). Web Crypto has no MD5, so it is computed here (RFC 1321).
const MD5_S=[7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
const MD5_K=Array.from({length:64},(_,i)=>Math.floor(Math.abs(Math.sin(i+1))*4294967296)|0);
function md5Base64(input){
 const bytes=typeof input==='string'?new TextEncoder().encode(input):input;
 const n=bytes.length,total=Math.ceil((n+9)/64)*64,buf=new Uint8Array(total);buf.set(bytes);buf[n]=0x80;
 const dv=new DataView(buf.buffer);dv.setUint32(total-8,(n*8)>>>0,true);dv.setUint32(total-4,Math.floor(n/536870912),true);
 let a0=0x67452301,b0=0xefcdab89|0,c0=0x98badcfe|0,d0=0x10325476;const M=new Int32Array(16);
 for(let off=0;off<total;off+=64){
  for(let i=0;i<16;i++)M[i]=dv.getInt32(off+i*4,true);
  let A=a0,B=b0,C=c0,D=d0;
  for(let i=0;i<64;i++){let F,g;
   if(i<16){F=(B&C)|(~B&D);g=i}else if(i<32){F=(D&B)|(~D&C);g=(5*i+1)&15}else if(i<48){F=B^C^D;g=(3*i+5)&15}else{F=C^(B|~D);g=(7*i)&15}
   F=(F+A+MD5_K[i]+M[g])|0;A=D;D=C;C=B;B=(B+((F<<MD5_S[i])|(F>>>(32-MD5_S[i]))))|0}
  a0=(a0+A)|0;b0=(b0+B)|0;c0=(c0+C)|0;d0=(d0+D)|0}
 const out=new Uint8Array(16),ov=new DataView(out.buffer);ov.setInt32(0,a0,true);ov.setInt32(4,b0,true);ov.setInt32(8,c0,true);ov.setInt32(12,d0,true);
 let s='';for(const b of out)s+=String.fromCharCode(b);return btoa(s);
}
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
 // A photo of another Firebase project is never fetched. Default (staging pages and tests): Production
 // photos. A page connected to Production passes its own rule (any project but its own).
 const foreignLink=o.foreignLink||(url=>PRODUCTION_LINK.test(url)),foreignWord=o.foreignWord||'Production photo';
 // statLink(url) -> {md5Hash,size,generation,contentType} | null when the file is gone. Metadata only.
 const statLink=o.statLink||null;
 // Live progress for the status line while a backup runs (16 Oct 2026): {stage:'jobs'|'checking', done, total, media}.
 const onProgress=typeof o.onProgress==='function'?o.onProgress:null;
 const progress=p=>{if(onProgress)try{onProgress(p)}catch(e){}};
 // Handover after a restore: {fromDevice, primaryRev, jobs:{id:rev}, customers:{id:rev}, settings:rev}
 // from the restore report. A record last written by another computer may be continued only
 // when this computer restored exactly that version (same rev), never a newer one.
 const adopt=o.adopt||null;
 const foreign=(kind,id,cur)=>!!cur&&cur.deviceId!==deviceId&&!(adopt&&adopt[kind]&&adopt[kind][id]===cur.rev);
 // 'incremental' (default): unchanged files are proven by the server's checksum and generation
 // against a proof written after a byte check; nothing unchanged is downloaded. 'full': the
 // original behaviour, every file downloaded and hashed on every run.
 const mode=o.mode==='full'?'full':'incremental';
 const hook=async(name,arg)=>{if(o.hooks&&typeof o.hooks[name]==='function')return o.hooks[name](arg)};
 if(!validId(companyId)||!(env==='beta'||env==='production')||!uid||!sessionId||!deviceId)throw new CopyError('config','Cloud copy is not configured (company, env, user, session, device).');
 const base='companies/'+companyId+'/fiqMaster/'+env;
 const leaseRef=()=>fb.doc(db,base+'/lease/studio');
 const custRef=id=>fb.doc(db,base+'/customers/'+id);
 const jobRef=id=>fb.doc(db,base+'/jobs/'+id);
 const settingsRef=()=>fb.doc(db,base+'/settings/studio');
 const switchRef=()=>fb.doc(db,base);
 const proofRef=key=>fb.doc(db,base+'/proofs/'+key);
 const primaryRef=()=>fb.doc(db,base+'/primary/studio');
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
  if(foreignLink(url))res={notOwned:foreignWord+'; not copied'};
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
  if(foreign('customers',c.id,cur)){report.conflicts.push({type:'customer',id:c.id,reason:'changed in the cloud by another computer ('+cur.deviceId+', version '+cur.rev+'); not overwritten'});return}
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
  if(foreign('jobs',j.id,cur)){report.conflicts.push({type:'job',id:j.id,reason:'changed in the cloud by another computer ('+cur.deviceId+', version '+cur.rev+'); not overwritten'});return}
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
  if(foreign('jobs',j.id,cur)){report.conflicts.push({type:'job',id:j.id,reason:'deleted in this browser but changed in the cloud by another computer ('+cur.deviceId+', version '+cur.rev+'); not overwritten'});return}
  const prev=await previousPackage(cur);
  const pkg=await buildPackage(j,prev,report,true);
  if(pkg.notOwned.length)report.mediaNotOwned.push({id:j.id,links:pkg.notOwned});
  let rev=cur?cur.rev:0;
  if(!cur)rev=await writeVersion(j.id,0,pkg,{deleted:false},report);// a record is born live, then deleted
  await writeVersion(j.id,rev,pkg,{deleted:true,deletedAt:fb.serverTimestamp()},report);
  report.tombstones.created++;
 }
 async function copySettings(src,report,mediaFn){
  const snap=await fb.getDoc(settingsRef());const cur=snap.exists()?snap.data():null;
  // Orphan drawings: append-only recovery list (an entry is never removed).
  let list=[];try{list=cur&&cur.values&&cur.values['recovery.orphanDrawings']?JSON.parse(cur.values['recovery.orphanDrawings']):[]}catch(e){list=[]}
  for(const d of src.orphans){
   if(mediaFn)await mediaFn(d);else await putMedia(d.sha256,d.bytes,d.contentType,report);
   if(!list.some(x=>x.key===d.key&&x.sha256===d.sha256))list.push({key:d.key,sha256:d.sha256,contentType:d.contentType,drawingType:d.drawingType,drawingName:d.drawingName,bytes:d.size,firstSeen:new Date().toISOString()});
  }
  const values={...src.settings};
  if(list.length)values['recovery.orphanDrawings']=JSON.stringify(list);
  report.orphanDrawings=src.orphans.map(d=>d.key);
  if(utf8Bytes(JSON.stringify(values))>SETTINGS_LIMIT)throw new CopyError('settings-too-large','The settings are too large for one cloud record. Nothing more was copied.');
  if(cur&&sameValue(cur.values,values)){report.settings='unchanged';return values}
  if(foreign('settings','studio',cur)&&!(adopt&&adopt.settings===cur.rev)){report.conflicts.push({type:'settings',id:'studio',reason:'changed in the cloud by another computer ('+cur.deviceId+'); not overwritten'});return values}
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
   for(const url of j.links){const m=pkg.links&&pkg.links[url];if(!m){problems.push('Photo not owned by the cloud master yet: '+j.id+' ('+(foreignLink(url)?foreignWord:'link')+')');continue}await checkMedia(m.sha256,'photo in '+j.id)}
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

 // ======================================================================================
 // Incremental copy (mode 'incremental')
 //
 // A file is accepted as correct only on one of these grounds, checked in THIS run:
 //  upload    we hashed the exact bytes here (sha256 = its name, MD5), uploaded them, and the
 //            server's own md5Hash and size of what it stored are the same.
 //  local     the file exists and we hold its bytes here (drawings, job text): the server's
 //            md5Hash and size equal our MD5 and size of those bytes.
 //  download  the file is downloaded and its sha256 equals its name (the old way).
 //  recorded  a proof record, written only after one of the above, names the file's md5Hash,
 //            size and generation, and the server reports exactly those now. A generation
 //            changes on every overwrite and the rules forbid overwriting or deleting master
 //            files, so a match means the very bytes that were checked.
 // A file name, a proof record or the Verified marker on its own is never accepted. The
 // check step asks the server about every file once per run, after all writes; a mismatch
 // is reported (and its proof dropped), a missing file is put back, and the marker is only
 // written when nothing is left open. 'full' mode and verifyOnly() keep the old byte check.
 // ======================================================================================
 const isNotFound=e=>/object-not-found|not-found|\b404\b/i.test(String(e&&e.code||'')+' '+String(e&&e.message||''));
 async function metaOf(path,run){
  run.counts.metadata++;
  try{const m=await st.getMetadata(st.ref(storage,path));return {md5:m.md5Hash,generation:String(m.generation),size:Number(m.size),contentType:m.contentType||''}}
  catch(e){if(isNotFound(e))return null;throw e}
 }
 const sameMeta=(m,p)=>!!(m&&p&&m.md5===p.md5&&m.generation===String(p.generation)&&m.size===Number(p.size));
 const pick=p=>({md5:p.md5,generation:String(p.generation),size:Number(p.size),contentType:p.contentType||''});
 const linkKey=async url=>(await sha256Hex(url)).slice(0,40);
 const DAMAGED=sha=>'Media file missing or changed (the stored content does not match its fingerprint): '+sha;
 async function uploadMedia(sha,bytes,contentType,run){
  if(!(/^image\//.test(contentType)||contentType==='application/pdf'))throw new CopyError('media-type','A drawing or photo has a type the cloud master does not accept: '+contentType);
  await keepLease();
  const md5=md5Base64(bytes);
  try{
   const up=await st.uploadBytes(st.ref(storage,mediaPath(sha)),bytes,{contentType,customMetadata:{sessionId}});
   const m=up&&up.metadata;run.report.media.uploaded++;
   if(!(m&&m.md5Hash===md5&&Number(m.size)===bytes.length))return {problem:'An uploaded drawing or photo does not match on the server: '+sha};
   run.report.proofs.upload++;return {md5,generation:String(m.generation),size:bytes.length,contentType};
  }catch(e){
   const m=await metaOf(mediaPath(sha),run);// already there (e.g. an interrupted run): compare
   if(m&&m.md5===md5&&m.size===bytes.length){run.report.media.reused++;run.report.proofs.local++;return {md5,generation:m.generation,size:m.size,contentType:m.contentType||contentType}}
   if(m)return {problem:DAMAGED(sha)};
   throw e;
  }
 }
 // Live check of one media file without a usable proof record. bytes may be null.
 async function proveMediaNow(sha,bytes,contentType,run){
  const m=await metaOf(mediaPath(sha),run);
  if(!m)return bytes?uploadMedia(sha,bytes,contentType,run):{needBytes:true};
  if(bytes){const md5=md5Base64(bytes);if(m.md5===md5&&m.size===bytes.length){run.report.proofs.local++;run.report.media.reused++;return {md5,generation:m.generation,size:m.size,contentType:m.contentType||contentType}}return {problem:DAMAGED(sha)}}
  let ok=false;try{const got=new Uint8Array(await st.getBytes(st.ref(storage,mediaPath(sha))));ok=await sha256Bytes(got)===sha&&md5Base64(got)===m.md5}catch(e){ok=false}
  if(!ok)return {problem:DAMAGED(sha)};
  run.report.proofs.download++;return {md5:m.md5,generation:m.generation,size:m.size,contentType:m.contentType||contentType};
 }
 // Register a media file for this run. A proof record is trusted for planning only; the check
 // step confirms it with the server. Without a record the file is checked right away.
 async function planMedia(sha,bytes,contentType,recorded,run,source){
  const have=run.media.get(sha);
  if(have){if(bytes&&!have.bytes)have.bytes=bytes;if(source&&!have.source)have.source=source;return have}
  const item={sha,bytes:bytes||null,contentType,source:source||null,expect:null,problem:null,checkedNow:false};
  if(recorded)item.expect=pick(recorded);
  else{const p=await proveMediaNow(sha,bytes,contentType,run);if(p.needBytes){item.needBytes=true}else if(p.problem)item.problem=p.problem;else{item.expect=pick(p);item.checkedNow=true}}
  run.media.set(sha,item);return item;
 }
 async function fetchOwned(url,run){
  const got=await fetchLink(url);run.counts.linkDownloads++;
  const bytes=got.bytes instanceof Uint8Array?got.bytes:new Uint8Array(got.bytes);
  const md5=md5Base64(bytes);
  if(got.md5Hash&&got.md5Hash!==md5)throw new CopyError('read-back','A photo changed while it was being copied. Try again.');
  return {bytes,sha:await sha256Bytes(bytes),md5,contentType:(got.contentType||'').toLowerCase(),generation:got.generation!=null?String(got.generation):null};
 }
 async function planLink(url,recLinks,recMedia,run){
  if(foreignLink(url))return {notOwned:foreignWord+'; not copied'};
  if(!fetchLink||!isAllowedLink(url))return {notOwned:'link host not allowed for copying'};
  const key=await linkKey(url);const rec=recLinks&&recLinks[key];
  if(rec&&statLink){
   run.counts.linkChecks++;const s=await statLink(url);
   const same=s&&s.md5Hash===rec.origMd5&&String(s.generation)===String(rec.origGeneration)&&Number(s.size)===Number(rec.size);
   if(same||!s){
    const item=await planMedia(rec.sha256,null,rec.contentType,recMedia&&recMedia[rec.sha256],run,{url});
    if(item.needBytes&&!s)return {key,problem:'A photo is missing at its original place and in the cloud copy: '+url.slice(0,90)};
    if(!item.needBytes)return {key,link:rec,item,originalMissing:!s};
   }
  }
  const f=await fetchOwned(url,run);
  if(rec&&rec.sha256!==f.sha)run.report.notes.push('A photo changed at its original place; the new content is copied: '+url.slice(0,90));
  const known=run.media.get(f.sha);if(known&&known.needBytes){run.media.delete(f.sha)}
  const item=await planMedia(f.sha,f.bytes,f.contentType,null,run,{url});
  if(item.needBytes){run.media.delete(f.sha);return {key,problem:'A photo could not be stored: '+url.slice(0,90)}}
  return {key,link:{sha256:f.sha,size:f.bytes.length,contentType:f.contentType,origMd5:f.md5,origGeneration:f.generation},item};
 }
 async function planJobMedia(j,proof,run){
  const recMedia=proof&&proof.media||{},recLinks=proof&&proof.links||{};
  const out={drawings:{},links:{},notOwned:[],problems:[],media:{},linkRecs:{},drawingShas:{}};
  for(const [unitId,d] of Object.entries(j.drawings).sort()){
   const item=await planMedia(d.sha256,d.bytes,d.contentType,recMedia[d.sha256],run,{drawing:j.id+' / '+unitId});
   if(item.problem){out.problems.push(item.problem);continue}
   out.media[d.sha256]=true;out.drawingShas[unitId]=d.sha256;
   out.drawings[unitId]={sha256:d.sha256,contentType:d.contentType,drawingType:d.drawingType,drawingName:d.drawingName,bytes:d.size};
  }
  for(const url of j.links){
   const r=await planLink(url,recLinks,recMedia,run);
   if(r.notOwned){out.notOwned.push(url);continue}
   if(r.problem){out.problems.push(r.problem);continue}
   if(r.item.problem){out.problems.push(r.item.problem);continue}
   if(r.originalMissing)run.report.notes.push('Original photo no longer at its first place; the cloud copy holds it ('+j.id+')');
   out.linkRecs[r.key]=r.link;out.media[r.link.sha256]=true;
   out.links[url]={sha256:r.link.sha256,contentType:r.link.contentType,size:r.link.size};
  }
  return out;
 }
 function packageText(j,drawings,links,lifecycle,recycle){
  return '{"fiqPackage":2,"job":'+j.text+',"drawings":'+JSON.stringify(sortKeys(drawings))+',"links":'+JSON.stringify(sortKeys(links))+',"lifecycle":'+JSON.stringify(lifecycle)+',"recycleBin":'+JSON.stringify(recycle?{deletedAt:j.deletedAt}:null)+'}';
 }
 // The current cloud version, downloaded and checked against its record (used only when no
 // proof record covers that version, e.g. the first run after the older copy module).
 async function previousChecked(rec,run){
  let text;try{text=new TextDecoder().decode(await st.getBytes(st.ref(storage,rec.file)));run.counts.packageDownloads++}
  catch(e){run.problems.push('The current cloud version of a job cannot be read: '+rec.file+' ('+(e.code||e.message)+')');return null}
  if(await sha256Hex(text)!==rec.sha256){run.problems.push('A job file in the cloud is damaged and its history cannot be read: '+rec.file);return null}
  let p;try{p=JSON.parse(text)}catch(e){run.problems.push('A job file in the cloud is not valid: '+rec.file);return null}
  return {pkg:p&&p.fiqPackage===2?p:{fiqPackage:1,job:p,lifecycle:[]},text};
 }
 async function writeVersionInc(id,expectedRev,text,sha,extra,run){
  const rev=expectedRev+1,path=filePath(id,rev,sha),md5=md5Base64(text),size=utf8Bytes(text);
  await keepLease();
  let meta=null;
  try{const up=await st.uploadString(st.ref(storage,path),text,'raw',{contentType:'application/json',customMetadata:{sessionId}});const m=up&&up.metadata;meta=m?{md5:m.md5Hash,generation:String(m.generation),size:Number(m.size)}:null}
  catch(e){meta=await metaOf(path,run);if(!meta)throw e;run.report.filesReused++}
  if(!(meta&&meta.md5===md5&&meta.size===size))throw new CopyError('read-back','The job file stored in the cloud does not match what was sent: '+id);
  await hook('afterFile',{jobId:id,rev,path});
  await keepLease();
  const job=JSON.parse(text).job;
  await fb.runTransaction(db,async tx=>{
   const now=await tx.get(jobRef(id));const nowRev=now.exists()?now.data().rev:0;
   if(nowRev!==expectedRev)throw new CopyError('stale','Job '+id+' was changed in the cloud by someone else during the copy (version '+nowRev+', expected '+expectedRev+').');
   tx.set(jobRef(id),{rev,file:path,sha256:sha,bytes:size,name:String(job&&job.name||''),customerId:job&&job.customerId||null,schema:SCHEMA,deleted:!!extra.deleted,...(extra.deletedAt?{deletedAt:extra.deletedAt}:{}),...(extra.restoredAt?{restoredAt:extra.restoredAt}:{}),sessionId,deviceId,updatedAt:fb.serverTimestamp(),updatedBy:uid});
  });
  run.report.proofs.upload++;
  return {rev,file:path,md5,generation:meta.generation,size};
 }
 async function saveProof(key,jobId,pkg,links,media,old,run){
  const mediaMap={};for(const sha of Object.keys(media).sort()){const it=run.media.get(sha);if(it&&it.expect)mediaMap[sha]=it.expect}
  const body={jobId:jobId||'',pkg:pkg||null,links:sortKeys(links||{}),media:sortKeys(mediaMap)};
  run.saved.set(key,body);
  if(old&&sameValue({jobId:old.jobId,pkg:old.pkg,links:old.links,media:old.media},body))return;
  await writeProof(key,body,run);
 }
 async function writeProof(key,body,run){
  await keepLease();
  await fb.setDoc(proofRef(key),{...body,schema:SCHEMA,sessionId,deviceId,updatedAt:fb.serverTimestamp(),updatedBy:uid});
  run.counts.proofWrites++;
 }
 async function copyCustomerInc(c,run){
  const report=run.report;const cur=run.customers.get(c.id)||null;
  if(cur&&cur.deleted===true){report.conflicts.push({type:'customer',id:c.id,reason:'deleted in the cloud; not brought back automatically'});return}
  if(cur&&sameValue(cur.data,c)){report.customers.unchanged++;return}
  if(foreign('customers',c.id,cur)){report.conflicts.push({type:'customer',id:c.id,reason:'changed in the cloud by another computer ('+cur.deviceId+', version '+cur.rev+'); not overwritten'});return}
  const rev=cur?cur.rev+1:1;
  await keepLease();
  await fb.runTransaction(db,async tx=>{
   const now=await tx.get(custRef(c.id));const nowRev=now.exists()?now.data().rev:0;
   if(nowRev!==rev-1)throw new CopyError('stale','Customer '+c.id+' was changed in the cloud by someone else during the copy (version '+nowRev+', expected '+(rev-1)+').');
   tx.set(custRef(c.id),{rev,data:c,schema:SCHEMA,deleted:false,sessionId,deviceId,updatedAt:fb.serverTimestamp(),updatedBy:uid});
  });
  report.customers[cur?'updated':'created']++;
 }
 function lifecycleFor(j,cur,proof,recycle){
  const pp=proof&&proof.pkg;
  if(cur&&pp&&pp.rev===cur.rev&&pp.sha256===cur.sha256)return {lifecycle:mergeLifecycle({lifecycle:pp.lifecycle||[]},j.lifecycle,recycle?j.deletedAt:null)};
  return null;
 }
 async function copyLiveJobInc(j,run){
  const report=run.report;const cur=run.jobs.get(j.id)||null;
  if(foreign('jobs',j.id,cur)){report.conflicts.push({type:'job',id:j.id,reason:'changed in the cloud by another computer ('+cur.deviceId+', version '+cur.rev+'); not overwritten'});return}
  const last=j.lifecycle.slice().sort((a,b)=>a.localAt-b.localAt).pop();
  if(cur&&cur.deleted===true&&(!last||last.event!=='restored')){report.conflicts.push({type:'job',id:j.id,reason:'deleted in the cloud and no restore recorded in this browser; not brought back automatically'});return}
  if(await hook('skipJob',j.id)===true)return;
  const proof=run.proofs.get('job-'+j.id)||null;
  const g=await planJobMedia(j,proof,run);
  if(g.notOwned.length){report.mediaNotOwned.push({id:j.id,links:g.notOwned});g.notOwned.forEach(url=>run.problems.push('Photo not owned by the cloud master yet: '+j.id+' ('+(foreignLink(url)?foreignWord:'link')+')'))}
  if(g.problems.length){g.problems.forEach(p=>run.problems.push(p+' ('+j.id+')'));return}
  let lc=cur?lifecycleFor(j,cur,proof,false):{lifecycle:mergeLifecycle(null,j.lifecycle,null)};
  if(!lc){const prev=await previousChecked(cur,run);if(!prev)return;lc={lifecycle:mergeLifecycle(prev.pkg,j.lifecycle,null)}}
  const text=packageText(j,g.drawings,g.links,lc.lifecycle,false),sha=await sha256Hex(text);
  let rec;
  if(cur&&cur.deleted===true){rec=await writeVersionInc(j.id,cur.rev,text,sha,{deleted:false,deletedAt:cur.deletedAt,restoredAt:fb.serverTimestamp()},run);report.jobs.restored++}
  else if(cur&&cur.sha256===sha){
   const pp=proof&&proof.pkg;
   if(pp&&pp.rev===cur.rev&&pp.sha256===sha&&!pp.damaged)rec={rev:cur.rev,file:cur.file,md5:pp.md5,generation:pp.generation,size:pp.size};// confirmed with the server in the check step
   else{// no proof for this version: check it now, repair if needed
    const m=await metaOf(cur.file,run),md5=md5Base64(text),size=utf8Bytes(text);
    if(m&&m.md5===md5&&m.size===size){run.report.proofs.local++;rec={rev:cur.rev,file:cur.file,md5,generation:m.generation,size}}
    else if(!m){await keepLease();const up=await st.uploadString(st.ref(storage,cur.file),text,'raw',{contentType:'application/json',customMetadata:{sessionId}});rec={rev:cur.rev,file:cur.file,md5,generation:String(up.metadata.generation),size};report.repaired.push('job file put back: '+j.id)}
    else{rec=await writeVersionInc(j.id,cur.rev,text,sha,{deleted:false},run);report.repaired.push('damaged job file replaced by version '+rec.rev+': '+j.id)}
   }
   if(rec.rev===cur.rev)report.jobs.unchanged++;
  }
  else{rec=await writeVersionInc(j.id,cur?cur.rev:0,text,sha,{deleted:false},run);report.jobs[cur?'updated':'created']++}
  run.expect.jobs.set(j.id,{rev:rec.rev,file:rec.file,sha256:sha,text});
  await saveProof('job-'+j.id,j.id,{rev:rec.rev,file:rec.file,sha256:sha,md5:rec.md5,generation:String(rec.generation),size:rec.size,lifecycle:lc.lifecycle,jobTextSha:await sha256Hex(j.text),deletedAt:null,drawings:g.drawingShas},g.linkRecs,g.media,proof,run);
 }
 async function copyDeletedJobInc(j,run){
  const report=run.report;const cur=run.jobs.get(j.id)||null;const proof=run.proofs.get('job-'+j.id)||null;
  if(cur&&cur.deleted===true){report.tombstones.unchanged++;await planTombstone(j,cur,proof,run);return}
  if(foreign('jobs',j.id,cur)){report.conflicts.push({type:'job',id:j.id,reason:'deleted in this browser but changed in the cloud by another computer ('+cur.deviceId+', version '+cur.rev+'); not overwritten'});return}
  const g=await planJobMedia(j,proof,run);
  if(g.notOwned.length)report.mediaNotOwned.push({id:j.id,links:g.notOwned});
  if(g.problems.length){g.problems.forEach(p=>run.problems.push(p+' ('+j.id+')'));return}
  let lc=cur?lifecycleFor(j,cur,proof,true):{lifecycle:mergeLifecycle(null,j.lifecycle,j.deletedAt)};
  if(!lc){const prev=await previousChecked(cur,run);if(!prev)return;lc={lifecycle:mergeLifecycle(prev.pkg,j.lifecycle,j.deletedAt)}}
  const text=packageText(j,g.drawings,g.links,lc.lifecycle,true),sha=await sha256Hex(text);
  let rev=cur?cur.rev:0;
  if(!cur)rev=(await writeVersionInc(j.id,0,text,sha,{deleted:false},run)).rev;
  const w=await writeVersionInc(j.id,rev,text,sha,{deleted:true,deletedAt:fb.serverTimestamp()},run);
  report.tombstones.created++;
  const pkg={rev:w.rev,file:w.file,sha256:sha,md5:w.md5,generation:String(w.generation),size:w.size,lifecycle:lc.lifecycle,jobTextSha:await sha256Hex(j.text),deletedAt:j.deletedAt||null,drawings:g.drawingShas};
  run.expect.tombstones.set(j.id,{pkg,text});
  await saveProof('job-'+j.id,j.id,pkg,g.linkRecs,g.media,proof,run);
 }
 // A tombstone is frozen. With a proof for its current version, the facts the browser can
 // compare (job text, delete time, drawings) come from that proof and the file is confirmed
 // with the server in the check step; otherwise the file is downloaded and compared once.
 async function planTombstone(j,cur,proof,run){
  const pp=proof&&proof.pkg;
  if(pp&&pp.rev===cur.rev&&pp.sha256===cur.sha256&&pp.jobTextSha){
   if(j.text!=='null'&&await sha256Hex(j.text)!==pp.jobTextSha){run.problems.push('Recycle-bin copy differs in the cloud: '+j.id);return}
   if(j.deletedAt&&pp.deletedAt!==j.deletedAt){run.problems.push('Original delete time missing in the cloud: '+j.id);return}
   for(const [unitId,d] of Object.entries(j.drawings)){if(!pp.drawings||pp.drawings[unitId]!==d.sha256){run.problems.push('Drawing of deleted job missing in the cloud: '+j.id+' / '+unitId);return}
    const item=await planMedia(d.sha256,d.bytes,d.contentType,proof.media&&proof.media[d.sha256],run,{drawing:j.id+' / '+unitId});if(item.problem){run.problems.push(item.problem);return}}
   run.expect.tombstones.set(j.id,{pkg:pp,text:null});return;
  }
  const prev=await previousChecked(cur,run);if(!prev)return;
  const pkg=prev.pkg;
  if(!pkg||pkg.fiqPackage!==2){run.problems.push('Tombstone package missing: '+j.id);return}
  if(j.text!=='null'&&JSON.stringify(pkg.job)!==j.text){run.problems.push('Recycle-bin copy differs in the cloud: '+j.id);return}
  if(j.deletedAt&&!(pkg.recycleBin&&pkg.recycleBin.deletedAt===j.deletedAt)){run.problems.push('Original delete time missing in the cloud: '+j.id);return}
  const drawingShas={},media={};
  for(const [unitId,d] of Object.entries(j.drawings)){const m=pkg.drawings&&pkg.drawings[unitId];if(!m||m.sha256!==d.sha256){run.problems.push('Drawing of deleted job missing in the cloud: '+j.id+' / '+unitId);return}
   const item=await planMedia(d.sha256,d.bytes,d.contentType,null,run,{drawing:j.id+' / '+unitId});if(item.problem){run.problems.push(item.problem);return}drawingShas[unitId]=d.sha256;media[d.sha256]=true}
  const m=await metaOf(cur.file,run);
  const full={rev:cur.rev,file:cur.file,sha256:cur.sha256,md5:m&&m.md5,generation:m&&m.generation,size:m&&m.size,lifecycle:pkg.lifecycle||[],jobTextSha:await sha256Hex(JSON.stringify(pkg.job)),deletedAt:pkg.recycleBin&&pkg.recycleBin.deletedAt||null,drawings:drawingShas};
  if(!m||m.md5!==md5Base64(prev.text)){run.problems.push('Deleted job file in the cloud changed while it was read: '+j.id);return}
  run.report.proofs.download++;
  run.expect.tombstones.set(j.id,{pkg:full,text:prev.text});
  await saveProof('job-'+j.id,j.id,full,proof&&proof.links||{},media,proof,run);
 }
 async function copySettingsInc(src,run){
  const proof=run.proofs.get('settings-studio')||null;const media={};
  for(const d of src.orphans){const item=await planMedia(d.sha256,d.bytes,d.contentType,proof&&proof.media&&proof.media[d.sha256],run,{drawing:'orphan '+d.key});if(item.problem)run.problems.push(item.problem);else media[d.sha256]=true}
  run.settingsMedia=media;run.settingsProof=proof;
  return copySettings(src,run.report,async()=>{});
 }
 // Put a missing media file back (bytes held here, or the unchanged original fetched again).
 async function restoreMedia(item,run){
  let bytes=item.bytes;
  if(!bytes&&item.source&&item.source.url){try{const f=await fetchOwned(item.source.url,run);if(f.sha===item.sha)bytes=f.bytes}catch(e){}}
  if(!bytes)return {problem:'A drawing or photo is missing in the cloud and cannot be put back from this computer: '+item.sha};
  const p=await uploadMedia(item.sha,bytes,item.contentType,run);
  if(!p.problem)run.report.repaired.push('missing file put back: '+item.sha);
  return p;
 }
 // ---- Check step: every record and every file once, with the server, after all writes ----
 async function checkRun(src,run){
  const problems=run.problems.slice(),manifest=[],damagedPkg=new Set(),fileGen=new Map();
  const custNow=new Map(),jobsNow=new Map();
  if(run.partial){
   await Promise.all([...src.customers.map(async c=>{const d=await fb.getDoc(custRef(c.id));run.counts.reads++;if(d.exists())custNow.set(c.id,d.data())}),
    ...[...src.jobs,...src.deleted].map(async j=>{const d=await fb.getDoc(jobRef(j.id));run.counts.reads++;if(d.exists())jobsNow.set(j.id,d.data())})]);
  }else{
  const [cs,js]=await Promise.all([fb.getDocs(fb.collection(db,base+'/customers')),fb.getDocs(fb.collection(db,base+'/jobs'))]);
  run.counts.reads+=Math.max(1,cs.size)+Math.max(1,js.size);
  cs.forEach(d=>custNow.set(d.id,d.data()));js.forEach(d=>jobsNow.set(d.id,d.data()));
  }
  for(const c of src.customers){const d=custNow.get(c.id);
   if(!d){problems.push('Customer missing in the cloud: '+c.id);continue}
   if(d.deleted===true){problems.push('Customer is deleted in the cloud: '+c.id);continue}
   if(!sameValue(d.data,c)){problems.push('Customer differs in the cloud: '+c.id);continue}
   manifest.push(['customer',c.id,d.rev])}
  for(const j of src.jobs){const e=run.expect.jobs.get(j.id),d=jobsNow.get(j.id);
   if(!d){problems.push('Job missing in the cloud: '+j.id);continue}
   if(!e){problems.push('Job was not copied in this run: '+j.id);continue}
   if(d.deleted===true){problems.push('Job is deleted in the cloud: '+j.id);continue}
   if(d.file!==filePath(j.id,d.rev,d.sha256)){problems.push('Job record names the wrong file: '+j.id);continue}
   if(d.rev!==e.rev||d.sha256!==e.sha256){problems.push('Job in the cloud is a different version than the browser: '+j.id);continue}
   const m=await metaOf(d.file,run),md5=md5Base64(e.text),size=utf8Bytes(e.text);
   if(!m){await keepLease();const up=await st.uploadString(st.ref(storage,d.file),e.text,'raw',{contentType:'application/json',customMetadata:{sessionId}});
    if(!(up&&up.metadata&&up.metadata.md5Hash===md5)){problems.push('Job file missing in the cloud: '+j.id);continue}run.report.repaired.push('job file put back: '+j.id);fileGen.set('job-'+j.id,String(up.metadata.generation))}
   else if(m.md5!==md5||m.size!==size){problems.push('Job file fingerprint does not match its record: '+j.id);damagedPkg.add('job-'+j.id);continue}
   else fileGen.set('job-'+j.id,m.generation);
   manifest.push(['job',j.id,d.rev,d.sha256])}
  for(const j of src.deleted){const e=run.expect.tombstones.get(j.id),d=jobsNow.get(j.id);
   if(!d){problems.push('Deleted job has no tombstone in the cloud: '+j.id);continue}
   if(d.deleted!==true){problems.push('Deleted job is not a tombstone in the cloud: '+j.id);continue}
   if(!e){if(!problems.some(p=>p.includes(j.id)))problems.push('Deleted job was not checked in this run: '+j.id);continue}
   if(d.rev!==e.pkg.rev||d.sha256!==e.pkg.sha256){problems.push('Tombstone record changed in the cloud: '+j.id);continue}
   const m=await metaOf(d.file,run);
   if(!m){if(e.text){await keepLease();const up=await st.uploadString(st.ref(storage,d.file),e.text,'raw',{contentType:'application/json',customMetadata:{sessionId}});if(up&&up.metadata&&up.metadata.md5Hash===md5Base64(e.text)){run.report.repaired.push('deleted job file put back: '+j.id);manifest.push(['tombstone',j.id,d.rev]);continue}}
    problems.push('Tombstone package missing: '+j.id);continue}
   const ok=e.text?(m.md5===md5Base64(e.text)&&m.size===utf8Bytes(e.text)):sameMeta(m,e.pkg);
   if(!ok){problems.push('Deleted job file in the cloud is damaged: '+j.id);damagedPkg.add('job-'+j.id);continue}
   manifest.push(['tombstone',j.id,d.rev])}
  // every media file used by this browser, once
  for(const item of run.media.values()){
   if(item.problem||item.needBytes)continue;// already reported where it was planned
   const m=await metaOf(mediaPath(item.sha),run);
   if(!m){const p=await restoreMedia(item,run);if(p.problem)problems.push(p.problem);else item.expect=pick(p);continue}
   let ok;
   if(item.bytes)ok=m.md5===md5Base64(item.bytes)&&m.size===item.bytes.length;
   else if(sameMeta(m,item.expect)){ok=true;if(!item.checkedNow)run.report.proofs.recorded++}
   else{// the record and the server disagree: only the bytes decide
    try{const got=new Uint8Array(await st.getBytes(st.ref(storage,mediaPath(item.sha))));ok=await sha256Bytes(got)===item.sha&&md5Base64(got)===m.md5}catch(e){ok=false}
    if(ok){run.report.proofs.download++;run.report.notes.push('A proof record did not match the server; the file was downloaded and checked instead: '+item.sha)}}
   if(ok)item.expect=pick({...m,contentType:item.expect&&item.expect.contentType||m.contentType||item.contentType});
   else{problems.push(DAMAGED(item.sha)+(item.source&&item.source.drawing?' (drawing '+item.source.drawing+')':''));item.damaged=true}
  }
  // settings and the recovery list (Firestore only)
  const sSnap=await fb.getDoc(settingsRef());run.counts.reads++;const sv=sSnap.exists()?sSnap.data().values||{}:null;
  if(!sv)problems.push('Settings missing in the cloud');
  else{
   for(const [k,v] of Object.entries(src.settings))if(sv[k]!==v)problems.push('Setting missing or different in the cloud: '+k);
   for(const k of Object.keys(sv))if(!(k in src.settings)&&k!=='recovery.orphanDrawings')problems.push('Setting in the cloud that the browser does not have: '+k);
   let list=[];try{list=JSON.parse(sv['recovery.orphanDrawings']||'[]')}catch(e){problems.push('Recovery list unreadable')}
   for(const d of src.orphans)if(!list.some(x=>x.key===d.key&&x.sha256===d.sha256))problems.push('Orphan drawing missing from the recovery list: '+d.key);
  }
  const want={customers:new Set(src.customers.map(c=>c.id)),jobs:new Set([...src.jobs.map(j=>j.id),...src.deleted.map(j=>j.id)])};
  const extra=[];if(!run.partial)custNow.forEach((d,id)=>{if(!want.customers.has(id))extra.push('customer '+id+(d.deleted?' (deleted)':''))});if(!run.partial)jobsNow.forEach((d,id)=>{if(!want.jobs.has(id))extra.push('job '+id+(d.deleted?' (deleted)':''))});
  // Bring the proof records in line with what the server just confirmed: a file put back has a
  // new generation, a damaged file loses its entry (job files keep their history, marked
  // damaged, so the next run replaces them), and only confirmed files are recorded.
  const keys=new Set([...run.proofs.keys(),...run.saved.keys()]);
  for(const k of keys){
   const cur=run.saved.get(k)||run.proofs.get(k);if(!cur)continue;
   const next={jobId:cur.jobId||'',pkg:cur.pkg?{...cur.pkg}:null,links:{...(cur.links||{})},media:{}};
   for(const [sha,e] of Object.entries(cur.media||{})){const it=run.media.get(sha);if(it&&it.damaged)continue;next.media[sha]=it&&it.expect&&!it.problem&&!it.needBytes?it.expect:e}
   if(next.pkg){if(damagedPkg.has(k))next.pkg.damaged=true;else if(fileGen.has(k)){next.pkg.generation=fileGen.get(k);delete next.pkg.damaged}}
   for(const [lk,l] of Object.entries(next.links))if(!next.media[l.sha256])delete next.links[lk];
   const stored=run.saved.has(k)?run.saved.get(k):run.proofs.get(k);
   if(!stored||!sameValue({jobId:stored.jobId||'',pkg:stored.pkg||null,links:stored.links||{},media:stored.media||{}},next)){try{await writeProof(k,next,run);run.saved.set(k,next)}catch(e){}}
  }
  if(src.orphans.length&&!problems.length)await saveProof('settings-studio','',null,{},run.settingsMedia||{},run.settingsProof,run);
  return {ok:problems.length===0,problems,extraInCloud:extra,mode:run.partial?'changed-only':'incremental',checked:{customers:src.customers.length,jobs:src.jobs.length,deletedJobs:src.deleted.length,drawings:src.drawings.size,orphanDrawings:src.orphans.length,settings:Object.keys(src.settings).length,files:run.media.size+run.expect.jobs.size+run.expect.tombstones.size},manifest};
 }
 async function copyIncremental(src,report,partial){
  const run={report,problems:[],media:new Map(),saved:new Map(),expect:{jobs:new Map(),tombstones:new Map()},customers:new Map(),jobs:new Map(),proofs:new Map(),counts:{metadata:0,linkChecks:0,linkDownloads:0,packageDownloads:0,proofWrites:0,reads:0}};
  if(partial){
   // Changed-only run: read the records of the changed items, nothing else.
   run.partial=true;
   const get=async(ref,map,key)=>{const d=await fb.getDoc(ref);run.counts.reads++;if(d.exists())map.set(key,d.data())};
   await Promise.all([...src.customers.map(c=>get(custRef(c.id),run.customers,c.id)),
    ...[...src.jobs,...src.deleted].flatMap(j=>[get(jobRef(j.id),run.jobs,j.id),get(proofRef('job-'+j.id),run.proofs,'job-'+j.id)]),
    get(proofRef('settings-studio'),run.proofs,'settings-studio')]);
  }else{
  const [cs,js,ps]=await Promise.all([fb.getDocs(fb.collection(db,base+'/customers')),fb.getDocs(fb.collection(db,base+'/jobs')),fb.getDocs(fb.collection(db,base+'/proofs'))]);
  run.counts.reads+=Math.max(1,cs.size)+Math.max(1,js.size)+Math.max(1,ps.size);
  cs.forEach(d=>run.customers.set(d.id,d.data()));js.forEach(d=>run.jobs.set(d.id,d.data()));ps.forEach(d=>run.proofs.set(d.id,d.data()));
  }
  for(const c of src.customers){await keepLease();await copyCustomerInc(c,run)}
  const total=src.jobs.length+src.deleted.length,media=()=>(run.report&&run.report.media?run.report.media.uploaded+run.report.media.reused:0);let done=0;
  progress({stage:'jobs',done,total,media:media()});
  for(const j of src.jobs){await copyLiveJobInc(j,run);progress({stage:'jobs',done:++done,total,media:media()})}
  for(const j of src.deleted){await copyDeletedJobInc(j,run);progress({stage:'jobs',done:++done,total,media:media()})}
  await copySettingsInc(src,run);
  progress({stage:'checking',done,total,media:media()});
  await hook('beforeVerify');
  const v=await checkRun(src,run);
  v.counts=run.counts;
  return v;
 }

 // ---- The company's backup computer ----
 // One computer at a time backs up a company (record fiqMaster/{env}/primary/studio names it). The first copy
 // claims it. Another computer is refused, so an old computer coming back after a restore
 // cannot overwrite newer work: its own data stays on it. A computer that restored from the
 // cloud takes over only if that record has not changed since the restore (its rev).
 // Checked before the lock is taken, so a refused computer never blocks the backup computer.
 async function precheckPrimary(){
  const snap=await fb.getDoc(primaryRef());const cur=snap.exists()?snap.data():null;
  if(cur&&cur.primaryDevice&&cur.primaryDevice!==deviceId&&!(adopt&&adopt.fromDevice===cur.primaryDevice&&adopt.primaryRev===cur.rev))
   throw new CopyError('not-primary','This company is backed up from another computer ('+(cur.primaryName||cur.primaryDevice)+'). Nothing was copied. The work on this computer is kept here.',{primary:cur.primaryName||cur.primaryDevice,primaryRev:cur.rev});
 }
 async function claimPrimary(report){
  await fb.runTransaction(db,async tx=>{
   const now=await tx.get(primaryRef());const cur=now.exists()?now.data():null;
   if(cur&&cur.primaryDevice===deviceId){report.primary={device:deviceId,claimed:false};return}
   let handoverFrom=null;
   if(cur&&cur.primaryDevice){
    if(!(adopt&&adopt.fromDevice===cur.primaryDevice&&adopt.primaryRev===cur.rev))
     throw new CopyError('not-primary','This company is backed up from another computer ('+(cur.primaryName||cur.primaryDevice)+'). Nothing was copied. The work on this computer is kept here.',{primary:cur.primaryName||cur.primaryDevice,primaryRev:cur.rev});
    handoverFrom=cur.primaryDevice;
   }
   tx.set(primaryRef(),{rev:cur?cur.rev+1:1,primaryDevice:deviceId,primaryName:deviceName,primarySince:fb.serverTimestamp(),...(handoverFrom?{handoverFrom}:{}),sessionId,updatedAt:fb.serverTimestamp(),updatedBy:uid});
   report.primary={device:deviceId,claimed:true,handoverFrom};
  });
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
 // One fingerprint per job, deleted job and customer (content, drawings, photo links, history).
 async function itemPrints(src){
  const draw=j=>JSON.stringify(Object.entries(j.drawings||{}).map(([k,d])=>[k,d.sha256]).sort());
  const out={jobs:{},deleted:{},customers:{}};
  for(const j of src.jobs)out.jobs[j.id]=await sha256Hex(j.text+'|'+draw(j)+'|'+JSON.stringify(Array.from(j.links||[]).sort())+'|'+JSON.stringify(j.lifecycle||[]));
  for(const j of src.deleted)out.deleted[j.id]=await sha256Hex(j.text+'|'+String(j.deletedAt)+'|'+draw(j)+'|'+JSON.stringify(j.lifecycle||[]));
  for(const c of src.customers)out.customers[c.id]=await sha256Hex(JSON.stringify(c));
  return out;
 }
 // opts.previous: the prints of the last verified run on this computer. opts.fullCheck: check
 // everything (first run after opening, and once a day). Without previous prints, or when a
 // job or customer disappeared, the run is a full check.
 async function copyAndVerify(input,migrationId,opts){
  opts=opts||{};
  const report={ok:false,migrationId,customers:{created:0,updated:0,unchanged:0},jobs:{created:0,updated:0,unchanged:0,restored:0},tombstones:{created:0,unchanged:0},media:{uploaded:0,reused:0},settings:null,orphanDrawings:[],mediaNotOwned:[],filesReused:0,conflicts:[],verify:null,markerWritten:false,error:null,mode,proofs:{upload:0,local:0,download:0,recorded:0},repaired:[],notes:[],
   attempt:{id:migrationId,startedAt:new Date().toISOString(),finishedAt:null,sourceSha256:null,outcome:null}};
  const finish=()=>{const a=report.attempt;a.finishedAt=new Date().toISOString();
   a.outcome=report.ok?'verified':report.error?'failed':report.conflicts.length?'conflicts':'incomplete';return report};
  let src;
  let work,partial=false;
  try{src=await readSource(input);report.attempt.sourceSha256=await sourceSha(src);report.prints=await itemPrints(src)}catch(e){report.error={code:e.code||'error',message:e.message,detail:e.detail};return finish()}
  work=src;
  const prev=opts.previous;
  if(mode!=='full'&&prev&&!opts.fullCheck){
   const p=report.prints,gone=[...Object.keys(prev.jobs||{}).filter(id=>!(id in p.jobs)&&!(id in p.deleted)),...Object.keys(prev.deleted||{}).filter(id=>!(id in p.deleted)),...Object.keys(prev.customers||{}).filter(id=>!(id in p.customers))];
   if(!gone.length){partial=true;work={...src,customers:src.customers.filter(c=>prev.customers[c.id]!==p.customers[c.id]),jobs:src.jobs.filter(j=>prev.jobs[j.id]!==p.jobs[j.id]),deleted:src.deleted.filter(j=>prev.deleted[j.id]!==p.deleted[j.id])}}
  }
  report.scope=partial?{kind:'changed-only',customers:work.customers.length,jobs:work.jobs.length,deleted:work.deleted.length}:{kind:'full check'};
  let leased=false;
  try{
   await precheckPrimary();
   await takeLease();leased=true;
   await claimPrimary(report);
   if(mode==='full'){
    for(const c of src.customers){await keepLease();await copyCustomer(c,report)}
    for(const j of src.jobs)await copyLiveJob(j,report);
    for(const j of src.deleted)await copyDeletedJob(j,report);
    await copySettings(src,report);
    await hook('beforeVerify');
    report.verify=await verifySnapshot(src);
   }else report.verify=await copyIncremental(work,report,partial);
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
 // Fingerprint of this browser state, computed on this computer only (no network).
 async function fingerprint(input){return sourceSha(await readSource(input))}
 return {copyAndVerify,verifyOnly,checkVerified,fingerprint,filePath,mediaPath};
}
return {createCloudCopy,identities,sha256Hex,sha256Bytes,md5Base64,findLinks,dataUrlToBytes,CopyError,SCHEMA};
});
