// One physical panel = one sticker = one QR, through the existing copyIndex field.
// Real Studio and Mobile loaders in separate browser profiles, talking through the fake
// cloud (tests/helpers/fake-cloud.cjs). P-002 has Qty 3:
//  - the QR texts come from Studio's supplier dataset (the same data behind Sticker Preview,
//    the Supplier PDF and every production CSV) and are the panel's existing identity plus
//    copyIndex -1 / 0 / 1;
//  - Mobile Panel Check: scanning piece 1 records only piece 1 (and re-scanning it later does
//    not count again), piece 2 is recorded separately, piece 3 marked Damaged through the
//    real result-card buttons leaves pieces 1 and 2 undamaged;
//  - the statuses survive a Mobile reload, reach Studio, survive a Studio reload and are
//    not lost when Studio sends the job to Mobile again;
//  - Studio's missing/damaged list names piece 3 only;
//  - an old QR without copyIndex still works the old way (whole-panel count), in JSON and
//    URL form; a URL-form piece QR works; a piece QR on a panel with drawn repeated markers
//    still selects that marker on the drawing, as the 16 Aug design intended.
const {chromium}=require('playwright');
const path=require('node:path'),assert=require('node:assert/strict');
const {createCloud,serve}=require('./helpers/fake-cloud.cjs');
const user={uid:'owner',companyId:'co',role:'company_owner',email:'owner@test',fitterId:'F1'};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label,ms=15000){const end=Date.now()+ms;let last;while(Date.now()<end){try{last=await fn();if(last)return last}catch(e){last=e}await wait(200)}throw new Error('Timed out: '+label+(last instanceof Error?' ('+last.message+')':''))}
(async()=>{
 // LIVE_BASE (e.g. https://assembleone.github.io/assembleone/beta) runs the same test on the
 // published pages; Firebase is still never reached, the fake cloud stands in for it.
 const served=await serve(path.resolve(__dirname,'..')),server=served.server,base=process.env.LIVE_BASE||served.base;
 const site=process.env.LIVE_BASE?process.env.LIVE_BASE.replace(/\/beta$/,'')+'/':'http://127.0.0.1';
 const cloud=createCloud();let browser;
 try{
 browser=await chromium.launch({headless:true});
 const errors=[],dialogs=[];
 async function open(ctx,client,url){
  const page=await ctx.newPage();
  page.on('pageerror',e=>errors.push(client+': '+e.message));page.on('dialog',d=>{dialogs.push(client+': '+d.message());d.accept()});
  await page.route(u=>!String(u).startsWith(site),r=>r.abort());
  await cloud.attach(page,client,user);
  await page.goto(base+url);
  await page.waitForFunction(()=>document.readyState==='complete'&&typeof save==='function'&&(typeof exportJob==='function'||typeof exportProjectToMobile==='function')&&typeof (0,eval)('typeof state!=="undefined"&&state')==='object');
  await page.waitForTimeout(500);
  return page;
 }
 const studioCtx=await browser.newContext(),mobileCtx=await browser.newContext();
 let studio=await open(studioCtx,'studio','/Studio.html');
 let mobile=await open(mobileCtx,'mobile','/Mobile.html');
 const S=(fn,arg)=>studio.evaluate(fn,arg),M=(fn,arg)=>mobile.evaluate(fn,arg);

 // The job: P-002 Shelf Qty 3 (one dot), P-004 Qty 2 for the legacy QR, P-005 Qty 3 with
 // three drawn markers (the original repeated-marker case).
 await S(async()=>{
  const part=(id,code,name,qty,copies)=>{const p={id,code,name,length:800,width:400,thickness:18,qty,material:'White melamine',edgeLong:1,edgeShort:0,notes:'',status:'ready',x:20,y:20,copies:copies||[]};p.reviewSignature=window.panelReviewSignature(p);return p};
  const st=(0,eval)('state');
  st.projects.push({id:'pj',name:'Piece job',customer:'Pia Piece',rooms:[{id:'r1',name:'Bedroom'}],cabinets:[{id:'pc',roomId:'r1',name:'Wardrobe',drawing:'data:image/png;base64,'+'D'.repeat(3000),parts:[
   part('p1','P-001','Side',1),part('p2','P-002','Shelf',3),part('p4','P-004','Divider',2),part('p5','P-005','Door',3,[{x:40,y:20,status:'ready'},{x:60,y:20,status:'ready'}])]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));switchToProject('pj','pc');save();
  await exportProjectToMobile(st.projects.find(x=>x.id==='pj'));
 });
 await until(()=>M(()=>!!(0,eval)('state').projects.find(x=>x.id==='pj')),'job reaches Mobile');

 // QR texts exactly as the stickers / PDF / production files carry them.
 const qr=await S(()=>{switchToProject('pj','pc');const ds=fiqSupplierDataset();const o={};ds.rows.forEach(r=>{o[r.pieceRef]=r.qr;o['label '+r.pieceRef]=r.qrLabel});o.legacy4=phoneQrText(cabinet().parts.find(p=>p.code==='P-004'));o.legacy2=phoneQrText(cabinet().parts.find(p=>p.code==='P-002'));return o});
 const base2=JSON.parse(qr.legacy2);
 assert.deepEqual(['P-002-1','P-002-2','P-002-3'].map(k=>JSON.parse(qr[k])),[-1,0,1].map(ci=>({...base2,copyIndex:ci})),'P-002 pieces: existing identity + copyIndex -1, 0, 1');
 assert.equal(new Set(Object.values(qr)).size,Object.keys(qr).length,'every physical piece has a different QR');
 assert.equal(JSON.parse(qr.legacy4).copyIndex,undefined,'the whole-panel QR is still the old text');

 const piecesOf=code=>M(code=>{const p=(0,eval)('state').projects.find(x=>x.id==='pj').cabinets[0].parts.find(x=>x.code===code);
  return {scanned:p.scannedQty||0,damaged:p.damagedQty||0,status:p.status,pieces:JSON.parse(JSON.stringify(p.pieceStates||{})),summary:pieceSummaryText(p),category:partStatusCategory(p)}},code);
 const checkedPieces=v=>Object.keys(v.pieces).filter(k=>v.pieces[k].checkedAt).map(Number).sort();
 const damagedPieces=v=>Object.keys(v.pieces).filter(k=>v.pieces[k].status==='damaged').map(Number).sort();
 async function scan(text){await M(()=>{lastScannedQrText=null;state.scanMode='check';state.pendingProblemAction=null});return M(t=>{handleDetectedQrText(t);return document.getElementById('pcResultCode')?.textContent||''},text)}
 // Test setup only: the fake cloud signs in without the sign-in screen's own flow, so
 // reveal the app the way a completed sign-in does (Studio tests do the same).
 const unlock=()=>M(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});
 await unlock();
 await M(()=>{state.currentProject='pj';show('scan')});

 // 1. Scan piece 1: only piece 1.
 assert.equal(await scan(qr['P-002-1']),'P-002 · 1/3','result card names piece 1 of 3');
 let v=await piecesOf('P-002');
 assert.deepEqual([checkedPieces(v),v.scanned,damagedPieces(v)],[[1],1,[]],'piece 1 only');
 // Same sticker again later: still only piece 1, nothing counted twice.
 await scan(qr['P-002-1']);v=await piecesOf('P-002');
 assert.deepEqual([checkedPieces(v),v.scanned],[[1],1],'re-scanning piece 1 does not count again');

 // 2. Scan piece 2 -- this time from the QR text the production file gives the supplier's
 //    own label printer (ARDIS / Cut Rite / Maestro): recorded separately, as piece 2.
 assert.match(qr['label P-002-2'],/^#panel=pj:pc:p2:0$/);
 assert.equal(await scan(qr['label P-002-2']),'P-002 · 2/3');
 v=await piecesOf('P-002');
 assert.deepEqual([checkedPieces(v),v.scanned],[[1,2],2],'piece 2 recorded separately');

 // 3. Scan piece 3 and mark it Damaged with the real buttons.
 assert.equal(await scan(qr['P-002-3']),'P-002 · 3/3');
 await mobile.locator('#pcMarkDamaged').click();
 await mobile.locator('#damageNote').fill('Chipped front edge');
 await mobile.locator('#saveDamage').click();
 await until(()=>piecesOf('P-002').then(x=>damagedPieces(x).length===1),'piece 3 damaged');
 v=await piecesOf('P-002');
 assert.deepEqual(damagedPieces(v),[3],'only piece 3 is damaged');
 assert.deepEqual([v.pieces['1'].status,v.pieces['2'].status],[undefined,undefined],'pieces 1 and 2 are not damaged');
 assert.deepEqual([checkedPieces(v),v.scanned,v.damaged,v.status],[[1,2,3],3,1,'ready'],'counts: 3 checked, 1 damaged; the panel itself is not marked damaged');
 assert.equal(v.pieces['3'].note,'Chipped front edge');
 assert.equal(v.summary,' · Pieces: 1 ✓  2 ✓  3 ⚠','Panel Check row shows each piece');
 assert.equal(v.category,'damaged','the row still shows it needs attention');
 assert.equal(await M(()=>document.getElementById('pcResultCode').textContent),'P-002 · 3/3');
 assert.ok(await M(()=>(0,eval)('state').projects.find(x=>x.id==='pj').jobLog.some(n=>/Damaged: P-002 piece 3\/3/.test(n.text))),'job log names the piece');

 // 4. Reload Mobile: all three piece statuses kept.
 await mobile.close();mobile=await open(mobileCtx,'mobile','/Mobile.html');await unlock();
 v=await piecesOf('P-002');
 assert.deepEqual([checkedPieces(v),damagedPieces(v),v.scanned,v.damaged],[[1,2,3],[3],3,1],'statuses survive Mobile reload');

 // 5. They reach Studio, survive a Studio reload, and Studio's list names piece 3 only.
 await M(async()=>{await exportJob('pj',true)});
 await until(()=>S(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='pj').cabinets[0].parts.find(x=>x.code==='P-002');return p.pieceStates&&p.pieceStates['3']&&p.pieceStates['3'].status==='damaged'}),'piece states reach Studio');
 await studio.close();studio=await open(studioCtx,'studio','/Studio.html');
 const st=await S(()=>{const pr=(0,eval)('state').projects.find(x=>x.id==='pj'),p=pr.cabinets[0].parts.find(x=>x.code==='P-002');
  return {pieces:Object.keys(p.pieceStates).sort().map(k=>[k,!!p.pieceStates[k].checkedAt,p.pieceStates[k].status||null]),status:p.status,dmg:p.damagedQty,issue:fiqPanelIssue(p),text:fiqPieceIssueText(p),
   attention:window.a203NeedsAttentionItems().filter(x=>x.projectId==='pj').map(x=>x.partId+':'+x.reason)}});
 assert.deepEqual(st.pieces,[['1',true,null],['2',true,null],['3',true,'damaged']],'Studio keeps each piece after reload');
 assert.deepEqual([st.status,st.dmg,st.issue,st.text],['ready',1,'damaged','piece 3/3 damaged']);
 assert.deepEqual(st.attention,['p2:damaged'],'Studio needs-attention lists P-002 for its damaged piece');
 const outstanding=await S(()=>{switchToProject('pj','pc');renderAll();show('parts');const r=document.querySelector('[data-outstanding-row="p2"]');return r?r.innerText.replace(/\s+/g,' '):''});
 assert.match(outstanding,/P-002 — Shelf · piece 3\/3 damaged/,'Panel Check outstanding list names piece 3: '+outstanding);

 // 6. Studio sends the job to Mobile again: the phone keeps every piece state.
 await S(async()=>{await exportProjectToMobile((0,eval)('state').projects.find(x=>x.id==='pj'))});
 await wait(3500);
 v=await piecesOf('P-002');
 assert.deepEqual([checkedPieces(v),damagedPieces(v)],[[1,2,3],[3]],'a later Studio send does not undo piece results');

 // 7. An old QR without copyIndex still works the old way: each scan counts one piece.
 await M(()=>{state.currentProject='pj';show('scan')});
 assert.equal(await scan(qr.legacy4),'P-004','old QR: no piece shown');
 v=await piecesOf('P-004');assert.deepEqual([v.scanned,Object.keys(v.pieces).length],[1,0],'old QR counts one, no piece record');
 await scan(qr.legacy4);v=await piecesOf('P-004');assert.equal(v.scanned,2,'old QR again counts the second piece, as before');
 // Old URL-form QR (Mobile app web address set) and the new URL form with a piece.
 const url=await S(()=>{switchToProject('pj','pc');localStorage.setItem('assembleone_mobile_app_url','https://example.test/Mobile.html');const p=cabinet().parts.find(x=>x.code==='P-001');const r=[phoneQrText(p),phoneQrText(p,1)];localStorage.removeItem('assembleone_mobile_app_url');return r});
 assert.deepEqual(url,['https://example.test/Mobile.html#panel=pj:pc:p1','https://example.test/Mobile.html#panel=pj:pc:p1:-1']);
 assert.equal(await scan(url[0]),'P-001','old URL QR still opens P-001 the old way');
 assert.equal(await scan(url[1]),'P-001 · 1/1','URL QR with piece 1 works');
 v=await piecesOf('P-001');assert.deepEqual([v.scanned,checkedPieces(v)],[1,[1]],'the legacy scan counted P-001; the piece scan marked piece 1 without counting twice');

 // Every production-file QR text resolves to exactly the same piece as its sticker QR.
 const same=await M(q=>Object.keys(q).filter(k=>/^P-/.test(k)).map(k=>{const a=[];for(const t of [q[k],q['label '+k]]){state.scanMode='find';lastScannedQrText=null;openScannedText(t);a.push(state.currentPart+'#'+state.scannedPiece)}return k+'='+a.join(' ')}),qr);
 same.forEach(x=>{const [k,v]=x.split('=');const [a,b]=v.split(' ');assert.equal(a,b,'label text and sticker QR open the same piece for '+k)});

 // 8. Panel with three drawn markers: the piece QR still selects that marker (16 Aug design).
 const qr5=await S(()=>(switchToProject('pj','pc'),fiqSupplierDataset()).rows.filter(r=>r.panelNumber==='P-005').map(r=>r.qr));
 const sel=await M(t=>{state.scanMode='find';lastScannedQrText=null;openScannedText(t);return [state.selectedCopy,state.scannedPiece]},qr5[1]);
 assert.deepEqual(sel,[0,2],'P-005 piece 2 selects marker 2 (copies[0])');

 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true,dialogs:dialogs.length}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
