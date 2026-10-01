// Stage 2.3b: manual cloud copy in the REAL staging Studio page (local), with the cloud
// side on the Firebase emulator (demo-fittersiq) and generated data only. Run with:
//   firebase emulators:exec --project demo-fittersiq --config firebase.json --only firestore,storage "node staging-studio-cloud.test.cjs"
// (NODE_PATH must include the repo node_modules for Playwright.)
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {initializeTestEnvironment}=require('@firebase/rules-unit-testing');
const fb=require('firebase/firestore');
const {makeInput}=require('./test-data.cjs');
const root=path.resolve(__dirname,'..');
const RULES={firestore:fs.readFileSync(path.join(__dirname,'firestore.rules'),'utf8'),storage:fs.readFileSync(path.join(__dirname,'storage.rules'),'utf8')};
const CO='cA',BASEPATH='companies/'+CO+'/fiqMaster/beta';
const PROD='https://firebasestorage.googleapis.com/v0/b/assembleone-fabac.firebasestorage.app/o/companies%2FX%2Fp.jpg?alt=media';
const ALLOWED_KEYS=['fiq_device_id_v1','fiq_cloud_copy_enabled_v1','fiq_cloud_last_attempt_v1'];
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
let failed=0;const results=[];
async function check(name,fn){try{await fn();results.push({name,ok:true});console.log('ok    '+name)}catch(e){failed++;results.push({name,ok:false,error:e.message});console.log('FAIL  '+name+'\n      '+String(e.message).split('\n').slice(0,8).join('\n      '))}}

(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}if(req.method==='HEAD'){res.statusCode=200;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 const t=await initializeTestEnvironment({projectId:'demo-fittersiq',firestore:{host:'127.0.0.1',port:8181,rules:RULES.firestore},storage:{host:'127.0.0.1',port:9199,rules:RULES.storage}});
 const bucket=t.unauthenticatedContext().storage().app.options.storageBucket||'demo-fittersiq.appspot.com';
 const admin=fn=>t.withSecurityRulesDisabled(async c=>fn(c.firestore(),c.storage()));
 const seedCompany=async on=>admin(async db=>{await fb.setDoc(fb.doc(db,'companies/'+CO),{name:'Test Co',fiqCloudCopy:on?'on':'off'});await fb.setDoc(fb.doc(db,'companies/'+CO+'/members/owner1'),{role:'company_owner',status:'active'})});
 const cloud=async()=>{const o={jobs:{},customers:{},marker:null};await admin(async db=>{(await fb.getDocs(fb.collection(db,BASEPATH+'/jobs'))).forEach(d=>{o.jobs[d.id]=d.data()});(await fb.getDocs(fb.collection(db,BASEPATH+'/customers'))).forEach(d=>{o.customers[d.id]=d.data()});const m=await fb.getDoc(fb.doc(db,BASEPATH));o.marker=m.exists()?m.data():null});return o};
 const browser=await chromium.launch({headless:true});

 const TEST_CFG={projectId:'demo-fittersiq',host:'127.0.0.1',firestorePort:8181,storagePort:9199,bucket,
  mockUserToken:{sub:'owner1',user_id:'owner1',companyId:CO,role:'company_owner',email:'owner@test.local'},user:{uid:'owner1',companyId:CO,role:'company_owner'},saveDelayMs:300};
 async function newContext(){
  const ctx=await browser.newContext({viewport:{width:1366,height:900}});
  await ctx.addInitScript(cfg=>{cfg.hooks={afterFile:a=>window.__fiqTestAfterFile?window.__fiqTestAfterFile(a):undefined};window.FIQ_CLOUD_COPY_TEST=cfg},TEST_CFG);
  return ctx;
 }
 async function open(ctx){
  const page=await ctx.newPage();page.__req=[];page.__errors=[];
  page.on('request',r=>page.__req.push(r.url()));page.on('pageerror',e=>page.__errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.route(u=>{const s=String(u);return !(s.startsWith(base)||s.startsWith('http://127.0.0.1:8181')||s.startsWith('http://127.0.0.1:9199')||s.startsWith('https://www.gstatic.com/firebasejs/'))},r=>r.abort());
  await page.goto(base+'/staging/Studio.html');
  await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role!=='pending'&&window.fiqCloudCopy&&typeof window.a131StableSave==='function',null,{timeout:60000});
  await page.waitForTimeout(800);
  await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});
  return page;
 }
 const emuRequests=p=>p.__req.filter(u=>u.startsWith('http://127.0.0.1:8181')||u.startsWith('http://127.0.0.1:9199')).length;
 // Put generated data into Studio's own storage, the way Studio saves it.
 async function seedStudio(page,inp){
  await page.evaluate(async inp=>{
   const st=(0,eval)('state');
   const byKey=Object.fromEntries(inp.drawings.map(d=>[d.key,d]));
   inp.state.projects.forEach(p=>p.cabinets.forEach(c=>{const d=byKey[p.id+':'+c.id];if(d){c.drawing=d.drawing;c.drawingType=d.drawingType;c.drawingName=d.drawingName}}));
   ['customers','projects','deletedProjectIds','deletedProjects','jobLifecycle','units','fitters','lastChosenPartName'].forEach(k=>{st[k]=inp.state[k]});
   for(const [k,v] of Object.entries(inp.settings))localStorage.setItem(k,v);
   await window.a131StableSave(false);
   // Drawings Studio keeps without a current unit (recycle bin, orphan): straight into its store.
   const extra=inp.drawings.filter(d=>!inp.state.projects.some(p=>d.key.indexOf(p.id+':')===0));
   await new Promise((res,rej)=>{const q=indexedDB.open('assembleone_stable_v1');q.onsuccess=()=>{const tx=q.result.transaction('drawings','readwrite');extra.forEach(d=>tx.objectStore('drawings').put({drawing:d.drawing,drawingType:d.drawingType,drawingName:d.drawingName},d.key));tx.oncomplete=()=>{q.result.close();res()};tx.onerror=()=>rej(tx.error)};q.onerror=()=>rej(q.error)});
  },inp);
 }
 const snapshot=page=>page.evaluate(async()=>{
  const keys=[];for(let i=0;i<localStorage.length;i++)keys.push(Storage.prototype.key.call(localStorage,i));
  const settings={};['fiq_supplier_prices_v1','assembleone_material_library_v1','assembleone_sheet_settings'].forEach(k=>settings[k]=localStorage.getItem(k));keys.filter(k=>/assembleone-checklist-/.test(k)).forEach(k=>settings[k]=Storage.prototype.getItem.call(localStorage,k));
  const drawings=await new Promise(res=>{const q=indexedDB.open('assembleone_stable_v1');q.onsuccess=()=>{const out={},c=q.result.transaction('drawings').objectStore('drawings').openCursor();c.onsuccess=()=>{const x=c.result;if(x){out[x.key]=JSON.stringify(x.value);x.continue()}else{q.result.close();res(out)}}}});
  return {store:localStorage.getItem(STORE),settings,drawings,keys:keys.sort()};
 });
 const unlock=page=>page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});
 const openDS=async page=>{await unlock(page);if(!(await page.locator('.fiq-safety-dialog').count()))await page.locator('#fiqSaveChip').click();await page.locator('[data-cloud-section]').waitFor({timeout:10000})};
 const closeDS=async page=>{const c=page.locator('.fiq-safety-dialog [data-safety-close]');if(await c.count())await c.click()};
 const click=async(page,sel)=>{await openDS(page);await page.locator('[data-cloud-section] '+sel).click()};
 const waitState=(page,s,ms)=>page.waitForFunction(s=>{const e=document.getElementById('fiqCloudStatus');return e&&e.dataset.cloudState===s&&!window.fiqCloudCopy.busy},s,{timeout:ms||90000});
 const cloudState=page=>page.evaluate(()=>{const e=document.getElementById('fiqCloudStatus');return e?e.dataset.cloudState:null});
 const editJob=(page,changes)=>page.evaluate(async c=>{const st=(0,eval)('state');const p=st.projects[c.i];if(c.name)p.name=c.name;if(c.photos)p.jobLog[0].photos=c.photos;await window.a131StableSave(false)},changes);

 const inp=makeInput({jobs:3,seed:'u'});
 let ctx=await newContext(),page;
 await check('1. Switches off: no cloud traffic, no status line, Studio unchanged; company switch off refuses to turn on',async()=>{
  await t.clearFirestore();await seedCompany(true);
  page=await open(ctx);await seedStudio(page,inp);await page.reload();page.__req=[];
  await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor'&&window.fiqCloudCopy);await unlock(page);await page.waitForTimeout(2500);
  assert.equal(await page.locator('#fiqCloudStatus').count(),0,'no status line');assert.equal(emuRequests(page),0,'no cloud traffic with the browser switch off');
  assert.match(await page.locator('#fiqSaveChip').innerText(),/Saved/);
  await openDS(page);assert.match(await page.locator('[data-cloud-section]').innerText(),/off for this browser/);
  await seedCompany(false);await click(page,'[data-cloud-on]');await page.waitForTimeout(1500);
  assert.match(await page.locator('[data-cloud-section]').innerText(),/not enabled for this company/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('fiq_cloud_copy_enabled_v1')),null,'browser switch stays off');
  const c=await cloud();assert.deepEqual([Object.keys(c.jobs).length,c.marker],[0,null],'nothing in the master');
  await closeDS(page);await seedCompany(true);
 });
 let before;
 await check('2. Copy to cloud now: Verified; saved jobs, drawings and settings byte-identical (only cloud-copy keys added)',async()=>{
  before=await snapshot(page);
  await click(page,'[data-cloud-on]');await waitState(page,'changes',20000);
  await click(page,'[data-cloud-copy]');await waitState(page,'verified');
  const c=await cloud();assert.ok(c.marker&&c.marker.mode==='local');
  const a=await page.evaluate(()=>JSON.parse(localStorage.getItem('fiq_cloud_last_attempt_v1')));assert.equal(c.marker.verifiedSha256,a.sourceSha256);assert.equal(a.outcome,'verified');
  const after=await snapshot(page);
  assert.equal(after.store,before.store,'saved Studio data byte-identical');assert.deepEqual(after.settings,before.settings,'settings identical');assert.deepEqual(after.drawings,before.drawings,'drawings identical');
  const added=after.keys.filter(k=>!before.keys.includes(k)).map(k=>k.replace(/^fiqstaging:/,'')).sort();
  assert.deepEqual(added,ALLOWED_KEYS.slice().sort(),'only the cloud-copy keys were added');
  assert.equal(await page.locator('#fiqCloudStatus').innerText(),'☁ Verified');assert.match(await page.locator('#fiqSaveChip').innerText(),/Saved/,'Saved and Verified stay separate');
 });
 await check('3. A save after a verified copy: "Changes not copied yet" without any cloud traffic; copy again: Verified',async()=>{
  const n=emuRequests(page);await editJob(page,{i:0,name:'Edited after verify'});await waitState(page,'changes',15000);
  assert.equal(emuRequests(page),n,'no network after a save');
  await click(page,'[data-cloud-copy]');await waitState(page,'verified');
 });
 await check('4. A read-only second tab cannot copy; no copy during a backup restore',async()=>{
  const p2=await open(ctx);assert.equal(await p2.evaluate(()=>window.fiqEditor.role),'readonly');
  await p2.locator('#fiqSaveChip').click();await p2.locator('[data-cloud-section]').waitFor();await p2.waitForTimeout(1200);
  assert.equal(await p2.locator('[data-cloud-section] [data-cloud-copy]').isDisabled(),true,'disabled in the read-only tab');await p2.close();
  // Start a backup restore that waits, then fails on purpose (previous data comes back).
  const text=await page.evaluate(async()=>JSON.stringify(await window.fiqBuildBackup()));
  await page.evaluate(()=>{window.__release=null;window.__fiqRestoreHook=(stage,target)=>stage==='before-apply'&&target==='incoming'?new Promise((res,rej)=>{window.__release=()=>rej(new Error('test stop'))}):undefined});
  await openDS(page);await page.locator('.fiq-safety-dialog [data-safety-restore-file]').setInputFiles({name:'b.json',mimeType:'application/json',buffer:Buffer.from(text)});
  await page.locator('.fiq-safety-dialog [data-restore-confirm]').waitFor();
  await Promise.all([page.waitForEvent('download'),page.locator('.fiq-safety-dialog [data-restore-confirm]').click()]);
  await page.waitForFunction(()=>window.fiqEditor.restoring===true&&window.__release);await page.waitForTimeout(1300);
  assert.equal(await page.locator('[data-cloud-section] [data-cloud-copy]').isDisabled(),true,'disabled during a restore');
  await page.evaluate(()=>window.__release());await page.waitForFunction(()=>!window.fiqEditor.restoring);await page.evaluate(()=>{delete window.__fiqRestoreHook});
  await closeDS(page);
 });
 await check('5. Studio lock held by another installation: "Waiting", nothing written; free again: Verified',async()=>{
  await editJob(page,{i:1,name:'Edited for the lock test'});await waitState(page,'changes',15000);
  const m0=(await cloud()).marker.rev;
  await admin(db=>fb.setDoc(fb.doc(db,BASEPATH+'/lease/studio'),{holderUid:'owner1',sessionId:'OTHER',deviceId:'workshop-pc',deviceName:'Workshop PC',heartbeatAt:fb.Timestamp.now(),expiresAt:fb.Timestamp.fromMillis(Date.now()+120000)}));
  await click(page,'[data-cloud-copy]');await waitState(page,'waiting');assert.equal((await cloud()).marker.rev,m0,'nothing written');
  await admin(db=>fb.setDoc(fb.doc(db,BASEPATH+'/lease/studio'),{holderUid:'owner1',sessionId:'OTHER',deviceId:'workshop-pc',deviceName:'Workshop PC',heartbeatAt:fb.Timestamp.now(),expiresAt:fb.Timestamp.fromMillis(Date.now()-1000)}));
  await click(page,'[data-cloud-copy]');await waitState(page,'verified');
 });
 await check('6. Connection lost during a copy: "Offline", no new marker; no connection at all: "Offline" at once; connected again: Verified',async()=>{
  await editJob(page,{i:2,name:'Edited before losing the connection'});await waitState(page,'changes',15000);
  const m0=(await cloud()).marker.rev;
  await page.evaluate(()=>{window.__fiqTestAfterFile=()=>{throw Object.assign(new Error('network connection lost'),{code:'unavailable'})}});
  await click(page,'[data-cloud-copy]');await waitState(page,'offline');assert.equal((await cloud()).marker.rev,m0,'no new marker');
  await page.evaluate(()=>{delete window.__fiqTestAfterFile});
  await ctx.setOffline(true);await click(page,'[data-cloud-copy]');await waitState(page,'offline',15000);
  assert.equal(await page.locator('#fiqCloudStatus').innerText(),'☁ Offline · press Copy to cloud now when connected');
  await ctx.setOffline(false);await click(page,'[data-cloud-copy]');await waitState(page,'verified');
 });
 await check('7. Tab closed in the middle of a copy: reopened, not verified; Copy completes, files reused',async()=>{
  await editJob(page,{i:0,name:'Edited before closing the tab'});await waitState(page,'changes',15000);
  await page.evaluate(()=>{window.__fiqTestAfterFile=()=>new Promise(()=>{})});
  await click(page,'[data-cloud-copy]');await page.waitForFunction(()=>window.fiqCloudCopy.busy);await page.waitForTimeout(1500);
  await page.close();
  page=await open(ctx);await waitState(page,'changes',30000);
  await click(page,'[data-cloud-copy]');await waitState(page,'verified');
  const a=await page.evaluate(()=>JSON.parse(localStorage.getItem('fiq_cloud_last_attempt_v1')));assert.ok(a.counts.filesReused>=1,'file from the closed tab reused');
 });
 await check('8. Production-style photo link: "Copied · photos pending", never fetched; link removed: Verified',async()=>{
  await editJob(page,{i:1,photos:[PROD]});await waitState(page,'changes',15000);
  await click(page,'[data-cloud-copy]');await waitState(page,'pending');
  assert.equal(await page.locator('#fiqCloudStatus').innerText(),'☁ Copied · photos pending');
  assert.ok(!page.__req.some(u=>/assembleone-fabac/i.test(u)),'Production never requested');
  await openDS(page);assert.match(await page.locator('[data-cloud-pending]').innerText(),/u-job-2: 1 photo/);await closeDS(page);
  await editJob(page,{i:1,photos:[]});await waitState(page,'changes',15000);await click(page,'[data-cloud-copy]');await waitState(page,'verified');
 });
 await check('9. A record written by another installation: "Needs review", nothing overwritten, never adopted',async()=>{
  const j=(await cloud()).jobs['u-job-3'];
  await admin(db=>fb.updateDoc(fb.doc(db,BASEPATH+'/jobs/u-job-3'),{deviceId:'other-pc'}));
  await click(page,'[data-cloud-copy]');await waitState(page,'review');
  const after=(await cloud()).jobs['u-job-3'];assert.deepEqual([after.rev,after.deviceId],[j.rev,'other-pc'],'not overwritten, not adopted');
  await openDS(page);assert.match(await page.locator('[data-cloud-conflicts]').innerText(),/u-job-3.*another computer/);await closeDS(page);
  await admin(db=>fb.updateDoc(fb.doc(db,BASEPATH+'/jobs/u-job-3'),{deviceId:j.deviceId}));
  await click(page,'[data-cloud-copy]');await waitState(page,'verified');
 });
 await check('10. Company switch turned off: no copy starts',async()=>{
  await editJob(page,{i:2,name:'Edited while the company switch is off'});await waitState(page,'changes',15000);
  const m0=(await cloud()).marker.rev;await seedCompany(false);
  await click(page,'[data-cloud-copy]');await page.waitForTimeout(2000);
  assert.match(await page.locator('[data-cloud-note]').innerText(),/not enabled for this company/);assert.equal((await cloud()).marker.rev,m0);
  assert.equal(await cloudState(page),'changes');await closeDS(page);await seedCompany(true);
 });
 await check('11. Wiped browser (new device id): older records show "Needs review", never silently claimed',async()=>{
  const snap=await page.evaluate(async()=>{const b=await window.fiqBuildBackup();return {state:b.savedState,drawings:b.drawings.filter(d=>d.drawing),settings:b.settings.values}});
  const oldDevice=await page.evaluate(()=>localStorage.getItem('fiq_device_id_v1'));
  await page.close();await ctx.close();
  ctx=await newContext();page=await open(ctx);await seedStudio(page,{...snap,state:snap.state});await page.reload();
  await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor'&&window.fiqCloudCopy);await unlock(page);await page.waitForTimeout(800);
  await click(page,'[data-cloud-on]');await page.waitForTimeout(1500);
  const newDevice=await page.evaluate(()=>localStorage.getItem('fiq_device_id_v1'));assert.ok(newDevice&&newDevice!==oldDevice,'new device id');
  const c0=await cloud();
  // The old installation released its lock moments ago; a released lock stays visible for
  // 10 seconds (it cannot be deleted). A real second computer would see "Waiting" until then.
  for(let i=0;i<40;i++){let until=0;await admin(async db=>{const l=await fb.getDoc(fb.doc(db,BASEPATH+'/lease/studio'));until=l.exists()?l.data().expiresAt.toMillis():0});if(until<Date.now())break;await new Promise(r=>setTimeout(r,1000))}
  await click(page,'[data-cloud-copy]');
  await page.waitForFunction(()=>window.fiqCloudCopy&&!window.fiqCloudCopy.busy&&document.getElementById('fiqCloudStatus')&&document.getElementById('fiqCloudStatus').dataset.cloudState!=='copying'&&document.getElementById('fiqCloudStatus').dataset.cloudState!=='changes',null,{timeout:90000}).catch(()=>{});
  const dbg=await page.evaluate(()=>({state:window.fiqCloudCopy.state,attempt:JSON.parse(localStorage.getItem('fiq_cloud_last_attempt_v1')||'null')}));
  assert.equal(dbg.state,'review','state '+dbg.state+' attempt '+JSON.stringify(dbg.attempt&&{outcome:dbg.attempt.outcome,code:dbg.attempt.code,message:dbg.attempt.message,conflicts:(dbg.attempt.conflicts||[]).slice(0,3)}));
  const c1=await cloud();assert.ok(Object.values(c1.jobs).every(j=>j.deviceId===oldDevice),'records still belong to the old installation');
  assert.equal(c1.marker.rev,c0.marker.rev,'no marker');
  await closeDS(page);await page.close();await ctx.close();
 });
 await check('12. Copying 40 jobs and 80 drawings (100 KB each): no long freezes; Verified',async()=>{
  await t.clearFirestore();await seedCompany(true);
  ctx=await newContext();page=await open(ctx);
  const big=makeInput({jobs:40,seed:'big',drawingSize:100*1024});await seedStudio(page,big);await page.reload();
  await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor'&&window.fiqCloudCopy);await unlock(page);await page.waitForTimeout(800);
  await click(page,'[data-cloud-on]');await waitState(page,'changes',60000);
  await page.evaluate(()=>{window.__long=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__long.push(e.duration))).observe({type:'longtask',buffered:false})});
  const t0=Date.now();await click(page,'[data-cloud-copy]');await waitState(page,'verified',600000);const ms=Date.now()-t0;
  const long=await page.evaluate(()=>window.__long);const max=Math.max(0,...long);
  console.log('      (copy + check '+(ms/1000).toFixed(1)+' s; longest pause '+Math.round(max)+' ms; pauses over 50 ms: '+long.length+')');
  assert.ok(max<1000,'longest pause '+Math.round(max)+' ms');
  assert.deepEqual(page.__errors,[],'no page errors');
 });
 await browser.close();await t.cleanup();server.close();
 fs.writeFileSync(path.join(__dirname,'staging-studio-cloud-test-results.json'),JSON.stringify({ranAt:new Date().toISOString(),failed,results},null,1));
 console.log('\n'+(failed?failed+' FAILED':'All '+results.length+' staging Studio cloud copy tests passed'));process.exit(failed?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
