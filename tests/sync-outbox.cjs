const {chromium}=require('playwright');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Isolated sync test</title>')});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{browser=await chromium.launch({headless:true})}catch(error){server.close();throw error}
 try{
 const page=await browser.newPage();
 await page.goto('http://127.0.0.1:'+server.address().port);
 async function install(){
 await page.evaluate(()=>{
  window.state={projects:[{id:'job',rooms:[]}],deletedProjectIds:[]};
  window.fittersiqUser={companyId:'one',uid:'owner'};
  window.sent=[];window.fail=true;
  window.saveCount=0;window.renderCount=0;
  window.save=()=>{saveCount++;return true};window.renderAll=()=>{renderCount++};
  window.sendPackToPhoneDirectly=async pack=>{if(window.fail)throw new Error('offline');sent.push(pack);return{cloudSent:true,cloudDocId:pack.syncId}};
  // Drive retries explicitly so the assertions do not depend on timer scheduling.
  window.setInterval=()=>0;window.setTimeout=()=>0;
 });
 await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'../studio-sync-hardening.js'),'utf8')});
 }
 await install();
 await page.evaluate(async()=>{for(let i=0;i<60;i++)await retryPendingMobileSends()});
 assert.deepEqual(await page.evaluate(()=>[saveCount,renderCount]),[0,0],'idle outbox must not save or redraw the app');
 const error=await page.evaluate(async()=>{try{await sendPackToPhoneDirectly({project:{id:'job',rooms:[],photos:['data:image/jpeg;base64,'+'a'.repeat(2000000)]},exportedAt:new Date().toISOString()})}catch(e){return e.message}});
 assert(error.includes('saved'),'offline send must report a durable queued update');
 await page.evaluate(()=>retryPendingMobileSends());
 assert.deepEqual(await page.evaluate(()=>[saveCount,renderCount]),[0,0],'failed retry must not save or redraw the app');
 await page.reload();await install();
 await page.evaluate(async()=>{fittersiqUser.companyId='two';fail=false;await retryPendingMobileSends()});
 assert.equal(await page.evaluate(()=>sent.length),0,'another company cannot send the queued job');
 await page.evaluate(async()=>{fittersiqUser.companyId='one';await retryPendingMobileSends()});
 assert.equal(await page.evaluate(()=>sent.length),1,'reload preserves pending send including large photo');
 assert.equal(await page.evaluate(()=>sent[0].project.photos[0].length),2000023);
 await page.evaluate(()=>retryPendingMobileSends());
 assert.equal(await page.evaluate(()=>sent.length),1,'successful send leaves the retry queue');
 await page.evaluate(async()=>{fail=true;try{await sendPackToPhoneDirectly({project:{id:'deleted',rooms:[]},exportedAt:new Date().toISOString()})}catch{}state.deletedProjectIds=['deleted'];fail=false;await retryPendingMobileSends()});
 assert.equal(await page.evaluate(()=>sent.length),1,'deleted job is not resent by the outbox');
 console.log('PASS: real browser IndexedDB outbox, offline failure, reload, large photo preservation, company isolation, retry cleanup and deletion.');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
