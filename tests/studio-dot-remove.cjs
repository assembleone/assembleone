// Studio drawing dots: clicking a dot selects it without placing another dot, Remove dot
// clears only the position (panel stays in the Cutting List), the next drawing click puts
// it back, and the removal survives a reload. Uses the real Studio code with a real mouse.
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../Studio-Recovery.html'),'utf8');
function section(a,b){const s=source.indexOf(a),e=source.indexOf(b,s+a.length);assert(s>=0&&e>s,a);return source.slice(s,e)}
const code=[
 section('function hasMarkPosition(','function renderHeader('),
 section('function renderRooms(','const MATERIAL_LIBRARY_KEY='),
 source.match(/<script id="a89-panel-marker-fix-script">([\s\S]*?)<\/script>/)[1],
 // Real Cutting List rules: a complete panel whose Studio review stamp still matches.
 section('function isCompleteSupplierPart(','function supplierParts('),
 section('  function sig(p){','  function reviewed(')
].join('\n');
const css=[...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(x=>x[1]).join('\n');
const drawing='data:image/svg+xml;base64,'+Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#eee"/></svg>').toString('base64');
(async()=>{
 const server=http.createServer((req,res)=>res.end('<!doctype html><title>Isolated Studio dot test</title>'));
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1000,height:800}});
 await page.goto('http://127.0.0.1:'+server.address().port);
 async function install(){
  await page.evaluate(({css,drawing})=>{
   document.head.insertAdjacentHTML('beforeend','<style>'+css+'</style>');
   document.body.innerHTML='<div id="drawingStage" style="width:800px;height:600px;overflow:auto"><div class="drawing-canvas" id="drawingCanvas"><img id="drawingImage"><iframe id="drawingPdf"></iframe><div id="drawingEmpty"></div></div></div><span id="zoomValue"></span><span id="drawingName"></span><button id="deleteDrawingBtn"></button><input id="fLength">';
   window.$=s=>document.querySelector(s);window.t=x=>x;window.toasts=[];window.toast=m=>toasts.push(m);
   let n=0;window.uid=()=>'new'+(++n);window.nextCode=c=>'P-00'+(c.parts.length+1);
   window.renderSiteMeasurementOverlay=()=>{};window.openSiteRoomDetails=()=>{};
   const saved=localStorage.getItem('studio-state');
   window.state=saved?JSON.parse(saved):{currentProject:'job',currentCabinet:'cab',currentPart:null,selectedCopy:-1,projects:[{id:'job',name:'Kitchen',rooms:[],cabinets:[{id:'cab',name:'Unit',drawing,parts:[
    {id:'a',code:'P-001',name:'Side',length:720,width:560,thickness:19,qty:1,material:'Oak',edgeLong:1,edgeShort:2,notes:'Grain up',reviewSignature:'Side|720|560|19|1|Oak|1|2|Grain up',status:'ready',x:25,y:25,copies:[]},
    {id:'b',code:'P-002',name:'Shelf',length:500,width:300,thickness:19,qty:2,material:'Oak',edgeLong:0,edgeShort:0,notes:'',reviewSignature:'Shelf|500|300|19|2|Oak|0|0|',status:'ready',x:75,y:75,copies:[{x:60,y:40}]}]}]}]};
   window.project=()=>state.projects[0];window.cabinet=()=>project().cabinets[0];window.part=()=>cabinet().parts.find(p=>p.id===state.currentPart);
   window.saves=0;window.save=()=>{saves++;localStorage.setItem('studio-state',JSON.stringify(state));return true};
  },{css,drawing});
  await page.addScriptTag({content:code+'\nwindow.renderAll=renderRooms;'});
  await page.evaluate(()=>new Promise(r=>{const img=$('#drawingImage');renderRooms();if(img.complete&&img.naturalWidth)r();else img.addEventListener('load',()=>{renderRooms();r()},{once:true})}));
 }
 const parts=()=>page.evaluate(()=>cabinet().parts.map(p=>({id:p.id,x:p.x,y:p.y,copies:p.copies.length,unplaced:p.unplacedCopies||0,qty:p.qty,length:p.length})));
 // Every panel field except where its dots sit, plus whether the real Cutting List rules include it.
 const details=()=>page.evaluate(()=>cabinet().parts.slice(0,2).map(p=>{const {x,y,copies,unplacedCopies,...rest}=p;return {...rest,inCuttingList:isCompleteSupplierPart(p)&&sig(p)===p.reviewSignature}}));
 async function pinBox(id,copy){return page.locator(`#drawingCanvas .pin[data-id="${id}"][data-copy="${copy}"]`).boundingBox()}
 async function canvasPoint(px,py){const b=await page.locator('#drawingCanvas').boundingBox();return {x:b.x+b.width*px/100,y:b.y+b.height*py/100}}
 await install();
 assert.equal(await page.locator('#drawingCanvas .pin').count(),3);
 const original=await details();
 assert(original.every(p=>p.inCuttingList),'both panels start in the Cutting List');

 // 1. Clicking a dot with a small hand wobble selects it and must not add a panel underneath.
 let b=await pinBox('a',-1);
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2+2,b.y+b.height/2+1);await page.mouse.up();
 assert.equal((await parts()).length,2,'clicking a dot must not create a panel');
 assert.equal(await page.evaluate(()=>state.currentPart),'a');
 assert.equal(await page.locator('#fiqPinMenu [data-remove-dot]').count(),1,'dot click offers Remove dot');

 // 2. A real drag still moves the dot and does not create a panel.
 b=await pinBox('a',-1);
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2+40,b.y+b.height/2,{steps:5});await page.mouse.up();
 let now=await parts();assert.equal(now.length,2,'drag must not create a panel');assert(now[0].x>25,'drag moves the dot');

 // 3. Remove dot keeps the panel, its measurements and quantity; only the position goes.
 b=await pinBox('a',-1);await page.mouse.click(b.x+b.width/2,b.y+b.height/2);
 await page.locator('#fiqPinMenu [data-remove-dot]').click();
 now=await parts();assert.equal(now.length,2,'Remove dot must not create or delete a panel');
 assert.equal(now[0].x,null);assert.equal(now[0].y,null);assert.equal(now[0].length,720);assert.equal(now[0].qty,1);
 assert.equal(await page.locator('#drawingCanvas .pin[data-id="a"]').count(),0,'removed dot is gone from the drawing');
 assert.equal(await page.locator('#fiqPinMenu').count(),0);
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('studio-state')).projects[0].cabinets[0].parts[0].x),null,'removal is saved');
 assert.deepEqual(await details(),original,'measurements, quantity and Cutting List unchanged after Remove dot');

 // 4. Removal survives reopening the job.
 await page.reload();await install();
 assert.equal(await page.locator('#drawingCanvas .pin[data-id="a"]').count(),0,'removed dot stays removed after reload');
 assert.equal((await parts()).length,2);
 assert.deepEqual(await details(),original,'unchanged after reopening');

 // 5. With that panel selected, the next drawing click places its dot instead of a new panel.
 await page.evaluate(()=>{state.currentPart='a'});
 let pt=await canvasPoint(40,60);await page.mouse.click(pt.x,pt.y);
 now=await parts();assert.equal(now.length,2,'placing a removed dot must not create a panel');
 assert(Math.abs(now[0].x-40)<1&&Math.abs(now[0].y-60)<1,'dot placed where clicked');
 assert.deepEqual(await details(),original,'unchanged after placing the dot again');
 await page.reload();await install();
 assert.deepEqual(await details(),original,'unchanged after reopening with the dot back');
 assert.equal(await page.locator('#drawingCanvas .pin[data-id="a"]').count(),1,'placed dot is still there after reopening');
 await page.evaluate(()=>{state.currentPart='a'});

 // 6. Existing workflow: clicking empty drawing with a placed panel selected still adds a new panel.
 pt=await canvasPoint(10,90);await page.mouse.click(pt.x,pt.y);
 assert.equal((await parts()).length,3,'normal new-panel click still works');

 // 7. A repeated (copy) dot: remove it, quantity stays, then place it again.
 b=await pinBox('b',0);await page.mouse.click(b.x+b.width/2,b.y+b.height/2);
 await page.locator('#fiqPinMenu [data-remove-dot]').click();
 now=await parts();assert.equal(now[1].copies,0);assert.equal(now[1].unplaced,1);assert.equal(now[1].qty,2,'quantity kept');
 assert.deepEqual(await details(),original,'unchanged after removing a repeated dot');
 assert.equal(await page.locator('#drawingCanvas .pin[data-id="b"]').count(),1);
 pt=await canvasPoint(55,20);await page.mouse.click(pt.x,pt.y);
 now=await parts();assert.equal(now.length,3);assert.equal(now[1].copies,1);assert.equal(now[1].unplaced,0);
 assert.equal(await page.locator('#drawingCanvas .pin[data-id="b"]').count(),2,'copy dot placed again');
 await page.reload();await install();
 assert.deepEqual(await details(),original,'unchanged after reopening with the repeated dot back');
 assert.equal(await page.locator('#drawingCanvas .pin[data-id="b"]').count(),2);
 console.log('PASS: dot click without new panel, drag, Remove dot keeps every panel field, quantity and Cutting List place (after remove, reopen, re-place, reopen again), repeated dots, normal new panel click.');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
