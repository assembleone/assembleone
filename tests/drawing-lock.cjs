// Job Overview installation view: a job in the active Job Overview that has been sent to
// Mobile opens its Drawing from Job Overview locked for reference. Real clicks only:
//  - locked: the banner shows; clicking the drawing adds no dot; dragging a dot does not
//    move it; typing in Length, Save & next, Delete, repeat dot, quick names and edging
//    change nothing; the dot menu (Delete dot) does not appear;
//  - still usable: zoom, selecting a panel by its dot or its list row; the room picker
//    (it changes the job's rooms) is locked;
//  - the card's Damaged list "Show on drawing" opens the same locked view;
//  - leaving Drawing and opening the job from Customer Library: fully editable again;
//  - a job in Job Overview not yet sent to Mobile is not locked.
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
 // STUDIO_URL runs the same test on the published beta page.
 if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/'),r=>r.abort());
 else await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 await page.goto(process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>typeof window.fiqOpenInstallationDrawing==='function'&&typeof createPartAt==='function');
 await page.waitForTimeout(800);
 await page.evaluate(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700"><rect width="1000" height="700" fill="#eee"/></svg>');
  const part=(id,code,name,x,y,extra)=>{const p={id,code,name,length:800,width:400,thickness:18,qty:1,material:'White melamine',edgeLong:1,edgeShort:0,notes:'',status:'ready',x,y,copies:[],...extra};p.reviewSignature=window.panelReviewSignature(p);return p};
  const st=(0,eval)('state');
  const job=(id,name,sent)=>({id,name,customer:name+' customer',lastMobileSync:sent?new Date().toISOString():undefined,rooms:[{id:id+'r',name:'Kitchen'}],cabinets:[
   {id:id+'c1',roomId:id+'r',name:'Run A',drawing,drawingType:'image',parts:[part(id+'a','P-001','Side',30,40),part(id+'b','P-002','Shelf',60,40,{status:'damaged',damagedQty:1,damageNote:'Chipped'})]},
   {id:id+'c2',roomId:id+'r',name:'Run B',drawing,drawingType:'image',parts:[part(id+'x','P-001','Top',50,50)]}],jobLog:[],updatedAt:Date.now()});
  st.projects.push(job('lj','Locked',true),job('uj','Unsent',false));
  st.projects.slice(-2).forEach(p=>ensureCustomerForProject(p));
  save();renderAll();show('jobs');
 });
 await page.waitForTimeout(400);
 const S=(fn,a)=>page.evaluate(fn,a);
 const snapshot=id=>S(id=>JSON.stringify((0,eval)('state').projects.find(p=>p.id===id).cabinets.map(c=>c.parts.map(p=>[p.id,p.code,p.x,p.y,p.length,p.width,p.qty,p.name,p.material,p.edgeLong,p.edgeShort,p.notes]))),id);
 const view=()=>S(()=>({screen:state.screen,locked:document.body.classList.contains('fiq-drawing-locked'),banner:(document.querySelector('#screen-mark .fiq-drawing-lock-banner')||{}).innerText||'',
  bannerShown:getComputedStyle(document.querySelector('#screen-mark .fiq-drawing-lock-banner')).display!=='none',cab:state.currentCabinet,part:state.currentPart,pinMenu:!!document.getElementById('fiqPinMenu')&&getComputedStyle(document.getElementById('fiqPinMenu')).display!=='none',zoom:document.getElementById('zoomValue').innerText}));
 const card=(pid,room)=>page.locator(`.job-overview-row[data-open-job-card="${pid}"][data-card-room-id="${room}"]`);

 // 1. From Job Overview: locked.
 const before=await snapshot('lj');
 await card('lj','ljr').locator('.jor-name').click();await page.waitForTimeout(400);
 if(process.env.SHOT)await page.screenshot({path:process.env.SHOT});
 let v=await view();
 assert.deepEqual([v.screen,v.locked,v.bannerShown],['mark',true,true]);
 assert.match(v.banner,/Installation view · Drawing locked/);
 const canvas=page.locator('#drawingCanvas');const box=await canvas.boundingBox();
 await page.mouse.click(box.x+box.width*0.8,box.y+box.height*0.8);await page.waitForTimeout(250);// empty spot: would create a dot
 await page.mouse.dblclick(box.x+box.width*0.7,box.y+box.height*0.7);await page.waitForTimeout(300);// expand view: allowed, adds nothing
 assert.equal(await S(()=>document.getElementById('drawingStage').classList.contains('expanded')),true,'double-click expands the drawing');
 await page.mouse.dblclick(box.x+box.width*0.7,box.y+box.height*0.7);await page.waitForTimeout(300);
 const pin=page.locator('#drawingCanvas .pin').first();const pb=await pin.boundingBox();
 await page.mouse.move(pb.x+pb.width/2,pb.y+pb.height/2);await page.mouse.down();await page.mouse.move(pb.x+140,pb.y+90,{steps:6});await page.mouse.up();await page.waitForTimeout(250);
 await pin.click();await page.waitForTimeout(250);// select only
 v=await view();assert.equal(v.pinMenu,false,'no Delete dot menu');const selected=v.part;assert.ok(selected,'a dot can still be selected');
 await page.locator('#fLength').click({force:true});await page.keyboard.type('999');
 for(const sel of ['#saveNextBtn','#deletePartBtn','#addSameMarkerBtn']){await page.locator(sel).click({force:true}).catch(()=>{});await page.waitForTimeout(150)}
 await page.locator('#lengthMeasureWrap').dblclick({force:true}).catch(()=>{});
 const quick=page.locator('#screen-mark [data-quick-name]').first();if(await quick.count())await quick.click({force:true});
 await page.waitForTimeout(300);
 assert.equal(await snapshot('lj'),before,'no panel data changed from the locked Drawing');
 // Still usable: zoom, list selection, switching unit.
 const z0=v.zoom;await page.locator('#zoomInBtn').click();await page.waitForTimeout(200);
 assert.notEqual((await view()).zoom,z0,'zoom works');
 await page.locator('#partList [data-part]').nth(1).click();await page.waitForTimeout(200);
 assert.equal((await view()).part,'ljb','selecting from the list works');
 // The room picker changes the job's rooms: locked too, and put back if it still changed.
 const rooms=await S(()=>JSON.stringify((0,eval)('state').projects.find(p=>p.id==='lj').rooms));
 await page.locator('#cabinetSelect').selectOption('Bedroom',{force:true}).catch(()=>{});await page.waitForTimeout(300);
 v=await view();assert.deepEqual([v.cab,v.locked,await S(()=>document.getElementById('cabinetSelect').value)],['ljc1',true,''],'room picker locked and restored');
 assert.equal(await S(()=>JSON.stringify((0,eval)('state').projects.find(p=>p.id==='lj').rooms)),rooms,'rooms unchanged');

 // 2. Damaged -> Show on drawing: same locked view.
 await S(()=>show('jobs'));await page.waitForTimeout(300);
 assert.equal((await view()).locked,false,'leaving Drawing ends the locked view');
 await card('lj','ljr').locator('.jor-stat',{hasText:'Damaged'}).click();await page.waitForTimeout(300);
 await page.locator('#attentionList button',{hasText:'Show on drawing'}).click();await page.waitForTimeout(300);
 v=await view();assert.deepEqual([v.screen,v.locked,v.cab,v.part],['mark',true,'ljc1','ljb']);

 // 3. From Customer Library: editable.
 await S(()=>show('customers'));await page.waitForTimeout(300);
 await S(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='lj');openCustomerCard(p.customerId)});await page.waitForTimeout(400);
 // The Customer Library card's own Drawing button for this job.
 await page.locator('#customerCardBody [data-open-job-design-project="lj"]:visible').first().click();await page.waitForTimeout(300);
 await page.locator('.fiq-job-dialog [data-job-go="drawing"]').click();await page.waitForTimeout(400);// the job page's Drawing entry
 v=await view();assert.deepEqual([v.screen,v.locked],['mark',false],'Customer Library route is editable');
 const partsBefore=await S(()=>cabinet().parts.length);
 const box2=await canvas.boundingBox();await page.mouse.click(box2.x+box2.width*0.85,box2.y+box2.height*0.85);await page.waitForTimeout(300);
 assert.equal(await S(()=>cabinet().parts.length),partsBefore+1,'a dot can be added from Customer Library');

 // 4. Job Overview, not yet sent to Mobile: not locked.
 await S(()=>show('jobs'));await page.waitForTimeout(300);
 await card('uj','ujr').locator('.jor-name').click();await page.waitForTimeout(400);
 v=await view();assert.deepEqual([v.screen,v.locked],['mark',false],'unsent job is not locked');

 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
