// Drawing lifecycle: panel dots belong to the drawing they were placed on. Real Drawing
// screen: file input for Choose drawing, clicks on the drawing for dots, the Delete drawing
// button, and reloads of Studio in between:
//  1. old drawing -> three dots -> reload (drawing now in stored form) -> Delete drawing:
//     asks first (Cancel keeps everything) -> "Delete and remove panels" -> Choose new
//     drawing: no question, zero dots -> reload: still the new drawing, zero dots/panels;
//     the other unit's panels are untouched;
//  2. dots on the new drawing -> Choose another drawing -> "Replace drawing?" -> Cancel keeps
//     it, "Replace and remove panels" starts clean -> reload: still clean;
//  3. a unit left with old panels but no drawing (the earlier bug's leftover) asks before
//     a new drawing is chosen and then starts clean;
//  4. a later Mobile update carrying the removed panels does not bring them back.
// Runs the real public Studio loader with every network request blocked.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const svg=(fill,label)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700"><rect width="1000" height="700" fill="${fill}"/><text x="40" y="80" font-size="48">${label}</text></svg>`;
const files=['old','new','third','fourth'].map((n,i)=>{const f=path.join(os.tmpdir(),'fiq-drawing-'+n+'.svg');fs.writeFileSync(f,svg(['#ddeeff','#ffeedd','#eeffdd','#f5e0ff'][i],n.toUpperCase()));return f});
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:1366,height:900}});
 const page=await ctx.newPage();
 const errors=[],dialogs=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>{dialogs.push(d.message());d.accept()});
 if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/'),r=>r.abort());
 else await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 const url=process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`;
 const S=(fn,a)=>page.evaluate(fn,a);
 async function load(){
  await page.goto(url);
  await page.waitForFunction(()=>typeof createPartAt==='function'&&typeof deleteCurrentDrawing==='function');
  await page.waitForTimeout(900);
  await S(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});
 }
 await load();
 await S(()=>{
  const st=(0,eval)('state');
  const other={id:'bp1',code:'P-001',name:'Side',length:700,width:500,thickness:18,qty:1,material:'Oak',edgeLong:0,edgeShort:0,notes:'',status:'ready',x:30,y:30,copies:[]};
  st.projects.push({id:'dj',name:'Drawing job',customer:'Dina Drawing',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'ua',roomId:'r1',name:'Unit A',parts:[]},{id:'ub',roomId:'r1',name:'Unit B',drawing:'data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>'),drawingType:'image',parts:[other]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));switchToProject('dj','ua');save();renderAll();show('mark');
 });
 const open=async()=>{await S(()=>{switchToProject('dj','ua');renderAll();show('mark')});await page.waitForTimeout(400)};
 const choose=async file=>{await page.locator('#drawingInputTop').setInputFiles(file);await page.waitForTimeout(700)};
 // One dot is one defined panel: the first dot, then its details, then repeated dots.
 const fillPanel=async()=>{
  for(const [id,v] of [['fLength','700'],['fWidth','500']]){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.click('#'+id);await page.keyboard.press('Control+A');await page.keyboard.type(v)}
  const n=page.locator('#screen-mark .quick-main [data-quick-name="Side"]');await n.scrollIntoViewIfNeeded();await n.click();
  await page.locator('#materialSummary').scrollIntoViewIfNeeded();await page.locator('#materialSummary').click();await page.locator('#materialLibraryGrid [data-material-name="White melamine"]').click();await page.waitForTimeout(150);
 };
 const dots=async points=>{for(const [i,[x,y]] of points.entries()){await S(()=>document.getElementById('drawingCanvas').scrollIntoView({block:'center'}));const b=await page.locator('#drawingCanvas').boundingBox();await page.mouse.click(b.x+b.width*x,b.y+b.height*y);await page.waitForTimeout(250);if(i===0)await fillPanel()}};
 const unitA=()=>S(()=>{const c=(0,eval)('state').projects.find(p=>p.id==='dj').cabinets.find(c=>c.id==='ua');return {name:c.drawingName||'',hasDrawing:!!c.drawing,parts:c.parts.length,codes:c.parts.map(p=>p.code),pins:document.querySelectorAll('#drawingCanvas .pin').length}});
 const unitB=()=>S(()=>{const c=(0,eval)('state').projects.find(p=>p.id==='dj').cabinets.find(c=>c.id==='ub');return c.parts.map(p=>p.id+':'+p.x+','+p.y).join()});
 const dialog=()=>S(()=>{const d=document.querySelector('.fiq-drawing-replace-dialog');return d?d.innerText.replace(/\s+/g,' ').trim():''});
 const reload=async()=>{await load();await page.waitForFunction(()=>(0,eval)('state').projects.some(p=>p.id==='dj'));await open()};

 // 1. Old drawing with three dots.
 await open();await choose(files[0]);
 await dots([[.3,.4],[.5,.4],[.7,.4]]);
 let a=await unitA();assert.deepEqual([a.name,a.parts,a.pins],['fiq-drawing-old.svg',3,3],'three dots on the old drawing');
 await reload();// the drawing is now kept in its stored form
 assert.deepEqual([(await unitA()).name,(await unitA()).parts],['fiq-drawing-old.svg',3]);
 // Delete drawing: asks; Cancel keeps everything.
 await page.locator('#deleteDrawingBtn').click();await page.waitForTimeout(300);
 assert.equal(await dialog(),'Delete drawing? This drawing has 3 panels attached to it. Deleting it will remove those panel dots and their associated panel data from this drawing. Cancel Delete and remove panels');
 await page.locator('[data-drawing-cancel]').click();await page.waitForTimeout(250);
 a=await unitA();assert.deepEqual([a.name,a.parts,a.pins],['fiq-drawing-old.svg',3,3],'Cancel keeps drawing and panels');
 await page.locator('#deleteDrawingBtn').click();await page.waitForTimeout(300);
 await page.locator('[data-drawing-go]').click();await page.waitForTimeout(400);
 a=await unitA();assert.deepEqual([a.hasDrawing,a.parts],[false,0],'drawing and its panels removed');
 // Choose the new drawing: no question (nothing attached), starts clean.
 await choose(files[1]);
 assert.equal(await dialog(),'','no unnecessary question');
 a=await unitA();assert.deepEqual([a.name,a.parts,a.pins],['fiq-drawing-new.svg',0,0],'new drawing, zero inherited dots');
 await reload();
 a=await unitA();assert.deepEqual([a.name,a.parts,a.pins],['fiq-drawing-new.svg',0,0],'after reload: still the new drawing, old dots do not return');
 assert.equal(await unitB(),'bp1:30,30','the other unit is untouched');

 // 2. Replace a drawing that has dots.
 await dots([[.4,.5],[.6,.5]]);
 a=await unitA();assert.deepEqual([a.parts,a.codes],[2,['P-001','P-002']],'numbering starts again at P-001');
 await page.locator('#drawingInputTop').setInputFiles(files[2]);await page.waitForTimeout(400);
 assert.equal(await dialog(),'Replace drawing? This drawing has 2 panels attached to it. Replacing it will remove those panel dots and their associated panel data from this drawing. Cancel Replace and remove panels');
 await page.locator('[data-drawing-cancel]').click();await page.waitForTimeout(400);
 a=await unitA();assert.deepEqual([a.name,a.parts],['fiq-drawing-new.svg',2],'Cancel: drawing and panels unchanged');
 await page.locator('#drawingInputTop').setInputFiles(files[2]);await page.waitForTimeout(400);
 await page.locator('[data-drawing-go]').click();await page.waitForTimeout(700);
 a=await unitA();assert.deepEqual([a.name,a.parts,a.pins],['fiq-drawing-third.svg',0,0],'replaced, clean');
 await reload();
 a=await unitA();assert.deepEqual([a.name,a.parts,a.pins],['fiq-drawing-third.svg',0,0],'after reload: still clean');

 // 3. Leftover from the earlier bug: panels with dots but the drawing already gone.
 await S(()=>{const c=(0,eval)('state').projects.find(p=>p.id==='dj').cabinets.find(c=>c.id==='ua');c.drawing=null;delete c.hasStoredDrawing;c.parts=[{id:'lx',code:'P-001',name:'Old',length:500,width:400,thickness:18,qty:1,material:'Oak',edgeLong:0,edgeShort:0,notes:'',status:'ready',x:50,y:50,copies:[]}];save();renderAll()});
 await page.locator('#drawingInputTop').setInputFiles(files[3]);await page.waitForTimeout(400);
 assert.match(await dialog(),/^Choose a new drawing\? This unit still has 1 panel from its previous drawing\./);
 await page.locator('[data-drawing-go]').click();await page.waitForTimeout(700);
 a=await unitA();assert.deepEqual([a.name,a.parts,a.pins],['fiq-drawing-fourth.svg',0,0]);

 // 4. A late Mobile update carrying removed panels does not bring them back.
 await S(()=>{const p=JSON.parse(JSON.stringify((0,eval)('state').projects.find(x=>x.id==='dj')));p.cabinets[0].parts=[{id:'lx',code:'P-001',name:'Old',length:500,width:400,thickness:18,qty:1,material:'Oak',status:'ready',x:50,y:50,copies:[]}];mergeMobileProject(p);save()});
 assert.equal((await unitA()).parts,0,'removed panels stay removed');

 assert.equal(await unitB(),'bp1:30,30','the other unit is still untouched');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true,dialogs}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
