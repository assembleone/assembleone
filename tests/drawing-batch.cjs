// Drawing area, as a carpenter uses it: enter a Shelf once, set edging on Length and Width,
// click the drawing 10 times for 10 identical shelves, then Save & next for a clean entry.
// Also: quick panel names, edging shown on the Length/Width boxes, the compact panel-numbers
// warning, Start Design leaving the drawing empty, and the help bubble in the left navigation.
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
 await page.waitForFunction(()=>typeof createPartAt==='function'&&typeof deletePanelAndRenumber==='function'&&typeof window.fiqRenderEdgeBoxes==='function');
 await page.waitForTimeout(800);
 await page.evaluate(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700"><rect width="1000" height="700" fill="#eee"/></svg>');
  const st=(0,eval)('state');
  st.projects.push({id:'d1',name:'Drawing job',customer:'Dora Draw',defaultMaterial:'Egger Oak',rooms:[{id:'r1',name:'Kitchen'}],
   cabinets:[{id:'c1',roomId:'r1',name:'Kitchen',drawing,drawingType:'image',parts:[]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));
  switchToProject('d1','c1');st.currentPart=null;renderAll();show('mark');
 });
 const S=fn=>page.evaluate(fn);
 const click=sel=>page.evaluate(sel=>document.querySelector(sel).click(),sel);
 const parts=()=>S(()=>JSON.parse(JSON.stringify(cabinet().parts)));
 const type=(id,v)=>page.evaluate(([id,v])=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))},[id,v]);
 const form=()=>S(()=>({length:document.getElementById('fLength').value,width:document.getElementById('fWidth').value,thickness:document.getElementById('fThickness').value,
  name:document.getElementById('partNamePicker').value,lenEdge:document.getElementById('lengthMeasureWrap').className,widEdge:document.getElementById('widthMeasureWrap').className,
  lenTag:document.querySelector('#lengthMeasureWrap .edge-count')?.textContent||'',widTag:document.querySelector('#widthMeasureWrap .edge-count')?.textContent||''}));
 let dot=0;
 const placeDot=async()=>{dot++;const col=(dot-1)%6,row=Math.floor((dot-1)/6);await page.locator('#drawingCanvas').click({position:{x:60+col*70,y:60+row*80},force:true});await page.waitForTimeout(120)};

 // Names: quick Side, Top / Bottom and Back; every specific name once in More part names.
 const quick=await S(()=>[...document.querySelectorAll('#screen-mark .quick-main > [data-quick-name]')].map(b=>[b.textContent.trim(),b.dataset.quickName]));
 assert.deepEqual(quick,[['Side','Side'],['Top / Bottom','Top / Bottom'],['Back','Back']],'quick choices say what they set');
 const library=await S(()=>[...document.querySelectorAll('#screen-mark .common-part-library [data-quick-name]')].map(b=>[b.dataset.quickName,b.textContent.trim()]));
 const libNames=library.map(x=>x[0]);
 for(const n of ['Left-hand side','Right-hand side','Top','Bottom','Back panel','Side panel','Shelf','Top and bottom'])assert(libNames.includes(n),n+' is in More part names');
 assert(!libNames.includes('Top / Bottom')&&!libNames.includes('Back'),'the quick names are not repeated in More part names');
 assert.deepEqual(library.find(x=>x[0]==='Top and bottom'),['Top and bottom','Top and bottom (older name)'],'the older combined name is marked');
 assert.equal(new Set(libNames).size,libNames.length,'no name listed twice');
 assert.equal(await S(()=>!!document.getElementById('keepSettingsBtn')||!!document.getElementById('fiqKeepBar')||!!document.getElementById('edgeDiagram')),false,'no Keep settings switch and no separate edge diagram');

 // 1. Enter one Shelf: name, thickness, size (material is the job's), then the first dot.
 await click('#screen-mark .common-part-library [data-quick-name="Shelf"]');
 await type('fThickness','18');await type('fLength','800');await type('fWidth','400');
 await placeDot();
 // Edging on both: one length edge (double-click once), two width edges (twice).
 await page.dblclick('#lengthMeasureWrap');
 await page.dblclick('#widthMeasureWrap');await page.dblclick('#widthMeasureWrap');
 let f=await form();
 assert.deepEqual([f.length,f.width,f.thickness,f.name,f.lenTag,f.widTag],['800','400','18','Shelf','1 edge','2 edges'],'first shelf on screen');
 assert(/edge-one/.test(f.lenEdge)&&/edge-two/.test(f.widEdge));
 assert.equal(await S(()=>document.getElementById('chosenPartSummary').textContent),'Name: Shelf','the chosen name reads as a name, not another button');

 // 2. Nine more dots: every one a full copy, and the form stays filled in the whole time.
 for(let i=2;i<=10;i++){
  await placeDot();
  f=await form();
  assert.deepEqual([f.length,f.width,f.thickness,f.name,f.lenTag,f.widTag],['800','400','18','Shelf','1 edge','2 edges'],'form unchanged after dot '+i);
 }
 let all=await parts();
 assert.equal(all.length,10,'10 panels');
 assert.deepEqual(all.map(p=>p.code),['P-001','P-002','P-003','P-004','P-005','P-006','P-007','P-008','P-009','P-010'],'numbered in order');
 assert.equal(new Set(all.map(p=>p.id)).size,10,'each panel its own id (QR identity)');
 for(const p of all)assert.deepEqual([p.name,p.length,p.width,p.thickness,p.material,p.edgeLong,p.edgeShort,Number(p.qty)],['Shelf',800,400,18,'Egger Oak',1,2,1],p.code+' identical');

 // 3. Save & next: a clean entry for a different panel. Material and thickness stay.
 await click('#saveNextBtn');
 await page.waitForTimeout(150);
 f=await form();
 assert.deepEqual([f.length,f.width,f.name,f.lenTag,f.widTag],['','','','',''],'size, edging and name cleared');
 assert(!/edge-(one|two)/.test(f.lenEdge+f.widEdge),'no edging classes left');
 assert.equal(f.thickness,'18','thickness stays');
 assert.equal(await S(()=>state.lastChosenPartName),'','name is a fresh choice');
 assert(!/^Name:/.test(await S(()=>document.getElementById('chosenPartSummary').textContent)),'no name shown after Save & next');
 assert.match(await S(()=>document.getElementById('materialSummary').textContent),/Egger Oak/,'material stays as the job setting');

 // 4. A different panel: nothing from the shelves comes back.
 await click('#screen-mark .quick-main [data-quick-name="Side"]');
 await type('fLength','720');await type('fWidth','560');
 await placeDot();
 await placeDot();
 all=await parts();
 for(const p of all.slice(10))assert.deepEqual([p.name,p.length,p.width,p.thickness,p.material,p.edgeLong,p.edgeShort],['Side',720,560,18,'Egger Oak',0,0],p.code+' is a clean Side');
 assert.equal(all.length,12);
 // And with nothing typed, a dot after Save & next gets no old size.
 await click('#saveNextBtn');await page.waitForTimeout(150);
 await placeDot();
 const last=(await parts()).at(-1);
 assert.deepEqual([last.name,last.length,last.width,last.edgeLong,last.edgeShort],['','','',0,0],'no hidden copying after Save & next');

 // 5. Edging shown on the boxes at laptop and smaller widths.
 await S(()=>{state.currentPart=cabinet().parts[0].id;renderAll();show('mark')});
 for(const [w,h] of [[1366,657],[1024,640],[820,600]]){
  await page.setViewportSize({width:w,height:h});await page.waitForTimeout(200);
  const b=await S(()=>{const cs=id=>getComputedStyle(document.getElementById(id));const L=cs('lengthMeasureWrap'),W=cs('widthMeasureWrap');
   const tag=document.querySelector('#lengthMeasureWrap .edge-count').getBoundingClientRect(),box=document.getElementById('lengthMeasureWrap').getBoundingClientRect();
   return {lenBottom:[L.borderBottomStyle,L.borderBottomWidth],lenTop:[L.borderTopStyle,L.borderTopWidth],widLeft:[W.borderLeftStyle,W.borderLeftWidth],widRight:[W.borderRightStyle,W.borderRightWidth],tagInside:tag.left>=box.left&&tag.right<=box.right&&tag.top>=box.top&&tag.bottom<=box.bottom}});
  const size=await S(()=>{const box=id=>document.getElementById(id).getBoundingClientRect();const u=document.getElementById('unitsToggle').getBoundingClientRect();return {fonts:['fThickness','fLength','fWidth','fQty'].map(id=>parseFloat(getComputedStyle(document.getElementById(id)).fontSize)),lenH:box('lengthMeasureWrap').height,widH:box('widthMeasureWrap').height,unitsH:u.height,label:getComputedStyle(document.getElementById('unitsToggle'),'::before').content}});
  assert(size.fonts.every(x=>x>=34),`measurement numbers stay large at ${w}px: ${size.fonts}`);
  assert(size.lenH>=70&&size.widH>=70,`Length and Width boxes stay large at ${w}px`);
  assert(size.unitsH<=40&&size.label==='"Measurements"',`slim Measurements line with mm / cm / in at ${w}px`);
  assert.deepEqual(b,{lenBottom:['solid','5px'],lenTop:['dashed','2px'],widLeft:['solid','5px'],widRight:['solid','5px'],tagInside:true},`edging on the boxes at ${w}x${h}`);
 }
 await page.setViewportSize({width:1366,height:657});

 // 6. Panel-number warning: same logic, compact bar, Done removes it. Panel ids stay.
 const idsBefore=(await parts()).map(p=>p.id);
 await S(()=>{const c=cabinet();deletePanelAndRenumber(c,c.parts[1]);renderAll();show('mark')});
 const warn=await S(()=>{const b=document.querySelector('#screen-mark .fiq-renumber-notice');const r=b.getBoundingClientRect();return {text:b.innerText.replace(/\s+/g,' ').trim(),h:r.height,done:!!b.querySelector('[data-renumber-done]')}});
 assert(warn.text.startsWith('⚠ Panel numbers changed: P-002 deleted · P-003 → P-002 · P-004 → P-003'),warn.text);
 assert(warn.text.includes('+')&&warn.text.includes('more'),'long lists fold into "+N more"');
 assert(warn.done&&warn.h<=70,'compact ('+warn.h+'px) with Done');
 assert.deepEqual((await parts()).map(p=>p.id),idsBefore.filter((_,i)=>i!==1),'panel ids (QR identity) unchanged');
 await click('#screen-mark [data-renumber-done]');
 assert.equal(await S(()=>!!document.querySelector('#screen-mark .fiq-renumber-notice')||!!cabinet().panelNumbersNotice),false,'Done removes it');

 // 7. Start Design leaves the drawing empty; Site Measurements stays one click away.
 await S(()=>{const st=(0,eval)('state');st.projects.push({id:'s1',name:'Site job',customer:'Sam Site',rooms:[{id:'sr1',name:'Hall',measureCaptures:[{id:'cp',image:'data:image/png;base64,iVBORw0KGgo=',marks:[]}]}],cabinets:[],jobLog:[]});ensureCustomerForProject(st.projects.at(-1));startDesignFromSiteRoom('s1','sr1')});
 const design=await S(()=>{const c=cabinet();return {drawing:c.drawing,siteRef:!!c.siteReference,viewBtn:!document.getElementById('drawingViewSiteMeasurementBtn').hidden}});
 assert.deepEqual(design,{drawing:null,siteRef:false,viewBtn:true},'new design starts empty, Site Measurements button available');

 // 8. Help bubble: in the left navigation at every size, never over the work area or nav buttons.
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
 console.log(JSON.stringify({quick,shelves:10,warning:warn.text,ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
