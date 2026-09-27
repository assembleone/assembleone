// Manufacturing-ready panels need Part Name, Length, Width, Thickness and Material. Edging is
// optional. Real Drawing and Panel Check clicks:
//  1. dot-first still works: a dot is placed with nothing filled in, no message; sizes, edging,
//     name and material follow; Save & next saves the complete panel;
//  2. Save & next on a placed panel without Length / Width / Thickness stops, says what is
//     missing, keeps everything entered, and clears the warning as the size is typed;
//  3. unfinished panels (also legacy ones) are not Panel Check cards: one summary
//     "N unfinished panels in Drawing" names each and what it is missing, with Finish in
//     Drawing, which opens the first one with its missing fields marked; their data is not
//     touched; once finished it is a normal card and Panel Check approves it;
//  4. incomplete panels never reach the Cutting List or supplier data;
//  5. a complete panel with no edging is approved at once.
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
 await page.waitForFunction(()=>typeof window.fiqPanelMissingFields==='function'&&typeof createPartAt==='function');
 await page.waitForTimeout(800);
 await page.evaluate(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700"><rect width="1000" height="700" fill="#eee"/></svg>');
  const P=(id,code,name,l,w,th,mat,extra)=>({id,code,name,length:l,width:w,thickness:th,qty:1,material:mat,edgeLong:0,edgeShort:0,notes:'',status:'ready',x:null,y:null,copies:[],...extra});
  const st=(0,eval)('state');
  // Unit L holds legacy incomplete panels (as found in real use) next to a complete one.
  st.projects.push({id:'cj',name:'Complete job',customer:'Cleo',defaultMaterial:'',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[
   {id:'cd',roomId:'r1',name:'Drawing unit',drawing,drawingType:'image',parts:[],lastThickness:19,lastMaterial:''},
   {id:'cl',roomId:'r1',name:'Legacy unit',drawing,drawingType:'image',lastMaterial:'',parts:[
    P('la','P-001','',0,0,19,'White melamine',{x:20,y:20}),P('lb','P-002','Shelf',600,450,0,'White melamine',{x:40,y:20}),
    P('lc','P-003','Side',720,560,18,'',{x:60,y:20}),P('ld','P-004','Back',800,600,8,'MDF',{x:80,y:20})]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));switchToProject('cj','cd');st.currentPart=null;st.lastChosenPartName='';renderAll();show('mark');
 });
 const S=(fn,a)=>page.evaluate(fn,a);
 const dot=async x=>{await S(()=>document.getElementById('drawingCanvas').scrollIntoView({block:'center'}));await page.waitForTimeout(80);await page.locator('#drawingCanvas').click({position:{x,y:90}});await page.waitForTimeout(200)};
 const type=async(id,v)=>{await page.locator('#'+id).scrollIntoViewIfNeeded();await page.click('#'+id);await page.keyboard.press('Control+A');if(v)await page.keyboard.type(v);else await page.keyboard.press('Backspace');await page.waitForTimeout(60)};
 const name=async n=>{const b=page.locator(`#screen-mark .quick-main [data-quick-name="${n}"]`);await b.scrollIntoViewIfNeeded();await b.click();await page.waitForTimeout(80)};
 const material=async m=>{await page.locator('#materialSummary').scrollIntoViewIfNeeded();await page.locator('#materialSummary').click();await page.waitForTimeout(80);await page.locator(`#materialLibraryGrid [data-material-name="${m}"]`).click();await page.waitForTimeout(80)};
 const saveNext=async()=>{const b=page.locator('#saveNextBtn');await b.scrollIntoViewIfNeeded();await b.click();await page.waitForTimeout(700)};
 const msg=()=>S(()=>{const m=document.getElementById('fiqMissingMsg');return m?m.innerText.trim():''});
 const outlined=()=>S(()=>[...document.querySelectorAll('#screen-mark .fiq-missing')].map(e=>e.id||e.className.split(' ')[0]).sort());
 const unit=id=>S(id=>(0,eval)('state').projects.find(p=>p.id==='cj').cabinets.find(c=>c.id===id).parts.map(p=>[p.code,p.name,p.length,p.width,p.thickness,p.material]),id);

 // 1. Dot first, then everything else.
 await dot(120);
 assert.deepEqual([await unit('cd').then(x=>x.length),await msg()],[1,''],'a dot is placed with nothing filled in and no message');
 await type('fLength','2400');await type('fWidth','600');await name('Side');await material('White melamine');
 await saveNext();
 assert.deepEqual(await unit('cd'),[['P-001','Side',2400,600,19,'White melamine']],'complete panel saved');
 assert.equal(await S(()=>!!state.currentPart),false,'Save & next went on to a clean entry');

 // 2. Placed panel, sizes missing.
 await dot(300);await name('Back');
 await saveNext();
 assert.equal(await msg(),'⚠ Enter the length\n⚠ Enter the width','Save & next stops: sizes missing');
 assert.deepEqual(await outlined(),['lengthMeasureWrap','widthMeasureWrap']);
 assert.equal(await S(()=>state.currentPart&&part().name),'Back','nothing cleared, panel still selected');
 await type('fLength','800');await page.waitForTimeout(100);
 assert.equal(await msg(),'⚠ Enter the width','typing the length clears its warning');
 await type('fWidth','400');await type('fThickness','');await page.waitForTimeout(100);
 await saveNext();
 assert.equal(await msg(),'⚠ Enter the thickness','thickness required');
 await type('fThickness','18');await saveNext();
 assert.deepEqual((await unit('cd'))[1],['P-002','Back',800,400,18,'White melamine'],'saved once complete');

 // 3. Legacy incomplete panels in Panel Check.
 // A panel without its own material takes the job's default material (existing behaviour),
 // so for the 'material missing' case this job has no default material.
 await S(()=>{const pr=(0,eval)('state').projects.find(p=>p.id==='cj');pr.defaultMaterial='';pr.cabinets.forEach(c=>c.lastMaterial='');switchToProject('cj','cl');save();renderAll();show('parts')});await page.waitForTimeout(400);
 const gate=()=>S(()=>{const w=document.querySelector('#panelIncompleteWarning .fiq-incomplete-warning');return w?w.innerText.replace(/\s+/g,' ').trim():''});
 const reviewed=id=>S(id=>window.panelIsReviewed((0,eval)('state').projects.find(p=>p.id==='cj').cabinets.find(c=>c.id==='cl').parts.find(p=>p.id===id)),id);
 const check=async id=>{await S(()=>{show('parts');renderAll()});await page.waitForTimeout(250);await page.locator(`#partsSummary [data-review-panel="${id}"]`).dblclick();await page.waitForTimeout(300)};
 const cards=()=>S(()=>[...document.querySelectorAll('#partsSummary .panel-check-card .panel-check-code')].map(e=>e.innerText.trim()));
 // Unfinished panels are not Panel Check cards; one summary names them.
 await S(()=>{show('parts');renderAll()});await page.waitForTimeout(300);
 assert.deepEqual(await cards(),['P-004'],'only the finished panel is a card');
 assert.equal(await gate(),'⚠️ 3 unfinished panels in Drawing P-001 — missing: Part Name, Length, Width P-002 · Shelf — missing: Thickness P-003 · Side — missing: Material Finish in Drawing');
 assert.deepEqual(await unit('cl'),[['P-001','',0,0,19,'White melamine'],['P-002','Shelf',600,450,0,'White melamine'],['P-003','Side',720,560,18,''],['P-004','Back',800,600,8,'MDF']],'their data is untouched');
 // Finish in Drawing -> the first one, missing fields marked.
 await page.locator('[data-finish-in-drawing]').click();await page.waitForTimeout(500);
 assert.deepEqual([await S(()=>state.screen),await S(()=>state.currentPart)],['mark','la']);
 assert.equal(await msg(),'⚠ Choose a part name first\n⚠ Enter the length\n⚠ Enter the width');
 await name('Top / Bottom');await type('fLength','900');await type('fWidth','560');
 await saveNext();
 assert.deepEqual((await unit('cl'))[0],['P-001','Top / Bottom',900,560,19,'White melamine'],'the real panel data is updated');
 // Now it is a normal Panel Check card and can be checked.
 await S(()=>{show('parts');renderAll()});await page.waitForTimeout(300);
 // P-003 has no material of its own: finishing P-001 set the job's material, which it now
 // takes (existing behaviour), so it is finished too. P-002 still lacks its thickness.
 assert.deepEqual(await cards(),['P-001','P-003','P-004']);
 assert.equal(await gate(),'⚠️ 1 unfinished panel in Drawing P-002 · Shelf — missing: Thickness Finish in Drawing');
 await check('la');
 assert.equal(await reviewed('la'),true,'approved normally');

 // 4. Incomplete panels never reach the Cutting List or supplier data.
 const out=await S(()=>{switchToProject('cj','cl');show('cutting');renderAll();return {supplier:supplierParts().map(p=>p.code),rows:fiqSupplierDataset().rows.map(r=>r.panelNumber),warn:document.getElementById('cuttingValidation').innerText}});
 assert.deepEqual([out.supplier,out.rows],[['P-001'],['P-001']],'only the complete, checked panel is supplier data');
 assert.match(out.warn,/3 incomplete parts hidden/,'Cutting List holds back the two incomplete panels and the not-yet-checked one: '+out.warn);

 // 5. No edging is fine: a complete panel without edging is approved at once.
 await check('ld');assert.equal(await reviewed('ld'),true,'edging is not required');

 assert.deepEqual(dialogs,[],'no pop-ups');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
