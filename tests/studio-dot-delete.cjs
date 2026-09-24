// Studio drawing dots: deleting a panel's only dot deletes the panel from the Cutting List
// and renumbers the rest with no gaps; one dot of a repeated panel lowers its quantity.
// Numbers on the drawing and in the Cutting List match after reopening, ids (used by QR
// labels) never change, a phone resync cannot bring a deleted panel back, and a notice
// flags lists and labels made with the old numbers. Real Studio code, real mouse.
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../Studio-Recovery.html'),'utf8');
function section(a,b){const s=source.indexOf(a),e=source.indexOf(b,s+a.length);assert(s>=0&&e>s,a);return source.slice(s,e)}
const code=[
 section('function mergeJobLog(','function addJobLogEntry('),
 section('function hasMarkPosition(','function renderHeader('),
 section('function renderRooms(','const MATERIAL_LIBRARY_KEY='),
 source.match(/<script id="a89-panel-marker-fix-script">([\s\S]*?)<\/script>/)[1],
 // Real Cutting List rules: a complete panel whose Studio review stamp still matches.
 section('function isCompleteSupplierPart(','function supplierParts('),
 section('  function sig(p){','  function reviewed('),
 // Real merge of a phone update into Studio.
 section('function mergePanelStatus(','async function importMobileUpdates(')
].join('\n');
const css=[...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(x=>x[1]).join('\n');
const drawing='data:image/svg+xml;base64,'+Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#eee"/></svg>').toString('base64');
function panel(id,n,name,length,qty,x,y,copies=[]){const p={id,code:'P-00'+n,name,length,width:300,thickness:19,qty,material:'Oak',edgeLong:0,edgeShort:0,notes:'',status:'ready',x,y,copies};p.reviewSignature=[name,length,300,19,qty,'Oak',0,0,''].join('|');return p}
(async()=>{
 const server=http.createServer((req,res)=>res.end('<!doctype html><title>Isolated Studio dot test</title>'));
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1000,height:900}});
 let dialogs=[],answer=true;page.on('dialog',d=>{dialogs.push(d.message());answer?d.accept():d.dismiss()});
 await page.goto('http://127.0.0.1:'+server.address().port);
 const start=[panel('a',1,'Side',720,1,20,20),panel('b',2,'Shelf',500,2,40,40,[{x:45,y:60}]),panel('c',3,'Top',600,1,60,30),panel('d',4,'Back',700,1,80,70)];
 async function install(){
  await page.evaluate(({css,drawing,start})=>{
   document.head.insertAdjacentHTML('beforeend','<style>'+css+'</style>');
   document.body.innerHTML='<section id="screen-mark"><div id="drawingStage" style="width:800px;height:600px;overflow:auto"><div class="drawing-canvas" id="drawingCanvas"><img id="drawingImage"><iframe id="drawingPdf"></iframe><div id="drawingEmpty"></div></div></div></section><section id="screen-cutting"></section><span id="zoomValue"></span><span id="drawingName"></span><button id="deleteDrawingBtn"></button><input id="fLength">';
   window.$=s=>document.querySelector(s);window.t=x=>x;window.toasts=[];window.toast=m=>toasts.push(m);
   window.safe=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
   let n=0;window.uid=()=>'new'+(++n);window.nextCode=c=>`P-${String(c.parts.length+1).padStart(3,'0')}`;
   window.renderSiteMeasurementOverlay=()=>{};window.openSiteRoomDetails=()=>{};window.ensureCustomerForProject=()=>{};
   const saved=localStorage.getItem('studio-state');
   window.state=saved?JSON.parse(saved):{currentProject:'job',currentCabinet:'cab',currentPart:null,selectedCopy:-1,deletedProjectIds:[],projects:[{id:'job',name:'Kitchen',lastMobileSync:'2026-09-24T08:00:00Z',rooms:[],cabinets:[{id:'cab',name:'Unit',drawing,parts:start}]}]};
   window.project=()=>state.projects[0];window.cabinet=()=>project().cabinets[0];window.part=()=>cabinet().parts.find(p=>p.id===state.currentPart);
   window.save=()=>{localStorage.setItem('studio-state',JSON.stringify(state));return true};
  },{css,drawing,start});
  await page.addScriptTag({content:code+'\nwindow.renderAll=renderRooms;window.panelReviewSignature=sig;'});
  await page.evaluate(()=>new Promise(r=>{const img=$('#drawingImage');renderRooms();if(img.complete&&img.naturalWidth)r();else img.addEventListener('load',()=>{renderRooms();r()},{once:true})}));
 }
 // What the Cutting List would show: the real inclusion rules, in list order.
 const cutting=()=>page.evaluate(()=>cabinet().parts.map(p=>({id:p.id,code:p.code,name:p.name,length:p.length,qty:p.qty,listed:isCompleteSupplierPart(p)&&sig(p)===p.reviewSignature})));
 // Codes the drawing shows (each dot carries its panel code in its title).
 const drawingCodes=()=>page.evaluate(()=>[...document.querySelectorAll('#drawingCanvas .pin')].map(d=>d.dataset.id+'='+d.title.split(' ')[0]));
 async function matchCheck(label){
  const list=await cutting(),pins=await drawingCodes();
  const byId=Object.fromEntries(list.map(p=>[p.id,p.code]));
  pins.forEach(x=>{const [id,code]=x.split('=');assert.equal(code,byId[id],label+': drawing and Cutting List numbers match')});
  assert.deepEqual(list.map(p=>p.code),list.map((_,i)=>`P-${String(i+1).padStart(3,'0')}`),label+': numbers run 1..n with no gaps');
  assert(list.every(p=>p.listed),label+': every remaining panel is on the Cutting List');
 }
 async function clickPin(id,copy){const b=await page.locator(`#drawingCanvas .pin[data-id="${id}"][data-copy="${copy}"]`).boundingBox();await page.mouse.click(b.x+b.width/2,b.y+b.height/2)}
 async function canvasPoint(px,py){const b=await page.locator('#drawingCanvas').boundingBox();return {x:b.x+b.width*px/100,y:b.y+b.height*py/100}}
 await install();
 await matchCheck('start');

 // 1. Clicking a dot with a small hand wobble selects it, offers Delete dot, adds nothing.
 let b=await page.locator('#drawingCanvas .pin[data-id="a"]').boundingBox();
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2+2,b.y+b.height/2+1);await page.mouse.up();
 assert.equal((await cutting()).length,4,'clicking a dot must not create a panel');
 assert.equal(await page.locator('#fiqPinMenu [data-delete-dot]').count(),1,'dot click offers Delete dot');

 // 2. Moving a dot only changes its position.
 b=await page.locator('#drawingCanvas .pin[data-id="a"]').boundingBox();
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2+40,b.y+b.height/2,{steps:5});await page.mouse.up();
 assert.deepEqual((await cutting()).map(p=>p.code),['P-001','P-002','P-003','P-004'],'moving a dot keeps every panel');
 assert(await page.evaluate(()=>cabinet().parts[0].x>20),'moving a dot changes its position');

 // 3. Cancelling the confirmation changes nothing.
 answer=false;await clickPin('a',-1);await page.locator('#fiqPinMenu [data-delete-dot]').click();answer=true;
 assert.equal((await cutting()).length,4,'cancel keeps the panel');

 // 4. Deleting panel 1: panel and measurements gone, the rest move up with no gaps.
 await clickPin('a',-1);await page.locator('#fiqPinMenu [data-delete-dot]').click();
 let list=await cutting();
 assert.deepEqual(list.map(p=>p.id+':'+p.code),['b:P-001','c:P-002','d:P-003'],'panel 2 becomes panel 1 and so on');
 assert.deepEqual(list.map(p=>p.length),[500,600,700],'other measurements untouched');
 assert.equal(await page.evaluate(()=>cabinet().parts.reduce((n,p)=>n+Number(p.qty),0)),4,'Cutting List total pieces updated');
 await matchCheck('after delete');
 assert.match(dialogs.at(-1),/Delete panel P-001/);
 let notice=await page.locator('#screen-cutting .fiq-renumber-notice').innerText();
 assert.match(notice,/Deleted: P-001/);assert.match(notice,/P-002 is now P-001/);assert.match(notice,/P-004 is now P-003/);assert.match(notice,/send this job to Mobile again/);
 assert.equal(await page.locator('#screen-mark .fiq-renumber-notice').count(),1,'notice also on the drawing screen');

 // 5. Reopening the job keeps the numbers, the match and the notice.
 await page.reload();await install();
 await matchCheck('after reopen');
 assert.deepEqual((await cutting()).map(p=>p.id+':'+p.code),['b:P-001','c:P-002','d:P-003']);
 assert.equal(await page.locator('#screen-cutting .fiq-renumber-notice').count(),1,'notice survives reopening');

 // 6. A phone that still has the deleted panel cannot bring it back on its next sync.
 await page.evaluate(()=>{const phone=JSON.parse(JSON.stringify(project()));phone.cabinets[0].parts.unshift({id:'a',code:'P-001',name:'Side',length:720,qty:1,status:'installed'});phone._packetExportedAt=new Date().toISOString();mergeMobileProject(phone);renderAll()});
 assert.deepEqual((await cutting()).map(p=>p.id),['b','c','d'],'deleted panel stays deleted after a phone sync');

 // 7. One dot of a repeated panel: quantity down by one, nothing renumbered, still on the list.
 await clickPin('b',0);await page.locator('#fiqPinMenu [data-delete-dot]').click();
 list=await cutting();
 assert.match(dialogs.at(-1),/quantity goes from 2 to 1/);
 assert.deepEqual(list.map(p=>p.code+':'+p.qty),['P-001:1','P-002:1','P-003:1']);
 await matchCheck('after removing one repeated dot');

 // 8. Deleting a middle panel: the ones after it move up.
 await clickPin('c',-1);await page.locator('#fiqPinMenu [data-delete-dot]').click();
 assert.deepEqual((await cutting()).map(p=>p.id+':'+p.code),['b:P-001','d:P-002']);
 await matchCheck('after deleting a middle panel');
 notice=await page.locator('#screen-cutting .fiq-renumber-notice').innerText();
 assert.match(notice,/Deleted: P-001, P-003/,'notice lists every deleted panel by the number it was printed with');
 assert.match(notice,/P-004 is now P-002/,'old printed number to new number');

 // 9. A normal click on the empty drawing still adds the next panel number.
 await page.evaluate(()=>{state.currentPart='d'});
 let pt=await canvasPoint(10,90);await page.mouse.click(pt.x,pt.y);
 assert.deepEqual((await cutting()).map(p=>p.code),['P-001','P-002','P-003']);

 // 10. Confirming the notice clears it, also after reopening.
 await page.locator('#screen-cutting .fiq-renumber-notice [data-renumber-done]').click();
 assert.equal(await page.locator('.fiq-renumber-notice').count(),0);
 await page.reload();await install();
 assert.equal(await page.locator('.fiq-renumber-notice').count(),0,'confirmed notice stays gone');
 console.log('PASS: dot click adds nothing, move keeps panel, cancel, delete panel 1 and a middle panel with renumbering and no gaps, totals, drawing matches Cutting List after reopening, ids kept, phone sync cannot restore, repeated dot lowers quantity, notice for old lists and labels.');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
