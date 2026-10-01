// Stage 2.3a: which Firebase project each page really starts with.
//  - normal Studio and Mobile (root loaders) and the published Beta loaders (taken from
//    origin/main, serving this branch's cores the way a Beta publish would): Production
//    settings exactly as before, Beta storage prefix "fiqbeta:";
//  - the new staging pages: fittersiq-staging only, storage prefix "fiqstaging:", and no
//    request of any kind to the Production project;
//  - a staging page refuses a core that cannot take the staging settings (the normal
//    site's Production core), and stops itself if Firebase reports another project.
// Only the Firebase library (www.gstatic.com) may load; every other connection is blocked,
// so no page reaches any Firebase project during this test.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const git=p=>{try{return execSync('git show origin/main:'+p,{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024})}catch(e){return null}};
// Virtual files for this test only (nothing is written to the repo).
const virtual={
 '/beta/Studio.html':git('beta/Studio.html'),'/beta/Mobile.html':git('beta/Mobile.html'),
 '/beta/Studio-Recovery.html':fs.readFileSync(path.join(root,'Studio-Recovery.html'),'utf8'),
 '/beta/Mobile-Core.html':fs.readFileSync(path.join(root,'Mobile-Core.html'),'utf8'),
 '/prodcore/Studio-Recovery.html':git('Studio-Recovery.html'),// the normal site's Production core
};
['studio-patch.js','mobile-build83-cleanup.js','mobile-build86-scan-fix.js','mobile-build88-jobs-cleanup.js'].forEach(f=>{virtual['/beta/'+f]=fs.readFileSync(path.join(root,f),'utf8')});
virtual['/prodcore/Studio.html']=fs.readFileSync(path.join(root,'staging','Studio.html'),'utf8');// staging loader next to a Production core
virtual['/wrongproject/Studio.html']=fs.readFileSync(path.join(root,'staging','Studio.html'),'utf8').replace('projectId:"fittersiq-staging"','projectId:"assembleone-fabac"');
(async()=>{
 if(!virtual['/beta/Studio.html']||!virtual['/prodcore/Studio-Recovery.html'])throw new Error('origin/main not available for the Beta / Production comparison');
 const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);
  if(virtual[u]!=null){res.setHeader('Content-Type',types[path.extname(u)]||'text/plain');return res.end(virtual[u])}
  const f=path.join(root,u);if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}
  if(req.method==='HEAD'){res.statusCode=200;return res.end()}
  res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({headless:true});let failed=0;
 const check=async(name,fn)=>{try{await fn();console.log('ok    '+name)}catch(e){failed++;console.log('FAIL  '+name+'\n      '+String(e.message).split('\n').slice(0,6).join('\n      '))}};
 async function open(pathname,wait){
  const ctx=await browser.newContext();const page=await ctx.newPage();const requests=[];const errors=[];
  page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.route(u=>{const s=String(u);return !s.startsWith(base)&&!s.startsWith('https://www.gstatic.com/firebasejs/')},r=>r.abort());
  await page.goto(base+pathname);
  if(wait!==false)await page.waitForFunction(()=>window.fiqFirestore&&window.fiqFirestore.app,null,{timeout:30000});
  await page.waitForTimeout(1200);
  const info=await page.evaluate(()=>{let rtdb=null;try{rtdb=(0,eval)('typeof ASSEMBLEONE_FIREBASE_URL!=="undefined"?ASSEMBLEONE_FIREBASE_URL:null')}catch(e){}
   const o=window.fiqFirestore&&window.fiqFirestore.app&&window.fiqFirestore.app.options||{};
   const keys=[];for(let i=0;i<localStorage.length;i++)keys.push(Storage.prototype.key.call(localStorage,i));
   return {projectId:o.projectId||null,databaseURL:o.databaseURL||null,storageBucket:o.storageBucket||null,rtdb,keys,text:document.body?document.body.innerText.slice(0,300):''}});
  const dbs=await page.evaluate(async()=>(await indexedDB.databases()).map(d=>d.name));
  await ctx.close();
  return {...info,dbs,requests,errors};
 }
 const prodRequests=r=>r.requests.filter(u=>/assembleone-fabac/i.test(u));
 await check('Normal Studio: Production settings exactly as before, no prefix',async()=>{
  const r=await open('/Studio.html');assert.deepEqual([r.projectId,r.databaseURL,r.storageBucket],['assembleone-fabac','https://assembleone-fabac-default-rtdb.firebaseio.com','assembleone-fabac.firebasestorage.app']);
  assert.ok(!r.keys.some(k=>/^fiq(beta|staging):/.test(k)),'normal keys only');
 });
 await check('Normal Mobile: Production settings exactly as before (incl. old database address)',async()=>{
  const r=await open('/Mobile.html');assert.deepEqual([r.projectId,r.rtdb],['assembleone-fabac','https://assembleone-fabac-default-rtdb.firebaseio.com']);
 });
 await check('Beta Studio (published loader, this branch core): Production settings, "fiqbeta:" storage',async()=>{
  const r=await open('/beta/Studio.html');assert.equal(r.projectId,'assembleone-fabac');assert.ok(r.keys.length&&r.keys.every(k=>k.indexOf('fiqbeta:')===0),r.keys.join(','));
 });
 await check('Beta Mobile (published loader, this branch core): Production settings, "fiqbeta:" storage',async()=>{
  const r=await open('/beta/Mobile.html');assert.deepEqual([r.projectId,r.rtdb],['assembleone-fabac','https://assembleone-fabac-default-rtdb.firebaseio.com']);assert.ok(r.keys.every(k=>k.indexOf('fiqbeta:')===0));
 });
 await check('Staging Studio: fittersiq-staging only, "fiqstaging:" storage, no request to Production',async()=>{
  const r=await open('/staging/Studio.html');
  assert.deepEqual([r.projectId,r.databaseURL,r.storageBucket],['fittersiq-staging','https://fittersiq-staging-default-rtdb.europe-west1.firebasedatabase.app','fittersiq-staging.firebasestorage.app']);
  assert.ok(r.keys.length&&r.keys.every(k=>k.indexOf('fiqstaging:')===0),r.keys.join(','));
  assert.ok(r.dbs.length&&r.dbs.every(n=>n.indexOf('fiqstaging:')===0||n==='firebase-heartbeat-database'||n==='firebaseLocalStorageDb'),r.dbs.join(','));
  assert.deepEqual(prodRequests(r),[],'no Production request');
  assert.match(r.text,/STAGING TEST COPY/);
 });
 await check('Staging Mobile: fittersiq-staging only (incl. old database address), "fiqstaging:" storage, no request to Production',async()=>{
  const r=await open('/staging/Mobile.html');
  assert.deepEqual([r.projectId,r.rtdb],['fittersiq-staging','https://fittersiq-staging-default-rtdb.europe-west1.firebasedatabase.app']);
  assert.ok(r.keys.every(k=>k.indexOf('fiqstaging:')===0),r.keys.join(','));assert.deepEqual(prodRequests(r),[]);
 });
 await check('Staging loader refuses the normal site\'s Production core (no Firebase started)',async()=>{
  const r=await open('/prodcore/Studio.html',false);
  assert.equal(r.projectId,null);assert.match(r.text,/cannot use the staging project/);assert.deepEqual(prodRequests(r),[]);
 });
 await check('Wrong-project check stops the page',async()=>{
  const r=await open('/wrongproject/Studio.html',false);assert.match(r.text,/Stopped/);
 });
 await browser.close();server.close();
 console.log('\n'+(failed?failed+' FAILED':'All staging page checks passed'));process.exit(failed?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
