// Edging safety: the panel WITH edging is the reference, and "Yes, make them the same" only
// ever ADDS edging to the real manufacturing data (edgeLong / edgeShort). Real double-clicks
// and button clicks in Panel Check.
//  1. Propagation: P-001 600 x 450 with one 600 mm edge (already checked), P-002 and P-003
//     identical without edging. Checking P-002 (no edging) asks whether P-002 and P-003
//     should be edged like P-001; Yes adds P-001's edging to both, P-001 keeps its edge and
//     stays checked. The data change shows at once in the edge banding metres, the Cutting
//     List, the supplier dataset, every production CSV and the Supplier PDF. P-003 was
//     changed without being looked at: it needs checking again before it is supplier data.
//  2. Safety: whatever panel is checked and whatever the mix of edging, pressing Yes never
//     lowers any edge count on any panel. A panel with more or other edging than the
//     reference is never changed; when nothing can be added there is no Yes at all.
//  3. No, keep as they are: nothing changes and the choice is remembered.
// Runs the real public Studio loader; only cdnjs (jsPDF / pdf.js) and jsdelivr (jsQR) load.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pdfReader}=require('./helpers/pdf-read.cjs');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const cdn=u=>/^https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)\//.test(String(u));
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:1366,height:900}});
 const page=await ctx.newPage();
 const errors=[],dialogs=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>{dialogs.push(d.message());d.accept()});
 if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/')&&!cdn(u),r=>r.abort());
 else await page.route(u=>!/^http:\/\/127\.0\.0\.1/.test(String(u))&&!cdn(u),r=>r.abort());
 await page.goto(process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>typeof window.fiqEdgeWarningFor==='function'&&typeof window.fiqSupplierExport==='function');
 await page.waitForTimeout(800);
 const S=(fn,a)=>page.evaluate(fn,a);
 await S(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  let n=0;const mk=(id,name,l,w,eL,eS)=>({id,code:'P-'+String(++n).padStart(3,'0'),name,length:l,width:w,thickness:19,qty:1,material:'White melamine',edgeLong:eL,edgeShort:eS,notes:'',status:'ready',x:10+n*5,y:20,copies:[]});
  const st=(0,eval)('state');
  // Unit A: the propagation case. Unit B: mixed edging for the safety checks.
  const a=[mk('a1','Shelf',600,450,1,0),mk('a2','Shelf',600,450,0,0),mk('a3','Shelf',600,450,0,0)];
  n=0;const b=[mk('h1','Side',700,500,1,0),mk('h2','Side',700,500,2,0),mk('h3','Side',700,500,0,0),mk('h4','Side',700,500,0,1),mk('h5','Side',700,500,0,0),
   mk('k1','Door',900,400,0,0),mk('k2','Door',900,400,1,1),mk('k3','Door',900,400,2,2)];
  st.projects.push({id:'rj',name:'Edge reference job',customer:'Erin Edge',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'ua',roomId:'r1',name:'Unit A',drawing,drawingType:'image',parts:a},{id:'ub',roomId:'r1',name:'Unit B',drawing,drawingType:'image',parts:b}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));switchToProject('rj','ua');
  a[0].reviewSignature=window.panelReviewSignature(a[0]);// P-001 was already checked
  save();renderAll();show('parts');
 });
 await page.waitForTimeout(400);
 const all=()=>S(()=>Object.fromEntries((0,eval)('state').projects.find(x=>x.id==='rj').cabinets.flatMap(c=>c.parts).map(p=>[p.id,[Number(p.edgeLong)||0,Number(p.edgeShort)||0]])));
 const reviewed=id=>S(id=>window.panelIsReviewed((0,eval)('state').projects.find(x=>x.id==='rj').cabinets.flatMap(c=>c.parts).find(x=>x.id===id)),id);
 const warning=()=>S(()=>{const w=document.querySelector('#edgeCheckWarning .fiq-edge-warning');return w?w.innerText.replace(/\s+/g,' ').trim():''});
 const unit=async id=>{await S(id=>{switchToProject('rj',id);show('parts');renderAll()},id);await page.waitForTimeout(250)};
 const check=async id=>{await S(()=>{show('parts');renderAll()});await page.waitForTimeout(250);await page.locator(`#partsSummary [data-review-panel="${id}"]`).dblclick();await page.waitForTimeout(300)};
 const total=()=>S(()=>'Total: '+(Math.round(window.fiqEdgeBandingMetres((0,eval)('state').projects.find(x=>x.id==='rj').cabinets.flatMap(c=>c.parts))*100)/100).toFixed(2)+' m');
 // Every Yes is checked against this: no edge count on any panel may ever go down.
 const yes=async()=>{const before=await all();await page.locator('[data-edge-apply]').click();await page.waitForTimeout(400);const after=await all();
  for(const id of Object.keys(before))assert.ok(after[id][0]>=before[id][0]&&after[id][1]>=before[id][1],'edging removed from '+id+': '+before[id]+' -> '+after[id]);return after};

 // 1. Propagation from the edged panel to identical unedged panels.
 await unit('ua');
 assert.equal(await total(),'Total: 7.10 m','whole job: Unit A 0.60 m + Unit B 6.50 m');
 await check('a2');// the panel WITHOUT edging is the one being checked
 assert.equal(await warning(),'⚠️ Edging is different P-002, P-003: No edging P-001: 1 × 600 mm edge Do you want them all edged like P-001? Yes, make them the same No, keep as they are');
 assert.equal(await reviewed('a2'),false,'not approved before answering');
 let e=await yes();
 assert.deepEqual([e.a1,e.a2,e.a3],[[1,0],[1,0],[1,0]],'P-001 edging ADDED to P-002 and P-003; P-001 keeps its edge');
 assert.deepEqual([await reviewed('a1'),await reviewed('a2'),await reviewed('a3'),await warning()],[true,true,false,''],'P-001 stays checked, P-002 checked with the new edging, P-003 must be checked again');
 // Edge banding metres, at once.
 assert.equal(await total(),'Total: 8.30 m','Unit A now 3 x 0.60 m');
 // Supplier dataset + every production CSV (all panels, before P-003's re-check).
 const exported=await S(()=>{switchToProject('rj','ua');const parts=cabinet().parts;const ds=fiqSupplierDataset(parts);
  return {rows:ds.rows.map(r=>[r.panelNumber,r.edgeTop,r.edgeBottom,r.edgeLeft,r.edgeRight,r.edgeLong,r.edgeShort]),
   csv:Object.keys(FIQ_SUPPLIER_ADAPTERS).map(k=>{const p=fiqSupplierProfile(k),t=fiqSupplierExport(p,ds).replace(/^﻿/,'').trim().split('\r\n');const head=t[0].split(p.delimiter);
    const cols=['edgeTop','edgeBottom','edgeLeft','edgeRight'].map(f=>head.indexOf(p.columns.find(c=>c.field===f).header));
    return [k,t.slice(1).map(l=>{const v=l.split(p.delimiter);return cols.map(i=>v[i]).join('')})]})}});
 assert.deepEqual(exported.rows,[['P-001',1,0,0,0,1,0],['P-002',1,0,0,0,1,0],['P-003',1,0,0,0,1,0]],'supplier dataset has the added edging');
 for(const [k,rows] of exported.csv)assert.deepEqual(rows,['1000','1000','1000'],k+' CSV edges');
 // Checked-only supplier data: P-003 appears once it is checked again, with its new edging.
 assert.deepEqual(await S(()=>{switchToProject('rj','ua');return fiqSupplierDataset().rows.map(r=>r.panelNumber)}),['P-001','P-002'],'changed P-003 is not supplier data until checked again');
 assert.match(await S(()=>{show('cutting');renderAll();return document.getElementById('screen-cutting').innerText}),/1 panel needs checking/);
 await check('a3');
 assert.deepEqual([await warning(),await reviewed('a3')],['',true],'consistent now: straight to green');
 // Cutting List (checked panels): all three, each with the added edge.
 const cutting=await S(()=>{show('cutting');renderAll();return Object.fromEntries([...document.querySelectorAll('#supplierPanelCards [data-cutting-row]')].map(tr=>[tr.dataset.cuttingRow,tr.cells[5].innerText.trim()]))});
 for(const code of ['P-001','P-002','P-003'])assert.equal(cutting[code],'1','Cutting List: '+code+' has the edge (Long edges 1)');
 // Supplier PDF (cutting list page), built exactly as Download Supplier PDF builds it.
 const analyse=await pdfReader(ctx);
 const b64=await S(async()=>{switchToProject('rj','ua');const r=await window.fiqBuildSupplierPackPdf(supplierParts());return r.doc.output('datauristring').split(',')[1]});
 const pdf=await analyse(Buffer.from(b64,'base64'),72);
 const listText=pdf.pages[0].text;
 for(const code of ['P-001','P-002','P-003'])assert.match(listText,new RegExp(code+'[\\s\\S]*?1 long · 0 short'),'Supplier PDF: '+code+' edging');
 assert.doesNotMatch(listText,/0 long · 0 short/,'no unedged shelf left in the Supplier PDF');

 // 2. Safety: Yes never removes edging.
 await unit('ub');
 // Checking an unedged panel: the reference is the most common edging (1 Length edge,
 // P-001; tie with P-002's 2 edges and P-004's Width edge -> lowest number). Only panels
 // with less edging are raised; P-002 (2 edges) and P-004 (Width edge) are untouched.
 await check('h3');
 assert.equal(await warning(),'⚠️ Edging is different P-002: 2 × 700 mm edges P-003, P-005: No edging P-004: 1 × 500 mm edge P-001: 1 × 700 mm edge P-002, P-004 have other edging and are not changed automatically. Do you want them all edged like P-001? Yes, make them the same No, keep as they are');
 e=await yes();
 assert.deepEqual([e.h1,e.h2,e.h3,e.h4,e.h5],[[1,0],[2,0],[1,0],[0,1],[1,0]],'only added; P-002 keeps 2 edges, P-004 keeps its Width edge');
 // Checking the panel with MORE edging: it is the reference; lower ones are raised to it,
 // nothing is lowered.
 await check('h2');
 e=await yes();
 assert.deepEqual([e.h1,e.h2,e.h3,e.h4,e.h5],[[2,0],[2,0],[2,0],[0,1],[2,0]]);
 // Doors: none / 1+1 / 2+2. Checking the 1+1 door: it is the reference, the unedged door
 // is raised, the 2+2 door is never reduced.
 await check('k2');
 e=await yes();
 assert.deepEqual([e.k1,e.k2,e.k3],[[1,1],[1,1],[2,2]],'the 2+2 door keeps all its edging');
 // 3. Nothing can be added (P-004 Width edge vs the Length edges): no Yes; No keeps and remembers.
 await check('h4');
 assert.equal(await page.locator('[data-edge-apply]').count(),0,'no Yes when it could only remove edging');
 const before=await all();
 await page.locator('[data-edge-keep]').click();await page.waitForTimeout(300);
 assert.deepEqual(await all(),before,'No, keep as they are: nothing changed');
 assert.deepEqual([await reviewed('h4'),await warning()],[true,'']);
 await check('h1');assert.equal(await warning(),'','the keep choice is remembered for the group');

 assert.deepEqual(dialogs,[],'no pop-ups');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
