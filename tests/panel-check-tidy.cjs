// First cleanup (display only), real clicks, at 1366 px and 560 px:
//  A2 Panel Check redraws when opened: a length typed in Drawing makes that panel show as
//     unchecked straight away (no stale "all checked" view);
//  B1 Shopping List open at the top; sheet layout behind "Show sheet layout"; Panel
//     checklist and Hardware & extras collapsed with summaries; checked panels are one
//     compact line (click = full card, "Compact" = fold); unchecked panels stay full and
//     can still be approved by double-click;
//  A3 Customer Library says "Drawing in progress" until a Cutting List is really sent,
//     then "Cutting List sent · V1";
//  A1 at 560 px the "📋 Cutting List · V1" label is readable and nothing overlaps;
//  A4 the Damaged window closes with × and with a click outside it.
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
 if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/'),r=>r.abort());
 else await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 await page.goto(process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor');
 await page.waitForTimeout(900);
 const S=(fn,a)=>page.evaluate(fn,a);
 const shot=async(name,sel)=>{if(!process.env.SHOT)return;if(sel)await page.locator(sel).first().screenshot({path:process.env.SHOT+'/'+name+'.png'});else await page.screenshot({path:process.env.SHOT+'/'+name+'.png',fullPage:true})};
 await S(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const st=(0,eval)('state');
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const mk=(id,code,name,l,w,extra)=>{const p=Object.assign({id,code,name,length:l,width:w,thickness:19,qty:1,material:'White melamine',edgeLong:0,edgeShort:0,notes:'',status:'ready',x:10,y:10,copies:[]},extra||{});p.reviewSignature=window.panelReviewSignature(p);return p};
  st.projects.push({id:'tj',name:'Bedroom wardrobes',customer:'Karen Carpenter',rooms:[{id:'tr',name:'Master Bedroom'}],cabinets:[{id:'tu',roomId:'tr',name:'Wardrobe',drawing,drawingType:'image',parts:[
   mk('t1','P-001','Side',2000,580,{edgeLong:1}),mk('t2','P-002','Side',2000,580,{edgeLong:1}),mk('t3','P-003','Shelf',764,560,{status:'damaged',damagedQty:1}),mk('t4','P-004','Shelf',764,560),mk('t5','P-005','Top / Bottom',800,580)]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));switchToProject('tj','tu');save();renderAll();show('parts');renderAll();
 });
 await page.waitForTimeout(500);
 const pc=()=>S(()=>({cards:[...document.querySelectorAll('#partsSummary .panel-check-card')].map(c=>({code:(c.querySelector('.panel-check-code')||{}).textContent,compact:c.classList.contains('fiq-compact'),complete:c.classList.contains('complete'),h:Math.round(c.getBoundingClientRect().height)})),
  checklistOpen:!document.querySelector('.fiq-cl-card .fiq-cl-body').hidden,hwOpen:!document.querySelector('.fiq-hw-card .fiq-hw-body').hidden,layoutOpen:document.querySelector('.fiq-sheet-layout').open,
  shopping:!!document.querySelector('#customerSheetEstimateCard [data-shopping-list]'),page:document.getElementById('screen-parts').scrollHeight}));

 // B1: collapsed by default, compact checked cards.
 let v=await pc();
 assert.equal(v.shopping,true,'Shopping List at the top');
 assert.deepEqual([v.checklistOpen,v.hwOpen,v.layoutOpen],[false,false,false],'checklist, hardware and sheet layout collapsed');
 assert.ok(v.cards.every(c=>c.complete&&c.compact&&c.h<60),'checked panels are compact lines: '+JSON.stringify(v.cards));
 assert.match(await page.locator('.fiq-cl-toggle').innerText(),/Panel checklist\s*\d+ of \d+ ticked off/);
 assert.match(await page.locator('#partsSummary .panel-check-card').first().innerText(),/✓\s*P-001\s*Side\s*2000 × 580 × 19 mm · Qty 1\s*White melamine/);
 await shot('panelcheck-1366');
 // Click to expand, Compact to fold.
 await page.locator('#partsSummary .panel-check-card',{hasText:'P-002'}).first().click();await page.waitForTimeout(150);
 v=await pc();assert.equal(v.cards.find(c=>c.code==='P-002').compact,false,'click opens the full card');
 assert.equal(await page.locator('#partsSummary [data-edit-panel="t2"]').isVisible(),true,'Edit panel reachable');
 await page.locator('#partsSummary [data-fiq-compact-btn="t2"]').click();await page.waitForTimeout(150);
 v=await pc();assert.equal(v.cards.find(c=>c.code==='P-002').compact,true,'Compact folds it again');
 // Checklist and sheet layout open on click (and stay open through a redraw).
 await page.locator('.fiq-cl-toggle').click();await page.locator('.fiq-sheet-layout > summary').click();await page.waitForTimeout(150);
 await S(()=>renderAll());await page.waitForTimeout(200);
 v=await pc();assert.deepEqual([v.checklistOpen,v.layoutOpen],[true,true]);
 await page.locator('.fiq-cl-toggle').click();await page.locator('.fiq-sheet-layout > summary').click();await page.waitForTimeout(150);

 // A2: type a new length in Drawing, then open Panel Check from the menu.
 await S(()=>{switchToProject('tj','tu','t4');renderAll();show('mark')});await page.waitForTimeout(300);
 await page.locator('#fLength').scrollIntoViewIfNeeded();await page.click('#fLength');await page.keyboard.press('Control+A');await page.keyboard.type('750');await page.waitForTimeout(500);
 await page.locator('.nav-btn[data-screen="parts"]').first().click();await page.waitForTimeout(500);
 v=await pc();
 const p4=v.cards.find(c=>c.code==='P-004');
 assert.deepEqual([p4.complete,p4.compact],[false,false],'changed panel shown as unchecked, full size');
 assert.doesNotMatch(await page.locator('#partsSummary').innerText(),/5 of 5 panels checked/,'no stale all-checked view');
 await page.locator('#partsSummary [data-review-panel="t4"]').dblclick();await page.waitForTimeout(400);
 v=await pc();assert.equal(v.cards.find(c=>c.code==='P-004').compact,true,'approved again -> compact');

 // A4: Damaged window closes with × and with a click outside.
 await S(()=>{show('jobs');renderAll()});await page.waitForTimeout(400);
 // (the Job Overview card appears only after the job was sent; send it first via Cutting List)
 await S(()=>{switchToProject('tj','tu');renderAll();show('cutting');renderAll()});await page.waitForTimeout(300);
 // A3 before sending.
 const libStatus=async()=>{await S(()=>{show('customers');openCustomerCard(state.projects.find(p=>p.id==='tj').customerId)});await page.waitForTimeout(400);return (await page.locator('#customerCardBody .customer-tab-row[data-open-job-design-project="tj"] .customer-job-status').innerText()).trim()};
 assert.equal(await libStatus(),'✏️ Drawing in progress','not "Cutting list ready" before anything is sent');
 await S(()=>{switchToProject('tj','tu');renderAll();show('cutting');renderAll()});await page.waitForTimeout(300);
 await page.locator('#panelCheckReturnBtn').click();await page.waitForTimeout(600);
 assert.equal(await libStatus(),'📋 Cutting List sent · V1');
 await shot('library-1366','#customerCardBody');
 // A1 at 560 px.
 await page.setViewportSize({width:560,height:900});await page.waitForTimeout(400);
 const narrow=await S(()=>{const b=document.querySelector('#customerCardBody [data-open-cutting-list]'),cs=getComputedStyle(b),row=b.closest('.customer-tab-row-wrap');
  const name=row.querySelector('.customer-tab-row-main strong').getBoundingClientRect(),meta=row.querySelector('.customer-tab-row-meta').getBoundingClientRect();
  const overlap=!(name.right<=meta.left||meta.right<=name.left||name.bottom<=meta.top||meta.bottom<=name.top);
  return {text:b.innerText.trim(),color:cs.color,w:Math.round(b.getBoundingClientRect().width),overlap}});
 assert.equal(narrow.text,'📋 Cutting List · V1');
 assert.notEqual(narrow.color,'rgba(0, 0, 0, 0)','label visible');
 assert.ok(narrow.w>100,'full label width: '+narrow.w);
 assert.equal(narrow.overlap,false,'name and details do not overlap');
 await shot('library-560','#customerCardBody');
 await S(()=>{switchToProject('tj','tu');renderAll();show('parts');renderAll()});await page.waitForTimeout(400);
 await shot('panelcheck-560');
 await page.setViewportSize({width:1366,height:900});await page.waitForTimeout(300);
 // A4 on the Job Overview card's Damaged figure.
 await S(()=>{show('jobs');renderAll()});await page.waitForTimeout(400);
 const dmg=page.locator('.job-overview-row[data-open-job-card="tj"] [data-open-issues="damaged"]').first();
 await dmg.click();await page.waitForTimeout(300);
 assert.equal(await S(()=>document.getElementById('attentionModal').classList.contains('open')),true);
 await page.locator('#attentionModalClose').click();await page.waitForTimeout(200);
 assert.equal(await S(()=>document.getElementById('attentionModal').classList.contains('open')),false,'× closes');
 await dmg.click();await page.waitForTimeout(300);
 await page.mouse.click(5,450);await page.waitForTimeout(200);
 assert.equal(await S(()=>document.getElementById('attentionModal').classList.contains('open')),false,'click outside closes');

 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
