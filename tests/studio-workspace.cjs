const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../Studio-Recovery.html'),'utf8');
function section(a,b){const start=source.indexOf(a),end=source.indexOf(b,start+a.length);assert(start>=0&&end>start,a);return source.slice(start,end)}
function fn(name){const start=source.indexOf('function '+name+'(');const end=source.indexOf('\nfunction ',start+1);assert(start>=0&&end>start,name);return source.slice(start,end)}
const stability=section("  const DB_NAME='assembleone_stable_v1'",'  window.a131StableSave=stableSave;');
const finish=section('async function finishDesignToCard(', '\nfunction save(');
const returnScript=source.match(/<script id="a222-cutting-list-return-script">([\s\S]*?)<\/script>/)[1];
(async()=>{
 const server=http.createServer((req,res)=>res.end('<!doctype html><title>Isolated Studio regression</title>'));
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});const page=await browser.newPage();
 await page.goto('http://127.0.0.1:'+server.address().port);
 await page.evaluate(()=>{
  const inputs=['projectName','customerName','fLength','fWidth','fThickness','fQty','fMaterial','fNotes','partNamePicker'];
  document.body.innerHTML=inputs.map(id=>'<input id="'+id+'">').join('')+['selectedPartBanner','chosenPartSummary','markerCount','drawingName','zoomValue','drawingEmpty','cuttingListReturnStrip'].map(id=>'<div id="'+id+'"></div>').join('')+'<div id="drawingStage"><div id="drawingCanvas"><img id="drawingImage"><iframe id="drawingPdf"></iframe></div></div>';
  window.$=s=>document.querySelector(s);window.$$=s=>document.querySelectorAll(s);
  window.t=x=>x;window.renderMaterialPicker=window.renderNotesPicker=window.updateEdgePreview=window.renderSiteMeasurementOverlay=()=>{};
  window.ensureCustomerForProject=p=>{p.customerId='customer'};
  window.STORE='isolated-studio';window.clampPanelQty=x=>Math.max(1,Number(x)||1);
  window.isCompleteSupplierPart=p=>p.length>0&&p.width>0;window.renderCutting=()=>{};
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><!--'+'x'.repeat(2000000)+'--></svg>');
  window.state={projects:[{id:'job',name:'Design',customer:'Test customer',rooms:[{id:'room'}],cabinets:[{id:'cabinet',roomId:'room',drawing,parts:[{id:'panel',code:'P-009',name:'Back panel',length:500,width:600,thickness:19,qty:1,material:'Oak',notes:'Keep this note',x:10,y:10}]}]}],currentProject:'job',currentCabinet:'cabinet',currentPart:'panel',currentRoom:'room',screen:'cutting'};
  window.project=()=>state.projects.find(p=>p.id===state.currentProject)||null;
  window.cabinet=()=>project()?.cabinets.find(c=>c.id===state.currentCabinet)||null;
  window.part=()=>cabinet()?.parts.find(p=>p.id===state.currentPart)||null;
  $('#projectName').value='Design';$('#customerName').value='Test customer';
  window.writes={};const put=IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put=function(...args){writes[this.name]=(writes[this.name]||0)+1;return put.apply(this,args)};
  window.alerts=[];window.alert=x=>alerts.push(x);
 });
 await page.addScriptTag({content:fn('renderRooms')+'\n'+fn('renderForm')+'\n'+finish});
 await page.evaluate(()=>{window.renderAll=()=>{renderRooms();renderForm();renderCutting()};renderAll()});
 await page.addScriptTag({content:'(function(){'+stability+'window.save=stableSave;window.readBackup=getProjectState;})();'});
 assert.equal(await page.evaluate(()=>save()),true);
 const first=await page.evaluate(()=>({...writes}));
 await page.evaluate(async()=>{for(let i=0;i<75;i++)await save()});
 assert.deepEqual(await page.evaluate(()=>writes),first,'unchanged autosaves must not rewrite drawings or full state');
 await page.evaluate(async()=>{$('#fWidth').value='650';await Promise.all(Array.from({length:80},()=>save()))});
 assert.equal(await page.evaluate(()=>writes.drawings),1,'editing a panel must not rewrite its unchanged drawing');
 assert.equal(await page.evaluate(()=>writes.project_state),2,'a burst of saves must coalesce into one changed snapshot');
 await page.addScriptTag({content:returnScript});
 await page.click('#panelCheckReturnBtn');
 await page.waitForFunction(()=>state.currentProject===null&&document.querySelector('#fWidth').value==='');
 assert.deepEqual(await page.evaluate(()=>[state.currentCabinet,state.currentPart,state.currentRoom]),[null,null,null]);
 assert.equal(await page.evaluate(()=>document.querySelector('#drawingImage').hasAttribute('src')),false,'clear must release the hidden image');
 const backup=await page.evaluate(async()=>{const s=(await readBackup()).state;const p=s.projects[0],c=p.cabinets[0];return {active:s.currentProject,customer:p.customerId,drawing:c.drawing.length,width:c.parts[0].width,note:c.parts[0].notes}});
 assert.equal(backup.active,null);assert.equal(backup.customer,'customer');assert(backup.drawing>2000000);assert.equal(backup.width,650);assert.equal(backup.note,'Keep this note');
 await page.reload();
 const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('isolated-studio')));
 assert.equal(restored.currentProject,null,'refresh must keep the workspace empty');assert.equal(restored.projects[0].cabinets[0].hasStoredDrawing,true);
 // Failure and concurrent navigation must never erase or close work.
 await page.evaluate(s=>{window.state=s;state.currentProject='job';state.currentCabinet='cabinet';state.currentPart='panel';state.currentRoom='room';window.ensureCustomerForProject=()=>{};window.renderAll=()=>{};window.save=async()=>false},restored);
 await page.addScriptTag({content:finish});
 assert.equal(await page.evaluate(async()=>{try{await finishDesignToCard('job')}catch{return state.currentProject}}),'job');
 await page.evaluate(()=>{window.save=async()=>{state.currentProject='other';return true}});
 await page.evaluate(()=>finishDesignToCard('job'));
 assert.equal(await page.evaluate(()=>state.currentProject),'other');
 console.log('PASS: actual Studio save, 2MB drawing, 75 idle saves, coalesced burst, finish button, empty editor, retained job data, refresh, save failure and navigation protection.');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
