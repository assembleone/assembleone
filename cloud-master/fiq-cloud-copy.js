/*
 * FittersIQ cloud copy-and-verify (Stage 2.2, slice 1).
 *
 * Copies a Studio browser state (customers and jobs) to the cloud master structure
 * tested in Stage 2.1, then reads everything back and compares it with the source.
 * The browser stays the master: this module is handed the saved state and never
 * writes to browser storage. Nothing here switches FittersIQ to cloud master.
 *
 *   companies/{companyId}/fiqMaster/{env}                 switch record (mode stays 'local')
 *   companies/{companyId}/fiqMaster/{env}/lease/studio    Studio editing lock
 *   companies/{companyId}/fiqMaster/{env}/customers/{id}  { rev, data: <customer>, ... }
 *   companies/{companyId}/fiqMaster/{env}/jobs/{id}       { rev, file, sha256, bytes, ... }
 *   fiqmaster/{companyId}/{env}/jobs/{id}/r{rev}-{sha256}.json   exact JSON text of the job
 *
 * A job file holds JSON.stringify(job) exactly as the browser saved it, so every id
 * (job, room, unit, panel, copy) and every QR / piece identity is preserved byte for
 * byte. The "verified copy" marker (switch record: migrationId + verifiedSha256) is
 * written only after a complete read-back matches; any failure leaves it unwritten.
 *
 * Works in the browser (Firebase web SDK 12) and in Node (tests): the Firebase
 * functions and instances are passed in.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FiqCloudCopy=api})(typeof self!=='undefined'?self:this,function(){
'use strict';
const SCHEMA=1;
const LEASE_MS=3*60*1000;// lock length; the rules allow at most 5 minutes
const RENEW_MS=60*1000;

async function sha256Hex(text){
 const h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
 return Array.from(new Uint8Array(h),b=>b.toString(16).padStart(2,'0')).join('');
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
function sameValue(a,b){return JSON.stringify(sortKeys(a))===JSON.stringify(sortKeys(b))}
function sortKeys(v){if(Array.isArray(v))return v.map(sortKeys);if(v&&typeof v==='object'){const o={};Object.keys(v).sort().forEach(k=>{o[k]=sortKeys(v[k])});return o}return v}
class CopyError extends Error{constructor(code,message,detail){super(message);this.code=code;this.detail=detail}}

function createCloudCopy(o){
 const {fb,st,db,storage,companyId,env,uid,sessionId,deviceId}=o;
 const deviceName=o.deviceName||'Studio';
 const hook=async(name,arg)=>{if(o.hooks&&typeof o.hooks[name]==='function')return o.hooks[name](arg)};
 if(!validId(companyId)||!(env==='beta'||env==='production')||!uid||!sessionId||!deviceId)throw new CopyError('config','Cloud copy is not configured (company, env, user, session, device).');
 const base='companies/'+companyId+'/fiqMaster/'+env;
 const leaseRef=()=>fb.doc(db,base+'/lease/studio');
 const custRef=id=>fb.doc(db,base+'/customers/'+id);
 const jobRef=id=>fb.doc(db,base+'/jobs/'+id);
 const switchRef=()=>fb.doc(db,base);
 const filePath=(jobId,rev,sha)=>'fiqmaster/'+companyId+'/'+env+'/jobs/'+jobId+'/r'+rev+'-'+sha+'.json';
 let lastRenew=0;

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

 function readSource(state){
  if(!state||!Array.isArray(state.customers)||!Array.isArray(state.projects))throw new CopyError('source','The browser data has no customer or job list.');
  const problems=[];const seenC=new Set(),seenJ=new Set();
  state.customers.forEach(c=>{if(!c||!validId(c.id))problems.push('Customer id cannot be stored in the cloud: '+JSON.stringify(c&&c.id));else if(seenC.has(c.id))problems.push('Customer id appears twice: '+c.id);else seenC.add(c.id)});
  state.projects.forEach(p=>{if(!p||!validId(p.id))problems.push('Job id cannot be stored in the cloud: '+JSON.stringify(p&&p.id));else if(seenJ.has(p.id))problems.push('Job id appears twice: '+p.id);else seenJ.add(p.id)});
  if(problems.length)throw new CopyError('source','The browser data cannot be copied as it is. Nothing was copied.',problems);
  // Plain copies made once, before any network work: what is copied and what is compared
  // are the same snapshot, whatever happens to the live browser data meanwhile.
  return {customers:state.customers.map(c=>JSON.parse(JSON.stringify(c))),jobs:state.projects.map(p=>({id:p.id,text:JSON.stringify(p)}))};
 }

 async function copyCustomer(c,report){
  const ref=custRef(c.id);
  const snap=await fb.getDoc(ref);const cur=snap.exists()?snap.data():null;
  if(cur&&cur.deleted===true){report.conflicts.push({type:'customer',id:c.id,reason:'deleted in the cloud; not brought back automatically'});return}
  if(cur&&sameValue(cur.data,c)){report.customers.unchanged++;return}
  const rev=cur?cur.rev+1:1;
  await fb.runTransaction(db,async tx=>{
   const now=await tx.get(ref);const nowRev=now.exists()?now.data().rev:0;
   if(nowRev!==rev-1)throw new CopyError('stale','Customer '+c.id+' was changed in the cloud by someone else during the copy (version '+nowRev+', expected '+(rev-1)+').');
   tx.set(ref,{rev,data:c,schema:SCHEMA,deleted:false,sessionId,deviceId,updatedAt:fb.serverTimestamp(),updatedBy:uid});
  });
  report.customers[cur?'updated':'created']++;
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

 async function copyJob(j,report){
  const sha=await sha256Hex(j.text);
  const ref=jobRef(j.id);
  const snap=await fb.getDoc(ref);const cur=snap.exists()?snap.data():null;
  if(cur&&cur.deleted===true){report.conflicts.push({type:'job',id:j.id,reason:'deleted in the cloud; not brought back automatically'});return}
  if(cur&&cur.sha256===sha){report.jobs.unchanged++;return}
  if(cur&&cur.deviceId!==deviceId){report.conflicts.push({type:'job',id:j.id,reason:'changed in the cloud by another computer ('+cur.deviceId+', version '+cur.rev+'); not overwritten'});return}
  const rev=cur?cur.rev+1:1;
  const path=filePath(j.id,rev,sha);
  if(await hook('skipJob',j.id)===true)return;// test hook: a buggy copy that silently skips
  await keepLease();
  const how=await uploadJobFile(path,j.text,sha);
  if(how==='reused')report.filesReused++;
  await hook('afterFile',{jobId:j.id,rev,path});
  await keepLease();
  await fb.runTransaction(db,async tx=>{
   const now=await tx.get(ref);const nowRev=now.exists()?now.data().rev:0;
   if(nowRev!==rev-1)throw new CopyError('stale','Job '+j.id+' was changed in the cloud by someone else during the copy (version '+nowRev+', expected '+(rev-1)+').');
   tx.set(ref,{rev,file:path,sha256:sha,bytes:utf8Bytes(j.text),name:String(JSON.parse(j.text).name||''),customerId:JSON.parse(j.text).customerId||null,schema:SCHEMA,deleted:false,sessionId,deviceId,updatedAt:fb.serverTimestamp(),updatedBy:uid});
  });
  report.jobs[cur?'updated':'created']++;
 }

 // Reads everything back and compares it with the source snapshot. Read-only.
 async function verifySnapshot(src){
  const problems=[],manifest=[];
  for(const c of src.customers){
   const snap=await fb.getDoc(custRef(c.id));
   if(!snap.exists()){problems.push('Customer missing in the cloud: '+c.id);continue}
   const d=snap.data();
   if(d.deleted===true){problems.push('Customer is deleted in the cloud: '+c.id);continue}
   if(!sameValue(d.data,c)){problems.push('Customer differs in the cloud: '+c.id);continue}
   manifest.push(['customer',c.id,d.rev,await sha256Hex(JSON.stringify(sortKeys(c)))]);
  }
  for(const j of src.jobs){
   const sha=await sha256Hex(j.text);
   const snap=await fb.getDoc(jobRef(j.id));
   if(!snap.exists()){problems.push('Job missing in the cloud: '+j.id);continue}
   const d=snap.data();
   if(d.deleted===true){problems.push('Job is deleted in the cloud: '+j.id);continue}
   if(d.sha256!==sha){problems.push('Job in the cloud is a different version than the browser: '+j.id);continue}
   if(d.file!==filePath(j.id,d.rev,sha)){problems.push('Job record names the wrong file: '+j.id);continue}
   let text=null;try{text=new TextDecoder().decode(await st.getBytes(st.ref(storage,d.file)))}catch(e){problems.push('Job file cannot be read: '+j.id+' ('+(e.code||e.message)+')');continue}
   if(await sha256Hex(text)!==d.sha256){problems.push('Job file fingerprint does not match its record: '+j.id);continue}
   if(text!==j.text){problems.push('Job file content differs from the browser: '+j.id);continue}
   const a=identities(JSON.parse(j.text)),b=identities(JSON.parse(text));
   if(a.join('\n')!==b.join('\n')){problems.push('Job ids or QR identities differ: '+j.id);continue}
   manifest.push(['job',j.id,d.rev,sha]);
  }
  // Cloud records the browser does not have (for example deleted here later): reported only.
  const extra=[];
  if(fb.getDocs&&fb.collection){
   const want={customers:new Set(src.customers.map(c=>c.id)),jobs:new Set(src.jobs.map(j=>j.id))};
   for(const col of ['customers','jobs']){const qs=await fb.getDocs(fb.collection(db,base+'/'+col));qs.forEach(d=>{if(!want[col].has(d.id))extra.push(col.slice(0,-1)+' '+d.id+(d.data().deleted?' (deleted)':''))})}
  }
  return {ok:problems.length===0,problems,extraInCloud:extra,checked:{customers:src.customers.length,jobs:src.jobs.length},manifest,manifestSha256:await sha256Hex(JSON.stringify(manifest))};
 }

 async function writeVerifiedMarker(migrationId,manifestSha){
  const ref=switchRef();
  await fb.runTransaction(db,async tx=>{
   const now=await tx.get(ref);const cur=now.exists()?now.data():null;
   tx.set(ref,{rev:cur?cur.rev+1:1,mode:'local',migrationId,verifiedSha256:manifestSha,switchedAt:cur&&cur.switchedAt?cur.switchedAt:fb.serverTimestamp(),switchedBy:cur&&cur.switchedBy?cur.switchedBy:uid,sessionId,updatedAt:fb.serverTimestamp(),updatedBy:uid});
  });
 }

 // Fingerprint of the exact browser data being copied (customers and job texts, by id).
 // The verified marker stores this, so a marker can only ever confirm this exact data.
 async function sourceSha(src){
  const c=src.customers.map(x=>[x.id,JSON.stringify(sortKeys(x))]).sort((a,b)=>a[0]<b[0]?-1:1);
  const j=src.jobs.map(x=>[x.id,x.text]).sort((a,b)=>a[0]<b[0]?-1:1);
  return sha256Hex(JSON.stringify({customers:c,jobs:j}));
 }

 // Copy, then verify; the marker only after a complete, exact match with no conflicts.
 // A failed or incomplete run never touches an earlier marker, and every run returns its
 // own attempt record (outcome verified | failed | incomplete | conflicts).
 async function copyAndVerify(state,migrationId){
  const report={ok:false,migrationId,customers:{created:0,updated:0,unchanged:0},jobs:{created:0,updated:0,unchanged:0},filesReused:0,conflicts:[],verify:null,markerWritten:false,error:null,
   attempt:{id:migrationId,startedAt:new Date().toISOString(),finishedAt:null,sourceSha256:null,outcome:null}};
  const finish=()=>{const a=report.attempt;a.finishedAt=new Date().toISOString();
   a.outcome=report.ok?'verified':report.error?'failed':report.conflicts.length?'conflicts':'incomplete';return report};
  let src;
  try{src=readSource(state);report.attempt.sourceSha256=await sourceSha(src)}catch(e){report.error={code:e.code||'error',message:e.message,detail:e.detail};return finish()}
  let leased=false;
  try{
   await takeLease();leased=true;
   for(const c of src.customers){await keepLease();await copyCustomer(c,report)}
   for(const j of src.jobs)await copyJob(j,report);
   await hook('beforeVerify');
   report.verify=await verifySnapshot(src);
   if(report.verify.ok&&!report.conflicts.length){await keepLease();await writeVerifiedMarker(migrationId,report.attempt.sourceSha256);report.markerWritten=true;report.ok=true}
  }catch(e){report.error={code:e.code||'error',message:e.message,detail:e.detail}}
  finally{if(leased)await releaseLease()}
  return finish();
 }
 async function verifyOnly(state){return verifySnapshot(readSource(state))}
 // Is THIS browser state the one the cloud marker verified? Read-only.
 async function checkVerified(state){
  const current=await sourceSha(readSource(state));
  const snap=await fb.getDoc(switchRef());const m=snap.exists()?snap.data():null;
  return {verified:!!m&&m.verifiedSha256===current,currentSha256:current,marker:m?{migrationId:m.migrationId,verifiedSha256:m.verifiedSha256,rev:m.rev,mode:m.mode}:null};
 }
 return {copyAndVerify,verifyOnly,checkVerified,filePath};
}
return {createCloudCopy,identities,sha256Hex,CopyError,SCHEMA};
});
