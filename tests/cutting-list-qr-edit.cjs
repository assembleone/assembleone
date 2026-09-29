// Saved Cutting List QR + editing a compact Panel Check card. Real clicks:
//  - Send to Job Overview stores each physical piece's QR with the version; the list shows a
//    small "▦ QR" per row; it opens that panel's codes (a Qty 2 panel shows piece 1/2 and
//    2/2) and they are exactly the supplier sticker identities (same text, same label);
//  - a later Drawing change does not change the saved QR of that version;
//  - a version saved before QR was stored shows "—" (nothing rebuilt);
//  - Panel Check: a compact checked card opens on click; "Edit panel" goes to that exact
//    panel in Drawing, selected, its measurements in the form; after a change the panel
//    needs Panel Check again and Send to Job Overview is blocked until it is checked.
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
 if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/')&&!String(u).startsWith('https://cdnjs.cloudflare.com/'),r=>r.abort());
 else await page.route(u=>{const x=String(u);return !(x.startsWith('http://127.0.0.1')||x.startsWith('https://cdnjs.cloudflare.com/'))},r=>r.abort());
 await page.goto(process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor');
 await page.waitForTimeout(900);
 const S=(fn,a)=>page.evaluate(fn,a);
 await S(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const st=(0,eval)('state');
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const mk=(id,code,name,l,w,qty,x)=>{const p={id,code,name,length:l,width:w,thickness:19,qty,material:'White melamine',edgeLong:0,edgeShort:0,notes:'',status:'ready',x,y:40,copies:[]};p.reviewSignature=window.panelReviewSignature(p);return p};
  st.projects.push({id:'qj',name:'QR job',customer:'Quinn',rooms:[{id:'qr',name:'Bedroom'}],cabinets:[{id:'qu',roomId:'qr',name:'Wardrobe',drawing,drawingType:'image',parts:[mk('q1','P-001','Side',2000,580,1,20),mk('q2','P-002','Shelf',764,560,2,50)]}],
   // An older version, saved before QR codes were stored with Cutting Lists.
   sentCuttingLists:{'room:qr':[{version:1,sentAt:'2026-09-27T10:00:00.000Z',jobKey:'room:qr',totals:{panels:1,pieces:1},panels:[{panelId:'q1',panelNumber:'P-001',partName:'Side',length:2000,width:580,thickness:19,quantity:1,material:'White melamine',edgeLong:0,edgeShort:0,notes:'',unit:'Wardrobe',room:'Bedroom'}]}]},
   jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));switchToProject('qj','qu');save();renderAll();show('cutting');renderAll();
 });
 await page.waitForTimeout(400);
 await page.locator('#panelCheckReturnBtn').click();await page.waitForTimeout(600);
 const v2=await S(()=>state.projects.find(p=>p.id==='qj').sentCuttingLists['room:qr'][1]);
 assert.equal(v2.version,2);
 // Stored QR = the supplier sticker identity of each piece.
 const expected=await S(()=>{switchToProject('qj','qu');const parts=cabinet().parts;return parts.map(p=>Array.from({length:p.qty},(_,i)=>{const qr=phoneQrText(p,i+1);return {piece:i+1,qr,label:fiqQrLabelText(qr)}}))});
 assert.deepEqual(v2.panels.map(r=>r.pieces),expected,'saved QR equals the sticker identity, per piece');
 const sticker=await S(()=>fiqSupplierDataset(cabinet().parts).rows.map(r=>r.qr));
 assert.deepEqual(v2.panels.flatMap(r=>r.pieces.map(x=>x.qr)),sticker,'same as the supplier dataset QR');
 // Customer Library: open the list, QR per row, viewer with both pieces.
 await S(()=>{show('customers');openCustomerCard(state.projects.find(p=>p.id==='qj').customerId)});await page.waitForTimeout(400);
 await page.locator('#customerCardBody [data-open-cutting-list-project="qj"]').first().click();await page.waitForTimeout(300);
 assert.equal(await page.locator('.fiq-sent-latest tr[data-sent-panel="P-002"] [data-sent-qr]').innerText(),'▦ QR');
 await page.locator('.fiq-sent-latest tr[data-sent-panel="P-002"] [data-sent-qr]').click();await page.waitForTimeout(400);
 const viewer=await S(()=>({title:document.querySelector('.fiq-qr-sheet h2').innerText,pieces:[...document.querySelectorAll('.fiq-qr-piece')].map(e=>({label:e.querySelector('b').innerText,text:e.querySelector('small').innerText,drawn:!!e.querySelector('.fiq-qr-box canvas,.fiq-qr-box img,.fiq-qr-box table')}))}));
 assert.equal(viewer.title,'P-002 — Shelf');
 assert.deepEqual(viewer.pieces.map(x=>[x.label,x.text]),[['P-002 · piece 1/2',expected[1][0].label],['P-002 · piece 2/2',expected[1][1].label]]);
 if(!process.env.STUDIO_URL||true)assert.ok(viewer.pieces.every(x=>x.drawn),'QR drawn');
 if(process.env.SHOT){await page.locator('.fiq-qr-sheet').screenshot({path:process.env.SHOT+'/qr-viewer.png'})}
 await page.locator('[data-qr-close]').click();await page.waitForTimeout(150);
 if(process.env.SHOT){await page.locator('.fiq-job-dialog .a100-edit-sheet').screenshot({path:process.env.SHOT+'/cutting-list-qr.png'})}
 // The older version (no stored QR) shows "—", nothing rebuilt.
 await page.locator('.fiq-job-dialog [data-previous-versions]').click();await page.locator('.fiq-job-dialog [data-old-version="1"] > summary').click();await page.waitForTimeout(150);
 assert.equal((await page.locator('.fiq-job-dialog [data-old-version="1"] tr[data-sent-panel="P-001"] td').last().innerText()).trim(),'—');
 await page.locator('.fiq-job-dialog [data-job-close]').first().click();

 // Panel Check: compact card -> Edit panel -> that exact panel in Drawing.
 await S(()=>{switchToProject('qj','qu');renderAll();show('parts');renderAll()});await page.waitForTimeout(400);
 const card=page.locator('#partsSummary .panel-check-card',{hasText:'P-002'}).first();
 assert.equal(await card.evaluate(c=>c.classList.contains('fiq-compact')),true);
 await card.click();await page.waitForTimeout(200);
 await page.locator('#partsSummary [data-edit-panel="q2"]').click();await page.waitForTimeout(500);
 const inDrawing=await S(()=>({screen:state.screen,part:state.currentPart,cab:state.currentCabinet,selected:(document.querySelector('#drawingCanvas .pin.selected')||{}).dataset?.id,length:document.getElementById('fLength').value,width:document.getElementById('fWidth').value}));
 assert.deepEqual(inDrawing,{screen:'mark',part:'q2',cab:'qu',selected:'q2',length:'764',width:'560'},'that exact panel, selected, ready to edit');
 await page.click('#fLength');await page.keyboard.press('Control+A');await page.keyboard.type('750');await page.waitForTimeout(500);
 await page.locator('.nav-btn[data-screen="parts"]').first().click();await page.waitForTimeout(500);
 assert.equal(await S(()=>{const c=[...document.querySelectorAll('#partsSummary .panel-check-card')].find(x=>/P-002/.test(x.innerText));return c.classList.contains('incomplete')&&!c.classList.contains('fiq-compact')}),true,'needs Panel Check again, shown full');
 await page.locator('.nav-btn[data-screen="cutting"]').first().click();await page.waitForTimeout(400);
 assert.equal(await page.locator('#panelCheckReturnBtn').count(),0,'Send to Job Overview blocked until checked');
 // The saved V2 QR did not change with the edit.
 assert.deepEqual(await S(()=>state.projects.find(p=>p.id==='qj').sentCuttingLists['room:qr'][1].panels.map(r=>r.pieces)),expected);

 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
