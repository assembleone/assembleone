// Shopping List supplier prices (option 1: the whole list is the open unit). Real typing:
//  - Sheets, Edge Banding and Hardware all belong to the open unit; the sheet counts equal
//    the Estimated Sheets card; the customer's all-jobs sheet count is one unpriced note;
//  - typing a price shows qty × price = line; "0,47" (comma) works; a hardware item without
//    a quantity cannot be priced; Estimated supplier cost adds only priced lines and says how
//    many items have no price or no quantity;
//  - prices are remembered in this browser: after a reload they are still there, another
//    job's Shopping List prefills the same items, and overwriting a price is remembered;
//  - prices never enter job data, so they are not in the saved state, the supplier rows
//    (CSV/PDF/QR labels), a saved Cutting List or what is sent to Mobile.
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
 else await page.route(u=>!String(u).startsWith('http://127.0.0.1'),r=>r.abort());
 const url=process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`;
 const S=(fn,a)=>page.evaluate(fn,a);
 const load=async()=>{await page.goto(url);await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor'&&typeof window.fiqRenderShoppingList==='function');await page.waitForTimeout(900);
  await S(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'})};
 await load();
 await S(()=>{
  const st=(0,eval)('state');
  const mk=(id,code,name,l,w,qty,mat,eL,eS)=>{const p={id,code,name,length:l,width:w,thickness:19,qty,material:mat,edgeLong:eL,edgeShort:eS,notes:'',status:'ready',x:10,y:10,copies:[]};p.reviewSignature=window.panelReviewSignature(p);return p};
  const hwA=[{name:'Soft-close hinges',done:true,qty:12},{name:'Drawer runners',done:true,qty:6},{name:'Handles',done:true,qty:''},{name:'Shelf pins',done:false,qty:20}];
  st.projects.push({id:'ja',name:'Wardrobe job',customer:'Jones Family',rooms:[{id:'ra',name:'Bedroom'}],cabinets:[{id:'ua',roomId:'ra',name:'Wardrobe',hardwareChecklist:hwA,parts:[
   mk('a1','P-001','Side',2000,580,2,'White melamine',1,0),mk('a2','P-002','Shelf',764,560,4,'White melamine',1,0)]}],jobLog:[],updatedAt:Date.now()});
  st.projects.push({id:'jb',name:'Kitchen job',customer:'Jones Family',rooms:[{id:'rb',name:'Kitchen'}],cabinets:[{id:'ub',roomId:'rb',name:'Base units',hardwareChecklist:[{name:'Soft-close hinges',done:true,qty:8}],parts:[
   mk('b1','P-001','Base side',720,560,6,'White melamine',1,0),mk('b2','P-002','Plinth',2400,150,3,'Grey MFC',0,0)]}],jobLog:[],updatedAt:Date.now()});
  st.projects.slice(-2).forEach(p=>ensureCustomerForProject(p));
  switchToProject('ja','ua');save();renderAll();show('parts');renderAll();
 });
 await page.waitForTimeout(400);
 const card=page.locator('#customerSheetEstimateCard');
 const rows=()=>S(()=>[...document.querySelectorAll('#fiqShoppingList .fiq-shop-priced')].map(r=>({kind:r.dataset.shopSheet!==undefined?'sheet':r.dataset.shopEdging!==undefined?'edge':'hw',text:r.innerText.replace(/\s+/g,' ').trim(),count:(r.querySelector('.cust-sheet-count')||{}).textContent||'',price:r.querySelector('.fiq-price-input').value,line:r.querySelector('[data-price-line]').textContent})));
 const cost=()=>S(()=>({total:document.querySelector('[data-supplier-cost] b').textContent,missing:document.querySelector('[data-supplier-cost-missing]').hidden?'':document.querySelector('[data-supplier-cost-missing]').textContent}));
 // One scope: this unit. Sheets equal the Estimated Sheets card; all-jobs count is a note.
 assert.match(await card.innerText(),/This unit: Wardrobe job · Bedroom · Wardrobe/);
 const est=await S(()=>[...document.querySelectorAll('#estimatedMaterialsBody .sheet-optim-group')].map(g=>(g.querySelector('.sheet-optim-stats').textContent.match(/Sheets required: (\d+)/)||[])[1]));
 let r=await rows();
 assert.deepEqual(r.filter(x=>x.kind==='sheet').map(x=>x.count.match(/(\d+) sheets?/)[1]),est,'sheet counts equal the Estimated Sheets card');
 assert.match(await card.innerText(),/All 2 jobs for this customer: \d+ sheets? in total \(not priced\)/);
 assert.deepEqual(r.filter(x=>x.kind==='hw').map(x=>x.text.split(' × ')[0]),['Soft-close hinges 12','Drawer runners 6','Handles quantity not set'],'only the ticked hardware of this unit');
 assert.deepEqual(await cost(),{total:'€0.00',missing:(r.length-1)+' items have no price · 1 item has no quantity'},'nothing priced yet: every row counted as missing');
 // Type prices.
 const inp=i=>page.locator('#fiqShoppingList .fiq-price-input').nth(i);
 const idx=async(kind,starts)=>(await rows()).findIndex(x=>x.kind===kind&&x.text.startsWith(starts));
 const sheetQty=Number(r.find(x=>x.kind==='sheet').count.match(/(\d+) sheets?/)[1]);
 const edgeM=Number(r.find(x=>x.kind==='edge').text.match(/([\d.]+) m/)[1]);
 await inp(await idx('sheet','White melamine')).fill('42.17');
 await inp(await idx('edge','White melamine')).fill('0,47');
 await inp(await idx('hw','Soft-close hinges')).fill('3.21');
 await inp(await idx('hw','Drawer runners')).fill('24.13');
 await inp(await idx('hw','Handles')).fill('2.50');
 await page.locator('#customerSheetEstimateCard .est-mat-title').click();await page.waitForTimeout(200);
 r=await rows();
 const e2=n=>'€'+(Math.round(n*100)/100).toFixed(2);
 assert.equal(r.find(x=>x.text.startsWith('Soft-close')).line,'= €38.52','12 × €3.21');
 assert.equal(r.find(x=>x.text.startsWith('Drawer runners')).line,'= €144.78','6 × €24.13');
 assert.equal(r.find(x=>x.kind==='edge').line,'= '+e2(edgeM*0.47),'metres × €0,47');
 assert.equal(r.find(x=>x.kind==='edge').price,'0.47','comma price understood');
 assert.equal(r.find(x=>x.text.startsWith('Handles')).line,'','no quantity: not priced');
 const expected=sheetQty*42.17+edgeM*0.47+38.52+144.78;
 assert.deepEqual(await cost(),{total:e2(expected),missing:'1 item has no quantity'},'only priced lines count');
 if(process.env.SHOT)await card.screenshot({path:process.env.SHOT+'/shopping-prices.png'});
 // Remembered after a reload.
 await load();await S(()=>{switchToProject('ja','ua');renderAll();show('parts');renderAll()});await page.waitForTimeout(400);
 assert.deepEqual(await cost(),{total:e2(expected),missing:'1 item has no quantity'},'prices kept after reload');
 // Another job: the same items are prefilled; other items are not.
 await S(()=>{switchToProject('jb','ub');renderAll();show('parts');renderAll()});await page.waitForTimeout(400);
 r=await rows();
 assert.equal(r.find(x=>x.text.startsWith('Soft-close')).price,'3.21','hinges prefilled');
 assert.equal(r.find(x=>x.kind==='sheet'&&x.text.startsWith('White melamine')).price,'42.17','same sheet prefilled');
 assert.equal(r.find(x=>x.kind==='sheet'&&x.text.startsWith('Grey MFC')).price,'','a different sheet has no price');
 // Overwrite the hinge price; it is remembered for the first job too.
 await inp(await idx('hw','Soft-close hinges')).fill('3.50');await page.locator('#customerSheetEstimateCard .est-mat-title').click();await page.waitForTimeout(150);
 assert.equal((await rows()).find(x=>x.text.startsWith('Soft-close')).line,'= €28.00','8 × €3.50');
 await S(()=>{switchToProject('ja','ua');renderAll();show('parts');renderAll()});await page.waitForTimeout(400);
 assert.equal((await rows()).find(x=>x.text.startsWith('Soft-close')).line,'= €42.00','overwritten price used: 12 × €3.50');
 // Privacy: prices are only in the browser's own price store, never in job data or outputs.
 const leak=await S(()=>{
  const state=JSON.stringify((0,eval)('state'));
  const parts=(0,eval)('state').projects.flatMap(p=>p.cabinets.flatMap(c=>c.parts));
  const supplier=JSON.stringify(fiqSupplierDataset(parts));
  if(typeof window.fiqRecordSentCuttingList==='function'){const p=project();window.fiqRecordSentCuttingList(p,'ra','ua')}
  const saved=JSON.stringify(project().sentCuttingLists||{});
  const keys=Object.keys(localStorage).filter(k=>/supplier_prices/.test(k));
  return {state,supplier,saved,keys,store:keys.map(k=>localStorage.getItem(k)).join('')};
 });
 for(const v of ['42.17','0.47','3.21','24.13','3.5'])for(const [where,txt] of [['job data',leak.state],['supplier rows',leak.supplier],['saved Cutting List',leak.saved]])assert.ok(!txt.includes(v),'price '+v+' not in '+where);
 assert.equal(leak.keys.length,1,'one browser price store');assert.ok(leak.store.includes('42.17'),'kept in the browser store');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
