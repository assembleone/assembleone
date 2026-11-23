// The LIVE app (root Studio.html): Custom Sheets are saved on this computer only; nothing is sent to Firestore while the switch is off.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('content-type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true});const page=await (await browser.newContext({viewport:{width:1400,height:1000}})).newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
  await page.goto(`http://127.0.0.1:${server.address().port}/Studio.html`);
  await page.waitForFunction(()=>typeof finishDesignToCard==='function'&&window.fiqCustomSheets);
  await page.waitForTimeout(800);
  await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});
  assert.equal(await page.evaluate(()=>!!window.fiqBetaGuard),false,'this is the live-app page: no Beta guard');
  assert.ok(!/BETA/i.test(await page.evaluate(()=>document.title)),'live title, no BETA');
  const r=await page.evaluate(async()=>{
   window.__calls=[];const f=(n)=>function(){window.__calls.push(n+' '+[].slice.call(arguments).filter(a=>typeof a==='string').join('/'));return Promise.resolve({docs:[],exists:()=>false})};
   window.fiqFirestore={};window.fiqAuthFns={doc:function(){return [].slice.call(arguments).filter(a=>typeof a==='string').join('/')},collection:function(){return [].slice.call(arguments).filter(a=>typeof a==='string').join('/')},setDoc:f('setDoc'),deleteDoc:f('deleteDoc'),getDocs:f('getDocs'),getDoc:f('getDoc')};
   window.fittersiqUser={uid:'u1',companyId:'c1',role:'owner'};
   const a=window.fiqCustomSheets.add({name:'Live test',w:2800,h:2070,t:'19'});
   await window.fiqCustomSheets.sync();await new Promise(r=>setTimeout(r,400));
   return {ok:a.ok,list:window.fiqCustomSheets.list().map(x=>x.name+' '+x.w+'x'+x.h+' '+x.t),calls:window.__calls,status:window.fiqCustomSheets.status()};
  });
  assert.equal(r.ok,true);assert.deepEqual(r.list,['Live test 2800x2070 19']);
  assert.deepEqual(r.calls.filter(c=>/estimatorSheets/.test(c)),[],'nothing sent to the company cloud: '+JSON.stringify(r.calls));
  assert.match(r.status.message,/saved on this computer/i);
  assert.deepEqual(errors,[]);
  console.log('PASS production-sheets-cloud-off');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
