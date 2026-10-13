// FittersIQ cloud restore (read side of fiq-cloud-copy.js). Standalone UMD, loaded by no page yet.
// Reads a company's cloud master copy (companies/{c}/fiqMaster/{env}: customer and job records,
// immutable job files fiqmaster/{c}/{env}/jobs/{id}/r{rev}-{sha}.json, media by sha256) and
// builds a normal Studio full backup (backupVersion 2), so the existing, tested "Restore from
// backup file" in Studio's Data safety dialog applies it: checked completely first, a safety
// backup of the current data downloaded first, one transaction, rollback on failure.
//  - Every job file is checked against the sha256 in its name and in its record. A damaged or
//    missing file is never used: the newest older version that checks out is used instead and
//    reported (never silently).
//  - Scope: the whole company (new computer, device loss) or one customer / some jobs. A scoped
//    restore starts from THIS browser's current data and replaces only the chosen jobs and
//    customer; every other job and customer stays exactly as it is in this browser.
//  - Photos: a photo link whose original file still exists is kept as it is. If the original is
//    gone, the link is replaced by the cloud copy of the same bytes (checked by sha256).
//  - Deleted jobs stay deleted (tombstones): a full restore never brings a deleted job back.
// It only reads the cloud. Nothing in the cloud is changed or deleted by a restore.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FiqCloudRestore=api})(typeof self!=='undefined'?self:this,function(){
'use strict';
const hex=buf=>Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
async function sha256Hex(text){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))}
async function sha256Bytes(bytes){return hex(await crypto.subtle.digest('SHA-256',bytes))}
const b64=bytes=>{if(typeof Buffer!=='undefined')return Buffer.from(bytes).toString('base64');let s='';const a=new Uint8Array(bytes);for(let i=0;i<a.length;i+=0x8000)s+=String.fromCharCode.apply(null,a.subarray(i,i+0x8000));return btoa(s)};
class RestoreError extends Error{constructor(code,message,detail){super(message);this.code=code;this.detail=detail}}
const FILE=/\/r(\d+)-([0-9a-f]{64})\.json$/;

function createCloudRestore(o){
 const {fb,st,db,storage,companyId,env}=o;
 // statLink(url) -> metadata | null when the original file is gone (same contract as the copy module).
 const statLink=o.statLink||null;
 // Independent backup: prefix is where the backup store keeps the same files ('backup/'), and
 // indexSource() returns that day's saved copy of the records (the primary cloud is not read).
 const prefix=o.prefix||'',indexSource=o.indexSource||null;
 if(!companyId||!(env==='beta'||env==='production'))throw new RestoreError('config','Cloud restore is not configured (company, env).');
 const base='companies/'+companyId+'/fiqMaster/'+env;
 const jobFolder=id=>prefix+'fiqmaster/'+companyId+'/'+env+'/jobs/'+id;
 const mediaPath=sha=>prefix+'fiqmaster/'+companyId+'/'+env+'/media/'+sha;
 const counts={reads:0,downloads:0,bytes:0};
 const getText=async path=>{const b=await st.getBytes(st.ref(storage,path));counts.downloads++;counts.bytes+=b.byteLength;return new TextDecoder().decode(b)};

 async function index(){
  if(indexSource){const m=await indexSource();counts.reads++;return {customers:m.customers||[],jobs:m.jobs||[],settings:m.settings||null,switchRec:m.switchRec||null,fromBackup:m.takenAt||true}}
  const sw=await fb.getDoc(fb.doc(db,base+'/primary/studio'));counts.reads++;
  const [cs,js,ss]=await Promise.all([fb.getDocs(fb.collection(db,base+'/customers')),fb.getDocs(fb.collection(db,base+'/jobs')),fb.getDoc(fb.doc(db,base+'/settings/studio'))]);
  counts.reads+=Math.max(1,cs.size)+Math.max(1,js.size)+1;
  const customers=[],jobs=[];
  cs.forEach(d=>customers.push({id:d.id,...d.data()}));js.forEach(d=>jobs.push({id:d.id,...d.data()}));
  return {customers,jobs,settings:ss.exists()?ss.data():null,switchRec:sw.exists()?sw.data():null};
 }
 // Every stored version of one job, newest first (from the immutable files themselves).
 async function versions(jobId){
  const found=await st.listAll(st.ref(storage,jobFolder(jobId)));
  return found.items.map(r=>{const m=FILE.exec('/'+r.name);return m?{rev:Number(m[1]),sha256:m[2],path:r.fullPath}:null}).filter(Boolean).sort((a,b)=>b.rev-a.rev);
 }
 // One version, checked: the text must hash to the sha in its file name (and the record's).
 async function readVersion(v,recordSha){
  let text;try{text=await getText(v.path)}catch(e){return {ok:false,problem:'file missing ('+v.path+')'}}
  const sha=await sha256Hex(text);
  if(sha!==v.sha256||(recordSha&&sha!==recordSha))return {ok:false,problem:'file damaged, checksum does not match (version '+v.rev+')'};
  let pkg;try{pkg=JSON.parse(text)}catch(e){return {ok:false,problem:'file unreadable (version '+v.rev+')'}}
  if(!pkg||pkg.fiqPackage!==2||!pkg.job)return {ok:false,problem:'not a job package (version '+v.rev+')'};
  return {ok:true,rev:v.rev,sha256:sha,pkg,text};
 }
 // The newest good version at or before the record's version (or before `beforeRev`).
 async function goodVersion(rec,beforeRev){
  const all=(await versions(rec.id)).filter(v=>v.rev<=(beforeRev||rec.rev));
  const skipped=[];
  for(const v of all){
   const r=await readVersion(v,v.rev===rec.rev?rec.sha256:null);
   if(r.ok)return {...r,skipped};
   skipped.push(r.problem);
  }
  return {ok:false,skipped};
 }
 const mediaCache=new Map();
 async function mediaBytes(sha){
  if(mediaCache.has(sha))return mediaCache.get(sha);
  const b=await st.getBytes(st.ref(storage,mediaPath(sha)));counts.downloads++;counts.bytes+=b.byteLength;
  const got=await sha256Bytes(b);if(got!==sha)throw new RestoreError('media-damaged','A cloud photo or drawing is damaged (checksum '+sha.slice(0,12)+').');
  mediaCache.set(sha,b);return b;
 }
 async function mediaUrl(sha){await mediaBytes(sha);return st.getDownloadURL(st.ref(storage,mediaPath(sha)))}

 // Turn one checked package back into the job exactly as Studio stores it.
 async function jobFromPackage(g,report){
  let text=JSON.stringify(g.pkg.job);
  const relinked=[];
  for(const [url,l] of Object.entries(g.pkg.links||{})){
   let alive=false;
   if(statLink){try{alive=!!(await statLink(url))}catch(e){alive=false}}
   if(!alive){const fresh=await mediaUrl(l.sha256);text=text.split(JSON.stringify(url).slice(1,-1)).join(JSON.stringify(fresh).slice(1,-1));relinked.push(l.sha256.slice(0,12))}
  }
  const job=JSON.parse(text);
  const drawings=[];
  for(const [unitId,d] of Object.entries(g.pkg.drawings||{})){
   const bytes=await mediaBytes(d.sha256);
   drawings.push({key:String(job.id)+':'+unitId,drawingType:d.drawingType||'image',drawingName:d.drawingName||'',drawing:'data:'+(d.contentType||'image/png')+';base64,'+b64(bytes)});
  }
  return {job,drawings,relinked};
 }

 // Build a Studio full backup from the cloud.
 //  current: the browser's own full backup (window.fiqBuildBackup()) or null for a clean browser.
 //  scope: {all:true} | {customerId} | {jobIds:[...]}
 //  target: {beta:boolean, storageKey:string} of the Studio that will restore it.
 async function buildRestore({current,scope,target}){
  if(!target||typeof target.storageKey!=='string')throw new RestoreError('target','Say which Studio will restore this (beta, storageKey).');
  const all=!!(scope&&scope.all);
  if(!all&&!(scope&&(scope.customerId||(Array.isArray(scope.jobIds)&&scope.jobIds.length))))throw new RestoreError('scope','Choose the whole company, one customer or some jobs.');
  if(!all&&!current)throw new RestoreError('scope','A single-customer restore needs this browser\'s current data, so nothing else is replaced.');
  const idx=await index();
  const report={scope:all?'company':scope.customerId?'customer '+scope.customerId:'jobs',source:indexSource?'independent backup':'cloud copy',jobs:[],customers:[],deletedKept:[],problems:[],counts,
   // Handover data for this computer's next backups (see fiq-cloud-copy.js adopt).
   adopt:{fromDevice:idx.switchRec&&idx.switchRec.primaryDevice||null,primaryRev:idx.switchRec?idx.switchRec.rev:0,jobs:{},customers:{},settings:idx.settings?idx.settings.rev:null}};
  const live=idx.jobs.filter(r=>r.deleted!==true),dead=idx.jobs.filter(r=>r.deleted===true);
  // Which jobs: read the current version's customerId when restoring one customer.
  const picked=[];
  for(const rec of live){
   if(!all&&scope.jobIds&&!scope.jobIds.includes(rec.id))continue;
   const g=await goodVersion(rec);
   if(!g.ok){report.problems.push('No undamaged version of job '+rec.id+': '+g.skipped.join('; '));continue}
   if(!all&&scope.customerId&&g.pkg.job.customerId!==scope.customerId)continue;
   picked.push({rec,g});
  }
  const state=current?JSON.parse(JSON.stringify(current.savedState)):{customers:[],projects:[],deletedProjectIds:[],deletedProjects:[]};
  if(!Array.isArray(state.customers))state.customers=[];if(!Array.isArray(state.projects))state.projects=[];
  let drawings=current?current.drawings.slice():[];
  for(const {rec,g} of picked){
   const r=await jobFromPackage(g,report);
   const i=state.projects.findIndex(p=>p&&p.id===r.job.id);
   if(i>=0)state.projects[i]=r.job;else state.projects.push(r.job);
   drawings=drawings.filter(d=>!String(d.key).startsWith(r.job.id+':')).concat(r.drawings);
   report.adopt.jobs[r.job.id]=rec.rev;
   report.jobs.push({id:r.job.id,rev:g.rev,usedOlderVersion:g.skipped.length?g.skipped:null,photosFromCloudCopy:r.relinked.length,drawings:r.drawings.length});
  }
  // Customers: all of them, or the chosen one (plus any customer a restored job points to that this browser lacks).
  const needIds=new Set(all?idx.customers.filter(c=>c.deleted!==true).map(c=>c.id):[scope.customerId,...picked.map(p=>p.g.pkg.job.customerId)].filter(Boolean));
  for(const c of idx.customers){
   if(!needIds.has(c.id)||!c.data)continue;
   const i=state.customers.findIndex(x=>x&&x.id===c.id);
   if(all||i<0||c.id===scope.customerId){if(i>=0)state.customers[i]=c.data;else state.customers.push(c.data);report.customers.push(c.id);report.adopt.customers[c.id]=c.rev}
  }
  // Deleted jobs stay deleted; a full restore also brings back the recycle bin entries.
  if(all){
   state.deletedProjectIds=[...new Set([...(state.deletedProjectIds||[]),...dead.map(r=>r.id)])];
   state.deletedProjects=Array.isArray(state.deletedProjects)?state.deletedProjects:[];
   for(const rec of dead){
    report.deletedKept.push(rec.id);
    if(state.deletedProjects.some(x=>x&&x.project&&x.project.id===rec.id))continue;
    const g=await goodVersion(rec);
    if(g.ok&&g.pkg.job&&g.pkg.job.id){const r=await jobFromPackage(g,report);// The original delete time from this computer, as saved in the package (the record holds the cloud time).
     const when=g.pkg.recycleBin&&Number(g.pkg.recycleBin.deletedAt)||(rec.deletedAt&&rec.deletedAt.toMillis?rec.deletedAt.toMillis():rec.deletedAt&&rec.deletedAt.millis)||Date.now();
     state.deletedProjects.push({deletedAt:when,project:r.job});drawings=drawings.filter(d=>!String(d.key).startsWith(rec.id+':')).concat(r.drawings)}
   }
   state.projects=state.projects.filter(p=>!state.deletedProjectIds.includes(p.id));
  }
  // Settings: only for a whole-company restore onto a clean browser.
  let settings=current&&current.settings?current.settings:{values:{}};
  if(all&&!current&&idx.settings&&idx.settings.values){
   const values={};
   for(const [k,v] of Object.entries(idx.settings.values)){
    if(k.startsWith('ls:'))values[k.slice(3)]=v;
    else if(k.startsWith('state:')){try{state[k.slice(6)]=JSON.parse(v)}catch(e){report.problems.push('Setting could not be read: '+k)}}
   }
   settings={values};
  }
  const backup={kind:'fittersiq-studio-backup',backupVersion:2,app:'FittersIQ Studio',beta:!!target.beta,createdAt:new Date().toISOString(),
   settings,origin:current?current.origin:'cloud-restore',page:current?current.page:'cloud-restore',storageKey:target.storageKey,
   restoredFromCloud:{companyId,env,scope:report.scope,at:new Date().toISOString(),jobs:report.jobs.map(j=>({id:j.id,rev:j.rev}))},
   savedStateSha256:await sha256Hex(JSON.stringify(state)),savedStateBytes:new TextEncoder().encode(JSON.stringify(state)).length,
   summary:{customers:state.customers.length,jobs:state.projects.length,deletedJobs:(state.deletedProjectIds||[]).length},
   savedState:state,drawings,fallbackCopy:null,pendingSiteInbox:current&&current.pendingSiteInbox||[],readErrors:[]};
  return {backup,report};
 }
 return {index,versions,readVersion,goodVersion,buildRestore,mediaPath,counts};
}
return {createCloudRestore,RestoreError};
});
