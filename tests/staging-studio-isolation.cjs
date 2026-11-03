// The Studio staging copy (staging/Studio.html) shares the site address with the normal Studio
// in a browser. It must keep its own saved jobs and databases (fiqstaging: prefix), never see or
// clear the normal Studio's data, and only ever talk to the separate fittersiq-staging Firebase
// project, never the Production project (assembleone-fabac). All outside requests are blocked
// and recorded, so nothing reaches any real service while the test runs.
const {chromium}=require('playwright');const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.css':'text/css','.svg':'image/svg+xml'};
(async()=>{
 const server=http.createServer((req,res)=>{let u=decodeURIComponent(req.url.split('?')[0]);if(!u.startsWith('/assembleone/')){res.statusCode=404;return res.end()}const f=path.join(root,u.slice('/assembleone/'.length));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port+'/assembleone';
 const browser=await chromium.launch();const ctx=await browser.newContext();const errors=[];const outside={};
 await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>{const u=r.request().url();(outside[r.request().frame().page().url().includes('/staging/')?'staging':'normal']??=[]).push(u);r.abort()});
 async function open(url){const p=await ctx.newPage();p.on('pageerror',e=>errors.push(url+': '+e.message));await p.goto(base+url);await p.waitForFunction(()=>document.readyState==='complete'&&typeof save==='function'&&typeof window.fiqOpenDataSafety==='function');await p.waitForTimeout(2500);return p}
 const normal=await open('/Studio.html');
 await normal.evaluate(()=>{const st=(0,eval)('state');st.projects.push({id:'normal1',name:'Normal job',rooms:[],cabinets:[],jobLog:[]});save();localStorage.setItem('probe','normal')});
 await normal.close();
 const staging=await open('/staging/Studio.html');
 const s=await staging.evaluate(()=>({ids:(0,eval)('state').projects.map(p=>p.id),title:document.title,probe:localStorage.getItem('probe'),cfg:window.FIQ_FIREBASE_CONFIG&&window.FIQ_FIREBASE_CONFIG.projectId}));
 assert(!s.ids.includes('normal1'),'staging cannot see the normal Studio jobs');
 assert.equal(s.probe,null,'staging cannot read normal storage');
 assert(/STAGING/.test(s.title),'title says STAGING');
 assert.equal(s.cfg,'fittersiq-staging','staging is configured for the fittersiq-staging Firebase project');
 await staging.evaluate(async()=>{const st=(0,eval)('state');st.projects.push({id:'staging1',name:'Staging job',rooms:[],cabinets:[],jobLog:[]});save();localStorage.setItem('probe','staging');await new Promise(r=>{const q=indexedDB.open('probe-db',1);q.onsuccess=()=>{q.result.close();r()};q.onerror=r})});
 const raw=await staging.evaluate(async()=>{const keys=[];for(let i=0;Storage.prototype.key.call(localStorage,i)!==null&&i<500;i++)keys.push(Storage.prototype.key.call(localStorage,i));const dbs=indexedDB.databases?(await indexedDB.databases()).map(d=>d.name):[];return {keys,dbs}});
 assert(raw.keys.includes('fiqstaging:probe')&&raw.keys.includes('probe'),'staging data stored under its own names, normal key still separate');
 assert(raw.keys.some(k=>k.startsWith('fiqstaging:buildSOS_v12')),'staging jobs saved under fiqstaging:buildSOS_v12');
 assert(raw.dbs.includes('fiqstaging:probe-db')&&!raw.dbs.includes('probe-db'),'staging databases have their own names');
 await staging.evaluate(()=>localStorage.clear());
 await staging.close();
 const normal2=await open('/Studio.html');
 const n=await normal2.evaluate(()=>({ids:(0,eval)('state').projects.map(p=>p.id),probe:localStorage.getItem('probe')}));
 assert(n.ids.includes('normal1')&&!n.ids.includes('staging1'),'normal Studio still has its own jobs only');
 assert.equal(n.probe,'normal','staging clear left normal storage alone');
 const stagingHosts=[...new Set((outside.staging||[]).map(u=>new URL(u).host))];
 const reachedProduction=(outside.staging||[]).filter(u=>/assembleone-fabac/.test(u));
 assert.deepEqual(reachedProduction,[],'staging never attempted to contact the Production Firebase project');
 console.log(JSON.stringify({stagingTitle:s.title,stagingProject:s.cfg,stagingSawNormalJobs:s.ids.includes('normal1'),normalAfter:n.ids,stagingDbs:raw.dbs,stagingOutsideHosts:stagingHosts,productionRequestsFromStaging:reachedProduction.length,errors:errors.length}));
 await browser.close();server.close()})().catch(e=>{console.error(e);process.exitCode=1});
