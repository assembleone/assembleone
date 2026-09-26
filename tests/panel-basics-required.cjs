// Every panel needs a Material and a Part Name. A new dot and Save & next are refused while
// either is missing, with "Choose a material first" / "Choose a part name first", the missing
// control(s) outlined and brought into view, and nothing already entered cleared.
// Material carried forward counts; the part name does not carry past Save & next; repeated
// dots keep both. Runs the real public Studio loader with every network request blocked.
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
 const errors=[],dialogs=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>{dialogs.push(d.message());d.accept()});
 await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 await page.goto(`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>typeof createPartAt==='function'&&typeof window.fiqShowMissingBasics==='function');
 await page.waitForTimeout(800);
 // A brand-new job with no material yet.
 await page.evaluate(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700"><rect width="1000" height="700" fill="#eee"/></svg>');
  const st=(0,eval)('state');
  st.projects.push({id:'m1',name:'Rules job',customer:'Rita',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'c1',roomId:'r1',name:'Kitchen',drawing,drawingType:'image',parts:[],lastThickness:19}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));
  switchToProject('m1','c1');st.currentPart=null;st.lastChosenPartName='';renderAll();show('mark');
 });
 const S=fn=>page.evaluate(fn);
 const click=sel=>page.evaluate(sel=>document.querySelector(sel).click(),sel);
 const type=async(id,v)=>{await page.click('#'+id);await page.keyboard.press('Control+A');await page.keyboard.type(v)};
 const dbl=async(id,n)=>{for(let i=0;i<n;i++){await page.dblclick('#'+id);await page.waitForTimeout(40)}};
 let dot=0;const placeDot=async()=>{dot++;const col=(dot-1)%6,row=Math.floor((dot-1)/6);await page.evaluate(()=>document.getElementById('drawingCanvas').scrollIntoView({block:'center'}));await page.waitForTimeout(50);await page.locator('#drawingCanvas').click({position:{x:60+col*60,y:60+row*70},force:true});await page.waitForTimeout(150)};
 const count=()=>S(()=>cabinet().parts.length);
 const warn=()=>S(()=>{const m=document.getElementById('fiqMissingMsg');const out=el=>!!el&&el.classList.contains('fiq-missing');
  return {msg:m?m.innerText.trim():'',visible:!!m&&(()=>{const r=m.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight})(),
   name:out(document.querySelector('#screen-mark .quick-main')),material:out(document.getElementById('materialPickerDetails'))}});
 const entry=()=>S(()=>{const cls=id=>{const c=document.getElementById(id).className;return /edge-two/.test(c)?2:/edge-one/.test(c)?1:0};
  return {thk:document.getElementById('fThickness').value,len:document.getElementById('fLength').value,wid:document.getElementById('fWidth').value,qty:document.getElementById('fQty').value,lenEdges:cls('lengthMeasureWrap'),widEdges:cls('widthMeasureWrap')}});
 const settle=()=>page.waitForTimeout(500);

 // 1. Both missing: 2400 x 600 with edging prepared, no material and no name.
 await type('fLength','2400');await type('fWidth','600');await dbl('lengthMeasureWrap',2);await dbl('widthMeasureWrap',1);
 await placeDot();await settle();
 let w=await warn();
 assert.equal(await count(),0,'both missing: no panel created');
 assert.equal(w.msg,'⚠ Choose a material first\n⚠ Choose a part name first','both messages');
 assert.deepEqual([w.name,w.material,w.visible],[true,true,true],'both controls outlined, message in view');
 assert.deepEqual(await entry(),{thk:'19',len:'2400',wid:'600',qty:'1',lenEdges:2,widEdges:1},'nothing entered is cleared');

 // 2. Material missing (name chosen).
 await click('#screen-mark .common-part-library [data-quick-name="Shelf"]');await page.waitForTimeout(50);
 w=await warn();
 assert.deepEqual([w.name,w.material],[false,true],'choosing a name clears only the name warning');
 await placeDot();await settle();
 w=await warn();
 assert.equal(await count(),0,'material missing: no panel created');
 assert.equal(w.msg,'⚠ Choose a material first');
 assert.deepEqual([w.name,w.material,w.visible],[false,true,true],'material outlined');
 assert.deepEqual(await entry(),{thk:'19',len:'2400',wid:'600',qty:'1',lenEdges:2,widEdges:1},'still nothing cleared');

 // Choose a material: the first dot now works and gets everything.
 await S(()=>{document.getElementById('materialPickerDetails').open=true;renderMaterialPicker()});
 await click('#materialLibraryGrid [data-material-name="White melamine"]');await page.waitForTimeout(80);
 assert.equal((await warn()).msg,'','warning gone once both are chosen');
 await placeDot();
 let p=await S(()=>JSON.parse(JSON.stringify(cabinet().parts[0])));
 assert.deepEqual([p.name,p.material,p.length,p.width,p.thickness,p.edgeLong,p.edgeShort],['Shelf','White melamine',2400,600,19,2,1],'first panel complete');

 // 3. Repeated identical panels: no prompts, name and material repeat.
 for(let i=0;i<3;i++)await placeDot();
 assert.equal(await count(),4);
 assert.deepEqual(await S(()=>[...new Set(cabinet().parts.map(x=>x.name+'|'+x.material))]),['Shelf|White melamine'],'repeated dots keep name and material');
 assert.equal((await warn()).msg,'');

 // 4. Save & next: material carried forward counts; the part name must be chosen again.
 await click('#saveNextBtn');await page.waitForTimeout(700);
 await type('fLength','720');await type('fWidth','560');await dbl('lengthMeasureWrap',1);
 await placeDot();await settle();
 w=await warn();
 assert.equal(await count(),4,'part name missing after Save & next: no panel created');
 assert.equal(w.msg,'⚠ Choose a part name first','only the part name is missing; the material carried forward');
 assert.deepEqual([w.name,w.material],[true,false]);
 assert.deepEqual(await entry(),{thk:'19',len:'720',wid:'560',qty:'1',lenEdges:1,widEdges:0},'nothing cleared');
 await click('#screen-mark .quick-main [data-quick-name="Side"]');await page.waitForTimeout(50);
 await placeDot();
 p=await S(()=>JSON.parse(JSON.stringify(cabinet().parts.at(-1))));
 assert.deepEqual([p.name,p.material,p.length,p.width,p.edgeLong],['Side','White melamine',720,560,1],'Side created with the carried-forward material');

 // 5. Save & next on a panel that has no part name (for example older data): refused,
 //    the panel stays selected and nothing is cleared.
 await S(()=>{const q=cabinet().parts.at(-1);q.name='';state.lastChosenPartName='';renderAll();show('mark')});
 const selected=await S(()=>state.currentPart);
 await click('#saveNextBtn');await settle();
 w=await warn();
 assert.equal(w.msg,'⚠ Choose a part name first','Save & next refused without a part name');
 assert.equal(await S(()=>state.currentPart),selected,'the panel stays selected');
 assert.deepEqual(await entry(),{thk:'19',len:'720',wid:'560',qty:'1',lenEdges:1,widEdges:0},'nothing cleared');
 await click('#screen-mark .quick-main [data-quick-name="Back"]');await page.waitForTimeout(50);
 await click('#saveNextBtn');await page.waitForTimeout(700);
 assert.equal(await S(()=>state.currentPart),null,'Save & next works once a name is chosen');
 assert.deepEqual(await S(()=>cabinet().parts.map(x=>x.name)),['Shelf','Shelf','Shelf','Shelf','Back'],'the chosen name went on that same panel; no extra panel');
 assert.deepEqual(await S(()=>{const q=cabinet().parts.at(-1);return [q.length,q.width,q.edgeLong]}),[720,560,1],'its size and edging were kept');

 // 6. Save & next on a panel with no material anywhere: refused with the material message.
 await S(()=>{const pr=project(),c=cabinet();pr.defaultMaterial='';c.lastMaterial='';const q=c.parts.at(-1);q.material='';state.currentPart=q.id;renderAll();show('mark')});
 await click('#saveNextBtn');await settle();
 w=await warn();
 assert.equal(w.msg,'⚠ Choose a material first','Save & next refused without a material');
 assert.equal(await S(()=>!!state.currentPart),true,'the panel stays selected');

 assert.deepEqual(errors,[],'no page errors');
 assert.deepEqual(dialogs,[],'no pop-up dialogs');
 console.log(JSON.stringify({panels:await S(()=>cabinet().parts.map(x=>x.code+' '+x.name+' '+(x.material||'-'))),ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
