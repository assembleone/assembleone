// Order missing panels -> Replacement panels PDF. Real click in Panel Check:
//  - one "REPLACEMENT PANEL" block per damaged/missing physical piece: panel number and
//    name, L × W × T mm, material, edging, job → room · unit, piece n/N, reason (+ damage
//    note), the damage photo, and a QR;
//  - the QR is the SAME identity as the piece being replaced (the supplier sticker QR);
//  - a whole damaged panel of Qty 1 gives one block; a Qty 2 panel with piece 2 missing
//    gives one block for piece 2/2 only;
//  - the "CSV list" button still downloads the same CSV as before.
// With SHOT set, page 1 is rendered to a PNG for review.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',WORKER='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:1366,height:900},acceptDownloads:true});
 const page=await ctx.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 const cdn=u=>String(u).startsWith('https://cdnjs.cloudflare.com/');
 if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/')&&!cdn(u),r=>r.abort());
 else await page.route(u=>!String(u).startsWith('http://127.0.0.1')&&!cdn(u),r=>r.abort());
 await page.goto(process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor'&&typeof window.fiqBuildReplacementPdf==='function');
 await page.waitForTimeout(900);
 const S=(fn,a)=>page.evaluate(fn,a);
 await S(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const st=(0,eval)('state');
  // A small "damage photo" (red square with a crack line).
  const cv=document.createElement('canvas');cv.width=160;cv.height=120;const x=cv.getContext('2d');x.fillStyle='#c9a36b';x.fillRect(0,0,160,120);x.strokeStyle='#5a3310';x.lineWidth=5;x.beginPath();x.moveTo(20,20);x.lineTo(80,70);x.lineTo(140,40);x.stroke();
  const photo=cv.toDataURL('image/jpeg',0.8);
  const mk=(id,code,name,l,w,qty,mat,eL,extra)=>{const p=Object.assign({id,code,name,length:l,width:w,thickness:19,qty,material:mat,edgeLong:eL,edgeShort:0,notes:'',status:'ready',x:10,y:10,copies:[]},extra||{});p.reviewSignature=window.panelReviewSignature(p);return p};
  st.projects.push({id:'jf',name:'Jf',customer:'Jones Family',rooms:[{id:'rw',name:'Wardrobe 1'}],cabinets:[{id:'uw',roomId:'rw',name:'Wardrobe 1',parts:[
   mk('a1','P-001','Top',1220,580,1,'Oak melamine',0),
   mk('a3','P-003','Side',1220,320,1,'Oak melamine',1,{status:'damaged',damagedQty:1,damageNote:'Corner chipped on delivery',panelPhotos:[{data:photo}]}),
   mk('a5','P-005','Shelf',764,300,2,'Oak melamine',0,{pieceStates:{'2':{status:'missing',statusAt:Date.now()}}})]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));switchToProject('jf','uw');save();renderAll();show('parts');renderAll();
 });
 await page.waitForTimeout(500);
 assert.match(await page.locator('#orderMissingPanelsBtn').innerText(),/Order missing panels \(2\)/);
 // The blocks (what the PDF is built from) and their QR identity.
 const items=await S(async()=>{const pr=project();const rows=pr.cabinets.flatMap(c=>c.parts.map(pt=>({pt,c}))).filter(({pt})=>fiqPanelIssue(pt));const it=await window.fiqReplacementItems(rows,pr);return it.map(x=>({...x,photo:!!x.photo}))});
 assert.deepEqual(items.map(i=>[i.code,i.name,i.length+'×'+i.width+'×'+i.thickness,i.material,i.edging,i.job,i.piece+'/'+i.pieces,i.reason,i.note,i.photo]),[
  ['P-003','Side','1220×320×19','Oak melamine','1 long edge','Jf → Wardrobe 1','1/1','Damaged','Corner chipped on delivery',true],
  ['P-005','Shelf','764×300×19','Oak melamine','None','Jf → Wardrobe 1','2/2','Missing','',false]]);
 const stickerQr=await S(()=>{const c=cabinet();return [phoneQrText(c.parts.find(p=>p.id==='a3'),1),phoneQrText(c.parts.find(p=>p.id==='a5'),2)]});
 assert.deepEqual(items.map(i=>i.qr),stickerQr,'same QR identity as the piece being replaced');
 // Real click: the PDF downloads.
 const [dl]=await Promise.all([page.waitForEvent('download'),page.locator('#orderMissingPanelsBtn').click()]);
 assert.match(dl.suggestedFilename(),/^Jones_Family_Jf_replacement_panels\.pdf$/);
 const bytes=fs.readFileSync(await dl.path());
 // Read the PDF back with pdf.js.
 const reader=await ctx.newPage();await reader.setContent('<html><body></body></html>');await reader.addScriptTag({url:PDFJS});
 const out=await reader.evaluate(async([b64,worker,render])=>{pdfjsLib.GlobalWorkerOptions.workerSrc=worker;const pdf=await pdfjsLib.getDocument({data:Uint8Array.from(atob(b64),c=>c.charCodeAt(0))}).promise;
  const pg=await pdf.getPage(1);const text=(await pg.getTextContent()).items.map(i=>i.str).join(' ');const ops=await pg.getOperatorList();const images=ops.fnArray.filter(f=>f===pdfjsLib.OPS.paintImageXObject||f===pdfjsLib.OPS.paintJpegXObject).length;
  let png=null;if(render){const vp=pg.getViewport({scale:1.6});const cv=document.createElement('canvas');cv.width=vp.width;cv.height=vp.height;await pg.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;png=cv.toDataURL('image/png')}
  return {pages:pdf.numPages,text,images,png}},[bytes.toString('base64'),WORKER,!!process.env.SHOT]);
 const txt=out.text.replace(/\s+/g,' ');
 for(const s of ['Replacement panels','REPLACEMENT PANEL','P-003 — Side','1220 × 320 × 19 mm','Oak melamine','Edging: 1 long edge','Jf -> Wardrobe 1','Piece 1/1','Reason: Damaged','Corner chipped on delivery','P-005 — Shelf','Piece 2/2','Reason: Missing'])assert.ok(txt.includes(s),'PDF shows "'+s+'": '+txt.slice(0,400));
 assert.ok(out.images>=1,'damage photo in the PDF');
 if(process.env.SHOT&&out.png)fs.writeFileSync(process.env.SHOT+'/replacement-pdf.png',Buffer.from(out.png.split(',')[1],'base64'));
 // The CSV list button still downloads the same CSV.
 const [dl2]=await Promise.all([page.waitForEvent('download'),page.locator('#orderMissingCsvBtn').click()]);
 assert.match(dl2.suggestedFilename(),/_missing_panels/);// the existing CSV file name, unchanged
 const csv=fs.readFileSync(await dl2.path(),'utf8');
 assert.match(csv,/"Panel No\.","Part name","Unit","Status","Quantity","Thickness mm","Length mm","Width mm","Material"/);
 assert.match(csv,/"P-003","Side","Wardrobe 1","Damaged"/);
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true,pages:out.pages}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
