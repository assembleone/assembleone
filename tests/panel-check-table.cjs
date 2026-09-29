// Panel Check correction table (final manufacturing corrections). Real clicks and typing:
//  - Quick Check cards stay the first view and double-click -> green is unchanged;
//  - switching Quick Check <-> Correction table;
//  - headings "Thickness mm | Length mm | Width mm" and mm values (also when Studio shows cm);
//  - every field (part name, thickness, length, width, long edges, short edges, quantity,
//    material, notes) changes the real panel and removes its green check; re-typing the same
//    value changes nothing; the table's check cell rechecks with the same double-click logic;
//  - quantity can go up, never below the panel's dots on the Drawing, and stays 1-500;
//  - Add panel opens Drawing for a new panel (one new panel = one dot) and it comes back
//    unchecked; Delete uses Drawing's delete (confirmation, renumbering, deleted-panel
//    protection: a stale phone copy cannot bring it back);
//  - after correcting and rechecking, the Cutting List table and supplier rows show the new
//    data; a saved Cutting List version is unchanged and "changed since sent" is flagged;
//  - the final Cutting List stays read only and its headings say mm;
//  - a read-only Studio tab cannot edit the table.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1366,height:900}});
 const errors=[],dialogs=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>{dialogs.push(d.message());d.accept()});
 if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/')&&!String(u).startsWith('https://cdnjs.cloudflare.com/'),r=>r.abort());
 else await page.route(u=>{const x=String(u);return !(x.startsWith('http://127.0.0.1')||x.startsWith('https://cdnjs.cloudflare.com/'))},r=>r.abort());
 await page.goto(process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor'&&typeof window.fiqRenderPanelTable==='function');
 await page.waitForTimeout(900);
 const S=(fn,a)=>page.evaluate(fn,a);
 await S(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const st=(0,eval)('state');
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const mk=(id,code,name,l,w,qty,x,copies,checked)=>{const p={id,code,name,length:l,width:w,thickness:19,qty,material:'White melamine',edgeLong:0,edgeShort:0,notes:'',status:'ready',x,y:30,copies:copies||[]};if(checked)p.reviewSignature=window.panelReviewSignature(p);return p};
  st.projects.push({id:'kj',name:'Correct job',customer:'Karl',rooms:[{id:'kr',name:'Bedroom'}],cabinets:[{id:'ku',roomId:'kr',name:'Wardrobe',drawing,drawingType:'image',parts:[
   mk('k1','P-001','Side',2000,580,2,15,[{x:20,y:30}],true),mk('k2','P-002','Shelf',764,560,1,40,[],true),mk('k3','P-003','Top',1200,580,1,60,[],false)]}],defaultMaterial:'White melamine',jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));switchToProject('kj','ku');save();renderAll();show('parts');renderAll();
 });
 await page.waitForTimeout(400);
 const P=id=>S(i=>{const p=state.projects.find(x=>x.id==='kj').cabinets[0].parts.find(x=>x.id===i);return p&&{...p,checked:window.isCompleteSupplierPart(p)}},id);
 // 1. Quick Check first; the switch; double-click on a card still checks it.
 assert.deepEqual(await S(()=>({cards:getComputedStyle(document.querySelector('#partsSummary .panel-check-grid')).display!=='none',table:!!document.querySelector('[data-pc-table]'),switch:[...document.querySelectorAll('#panelCheckViewSwitch [data-pc-view]')].map(b=>b.textContent+(b.classList.contains('active')?'*':''))})),{cards:true,table:false,switch:['Quick Check*','Correction table']});
 await page.locator('#partsSummary [data-review-panel="k3"]').dblclick();await page.waitForTimeout(300);
 assert.equal((await P('k3')).checked,true,'Quick Check double-click still checks');
 if(process.env.SHOT){const b=await S(()=>{const a=document.getElementById('panelCheckCuttingListStrip').getBoundingClientRect(),z=document.getElementById('partsSummary').getBoundingClientRect();return {x:a.left,y:a.top+scrollY,width:a.width,height:z.bottom-a.top}});await page.screenshot({path:process.env.SHOT+'/pc-quick-check.png',fullPage:true,clip:b})}
 // 2. Send to Job Overview once: saved Cutting List Version 1.
 await page.locator('[data-view-cutting-list]').click();await page.waitForTimeout(400);
 await page.locator('#panelCheckReturnBtn').click();await page.waitForTimeout(600);
 const v1=await S(()=>JSON.stringify(state.projects.find(x=>x.id==='kj').sentCuttingLists['room:kr']));
 await S(()=>{switchToProject('kj','ku');renderAll();show('parts');renderAll()});await page.waitForTimeout(300);
 // 3. The table (Studio in cm: the table stays in mm).
 await S(()=>{state.units='cm';save();renderAll()});
 await page.locator('#panelCheckViewSwitch [data-pc-view="table"]').click();await page.waitForTimeout(300);
 assert.deepEqual(await S(()=>[getComputedStyle(document.querySelector('#partsSummary .panel-check-grid')).display,getComputedStyle(document.querySelector('#partsSummary .fiq-hw-card')).display!=='none',getComputedStyle(document.querySelector('#partsSummary .fiq-cl-card')).display!=='none']),['none',true,true],'cards hidden while the table shows; checklist and hardware stay');
 const head=await S(()=>[...document.querySelectorAll('[data-pc-table] thead th')].map(th=>th.textContent.trim()));
 assert.deepEqual(head.slice(0,10),['Panel No.','Part name','Thickness mm','Length mm','Width mm','Long edges','Short edges','Quantity','Material','Notes'],'column order and mm headings');
 const rowVals=code=>S(c=>{const tr=document.querySelector('[data-pc-row="'+c+'"]');return tr?[...tr.querySelectorAll('[data-pc-edit]')].map(e=>e.value):null},code);
 assert.deepEqual(await rowVals('P-002'),['Shelf','19','764','560','0','0','1','White melamine',''],'mm values although Studio shows cm');
 const edit=async(code,field,value)=>{const el=page.locator('[data-pc-row="'+code+'"] [data-pc-edit="'+field+'"]');
  if(field==='edgeLong'||field==='edgeShort')await el.selectOption(String(value));else{await el.fill(String(value));await el.press('Enter')}
  await page.waitForTimeout(250)};
 const recheck=async code=>{await page.locator('[data-pc-row="'+code+'"] [data-review-panel]').dblclick();await page.waitForTimeout(250)};
 // 4. Every field: changes the real panel, removes the check; rechecked from the table.
 for(const [field,value,expect] of [['name','Fixed shelf','Fixed shelf'],['thickness','18','18'],['length','760','760'],['width','555.5','555.5'],['edgeLong',2,2],['edgeShort',1,1],['qty',3,3],['material','Egger W980','Egger W980'],['notes','Grain along','Grain along']]){
  await edit('P-002',field,value);
  const p=await P('k2');
  assert.equal(String(p[field]),String(expect),field+' changed on the real panel');
  assert.equal(p.checked,false,field+' change removes the green check');
  assert.equal(await page.locator('[data-pc-row="P-002"] [data-review-panel]').count(),1,field+': row shows it needs checking');
  await recheck('P-002');
  assert.equal((await P('k2')).checked,true,field+': rechecked from the table');
 }
 // Same value again: no change, still checked. The material list is Drawing's own.
 await edit('P-002','length','760');assert.equal((await P('k2')).checked,true,'re-typing the same value keeps the check');
 assert.ok(await S(()=>savedMaterials().includes('Egger W980')),'material added to Drawing\'s material list');
 assert.equal(await S(()=>state.projects.find(x=>x.id==='kj').defaultMaterial||''),'White melamine','job default material not changed by a one-panel correction');
 // 5. Quantity: never below the dots (P-001 has 2), never outside 1-500; raising works.
 dialogs.length=0;await edit('P-001','qty','1');
 assert.equal((await P('k1')).qty,2,'not below the 2 dots');assert.match(dialogs.join(' '),/2 dots on the Drawing/);
 dialogs.length=0;await edit('P-001','qty','501');assert.equal((await P('k1')).qty,2);assert.match(dialogs.join(' '),/between 1 and 500/);
 await edit('P-001','qty','4');assert.equal((await P('k1')).qty,4,'raised to 4');await recheck('P-001');
 if(process.env.SHOT){const b=await S(()=>{const a=document.getElementById('panelCheckViewSwitch').getBoundingClientRect(),z=document.getElementById('panelCheckTable').getBoundingClientRect();return {x:a.left,y:a.top+scrollY,width:a.width,height:z.bottom-a.top}});await page.screenshot({path:process.env.SHOT+'/pc-table.png',fullPage:true,clip:b})}
 // 6. After corrections and rechecks: Cutting List table + supplier rows show the new data.
 await page.locator('.nav-btn[data-screen="cutting"]').first().click();await page.waitForTimeout(400);
 const cl=await S(()=>({head:[...document.querySelectorAll('[data-cutting-table] thead th')].map(th=>th.textContent.trim()),row:[...document.querySelector('[data-cutting-row="P-002"]').cells].map(c=>c.innerText.trim()),inputs:document.querySelectorAll('#supplierPanelCards input,#supplierPanelCards select').length,sup:fiqSupplierDataset().rows.filter(r=>r.panelNumber==='P-002').map(r=>[r.partName,r.thickness,r.length,r.width,r.edgeLong,r.edgeShort,r.material,r.notes])}));
 assert.deepEqual(cl.head.slice(2,5),['Thickness mm','Length mm','Width mm'],'final Cutting List headings name mm');
 assert.deepEqual(cl.row,['P-002','Fixed shelf','18','760','555.5','2','1','3','Egger W980','Grain along']);
 assert.equal(cl.inputs,0,'final Cutting List stays read only');
 assert.equal(cl.sup.length,3);assert.deepEqual(cl.sup[0],['Fixed shelf',18,760,555.5,2,1,'Egger W980','Grain along'],'supplier rows updated');
 // 7. Saved Version 1 unchanged; the job is flagged as changed since sent.
 assert.equal(await S(()=>JSON.stringify(state.projects.find(x=>x.id==='kj').sentCuttingLists['room:kr'])),v1,'saved version unchanged');
 assert.equal(await S(()=>window.fiqCuttingListChangedSinceSent(state.projects.find(x=>x.id==='kj'),'room:kr')),true,'changes since last sent');
 // 8. Add panel: Drawing, new panel entry; the new panel returns unchecked.
 await page.locator('.nav-btn[data-screen="parts"]').first().click();await page.waitForTimeout(300);
 await S(()=>{window.__fiqPcView='table';renderAll()});
 await page.locator('[data-pc-add]').click();await page.waitForTimeout(400);
 assert.deepEqual(await S(()=>[state.screen,state.currentPart]),['mark',null],'Drawing, ready for a new panel');
 await S(()=>{state.units='mm';save();renderAll();state.lastChosenPartName='Divider';document.getElementById('fLength').value='700';document.getElementById('fWidth').value='560'});
 const box=await page.locator('#drawingCanvas').boundingBox();await page.mouse.click(box.x+box.width*0.8,box.y+box.height*0.7);await page.waitForTimeout(400);
 await page.locator('.nav-btn[data-screen="parts"]').first().click();await page.waitForTimeout(400);
 const added=await S(()=>{const p=cabinet().parts.find(x=>x.name==='Divider');return p&&{code:p.code,dots:panelDotCount(p),checked:window.isCompleteSupplierPart(p)}});
 assert.deepEqual(added,{code:'P-004',dots:1,checked:false},'new panel with one dot, unchecked');
 assert.equal(await page.locator('[data-pc-row="P-004"] [data-review-panel]').count(),1,'shown unchecked in the table');
 // 9. Delete P-003 with Drawing's delete: renumbered, gone downstream, stale phone cannot restore it.
 const stale=await S(()=>JSON.parse(JSON.stringify(state.projects.find(x=>x.id==='kj'))));
 dialogs.length=0;await page.locator('[data-pc-row="P-003"] [data-pc-delete]').click();await page.waitForTimeout(400);
 assert.match(dialogs.join(' '),/P-003/,'the existing delete confirmation');
 const afterDel=await S(()=>({codes:cabinet().parts.map(p=>p.code+':'+p.name),deleted:cabinet().deletedPartIds||[]}));
 assert.deepEqual(afterDel.codes,['P-001:Side','P-002:Fixed shelf','P-003:Divider'],'renumbered with no gaps');
 assert.ok(afterDel.deleted.includes('k3'),'remembered as deleted');
 await S(s=>{s._packetExportedAt=new Date().toISOString();mergeMobileProject(s)},stale);
 assert.equal(await S(()=>cabinet().parts.some(p=>p.id==='k3')),false,'a stale phone copy cannot bring it back');
 assert.equal(await S(()=>fiqSupplierDataset().rows.some(r=>r.partName==='Top')),false,'not in supplier rows');
 // 10. A read-only tab cannot edit.
 await S(()=>{window.__pcRole=window.fiqEditor.role;try{Object.defineProperty(window.fiqEditor,'role',{value:'readonly',configurable:true,writable:true})}catch(e){window.fiqEditor.role='readonly'}renderAll()});
 assert.equal(await S(()=>[...document.querySelectorAll('#panelCheckTable [data-pc-edit],#panelCheckTable [data-pc-delete],#panelCheckTable [data-pc-add]')].every(e=>e.disabled)),true,'inputs and buttons disabled');
 await S(()=>window.fiqPanelTableCommit('k1','name','Hacked'));
 assert.equal((await P('k1')).name,'Side','read-only tab: nothing changes');
 await S(()=>{Object.defineProperty(window.fiqEditor,'role',{value:window.__pcRole,configurable:true,writable:true});renderAll()});
 // 11. Back to Quick Check: the cards, unchanged in form.
 await page.locator('#panelCheckViewSwitch [data-pc-view="cards"]').click();await page.waitForTimeout(300);
 assert.equal(await S(()=>getComputedStyle(document.querySelector('#partsSummary .panel-check-grid')).display!=='none'&&!document.querySelector('[data-pc-table]')),true,'Quick Check again');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
