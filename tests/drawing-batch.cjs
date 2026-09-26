// Drawing area batch: quick panel names, Keep settings for next panel, the edge banding
// picture, the compact panel-numbers warning, Start Design leaving the drawing empty, and the
// help bubble docked in the left navigation at several window sizes.
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
 const page=await browser.newPage({viewport:{width:1366,height:657}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 await page.goto(`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>typeof createPartAt==='function'&&typeof deletePanelAndRenumber==='function'&&typeof window.fiqRenderKeepSettings==='function');
 await page.waitForTimeout(800);
 await page.evaluate(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#eee"/></svg>');
  const st=(0,eval)('state');
  st.projects.push({id:'d1',name:'Drawing job',customer:'Dora Draw',rooms:[{id:'r1',name:'Kitchen'},{id:'r2',name:'Utility'}],
   cabinets:[{id:'c1',roomId:'r1',name:'Kitchen',drawing,drawingType:'image',parts:[]},{id:'c2',roomId:'r2',name:'Utility',drawing,drawingType:'image',parts:[]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));
  switchToProject('d1','c1');renderAll();show('mark');
 });
 const S=fn=>page.evaluate(fn);
 const click=sel=>page.evaluate(sel=>document.querySelector(sel).click(),sel);
 const parts=()=>S(()=>JSON.parse(JSON.stringify(cabinet().parts)));

 // 1. Panel names: quick Side, Top / Bottom and Back; the specific names stay in the full list.
 const quick=await S(()=>[...document.querySelectorAll('#screen-mark .quick-main > [data-quick-name]')].map(b=>[b.textContent.trim(),b.dataset.quickName]));
 assert.deepEqual(quick,[['Side','Side'],['Top / Bottom','Top / Bottom'],['Back','Back panel']],'quick choices');
 assert.equal(await S(()=>document.querySelectorAll('#screen-mark [data-quick-menu]').length),0,'no Left / Right pop-up menu any more');
 const library=await S(()=>[...document.querySelectorAll('#screen-mark .common-part-library [data-quick-name]')].map(b=>b.dataset.quickName));
 for(const n of ['Left-hand side','Right-hand side','Top','Bottom','Top and bottom','Top / Bottom','Back','Back panel','Side','Side panel'])assert(library.includes(n),n+' is in More part names');

 // Panel 1: made with Top / Bottom, sizes, edges and a note, then Save & next. Keep settings off.
 await S(()=>createPartAt(20,20));
 await click('#screen-mark .quick-main [data-quick-name="Top / Bottom"]');
 await page.evaluate(()=>{const set=(id,v)=>{const e=document.getElementById(id);e.disabled=false;e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))};set('fThickness','18');set('fLength','800');set('fWidth','560');set('fNotes','Grain up')});
 // Edges: tap the picture (length twice = both long edges, width once = one short edge).
 await click('#edgeDiagram .edge-top');await click('#edgeDiagram .edge-top');await click('#edgeDiagram .edge-left');
 const pic=await S(()=>({on:[...document.querySelectorAll('#edgeDiagram .edge-side')].map(x=>x.classList.contains('on')),len:document.getElementById('lengthEdgeState').textContent,wid:document.getElementById('widthEdgeState').textContent,
  lenLine:getComputedStyle(document.querySelector('#fLength')).borderBottomStyle,widLine:getComputedStyle(document.querySelector('#fWidth')).borderBottomStyle}));
 assert.deepEqual(pic.on,[true,true,true,false],'picture: both long edges and one short edge banded');
 assert.equal(pic.len,'✓ Length: 2 edges');assert.equal(pic.wid,'✓ Width: 1 edge');
 assert.equal(pic.lenLine,'double','two edges still show as a double line');assert.equal(pic.widLine,'solid','one edge as a single line');
 // Double-click on Width still works and cycles 1 -> 2.
 await page.dblclick('#widthMeasureWrap');
 assert.equal((await parts())[0].edgeShort,2,'double-click still cycles the edge');
 await page.dblclick('#widthMeasureWrap');await page.dblclick('#widthMeasureWrap');
 assert.equal((await parts())[0].edgeShort,1,'back to one short edge');
 await click('#saveNextBtn');
 let p1=(await parts())[0];
 assert.deepEqual([p1.name,p1.length,p1.width,p1.thickness,p1.edgeLong,p1.edgeShort],['Top / Bottom',800,560,18,2,1],'panel 1 saved');

 await S(()=>createPartAt(40,20));
 let p2=(await parts())[1];
 assert.deepEqual([p2.edgeLong,p2.edgeShort,p2.notes,p2.length,p2.width],[0,0,'','',''],'with Keep settings off, edges, note and size are not copied');
 // Clicking the drawing while a panel is still selected never copies its size or quantity.
 await S(()=>{state.currentPart=cabinet().parts[0].id;renderAll()});
 await S(()=>createPartAt(50,50));
 let px=(await parts())[2];
 assert.deepEqual([px.length,px.width,px.qty],['','',1],'no size carried from the selected panel');
 assert.deepEqual((await parts())[0].length,800,'the selected panel keeps its own size');
 await S(()=>{const c=cabinet();c.parts.splice(2,1);state.currentPart=null;renderAll()});
 assert.equal(await S(()=>document.body.classList.contains('fiq-keep-on')),false);

 // 2. Keep settings: turn it on from panel 1, then every new panel copies its settings only.
 await S(()=>{cabinet().parts[0].qty=4;state.currentPart=cabinet().parts[0].id;renderAll()});
 await click('#keepSettingsBtn');
 const on=await S(()=>({body:document.body.classList.contains('fiq-keep-on'),pressed:document.getElementById('keepSettingsBtn').getAttribute('aria-pressed'),bar:getComputedStyle(document.getElementById('fiqKeepBar')).display,text:document.getElementById('fiqKeepText').textContent,save:getComputedStyle(document.getElementById('saveNextBtn'),'::after').content}));
 assert(on.body&&on.pressed==='true'&&on.bar==='flex','Keep settings shows as on');
 assert(on.text.includes('P-001')&&on.text.includes('Edges: length 2 edges, width 1 edge')&&on.text.includes('Size, quantity and name are not copied'),'the bar says what is copied: '+on.text);
 assert(on.save.includes('🔁'),'Save & next shows the keep sign');
 await S(()=>createPartAt(60,20));
 let p3=(await parts())[2];
 assert.deepEqual([p3.thickness,p3.material,p3.edgeLong,p3.edgeShort,p3.notes],[p1.thickness,p1.material,2,1,'Grain up'],'new panel copies the manufacturing settings');
 assert.deepEqual([p3.length,p3.width,p3.qty],['','',1],'size is never copied and quantity starts at 1, not the 4 of the panel before');
 assert.equal(p3.code,'P-003','numbering unchanged');
 // Change the edging on this panel: the next one follows the last saved panel.
 await page.evaluate(()=>{const set=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))};set('fLength','700');set('fWidth','300')});
 await click('#edgeDiagram .edge-top');
 await click('#saveNextBtn');
 await S(()=>createPartAt(80,20));
 let p4=(await parts())[3];
 assert.deepEqual([p4.edgeLong,p4.edgeShort],[0,1],'next panel follows the last saved panel');
 // Switching to another drawing turns it off; so does Turn off.
 await S(()=>{switchToProject('d1','c2');renderAll();show('mark')});
 assert.equal(await S(()=>document.body.classList.contains('fiq-keep-on')),false,'another drawing turns Keep settings off');
 await S(()=>createPartAt(20,20));
 assert.deepEqual((await S(()=>cabinet().parts.map(p=>[p.edgeLong,p.edgeShort])))[0],[0,0],'nothing copied into another drawing');
 await S(()=>{switchToProject('d1','c1');state.currentPart=cabinet().parts[0].id;renderAll();show('mark')});
 await click('#keepSettingsBtn');await click('#fiqKeepOff');
 assert.equal(await S(()=>document.body.classList.contains('fiq-keep-on')),false,'Turn off works');
 await S(()=>createPartAt(90,30));
 assert.deepEqual((await parts()).at(-1).edgeLong,0,'off again: nothing copied');

 // 3. Panel-number warning: same logic, compact bar, Done removes it. Panel ids stay the same.
 const idsBefore=(await parts()).map(p=>p.id);
 await S(()=>{const c=cabinet();deletePanelAndRenumber(c,c.parts[1]);renderAll();show('mark')});
 const warn=await S(()=>{const b=document.querySelector('#screen-mark .fiq-renumber-notice');const r=b.getBoundingClientRect();return {text:b.innerText.replace(/\s+/g,' ').trim(),h:r.height,done:!!b.querySelector('[data-renumber-done]')}});
 assert(warn.text.startsWith('⚠ Panel numbers changed: P-002 deleted · P-003 → P-002 · P-004 → P-003 · P-005 → P-004'),warn.text);
 assert(warn.text.includes('Old cutting lists, CSV files and labels')&&warn.done,'says what to redo and keeps Done');
 assert(warn.h<=70,'the warning is compact ('+warn.h+'px)');
 assert.deepEqual((await parts()).map(p=>p.id),idsBefore.filter((_,i)=>i!==1),'panel ids (QR identity) unchanged');
 await click('#screen-mark [data-renumber-done]');
 assert.equal(await S(()=>!!document.querySelector('#screen-mark .fiq-renumber-notice')||!!cabinet().panelNumbersNotice),false,'Done removes it');

 // 5. Start Design leaves the drawing empty; Site Measurements stays one click away.
 await S(()=>{const st=(0,eval)('state');st.projects.push({id:'s1',name:'Site job',customer:'Sam Site',rooms:[{id:'sr1',name:'Hall',measureCaptures:[{id:'cp',image:'data:image/png;base64,iVBORw0KGgo=',marks:[]}]}],cabinets:[],jobLog:[]});ensureCustomerForProject(st.projects.at(-1));startDesignFromSiteRoom('s1','sr1')});
 const design=await S(()=>{const c=cabinet();return {drawing:c.drawing,siteRef:!!c.siteReference,viewBtn:!document.getElementById('drawingViewSiteMeasurementBtn').hidden}});
 assert.deepEqual(design,{drawing:null,siteRef:false,viewBtn:true},'new design starts empty, Site Measurements button available');

 // 6. Help bubble: in the left navigation at every size, never over the work area or nav buttons.
 for(const [w,h] of [[1366,657],[1024,640],[700,600]]){
  await page.setViewportSize({width:w,height:h});await page.waitForTimeout(250);
  const r=await S(()=>{const f=document.querySelector('.fiq-help-fab'),side=document.querySelector('.app>.sidebar'),main=document.querySelector('.app>.main');const b=f.getBoundingClientRect(),m=main.getBoundingClientRect(),s=side.getBoundingClientRect();
   const hit=x=>!(b.right<=x.left||b.left>=x.right||b.bottom<=x.top||b.top>=x.bottom);
   return {inSide:side.contains(f),overMain:hit(m),overNav:[...side.querySelectorAll('.nav-btn')].some(n=>hit(n.getBoundingClientRect())),inView:b.bottom<=innerHeight&&b.top>=0,withinSide:b.left>=s.left&&b.right<=s.right}});
  assert.deepEqual(r,{inSide:true,overMain:false,overNav:false,inView:true,withinSide:true},`help bubble placement at ${w}x${h}`);
 }
 await click('.fiq-help-fab');
 assert.equal(await S(()=>!!document.querySelector('.fiq-help-panel.open')),true,'help chat still opens');

 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({quick,warning:warn.text,keep:on.text,ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
