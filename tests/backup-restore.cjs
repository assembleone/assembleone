// Stage 2.0: restore from a full backup file, through the real Data safety dialog.
//  1. Full round trip: rich data (customers incl. same name, jobs, rooms, units, panels with
//     dots and copies, drawings, photos, saved Cutting List versions with piece QR, Mobile
//     piece states, deleted jobs + recycle bin, settings) -> Download full backup -> a wiped
//     browser (new profile) -> Restore -> identical saved data, drawings, settings and QR text.
//  2. Restoring over different data replaces it completely, and a copy of that data is
//     downloaded first.
//  3. Rejected, nothing changed: truncated file, not JSON, wrong kind, newer version, Beta vs
//     normal Studio, edited data (checksum), duplicate ids.
//  4. A failure half way puts the previous data back (nothing half restored).
//  5. An interrupted restore (tab closed half way) is finished on the next open, before Studio
//     writes anything.
//  6. An older version 1 backup (no settings) restores the data and keeps current settings.
//  7. A read-only tab cannot restore; the editor asks for persistent storage.
// Runs the real Studio loader with every network request blocked. STUDIO_URL=<live Studio.html>
// runs it against the published Beta (controlled test data in fresh test browsers only).
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 const url=process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}/Studio.html`;
 const errors=[];
 try{
 browser=await chromium.launch({headless:true});
 async function open(ctx){
  const page=await ctx.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/'),r=>r.abort());
  else await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
  await page.goto(url);
  await ready(page);
  return page;
 }
 async function ready(page){
  await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role!=='pending'&&!window.fiqEditor.restoring&&typeof window.a131StableSave==='function',null,{timeout:20000});
  await page.waitForTimeout(700);
  await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});
 }
 // Everything a restore must bring back, read straight from browser storage.
 const fingerprint=page=>page.evaluate(async()=>{
  const saved=JSON.parse(localStorage.getItem(STORE)||'null');
  const drawings=await new Promise(res=>{const q=indexedDB.open('assembleone_stable_v1');q.onsuccess=()=>{const d=q.result;if(!d.objectStoreNames.contains('drawings')){d.close();return res({})}const out={},cur=d.transaction('drawings').objectStore('drawings').openCursor();cur.onsuccess=()=>{const c=cur.result;if(c){out[c.key]=c.value;c.continue()}else{d.close();res(out)}}};q.onerror=()=>res({})});
  const settings={};['assembleone_material_library_v1','assembleone_notes_library_v1','assembleone_supplier_system','assembleone_sheet_settings','fiq_supplier_prices_v1','assembleone-checklist-J1'].forEach(k=>settings[k]=localStorage.getItem(k));
  const qr=[];(saved&&saved.projects||[]).forEach(pr=>(pr.cabinets||[]).forEach(c=>(c.parts||[]).forEach(p=>{for(let i=1;i<=Math.max(1,Number(p.qty)||1);i++)qr.push(window.fiqPieceQrText(pr,c,p,i))})));
  return {saved,drawings,settings,qr};
 });
 const openDialog=async page=>{await page.locator('#fiqSaveChip').click();await page.locator('.fiq-safety-dialog [data-safety-restore]').waitFor()};
 const closeDialog=async page=>{const c=page.locator('.fiq-safety-dialog [data-safety-close]');if(await c.count())await c.click()};
 async function download(page){
  await openDialog(page);
  const [dl]=await Promise.all([page.waitForEvent('download'),page.locator('.fiq-safety-dialog [data-safety-backup]').click()]);
  const text=fs.readFileSync(await dl.path(),'utf8');await closeDialog(page);return text;
 }
 async function chooseFile(page,text,name){
  await openDialog(page);
  await page.locator('.fiq-safety-dialog [data-safety-restore-file]').setInputFiles({name:name||'backup.json',mimeType:'application/json',buffer:Buffer.from(text,'utf8')});
  await page.locator('.fiq-safety-dialog [data-restore-ready],.fiq-safety-dialog [data-restore-rejected]').first().waitFor();
 }
 async function restore(page,text){
  await chooseFile(page,text);
  assert.equal(await page.locator('.fiq-safety-dialog [data-restore-ready]').count(),1,'backup accepted: '+await page.locator('.fiq-safety-dialog [data-safety-out]').innerText());
  const [before]=await Promise.all([page.waitForEvent('download'),page.waitForEvent('load'),page.locator('.fiq-safety-dialog [data-restore-confirm]').click()]);
  await ready(page);
  return fs.readFileSync(await before.path(),'utf8');
 }

 // ---- Source browser with rich data ----
 const ctxA=await browser.newContext();
 const A=await open(ctxA);
 await A.evaluate(async()=>{
  const st=(0,eval)('state');
  const png='data:image/png;base64,'+btoa('fake-png-'+'x'.repeat(4000));
  const svg=n=>'data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><text>'+n+'</text></svg>');
  st.customers.push({id:'cA',name:'Anna Berg',address:'Street 1',phone:'111',createdAt:1,updatedAt:1},{id:'cS1',name:'John Smith',address:'Palma 1',createdAt:1,updatedAt:1},{id:'cS2',name:'John Smith',address:'Soller 9',createdAt:1,updatedAt:1});
  const part=(id,code,qty,extra)=>Object.assign({id,code,name:'Side',length:700,width:500,thickness:18,qty,material:'White',edgeLong:1,edgeShort:0,notes:'',status:'ready',x:20,y:30,copies:qty>1?[{x:60,y:30}]:[]},extra||{});
  st.projects.push(
   {id:'J1',name:'Anna kitchen',customer:'Anna Berg',customerId:'cA',rooms:[{id:'r1',name:'Kitchen'},{id:'r2',name:'Pantry'}],
    cabinets:[{id:'u1',roomId:'r1',name:'Tall unit',drawing:svg('u1'),drawingType:'image',parts:[part('p1','P-001',2,{pieceStates:{1:{status:'fitted',statusAt:5}},scannedQty:1}),part('p2','P-002',1,{status:'damaged',damagedQty:1})],deletedPartIds:['pOld']},
              {id:'u2',roomId:'r2',name:'Shelf',drawing:svg('u2'),drawingType:'image',parts:[part('p3','P-001',3)]}],
    sentCuttingLists:{'room:r1':[{sentAt:1,panels:[{panelId:'p1',panelNumber:'P-001',pieces:[{piece:1,qr:'#panel=J1:u1:p1:-1'}]}]},{sentAt:2,panels:[{panelId:'p1',panelNumber:'P-001',length:710}]}]},
    jobLog:[{id:'log1',text:'Site note',photos:[png],roomId:'r1',at:3}],siteNotes:'Whole site note',sitePhotos:[png],updatedAt:10},
   {id:'J2',name:'Palma wardrobe',customer:'John Smith',customerId:'cS1',rooms:[],cabinets:[{id:'u3',name:'Wardrobe',parts:[part('p4','P-001',1)]}],updatedAt:11},
   {id:'J3',name:'Soller kitchen',customer:'John Smith',customerId:'cS2',rooms:[],cabinets:[],updatedAt:12});
  st.deletedProjectIds=[...(st.deletedProjectIds||[]),'Jgone'];
  st.deletedProjects=[{deletedAt:13,project:{id:'Jgone',name:'Deleted job',cabinets:[]}}];
  localStorage.setItem('fiq_supplier_prices_v1',JSON.stringify({White:{sheet:42}}));
  localStorage.setItem('assembleone_material_library_v1',JSON.stringify(['White','Oak']));
  localStorage.setItem('assembleone_sheet_settings',JSON.stringify({White:{w:2800,h:2070}}));
  localStorage.setItem('assembleone_supplier_system','ardis');
  localStorage.setItem('assembleone-checklist-J1',JSON.stringify([true,true,false,false,false,false]));
  localStorage.setItem('fiq_studio_media_url_cache_v1','{"not":"a setting"}');
  await window.a131StableSave(false);
 });
 // Load it once, as Studio fills in its default fields on load.
 await A.reload();await ready(A);await A.evaluate(()=>window.a131StableSave(false));
 const source=await fingerprint(A);
 assert.ok(source.saved.projects.some(p=>p.id==='J1')&&Object.keys(source.drawings).length===2,'source seeded');
 const backupText=await download(A);
 const backup=JSON.parse(backupText);
 assert.equal(backup.backupVersion,2);
 assert.equal(backup.settings.values.fiq_supplier_prices_v1,source.settings.fiq_supplier_prices_v1,'settings in the backup');
 assert.ok(!('fiq_studio_media_url_cache_v1' in backup.settings.values),'caches are not settings');
 // 7a. The editor asked for persistent storage.
 assert.equal(await A.evaluate(()=>window.fiqEditor.persistRequested===true||window.fiqEditor.persistent===true),true,'persistent storage requested');
 await openDialog(A);assert.equal(await A.locator('.fiq-safety-dialog [data-safety-persist]').count(),1);await closeDialog(A);

 // ---- 1. Wiped browser: restore -> identical ----
 const ctxB=await browser.newContext();
 const B=await open(ctxB);
 assert.equal(await B.evaluate(()=>(JSON.parse(localStorage.getItem(STORE)||'{"projects":[]}').projects||[]).some(p=>p.id==='J1')),false,'new browser is empty');
 await restore(B,backupText);
 await B.locator('.fiq-safety-dialog [data-restore-done]').waitFor();
 const restored=await fingerprint(B);
 assert.deepEqual(restored.saved,source.saved,'saved data identical (customers, jobs, rooms, units, panels, dots, photos, Cutting List versions, piece states, deleted jobs)');
 assert.deepEqual(restored.drawings,source.drawings,'drawings identical');
 assert.deepEqual(restored.settings,source.settings,'settings identical');
 assert.deepEqual(restored.qr,source.qr,'QR / piece identities identical');
 assert.equal(await B.evaluate(()=>state.customers.filter(c=>c.name==='John Smith').length),2,'both same-name customers restored');
 assert.equal(await B.evaluate(()=>state.projects.find(p=>p.id==='J1').cabinets[0].drawing&&state.projects.find(p=>p.id==='J1').cabinets[0].drawing.startsWith('data:image/svg')),true,'drawing shown again');
 // Survives a further reload unchanged.
 await closeDialog(B);await B.reload();await ready(B);
 assert.deepEqual((await fingerprint(B)).saved,source.saved,'unchanged after another reload');
 console.log('ok   1. backup -> wiped browser -> restore -> identical');

 // ---- 2. Restoring over different data replaces it; a copy is downloaded first ----
 await A.evaluate(async()=>{state.projects.push({id:'Jnew',name:'Made after the backup',customer:'Anna Berg',customerId:'cA',rooms:[],cabinets:[],updatedAt:20});localStorage.setItem('fiq_supplier_prices_v1','{"changed":1}');await window.a131StableSave(false)});
 const beforeText=await restore(A,backupText);
 const beforeCopy=JSON.parse(beforeText);
 assert.ok(beforeCopy.savedState.projects.some(p=>p.id==='Jnew'),'the data being replaced was downloaded first');
 const afterA=await fingerprint(A);
 assert.deepEqual(afterA.saved,source.saved,'replaced completely by the backup');
 assert.deepEqual(afterA.settings,source.settings);
 await closeDialog(A);
 console.log('ok   2. restore over different data replaces it, copy downloaded first');

 // ---- 3. Rejected files change nothing ----
 const baseline=await fingerprint(B);
 const edited=JSON.parse(backupText);edited.savedState.projects[0].name='Tampered';
 const dupIds=JSON.parse(backupText);dupIds.savedState.projects.push(dupIds.savedState.projects[0]);
 const cases=[
  ['truncated',backupText.slice(0,Math.floor(backupText.length*0.6)),/damaged or incomplete/],
  ['not json','hello',/damaged or incomplete/],
  ['wrong kind',JSON.stringify({kind:'something-else'}),/not a FittersIQ Studio full backup/],
  ['newer version',JSON.stringify({...backup,backupVersion:9}),/newer version/],
  backup.beta?['normal backup in Beta Studio',JSON.stringify({...backup,beta:false}),/from the normal Studio/]:['beta backup in normal Studio',JSON.stringify({...backup,beta:true}),/from Beta Studio/],
  ['edited data',JSON.stringify(edited),/checksum/],
  ['duplicate job ids',JSON.stringify({...dupIds,savedStateSha256:''}),/checksum|twice/],
  ['empty backup',JSON.stringify({...backup,savedState:{projects:[],customers:[]},savedStateSha256:''}),/no customers and no jobs|checksum/]];
 for(const [label,text,re] of cases){
  await chooseFile(B,text,label+'.json');
  const box=B.locator('.fiq-safety-dialog [data-restore-rejected]');
  assert.equal(await box.count(),1,label+' rejected');
  assert.match(await box.innerText(),re,label+' explained');
  assert.match(await box.innerText(),/Nothing was changed/);
  await closeDialog(B);
 }
 assert.deepEqual(await fingerprint(B),baseline,'rejected files changed nothing');
 console.log('ok   3. corrupt, truncated, wrong format/version rejected; nothing changed');

 // ---- 4. Failure half way: previous data put back ----
 const ctxC=await browser.newContext();
 const C=await open(ctxC);
 await C.evaluate(async()=>{state.projects.push({id:'Jc',name:'Only in C',customer:'Carl',rooms:[],cabinets:[{id:'uc',name:'U',drawing:'data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>'),drawingType:'image',parts:[]}],updatedAt:1});ensureCustomerForProject(state.projects.at(-1));localStorage.setItem('fiq_supplier_prices_v1','{"c":1}');await window.a131StableSave(false)});
 await C.reload();await ready(C);await C.evaluate(()=>window.a131StableSave(false));
 const cBefore=await fingerprint(C);
 await C.evaluate(()=>{window.__fiqRestoreHook=async(stage,target)=>{if(stage==='after-idb'&&target==='incoming')throw new Error('simulated failure')}});
 await chooseFile(C,backupText);
 const [cCopy]=await Promise.all([C.waitForEvent('download'),C.locator('.fiq-safety-dialog [data-restore-confirm]').click()]);
 await C.locator('.fiq-safety-dialog [data-restore-failed]').waitFor();
 assert.match(await C.locator('.fiq-safety-dialog [data-restore-failed]').innerText(),/previous data was kept/);
 assert.deepEqual(await fingerprint(C),cBefore,'previous data, drawings and settings back exactly');
 assert.equal(await C.evaluate(()=>window.fiqEditor.canWrite()),true,'the tab edits again');
 assert.equal(await C.evaluate(()=>localStorage.getItem('fiq_restore_pending_v1')),null,'no restore left pending');
 await C.evaluate(()=>{delete window.__fiqRestoreHook});
 await closeDialog(C);await C.reload();await ready(C);
 assert.deepEqual((await fingerprint(C)).saved,cBefore.saved,'still the previous data after reload');
 console.log('ok   4. failure half way puts the previous data back');

 // ---- 5. Interrupted (tab closed half way): finished on the next open ----
 for(const stage of ['before-apply','after-idb','after-storage']){
  const ctx=await browser.newContext();
  const D=await open(ctx);
  await D.evaluate(async()=>{state.projects.push({id:'Jd',name:'Only in D',customer:'Dora',rooms:[],cabinets:[],updatedAt:1});ensureCustomerForProject(state.projects.at(-1));await window.a131StableSave(false)});
  await D.evaluate(s=>{window.__fiqRestoreHook=async stage=>{if(stage===s)await new Promise(()=>{})}},stage);
  await chooseFile(D,backupText);
  await Promise.all([D.waitForEvent('download'),D.locator('.fiq-safety-dialog [data-restore-confirm]').click()]);
  await D.waitForFunction(()=>window.fiqEditor.restoring===true);
  await D.waitForTimeout(300);
  await D.close();// the tab is closed half way
  const E=await open(ctx);// the next open finishes the restore, then reloads itself
  const fe=await fingerprint(E);
  assert.deepEqual(fe.saved,source.saved,'interrupted at '+stage+': restore finished on next open');
  assert.deepEqual(fe.drawings,source.drawings,'interrupted at '+stage+': drawings');
  assert.deepEqual(fe.settings,source.settings,'interrupted at '+stage+': settings');
  assert.equal(await E.evaluate(()=>localStorage.getItem('fiq_restore_pending_v1')),null);
  await ctx.close();
 }
 console.log('ok   5. interrupted restore is finished on the next open');

 // ---- 6. Version 1 backup (no settings): data restored, current settings kept ----
 const v1=JSON.parse(backupText);v1.backupVersion=1;delete v1.settings;
 const ctxF=await browser.newContext();
 const F=await open(ctxF);
 await F.evaluate(()=>localStorage.setItem('fiq_supplier_prices_v1','{"mine":1}'));
 await chooseFile(F,JSON.stringify(v1));
 assert.match(await F.locator('.fiq-safety-dialog [data-restore-ready]').innerText(),/no settings/);
 await closeDialog(F);
 await restore(F,JSON.stringify(v1));
 const ff=await fingerprint(F);
 assert.deepEqual(ff.saved,source.saved,'v1 data restored');
 assert.equal(ff.settings.fiq_supplier_prices_v1,'{"mine":1}','v1 keeps current settings');
 console.log('ok   6. version 1 backup restores data and keeps current settings');

 // ---- 7b. A read-only tab cannot restore ----
 const R=await open(ctxF);
 assert.equal(await R.evaluate(()=>window.fiqEditor.role),'readonly');
 await R.locator('#fiqSaveChip').click();
 assert.equal(await R.locator('.fiq-safety-dialog [data-safety-restore]').isDisabled(),true,'restore disabled in a read-only tab');
 console.log('ok   7. read-only tab cannot restore; editor requests persistent storage');

 assert.deepEqual(errors,[],'no page errors');
 console.log('\nbackup-restore: all checks passed');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
