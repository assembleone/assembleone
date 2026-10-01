/*
 * FittersIQ Studio: manual cloud copy (Stage 2.3b). Loaded ONLY by the staging Studio page.
 *
 * The browser stays the master. Nothing here changes Studio's saved data, drawings or
 * settings, and no frozen workflow is touched: data comes from the existing read-only
 * window.fiqBuildBackup() (Stage 2.0); the status line and the Data safety section are
 * added next to the existing parts. There is no automatic copying: the cloud is contacted
 * only by "Copy to cloud now", "Check cloud copy", "Turn on" and one read-only check when
 * Studio opens.
 *
 * Copying needs all three: the company record says fiqCloudCopy "on" (off by default),
 * this browser's switch is on (off by default), and the signed-in user is the active owner.
 * Only the editing tab copies, never during a backup restore.
 *
 * Browser keys it may write (inside the staging page's "fiqstaging:" storage):
 *   fiq_device_id_v1            this installation's permanent random id
 *   fiq_cloud_copy_enabled_v1   this browser's switch
 *   fiq_cloud_last_attempt_v1   the last attempt and the last verified run
 */
import * as fsMod from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import * as stMod from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";
import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

const ENV='beta';
const STAGING_PROJECT='fittersiq-staging';
const STAGING_LINK='https://firebasestorage.googleapis.com/v0/b/fittersiq-staging.firebasestorage.app/';
const K={device:'fiq_device_id_v1',enabled:'fiq_cloud_copy_enabled_v1',attempt:'fiq_cloud_last_attempt_v1'};
const TEXT={verified:'☁ Verified',pending:'☁ Copied · photos pending',changes:'☁ Changes not copied yet',copying:'☁ Copying…',review:'☁ Needs review',offline:'☁ Offline · press Copy to cloud now when connected',waiting:'☁ Waiting for another computer',failed:'☁ Not copied'};
const HELP={verified:'The cloud has exactly the data saved in this browser, including every drawing and photo, and it was checked.',pending:'The latest job data is in the cloud, but some photos are not owned by the cloud copy yet. Not verified.',changes:'Changes saved in this browser are not in the cloud copy yet. Press Copy to cloud now.',copying:'Copying to the cloud and checking it. Keep this tab open.',review:'Something in the cloud was changed on another computer or deleted there. Nothing was overwritten. It needs review.',offline:'No internet connection. Nothing is lost: this browser has everything. Press Copy to cloud now when connected.',waiting:'Another computer is copying for this company right now. Nothing was copied. Try again shortly.',failed:'The last copy did not finish. Nothing is lost: this browser has everything.'};

const T=window.FIQ_CLOUD_COPY_TEST||null;// set only by automated tests (Firebase emulator)
const ls={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},del:k=>{try{localStorage.removeItem(k)}catch(e){}}};
const readJSON=k=>{try{return JSON.parse(ls.get(k)||'null')}catch(e){return null}};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

let db=null,storage=null,ready=false,disabledReason='';
let state='off',companyOn=null,busy=false,current=null,lastCheck=null;

function connect(){
 if(db)return true;
 if(T){
  const app=initializeApp({projectId:T.projectId,apiKey:'test-only',storageBucket:T.bucket},'fiq-cloud-copy-test');
  db=fsMod.getFirestore(app);fsMod.connectFirestoreEmulator(db,T.host,T.firestorePort,{mockUserToken:T.mockUserToken});
  storage=stMod.getStorage(app);stMod.connectStorageEmulator(storage,T.host,T.storagePort,{mockUserToken:T.mockUserToken});
  return true;
 }
 const f=window.fiqFirestore,s=window.fiqStorage;
 if(!f||!s)return false;
 // Never anything but the staging project.
 if(f.app.options.projectId!==STAGING_PROJECT){disabledReason='This page is not connected to the staging project.';return false}
 db=f;storage=s;return true;
}
function user(){
 if(T)return T.user;
 const u=window.fittersiqUser;
 return u&&u.uid&&u.companyId&&u.role==='company_owner'?u:null;
}
const enabled=()=>ls.get(K.enabled)==='on';
function deviceId(){
 let id=ls.get(K.device);
 if(!id){id=(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2));ls.set(K.device,id)}
 return id;
}
function deviceName(){const ua=navigator.userAgent||'';return 'Studio · '+(/Windows/.test(ua)?'Windows':/Mac/.test(ua)?'Mac':/Android/.test(ua)?'Android':/iPhone|iPad/.test(ua)?'iOS':'computer')+' · '+(/Edg\//.test(ua)?'Edge':/Chrome\//.test(ua)?'Chrome':/Firefox\//.test(ua)?'Firefox':/Safari\//.test(ua)?'Safari':'browser')}
const fb={doc:fsMod.doc,getDoc:fsMod.getDoc,getDocs:fsMod.getDocs,collection:fsMod.collection,setDoc:fsMod.setDoc,runTransaction:fsMod.runTransaction,serverTimestamp:fsMod.serverTimestamp,Timestamp:fsMod.Timestamp};
const st={ref:stMod.ref,uploadString:stMod.uploadString,uploadBytes:stMod.uploadBytes,getBytes:stMod.getBytes,getMetadata:stMod.getMetadata};
const isAllowedLink=url=>url.startsWith(STAGING_LINK)||(!!T&&url.startsWith('http://'+T.host+':'+T.storagePort+'/'));
async function fetchLink(url){
 if(/assembleone-fabac/i.test(url))throw new Error('Production is never fetched');
 if(url.startsWith(STAGING_LINK)){const r=stMod.ref(storage,url);const [bytes,meta]=await Promise.all([stMod.getBytes(r),stMod.getMetadata(r)]);return {bytes:new Uint8Array(bytes),contentType:meta.contentType||''}}
 const res=await fetch(url);if(!res.ok)throw new Error('Photo could not be read ('+res.status+')');
 return {bytes:new Uint8Array(await res.arrayBuffer()),contentType:res.headers.get('content-type')||''};
}
function copier(sessionId){
 const u=user();
 return window.FiqCloudCopy.createCloudCopy({fb,st,db,storage,companyId:u.companyId,env:ENV,uid:u.uid,sessionId:sessionId||('s-'+Date.now().toString(36)+Math.random().toString(36).slice(2,8)),deviceId:deviceId(),deviceName:deviceName(),fetchLink,isAllowedLink,hooks:T&&T.hooks?T.hooks:undefined});
}
async function input(){
 const b=await window.fiqBuildBackup();// read-only (Stage 2.0)
 if(!b||!b.savedState)throw new Error('There is no saved Studio data in this browser yet.');
 return {state:b.savedState,drawings:(b.drawings||[]).filter(d=>d&&d.drawing),settings:(b.settings&&b.settings.values)||{}};
}
// Fingerprint of what this browser has saved; computed here, no network.
async function localFingerprint(){
 const u=user();if(!u)return null;
 const c=window.FiqCloudCopy.createCloudCopy({fb,st,db:db||{},storage:storage||{},companyId:u.companyId,env:ENV,uid:u.uid,sessionId:'fingerprint',deviceId:'fingerprint'});
 return c.fingerprint(await input());
}
async function readCompanySwitch(){
 const u=user();if(!u||!connect())return false;
 try{const s=await fsMod.getDoc(fsMod.doc(db,'companies/'+u.companyId));companyOn=s.exists()&&s.data().fiqCloudCopy==='on'}catch(e){companyOn=null;throw e}
 return companyOn;
}
const netError=e=>!navigator.onLine||/unavailable|deadline-exceeded|retry-limit|network|failed to fetch|offline/i.test(String(e&&e.code||'')+' '+String(e&&e.message||''));

// The state shown, from this browser's saved data and its last attempt (no network).
function decide(fp){
 const a=readJSON(K.attempt);
 if(busy)return 'copying';
 if(a&&fp&&a.sourceSha256===fp){
  if(a.outcome==='verified')return 'verified';
  if(a.outcome==='conflicts')return 'review';
  if(a.outcome==='incomplete')return a.pending&&a.pending.length&&!(a.otherProblems&&a.otherProblems.length)?'pending':'failed';
  if(a.offline)return 'offline';
  if(a.code==='lease-busy')return 'waiting';
  return 'failed';
 }
 if(a&&fp&&a.verifiedSha256===fp)return 'verified';
 return 'changes';
}
async function refresh(){
 if(!enabled()||!user()){state='off';paint();return}
 try{current=await localFingerprint();state=decide(current)}catch(e){state='failed'}
 paint();
}
function recordAttempt(r,extra){
 const prev=readJSON(K.attempt)||{};
 const pending=(r&&r.mediaNotOwned||[]).map(m=>({id:m.id,photos:m.links.length}));
 const problems=(r&&r.verify&&r.verify.problems)||[];
 const rec={id:r?r.migrationId:extra.id,at:new Date().toISOString(),outcome:r?r.attempt.outcome:'failed',sourceSha256:r?r.attempt.sourceSha256:(extra.sourceSha256||null),
  code:r&&r.error?r.error.code:(extra.code||null),message:r&&r.error?r.error.message:(extra.message||null),offline:!!(extra&&extra.offline),
  counts:r?{customers:r.customers,jobs:r.jobs,tombstones:r.tombstones,media:r.media,filesReused:r.filesReused,settings:r.settings,checked:r.verify&&r.verify.checked}:null,
  conflicts:(r&&r.conflicts||[]).map(c=>c.type+' '+c.id+': '+c.reason),pending,problems:problems.slice(0,50),
  otherProblems:problems.filter(p=>!/Photo not owned by the cloud master yet/.test(p)).slice(0,50),
  verifiedSha256:prev.verifiedSha256||null,verifiedAt:prev.verifiedAt||null,verifiedRun:prev.verifiedRun||null};
 if(r&&r.ok){rec.verifiedSha256=r.attempt.sourceSha256;rec.verifiedAt=rec.at;rec.verifiedRun=r.migrationId}
 ls.set(K.attempt,JSON.stringify(rec));
 return rec;
}
async function copyNow(){
 if(busy)return;
 const gate=window.fiqEditor;
 if(!gate||!gate.canWrite()||gate.restoring)return note('Only the tab that is editing Studio can copy (and not during a backup restore).');
 if(!enabled())return note('Cloud copy is off for this browser.');
 if(!navigator.onLine){recordAttempt(null,{id:'offline-'+Date.now(),offline:true,code:'offline',message:'No internet connection.',sourceSha256:current});await refresh();return}
 busy=true;state='copying';paint();
 let r=null;
 try{
  if(!(await readCompanySwitch())){busy=false;note('Cloud copy is not enabled for this company.');await refresh();return}
  if(typeof window.a131StableSave==='function')await window.a131StableSave(false);// make sure the latest edits are saved first
  r=await copier().copyAndVerify(await input(),'studio-'+new Date().toISOString().replace(/[-:.TZ]/g,'').slice(0,14)+'-'+Math.random().toString(36).slice(2,6));
  recordAttempt(r,{offline:!!(r.error&&netError(r.error))});
 }catch(e){recordAttempt(null,{id:'error-'+Date.now(),code:e.code||'error',message:String(e.message||e),offline:netError(e),sourceSha256:current})}
 busy=false;await refresh();
}
async function checkNow(){
 if(busy||!enabled())return;
 busy=true;state='copying';paint();
 try{
  if(!navigator.onLine)throw Object.assign(new Error('No internet connection.'),{code:'offline'});
  const c=copier(),inp=await input();
  const [v,m]=await Promise.all([c.verifyOnly(inp),c.checkVerified(inp)]);
  lastCheck={at:new Date().toISOString(),ok:v.ok,markerMatches:m.verified,problems:v.problems.slice(0,50),extra:v.extraInCloud.slice(0,20)};
 }catch(e){lastCheck={at:new Date().toISOString(),ok:false,problems:[String(e.message||e)],offline:netError(e)}}
 busy=false;await refresh();
}
async function turnOn(){
 if(!user())return note('Sign in as the company owner first.');
 try{if(!(await readCompanySwitch()))return note('Cloud copy is not enabled for this company.')}catch(e){return note(netError(e)?'No internet connection.':'The company setting could not be read.')}
 deviceId();ls.set(K.enabled,'on');await refresh();await openCheck();
}
function turnOff(){ls.del(K.enabled);state='off';paint()}
let noteText='';function note(t){noteText=t;paint()}
// One read-only check when Studio opens: does the cloud marker match this browser's data?
async function openCheck(){
 if(!enabled()||!user()||!navigator.onLine)return;
 try{
  if(!(await readCompanySwitch())){paint();return}
  const m=await copier().checkVerified(await input());
  const a=readJSON(K.attempt)||{};
  if(m.verified&&a.verifiedSha256!==m.currentSha256){a.verifiedSha256=m.currentSha256;a.verifiedRun=m.marker&&m.marker.migrationId;ls.set(K.attempt,JSON.stringify(a))}// the cloud confirms this exact state
  if(!m.verified&&a.verifiedSha256===m.currentSha256){a.verifiedSha256=null;ls.set(K.attempt,JSON.stringify(a))}// the cloud no longer confirms it
 }catch(e){}
 await refresh();
}

// ---- Status line next to the save status ----
function paint(){
 let el=document.getElementById('fiqCloudStatus');
 const chip=document.getElementById('fiqSaveChip');
 if(state==='off'){if(el)el.remove();paintSection();return}
 if(!el&&chip){el=document.createElement('button');el.type='button';el.id='fiqCloudStatus';el.className='fiq-cloud-status';el.onclick=()=>window.fiqOpenDataSafety&&window.fiqOpenDataSafety();chip.insertAdjacentElement('afterend',el)}
 if(el){el.dataset.cloudState=state;el.textContent=TEXT[state];el.title=HELP[state]+' Click for Data safety.'}
 paintSection();
}
function stats(a){if(!a||!a.counts)return '';const c=a.counts,ch=c.checked||{};return 'Customers '+(ch.customers??'—')+' · jobs '+(ch.jobs??'—')+' · deleted jobs '+(ch.deletedJobs??'—')+' · drawings '+(ch.drawings??'—')+' · settings '+(ch.settings??'—')+' · orphan drawings '+(ch.orphanDrawings??'—')+' · files uploaded '+((c.media&&c.media.uploaded)||0)+', reused '+(((c.media&&c.media.reused)||0)+(c.filesReused||0))}
function paintSection(){
 const sheet=document.querySelector('.fiq-safety-dialog .fiq-safety-sheet');if(!sheet)return;
 let s=sheet.querySelector('[data-cloud-section]');
 if(!s){s=document.createElement('div');s.dataset.cloudSection='1';s.className='fiq-cloud-section';const before=sheet.querySelector('.a100-edit-actions');sheet.insertBefore(s,before||null)}
 const gate=window.fiqEditor,canCopy=!!gate&&gate.canWrite()&&!gate.restoring&&!busy;
 const a=readJSON(K.attempt);
 let h='<h3>Cloud copy (staging)</h3>';
 if(disabledReason)h+='<p class="muted">'+esc(disabledReason)+'</p>';
 else if(!user())h+='<p class="muted">Sign in as the company owner to use cloud copy.</p>';
 else if(!enabled())h+='<p class="muted">Cloud copy is off for this browser. Saved data stays in this browser as before.</p>'+(noteText?'<p class="fiq-doc-warn" data-cloud-note>'+esc(noteText)+'</p>':'')+'<div class="fiq-safety-actions"><button type="button" class="btn" data-cloud-on>Turn on cloud copy for this browser</button></div>';
 else{
  h+='<p data-cloud-state="'+esc(state)+'"><b>'+esc(TEXT[state]||'')+'</b><br><span class="muted">'+esc(HELP[state]||'')+'</span></p>';
  if(companyOn===false)h+='<p class="fiq-doc-warn">Cloud copy is not enabled for this company.</p>';
  if(a&&a.verifiedAt)h+='<p class="muted">Last verified: '+esc(a.verifiedAt.replace('T',' ').slice(0,19))+' (run '+esc(a.verifiedRun||'')+')</p>';
  if(a)h+='<p class="muted" data-cloud-attempt="'+esc(a.outcome)+'">Last attempt: '+esc((a.at||'').replace('T',' ').slice(0,19))+' · '+esc(a.outcome)+(a.message?' · '+esc(a.message):'')+'</p><p class="muted">'+esc(stats(a))+'</p>';
  const list=(t,items,attr)=>items&&items.length?'<p><b>'+esc(t)+'</b></p><ul '+attr+'>'+items.slice(0,20).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'';
  if(a){h+=list('Needs review',a.conflicts,'data-cloud-conflicts');h+=list('Photos not owned yet',(a.pending||[]).map(p=>p.id+': '+p.photos+' photo(s)'),'data-cloud-pending');h+=list('Problems',a.otherProblems,'data-cloud-problems')}
  if(lastCheck)h+='<p class="muted" data-cloud-check="'+(lastCheck.ok?'ok':'problems')+'">Last check: '+esc(lastCheck.at.replace('T',' ').slice(0,19))+' · '+(lastCheck.ok?'cloud copy matches':'differences found')+'</p>'+list('Check found',lastCheck.problems,'data-cloud-check-problems');
  if(noteText)h+='<p class="fiq-doc-warn" data-cloud-note>'+esc(noteText)+'</p>';
  h+='<div class="fiq-safety-actions"><button type="button" class="btn primary" data-cloud-copy'+(canCopy?'':' disabled title="Only the tab that is editing Studio can copy, and not during a backup restore."')+'>Copy to cloud now</button><button type="button" class="btn" data-cloud-check'+(busy?' disabled':'')+'>Check cloud copy</button><button type="button" class="btn" data-cloud-off>Turn cloud copy off for this browser</button></div>';
 }
 s.innerHTML=h;
 const on=s.querySelector('[data-cloud-on]');if(on)on.onclick=()=>{noteText='';turnOn()};
 const cp=s.querySelector('[data-cloud-copy]');if(cp)cp.onclick=()=>{noteText='';copyNow()};
 const ck=s.querySelector('[data-cloud-check]');if(ck)ck.onclick=()=>{noteText='';checkNow()};
 const off=s.querySelector('[data-cloud-off]');if(off)off.onclick=()=>{noteText='';turnOff()};
}

// ---- Start ----
const style=document.createElement('style');
style.textContent='.fiq-cloud-status{border:0;background:transparent;font:600 12px/1.2 inherit;color:#475569;cursor:pointer;padding:2px 6px;white-space:nowrap}.fiq-cloud-status[data-cloud-state=verified]{color:#15803d}.fiq-cloud-status[data-cloud-state=pending],.fiq-cloud-status[data-cloud-state=changes],.fiq-cloud-status[data-cloud-state=waiting]{color:#b45309}.fiq-cloud-status[data-cloud-state=review],.fiq-cloud-status[data-cloud-state=failed],.fiq-cloud-status[data-cloud-state=offline]{color:#b91c1c}.fiq-cloud-section{border-top:1px solid #e2e8f0;margin-top:12px;padding-top:8px}@media (max-width:700px){.fiq-cloud-status{max-width:9em;overflow:hidden;text-overflow:ellipsis}}';
document.head.appendChild(style);
// The Data safety window: add the section whenever it opens; keep it current while open.
new MutationObserver(()=>{if(document.querySelector('.fiq-safety-dialog .fiq-safety-sheet')&&!document.querySelector('[data-cloud-section]'))paintSection()}).observe(document.body,{childList:true,subtree:true});
setInterval(()=>{if(document.querySelector('[data-cloud-section]'))paintSection()},1000);
// After each save: recompute the local fingerprint (no network), a few seconds later.
let saveTimer=null;
new MutationObserver(()=>{const c=document.getElementById('fiqSaveChip');if(c&&c.dataset.saveStatus==='saved'&&enabled()&&!busy){clearTimeout(saveTimer);saveTimer=setTimeout(refresh,T&&T.saveDelayMs!=null?T.saveDelayMs:3000)}}).observe(document.documentElement,{attributes:true,subtree:true,attributeFilter:['data-save-status']});
window.addEventListener('online',()=>{if(enabled())refresh()});
(async()=>{
 // Wait for the editor decision and for the signed-in user.
 for(let i=0;i<600&&!(window.fiqEditor&&window.fiqEditor.role!=='pending'&&user()&&window.fiqBuildBackup&&window.FiqCloudCopy);i++)await new Promise(r=>setTimeout(r,200));
 ready=true;
 if(!connect()){state='off';paint();return}
 await refresh();
 await openCheck();
})();
window.fiqCloudCopy={copyNow,checkNow,turnOn,turnOff,refresh,get state(){return state},get busy(){return busy}};
