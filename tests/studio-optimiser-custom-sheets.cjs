// Studio Sheet Optimiser offers the company's saved Custom Sheets: choose one, save the typed size, open the manager, list refreshes.
// Network blocked; runs the Beta page. Default page: /beta/Studio.html
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('content-type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true});
  const page=await (await browser.newContext({viewport:{width:1400,height:1000}})).newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
  await page.goto(`http://127.0.0.1:${server.address().port}${process.env.FIQ_PAGE||'/beta/Studio.html'}`);
  await page.waitForFunction(()=>typeof finishDesignToCard==='function'&&window.fiqCustomSheets&&window.fiqOpenCustomSheets);
  await page.waitForTimeout(800);
  await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});
  await page.evaluate(()=>{
   const parts=[{id:'a',code:'P-001',name:'Side',length:765,width:467,thickness:19,qty:3,material:'Oak melamine',edgeLong:0,edgeShort:0,status:'ready',x:20,y:30,copies:[]}];
   parts.forEach(p=>p.reviewSignature=window.panelReviewSignature(p));
   state.projects.push({id:'p1',name:'Job',customer:'X',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'c1',roomId:'r1',name:'Kitchen',parts}],jobLog:[],updatedAt:Date.now()});
   state.customSheets=[{id:'cs1',name:'Supplier big sheet',w:3050,h:1300,createdAt:'2026-11-21',updatedAt:'2026-11-21',updatedBy:null}];
   switchToProject('p1','c1');renderAll();show('cutting');
  });
  await page.locator('#sheetOptimiserToggleBtn').click();
  const sel=page.locator('#sheetOptimiserBody select[data-sheet-preset="0"]');
  await sel.waitFor();
  assert.ok(await sel.locator('optgroup[label="My saved sheets"] option').count()===1,'saved sheet is offered');
  await sel.selectOption({label:'Supplier big sheet · 3050 × 1300 mm'});
  await page.waitForFunction(()=>/3050 × 1300/.test(document.getElementById('sheetOptimiserBody').innerText));
  assert.equal(await page.locator('#sheetOptimiserBody select[data-sheet-preset="0"] option:checked').innerText(),'Supplier big sheet · 3050 × 1300 mm');
  assert.equal(await page.locator('#sheetOptimiserBody [data-sheet-w="0"]').count(),0,'chosen saved sheet needs no typing');
  // Custom + Save this size opens the manager prefilled
  await page.locator('#sheetOptimiserBody select[data-sheet-preset="0"]').selectOption('custom');
  await page.locator('#sheetOptimiserBody [data-sheet-w="0"]').fill('2655');await page.locator('#sheetOptimiserBody [data-sheet-w="0"]').press('Tab');
  await page.waitForFunction(()=>document.querySelector('#sheetOptimiserBody [data-sheet-w="0"]').value==='2655');await page.waitForTimeout(300);
  await page.locator('#sheetOptimiserBody [data-sheet-h="0"]').fill('1335');await page.locator('#sheetOptimiserBody [data-sheet-h="0"]').press('Tab');await page.waitForTimeout(300);
  await page.locator('#sheetOptimiserBody [data-sheet-save="0"]').click();
  await page.locator('#fiqxCS').waitFor();
  assert.equal(await page.locator('#fiqxCS [data-csin="w"]').inputValue(),'2655');
  assert.equal(await page.locator('#fiqxCS [data-csin="h"]').inputValue(),'1335');
  await page.locator('#fiqxCS [data-csin="name"]').fill('Workshop 2655');
  await page.locator('#fiqxCS [data-csact="add"]').click();
  await page.locator('#fiqxCS [data-csact="close"]').click();
  await page.waitForFunction(()=>!document.getElementById('fiqxCS'));
  await page.waitForFunction(()=>document.querySelectorAll('#sheetOptimiserBody select[data-sheet-preset="0"] optgroup option').length===2);
  assert.equal(await page.locator('#sheetOptimiserBody select[data-sheet-preset="0"] option:checked').innerText(),'Workshop 2655 · 2655 × 1335 mm');
  assert.deepEqual(errors,[],'no page errors');
  console.log('PASS studio-optimiser-custom-sheets');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
