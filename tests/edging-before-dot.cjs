// Edging can be prepared before the first dot. Shelf -> 2400 x 600 -> 2 Length edges and
// 2 Width edges with NO dot yet -> first dot has all of it -> more dots repeat it -> Save & next
// -> a different panel with its own edging, again set before its first dot. Also: a dot first
// and edging afterwards still works (no fixed order).
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
 const errors=[],dialogs=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>{dialogs.push(d.message());d.accept()});
 await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 await page.goto(`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>typeof createPartAt==='function'&&typeof window.fiqRenderUnits==='function'&&typeof window.commitAssembleOneMaterial==='function');
 await page.waitForTimeout(800);
 await page.evaluate(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700"><rect width="1000" height="700" fill="#eee"/></svg>');
  const st=(0,eval)('state');
  st.projects.push({id:'e1',name:'Edge job',customer:'Eve',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'c1',roomId:'r1',name:'Kitchen',drawing,drawingType:'image',parts:[],lastThickness:19}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));
  switchToProject('e1','c1');st.currentPart=null;renderAll();show('mark');
  window.commitAssembleOneMaterial('White melamine');
 });
 const S=fn=>page.evaluate(fn);
 const click=sel=>page.evaluate(sel=>document.querySelector(sel).click(),sel);
 const type=async(id,v)=>{await page.click('#'+id);await page.keyboard.press('Control+A');await page.keyboard.type(v)};
 const screen=()=>S(()=>{const tag=id=>document.getElementById(id).closest('.measure-field').querySelector('.edge-count')?.textContent||'';const cls=id=>{const c=document.getElementById(id).className;return /edge-two/.test(c)?2:/edge-one/.test(c)?1:0};
  return {len:document.getElementById('fLength').value,wid:document.getElementById('fWidth').value,thk:document.getElementById('fThickness').value,name:document.getElementById('partNamePicker').value,
   lenEdges:cls('lengthMeasureWrap'),widEdges:cls('widthMeasureWrap'),lenTag:tag('lengthMeasureWrap'),widTag:tag('widthMeasureWrap'),panels:cabinet().parts.length,selected:state.currentPart}});
 const parts=()=>S(()=>JSON.parse(JSON.stringify(cabinet().parts)));
 let dot=0;const placeDot=async()=>{dot++;const col=(dot-1)%6,row=Math.floor((dot-1)/6);await page.locator('#drawingCanvas').click({position:{x:60+col*60,y:60+row*70},force:true});await page.waitForTimeout(150)};
 const dbl=async(id,n)=>{for(let i=0;i<n;i++){await page.dblclick('#'+id);await page.waitForTimeout(40)}};

 // 1. Prepare everything with NO dot: Shelf, 2400 x 600, 2 Length edges, 2 Width edges.
 await click('#screen-mark .common-part-library [data-quick-name="Shelf"]');
 await type('fLength','2400');await type('fWidth','600');
 await dbl('lengthMeasureWrap',2);await dbl('widthMeasureWrap',2);
 let s=await screen();
 assert.deepEqual(s,{len:'2400',wid:'600',thk:'19',name:'Shelf',lenEdges:2,widEdges:2,lenTag:'2 edges',widTag:'2 edges',panels:0,selected:null},'edging shown before any dot exists');
 assert.deepEqual(dialogs,[],'no "select a panel first" message');

 // 2. First dot: the panel has everything prepared on screen.
 await placeDot();
 let p=(await parts())[0];
 assert.deepEqual([p.code,p.name,p.length,p.width,p.thickness,p.material,p.edgeLong,p.edgeShort],['P-001','Shelf',2400,600,19,'White melamine',2,2],'first dot inherits sizes, name, thickness, material and all four edges');

 // 3. More dots repeat the same complete panel.
 for(let i=0;i<4;i++)await placeDot();
 let all=await parts();
 assert.equal(all.length,5);
 all.forEach(x=>assert.deepEqual([x.name,x.length,x.width,x.thickness,x.material,x.edgeLong,x.edgeShort],['Shelf',2400,600,19,'White melamine',2,2],x.code+' repeats the shelf'));
 s=await screen();
 assert.deepEqual([s.len,s.wid,s.lenEdges,s.widEdges],['2400','600',2,2],'form still shows the shelf');

 // 4. Save & next, then a different panel prepared with its own edging before its first dot.
 await click('#saveNextBtn');await page.waitForTimeout(700);
 s=await screen();
 assert.deepEqual([s.thk,s.len,s.wid,s.lenEdges,s.widEdges,s.lenTag,s.widTag,s.name],['19','','',0,0,'','',''],'clean entry after Save & next');
 await click('#screen-mark .quick-main [data-quick-name="Side"]');
 await type('fLength','720');await type('fWidth','560');
 await dbl('lengthMeasureWrap',1);
 s=await screen();
 assert.deepEqual([s.lenEdges,s.widEdges,s.lenTag,s.panels],[1,0,'1 edge',5],'1 Length edge prepared, still no new panel');
 await placeDot();await placeDot();
 all=await parts();
 all.slice(5).forEach(x=>assert.deepEqual([x.name,x.length,x.width,x.thickness,x.edgeLong,x.edgeShort],['Side',720,560,19,1,0],x.code+' is the prepared Side'));
 assert.deepEqual(all.slice(0,5).map(x=>[x.edgeLong,x.edgeShort]),Array(5).fill([2,2]),'the shelves are unchanged');

 // 5. No fixed order: dot first, edging afterwards, on the selected panel only.
 await click('#saveNextBtn');await page.waitForTimeout(700);
 await click('#screen-mark .quick-main [data-quick-name="Back"]');
 await type('fLength','800');await type('fWidth','400');
 await placeDot();
 await dbl('widthMeasureWrap',1);
 p=(await parts()).at(-1);
 assert.deepEqual([p.name,p.length,p.width,p.edgeLong,p.edgeShort],['Back',800,400,0,1],'edging set after the dot goes on that panel');
 assert.deepEqual((await parts()).slice(5,7).map(x=>[x.edgeLong,x.edgeShort]),[[1,0],[1,0]],'earlier panels untouched');

 // 6. Prepared edging with no dot: without a part name Save & next is refused and keeps it;
 //    with a part name Save & next clears it.
 await click('#saveNextBtn');await page.waitForTimeout(700);
 await dbl('lengthMeasureWrap',2);
 await click('#saveNextBtn');await page.waitForTimeout(700);
 s=await screen();
 assert.deepEqual([s.lenEdges,s.widEdges],[2,0],'no part name: Save & next refused, prepared edging kept');
 assert.equal(await S(()=>document.getElementById('fiqMissingMsg')?.innerText.trim()),'⚠ Choose a part name first');
 await click('#screen-mark .quick-main [data-quick-name="Side"]');await page.waitForTimeout(50);
 await click('#saveNextBtn');await page.waitForTimeout(700);
 s=await screen();
 assert.deepEqual([s.lenEdges,s.widEdges],[0,0],'with a part name, Save & next clears prepared edging');

 assert.deepEqual(errors,[],'no page errors');
 assert.deepEqual(dialogs,[],'no pop-up dialogs');
 console.log(JSON.stringify({panels:(await parts()).map(x=>x.code+' '+x.name+' '+x.length+'x'+x.width+' E'+x.edgeLong+'/'+x.edgeShort),ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
