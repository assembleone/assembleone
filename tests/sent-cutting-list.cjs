// A Cutting List belongs to one job. One customer ("Good") with two jobs: Wardrobe 1 and
// Kitchen. Real clicks: Send to Job Overview at the end of each Cutting List, the Customer
// Card job rows, their 📋 Cutting List buttons and the job page entries.
//  - the button reads "Send to Job Overview" and saves that job's exact Cutting List
//    (panel number, part name, sizes, thickness, quantity, material, edging, notes, unit,
//    room, sent date/time) as version 1 in that job's own record;
//  - each job's 📋 opens only its own list; the customer-level Cutting List tab is gone;
//  - the row opens the job page: Overview / Drawing / Cutting List / Panel Check / Site
//    Measure / Notes;
//  - editing Wardrobe 1 in Drawing, opening Drawing, Panel Check and a Mobile update never
//    change any saved list, and never touch the Kitchen list; the Wardrobe shows "Changes
//    since last sent Cutting List";
//  - Send again with no change: no new version; after a real change: version 2 is shown,
//    version 1 under "Previous versions (1)" with its original values;
//  - the saved lists survive a reload and are not part of the job copy sent to Mobile.
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
 const ctx=await browser.newContext({viewport:{width:1366,height:900}});
 const page=await ctx.newPage();
 const errors=[],dialogs=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>{dialogs.push(d.message());d.accept()});
 if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/'),r=>r.abort());
 else await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 const url=process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`;
 const S=(fn,a)=>page.evaluate(fn,a);
 const load=async()=>{await page.goto(url);await page.waitForFunction(()=>typeof window.fiqOpenJobPage==='function'&&typeof window.fiqRecordSentCuttingList==='function');await page.waitForTimeout(900);
  await S(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'})};
 await load();
 await S(()=>{
  const st=(0,eval)('state');
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const mk=(id,code,name,l,w,th,qty,mat,eL,eS,notes)=>({id,code,name,length:l,width:w,thickness:th,qty,material:mat,edgeLong:eL,edgeShort:eS,notes:notes||'',status:'ready',x:20,y:20,copies:[]});
  st.projects.push({id:'jw',name:'Wardrobe 1',customer:'Good',rooms:[{id:'rw',name:'Wardrobe 1'}],cabinets:[{id:'uw',roomId:'rw',name:'Wardrobe 1 design',drawing,drawingType:'image',parts:[
    mk('w1','P-001','Side',2000,580,18,2,'White melamine',1,0,'Grain up'),mk('w2','P-002','Shelf',764,560,18,4,'White melamine',1,0)]}],jobLog:[],updatedAt:Date.now()});
  st.projects.push({id:'jk',name:'Kitchen',customer:'Good',rooms:[{id:'rk',name:'Kitchen'}],cabinets:[{id:'uk',roomId:'rk',name:'Kitchen design',drawing,drawingType:'image',parts:[
    mk('k1','P-001','Base side',720,560,18,2,'Grey MFC',0,1),mk('k2','P-002','Plinth',1200,150,18,1,'Grey MFC',1,0)]}],jobLog:[],updatedAt:Date.now()});
  st.projects.slice(-2).forEach(p=>{ensureCustomerForProject(p);p.cabinets.forEach(c=>c.parts.forEach(pt=>pt.reviewSignature=window.panelReviewSignature(pt)))});
  save();renderAll();
 });
 const ids=await S(()=>(0,eval)('state').projects.filter(p=>p.id==='jw'||p.id==='jk').map(p=>p.customerId));
 assert.ok(ids[0]&&ids[0]===ids[1],'one customer, two jobs');
 const customerId=ids[0];
 const saved=()=>S(()=>Object.fromEntries((0,eval)('state').projects.filter(p=>p.id==='jw'||p.id==='jk').map(p=>[p.id,JSON.stringify(p.sentCuttingLists||null)])));
 const versions=(pid,key)=>S(([pid,key])=>((0,eval)('state').projects.find(p=>p.id===pid).sentCuttingLists||{})[key]||[],[pid,key]);
 // Send to Job Overview from the job's Cutting List, by a real click.
 const send=async(pid,cid)=>{
  await S(([pid,cid])=>{switchToProject(pid,cid);renderAll();show('cutting');renderAll()},[pid,cid]);await page.waitForTimeout(300);
  const btn=page.locator('#panelCheckReturnBtn');assert.equal((await btn.innerText()).trim(),'Send to Job Overview');
  await btn.click();await page.waitForTimeout(500);
 };
 const card=async()=>{await S(id=>{openCustomerCard(id)},customerId);await page.waitForTimeout(400)};
 const dialogText=()=>S(()=>{const d=document.querySelector('.fiq-job-dialog');return d?d.innerText.replace(/\s+/g,' ').trim():''});
 const dialogRows=()=>S(()=>[...document.querySelectorAll('.fiq-job-dialog .fiq-sent-latest tr[data-sent-panel]')].map(tr=>[...tr.children].slice(0,-1).map(td=>td.innerText.trim()).join(' | ').trim()));
 const closeDialog=async()=>{await page.locator('.fiq-job-dialog [data-job-close]').first().click();await page.waitForTimeout(200)};
 const openSent=async name=>{await card();const row=page.locator('.customer-tab-row-wrap',{has:page.locator('strong',{hasText:name})});await row.locator('[data-open-cutting-list]').click();await page.waitForTimeout(300)};

 // Before anything was sent: the job says so, no reconstructed list.
 await openSent('Wardrobe 1');
 assert.match(await dialogText(),/No Cutting List has been sent for this job yet/);
 assert.equal((await dialogRows()).length,0);
 await closeDialog();

 // 1. Send both jobs.
 await send('jw','uw');
 assert.equal(await S(()=>state.screen),'jobs','back on Job Overview');
 await send('jk','uk');
 let vw=await versions('jw','room:rw'),vk=await versions('jk','room:rk');
 assert.deepEqual([vw.length,vk.length],[1,1]);
 assert.deepEqual(vw[0].panels.map(r=>r.pieces.length),[2,4],"each physical piece has its QR saved");
 assert.deepEqual(vw[0].panels.map(({pieces,...r})=>r),[
  {panelId:'w1',panelNumber:'P-001',partName:'Side',length:2000,width:580,thickness:18,quantity:2,material:'White melamine',edgeLong:1,edgeShort:0,notes:'Grain up',unit:'Wardrobe 1 design',room:'Wardrobe 1'},
  {panelId:'w2',panelNumber:'P-002',partName:'Shelf',length:764,width:560,thickness:18,quantity:4,material:'White melamine',edgeLong:1,edgeShort:0,notes:'',unit:'Wardrobe 1 design',room:'Wardrobe 1'}],'exact manufacturing data of Wardrobe 1');
 assert.deepEqual(vk[0].panels.map(r=>[r.panelNumber,r.partName,r.material,r.edgeLong,r.edgeShort]),[['P-001','Base side','Grey MFC',0,1],['P-002','Plinth','Grey MFC',1,0]],'Kitchen has its own');
 assert.ok(!Number.isNaN(Date.parse(vw[0].sentAt))&&vw[0].version===1&&vw[0].totals.pieces===6);

 // 2. Customer Card: no customer-level Cutting List tab; each 📋 opens only its own job.
 await card();
 assert.deepEqual(await S(()=>[...document.querySelectorAll('.customer-card-tabs .customer-tab')].map(b=>(b.dataset.tab||'extra')+':'+b.innerText.trim())),['jobs:Jobs / Cutting Lists','site:Site Measurements','photos:Photos','documents:Documents'],'no customer-level Cutting List tab; the jobs tab is named Jobs / Cutting Lists');
 await openSent('Wardrobe 1');
 assert.deepEqual(await dialogRows(),['P-001 | Side | 2000 × 580 × 18 | 2 | White melamine | 1 long · 0 short | Grain up','P-002 | Shelf | 764 × 560 × 18 | 4 | White melamine | 1 long · 0 short |']);
 let txt=await dialogText();
 assert.match(txt,/^Cutting List — Wardrobe 1 .*Sent .* · Version 1 · 2 panels, 6 pieces/);
 assert.doesNotMatch(txt,/Plinth|Base side|Grey MFC/,'nothing from the Kitchen');
 assert.doesNotMatch(txt,/Previous versions|Changes since/);
 await closeDialog();
 await openSent('Kitchen');
 assert.deepEqual(await dialogRows(),['P-001 | Base side | 720 × 560 × 18 | 2 | Grey MFC | 0 long · 1 short |','P-002 | Plinth | 1200 × 150 × 18 | 1 | Grey MFC | 1 long · 0 short |']);
 assert.doesNotMatch(await dialogText(),/Shelf|White melamine/,'nothing from the Wardrobe');
 await closeDialog();

 // 3. The job row opens the job page with its six entries; Cutting List there is the same.
 await card();
 await page.locator('.customer-tab-row[data-open-job-design-project="jk"]').click();await page.waitForTimeout(300);
 assert.deepEqual(await S(()=>[...document.querySelectorAll('.fiq-job-dialog [data-job-go]')].map(b=>b.innerText.trim())),['Overview','Drawing','Cutting List','Panel Check','Site Measure','Notes','📷 Job Evidence (0)']);
 await page.locator('.fiq-job-dialog [data-job-go="cutting"]').click();await page.waitForTimeout(200);
 assert.equal((await dialogRows()).length,2);assert.match(await dialogText(),/Cutting List — Kitchen/);
 await page.locator('.fiq-job-dialog [data-job-back]').click();await page.waitForTimeout(200);
 // Drawing entry opens the Kitchen drawing; opening it changes nothing saved.
 const before=await saved();
 await page.locator('.fiq-job-dialog [data-job-go="drawing"]').click();await page.waitForTimeout(400);
 assert.deepEqual(await S(()=>[state.screen,state.currentProject,state.currentCabinet]),['mark','jk','uk']);
 await card();await page.locator('.customer-tab-row[data-open-job-design-project="jk"]').click();await page.waitForTimeout(300);
 await page.locator('.fiq-job-dialog [data-job-go="panelcheck"]').click();await page.waitForTimeout(400);
 assert.deepEqual(await S(()=>[state.screen,state.currentProject,state.currentCabinet]),['parts','jk','uk']);
 await card();await page.locator('.customer-tab-row[data-open-job-design-project="jk"]').click();await page.waitForTimeout(300);
 await page.locator('.fiq-job-dialog [data-job-go="overview"]').click();await page.waitForTimeout(400);
 assert.equal(await S(()=>state.screen),'jobs');
 assert.deepEqual(await saved(),before,'opening Drawing / Panel Check / Overview changed no saved list');

 // 4. Edit Wardrobe 1 in Drawing (real typing): saved lists unchanged, Kitchen untouched.
 await S(()=>{switchToProject('jw','uw','w1');renderAll();show('mark')});await page.waitForTimeout(400);
 await page.locator('#fLength').scrollIntoViewIfNeeded();await page.click('#fLength');await page.keyboard.press('Control+A');await page.keyboard.type('1990');await page.waitForTimeout(150);
 await S(()=>{show('parts');renderAll()});await page.waitForTimeout(300);
 assert.equal(await S(()=>(0,eval)('state').projects.find(p=>p.id==='jw').cabinets[0].parts[0].length),1990,'the real panel changed');
 assert.deepEqual(await saved(),before,'Drawing edit: no saved Cutting List changed');
 // A Mobile update for both jobs: merge leaves the saved lists alone.
 await S(()=>{['jw','jk'].forEach(id=>{const p=JSON.parse(JSON.stringify((0,eval)('state').projects.find(x=>x.id===id)));delete p.sentCuttingLists;p.cabinets[0].parts[0].status='installed';p.notes='from phone';mergeMobileProject(p)});save()});
 assert.deepEqual(await saved(),before,'Mobile update: no saved Cutting List changed');
 // The job copy sent to Mobile does not carry the saved lists.
 assert.equal(await S(()=>'sentCuttingLists' in fiqProjectForMobile((0,eval)('state').projects.find(x=>x.id==='jw'))),false);
 // Wardrobe shows the change notice; Kitchen does not.
 await openSent('Wardrobe 1');
 assert.match(await dialogText(),/Changes since last sent Cutting List/);
 assert.match((await dialogRows())[0],/^P-001 \| Side \| 2000 × 580 × 18/,'still the sent values');
 await closeDialog();
 await openSent('Kitchen');assert.doesNotMatch(await dialogText(),/Changes since/);await closeDialog();

 // 5. Send Kitchen again without changes: no new version.
 await send('jk','uk');
 assert.equal((await versions('jk','room:rk')).length,1,'unchanged resend: no new version');
 // Wardrobe: check the changed panel again (real double-click), then Send: version 2.
 await S(()=>{switchToProject('jw','uw');show('parts');renderAll()});await page.waitForTimeout(300);
 await page.locator('#partsSummary [data-review-panel="w1"]').dblclick();await page.waitForTimeout(300);
 await send('jw','uw');
 vw=await versions('jw','room:rw');
 assert.deepEqual(vw.map(v=>[v.version,v.panels[0].length]),[[1,2000],[2,1990]],'version 2 added, version 1 kept as sent');
 assert.equal((await versions('jk','room:rk')).length,1,'Kitchen untouched');
 await openSent('Wardrobe 1');
 assert.match((await dialogRows())[0],/^P-001 \| Side \| 1990 × 580 × 18/);
 txt=await dialogText();
 assert.match(txt,/Version 2 · 2 panels/);assert.doesNotMatch(txt,/Changes since/);
 assert.equal(await S(()=>document.querySelector('.fiq-job-dialog .fiq-sent-versions').open),false,'history closed by default');
 await page.locator('.fiq-job-dialog [data-previous-versions]').click();await page.waitForTimeout(100);
 assert.match(await page.locator('.fiq-job-dialog [data-previous-versions]').innerText(),/^Previous versions \(1\)$/);
 await page.locator('.fiq-job-dialog [data-old-version="1"] > summary').click();await page.waitForTimeout(100);
 assert.match(await page.locator('.fiq-job-dialog [data-old-version="1"] > summary').innerText(),/^Version 1 · sent /);
 assert.match(await page.locator('.fiq-job-dialog [data-old-version="1"] tr[data-sent-panel="P-001"]').innerText(),/2000 × 580 × 18/);
 if(process.env.SHOT)await page.locator('.fiq-job-dialog .a100-edit-sheet').screenshot({path:process.env.SHOT});// optional picture for review
 await closeDialog();

 // 6. Reload: everything is still there.
 const final=await saved();
 await load();
 assert.deepEqual(await saved(),final,'saved lists survive a reload');

 assert.deepEqual(dialogs,[],'no pop-ups');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
