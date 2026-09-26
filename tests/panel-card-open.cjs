// Panel Check: the compact panel cards are clickable. Real Studio and Mobile loaders over the
// fake cloud; Mobile driven by real taps on the room's Panel Check list:
//  - the card design is unchanged (same row markup and text), only the whole card opens;
//  - tapping P-002 (Qty 3) opens the same panel view a QR scan opens: route, big P-002, the
//    drawing with P-002 highlighted at its dot, a piece picker, that piece's status, and
//    Fitted / Missing / Damaged; no Scan Next button when opened from a card;
//  - Fitted piece 1, Missing piece 2, Damaged piece 3 (real damage form): each piece keeps
//    its own status, the card shows them all, Studio receives them;
//  - reopening the card starts at the first piece not yet fitted; statuses survive a reload;
//  - scanning piece 3's sticker in Find mode lands in the same view on piece 3;
//  - a panel with three drawn markers highlights the chosen piece's own marker;
//  - an old QR without a piece still works the old way.
const {chromium}=require('playwright');
const path=require('node:path'),assert=require('node:assert/strict');
const {createCloud,serve}=require('./helpers/fake-cloud.cjs');
const user={uid:'owner',companyId:'co',role:'company_owner',email:'owner@test',fitterId:'F1'};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label,ms=15000){const end=Date.now()+ms;let last;while(Date.now()<end){try{last=await fn();if(last)return last}catch(e){last=e}await wait(200)}throw new Error('Timed out: '+label+(last instanceof Error?' ('+last.message+')':''))}
(async()=>{
 const served=await serve(path.resolve(__dirname,'..')),server=served.server,base=process.env.LIVE_BASE||served.base;
 const site=process.env.LIVE_BASE?process.env.LIVE_BASE.replace(/\/beta$/,'')+'/':'http://127.0.0.1';
 const cloud=createCloud();let browser;
 try{
 browser=await chromium.launch({headless:true});
 const errors=[];
 async function open(ctx,client,url,viewport){
  const page=await ctx.newPage();if(viewport)await page.setViewportSize(viewport);
  page.on('pageerror',e=>errors.push(client+': '+e.message));page.on('dialog',d=>d.accept());
  await page.route(u=>!String(u).startsWith(site),r=>r.abort());
  await cloud.attach(page,client,user);
  await page.goto(base+url);
  await page.waitForFunction(()=>document.readyState==='complete'&&typeof save==='function'&&(typeof exportJob==='function'||typeof exportProjectToMobile==='function')&&typeof (0,eval)('typeof state!=="undefined"&&state')==='object');
  await page.waitForTimeout(500);
  if(client==='mobile')await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});
  return page;
 }
 const studioCtx=await browser.newContext(),mobileCtx=await browser.newContext();
 const studio=await open(studioCtx,'studio','/Studio.html');
 let mobile=await open(mobileCtx,'mobile','/Mobile.html',{width:390,height:844});
 const S=(fn,a)=>studio.evaluate(fn,a),M=(fn,a)=>mobile.evaluate(fn,a);

 await S(async()=>{
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#eee"/></svg>');
  const part=(id,code,name,qty,x,y,copies)=>{const p={id,code,name,length:800,width:400,thickness:18,qty,material:'White melamine',edgeLong:1,edgeShort:0,notes:'',status:'ready',x,y,copies:copies||[]};p.reviewSignature=window.panelReviewSignature(p);return p};
  const st=(0,eval)('state');
  st.projects.push({id:'pj',name:'Card job',customer:'Cara Card',rooms:[{id:'r1',name:'Bedroom'}],cabinets:[{id:'pc',roomId:'r1',name:'Wardrobe',drawing,drawingType:'image',parts:[
   part('p1','P-001','Side',1,20,30),part('p2','P-002','Shelf',3,55,40),part('p5','P-005','Door',3,70,20,[{x:80,y:20,status:'ready'},{x:90,y:20,status:'ready'}])]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));switchToProject('pj','pc');save();
  await exportProjectToMobile(st.projects.find(x=>x.id==='pj'));
 });
 await until(()=>M(()=>!!(0,eval)('state').projects.find(x=>x.id==='pj')),'job reaches Mobile');
 const qr=await S(()=>{switchToProject('pj','pc');const o={};fiqSupplierDataset().rows.forEach(r=>o[r.pieceRef]=r.qr);o.legacy1=phoneQrText(cabinet().parts[0]);return o});
 const room=async()=>{await M(()=>{state.currentProject='pj';state.currentRoom='r1';closeFindPanelResult();save();show('drawings')});await mobile.waitForTimeout(250)};
 const card=code=>mobile.locator('#panelCheckSection .panel-check-row',{hasText:code});
 const view=()=>M(()=>{const o=document.getElementById('findPanelOverlay'),b=document.getElementById('findPanelResultBody');const act=b.querySelector('.panel-highlight.active');
  return {open:!o.classList.contains('hidden'),code:b.querySelector('.panel-big-code')?.innerText,route:b.querySelector('.panel-route')?.innerText,status:b.querySelector('.fp-piece-status')?.innerText,
   pieces:[...b.querySelectorAll('[data-fp-piece]')].map(x=>x.innerText+(x.classList.contains('active')?'*':'')),active:act?[act.style.left,act.style.top,act.className.replace(/\s+/g,' ')]:null,dots:b.querySelectorAll('.panel-highlight').length,
   next:!document.getElementById('findPanelScanNextBtn').classList.contains('hidden'),buttons:[...document.querySelectorAll('#findPanelOverlay .fp-actions button')].map(x=>x.innerText.trim())}});
 const pieces=()=>M(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='pj').cabinets[0].parts.find(x=>x.code==='P-002');return {st:[1,2,3].map(k=>(p.pieceStates&&p.pieceStates[k]||{}).status||null),installed:p.installedQty||0,damaged:p.damagedQty||0,row:p.status}});

 // Card design unchanged: same markup and text as before, only the tap behaviour is new.
 await room();
 const before=await card('P-002').evaluate(el=>({cls:el.className,text:el.innerText.replace(/\s+/g,' '),kids:el.children.length}));
 assert.deepEqual(before,{cls:'panel-check-row status-ready ',text:'— P-002 · Shelf Not scanned yet Ready',kids:3},'compact card as before');

 // 1. Tap the card: the same panel view a QR scan opens, piece 1 first.
 await card('P-002').click();await mobile.waitForTimeout(300);
 let v=await view();
 assert.deepEqual([v.open,v.code,v.route,v.pieces,v.status,v.next,v.buttons],[true,'P-002','Card job › Bedroom › Wardrobe',['Piece 1*','Piece 2','Piece 3'],'Piece 1 of 3 · Not checked yet',false,['Fitted','Missing','Damaged']]);
 assert.deepEqual(v.active.slice(0,2),['55%','40%'],'P-002 highlighted at its place on the drawing');
 assert.equal(await M(()=>state.screen),'drawings','the room screen stays behind the view');

 // 2. Fitted piece 1; Missing piece 2; Damaged piece 3 through the real damage form.
 await mobile.locator('#fpMarkFitted').click();await mobile.waitForTimeout(200);
 v=await view();assert.equal(v.status,'Piece 1 of 3 · Fitted');
 await mobile.locator('[data-fp-piece="2"]').click();await mobile.locator('#fpMarkMissing').click();await mobile.waitForTimeout(200);
 await mobile.locator('[data-fp-piece="3"]').click();await mobile.locator('#fpMarkDamaged').click();
 await mobile.locator('#damageNote').fill('Split corner');await mobile.locator('#saveDamage').click();
 await until(()=>pieces().then(x=>x.st[2]==='damaged'),'piece 3 damaged');
 await mobile.locator('#closeDamagePanel').click();// the damage form stays open for the WhatsApp share until closed
 let pc=await pieces();
 assert.deepEqual(pc,{st:['installed','missing','damaged'],installed:1,damaged:1,row:'ready'},'each piece has its own status');
 v=await view();assert.deepEqual([v.pieces,v.status],[['Piece 1 ▦','Piece 2 ❔','Piece 3 ⚠*'],'Piece 3 of 3 · Damaged']);
 await M(()=>closeFindPanelResult());await room();
 assert.match(await card('P-002').innerText(),/Pieces: 1 ▦\s+2 ❔\s+3 ⚠/,'card shows every piece');

 // 3. Reopen: starts at the first piece not yet fitted. Reload: statuses kept.
 await card('P-002').click();await mobile.waitForTimeout(300);
 v=await view();assert.equal(v.status,'Piece 2 of 3 · Missing');
 await mobile.close();mobile=await open(mobileCtx,'mobile','/Mobile.html',{width:390,height:844});
 assert.deepEqual((await pieces()).st,['installed','missing','damaged'],'after reload');

 // 4. Studio receives the piece statuses.
 await M(async()=>{await exportJob('pj',true)});
 await until(()=>S(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='pj').cabinets[0].parts.find(x=>x.code==='P-002');return p.pieceStates&&[1,2,3].map(k=>(p.pieceStates[k]||{}).status).join()==='installed,missing,damaged'}),'Studio has each piece');

 // 5. Scanning piece 3's sticker in Find mode lands in the same view, on piece 3.
 await M(t=>{state.currentProject='pj';state.scanMode='find';lastScannedQrText=null;handleDetectedQrText(t)},qr['P-002-3']);await mobile.waitForTimeout(300);
 v=await view();assert.deepEqual([v.open,v.code,v.status,v.pieces[2],v.next],[true,'P-002','Piece 3 of 3 · Damaged','Piece 3 ⚠*',true],'QR scan: same view, same piece');
 await M(()=>closeFindPanelResult());

 // 6. Drawn repeated markers: the chosen piece's own marker is highlighted.
 await room();await card('P-005').click();await mobile.waitForTimeout(300);
 v=await view();assert.deepEqual([v.dots,v.active.slice(0,2)],[3,['70%','20%']],'piece 1 at the first marker');
 await mobile.locator('[data-fp-piece="3"]').click();v=await view();assert.deepEqual(v.active.slice(0,2),['90%','20%'],'piece 3 at its own marker');
 await M(()=>closeFindPanelResult());

 // 7. Old QR without a piece: old whole-panel behaviour.
 await M(t=>{state.scanMode='find';lastScannedQrText=null;handleDetectedQrText(t)},qr.legacy1);await mobile.waitForTimeout(300);
 v=await view();assert.deepEqual([v.code,v.pieces.length,v.status],['P-001',0,'Ready']);
 await mobile.locator('#fpMarkFitted').click();
 assert.deepEqual(await M(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='pj').cabinets[0].parts[0];return [p.status,!!p.pieceStates&&Object.keys(p.pieceStates).length]}),['installed',false],'old QR: whole panel fitted as before');

 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
