// Panel Check edging safety + edge banding metres, through real double-clicks in Panel Check.
// One job, two units. Unit A: six 600 x 450 x 19 white melamine shelves, only the first with
// a Length edge; an oak panel and an 18 mm panel of the same size; two 800 x 400 panels with
// the edge on different sides; two plywood panels with no edging; a Qty 3 panel with two
// Length edges and one Width edge. Unit B: a seventh identical shelf without edging.
//  - edge banding total = real banded edge lengths x Qty, no waste;
//  - checking P-001 warns (6 similar panels, across both units) instead of turning green;
//    Apply to all changes the real edging of all six, the total, the Cutting List and the
//    supplier data; the changed panels need checking again;
//  - different material / thickness are not grouped; plywood without edging never warns;
//  - different edge orientation warns without a Yes (it would remove an edge); Keep
//    different is remembered for that group and
//    only asked again when its edging changes.
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
 const errors=[],dialogs=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>{dialogs.push(d.message());d.accept()});
 if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/'),r=>r.abort());
 else await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 await page.goto(process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>typeof window.fiqEdgeWarningFor==='function'&&typeof window.renderParts==='function');
 await page.waitForTimeout(800);
 await page.evaluate(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  let n=0;const mk=(id,name,l,w,th,mat,eL,eS,qty)=>({id,code:'P-'+String(++n).padStart(3,'0'),name,length:l,width:w,thickness:th,qty:qty||1,material:mat,edgeLong:eL,edgeShort:eS,notes:'',status:'ready',x:10+n*3,y:20,copies:[]});
  const W='White melamine';
  const a=[mk('s1','Shelf',600,450,19,W,1,0),mk('s2','Shelf',600,450,19,W,0,0),mk('s3','Shelf',600,450,19,W,0,0),mk('s4','Shelf',600,450,19,W,0,0),mk('s5','Shelf',600,450,19,W,0,0),mk('s6','Shelf',600,450,19,W,0,0),
   mk('m1','Shelf',600,450,19,'Oak melamine',0,0),mk('t1','Shelf',600,450,18,W,0,0),mk('o1','Door',800,400,19,W,1,0),mk('o2','Door',800,400,19,W,0,1),
   mk('n1','Back',500,300,19,'Plywood',0,0),mk('n2','Back',500,300,19,'Plywood',0,0),mk('q1','Top',1000,500,19,W,2,1,3)];
  n=0;const b=[mk('s7','Shelf',600,450,19,W,0,0)];
  const st=(0,eval)('state');
  st.projects.push({id:'ej',name:'Edge job',customer:'Eddie Edge',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'ua',roomId:'r1',name:'Unit A',drawing,drawingType:'image',parts:a},{id:'ub',roomId:'r1',name:'Unit B',drawing,drawingType:'image',parts:b}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));switchToProject('ej','ua');renderAll();show('parts');
 });
 await page.waitForTimeout(500);
 const S=(fn,a)=>page.evaluate(fn,a);
 // Edge banding metres (same calculation as the Shopping List): whole job, and the
 // Shopping List's own "Total" for the open unit.
 const total=()=>S(()=>'Total: '+(Math.round(window.fiqEdgeBandingMetres((0,eval)('state').projects.find(x=>x.id==='ej').cabinets.flatMap(c=>c.parts))*100)/100).toFixed(2)+' m');
 const unitLine=()=>S(()=>{renderAll();const t=document.querySelector('#customerSheetEstimateCard [data-shop-edging-total] b');return t?t.innerText:''});
 const warning=()=>S(()=>{const w=document.querySelector('#edgeCheckWarning .fiq-edge-warning');return w?w.innerText.replace(/\s+/g,' ').trim():''});
 const reviewed=id=>S(id=>{const p=(0,eval)('state').projects.find(x=>x.id==='ej').cabinets.flatMap(c=>c.parts).find(x=>x.id===id);return window.panelIsReviewed(p)},id);
 const edges=ids=>S(ids=>{const all=(0,eval)('state').projects.find(x=>x.id==='ej').cabinets.flatMap(c=>c.parts);return ids.map(id=>{const p=all.find(x=>x.id===id);return p.edgeLong+'/'+p.edgeShort})},ids);
 const check=async id=>{await S(()=>{show('parts');renderAll()});await page.waitForTimeout(250);await page.locator(`#partsSummary [data-review-panel="${id}"]`).dblclick();await page.waitForTimeout(300)};

 // Metres before: 0.6 (P-001) + 0.8 + 0.4 (the doors) + (2 x 1.0 + 0.5) x 3 (Qty 3) = 9.30 m.
 assert.equal(await total(),'Total: 9.30 m','edge banding total, every piece, no waste');
 assert.equal(await unitLine(),'9.30 m','Shopping List edge banding total for the open unit');

 // No edging anywhere in the group: straight to green, no warning.
 await check('n1');
 assert.deepEqual([await warning(),await reviewed('n1')],['',true],'plywood without edging: no false warning');
 // Different material / thickness: not the shelves' group.
 await check('m1');assert.deepEqual([await warning(),await reviewed('m1')],['',true],'different material not grouped');
 await check('t1');assert.deepEqual([await warning(),await reviewed('t1')],['',true],'different thickness not grouped');

 // Six identical shelves (one on Unit B), only P-001 banded: warning, not green.
 await check('s1');
 let w=await warning();
 assert.equal(await reviewed('s1'),false,'not silently approved');
 assert.equal(w,'⚠️ Edging is different P-002 to P-006, Unit B P-001: No edging P-001: 1 × 600 mm edge Do you want them all edged like P-001? Yes, make them the same No, keep as they are');
 // Presentation: light mint card, subtle green border, dark text, green buttons, compact.
 const look=await S(()=>{const card=document.querySelector('#edgeCheckWarning .fiq-edge-warning'),cs=getComputedStyle(card),b=getComputedStyle(card.querySelector('[data-edge-apply]'));return {bg:cs.backgroundColor,border:cs.borderTopColor,color:cs.color,btn:b.backgroundColor,height:card.getBoundingClientRect().height}});
 assert.deepEqual([look.bg,look.border,look.color,look.btn],['rgb(239, 250, 243)','rgb(191, 227, 204)','rgb(22, 40, 29)','rgb(31, 157, 85)'],JSON.stringify(look));
 assert.ok(look.height<200,'compact card: '+look.height);
 // Apply: the real edging of all six changes, P-001 is checked, the others need checking.
 await page.locator('[data-edge-apply]').click();await page.waitForTimeout(400);
 assert.deepEqual(await edges(['s1','s2','s3','s4','s5','s6','s7']),Array(7).fill('1/0'),'edging applied to the manufacturing data');
 assert.deepEqual([await reviewed('s1'),await reviewed('s2'),await warning()],[true,false,''],'P-001 checked; changed panels need checking again');
 assert.equal(await total(),'Total: 12.90 m','total updates at once (+6 x 0.60 m)');
 assert.equal(await unitLine(),'12.30 m','Shopping List updates at once (Unit A +5 x 0.60 m)');
 // Checking P-002 now: consistent, straight to green. Cutting List and supplier data see it.
 await check('s2');assert.deepEqual([await warning(),await reviewed('s2')],['',true]);
 const supplier=await S(()=>{switchToProject('ej','ua');const r=fiqSupplierDataset().rows.find(x=>x.panelNumber==='P-002');return [r.edgeTop,r.edgeBottom,r.edgeLeft,r.edgeRight]});
 assert.deepEqual(supplier,[1,0,0,0],'supplier data has the corrected edging');
 const cutting=await S(()=>{show('cutting');renderAll();return [...document.querySelectorAll('#supplierPanelCards *')].map(e=>e.innerText).find(t=>/P-002/.test(t)&&/edge/i.test(t))||document.getElementById('cuttingBody').innerText});
 assert.match(cutting,/P-002[\s\S]*1 long edge/i,'Cutting List shows the corrected edging');

 // Different edge orientation (Length edge vs Width edge): warns. Keep different is remembered.
 await check('o1');
 // Making P-010 match would remove its Width edge: no "Yes", only keep.
 w=await warning();assert.equal(w,'⚠️ Edging is different P-010: 1 × 400 mm edge P-009: 1 × 800 mm edge P-010 has other edging and is not changed automatically. No, keep as they are');
 assert.equal(await page.locator('[data-edge-apply]').count(),0,'nothing to add, so no Yes');
 await page.locator('[data-edge-keep]').click();await page.waitForTimeout(300);
 assert.deepEqual([await reviewed('o1'),await warning(),await edges(['o1','o2'])],[true,'',['1/0','0/1']],'Keep different: approved, nothing changed');
 await check('o2');assert.deepEqual([await warning(),await reviewed('o2')],['',true],'no repeated warning for the same group');
 // The group's edging changes: asked again.
 await S(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='ej').cabinets[0].parts.find(x=>x.id==='o2');p.edgeShort=2;save();renderAll()});
 await check('o2');
 assert.match(await warning(),/^⚠️ Edging is different/,'warned again after the edging changed');
 assert.equal(await reviewed('o2'),false);

 // Qty pieces: the Qty 3 panel alone is 7.50 m.
 assert.equal(await S(()=>window.fiqEdgeBandingMetres([(0,eval)('state').projects.find(x=>x.id==='ej').cabinets[0].parts.find(x=>x.id==='q1')]).toFixed(2)),'7.50');
 assert.deepEqual(dialogs,[],'no pop-ups');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
