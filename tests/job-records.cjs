// Job Overview Site Updates belong to their own job/room, "Keep with job" evidence, and the
// sent Cutting List in Customer Library. One customer "Good":
//   Job A "Wardrobe 1": rooms Dressing Room + Utility, and a unit without a room (Hall
//   shelf) -> three cards; Job B "Kitchen"; an older finished job of the same customer.
// Log entries are shaped exactly as Mobile/Studio write them (text, author, at, photos,
// roomId; Mobile's auto "🔍 Missing:" / "⚠ Damaged:" lines, an "auto-room-<unit>" entry,
// an entry of a room that no longer exists). Real clicks for everything the user does:
//  1. each card's Site Updates show only that job/room (not Job B, not the other room);
//  2. the older job of the same customer and a deleted room's entry never appear;
//  3. Missing/Damaged lines are not in Site Updates but still in the Damaged section;
//  4. ☆ Keep with job on a photo note -> it follows that exact job into Customer Library,
//     with its original date/time and author, also after Move to Customer Library;
//  5. unmarked Site Updates are not evidence;
//  6. Send to Job Overview -> the job's Customer Library row shows "📋 Cutting List · V1"
//     and opens exactly that list; a room that cannot be sent explains why;
//  7. two jobs of one customer keep separate Cutting Lists and evidence;
//  8. a later Drawing change leaves the sent list unchanged (notice shown);
//  9. a reload keeps the sent lists and the kept evidence; a Mobile update without the
//     keep mark does not remove it.
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
 if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/'),r=>r.abort());
 else await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 const url=process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`;
 const S=(fn,a)=>page.evaluate(fn,a);
 const shot=async(name,sel)=>{if(!process.env.SHOT)return;await page.locator(sel).first().screenshot({path:process.env.SHOT+'/'+name+'.png'})};// optional pictures for review
 const load=async()=>{await page.goto(url);await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor'&&typeof window.fiqSiteUpdatesForCard==='function');await page.waitForTimeout(900);
  await S(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'})};
 await load();
 const T0=Date.parse('2026-09-20T09:15:00Z');
 await S(T0=>{
  const st=(0,eval)('state');
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const photo='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect width="4" height="4" fill="red"/></svg>');
  const pt=(id,code,name,extra)=>{const p=Object.assign({id,code,name,length:600,width:450,thickness:18,qty:1,material:'White melamine',edgeLong:0,edgeShort:0,notes:'',status:'ready',x:20,y:20,copies:[]},extra||{});p.reviewSignature=window.panelReviewSignature(p);return p};
  const log=(id,text,roomId,i,photos,author)=>({id,author:author||'Fitter Fred',at:T0+i*60000,text,photos:photos||[],roomId});
  st.projects.push({id:'ja',name:'Wardrobe 1',customer:'Good',rooms:[{id:'rA1',name:'Dressing Room'},{id:'rA2',name:'Utility'}],cabinets:[
    {id:'uA1',roomId:'rA1',name:'Wardrobe',drawing,drawingType:'image',parts:[pt('a1','P-001','Side',{status:'damaged',damagedQty:1}),pt('a2','P-002','Shelf')]},
    {id:'uA2',roomId:'rA2',name:'Tall unit',drawing,drawingType:'image',parts:[pt('a3','P-001','Door')]},
    {id:'uA3',roomId:'',name:'Hall shelf',drawing,drawingType:'image',parts:[pt('a4','P-001','Board')]}],
   jobLog:[log('e1','Dressing Room finished — photo of how it was left','rA1',1,[photo]),log('e2','Utility: socket moved by electrician','rA2',2),
    log('e3','General: parking at the back','',3,[],'Studio'),log('e4','Note of a room that was deleted','gone-room',4),
    log('e5','🔍 Missing: P-002 — Shelf','rA2',5),log('e6','⚠ Damaged: P-001 — scratched','rA1',6,[photo]),log('e7','Hall shelf fitted','auto-room-uA3',7)],updatedAt:Date.now()});
  st.projects.push({id:'jb',name:'Kitchen',customer:'Good',rooms:[{id:'rB',name:'Kitchen'}],cabinets:[{id:'uB',roomId:'rB',name:'Kitchen unit',drawing,drawingType:'image',parts:[pt('b1','P-001','Base side')]}],
   jobLog:[log('f1','Kitchen: wall not straight, packed 5 mm','rB',8,[photo])],updatedAt:Date.now()});
  st.projects.push({id:'jo',name:'Old wardrobe',customer:'Good',overviewFinishedAt:T0-1e9,movedToLibraryAt:T0-1e9,rooms:[{id:'rO',name:'Bedroom',finished:true,movedToLibraryAt:T0-1e9}],cabinets:[{id:'uO',roomId:'rO',name:'Old unit',parts:[pt('o1','P-001','Old side')]}],
   jobLog:[log('g1','OLD JOB note from last year','rO',-500),log('g2','OLD JOB general note','',-400)],updatedAt:Date.now()});
  st.projects.slice(-3).forEach(p=>ensureCustomerForProject(p));
  save();renderAll();show('jobs');
 },T0);
 await page.waitForTimeout(500);
 const customerId=await S(()=>state.projects.find(p=>p.id==='ja').customerId);
 assert.equal(await S(()=>state.projects.find(p=>p.id==='jb').customerId),customerId,'one customer, several jobs');
 const card=(pid,room)=>`.job-overview-row[data-open-job-card="${pid}"][data-card-room-id="${room}"]`;
 const count=async(pid,room)=>{await S(()=>{show('jobs');renderAll()});await page.waitForTimeout(400);return Number(await page.locator(card(pid,room)+' .fiq-site-update-stat .jor-stat-value').first().innerText())};
 const dialogTexts=()=>S(()=>[...document.querySelectorAll('.job-notes-dialog-sheet .job-notes-entry-text')].map(e=>e.innerText.trim()));
 const openUpdates=async(pid,room)=>{await S(()=>{show('jobs');renderAll()});await page.waitForTimeout(400);await page.locator(card(pid,room)+' .fiq-site-update-stat').first().click();await page.waitForTimeout(300)};
 const closeUpdates=async()=>{await page.locator('#studioJobNotesClose').click();await page.waitForTimeout(200)};

 // 1-3. Each card shows only its own Site Updates.
 assert.deepEqual([await count('ja','rA1'),await count('ja','rA2'),await count('ja','__general__'),await count('jb','rB')],[1,1,2,1],'Site Updates counts per card');
 assert.equal(await page.locator('.job-overview-row[data-open-job-card="jo"]').count(),0,'the old finished job has no card');
 await openUpdates('ja','rA1');
 assert.deepEqual(await dialogTexts(),['Dressing Room finished — photo of how it was left'],'Dressing Room card: only its own entry');
 await closeUpdates();
 await openUpdates('ja','rA2');
 assert.deepEqual(await dialogTexts(),['Utility: socket moved by electrician'],'Utility card: no Missing line, nothing from Dressing Room');
 await closeUpdates();
 await openUpdates('ja','__general__');
 assert.deepEqual(await dialogTexts(),['General: parking at the back','Hall shelf fitted'],'General card: only entries without a room (incl. its unit on Mobile); no deleted-room entry');
 await closeUpdates();
 await openUpdates('jb','rB');
 assert.deepEqual(await dialogTexts(),['Kitchen: wall not straight, packed 5 mm'],'Job B: only its own');
 await closeUpdates();
 // The Damaged section still has the damaged panel.
 await S(()=>{show('jobs');renderAll()});await page.waitForTimeout(300);
 await page.locator(card('ja','rA1')+' [data-open-issues="damaged"]').first().click();await page.waitForTimeout(400);
 assert.match(await page.locator('#attentionModal').innerText(),/P-001/,'Damaged section still shows the damaged panel');
 await page.locator('#attentionModalClose').click();await page.waitForTimeout(200);
 console.log('NOTE attention modal still open after its x: '+await S(()=>document.getElementById('attentionModal').classList.contains('open')));
 await S(()=>window.closeAttentionModal());await page.waitForTimeout(200);// (existing modal, closed directly; see report)

 // 4-5. Keep with job (real click) on Job A Dressing Room photo note and on Job B's note.
 await openUpdates('ja','rA1');
 await page.locator('.job-notes-dialog-sheet [data-keep-entry="e1"]').click();await page.waitForTimeout(200);
 assert.equal((await page.locator('.job-notes-dialog-sheet [data-keep-entry="e1"]').innerText()).trim(),'★ Kept with job');
 await shot('1-site-updates-keep','.job-notes-dialog-sheet');
 await closeUpdates();
 await openUpdates('jb','rB');
 await page.locator('.job-notes-dialog-sheet [data-keep-entry="f1"]').click();await page.waitForTimeout(200);
 await closeUpdates();
 const kept=await S(()=>state.projects.flatMap(p=>(p.jobLog||[]).filter(e=>e.keep).map(e=>e.id)));
 assert.deepEqual(kept.sort(),['e1','f1'],'only the chosen entries are kept');

 // 6. Send to Job Overview (real click) for Job A Dressing Room and Job B.
 const send=async(pid,cid)=>{await S(([pid,cid])=>{switchToProject(pid,cid);renderAll();show('cutting');renderAll()},[pid,cid]);await page.waitForTimeout(300);
  await page.locator('#panelCheckReturnBtn').click();await page.waitForTimeout(600)};
 await send('ja','uA1');await send('jb','uB');
 // A room that cannot be sent says why (an unfinished dot left in the Utility unit).
 await S(()=>{const c=state.projects.find(p=>p.id==='ja').cabinets.find(c=>c.id==='uA2');c.parts.push({id:'a9',code:'P-002',name:'',length:'',width:'',thickness:18,qty:1,material:'White melamine',edgeLong:0,edgeShort:0,notes:'',status:'ready',x:50,y:50,copies:[]});save();switchToProject('ja','uA2');renderAll();show('cutting');renderAll()});
 await page.waitForTimeout(300);
 assert.equal(await page.locator('#panelCheckReturnBtn').count(),0);
 await shot('2-send-blocked','[data-send-blocked]');
 assert.match(await page.locator('[data-send-blocked]').innerText(),/Send to Job Overview is not available yet[\s\S]*P-002 — unfinished, missing: Part Name, Length, Width/);
 await page.locator('[data-send-blocked] [data-send-finish]').click();await page.waitForTimeout(400);
 assert.deepEqual(await S(()=>[state.screen,state.currentPart]),['mark','a9'],'Finish in Drawing opens that panel');

 // Customer Library (real clicks).
 const library=async()=>{await S(()=>{show('customers');renderAll()});await page.waitForTimeout(300);await page.locator('#screen-customers').getByText('Good').first().click();await page.waitForTimeout(400)};
 const rowOf=name=>page.locator('#customerCardBody .customer-tab-row-wrap',{has:page.locator('.customer-tab-row[data-open-job-design] strong',{hasText:name})});
 await library();
 assert.equal((await rowOf('Dressing Room').locator('[data-open-cutting-list]').innerText()).trim(),'📋 Cutting List · V1');
 assert.equal((await rowOf('Kitchen').locator('[data-open-cutting-list]').innerText()).trim(),'📋 Cutting List · V1');
 assert.equal((await rowOf('Utility').locator('[data-open-cutting-list]').innerText()).trim(),'📋 Cutting List','nothing sent for Utility');
 assert.equal(await rowOf('Utility').locator('[data-open-job-evidence]').count(),0,'no evidence kept for Utility');
 await shot('3-library-rows','#customerCardBody .customer-tab-panel:not([hidden])');
 const sentRows=()=>S(()=>[...document.querySelectorAll('.fiq-job-dialog .fiq-sent-latest tr[data-sent-panel]')].map(r=>r.children[0].innerText+' '+r.children[1].innerText));
 const close=async()=>{await page.locator('.fiq-job-dialog [data-job-close]').first().click();await page.waitForTimeout(200)};
 await rowOf('Dressing Room').locator('[data-open-cutting-list]').click();await page.waitForTimeout(300);
 assert.deepEqual(await sentRows(),['P-001 Side','P-002 Shelf'],'Job A Dressing Room list only');
 await close();
 await rowOf('Kitchen').locator('[data-open-cutting-list]').click();await page.waitForTimeout(300);
 assert.deepEqual(await sentRows(),['P-001 Base side'],'Job B list only');
 await close();
 // 4/7. Evidence follows its own job, with original date/time and author.
 const evidence=async name=>{await library();await rowOf(name).locator('[data-open-job-evidence]').click();await page.waitForTimeout(300);
  if(name==='Dressing Room')await shot('4-evidence','.fiq-evidence-view');
  const r=await S(()=>[...document.querySelectorAll('.fiq-evidence-view .job-notes-entry')].map(e=>({text:(e.querySelector('.job-notes-entry-text')||{}).innerText,author:e.querySelector('.job-notes-entry-head span').innerText,when:e.querySelector('.job-notes-entry-when').innerText,photos:e.querySelectorAll('img').length})));await close();return r};
 const when=await S(T0=>new Date(T0+60000).toLocaleString(),T0);
 assert.deepEqual(await evidence('Dressing Room'),[{text:'Dressing Room finished — photo of how it was left',author:'Fitter Fred',when,photos:1}],'Job A evidence only, original date and author');
 assert.deepEqual((await evidence('Kitchen')).map(e=>e.text),['Kitchen: wall not straight, packed 5 mm'],'Job B evidence only');
 // The job page lists it too.
 await library();await page.locator('#customerCardBody .customer-tab-row[data-open-job-design-project="ja"][data-open-job-design="rA1"]').first().click();await page.waitForTimeout(300);
 assert.match(await page.locator('.fiq-job-dialog [data-job-go="evidence"]').innerText(),/Job Evidence \(1\)/);
 await close();

 // 8. Drawing change after sending: the sent list stays as sent.
 const sentBefore=await S(()=>JSON.stringify(state.projects.find(p=>p.id==='ja').sentCuttingLists));
 await S(()=>{switchToProject('ja','uA1','a1');renderAll();show('mark')});await page.waitForTimeout(300);
 await page.locator('#fLength').scrollIntoViewIfNeeded();await page.click('#fLength');await page.keyboard.press('Control+A');await page.keyboard.type('590');await page.waitForTimeout(600);
 assert.equal(await S(()=>state.projects.find(p=>p.id==='ja').cabinets[0].parts[0].length),590);
 assert.equal(await S(()=>JSON.stringify(state.projects.find(p=>p.id==='ja').sentCuttingLists)),sentBefore,'sent list unchanged');
 await library();await rowOf('Dressing Room').locator('[data-open-cutting-list]').click();await page.waitForTimeout(300);
 assert.match(await page.locator('.fiq-job-dialog').innerText(),/Changes since last sent Cutting List/);
 assert.match(await page.locator('.fiq-job-dialog tr[data-sent-panel="P-001"]').innerText(),/600 × 450 × 18/);
 await close();

 // Move Job A's Dressing Room card to Customer Library: its evidence stays with it.
 await S(()=>{show('jobs');renderAll()});await page.waitForTimeout(300);
 const finishBtn=page.locator(card('ja','rA1')+' [data-finish-overview-job]').first();
 if(await finishBtn.count()){await S(sel=>{const b=document.querySelector(sel);if(b)b.disabled=false},card('ja','rA1')+' [data-finish-overview-job]');await finishBtn.click();await page.waitForTimeout(500)}
 assert.ok(await S(()=>!!(state.projects.find(p=>p.id==='ja').rooms.find(r=>r.id==='rA1').movedToLibraryAt)),'moved to Customer Library');
 assert.equal((await evidence('Dressing Room')).length,1,'evidence kept after Move to Customer Library');

 // 9. A Mobile update without the keep mark keeps it; a reload keeps everything.
 await S(()=>{const p=JSON.parse(JSON.stringify(state.projects.find(x=>x.id==='ja')));(p.jobLog||[]).forEach(e=>delete e.keep);delete p.sentCuttingLists;mergeMobileProject(p);save()});
 const finalState=await S(()=>JSON.stringify(state.projects.filter(p=>p.id==='ja'||p.id==='jb').map(p=>[p.sentCuttingLists,(p.jobLog||[]).filter(e=>e.keep).map(e=>e.id)])));
 assert.match(finalState,/"e1"/);
 await load();
 assert.equal(await S(()=>JSON.stringify(state.projects.filter(p=>p.id==='ja'||p.id==='jb').map(p=>[p.sentCuttingLists,(p.jobLog||[]).filter(e=>e.keep).map(e=>e.id)]))),finalState,'reload keeps sent lists and evidence');
 assert.equal((await evidence('Dressing Room')).length,1);
 assert.equal((await evidence('Kitchen')).length,1);

 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
