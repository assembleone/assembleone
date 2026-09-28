// Panel Check: "🔧 Hardware & extras" collapsed selector + 🛒 Shopping List. Real clicks:
//  - the existing hardware card starts collapsed ("N items selected"), expands and
//    collapses; saved hardware data (ticks, quantities, a custom item) is untouched;
//  - ticking an item and typing its quantity puts it in the Shopping List at once;
//    unticking removes it; a new custom item works the same;
//  - edge banding in the Shopping List comes from the panels' own edging, grouped by
//    material and thickness (exact edge lengths x Qty, no waste);
//  - scope: only the unit open in Panel Check (other unit / other job of the same
//    customer never mixed in); the all-jobs customer sheet card is unchanged;
//  - everything survives a reload; the sheet estimate itself is unchanged.
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
 const page=await browser.newPage({viewport:{width:1366,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/'),r=>r.abort());
 else await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 const url=process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`;
 const S=(fn,a)=>page.evaluate(fn,a);
 const load=async()=>{await page.goto(url);await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor'&&typeof window.fiqRenderShoppingList==='function');await page.waitForTimeout(900);
  await S(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'})};
 await load();
 await S(()=>{
  const st=(0,eval)('state');
  const pt=(id,code,name,l,w,th,qty,mat,eL,eS)=>({id,code,name,length:l,width:w,thickness:th,qty,material:mat,edgeLong:eL,edgeShort:eS,notes:'',status:'ready',x:20,y:20,copies:[]});
  const hw=names=>['Hinges','Handles','Hanging rail / pole','Shelf pins','Drawer runners','Soft-close dampers','LED lights','LED driver / transformer','Door sensor / switch','Worktop fixings','Plinth / kickboard clips','Screws & fixings'].map(n=>({name:n,done:false}));
  const a=hw();a[4].done=true;a[4].qty=6;a.push({name:'Mirror clips',done:true,qty:4});// saved earlier: Drawer runners 6 + custom item
  const other=hw();other[0].done=true;other[0].qty=99;// other unit: must not appear
  const old=hw();old[1].done=true;old[1].qty=77;// old job: must not appear
  st.projects.push({id:'hj',name:'Wardrobe 1',customer:'Shop Sam',rooms:[{id:'hr',name:'Dressing Room'}],cabinets:[
   {id:'hu',roomId:'hr',name:'Wardrobe',hardwareChecklist:a,parts:[
    pt('h1','P-001','Side',2000,580,19,2,'White melamine',1,0),// 2 x 2000 = 4.00 m
    pt('h2','P-002','Shelf',764,560,19,4,'White melamine',1,0),// 4 x 764 = 3.056 m
    pt('h3','P-003','Door',1990,496,18,2,'Oak veneer',2,2),// 2 x (3980+992) = 9.944 m
    pt('h4','P-004','Back',1980,780,8,1,'White melamine',0,0)]},
   {id:'hu2',roomId:'hr',name:'Tall unit',hardwareChecklist:other,parts:[pt('h9','P-001','Side',2000,580,19,1,'White melamine',1,0)]}],jobLog:[]});
  st.projects.push({id:'ho',name:'Old job',customer:'Shop Sam',rooms:[{id:'or',name:'Bedroom'}],cabinets:[{id:'ou',roomId:'or',name:'Old unit',hardwareChecklist:old,parts:[pt('o1','P-001','Side',700,500,19,1,'White melamine',1,0)]}],jobLog:[]});
  st.projects.slice(-2).forEach(p=>ensureCustomerForProject(p));
  switchToProject('hj','hu');save();renderAll();show('parts');renderAll();
 });
 await page.waitForTimeout(500);
 const savedBefore=await S(()=>JSON.stringify(state.projects.find(p=>p.id==='hj').cabinets[0].hardwareChecklist));
 const shop=()=>S(()=>{const b=document.querySelector('[data-shopping-list]');return b?{edging:[...b.querySelectorAll('[data-shop-edging]')].map(r=>r.innerText.replace(/\s+/g,' ').trim()),hw:[...b.querySelectorAll('[data-shop-hw]')].map(r=>r.innerText.replace(/\s+/g,' ').trim()),text:b.innerText}:null});
 const hwOpen=()=>S(()=>{const b=document.querySelector('.fiq-hw-card .fiq-hw-body');return !!(b&&!b.hidden)});

 // Collapsed by default, with a summary.
 assert.equal(await hwOpen(),false,'collapsed by default');
 assert.match(await page.locator('.fiq-hw-toggle').innerText(),/🔧 Hardware & extras\s*2 items selected/);
 assert.equal(await page.locator('.fiq-hw-card [data-hw-toggle]:visible').count(),0,'rows hidden while collapsed');
 await page.locator('.fiq-hw-toggle').click();await page.waitForTimeout(200);
 assert.equal(await hwOpen(),true,'expands');
 assert.equal(await page.locator('.fiq-hw-card [data-hw-toggle]').count(),13,'all existing items incl. the custom one');
 assert.equal(await S(()=>JSON.stringify(state.projects.find(p=>p.id==='hj').cabinets[0].hardwareChecklist)),savedBefore,'saved hardware data untouched');
 if(process.env.SHOT)await page.locator('.fiq-hw-card').screenshot({path:process.env.SHOT+'/hw-open.png'});
 await page.locator('.fiq-hw-toggle').click();await page.waitForTimeout(200);
 assert.equal(await hwOpen(),false,'collapses again');

 // Shopping List: automatic edging per material/thickness + saved hardware.
 let s=await shop();
 assert.deepEqual(s.edging,['White melamine · 19mm 7.06 m edging','Oak veneer · 18mm 9.94 m edging']);
 assert.deepEqual(s.hw,['Drawer runners 6','Mirror clips 4']);
 assert.match(s.text,/Wardrobe 1 · Dressing Room · Wardrobe/,'scope shown');
 assert.doesNotMatch(s.text,/Hinges|Handles|99|77/,'nothing from the other unit or the old job');
 // Total equals the existing Edge Banding figure for this unit.
 assert.equal(await S(()=>window.fiqEdgeBandingMetres(cabinet().parts).toFixed(2)),'17.00');
 // Tick Hinges + type 18; LED driver 2 -> listed at once. Untick Drawer runners -> gone.
 await page.locator('.fiq-hw-toggle').click();await page.waitForTimeout(200);
 const row=name=>page.locator('.fiq-hw-card .hardware-checklist-row',{has:page.locator('span',{hasText:new RegExp('^'+name.replace(/[/]/g,'\\/')+'$')})});
 await row('Hinges').locator('[data-hw-toggle]').check();await page.waitForTimeout(250);
 assert.equal(await hwOpen(),true,'stays open while working');
 await row('Hinges').locator('[data-hw-qty]').fill('18');await page.waitForTimeout(150);
 await row('LED driver / transformer').locator('[data-hw-toggle]').check();await page.waitForTimeout(250);
 await row('LED driver / transformer').locator('[data-hw-qty]').fill('2');await page.waitForTimeout(150);
 await row('LED lights').locator('[data-hw-toggle]').check();await page.waitForTimeout(250);
 s=await shop();
 assert.deepEqual(s.hw,['Hinges 18','Drawer runners 6','LED lights quantity not set','LED driver / transformer 2','Mirror clips 4']);
 await row('LED lights').locator('[data-hw-qty]').fill('6');await page.waitForTimeout(150);
 await row('Drawer runners').locator('[data-hw-toggle]').uncheck();await page.waitForTimeout(250);
 // A new custom item.
 await page.locator('#newHwItemInput').fill('Wardrobe lift');await page.locator('#addHwItemBtn').click();await page.waitForTimeout(250);
 await row('Wardrobe lift').locator('[data-hw-toggle]').check();await page.waitForTimeout(250);
 await row('Wardrobe lift').locator('[data-hw-qty]').fill('1');await page.waitForTimeout(150);
 s=await shop();
 assert.deepEqual(s.hw,['Hinges 18','LED lights 6','LED driver / transformer 2','Mirror clips 4','Wardrobe lift 1']);
 assert.match(await page.locator('.fiq-hw-toggle').innerText(),/5 items selected/);
 if(process.env.SHOT){await page.locator('.fiq-hw-toggle').click();await page.waitForTimeout(200);await page.locator('.fiq-hw-card').screenshot({path:process.env.SHOT+'/hw-collapsed.png'});await page.locator('#estimatedMaterialsCard').screenshot({path:process.env.SHOT+'/shopping-list.png'});await page.locator('[data-shopping-list]').screenshot({path:process.env.SHOT+'/shopping-only.png'});await page.locator('.fiq-hw-toggle').click();await page.waitForTimeout(200)}

 // Another unit of the same job shows only its own list.
 await S(()=>{switchToProject('hj','hu2');renderAll();show('parts');renderAll()});await page.waitForTimeout(300);
 s=await shop();
 assert.deepEqual(s.hw,['Hinges 99']);assert.deepEqual(s.edging,['White melamine · 19mm 2.00 m edging']);
 // The customer's all-jobs sheet card still exists (unchanged scope, clearly labelled).
 assert.match(await page.locator('#customerSheetEstimateCard').innerText(),/Estimated Sheets Required — all 2 jobs/);

 // Reload: hardware ticks/quantities and the Shopping List are kept.
 await load();
 await S(()=>{switchToProject('hj','hu');renderAll();show('parts');renderAll()});await page.waitForTimeout(400);
 assert.equal(await hwOpen(),false,'collapsed again after reload');
 s=await shop();
 assert.deepEqual(s.hw,['Hinges 18','LED lights 6','LED driver / transformer 2','Mirror clips 4','Wardrobe lift 1']);
 assert.deepEqual(s.edging,['White melamine · 19mm 7.06 m edging','Oak veneer · 18mm 9.94 m edging']);

 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
