// Download Supplier PDF. Through the real button: the PDF downloads; it is A4 at 100%
// (no scaling asked of the printer); page 1 has the job/customer identification and the
// cutting list; then sticker pages with the "Print at 100% / Actual Size" instruction.
// The PDF is rendered at 100% (300 dpi, and again at 150 dpi) and measured: every sticker
// is 90 x 50 mm (line centre to line centre), the check ruler is 100 mm, the QR is 37 mm and
// every QR scans. One sticker per physical panel, and each PDF sticker has exactly the panel
// number, part name, sizes, material, customer and QR payload of the Sticker Preview.
// Downloading again gives the same stickers and QR payloads. No panel data changes.
// Network: only the QR / PDF libraries (cdnjs) and, for reading the PDF back, pdf.js and jsQR.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const {pdfReader,JSQR}=require('./helpers/pdf-read.cjs');
const allowed=/^https:\/\/(cdnjs\.cloudflare\.com\/ajax\/libs\/(qrcodejs|jspdf|pdf\.js)\/|cdn\.jsdelivr\.net\/npm\/jsqr@)/;
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:1366,height:900},acceptDownloads:true});
 const page=await ctx.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>{errors.push('dialog: '+d.message());d.accept()});
 const liveUrl=process.env.STUDIO_URL;
 await page.route(u=>{const s=String(u);return !(allowed.test(s)||(liveUrl?s.startsWith('https://assembleone.github.io/'):/^http:\/\/127\.0\.0\.1/.test(s)))},r=>r.abort());
 await page.goto(liveUrl||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>typeof window.fiqDownloadSupplierPackPdf==='function'&&window.QRCode);
 await page.waitForTimeout(800);
 await page.evaluate(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const mk=(id,code,name,l,w,th,q,mat,notes)=>{const p={id,code,name,length:l,width:w,thickness:th,qty:q,material:mat,edgeLong:2,edgeShort:1,notes:notes||'',status:'ready',x:10,y:10,copies:[]};p.reviewSignature=window.panelReviewSignature?window.panelReviewSignature(p):'';return p};
  const st=(0,eval)('state');
  st.projects.push({id:'pj',name:'Hall wardrobe',customer:'Søren Nielsen',rooms:[{id:'r1',name:'Hallway'}],cabinets:[{id:'pc',roomId:'r1',name:'Wardrobe 1',drawing,drawingType:'image',parts:[
   mk('a','P-001','Top / Bottom',2230,240,19,2,'Oak melamine'),mk('b','P-002','Shelf',800,400,18,3,'White melamine','Drill 5 mm shelf pin holes'),
   mk('c','P-003','Back',2200,1200,8,1,'MDF'),mk('d','P-004','Side',2400,600,19,4,'Oak melamine')]}],jobLog:[],updatedAt:Date.now()});
  switchToProject('pj','pc');renderAll();show('cutting');
 });
 await page.waitForTimeout(700);
 const partsBefore=await page.evaluate(()=>JSON.stringify(cabinet().parts));

 // Sticker Preview as shown, with each preview QR decoded.
 await page.addScriptTag({url:JSQR});
 const preview=await page.evaluate(()=>[...document.querySelectorAll('#supplierLabels .fiq-sticker')].map(s=>{
  const c=s.querySelector('.fs-qr canvas'),pad=20,cv=document.createElement('canvas');cv.width=c.width+2*pad;cv.height=c.height+2*pad;const x=cv.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);x.drawImage(c,pad,pad);
  const q=jsQR(x.getImageData(0,0,cv.width,cv.height).data,cv.width,cv.height);
  const t=sel=>s.querySelector(sel)?.innerText.replace(/ /g,' ').trim()||'';
  return {code:t('.fs-code'),left:[t('.fs-name'),t('.fs-dims'),t('.fs-mat'),t('.fs-cust')].filter(Boolean).join(' '),qr:q?q.data:null}}));
 assert.equal(preview.length,10,'preview: one sticker per physical panel');
 assert.ok(preview.every(p=>p.qr),'preview QRs scan');
 const pieceQr=(legacy,piece)=>{const o=JSON.parse(legacy);o.copyIndex=piece===1?-1:piece-2;return JSON.stringify(o)};
 const legacyQr=await page.evaluate(()=>Object.fromEntries(cabinet().parts.map(p=>[p.code,phoneQrText(p)])));
 // Sticker n of a panel is piece n: its QR is that panel's existing identity plus copyIndex.
 const seen={},expectList=preview.map(p=>{seen[p.code]=(seen[p.code]||0)+1;return pieceQr(legacyQr[p.code],seen[p.code])});
 preview.forEach((p,i)=>assert.equal(p.qr,expectList[i],'preview QR of '+p.code+' is its own piece identity'));
 assert.equal(new Set(preview.map(p=>p.qr)).size,10,'ten stickers, ten different QR codes');

 // The button, by its new name.
 const btn=page.locator('#printSupplierPackBtn');
 assert.deepEqual([await btn.locator('strong').innerText(),await btn.locator('small').innerText()],['Download Supplier PDF','Cutting list + print-ready QR stickers']);
 async function download(){
  await btn.scrollIntoViewIfNeeded();
  const [dl]=await Promise.all([page.waitForEvent('download',{timeout:60000}),btn.click()]);
  const file=await dl.path();return {name:dl.suggestedFilename(),bytes:fs.readFileSync(file)};
 }
 const first=await download();
 assert.equal(first.name,'Supplier Pack - Søren Nielsen - Hall wardrobe - Hallway · Wardrobe 1.pdf','file name');
 assert.match(first.bytes.slice(0,8).toString('latin1'),/^%PDF-/,'a real PDF file');
 assert.match(first.bytes.toString('latin1'),/\/PrintScaling\s*\/None/,'PDF asks the printer not to scale');
 assert.equal(await page.locator('#a131PrintOverlay').evaluate(o=>o.style.display),'','no in-app print preview opened');
 assert.match(await page.locator('#supplierActionStatus').innerText(),/Downloaded .*10 stickers/);
 await page.waitForTimeout(300);
 const second=await download();

 // Read the PDF back: render at 100% and measure, extract text, scan QRs.
 const analyse=await pdfReader(ctx);
 const a=await analyse(first.bytes,300);
 // Pages: A4, 100%.
 a.pages.forEach((p,i)=>{assert.ok(Math.abs(p.wMm-210)<0.05&&Math.abs(p.hMm-297)<0.05,'page '+(i+1)+' is A4: '+p.wMm+' x '+p.hMm)});
 // Page 1: identification and cutting list.
 const p1=a.pages[0].text;
 for(const s of ['Supplier Cutting List','Customer:','Søren Nielsen','Job:','Hall wardrobe','Hallway · Wardrobe 1','Job ref:','10 panels','P-001','Top / Bottom','2230','P-002','Drill 5 mm shelf pin holes','P-003','P-004','Oak melamine','2 long · 1 short'])assert.ok(p1.includes(s),'cutting list page has '+s+' :: '+p1);
 assert.ok(!/Print at 100%/.test(p1),'cutting list comes first');
 // Sticker pages.
 const stickerPages=a.pages.filter(p=>/Print at 100% \/ Actual Size — Do not Fit to Page/.test(p.text));
 assert.equal(stickerPages.length,2,'10 stickers on 2 sticker pages, each with the instruction');
 assert.equal(a.pages.length,3,'cutting list page + 2 sticker pages');
 a.rulers.forEach(r=>assert.ok(Math.abs(r-100)<0.3,'check ruler is 100 mm: '+r));
 assert.equal(a.stickers.length,10,'one PDF sticker per physical panel');
 for(const s of a.stickers){
  assert.ok(Math.abs(s.wMm-90)<0.2,s.code+' width 90 mm: '+s.wMm);
  assert.ok(Math.abs(s.hMm-50)<0.2,s.code+' height 50 mm: '+s.hMm);
  assert.ok(Math.abs(s.qrMm-37)<0.6,s.code+' QR 37 mm: '+s.qrMm);
  assert.equal(s.qr,expectList[a.stickers.indexOf(s)],s.code+' QR scans to its own piece identity');
  assert.equal(s.qrWhole,expectList[a.stickers.indexOf(s)],s.code+' QR scans from the whole cut sticker');
 }
 assert.deepEqual(a.stickers.map(s=>({code:s.code,left:s.left,qr:s.qr})),preview.map(p=>({code:p.code,left:p.left,qr:p.qr})),'PDF stickers match Sticker Preview exactly, in order');
 // Lower print resolution still scans.
 const low=await analyse(first.bytes,150);
 assert.deepEqual(low.stickers.map(s=>s.qr),preview.map(p=>p.qr),'QRs scan at 150 dpi too');
 // Downloading again: same stickers, same QR identities.
 const b=await analyse(second.bytes,300);
 assert.deepEqual(b.stickers.map(s=>[s.code,s.left,s.qr]),a.stickers.map(s=>[s.code,s.left,s.qr]),'re-download gives the same stickers and QR identities');
 // Nothing on the job changed.
 assert.equal(await page.evaluate(()=>JSON.stringify(cabinet().parts)),partsBefore,'panel data unchanged');
 assert.deepEqual(errors,[],'no page errors');
 fs.writeFileSync(path.join(process.env.PDF_OUT||require('os').tmpdir(),'supplier-pack-test.pdf'),first.bytes);
 console.log(JSON.stringify({ok:true,file:first.name,pages:a.pages.length,sticker:[a.stickers[0].wMm.toFixed(2),a.stickers[0].hMm.toFixed(2)],qrMm:a.stickers[0].qrMm.toFixed(2),ruler:a.rulers[0].toFixed(2)}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
