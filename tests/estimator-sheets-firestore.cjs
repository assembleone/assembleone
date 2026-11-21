// Custom Sheets through the REAL Studio cloud code path (Firestore calls), against an in-memory fake Firestore shared by two
// "computers". Checks: documents land in companies/{companyId}/estimatorSheets, another computer of the same company sees
// them, a different company never does, deletes propagate, permission errors keep sheets on this computer with an honest message.
const {chromium}=require('playwright');const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();
 const store={};let denyWrites=false;
 async function computer(company,uid){
  const ctx=await browser.newContext({viewport:{width:1300,height:800}});const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
  await page.exposeFunction('fsSet',(p,d)=>{if(denyWrites){const e=new Error('denied');e.code='permission-denied';throw e}store[p]=JSON.parse(JSON.stringify(d))});
  await page.exposeFunction('fsDel',p=>{delete store[p]});
  await page.exposeFunction('fsList',c=>Object.keys(store).filter(k=>k.startsWith(c+'/')&&!k.slice(c.length+1).includes('/')).map(k=>({id:k.split('/').pop(),data:store[k]})));
  await page.goto(`http://127.0.0.1:${server.address().port}/beta/Studio.html`);
  await page.waitForFunction(()=>typeof save==='function'&&window.fiqEditor&&window.fiqEditor.role==='editor'&&typeof window.fiqOpenCustomSheets==='function',null,{timeout:60000});
  await page.evaluate(([company,uid])=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
   window.fiqFirestore={};const j=(db,...s)=>({path:s.join('/')});
   window.fiqAuthFns={doc:j,collection:j,setDoc:(r,d)=>window.fsSet(r.path,d),deleteDoc:r=>window.fsDel(r.path),getDoc:async r=>({exists:()=>false}),
     getDocs:async c=>({docs:(await window.fsList(c.path)).map(x=>({id:x.id,data:()=>x.data}))})};
   window.fittersiqUser={uid,companyId:company,role:'company_owner'};},[company,uid]);
  return {page,errors};
 }
 const A1=await computer('coA','u1');
 await A1.page.evaluate(()=>window.fiqOpenCustomSheets());await A1.page.waitForSelector('#fiqxCS');
 await A1.page.fill('[data-csin="name"]','Standard Melamine');await A1.page.fill('[data-csin="w"]','2800');await A1.page.fill('[data-csin="h"]','2070');await A1.page.click('[data-csact="add"]');
 await A1.page.waitForTimeout(600);
 assert.deepEqual(Object.keys(store).map(k=>k.replace(/\/[^/]+$/,'')),['companies/coA/estimatorSheets'],'stored privately under the company');
 assert.match(await A1.page.innerText('#fiqxCSStatus'),/company cloud/i);assert.ok(/Saved in your company cloud/.test(await A1.page.innerText('#fiqxCSStatus')));
 const A2=await computer('coA','u2');await A2.page.evaluate(()=>window.fiqCustomSheets.sync());await A2.page.waitForTimeout(500);
 assert.deepEqual(await A2.page.evaluate(()=>window.fiqCustomSheets.list().map(x=>[x.name,x.w,x.h])),[['Standard Melamine',2800,2070]],'second computer of the same company sees it');
 const B=await computer('coB','u9');await B.page.evaluate(()=>window.fiqCustomSheets.sync());await B.page.waitForTimeout(500);
 assert.equal(await B.page.evaluate(()=>window.fiqCustomSheets.list().length),0,'another company sees nothing');
 // delete on computer 2 reaches computer 1
 await A2.page.evaluate(()=>window.fiqOpenCustomSheets());await A2.page.waitForSelector('#fiqxCS');await A2.page.click('[data-sheet-row] [data-csact="delete"]');await A2.page.waitForTimeout(500);
 assert.equal(Object.keys(store).length,0,'delete reached the cloud');
 await A1.page.evaluate(()=>window.fiqCustomSheets.sync());await A1.page.waitForTimeout(500);
 assert.equal(await A1.page.evaluate(()=>window.fiqCustomSheets.list().length),0,'delete reached the first computer');
 // permission refused (rule not published yet): sheet stays, message is honest
 denyWrites=true;
 await A1.page.fill('[data-csin="name"]','Large Board');await A1.page.fill('[data-csin="w"]','3050');await A1.page.fill('[data-csin="h"]','1300');await A1.page.click('[data-csact="add"]');await A1.page.waitForTimeout(600);
 assert.equal(await A1.page.evaluate(()=>window.fiqCustomSheets.list().length),1,'kept on this computer');
 assert.match(await A1.page.innerText('#fiqxCSStatus'),/denied/);
 denyWrites=false;await A1.page.evaluate(()=>window.fiqCustomSheets.sync());await A1.page.waitForTimeout(600);
 assert.equal(Object.keys(store).length,1,'uploaded on the next sync once allowed');
 // Test button
 await A1.page.click('[data-csact="check"]');await A1.page.waitForTimeout(800);
 assert.match(await A1.page.innerText('#fiqxCSCheck'),/Company: coA/);
 for(const c of [A1,A2,B])assert.deepEqual(c.errors,[],c.errors.join('|'));
 console.log('PASS estimator-sheets-firestore');await browser.close();server.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
