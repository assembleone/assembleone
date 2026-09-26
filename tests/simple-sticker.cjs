// The panel sticker is kept simple. Left: Part Name (large, upper case), L × W × T mm,
// material, customer name (small). Right: panel number above a large QR. No Qty anywhere,
// no extra code, one sticker per physical panel, each with its own QR (the panel's
// existing identity plus the piece's copyIndex). Checked on the on-screen Sticker Preview at laptop and
// one-third-screen width (the PDF stickers are checked against it in supplier-pack-pdf.cjs).
// Runs the real public Studio loader with every network request blocked except the QR library.
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
 await page.route(/^https?:\/\/(?!127\.0\.0\.1|cdnjs\.cloudflare\.com\/ajax\/libs\/qrcodejs\/)/,r=>r.abort());
 await page.route(/^https?:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/qrcodejs\//,r=>r.continue());
 await page.goto(`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>typeof window.fiqStickerHtml==='function'&&typeof window.fiqDownloadSupplierPackPdf==='function');
 await page.waitForTimeout(800);
 await page.evaluate(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const mk=(id,code,name,l,w,th,q,mat)=>{const p={id,code,name,length:l,width:w,thickness:th,qty:q,material:mat,edgeLong:1,edgeShort:0,notes:'',status:'ready',x:10,y:10,copies:[]};p.reviewSignature=window.panelReviewSignature?window.panelReviewSignature(p):'';return p};
  const st=(0,eval)('state');
  st.projects.push({id:'sj',name:'Sticker job',customer:'Sam Sticker',rooms:[{id:'r1',name:'Bedroom'}],cabinets:[{id:'sc',roomId:'r1',name:'Wardrobe',drawing,drawingType:'image',parts:[
   mk('s1','P-001','Top / Bottom',2230,240,19,2,'Oak melamine'),mk('s2','P-002','Shelf',800,400,18,3,'White melamine'),mk('s3','P-003','Back',2200,1200,8,1,'MDF')]}],jobLog:[],updatedAt:Date.now()});
  switchToProject('sj','sc');renderAll();show('cutting');
 });
 await page.waitForTimeout(500);
 const S=fn=>page.evaluate(fn);
 const before=await S(()=>JSON.stringify(cabinet().parts.map(p=>[p.id,p.code,p.qty,p.length,p.width,p.thickness])));
 const expectQr=await S(()=>Object.fromEntries(cabinet().parts.map(p=>[p.code,phoneQrText(p)])));
 const read=sel=>[...sel].map(s=>({name:s.querySelector('.fs-name').innerText.trim(),dims:s.querySelector('.fs-dims').innerText.replace(/\u00a0/g,' ').trim(),mat:s.querySelector('.fs-mat').innerText.trim(),
  cust:(s.querySelector('.fs-cust')||{}).innerText||'',code:s.querySelector('.fs-code').innerText.trim(),text:s.innerText.replace(/\s+/g,' ').trim()}));
 const want=[...Array(2).fill(['TOP / BOTTOM','2230 × 240 × 19 mm','Oak melamine','Sam Sticker','P-001']),...Array(3).fill(['SHELF','800 × 400 × 18 mm','White melamine','Sam Sticker','P-002']),['BACK','2200 × 1200 × 8 mm','MDF','Sam Sticker','P-003']];

 // 1. The sticker layout (Sticker Preview; the printed stickers are the PDF's, see
 //    tests/supplier-pack-pdf.cjs, which checks they match this preview exactly).
 const printed=await S(()=>{const st=[...document.querySelectorAll('#supplierLabels .fiq-sticker')];const qrEl=s=>[...s.querySelectorAll('.fs-qr canvas,.fs-qr img')].find(e=>e.getBoundingClientRect().width>0);
  return {rows:st.map(s=>({name:s.querySelector('.fs-name').innerText.trim(),dims:s.querySelector('.fs-dims').innerText.replace(/\u00a0/g,' ').trim(),mat:s.querySelector('.fs-mat').innerText.trim(),cust:s.querySelector('.fs-cust').innerText.trim(),code:s.querySelector('.fs-code').innerText.trim(),text:s.innerText,
   qr:s.querySelector('.fs-qr canvas').toDataURL(),left:s.querySelector('.fs-left').getBoundingClientRect(),right:s.querySelector('.fs-right').getBoundingClientRect(),codeBox:s.querySelector('.fs-code').getBoundingClientRect(),qrBox:qrEl(s).getBoundingClientRect(),box:s.getBoundingClientRect(),
   nameSize:parseFloat(getComputedStyle(s.querySelector('.fs-name')).fontSize),custSize:parseFloat(getComputedStyle(s.querySelector('.fs-cust')).fontSize)}))}});
 assert.deepEqual(printed.rows.map(r=>[r.name,r.dims,r.mat,r.cust,r.code]),want,'one sticker per physical panel, with exactly these fields');
 for(const r of printed.rows){
  assert.equal(r.text.replace(/\s+/g,' ').trim(),[r.name,r.dims,r.mat,r.cust,r.code].join(' '),'nothing else on '+r.code);
  assert.ok(r.left.right<=r.right.left,'text on the left, number and QR on the right: '+r.code);
  assert.ok(r.codeBox.bottom<=r.qrBox.top,'panel number above the QR: '+r.code);
  assert.ok(r.qrBox.width>=130&&Math.abs(r.qrBox.width-r.qrBox.height)<1,'large square QR: '+r.qrBox.width);
  assert.ok(r.qrBox.right<=r.box.right&&r.qrBox.bottom<=r.box.bottom,'QR inside the sticker');
  assert.ok(r.nameSize>r.custSize*2,'part name prominent, customer small');
 }
 // Same QR for every copy of a panel, and different panels differ.
 const byCode={};printed.rows.forEach(r=>(byCode[r.code]=byCode[r.code]||new Set()).add(r.qr));
 assert.deepEqual(Object.values(byCode).map(s=>s.size),[2,3,1],'every physical piece has its own QR, also identical pieces');
 assert.equal(new Set(printed.rows.map(r=>r.qr)).size,6,'six stickers, six different QR codes');

 // 2. The on-screen Sticker preview, same sticker, one per physical panel.
 for(const w of [1366,512,455]){
  await page.setViewportSize({width:w,height:900});await page.waitForTimeout(300);
  const prev=await S(()=>{const box=document.getElementById('supplierLabels');const st=[...box.querySelectorAll('.fiq-sticker')];return {
   rows:st.map(s=>[s.querySelector('.fs-name').innerText.trim(),s.querySelector('.fs-dims').innerText.replace(/\u00a0/g,' ').trim(),s.querySelector('.fs-mat').innerText.trim(),s.querySelector('.fs-cust').innerText.trim(),s.querySelector('.fs-code').innerText.trim()]),
   qty:/Qty/i.test(box.innerText),qrs:st.map(s=>Math.max(0,...[...s.querySelectorAll('.fs-qr canvas,.fs-qr img')].map(c=>Math.round(c.getBoundingClientRect().width)))),
   over:st.filter(s=>s.getBoundingClientRect().right>box.getBoundingClientRect().right+1||s.scrollWidth>s.clientWidth+1).length}});
  assert.deepEqual(prev.rows,want,'preview rows at '+w);
  assert.equal(prev.qty,false,'no Qty in the preview at '+w);
  assert.ok(prev.qrs.every(q=>q>=110),'preview QR large at '+w+': '+prev.qrs);
  assert.equal(prev.over,0,'preview fits at '+w);
 }

 // 3. Nothing about the panels changed.
 assert.equal(await S(()=>JSON.stringify(cabinet().parts.map(p=>[p.id,p.code,p.qty,p.length,p.width,p.thickness]))),before,'panel ids, numbers and quantities unchanged');
 assert.deepEqual(await S(()=>Object.fromEntries(cabinet().parts.map(p=>[p.code,phoneQrText(p)]))),expectQr,'QR identities unchanged');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true,printed:printed.rows.length}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
