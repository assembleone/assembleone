// THE DRAWING RULE (frozen): one new panel = one dot -> complete its information -> then
// continue. Mads's exact sequence, real Drawing clicks and typing only:
//  clean start; dot P-001; five more clicks on empty places -> still ONE dot, "Finish P-001
//  first — missing: ..."; enter Shelf 600 x 450 x 19 White melamine (+ one Length edge);
//  five more clicks -> six dots, all identical incl. edging; Save & next -> Length, Width,
//  Part Name and edging empty, Quantity 1, Thickness and Material kept; one click -> P-007;
//  five more clicks without its measurements -> still P-001..P-007; enter P-007's details
//  -> further clicks are identical copies of P-007.
//  An unfinished OLD panel elsewhere on the unit does not block (the lock is the current cycle).
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
 await page.waitForFunction(()=>typeof createPartAt==='function'&&typeof window.fiqPanelMissingFields==='function');
 await page.waitForTimeout(800);
 await page.evaluate(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700"><rect width="1000" height="700" fill="#eee"/></svg>');
  const st=(0,eval)('state');
  st.projects.push({id:'rj',name:'Dot rule job',customer:'Rudi',defaultMaterial:'',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'rc',roomId:'r1',name:'Run',drawing,drawingType:'image',parts:[],lastThickness:19,lastMaterial:''}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));switchToProject('rj','rc');st.currentPart=null;st.lastChosenPartName='';renderAll();show('mark');
 });
 const S=(fn,a)=>page.evaluate(fn,a);
 let toasts=[];await page.exposeFunction('__toast',t=>toasts.push(t));
 await S(()=>{const o=window.toast;window.toast=function(m){window.__toast(String(m));return o.apply(this,arguments)}});
 const dot=async x=>{await S(()=>document.getElementById('drawingCanvas').scrollIntoView({block:'center'}));await page.waitForTimeout(60);const b=await page.locator('#drawingCanvas').boundingBox();await page.mouse.click(b.x+b.width*x/1000,b.y+b.height*0.4);await page.waitForTimeout(220)};
 const type=async(id,v)=>{await page.locator('#'+id).scrollIntoViewIfNeeded();await page.click('#'+id);await page.keyboard.press('Control+A');await page.keyboard.type(v);await page.waitForTimeout(60)};
 const name=async n=>{let b=page.locator(`#screen-mark .quick-main [data-quick-name="${n}"]`);if(!await b.count()){const d=page.locator('#screen-mark details.common-part-library > summary');await d.scrollIntoViewIfNeeded();if(!await S(()=>document.querySelector('#screen-mark details.common-part-library').open))await d.click();b=page.locator(`#screen-mark .common-part-grid [data-quick-name="${n}"]`).first()}await b.scrollIntoViewIfNeeded();await b.click();await page.waitForTimeout(80)};
 const material=async m=>{await page.locator('#materialSummary').scrollIntoViewIfNeeded();await page.locator('#materialSummary').click();await page.waitForTimeout(80);await page.locator(`#materialLibraryGrid [data-material-name="${m}"]`).click();await page.waitForTimeout(80)};
 const edge=async(id,n)=>{for(let i=0;i<n;i++){await page.locator('#'+id).dblclick();await page.waitForTimeout(60)}};
 const panels=()=>S(()=>cabinet().parts.map(p=>[p.code,p.name,Number(p.length)||0,Number(p.width)||0,Number(p.thickness)||0,p.material,p.edgeLong,p.edgeShort,Number(p.qty)||0]));
 const outlined=()=>S(()=>[...document.querySelectorAll('#screen-mark .fiq-missing')].map(e=>e.id||e.className.split(' ')[0]).sort());
 const blank=()=>S(()=>cabinet().parts.filter(p=>window.fiqPanelMissingFields(p).filter(k=>k!=='qty').length).map(p=>p.code));

 const fields=()=>S(()=>({length:document.getElementById('fLength').value,width:document.getElementById('fWidth').value,thickness:document.getElementById('fThickness').value,qty:document.getElementById('fQty').value,material:(document.getElementById('materialSummary')||{}).innerText||'',name:[document.getElementById('partNamePicker').value,state.lastChosenPartName,...[...document.querySelectorAll('#screen-mark [data-quick-name].active,#screen-mark [data-quick-name].selected,#screen-mark [data-quick-name][aria-pressed="true"]')].map(b=>b.dataset.quickName)].join(''),edges:document.querySelectorAll('#screen-mark :is(#lengthMeasureWrap,#widthMeasureWrap):is(.edge-one,.edge-two)').length,draft:state.newPanelDraft}));
 const pins=()=>S(()=>document.querySelectorAll('#drawingCanvas .pin').length);
 const count=async n=>{assert.equal((await panels()).length,n,'panels');assert.equal(await pins(),n,'visible dots')};
 const five=async xs=>{for(const x of xs)await dot(x)};

 // 1. Place dot P-001, then five more clicks on empty places: still one dot.
 await dot(100);await count(1);
 assert.equal((await panels())[0][0],'P-001');
 await five([200,300,400,500,600]);
 await count(1);
 assert.equal(toasts.at(-1),'Finish P-001 first — missing: Length, Width, Part Name, Material');
 const marked=await outlined();
 for(const x of ['lengthMeasureWrap','widthMeasureWrap','materialPickerDetails','quick-main'])assert.ok(marked.includes(x),'missing field marked: '+x+' in '+marked);
 // Partly filled: still one dot, message updated.
 await type('fLength','600');await dot(200);await count(1);
 assert.equal(toasts.at(-1),'Finish P-001 first — missing: Width, Part Name, Material');
 // 2. Complete P-001: Shelf 600 x 450 x 19, White melamine, one Length edge.
 await type('fWidth','450');await edge('lengthMeasureWrap',1);await name('Shelf');await material('White melamine');
 // 3. Five more clicks: six dots, all exactly that shelf.
 await five([200,300,400,500,600]);
 await count(6);
 const six=await panels();
 assert.deepEqual(six.map(p=>p[0]),['P-001','P-002','P-003','P-004','P-005','P-006']);
 assert.deepEqual(six.map(p=>p.slice(1)),Array(6).fill(['Shelf',600,450,19,'White melamine',1,0,1]),'all six identical incl. edging');
 assert.equal((await fields()).edges,1,'P-006 shows its Length edge');
 // 4. Save & next: Length, Width, Part Name, edging empty; Quantity 1; Thickness and Material kept.
 await page.locator('#saveNextBtn').scrollIntoViewIfNeeded();await page.locator('#saveNextBtn').click();await page.waitForTimeout(700);
 const after=await fields();
 assert.deepEqual([after.length,after.width,after.name,after.qty,after.thickness],['','','','1','19'],'cleared after Save & next: '+JSON.stringify(after));
 assert.match(after.material,/White melamine/,'material kept');
 assert.equal(after.edges,0,'edging cleared on screen');
 assert.ok(!after.draft||(!Number(after.draft.edgeLong)&&!Number(after.draft.edgeShort)),'edging cleared for the next panel');
 assert.equal(await S(()=>state.currentPart),null,'no panel selected');
 await count(6);
 // 5. One click: one new dot, P-007, blank measurements and name.
 await dot(700);await count(7);
 const p7=(await panels())[6];
 assert.deepEqual(p7,['P-007','',0,0,19,'White melamine',0,0,p7[8]],'P-007 is a new blank-sized panel');
 // 6. Five more clicks without P-007's measurements: still P-001..P-007.
 await five([750,800,850,900,950]);
 await count(7);
 assert.equal(toasts.at(-1),'Finish P-007 first — missing: Length, Width, Part Name');
 // 7. Enter P-007 (no edging): further clicks are identical copies of P-007.
 await type('fLength','800');await type('fWidth','400');await name('Back');
 await five([800,900]);
 await count(9);
 assert.deepEqual((await panels()).slice(6).map(p=>p.slice(0,8)),[['P-007','Back',800,400,19,'White melamine',0,0],['P-008','Back',800,400,19,'White melamine',0,0],['P-009','Back',800,400,19,'White melamine',0,0]]);
 assert.deepEqual((await panels()).slice(0,6).map(p=>p.slice(1)),Array(6).fill(['Shelf',600,450,19,'White melamine',1,0,1]),'the shelves are untouched');

 // The lock is the current cycle only: an unfinished old panel elsewhere does not block.
 await S(()=>{const c=cabinet();c.parts.push({id:'old',code:'P-010',name:'',length:500,width:'',thickness:18,qty:1,material:'MDF',edgeLong:0,edgeShort:0,notes:'',status:'ready',x:90,y:90,copies:[]});save();renderAll()});
 await page.locator('#saveNextBtn').click();await page.waitForTimeout(700);
 await dot(150);
 assert.equal((await panels()).length,11,'new cycle starts despite the old unfinished P-010');

 assert.deepEqual(dialogs,[],'no pop-ups');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true,panels:(await panels()).map(p=>p.slice(0,2).join(' '))}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
