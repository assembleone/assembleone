// Panel Check: sheet size presets per material type, recalculation on change, Custom sizes,
// the size remembered per job, older saved settings respected, panels too large for the sheet
// never counted as fitting, the fitter / Mobile / progress controls gone from this page, and
// no panel data changed. Checked at laptop and one-third-screen width.
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
 await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 await page.goto(`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>typeof window.fiqSheetPresetsFor==='function'&&typeof window.fiqRenderCustomerSheets==='function');
 await page.waitForTimeout(800);
 // An existing job saved before this change (older browser setting for Oak veneer, material
 // only), a second job for the same customer, panels in melamine, MDF, plywood and oak.
 await page.evaluate(()=>{
  localStorage.setItem('assembleone_sheet_settings',JSON.stringify({'oak veneer':{w:3050,h:1300,kerf:4,trim:5,grain:true}}));
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const mk=(id,code,name,l,w,th,q,mat,status)=>{const p={id,code,name,length:l,width:w,thickness:th,qty:q,material:mat,edgeLong:1,edgeShort:0,notes:'',status:status||'ready',x:10,y:10,copies:[]};p.reviewSignature=window.panelReviewSignature?window.panelReviewSignature(p):'';return p};
  const st=(0,eval)('state');
  st.customers=[{id:'cu1',name:'Paula Check',createdAt:1,updatedAt:1}];
  st.projects.push({id:'j1',name:'Kitchen job',customer:'Paula Check',customerId:'cu1',assignedFitter:'__owner__',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'c1',roomId:'r1',name:'Kitchen',drawing,drawingType:'image',parts:[
    mk('a','P-001','Side',720,560,18,2,'White melamine','installed'),mk('b','P-002','Shelf',800,400,18,4,'White melamine','damaged'),mk('c','P-003','Worktop',2600,600,18,1,'White melamine'),
    mk('d','P-004','Door',715,396,18,4,'MDF'),mk('e','P-005','Back',800,720,12,1,'Plywood'),mk('f','P-006','Panel',2900,600,19,1,'Oak veneer')]}],jobLog:[],updatedAt:Date.now()});
  st.projects.push({id:'j2',name:'Utility job',customer:'Paula Check',customerId:'cu1',rooms:[{id:'r2',name:'Utility'}],cabinets:[{id:'c2',roomId:'r2',name:'Utility',drawing,drawingType:'image',parts:[
    mk('g','P-001','Side',900,600,18,2,'White melamine'),mk('h','P-002','Top / Bottom',600,560,18,2,'White melamine')]}],jobLog:[],updatedAt:Date.now()});
  switchToProject('j1','c1');renderAll();show('parts');
 });
 await page.waitForTimeout(500);
 const S=fn=>page.evaluate(fn);
 const dataBefore=await S(()=>JSON.stringify(state.projects.map(p=>p.cabinets.map(c=>c.parts.map(x=>[x.id,x.code,x.status,x.length,x.width,x.thickness,x.qty,x.material,x.edgeLong,x.edgeShort])))));
 const groups=()=>S(()=>[...document.querySelectorAll('#estimatedMaterialsBody .sheet-optim-group')].map(g=>{const sel=g.querySelector('[data-sheet-preset]');return {
  title:g.querySelector('h4').textContent.trim(),options:[...sel.options].map(o=>o.textContent),selected:sel.options[sel.selectedIndex].textContent,
  custom:!!g.querySelector('[data-sheet-w]'),stats:g.querySelector('.sheet-optim-stats').innerText.replace(/\s+/g,' '),warn:(g.querySelector('.sheet-optim-warn-list')||{}).innerText||''}}));
 const summary=()=>S(()=>{const c=document.getElementById('customerSheetEstimateCard');return c?c.innerText.replace(/\s+/g,' ').trim():''});
 const find=(gs,t)=>gs.find(g=>g.title.startsWith(t));

 // 1. Presets and defaults by material type; an older saved setting is respected.
 let gs=await groups();
 assert.deepEqual(find(gs,'White melamine').options,['2800 × 2070 mm (default)','2440 × 1220 mm','Custom…'],'melamine presets');
 assert.equal(find(gs,'White melamine').selected,'2800 × 2070 mm (default)');
 assert.deepEqual(find(gs,'MDF').options,['2440 × 1220 mm (default)','2800 × 2070 mm','3050 × 1220 mm','Custom…'],'MDF presets');
 assert.deepEqual(find(gs,'Plywood').options,['2440 × 1220 mm (default)','2500 × 1250 mm','3050 × 1525 mm','Custom…'],'plywood presets');
 const oak=find(gs,'Oak veneer');
 assert.deepEqual([oak.selected,oak.custom],['Custom…',true],'older saved 3050 x 1300 setting kept, shown as Custom');
 assert.match(oak.stats,/3050 × 1300mm/);
 assert.match(find(gs,'White melamine').stats,/Sheets required: 1 .*2800 × 2070mm/,'2600 worktop fits a 2800 x 2070 sheet');

 // 2. Change the melamine sheet size with the real dropdown: recalculated at once, and a
 //    panel that cannot fit is named, never counted.
 await page.locator('#estimatedMaterialsBody .sheet-optim-group').filter({hasText:'White melamine'}).locator('[data-sheet-preset]').selectOption('2440x1220');
 await page.waitForTimeout(200);
 gs=await groups();
 assert.equal(find(gs,'White melamine').selected,'2440 × 1220 mm');
 assert.match(find(gs,'White melamine').stats,/2440 × 1220mm/,'recalculated with the new size');
 assert.match(find(gs,'White melamine').warn,/P-003 \(2600×600mm\)/,'the 2600 worktop does not fit and is named');
 let sum=await summary();
 assert.match(sum,/White melamine · 18mm 2440 × 1220 sheet/,'top summary uses the same sheet size');
 assert.match(sum,/⚠ 1 panel larger than a 2440 × 1220 sheet, not counted: 2600×600 mm/,'top summary names the panel that does not fit');

 // 3. Custom: Length x Width appear; typed values recalculate.
 await page.locator('#estimatedMaterialsBody .sheet-optim-group').filter({hasText:'MDF'}).locator('[data-sheet-preset]').selectOption('custom');
 await page.waitForTimeout(200);
 const mdf=page.locator('#estimatedMaterialsBody .sheet-optim-group').filter({hasText:'MDF'});
 assert.equal(await mdf.locator('[data-sheet-w]').count(),1,'Custom shows Length and Width');
 await mdf.locator('[data-sheet-w]').fill('1500');await mdf.locator('[data-sheet-w]').press('Tab');await page.waitForTimeout(150);
 await mdf.locator('[data-sheet-h]').fill('800');await mdf.locator('[data-sheet-h]').press('Tab');await page.waitForTimeout(150);
 gs=await groups();
 assert.match(find(gs,'MDF').stats,/Sheets required: 2 .*1500 × 800mm/,'four 715 x 396 doors need two 1500 x 800 offcuts');
 assert.equal(find(gs,'MDF').selected,'Custom…');

 // 4. Remembered for this job (not reset by a redraw), separately from another job.
 const jobSettings=await S(()=>JSON.parse(JSON.stringify(project().sheetSettings)));
 assert.deepEqual([jobSettings['white melamine__18'].w,jobSettings['white melamine__18'].h,jobSettings['mdf__18'].w,jobSettings['mdf__18'].h,jobSettings['mdf__18'].custom],[2440,1220,1500,800,true],'saved on the job');
 await S(()=>{renderAll();show('parts')});await page.waitForTimeout(200);
 gs=await groups();
 assert.deepEqual([find(gs,'White melamine').selected,find(gs,'MDF').selected],['2440 × 1220 mm','Custom…'],'still selected after a redraw');
 await S(()=>{switchToProject('j2','c2');renderAll();show('parts')});await page.waitForTimeout(200);
 await page.locator('#estimatedMaterialsBody .sheet-optim-group').filter({hasText:'White melamine'}).locator('[data-sheet-preset]').selectOption('2800x2070');
 await page.waitForTimeout(150);
 await S(()=>{switchToProject('j1','c1');renderAll();show('parts')});await page.waitForTimeout(200);
 gs=await groups();
 assert.equal(find(gs,'White melamine').selected,'2440 × 1220 mm','the Kitchen job keeps its own choice after the Utility job changed');

 // 5. Removed from Panel Check; kept elsewhere.
 const pc=await S(()=>{const sc=document.getElementById('screen-parts');const txt=sc.innerText;return {
  fitter:/Lead Fitter/.test(txt),send:/Send to Mobile/.test(txt),whatsapp:/WhatsApp/i.test(txt),another:/Add another fitter/.test(txt),
  progress:/Installation Progress|Not yet fitted|Total panels/.test(txt),outstanding:/Reported missing or damaged on site/.test(txt),
  order:!!sc.querySelector('#orderMissingPanelsBtn'),hardware:/Hardware checklist/i.test(txt),check:/Panel checked/.test(txt),
  summary:!!document.querySelector('#customerSheetEstimateCard .cust-sheet-card'),fitterHtml:typeof window.a211FitterRowHtml==='function'}});
 assert.deepEqual(pc,{fitter:false,send:false,whatsapp:false,another:false,progress:false,outstanding:true,order:true,hardware:true,check:true,summary:true,fitterHtml:true},'Panel Check contents');

 // 6. One-third-screen width: nothing wider than the window.
 for(const w of [455,512]){
  await page.setViewportSize({width:w,height:900});await page.waitForTimeout(200);
  const over=await S(()=>{const sc=document.getElementById('screen-parts').getBoundingClientRect();return [...document.querySelectorAll('#screen-parts .est-mat-card, #screen-parts .sheet-optim-settings, #screen-parts [data-sheet-preset]')].filter(e=>e.getBoundingClientRect().right>sc.right+1).length});
  assert.equal(over,0,`Panel Check fits at ${w}px`);
 }

 // 7. No panel data changed by any of this.
 assert.equal(await S(()=>JSON.stringify(state.projects.map(p=>p.cabinets.map(c=>c.parts.map(x=>[x.id,x.code,x.status,x.length,x.width,x.thickness,x.qty,x.material,x.edgeLong,x.edgeShort]))))),dataBefore,'panel ids, numbers, statuses and sizes unchanged');

 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({summary:await summary(),ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
