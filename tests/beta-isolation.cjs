// The Mobile beta (beta/Mobile.html) shares the site address with the normal app on a phone.
// It must keep its own saved jobs, databases and sign-in, never see or clear the normal
// app's data, run the lifecycle code, load every shared file, and not be installable.
const {chromium}=require('playwright');const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png'};
(async()=>{const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port+'/assembleone';
 // Serve the repo under /assembleone like GitHub Pages does.
 server.removeAllListeners('request');server.on('request',(req,res)=>{let u=decodeURIComponent(req.url.split('?')[0]);if(!u.startsWith('/assembleone/')){res.statusCode=404;return res.end()}const f=path.join(root,u.slice('/assembleone/'.length));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 const browser=await chromium.launch();const ctx=await browser.newContext();const errors=[];const missing=[];
 async function open(url){const p=await ctx.newPage();p.on('pageerror',e=>errors.push(url+': '+e.message));p.on('response',r=>{if(r.url().includes('127.0.0.1')&&r.status()===404)missing.push(r.url())});await p.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());await p.goto(base+url);await p.waitForFunction(()=>document.readyState==='complete'&&typeof save==='function'&&typeof exportJob==='function');await p.waitForTimeout(1500);return p}
 const normal=await open('/Mobile.html');
 await normal.evaluate(()=>{const st=(0,eval)('state');st.projects.push({id:'normal1',name:'Normal job',rooms:[],cabinets:[],jobLog:[]});save()});
 const normalKey=await normal.evaluate(()=>localStorage.getItem('assembleone_mobile_v2'));assert(normalKey.includes('normal1'));
 await normal.close();
 const beta=await open('/beta/Mobile.html');
 const b=await beta.evaluate(()=>({ids:(0,eval)('state').projects.map(p=>p.id),banner:!!document.getElementById('fiqBetaBanner'),title:document.title,lifecycle:typeof checkPendingStudioReceiptsOnce==='function',syncProtocol:!!window.FittersIQSyncProtocol,i18n:typeof window.t==='function',manifest:!!document.querySelector('link[rel=manifest]')}));
 assert(!b.ids.includes('normal1'),'beta cannot see the normal app jobs');assert(b.banner,'beta banner shown');assert(b.lifecycle,'beta runs the lifecycle code');assert(b.syncProtocol,'shared sync helper loads');assert(/^BETA /.test(b.title),'title says BETA');assert(!b.manifest,'beta cannot be installed as the app');
 await beta.evaluate(async()=>{const st=(0,eval)('state');st.projects.push({id:'beta1',name:'Beta job',rooms:[],cabinets:[],jobLog:[]});save();localStorage.setItem('probe','beta');await new Promise(r=>{const q=indexedDB.open('probe-db',1);q.onsuccess=()=>{q.result.close();r()};q.onerror=r})});
 const raw=await beta.evaluate(async()=>{const keys=[];for(let i=0;i<Storage.prototype.key.call(localStorage,i)!==null&&i<500;i++)keys.push(Storage.prototype.key.call(localStorage,i));const dbs=indexedDB.databases?(await indexedDB.databases()).map(d=>d.name):[];return {keys,dbs}});
 assert(raw.keys.includes('fiqbeta:assembleone_mobile_v2'),'beta jobs stored under its own name');assert(raw.keys.includes('assembleone_mobile_v2'),'normal jobs untouched');
 assert(raw.dbs.includes('fiqbeta:probe-db')&&!raw.dbs.includes('probe-db'),'beta databases have their own names');
 await beta.evaluate(()=>localStorage.clear());
 
 await beta.close();
 const normal2=await open('/Mobile.html');
 const n=await normal2.evaluate(()=>({ids:(0,eval)('state').projects.map(p=>p.id),probe:localStorage.getItem('probe')}));
 assert(n.ids.includes('normal1')&&!n.ids.includes('beta1'),'normal app still has its own jobs only');assert.equal(n.probe,null,'beta storage invisible to the normal app');
 console.log(JSON.stringify({betaTitle:b.title,betaSawNormalJobs:b.ids.includes('normal1'),normalAfter:n.ids,dbs:raw.dbs,missingFiles:missing,errors}));
 await browser.close();server.close()})().catch(e=>{console.error(e);process.exitCode=1});
