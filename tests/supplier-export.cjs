// Export for Supplier. Through the real UI (Supplier system dropdown + Download Production
// File, and Download Supplier PDF), for ARDIS, HOMAG / Cut Rite, SCM Maestro and Standard
// CSV: one row per physical panel; every physical panel keeps exactly the same panel number,
// dimensions, material and existing FittersIQ QR payload (phoneQrText) in all four files and
// in the Supplier PDF (rendered at 100% and each QR scanned). Identical panels stay
// separate: separate panel records keep their own numbers and QR codes, and each piece of a
// Qty > 1 panel gets its own row with its own piece reference. The Supplier PDF is the same
// whichever system is selected. A supplier profile can override columns, delimiter and
// units. No panel data changes.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pdfReader}=require('./helpers/pdf-read.cjs');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const allowed=/^https:\/\/(cdnjs\.cloudflare\.com\/ajax\/libs\/(qrcodejs|jspdf|pdf\.js)\/|cdn\.jsdelivr\.net\/npm\/jsqr@)/;
function parseCsv(text,dl){
 assert.equal(text.charCodeAt(0),0xFEFF,'UTF-8 BOM so Excel reads ø correctly');text=text.slice(1);
 const rows=[];let row=[],cur='',q=false;
 for(let i=0;i<text.length;i++){const c=text[i];
  if(q){if(c==='"'){if(text[i+1]==='"'){cur+='"';i++}else q=false}else cur+=c;continue}
  if(c==='"')q=true;else if(c===dl){row.push(cur);cur=''}else if(c==='\r'){}else if(c==='\n'){row.push(cur);rows.push(row);row=[];cur=''}else cur+=c}
 if(cur||row.length){row.push(cur);rows.push(row)}
 const [head,...body]=rows;return body.map(r=>{assert.equal(r.length,head.length,'every row has every column');return Object.fromEntries(head.map((h,i)=>[h,r[i]]))});
}
// Independent of the app: which column holds what, per system.
const MAP={
 ardis:{dl:';',label:'ARDIS',panel:'PanelNumber',ref:'PartID',piece:'Info2_Piece',name:'Description',L:'Length',W:'Width',T:'Thickness',mat:'Material',qty:'Quantity',qr:'Info1_FittersIQ_QR',et:'EdgeTop',eb:'EdgeBottom',el:'EdgeLeft',er:'EdgeRight',grain:'Grain',notes:'Info3_Notes',cust:'Customer',job:'Job',room:'Room'},
 cutrite:{dl:';',label:'Cut Rite',panel:'Panel number',ref:'Part reference',piece:'Info 5 Piece',name:'Description',L:'Length',W:'Width',T:'Thickness',mat:'Material',qty:'Quantity',qr:'Info 1 FittersIQ QR',et:'Edge top',eb:'Edge bottom',el:'Edge left',er:'Edge right',grain:'Grain',notes:'Info 6 Notes',cust:'Info 2 Customer',job:'Info 3 Job',room:'Info 4 Room'},
 maestro:{dl:';',label:'SCM Maestro',panel:'PanelNumber',ref:'Code',piece:'Piece',name:'Description',L:'Length',W:'Width',T:'Thickness',mat:'Material',qty:'Quantity',qr:'LabelQR',et:'EdgeTop',eb:'EdgeBottom',el:'EdgeLeft',er:'EdgeRight',grain:'Grain',notes:'Notes',cust:'Customer',job:'Order',room:'Room'},
 standard:{dl:',',label:'Standard CSV',panel:'Panel Number',ref:'Piece Ref',piece:'Piece',name:'Part Name',L:'Length (mm)',W:'Width (mm)',T:'Thickness (mm)',mat:'Material',qty:'Quantity',qr:'FittersIQ QR',et:'Edge Top',eb:'Edge Bottom',el:'Edge Left',er:'Edge Right',grain:'Grain Direction',notes:'Notes',cust:'Customer',job:'Job',room:'Room / Unit'}};
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
 await page.waitForFunction(()=>typeof window.fiqDownloadProductionFile==='function'&&typeof window.fiqDownloadSupplierPackPdf==='function'&&window.QRCode);
 await page.waitForTimeout(800);
 await page.evaluate(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const mk=(id,code,name,l,w,th,q,mat,eL,eS,notes)=>{const p={id,code,name,length:l,width:w,thickness:th,qty:q,material:mat,edgeLong:eL,edgeShort:eS,notes:notes||'',status:'ready',x:10,y:10,copies:[]};p.reviewSignature=window.panelReviewSignature?window.panelReviewSignature(p):'';return p};
  const st=(0,eval)('state');
  st.projects.push({id:'xj',name:'Bedroom fit',customer:'Åse Møller',rooms:[{id:'r1',name:'Bedroom'}],cabinets:[{id:'xc',roomId:'r1',name:'Wardrobe A',drawing,drawingType:'image',parts:[
   mk('x1','P-001','Top / Bottom',2230,240,19,2,'Oak melamine',1,0),
   mk('x2','P-002','Shelf',800,400,18,3,'White melamine',1,2,'Drill; 5 mm "pin" holes'),
   mk('x3','P-003','Side, left',2400,600,19,1,'Oak melamine',2,1),
   mk('x5','P-005','Divider',700,560,18,1,'White melamine',1,0),mk('x6','P-006','Divider',700,560,18,1,'White melamine',1,0),
   mk('x7','P-007','Back',2200,1200,8,1,'MDF',0,0)]}],jobLog:[],updatedAt:Date.now()});
  switchToProject('xj','xc');renderAll();show('cutting');
 });
 await page.waitForTimeout(700);
 const before=await page.evaluate(()=>JSON.stringify(state.projects.find(p=>p.id==='xj')));
 const pieceQr=(legacy,piece)=>{const o=JSON.parse(legacy);o.copyIndex=piece===1?-1:piece-2;return JSON.stringify(o)};
 const legacyQr=await page.evaluate(()=>Object.fromEntries(cabinet().parts.map(p=>[p.code,phoneQrText(p)])));
 const qrOf=(code,piece)=>pieceQr(legacyQr[code],piece);
 const parts=await page.evaluate(()=>Object.fromEntries(cabinet().parts.map(p=>[p.code,{name:p.name,L:p.length,W:p.width,T:p.thickness,qty:p.qty,mat:p.material,eL:p.edgeLong,eS:p.edgeShort,notes:p.notes}])));
 // The expected physical pieces, in Cutting List order.
 const pieces=[];Object.entries(parts).forEach(([code,p])=>{for(let i=1;i<=p.qty;i++)pieces.push({code,n:i,piece:i+'/'+p.qty,ref:code+'-'+i})});
 assert.equal(pieces.length,9);

 // UI.
 const ui=await page.evaluate(()=>({head:document.querySelector('.supplier-export-head')?.innerText.replace(/\s+/g,' ').trim(),options:[...document.querySelectorAll('#supplierSystemSelect option')].map(o=>o.textContent),
  buttons:[...document.querySelectorAll('#screen-cutting .supplier-action')].filter(b=>!b.hidden).map(b=>b.querySelector('strong').innerText+' | '+b.querySelector('small').innerText)}));
 assert.match(ui.head,/^Export for Supplier Supplier system:/);
 assert.deepEqual(ui.options,['ARDIS','HOMAG / Cut Rite','SCM Maestro','Standard CSV']);
 assert.deepEqual(ui.buttons.map(b=>b.split(' | ')[0]),['Download Production File','Download Supplier PDF']);
 assert.equal(ui.buttons[1].split(' | ')[1],'Cutting list + print-ready QR stickers');

 async function click(sel){const b=page.locator(sel);await b.scrollIntoViewIfNeeded();const [dl]=await Promise.all([page.waitForEvent('download',{timeout:60000}),b.click()]);return {name:dl.suggestedFilename(),bytes:fs.readFileSync(await dl.path())}}
 const exported={};
 for(const sys of ['ardis','cutrite','maestro','standard']){
  const m=MAP[sys];
  await page.locator('#supplierSystemSelect').selectOption(sys);await page.waitForTimeout(100);
  assert.equal(await page.locator('#fiqProductionFileSub').innerText(),m.label+' CSV · 9 rows, one per physical panel',sys+' subtitle');
  const f=await click('#fiqProductionFileBtn');
  assert.equal(f.name,m.label+' production file - Åse Møller - Bedroom fit - Bedroom · Wardrobe A.csv',sys+' file name');
  const rows=parseCsv(f.bytes.toString('utf8'),m.dl);
  assert.equal(rows.length,9,sys+': one row per physical panel');
  rows.forEach((r,i)=>{const pc=pieces[i],p=parts[pc.code];
   const got={panel:r[m.panel],ref:r[m.ref],piece:r[m.piece],name:r[m.name],L:r[m.L],W:r[m.W],T:r[m.T],mat:r[m.mat],qty:r[m.qty],qr:r[m.qr],edges:[r[m.et],r[m.eb],r[m.el],r[m.er]].join(''),grain:r[m.grain],notes:r[m.notes],cust:r[m.cust],job:r[m.job],room:r[m.room]};
   assert.deepEqual(got,{panel:pc.code,ref:pc.ref,piece:pc.piece,name:p.name,L:String(p.L),W:String(p.W),T:String(p.T),mat:p.mat,qty:'1',qr:qrOf(pc.code,pc.n),
    edges:[p.eL>=1?1:0,p.eL>=2?1:0,p.eS>=1?1:0,p.eS>=2?1:0].join(''),grain:'Length',notes:p.notes,cust:'Åse Møller',job:'Bedroom fit',room:'Bedroom · Wardrobe A'},sys+' row '+(i+1));
  });
  exported[sys]=rows.map(r=>[r[m.panel],r[m.L],r[m.W],r[m.T],r[m.mat],r[m.qr]]);
 }
 assert.match(await page.locator('#supplierActionStatus').innerText(),/Downloaded Standard CSV production file .* 9 rows, one per physical panel\./);

 // Supplier PDF, with a different system selected each time: identical either way.
 const analyse=await pdfReader(ctx);
 await page.locator('#supplierSystemSelect').selectOption('maestro');
 const pdfA=await analyse((await click('#printSupplierPackBtn')).bytes,300);
 await page.locator('#supplierSystemSelect').selectOption('ardis');await page.waitForTimeout(300);
 const pdfB=await analyse((await click('#printSupplierPackBtn')).bytes,300);
 assert.deepEqual(pdfB.stickers.map(s=>[s.code,s.left,s.qr]),pdfA.stickers.map(s=>[s.code,s.left,s.qr]),'Supplier PDF does not depend on the selected system');
 assert.equal(pdfA.stickers.length,9,'PDF: one sticker per physical panel');
 const pdfRows=pdfA.stickers.map((s,i)=>{
  assert.ok(Math.abs(s.wMm-90)<0.2&&Math.abs(s.hMm-50)<0.2,'PDF sticker size '+s.wMm+' x '+s.hMm);
  const m=s.left.match(/^(.*) (\S+) × (\S+) × (\S+) mm (.*) Åse Møller$/);assert.ok(m,'PDF sticker text '+s.left);
  return [s.code,m[2],m[3],m[4],m[5],s.qr]});

 // The same physical panel through all five exports.
 const expected=pieces.map(pc=>{const p=parts[pc.code];return [pc.code,String(p.L),String(p.W),String(p.T),p.mat,qrOf(pc.code,pc.n)]});
 for(const [k,v] of Object.entries({...exported,pdf:pdfRows}))assert.deepEqual(v,expected,k+': same panel number, dimensions, material and QR identity for every physical panel');

 // Identical panels keep their own identity.
 assert.notEqual(qrOf('P-005',1),qrOf('P-006',1),'identical separate panels keep separate QR codes');
 assert.deepEqual(exported.standard.filter(r=>r[1]==='700').map(r=>[r[0],r[5]]),[['P-005',qrOf('P-005',1)],['P-006',qrOf('P-006',1)]]);
 assert.equal(new Set(exported.standard.map(r=>r[5])).size,9,'nine physical panels, nine different QR codes');
 const std=parseCsv((await (async()=>{await page.locator('#supplierSystemSelect').selectOption('standard');return click('#fiqProductionFileBtn')})()).bytes.toString('utf8'),',');
 assert.equal(new Set(std.map(r=>r['Piece Ref'])).size,9,'every physical panel has its own piece reference');
 assert.deepEqual(std.filter(r=>r['Panel Number']==='P-002').map(r=>[r['Piece Ref'],r.Piece,r['FittersIQ QR']]),[1,2,3].map(i=>['P-002-'+i,i+'/3',qrOf('P-002',i)]),'Qty 3 panel: three rows, each its own piece and its own QR on P-002');
 assert.deepEqual([1,2,3].map(i=>JSON.parse(qrOf('P-002',i)).copyIndex),[-1,0,1],'pieces 1, 2, 3 use copyIndex -1, 0, 1');

 // Choice remembered for this browser.
 assert.equal(await page.evaluate(()=>{try{return localStorage.getItem('assembleone_supplier_system')||localStorage.getItem('fiqbeta:assembleone_supplier_system')}catch(e){return 'x'}}),'standard');

 // Supplier profile: overrides are plain data; panel data is not touched.
 const prof=await page.evaluate(()=>{const p=fiqSupplierProfile({name:'Selima',system:'ardis',mapping:'Selima ARDIS',delimiter:',',units:'cm',decimal:',',columns:[{header:'Id',field:'pieceRef'},{header:'L',field:'length'},{header:'QR',field:'qr'}]});
  return {sys:p.system,name:p.name,text:fiqSupplierExport(p,fiqSupplierDataset()).split('\r\n').slice(0,3)}});
 assert.equal(prof.sys,'ardis');assert.equal(prof.name,'Selima');
 assert.deepEqual(prof.text.slice(0,2),['﻿Id,L,QR','P-001-1,223,"'+qrOf('P-001',1).replace(/"/g,'""')+'"'],'profile: own columns, delimiter and units (2230 mm = 223 cm)');

 assert.equal(await page.evaluate(()=>JSON.stringify(state.projects.find(p=>p.id==='xj'))),before,'job and panel data unchanged by exporting');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true,rows:9,systems:Object.keys(exported),pdfStickers:pdfA.stickers.length}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
