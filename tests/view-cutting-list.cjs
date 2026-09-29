// Panel Check -> "✓ All panels checked — View Cutting List". Real clicks:
//  - shown only when the open unit has at least one panel, no unfinished panels and no
//    unchecked panels: not with an unchecked panel (until its real double-click check), not
//    with an unfinished panel, not for an empty unit;
//  - it sits in the "needs checking" notice position (just after it) and the green cards
//    are unchanged;
//  - View Cutting List opens the existing Cutting List screen (show('cutting')) with exactly
//    the unit's checked panels, and stores nothing (the saved data is unchanged);
//  - an edit in Drawing that needs a recheck removes it at once; the Cutting List then no
//    longer lists that panel and Send to Job Overview stays blocked, as before.
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
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/')&&!String(u).startsWith('https://cdnjs.cloudflare.com/'),r=>r.abort());
 else await page.route(u=>{const x=String(u);return !(x.startsWith('http://127.0.0.1')||x.startsWith('https://cdnjs.cloudflare.com/'))},r=>r.abort());
 await page.goto(process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor'&&typeof window.isCompleteSupplierPart==='function');
 await page.waitForTimeout(900);
 const S=(fn,a)=>page.evaluate(fn,a);
 await S(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const st=(0,eval)('state');
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const mk=(id,code,name,l,w,qty,x,checked,extra)=>{const p=Object.assign({id,code,name,length:l,width:w,thickness:19,qty,material:'White melamine',edgeLong:0,edgeShort:0,notes:'',status:'ready',x,y:40,copies:[]},extra||{});if(checked)p.reviewSignature=window.panelReviewSignature(p);return p};
  st.projects.push({id:'vj',name:'View job',customer:'Vera',rooms:[{id:'vr',name:'Bedroom'},{id:'vr2',name:'Hall'},{id:'vr3',name:'Study'}],cabinets:[
   {id:'vu',roomId:'vr',name:'Wardrobe',drawing,drawingType:'image',parts:[mk('v1','P-001','Side',2000,580,2,20,true),mk('v2','P-002','Shelf',764,560,4,40,true),mk('v3','P-003','Top',1200,580,1,60,false)]},
   {id:'vu2',roomId:'vr2',name:'Hall unit',drawing,drawingType:'image',parts:[mk('h1','P-001','Side',900,300,2,20,true),mk('h2','P-002','Shelf',600,300,1,40,false,{material:''})]},
   {id:'vu3',roomId:'vr3',name:'Empty unit',drawing,drawingType:'image',parts:[]}],jobLog:[],updatedAt:Date.now()});
  st.projects.at(-1).cabinets[1].parts[1].material='';st.projects.at(-1).defaultMaterial='';
  ensureCustomerForProject(st.projects.at(-1));switchToProject('vj','vu');save();renderAll();show('parts');renderAll();
 });
 await page.waitForTimeout(400);
 const strip=()=>page.locator('#screen-parts [data-view-cutting-list-strip]');
 const open=async cab=>{await S(c=>{switchToProject('vj',c);renderAll();show('parts');renderAll()},cab);await page.waitForTimeout(300)};
 // 1. One unchecked panel: no strip; the existing "needs checking" notice is there.
 assert.equal(await strip().count(),0,'unchecked panel: no strip');
 assert.equal(await S(()=>getComputedStyle(document.getElementById('componentsValidation')).display),'block','needs-checking notice shown');
 // 2. Check P-003 with the real double-click: everything green -> the strip, in the notice position.
 await page.locator('#partsSummary [data-review-panel="v3"]').dblclick();await page.waitForTimeout(400);
 assert.equal(await strip().count(),1,'all checked: strip shown');
 assert.equal((await strip().innerText()).replace(/\s+/g,' ').trim(),'✓ All panels checked View Cutting List');
 assert.deepEqual(await S(()=>{const n=document.getElementById('componentsValidation');return [getComputedStyle(n).display,n.nextElementSibling.id]}),['none','panelCheckCuttingListStrip'],'where the notice was');
 assert.equal(await S(()=>[...document.querySelectorAll('#partsSummary .panel-check-card')].every(c=>c.classList.contains('complete'))),true,'green cards unchanged');
 if(process.env.SHOT){const box=await S(()=>{const a=document.getElementById('estimatedMaterialsCard').getBoundingClientRect(),b=document.getElementById('partsSummary').getBoundingClientRect();return {x:a.left,y:a.top+scrollY,width:a.width,height:b.bottom-a.top}});await page.screenshot({path:process.env.SHOT+'/view-cutting-list.png',fullPage:true,clip:box})}
 // 3. View Cutting List: the existing screen, the unit's checked panels, nothing stored.
 const saved=await S(()=>{const p=state.projects.find(x=>x.id==='vj');return JSON.stringify(p)});
 await page.locator('[data-view-cutting-list]').click();await page.waitForTimeout(500);
 const cl=await S(()=>({screen:state.screen,visible:document.getElementById('screen-cutting').classList.contains('active'),cards:[...document.querySelectorAll('#supplierPanelCards [data-panel-id],#supplierPanelCards .supplier-panel-card')].length,text:document.getElementById('supplierPanelCards').innerText,supplier:supplierParts().map(p=>p.code)}));
 assert.equal(cl.screen,'cutting');assert.equal(cl.visible,true,'the existing Cutting List screen');
 assert.deepEqual(cl.supplier,['P-001','P-002','P-003'],'the unit\'s checked panels');
 for(const code of cl.supplier)assert.ok(cl.text.includes(code),'Cutting List lists '+code);
 assert.equal(await S(()=>JSON.stringify(state.projects.find(x=>x.id==='vj'))),saved,'nothing stored');
 assert.equal(await page.locator('#panelCheckReturnBtn').count(),1,'room ready: Send to Job Overview available as before');
 // 4. Edit P-002 in Drawing (needs a recheck): the strip goes, the Cutting List drops it, Send blocked.
 await page.locator('.nav-btn[data-screen="parts"]').first().click();await page.waitForTimeout(400);
 await page.locator('#partsSummary .panel-check-card',{hasText:'P-002'}).first().click();await page.waitForTimeout(200);
 await page.locator('#partsSummary [data-edit-panel="v2"]').click();await page.waitForTimeout(500);
 await page.click('#fLength');await page.keyboard.press('Control+A');await page.keyboard.type('750');await page.waitForTimeout(500);
 await page.locator('.nav-btn[data-screen="parts"]').first().click();await page.waitForTimeout(500);
 assert.equal(await strip().count(),0,'after an edit needing a recheck: no strip');
 await page.locator('.nav-btn[data-screen="cutting"]').first().click();await page.waitForTimeout(400);
 assert.deepEqual(await S(()=>supplierParts().map(p=>p.code)),['P-001','P-003'],'the edited panel is not on the Cutting List until rechecked');
 assert.equal(await page.locator('#panelCheckReturnBtn').count(),0,'Send to Job Overview blocked');
 // 5. Unfinished panel (no material) in another unit: no strip even though the rest is checked.
 await open('vu2');
 assert.equal(await strip().count(),0,'unfinished panel: no strip');
 assert.equal(await page.locator('#panelIncompleteWarning .fiq-incomplete-warning').count(),1,'the unfinished warning is shown as before');
 // 6. A unit with no panels: no strip.
 await open('vu3');
 assert.equal(await strip().count(),0,'empty unit: no strip');
 // 7. Back to the first unit, recheck P-002 with the real double-click: the strip returns.
 await open('vu');
 await page.locator('#partsSummary [data-review-panel="v2"]').dblclick();await page.waitForTimeout(400);
 assert.equal(await strip().count(),1,'rechecked: strip back');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
