// Mobile to Studio send durability: a Job Note (or any change) saved on the phone must
// reach Studio even when the first send fails, hangs, or the page reloads mid-send, and
// even when the job carries enough photos that the full packet cannot fit localStorage.
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../Mobile-Core.html'),'utf8');
function section(start,end){const a=source.indexOf(start),b=source.indexOf(end,a+start.length);assert(a>=0&&b>a,start);return source.slice(a,b)}
const code=[
 section('const PENDING_STUDIO_SYNC_KEY=','// A job\'s full export only ever grows'),
 section('function stripHeavyMediaForSync(','// One place both the Jobs list'),
 section('function studioSyncStatus(','// The one obvious manual fallback'),
 section('function pollStudioSync(','window.addEventListener("focus",pollStudioSync)')
].join('\n');
(async()=>{
 const server=http.createServer((req,res)=>res.end('<!doctype html><title>Isolated Mobile send test</title>'));
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});const page=await browser.newPage();
 await page.goto('http://127.0.0.1:'+server.address().port);
 async function install(){
  await page.evaluate(()=>{
   // Photos live in IndexedDB on the phone (idb: pointers); hydrate swaps in the real bytes.
   const photo='data:image/jpeg;base64,'+'a'.repeat(700000);
   window.KEY='mobile-state';
   window.state=JSON.parse(localStorage.getItem(KEY)||'null')||{projects:[{id:'job',name:'Kitchen job',studioOrigin:true,rooms:[{id:'room',name:'Kitchen'}],cabinets:[{id:'cab',roomId:'room',parts:[{id:'p1',qty:1}]}],jobLog:[],sitePhotos:Array.from({length:10},(_,i)=>({id:'ph'+i,data:'idb:ph'+i}))}]};
   // Like the real save, photo bytes stay in IndexedDB; only pointers go to localStorage.
   window.save=()=>{localStorage.setItem(KEY,JSON.stringify(state,(k,v)=>typeof v==='string'&&v.startsWith('data:')?'idb:photo':v));return true};
   window.hydrateAllPhotos=async s=>{s.projects.forEach(p=>(p.sitePhotos||[]).forEach(ph=>{if(String(ph.data).startsWith('idb:'))ph.data=photo}))};
   window.isStudioJob=p=>!!p.studioOrigin;window.isInstallationJob=()=>true;window.buildSiteTransferManifest=()=>null;
   window.renderAll=()=>{};window.alert=()=>{};window.t=x=>x;window.download=()=>{};window.makeZip=()=>'';
   window.receiveStudioDirect=undefined;window.checkPendingStudioReceipts=()=>{};
   window.net='offline';window.delivered=[];
   window.sendPackDirectly=pack=>{
    if(net==='offline')return Promise.reject(new Error('Failed to fetch'));
    if(net==='hang')return new Promise(()=>{});
    delivered.push(JSON.parse(JSON.stringify(pack)));return Promise.resolve({docId:'doc'+delivered.length});
   };
  });
  await page.addScriptTag({content:code});
 }
 function addNote(text){return page.evaluate(text=>{const p=state.projects[0];p.jobLog.push({id:text,text,at:Date.now(),roomId:'room'});save()},text)}
 await install();

 // 1. Offline send of a note on a job with photos. Hydrated photos in memory must not leak into saved state.
 await addNote('note-offline');
 await page.evaluate(()=>exportJob('job',true));
 await page.reload();await install();
 await page.evaluate(()=>{net='online'});
 await page.evaluate(()=>pollStudioSync());await page.evaluate(()=>new Promise(r=>setTimeout(r,50)));
 const afterOffline=await page.evaluate(()=>delivered.map(p=>p.project.jobLog.map(n=>n.id)));
 assert(afterOffline.some(log=>log.includes('note-offline')),'note saved while offline must reach Studio after reload and reconnect');

 // 2. A send that hangs (phone locked, weak signal) and then the page reloads.
 await page.evaluate(()=>{delivered.length=0;net='hang'});
 await addNote('note-hang');
 page.evaluate(()=>exportJob('job',true)).catch(()=>{});await page.evaluate(()=>new Promise(r=>setTimeout(r,50)));
 await page.reload();await install();
 await page.evaluate(()=>{net='online'});
 await page.evaluate(()=>pollStudioSync());await page.evaluate(()=>new Promise(r=>setTimeout(r,50)));
 const afterHang=await page.evaluate(()=>delivered.map(p=>p.project.jobLog.map(n=>n.id)));
 assert(afterHang.some(log=>log.includes('note-hang')),'note must be resent after an interrupted send');
 const status=await page.evaluate(()=>studioSyncStatus(state.projects[0]).label);
 assert(!/Waiting to send/.test(status)||await page.evaluate(()=>!!state.projects[0].pendingStudioReceiptDocId),'status must not claim waiting with nothing queued');

 // 3. Polling while a slow send is still in flight must not send the same job twice.
 await page.evaluate(()=>{delivered.length=0;net='offline'});
 await addNote('note-slow');
 await page.evaluate(()=>exportJob('job',true));
 await page.evaluate(()=>{let release;window.sendPackDirectly=pack=>new Promise(r=>{release=()=>{delivered.push(pack);r({docId:'slow'})}});window.releaseSlow=()=>release&&release()});
 await page.evaluate(()=>{pollStudioSync();pollStudioSync();pollStudioSync()});await page.evaluate(()=>new Promise(r=>setTimeout(r,50)));
 await page.evaluate(()=>releaseSlow());await page.evaluate(()=>new Promise(r=>setTimeout(r,50)));
 assert.equal(await page.evaluate(()=>delivered.length),1,'overlapping polls must send one packet, not one per poll');

 console.log('PASS: offline note with photos survives reload, interrupted send retries, no duplicate sends from overlapping polls.');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e.message||e);process.exitCode=1});
