// Studio Sheet Optimiser: "My Custom Sheets" section. Save (name, length, width, thickness), appears in the section and in the
// sheet size box (separate from the standard sizes), Remove, validation message, and persistence after closing and reopening Studio.
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
  const ctx=await browser.newContext({viewport:{width:1400,height:1000}});
  const page=await ctx.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
  const url=`http://127.0.0.1:${server.address().port}${process.env.FIQ_PAGE||'/beta/Studio.html'}`;
  async function open(seed){
   await page.goto(url);
   await page.waitForFunction(()=>typeof finishDesignToCard==='function'&&window.fiqCustomSheets);
   await page.waitForTimeout(800);
   await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});
   if(seed)await page.evaluate(()=>{
    const parts=[{id:'a',code:'P-001',name:'Side',length:765,width:467,thickness:19,qty:3,material:'Oak melamine',edgeLong:0,edgeShort:0,status:'ready',x:20,y:30,copies:[]}];
    parts.forEach(p=>p.reviewSignature=window.panelReviewSignature(p));
    state.projects.push({id:'p1',name:'Job',customer:'X',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'c1',roomId:'r1',name:'Kitchen',parts}],jobLog:[],updatedAt:Date.now()});
    switchToProject('p1','c1');renderAll();save();
   });
   await page.evaluate(()=>{switchToProject('p1','c1');renderAll();show('cutting')});
   await page.locator('#sheetOptimiserToggleBtn').click();
   await page.locator('#sheetOptimiserBody .fiq-my-sheets').waitFor();
  }
  await open(true);
  const S=page.locator('#sheetOptimiserBody .fiq-my-sheets');
  assert.match(await S.innerText(),/No custom sheets saved yet/);
  // validation: nothing typed
  await S.locator('[data-mysheet-save]').click();
  assert.match(await S.locator('[data-mysheet-error]').innerText(),/Give the sheet a name/);
  // save one
  await S.locator('[data-mysheet-in="name"]').fill('Supplier oak');
  await S.locator('[data-mysheet-in="w"]').fill('3050');
  await S.locator('[data-mysheet-in="h"]').fill('1335');
  await S.locator('[data-mysheet-in="t"]').fill('19');
  await S.locator('[data-mysheet-save]').click();
  await page.waitForFunction(()=>/Supplier oak/.test(document.querySelector('#sheetOptimiserBody .fiq-my-sheets').innerText));
  assert.match(await S.innerText(),/Supplier oak\s+3050\s+1335\s+19/);
  assert.equal(await S.locator('[data-mysheet-in="name"]').inputValue(),'','form is cleared after saving');
  // the same section is wherever sheet sizes are chosen (Panel Check 'Sheet count' too), not only on the Supplier screen
  assert.ok(await page.locator('#estimatedMaterialsBody .fiq-my-sheets').count()>=1,'also in the Panel Check sheet count');
  assert.match(await page.locator('#estimatedMaterialsBody .fiq-my-sheets').first().innerText(),/Supplier oak/);
  // separate from the standard sizes: it sits in its own group of the sheet size box
  const sel=page.locator('#sheetOptimiserBody select[data-sheet-preset="0"]');
  assert.equal(await sel.locator('optgroup[label="My saved sheets"] option').count(),1);
  assert.equal(await sel.locator('optgroup option').first().innerText(),'Supplier oak · 3050 × 1335 mm · 19 mm thick');
  await sel.selectOption({label:'Supplier oak · 3050 × 1335 mm · 19 mm thick'});
  await page.waitForFunction(()=>/3050 × 1335/.test(document.getElementById('sheetOptimiserBody').innerText));
  // duplicate name refused
  await S.locator('[data-mysheet-in="name"]').fill('supplier OAK');await S.locator('[data-mysheet-in="w"]').fill('2800');await S.locator('[data-mysheet-in="h"]').fill('2070');
  await S.locator('[data-mysheet-save]').click();
  assert.match(await S.locator('[data-mysheet-error]').innerText(),/already exists/);
  // "Save this size…" copies the typed size into the form
  await page.locator('#sheetOptimiserBody select[data-sheet-preset="0"]').selectOption('custom');
  await page.locator('#sheetOptimiserBody [data-sheet-w="0"]').fill('2500');await page.locator('#sheetOptimiserBody [data-sheet-w="0"]').press('Tab');await page.waitForTimeout(300);
  await page.locator('#sheetOptimiserBody [data-sheet-save="0"]').click();
  assert.equal(await S.locator('[data-mysheet-in="w"]').inputValue(),'2500');
  assert.equal(await S.locator('[data-mysheet-in="t"]').inputValue(),'19');
  // persistence: close Studio (reload) and open the Optimiser again
  await page.waitForTimeout(800);
  await open(false);
  assert.match(await page.locator('#sheetOptimiserBody .fiq-my-sheets').innerText(),/Supplier oak\s+3050\s+1335\s+19/,'still there after reopening');
  // Remove
  await page.locator('#sheetOptimiserBody .fiq-my-sheets [data-mysheet-remove]').click();
  await page.waitForFunction(()=>/No custom sheets saved yet/.test(document.querySelector('#sheetOptimiserBody .fiq-my-sheets').innerText));
  assert.equal(await page.locator('#sheetOptimiserBody select[data-sheet-preset="0"] optgroup').count(),0);
  await page.waitForTimeout(800);await open(false);
  assert.match(await page.locator('#sheetOptimiserBody .fiq-my-sheets').innerText(),/No custom sheets saved yet/,'removal also persists');
  assert.deepEqual(errors,[],'no page errors');
  console.log('PASS studio-optimiser-custom-sheets');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
