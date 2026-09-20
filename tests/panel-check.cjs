const fs=require('node:fs'),assert=require('node:assert/strict'),http=require('node:http');
const {chromium}=require('playwright');
const source=fs.readFileSync('Mobile-Core.html','utf8');
function section(start,end){const a=source.indexOf(start),b=source.indexOf(end,a+start.length);assert(a>=0&&b>a,start);return source.slice(a,b)}
const code=[
 section('function save(){','function parsePanelHash('),
 section('function allProjectParts(', '// Build 2 (§E) -- extended for per-room dispatch: the multi-card'),
 section('function markCurrentPanelScanned(){','// Build 2 (§E) -- extended for per-room dispatch: "combined"'),
 section('const QR_DEDUP_WINDOW_MS=', '// Short Web Audio tones'),
 section('let lastPanelCheckHit=', 'function renderPanelCheckResult('),
 section('const progressSyncDebounce=', '// mobileInboxPackets/'),
 section('function mergePanelStatus(', 'function crc32(')
].join('\n');
(async()=>{
 const server=http.createServer((req,res)=>res.end('<!doctype html><div id="scanResult"></div>'));
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch();const page=await browser.newPage();
 await page.goto('http://127.0.0.1:'+server.address().port);
 async function install(){
 await page.evaluate(()=>{
  window.KEY='assembleone_mobile_v2';window.state=JSON.parse(localStorage.getItem(KEY)||'null')||{projects:[{id:'job',rooms:[],cabinets:[{id:'cab',parts:Array.from({length:9},(_,i)=>({id:String(i),qty:1,scannedQty:0}))}]}],currentProject:'job',currentPart:'0'};
  window.project=()=>state.projects.find(p=>p.id===state.currentProject);window.cabinet=()=>project().cabinets[0];window.part=()=>cabinet().parts.find(p=>p.id===state.currentPart);
  window.externalizeProjectPhotos=()=>{};window.pendingPhotoWrites=[];window.ensureExtras=p=>p;window.currentActorFitterId=()=> 'fitter';window.$=s=>document.querySelector(s);window.t=s=>s;
  window.renderScanDashboard=()=>{};window.renderPanelCheckResult=()=>{};window.scanLoop=()=>{};window.playScanSuccessFeedback=()=>{};window.playScanErrorFeedback=()=>{};
  window.openScannedText=raw=>{state.currentPart=raw;handlePanelCheckScan();return true};
  window.now=10000;Date.now=()=>now;window.timers=new Map();window.timerId=0;window.setTimeout=(fn,delay)=>{const id=++timerId;timers.set(id,{fn,delay});return id};window.clearTimeout=id=>timers.delete(id);window.sent=[];window.exportJob=id=>sent.push(id);
 });
 await page.addScriptTag({content:code});
 // Load the same scan patch used by Mobile.html; it must leave counting to the core.
 await page.addScriptTag({content:fs.readFileSync('mobile-build86-scan-fix.js','utf8')});
 }
 await install();
 await page.evaluate(()=>{for(let i=0;i<9;i++)handleDetectedQrText(String(i))});
 assert.equal(await page.evaluate(()=>scanTotals().scanned),9);
 await page.evaluate(()=>{for(let i=0;i<9;i++)handleDetectedQrText(String(i))});
 assert.equal(await page.evaluate(()=>scanTotals().scanned),9,'Rescanning nine panels does not inflate count');
 await page.reload();await install();
 assert.equal(await page.evaluate(()=>scanTotals().scanned),9,'Real localStorage survives page reload');
 await page.evaluate(()=>{const stale=structuredClone(project());stale.cabinets[0].parts.forEach(p=>p.scannedQty=0);mergeStudioProject(stale);save()});
 assert.equal(await page.evaluate(()=>scanTotals().scanned),9,'Studio resend cannot lower checked counts');
 await page.evaluate(()=>{cabinet().parts.push({id:'multi',qty:4,scannedQty:0});handleDetectedQrText('multi');for(let i=0;i<100;i++){now+=150;handleDetectedQrText('multi')}});
 assert.equal(await page.evaluate(()=>part().scannedQty),1,'Holding one label for 15 seconds counts one piece');
 await page.evaluate(()=>{now+=3000;handleDetectedQrText('multi')});
 assert.equal(await page.evaluate(()=>part().scannedQty),2,'Same shared label after quiet window can count the next piece');
 await page.evaluate(()=>markCurrentPanelScanned());
 assert.equal(await page.evaluate(()=>part().scannedQty),2,'Find Panel lookup does not change Panel Check count');
 await page.evaluate(()=>{timers.clear();syncProgressSoon('job');syncProgressSoon('other');syncProgressSoon('job');for(const {fn,delay} of [...timers.values()])if(delay===1500)fn()});
 assert.deepEqual((await page.evaluate(()=>sent)).sort(),['job','other'],'Each scanned job syncs once after its own burst');
 console.log('PASS: nine panels, repeated scans, browser reload, stale Studio resend, held QR, shared quantity, Find Panel patch and separate job syncs.');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
