// Stage 1 data safety. Several Studio tabs in ONE browser (one Playwright context shares
// Web Locks and storage like real tabs), real clicks and typing:
//  - the first tab is the editor; a reload keeps it the editor (no false read-only);
//  - "Saving…" then "✓ Saved on this computer" only after the data really is stored;
//  - a second tab is read-only: banner, chip, clicks and typing do nothing, its saves
//    return false, its autosave and its close (beforeunload) never write, even with
//    stale/changed data in memory; the editor keeps saving normally meanwhile;
//  - when the editor closes, a waiting tab reloads itself and becomes the editor with the
//    latest saved data;
//  - a failed browser write (storage full) shows "⚠ Not saved" and never "✓ Saved";
//    after the problem goes away the next save shows "✓ Saved" again;
//  - Data safety dialog: complete backup (saved data, drawings, fallback copy, customers,
//    saved Cutting List versions) and Data Doctor report; both change nothing stored and
//    also work in a read-only tab;
//  - a write by an older Studio tab (no protection) is reported to the editor.
// Runs the real public Studio loader with every network request blocked.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:1366,height:900},acceptDownloads:true});
 const url=process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`;
 if(process.env.STUDIO_URL)await ctx.route(u=>!String(u).startsWith('https://assembleone.github.io/'),r=>r.abort());
 else await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 const errors=[];
 const open=async()=>{const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());await p.goto(url);
  await p.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role!=='pending'&&typeof window.a131StableSave==='function',null,{timeout:15000});
  await p.waitForTimeout(700);await p.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});return p};
 const role=p=>p.evaluate(()=>window.fiqEditor.role);
 const chip=p=>p.evaluate(()=>{const c=document.getElementById('fiqSaveChip');return c?c.innerText.replace(/\s+/g,' ').trim():''});
 const stored=p=>p.evaluate(()=>localStorage.getItem(STORE));
 const storedJob=async p=>{const s=JSON.parse(await stored(p));return s.projects.find(x=>x.id==='sj')};
 const waitRole=async(p,want,ms=15000)=>{const end=Date.now()+ms;while(Date.now()<end){try{if(await role(p)===want)return}catch(e){}await new Promise(r=>setTimeout(r,200))}throw new Error('role never became '+want)};
 const typeLength=async(p,v)=>{await p.evaluate(()=>{switchToProject('sj','su','sp1');renderAll();show('mark')});await p.waitForTimeout(300);
  await p.locator('#fLength').scrollIntoViewIfNeeded();await p.click('#fLength');await p.keyboard.press('Control+A');await p.keyboard.type(v);await p.waitForTimeout(700)};

 // Editor tab with a job (drawing, customer, saved Cutting List version, a panel).
 const A=await open();
 assert.equal(await role(A),'editor');
 await A.evaluate(async()=>{
  const st=(0,eval)('state');
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#def"/></svg>');
  st.projects.push({id:'sj',name:'Safety job',customer:'Sam Safe',rooms:[{id:'sr',name:'Kitchen'}],cabinets:[{id:'su',roomId:'sr',name:'Kitchen unit',drawing,drawingType:'image',parts:[
   {id:'sp1',code:'P-001',name:'Side',length:700,width:500,thickness:18,qty:2,material:'White melamine',edgeLong:1,edgeShort:0,notes:'',status:'ready',x:20,y:20,copies:[]}]}],
   sentCuttingLists:{'room:sr':[{version:1,sentAt:'2026-09-27T10:00:00.000Z',panels:[{panelNumber:'P-001',length:700}]}]},jobLog:[],updatedAt:Date.now()});
  // Data Doctor fixtures: a unit linked to a room that no longer exists, and a duplicated panel id.
  st.projects.push({id:'dj',name:'Doctor job',customer:'Nobody',rooms:[],cabinets:[{id:'du',roomId:'gone-room',name:'U',parts:[
   {id:'dup',code:'P-001',name:'A',length:1,width:1,thickness:18,qty:1,material:'X',edgeLong:0,edgeShort:0,notes:'',status:'ready',x:1,y:1,copies:[]},
   {id:'dup',code:'P-002',name:'B',length:1,width:1,thickness:18,qty:1,material:'X',edgeLong:0,edgeShort:0,notes:'',status:'ready',x:2,y:2,copies:[]}]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.find(p=>p.id==='sj'));
  await window.a131StableSave(false);
 });
 // A reload keeps the editor (its own previous page releases the lock).
 await A.reload();await A.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role!=='pending',null,{timeout:15000});await A.waitForTimeout(700);
 assert.equal(await role(A),'editor','reload stays the editor');
 await A.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});
 assert.equal(await chip(A),'✓ Saved on this computer');

 // Truthful status on a real edit.
 await A.evaluate(()=>{window.fiqEditor.statusLog.length=0});
 await typeLength(A,'710');
 assert.equal((await storedJob(A)).cabinets[0].parts[0].length,710,'edit stored');
 const log=await A.evaluate(()=>window.fiqEditor.statusLog.slice());
 assert.ok(log.includes('saving')&&log.at(-1)==='saved','Saving… then Saved: '+log);
 assert.equal(await chip(A),'✓ Saved on this computer');

 // A second tab: read-only.
 const B=await open();
 assert.equal(await role(B),'readonly');
 assert.equal(await chip(B),'🔒 Read-only tab');
 assert.match(await B.locator('#fiqReadonlyBanner').innerText(),/Read-only — FittersIQ Studio is already open for editing in another tab/);
 const before=await stored(A);
 // Real clicks and typing do nothing.
 const jobsBefore=await B.evaluate(()=>state.projects.length);
 await B.evaluate(()=>{switchToProject('sj','su','sp1');renderAll();show('mark')});await B.waitForTimeout(300);
 await B.locator('#fLength').click({force:true});await B.keyboard.type('999');await B.waitForTimeout(400);
 assert.notEqual(await B.evaluate(()=>document.getElementById('fLength').value),'710999','typing ignored');
 assert.equal(await B.evaluate(()=>state.projects.length),jobsBefore);
 // Its saves do not write, even with changed data in memory, and its autosave stays quiet.
 assert.equal(await B.evaluate(async()=>{(0,eval)('state').projects.find(p=>p.id==='sj').name='STALE TAB';return await window.a131StableSave(false)}),false);
 assert.equal(await B.evaluate(()=>save()),false);
 await B.waitForTimeout(4600);
 assert.equal(await stored(A),before,'read-only tab never wrote');
 // The editor keeps saving normally while the read-only tab is open.
 await typeLength(A,'720');
 assert.equal((await storedJob(A)).cabinets[0].parts[0].length,720);
 const afterEdit=await stored(A);
 // Closing the read-only tab (with its stale data) writes nothing.
 await B.close({runBeforeUnload:true});await A.waitForTimeout(500);
 assert.equal(await stored(A),afterEdit,'closing the read-only tab wrote nothing');
 assert.equal((await storedJob(A)).name,'Safety job');

 // Editor closes: the waiting tab reloads itself and becomes the editor with the latest data.
 const C=await open();
 assert.equal(await role(C),'readonly');
 await A.close({runBeforeUnload:true});
 await waitRole(C,'editor');
 await C.waitForTimeout(900);
 await C.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});
 assert.equal(await C.evaluate(()=>state.projects.find(p=>p.id==='sj').cabinets[0].parts[0].length),720,'new editor has the latest data');
 assert.equal(await C.locator('#fiqReadonlyBanner').count(),0);

 // Storage full: "⚠ Not saved", never "✓ Saved"; recovers when space is back.
 await C.evaluate(()=>{const orig=Storage.prototype.setItem;window.__origSetItem=orig;Storage.prototype.setItem=function(k,v){if(String(k).endsWith(STORE)){const e=new Error('The quota has been exceeded.');e.name='QuotaExceededError';throw e}return orig.call(this,k,v)};window.fiqEditor.statusLog.length=0});
 await typeLength(C,'730');
 await C.waitForTimeout(600);
 assert.equal(await C.evaluate(()=>window.fiqEditor.status),'failed');
 assert.equal(await chip(C),'⚠ Not saved');
 assert.match(await C.locator('#fiqSaveChip').getAttribute('title'),/Browser storage is full/);
 const flog=await C.evaluate(()=>window.fiqEditor.statusLog.slice());assert.ok(!flog.slice(flog.indexOf('failed')).includes('saved'),'never claimed Saved while failing: '+flog);
 assert.equal((await storedJob(C)).cabinets[0].parts[0].length,720,'nothing was stored');
 await C.waitForTimeout(4500);// the 4 s autosave retries and still fails
 assert.equal(await chip(C),'⚠ Not saved');
 await C.evaluate(()=>{Storage.prototype.setItem=window.__origSetItem});
 await typeLength(C,'735');
 assert.equal(await chip(C),'✓ Saved on this computer');
 assert.equal((await storedJob(C)).cabinets[0].parts[0].length,735);

 // Backup and Data Doctor change nothing stored.
 const idbSavedAt=p=>p.evaluate(()=>new Promise(res=>{const q=indexedDB.open('assembleone_stable_v1');q.onsuccess=()=>{const r=q.result.transaction('project_state').objectStore('project_state').get('active');r.onsuccess=()=>{res(r.result&&r.result.savedAt);q.result.close()}}}));
 const snap=async p=>[await stored(p),await idbSavedAt(p)];
 const s0=await snap(C);
 await C.locator('#fiqSaveChip').click();
 await C.locator('.fiq-safety-dialog [data-safety-backup]').waitFor();
 const [dl]=await Promise.all([C.waitForEvent('download'),C.locator('.fiq-safety-dialog [data-safety-backup]').click()]);
 assert.match(dl.suggestedFilename(),/^FittersIQ-(Beta-)?backup-\d{4}-\d{2}-\d{2}-\d{4}\.json$/);
 const backup=JSON.parse(fs.readFileSync(await dl.path(),'utf8'));
 assert.equal(backup.kind,'fittersiq-studio-backup');
 const bj=backup.savedState.projects.find(p=>p.id==='sj');
 assert.equal(bj.cabinets[0].parts[0].length,735,'backup has the latest saved data');
 assert.deepEqual(bj.sentCuttingLists['room:sr'][0].panels,[{panelNumber:'P-001',length:700}],'saved Cutting List versions included as they are');
 assert.ok(backup.savedState.customers.some(c=>c.id===bj.customerId),'customer included');
 const d=backup.drawings.find(x=>x.key==='sj:su');assert.ok(d&&d.drawing.startsWith('data:image/svg+xml'),'drawing included');
 assert.ok(backup.fallbackCopy&&backup.fallbackCopy.state.projects.some(p=>p.id==='sj'),'fallback copy included');
 assert.equal(backup.savedStateSha256.length,64);
 await C.locator('.fiq-safety-dialog [data-backup-done]').waitFor();
 // Data Doctor.
 await C.locator('.fiq-safety-dialog [data-safety-doctor]').click();
 await C.locator('.fiq-safety-dialog [data-doctor]').waitFor();
 const doc=await C.evaluate(()=>window.fiqEditor.lastDoctor);
 assert.equal(doc.counts.jobs>=2,true);
 assert.ok(doc.checks.some(c=>/Duplicate panel ids/.test(c.text)&&c.items.includes('dup')),'duplicate panel id found');
 assert.ok(doc.checks.some(c=>/Units linked to a room that no longer exists in Doctor job/.test(c.text)&&c.items.includes('U')),'unit with a missing room found');
 assert.equal(doc.drawings.missing.length,0);
 assert.match(await C.locator('.fiq-safety-dialog [data-doctor]').innerText(),/Saved Studio data[\s\S]*Customers[\s\S]*Checks/);
 assert.deepEqual(await snap(C),s0,'backup and Data Doctor changed nothing stored');
 await C.locator('.fiq-safety-dialog [data-safety-close]').click();

 // A read-only tab can make a backup too, and a write by an older unprotected tab is reported.
 const D=await open();
 assert.equal(await role(D),'readonly');
 await D.locator('#fiqSaveChip').click();
 const [dl2]=await Promise.all([D.waitForEvent('download'),D.locator('.fiq-safety-dialog [data-safety-backup]').click()]);
 assert.equal(JSON.parse(fs.readFileSync(await dl2.path(),'utf8')).savedState.projects.find(p=>p.id==='sj').cabinets[0].parts[0].length,735);
 assert.deepEqual(await snap(C),s0);
 await D.evaluate(()=>{const s=JSON.parse(localStorage.getItem(STORE));s.projects.find(p=>p.id==='sj').name='Written by an old tab';Storage.prototype.setItem.call(localStorage,STORE,JSON.stringify(s))});// what an unprotected old tab does
 await C.waitForTimeout(400);
 assert.equal(await C.evaluate(()=>window.fiqEditor.status),'external');
 assert.equal(await chip(C),'⚠ Another tab saved');

 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
