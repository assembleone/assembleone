// Material and Part Name are checked only when Save & next is pressed. Placing a dot is never
// blocked. The real workflow, with mouse and keyboard only:
//   place the dot -> type Length and Width -> edging -> choose Part Name and Material ->
//   Save & next.
// If the Part Name or Material is missing at Save & next it stops, says what is missing, and
// nothing entered is cleared or changed; the panel stays selected. Repeated dots still repeat.
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
 const errors=[],dialogs=[];
 // A fresh browser per case, each with a new job that has no material yet (setup only).
 async function fresh(){
  const page=await browser.newPage({viewport:{width:512,height:900}});
  page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>{dialogs.push(d.message());d.accept()});
  if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/'),r=>r.abort());
  else await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
  await page.goto(process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
  await page.waitForFunction(()=>typeof createPartAt==='function'&&typeof window.fiqShowMissingBasics==='function');
  await page.waitForTimeout(800);
  await page.evaluate(()=>{
   document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
   const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700"><rect width="1000" height="700" fill="#eee"/></svg>');
   const st=(0,eval)('state');
   st.projects.push({id:'m1',name:'Rules job',customer:'Rita',defaultMaterial:'',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'c1',roomId:'r1',name:'Kitchen',drawing,drawingType:'image',parts:[],lastThickness:19,lastMaterial:''}],jobLog:[],updatedAt:Date.now()});
   ensureCustomerForProject(st.projects.at(-1));
   switchToProject('m1','c1');st.currentPart=null;st.lastChosenPartName='';renderAll();show('mark');
  });
  return page;
 }
 // Real UI actions only from here on.
 const act=page=>({
  dot:async x=>{await page.evaluate(()=>document.getElementById('drawingCanvas').scrollIntoView({block:'center'}));await page.waitForTimeout(80);await page.locator('#drawingCanvas').click({position:{x,y:90}});await page.waitForTimeout(200)},
  type:async(id,v)=>{await page.locator('#'+id).scrollIntoViewIfNeeded();await page.click('#'+id);await page.keyboard.press('Control+A');await page.keyboard.type(v);await page.waitForTimeout(60)},
  edges:async(id,n)=>{for(let i=0;i<n;i++){await page.locator('#'+id).dblclick();await page.waitForTimeout(60)}},
  name:async n=>{const b=page.locator(`#screen-mark .quick-main [data-quick-name="${n}"]`);await b.scrollIntoViewIfNeeded();await b.click();await page.waitForTimeout(80)},
  material:async m=>{const sum=page.locator('#materialSummary');await sum.scrollIntoViewIfNeeded();await sum.click();await page.waitForTimeout(80);const b=page.locator(`#materialLibraryGrid [data-material-name="${m}"]`);await b.click();await page.waitForTimeout(80)},
  save:async()=>{const b=page.locator('#saveNextBtn');await b.scrollIntoViewIfNeeded();await b.click();await page.waitForTimeout(700)},
 });
 const look=page=>page.evaluate(()=>{const cls=id=>{const c=document.getElementById(id).className;return /edge-two/.test(c)?2:/edge-one/.test(c)?1:0};const m=document.getElementById('fiqMissingMsg');
  return {len:document.getElementById('fLength').value,wid:document.getElementById('fWidth').value,thk:document.getElementById('fThickness').value,qty:document.getElementById('fQty').value,
   lenE:cls('lengthMeasureWrap'),widE:cls('widthMeasureWrap'),selected:!!state.currentPart,msg:m?m.innerText.trim():'',
   panels:cabinet().parts.map(p=>[p.name||'',p.material||'',p.length,p.width,p.edgeLong,p.edgeShort])}});

 // 1. The normal workflow: dot first, then sizes, edging, Part Name and Material, Save & next.
 let page=await fresh(),a=act(page);
 await a.dot(80);
 let v=await look(page);
 assert.deepEqual([v.panels.length,v.selected,v.msg],[1,true,''],'a dot is placed with no name or material and no message');
 await a.type('fLength','2400');await a.type('fWidth','600');await a.edges('lengthMeasureWrap',2);await a.edges('widthMeasureWrap',1);
 await a.name('Side');await a.material('White melamine');
 await a.save();
 v=await look(page);
 assert.deepEqual(v.panels,[['Side','White melamine',2400,600,2,1]],'panel finished with everything entered');
 assert.deepEqual([v.selected,v.msg,v.len,v.wid,v.lenE,v.widE,v.thk,v.qty],[false,'','','',0,0,'19','1'],'Save & next went through to a clean entry');
 await page.close();

 // 2. Part Name missing at Save & next.
 page=await fresh();a=act(page);
 await a.dot(80);await a.type('fLength','2400');await a.type('fWidth','600');await a.edges('lengthMeasureWrap',2);await a.edges('widthMeasureWrap',2);
 await a.material('White melamine');
 let before=await look(page);
 await a.save();
 v=await look(page);
 assert.equal(v.msg,'⚠ Choose a part name first','part name missing: stopped');
 assert.deepEqual({...v,msg:''},{...before,msg:''},'part name missing: nothing cleared or changed, panel still selected');
 await a.name('Back');await a.save();
 v=await look(page);
 assert.deepEqual([v.panels,v.selected,v.msg],[[['Back','White melamine',2400,600,2,2]],false,''],'after choosing the name Save & next works');
 await page.close();

 // 3. Material missing at Save & next.
 page=await fresh();a=act(page);
 await a.dot(80);await a.type('fLength','720');await a.type('fWidth','560');await a.edges('lengthMeasureWrap',1);
 await a.name('Side');
 before=await look(page);
 await a.save();
 v=await look(page);
 assert.equal(v.msg,'⚠ Choose a material first','material missing: stopped');
 assert.deepEqual({...v,msg:''},{...before,msg:''},'material missing: nothing cleared or changed');
 await a.material('White melamine');await a.save();
 v=await look(page);
 assert.deepEqual([v.panels,v.selected,v.msg],[[['Side','White melamine',720,560,1,0]],false,''],'after choosing the material Save & next works');
 await page.close();

 // 4. Both missing at Save & next.
 page=await fresh();a=act(page);
 await a.dot(80);await a.type('fLength','800');await a.type('fWidth','400');await a.edges('widthMeasureWrap',2);
 before=await look(page);
 await a.save();
 v=await look(page);
 assert.equal(v.msg,'⚠ Choose a material first\n⚠ Choose a part name first','both missing: stopped with both messages');
 assert.deepEqual({...v,msg:''},{...before,msg:''},'both missing: nothing cleared or changed');
 assert.deepEqual(await page.evaluate(()=>[document.querySelector('#screen-mark .quick-main').classList.contains('fiq-missing'),document.getElementById('materialPickerDetails').classList.contains('fiq-missing')]),[true,true],'both controls outlined');

 // 5. Repeated dots keep working: after choosing name and material, more dots repeat the panel.
 await a.name('Top / Bottom');await a.material('Oak melamine');
 await a.dot(180);await a.dot(280);
 v=await look(page);
 assert.deepEqual(v.panels,Array(3).fill(['Top / Bottom','Oak melamine',800,400,0,2]),'repeated dots copy the complete panel');
 await a.save();
 v=await look(page);
 assert.deepEqual([v.selected,v.msg,v.len,v.wid],[false,'','',''],'Save & next after repeated dots');
 await page.close();

 assert.deepEqual(errors,[],'no page errors');
 assert.deepEqual(dialogs,[],'no pop-up dialogs');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
