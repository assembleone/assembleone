// A single Studio tab whose browser storage service answers slowly (a lot of saved data)
// must become the editor, load once, and finish the account check. Lock replies are
// delayed by 3.5 s. Previously a
// 2.5 s clock made such a tab read-only and its waiter reloaded it in an endless loop, so
// "Checking your account..." never finished. Signed-in account via the stand-in Firebase
// (tests/helpers/fake-firebase.cjs) locally; with STUDIO_URL (live) the real sign-in page.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {useFakeFirebase}=require('./helpers/fake-firebase.cjs');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:1366,height:900}});
 const live=!!process.env.STUDIO_URL;
 if(!live){await ctx.route(u=>{const x=String(u);return !(x.startsWith('http://127.0.0.1')||x.startsWith('https://www.gstatic.com/firebasejs/'))},r=>r.abort());await useFakeFirebase(ctx)}
 // The browser's storage service answers slowly (seen in Mads's browser: ~3 s to list
 // databases): every lock reply is delayed by 3.5 s, as happens when the storage service
 // is busy with a lot of saved data.
 await ctx.addInitScript(()=>{if(!navigator.locks)return;const real=navigator.locks.request.bind(navigator.locks);
  navigator.locks.request=function(name,opts,cb){const args=arguments;return new Promise((res,rej)=>setTimeout(()=>{real.apply(null,args).then(res,rej)},3500))}});
 const page=await ctx.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let loads=0;page.on('load',()=>loads++);
 await page.goto(process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}/Studio.html`);
 await page.waitForTimeout(15000);
 const st=await page.evaluate(()=>({role:window.fiqEditor&&window.fiqEditor.role,gate:getComputedStyle(document.getElementById('fiqAuthGate')).display,signin:!document.getElementById('fiqStateSignIn').hidden,banner:!!document.getElementById('fiqReadonlyBanner')}));
 assert.equal(loads,1,'the page loaded once (no reload loop); loads='+loads);
 assert.equal(st.role,'editor','a slow single tab is the editor');
 assert.equal(st.banner,false,'no read-only bar');
 if(live)assert.equal(st.signin,true,'account check finished (sign-in page shown)');
 else assert.equal(st.gate,'none','account check finished and Studio opened');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true,loads,...st}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
