// Save & next keeps the working defaults and clears only the panel-specific entry.
// Start: Thickness 19, Length 2400, Width 600, Quantity 1 (locked), material White melamine,
// units mm, Length and Width edging. After Save & next the entry must read
// 19 | [empty] | [empty] | 1 locked, with White melamine and mm still selected, and stay that
// way after later redraws. Then the next panel gets those defaults and nothing else.
// Runs the real public Studio loader (Studio.html + patches) with every network request blocked.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:512,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 await page.goto(`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>typeof createPartAt==='function'&&typeof window.fiqRenderUnits==='function'&&typeof window.commitAssembleOneMaterial==='function');
 await page.waitForTimeout(800);
 await page.evaluate(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700"><rect width="1000" height="700" fill="#eee"/></svg>');
  const st=(0,eval)('state');
  st.projects.push({id:'s1',name:'Save next job',customer:'Sam',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'c1',roomId:'r1',name:'Kitchen',drawing,drawingType:'image',parts:[]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));
  switchToProject('s1','c1');st.currentPart=null;renderAll();show('mark');
  window.commitAssembleOneMaterial('White melamine');
 });
 const S=fn=>page.evaluate(fn);
 const click=sel=>page.evaluate(sel=>document.querySelector(sel).click(),sel);
 const type=async(id,v)=>{await page.click('#'+id);await page.keyboard.press('Control+A');await page.keyboard.type(v)};
 const entry=()=>S(()=>{const q=document.getElementById('fQty'),lock=document.getElementById('fQtyUnlockBtn');
  const tag=id=>document.getElementById(id).closest('.measure-field').querySelector('.edge-count')?.textContent||'';
  return {thickness:document.getElementById('fThickness').value,length:document.getElementById('fLength').value,width:document.getElementById('fWidth').value,
   qty:q.value,qtyLocked:q.disabled,lockShown:!lock.hidden&&lock.getClientRects().length>0,lockIcon:lock.textContent,
   material:document.getElementById('materialSummary').textContent,units:document.getElementById('fiqUnitsBtn').textContent,
   lenEdge:/edge-(one|two)/.test(document.getElementById('lengthMeasureWrap').className),widEdge:/edge-(one|two)/.test(document.getElementById('widthMeasureWrap').className),
   edgeText:tag('lengthMeasureWrap')+tag('widthMeasureWrap'),name:document.getElementById('partNamePicker').value,chosen:state.lastChosenPartName,selected:state.currentPart}});
 let dot=0;const placeDot=async()=>{dot++;await page.locator('#drawingCanvas').click({position:{x:40+dot*50,y:60},force:true});await page.waitForTimeout(150)};

 // The panel: Shelf, 19 x 2400 x 600, quantity 1 locked, both edges on Length and Width.
 await click('#screen-mark .common-part-library [data-quick-name="Shelf"]');
 await type('fThickness','19');await type('fLength','2400');await type('fWidth','600');
 await placeDot();
 await page.dblclick('#lengthMeasureWrap');await page.dblclick('#lengthMeasureWrap');
 await page.dblclick('#widthMeasureWrap');await page.dblclick('#widthMeasureWrap');
 let e=await entry();
 assert.deepEqual([e.thickness,e.length,e.width,e.qty,e.qtyLocked,e.lockIcon,e.units,e.lenEdge,e.widEdge,e.name],['19','2400','600','1',true,'🔒','mm ▾',true,true,'Shelf'],'panel set up');
 assert.match(e.material,/White melamine/);

 // Save & next.
 await click('#saveNextBtn');
 for(const wait of [150,600,1200]){
  await page.waitForTimeout(wait);
  e=await entry();
  assert.equal(e.thickness,'19',`thickness 19 remains (${wait} ms)`);
  assert.equal(e.qty,'1',`quantity 1 remains (${wait} ms)`);
  assert.equal(e.qtyLocked,true,`quantity stays locked (${wait} ms)`);
  assert.deepEqual([e.lockShown,e.lockIcon],[true,'🔒'],`padlock shown and locked (${wait} ms)`);
  assert.match(e.material,/White melamine/,`material remains (${wait} ms)`);
  assert.equal(e.units,'mm ▾',`mm remains (${wait} ms)`);
  assert.deepEqual([e.length,e.width],['',''],`Length and Width empty (${wait} ms)`);
  assert.deepEqual([e.lenEdge,e.widEdge,e.edgeText],[false,false,''],`edging cleared (${wait} ms)`);
  assert.deepEqual([e.name,e.chosen,e.selected],['','',null],`panel name cleared, no panel selected (${wait} ms)`);
 }
 // Still right after the screen is redrawn again.
 await S(()=>{renderAll();show('mark')});await page.waitForTimeout(200);
 e=await entry();
 assert.deepEqual([e.thickness,e.qty,e.qtyLocked,e.length,e.width],['19','1',true,'',''],'defaults survive a redraw');
 // The lock does nothing without a panel.
 await click('#fQtyUnlockBtn');
 assert.equal((await entry()).qtyLocked,true,'lock cannot be opened without a panel');

 // The next panel: pick a name, type its size, place a dot.
 await click('#screen-mark .quick-main [data-quick-name="Side"]');
 await type('fLength','720');await type('fWidth','560');
 await placeDot();
 let p=await S(()=>JSON.parse(JSON.stringify(cabinet().parts.at(-1))));
 assert.deepEqual([p.name,p.thickness,p.length,p.width,Number(p.qty),p.material,p.edgeLong,p.edgeShort],['Side',19,720,560,1,'White melamine',0,0],'next panel: defaults kept, nothing else carried');
 assert.equal((await S(()=>cabinet().parts.length)),2);

 // The same in centimetres: 1.9 shown, exactly 19 mm stored on the next panel.
 await click('#fiqUnitsBtn');await click('#fiqUnitsMenu .unit-choice[data-unit="cm"]');await page.waitForTimeout(150);
 await click('#saveNextBtn');await page.waitForTimeout(700);
 e=await entry();
 assert.deepEqual([e.thickness,e.qty,e.qtyLocked,e.units,e.length,e.width],['1.9','1',true,'cm ▾','',''],'cm: defaults kept');
 await click('#screen-mark .quick-main [data-quick-name="Back"]');
 await type('fLength','80');await type('fWidth','40');
 await placeDot();
 p=await S(()=>JSON.parse(JSON.stringify(cabinet().parts.at(-1))));
 assert.deepEqual([p.name,p.thickness,p.length,p.width],['Back',19,800,400],'cm: thickness stays exactly 19 mm, sizes converted');
 // And in inches the default 19 mm is not turned into 19.05 mm.
 await click('#fiqUnitsBtn');await click('#fiqUnitsMenu .unit-choice[data-unit="in"]');await page.waitForTimeout(150);
 await click('#saveNextBtn');await page.waitForTimeout(700);
 assert.equal((await entry()).thickness,'0.75');
 await type('fLength','10');await type('fWidth','5');
 await placeDot();
 assert.equal(await S(()=>cabinet().parts.at(-1).thickness),19,'inches: default thickness stays exactly 19 mm');

 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({afterSaveNext:e,ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
