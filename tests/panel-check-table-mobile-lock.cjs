// Panel Check Correction table is read only while the job is sent to Mobile. Real Studio over
// the fake cloud (a real Send to Mobile), real clicks and typing:
//  - before sending: the table edits the panel as normal;
//  - after Send to Mobile: every cell, Add panel and Delete are disabled, a note says why,
//    typing/committing changes nothing, Add/Delete do nothing; Quick Check, the table and the
//    final Cutting List can still be viewed; the table's Drawing button opens Drawing in its
//    locked installation view;
//  - once the job has been moved to Customer Library it is no longer out with the fitter,
//    and the table is editable again (the same principle as Drawing's installation lock).
const {chromium}=require('playwright');
const path=require('node:path'),assert=require('node:assert/strict');
const {createCloud,serve}=require('./helpers/fake-cloud.cjs');
const user={uid:'owner',companyId:'co',role:'company_owner',email:'owner@test',fitterId:'F1'};
(async()=>{
 const served=await serve(path.resolve(__dirname,'..')),server=served.server,base=process.env.LIVE_BASE||served.base;
 const site=process.env.LIVE_BASE?process.env.LIVE_BASE.replace(/\/beta$/,'')+'/':'http://127.0.0.1';
 const cloud=createCloud();const browser=await chromium.launch({headless:true});
 try{
 const page=await (await browser.newContext({viewport:{width:1366,height:900}})).newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.route(u=>!String(u).startsWith(site),r=>r.abort());
 await cloud.attach(page,'studio',user);
 await page.goto(base+'/Studio.html');
 await page.waitForFunction(()=>document.readyState==='complete'&&typeof window.fiqRenderPanelTable==='function'&&window.fiqEditor&&window.fiqEditor.role==='editor');
 await page.waitForTimeout(900);
 const S=(fn,a)=>page.evaluate(fn,a);
 await S(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const mk=(id,code,name,x)=>{const p={id,code,name,length:700,width:500,thickness:19,qty:1,material:'Oak',edgeLong:0,edgeShort:0,notes:'',status:'ready',x,y:30,copies:[]};p.reviewSignature=window.panelReviewSignature(p);return p};
  state.projects.push({id:'mj',name:'Mobile job',customer:'Mia',rooms:[{id:'mr',name:'Kitchen'}],cabinets:[{id:'mu',roomId:'mr',name:'Kitchen',drawing,drawingType:'image',parts:[mk('m1','P-001','Side',20),mk('m2','P-002','Shelf',50)]}],defaultMaterial:'Oak',jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(state.projects.at(-1));switchToProject('mj','mu');save();renderAll();window.__fiqPcView='table';show('parts');renderAll();
 });
 await page.waitForTimeout(300);
 const name=()=>S(()=>state.projects.find(x=>x.id==='mj').cabinets[0].parts.find(x=>x.id==='m1').name);
 const controls=()=>S(()=>[...document.querySelectorAll('#panelCheckTable [data-pc-edit],#panelCheckTable [data-pc-delete],#panelCheckTable [data-pc-add]')].map(e=>e.disabled));
 // 1. Not sent yet: editable.
 assert.ok((await controls()).every(d=>!d),'editable before sending');
 await page.locator('[data-pc-row="P-001"] [data-pc-edit="name"]').fill('Left side');await page.locator('[data-pc-row="P-001"] [data-pc-edit="name"]').press('Enter');await page.waitForTimeout(300);
 assert.equal(await name(),'Left side','edit works before sending');
 await page.locator('[data-pc-row="P-001"] [data-review-panel]').dblclick();await page.waitForTimeout(300);
 // 2. Real Send to Mobile.
 await S(()=>exportProjectToMobile(state.projects.find(x=>x.id==='mj')));
 assert.ok(await S(()=>!!state.projects.find(x=>x.id==='mj').lastMobileSync),'sent to Mobile');
 await S(()=>{switchToProject('mj','mu');renderAll();window.__fiqPcView='table';show('parts');renderAll()});await page.waitForTimeout(300);
 assert.ok((await controls()).every(d=>d),'every cell, Add and Delete disabled');
 assert.match(await page.locator('#panelCheckTable [data-pc-readonly]').innerText(),/Sent to Mobile · read only/);
 const before=await S(()=>JSON.stringify(state.projects.find(x=>x.id==='mj').cabinets));
 await S(()=>window.fiqPanelTableCommit('m1','name','Changed'));
 await page.locator('[data-pc-row="P-002"] [data-pc-delete]').dispatchEvent('click');await page.waitForTimeout(200);
 await page.locator('[data-pc-add]').dispatchEvent('click');await page.waitForTimeout(200);
 assert.equal(await S(()=>JSON.stringify(state.projects.find(x=>x.id==='mj').cabinets)),before,'no change, no delete, no new panel');
 assert.equal(await S(()=>state.screen),'parts','Add panel does not open Drawing');
 // Viewing still works: Quick Check, the table rows, the final Cutting List.
 await page.locator('#panelCheckViewSwitch [data-pc-view="cards"]').click();await page.waitForTimeout(200);
 assert.equal(await page.locator('#partsSummary .panel-check-card').count(),2,'Quick Check visible');
 await page.locator('#panelCheckViewSwitch [data-pc-view="table"]').click();await page.waitForTimeout(200);
 assert.equal(await page.locator('[data-pc-row]').count(),2,'table visible');
 await page.locator('.nav-btn[data-screen="cutting"]').first().click();await page.waitForTimeout(300);
 assert.equal(await page.locator('[data-cutting-row]').count(),2,'final Cutting List visible');
 // The table's Drawing button: Drawing's locked installation view.
 await page.locator('.nav-btn[data-screen="parts"]').first().click();await page.waitForTimeout(300);
 await page.locator('[data-pc-row="P-001"] [data-pc-drawing]').click();await page.waitForTimeout(400);
 assert.deepEqual(await S(()=>[state.screen,state.currentPart,window.fiqDrawingLocked()]),['mark','m1',true],'Drawing opens locked');
 // 3. Moved to Customer Library: no longer out with the fitter, editable again.
 await S(()=>{const p=state.projects.find(x=>x.id==='mj');p.overviewFinishedAt=p.movedToLibraryAt=Date.now();save();switchToProject('mj','mu');renderAll();window.__fiqPcView='table';show('parts');renderAll()});await page.waitForTimeout(300);
 assert.ok((await controls()).every(d=>!d),'editable again after Move to Library');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
