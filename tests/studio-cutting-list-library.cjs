// A finished Cutting List is kept in Customer Library, under the right customer and room,
// without being sent to Mobile, while the job stays active in Job Overview. It is the same
// record (no copy), survives closing and reopening Studio, can be opened, edited and
// exported from the Library, and stays there after Move to Customer Library.
// Runs the real public Studio loader (Studio.html + patches) with every network request
// blocked, so no account, Firebase or customer data is touched.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1400,height:900},acceptDownloads:true});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('dialog',d=>d.accept());
 await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 const url=`http://127.0.0.1:${server.address().port}/Studio.html`;
 async function open(){
  await page.goto(url);
  await page.waitForFunction(()=>typeof finishDesignToCard==='function'&&typeof openCuttingListForRoom==='function');
  await page.waitForTimeout(800);
  // Sign-in is not part of this test; open the app shell the way unlockApp does.
  await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});
 }
 const snapshot=()=>page.evaluate(()=>JSON.parse(JSON.stringify(state.projects.find(p=>p.id==='p1').cabinets[0].parts)));
 await open();

 // An existing customer, and a new kitchen design for them with three checked panels.
 const panels=await page.evaluate(()=>{
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#eee"/></svg>');
  state.customers=[{id:'cust-anna',name:'Anna Jensen',address:'1 High Street',createdAt:1,updatedAt:1}];
  const parts=[
   {id:'pt-side',code:'P-001',name:'Side',length:720,width:560,thickness:19,qty:2,material:'Oak',edgeLong:1,edgeShort:2,notes:'Grain up',status:'ready',x:20,y:30,copies:[{x:70,y:30}]},
   {id:'pt-shelf',code:'P-002',name:'Shelf',length:500,width:300,thickness:19,qty:3,material:'Oak',edgeLong:1,edgeShort:0,notes:'',status:'ready',x:45,y:50,copies:[]},
   {id:'pt-top',code:'P-003',name:'Top',length:1200,width:600,thickness:25,qty:1,material:'Walnut',edgeLong:2,edgeShort:2,notes:'',status:'ready',x:50,y:10,copies:[]}];
  parts.forEach(p=>p.reviewSignature=window.panelReviewSignature(p));
  // Like New Job: the job starts with no customer name (linked to a placeholder customer),
  // and the name is typed in afterwards through the job fields.
  const job={id:'p1',name:'Jensen kitchen',customer:'',address:'1 High Street',rooms:[{id:'r1',name:'Kitchen',icon:'🍳'}],cabinets:[{id:'c1',roomId:'r1',name:'Kitchen',drawing,parts}],jobLog:[],updatedAt:Date.now()};
  ensureCustomerForProject(job);state.projects.push(job);
  window.__placeholderCustomer=job.customerId;
  job.customer='Anna Jensen';
  switchToProject('p1','c1');renderAll();show('cutting');
  return JSON.parse(JSON.stringify(parts));
 });

 // 1. Finish with the real Cutting List button (Return to Job Overview). Not sent to Mobile.
 // Count every attempt to reach Mobile, not only finished sends.
 await page.evaluate(()=>{window.__mobileSends=0;['exportProjectToMobile','sendPackToPhoneDirectly'].forEach(n=>{const f=window[n];window[n]=function(){window.__mobileSends++;return f.apply(this,arguments)}})});
 await page.locator('#panelCheckReturnBtn').click();
 await page.waitForFunction(()=>state.currentProject===null);
 let p=await page.evaluate(()=>{const p=state.projects.find(x=>x.id==='p1');return {customerId:p.customerId,lastMobileSync:p.lastMobileSync||null,moved:p.movedToLibraryAt||null,finished:p.overviewFinishedAt||null,annaCount:state.customers.filter(c=>c.name==='Anna Jensen').length,copies:state.projects.filter(x=>x.id==='p1').length}});
 assert.deepEqual(p,{customerId:'cust-anna',lastMobileSync:null,moved:null,finished:null,annaCount:1,copies:1},'saved under the existing customer, one record, not sent, not completed');
 assert.equal(await page.evaluate(()=>window.__mobileSends),0,'Return to Job Overview makes no attempt to send to Mobile');

 // 2. It is an active card in Job Overview.
 await page.evaluate(()=>{show('jobs');renderAll()});
 assert(await page.locator('[data-open-job-card="p1"]').count()>0,'job card in Job Overview');

 // 3. It is in Customer Library under Anna Jensen and the Kitchen room, with its Cutting List.
 await page.evaluate(()=>{show('customers');openCustomerCard('cust-anna')});
 let libraryButton=page.locator('[data-open-cutting-list-project="p1"][data-open-cutting-list="r1"]');
 assert.equal(await libraryButton.count(),1,'Cutting List button in Customer Library for this room');
 assert.match(await page.locator('#customerCardBody').innerText(),/Kitchen[\s\S]*6/,'Library row shows the room and its 6 pieces');

 // 4. Close and reopen Studio: everything is still there, unchanged, QR ids included.
 await open();
 assert.deepEqual(await snapshot(),panels,'every measurement, quantity, material, edge and panel id kept after reopening');
 await page.evaluate(()=>{show('jobs');renderAll()});
 assert(await page.locator('[data-open-job-card="p1"]').count()>0,'still in Job Overview after reopening');
 await page.evaluate(()=>{show('customers');openCustomerCard('cust-anna')});
 libraryButton=page.locator('[data-open-cutting-list-project="p1"][data-open-cutting-list="r1"]');

 // 5. Open it from the Library: the same Cutting List, which can be edited and exported.
 await libraryButton.click();
 assert.equal(await page.evaluate(()=>[state.screen,state.currentProject,state.currentCabinet].join('|')),'cutting|p1|c1');
 const listText=await page.locator('#screen-cutting').innerText();
 ['P-001','P-002','P-003'].forEach(code=>assert(listText.includes(code),'Cutting List shows '+code));
 const download=page.waitForEvent('download');
 await page.locator('#exportSupplierCsvBtn').click();
 const csv=fs.readFileSync(await (await download).path(),'utf8');
 assert.match(csv,/P-001/);assert.match(csv,/1200/);assert.match(csv,/Walnut/);
 await page.evaluate(()=>{const pt=state.projects.find(x=>x.id==='p1').cabinets[0].parts.find(x=>x.id==='pt-top');pt.notes='Check wall';pt.reviewSignature=window.panelReviewSignature(pt);save()});
 await page.evaluate(()=>{show('jobs');renderAll()});
 assert.equal(await page.evaluate(()=>state.projects.filter(x=>x.id==='p1').length),1,'editing from the Library changes the one record, no duplicate job');

 // 5b. Editing a checked panel through the real form clears its Panel Check. The room card
 // must stay in Job Overview marked Needs recheck, stay in Customer Library, and survive
 // reopening. Send to Mobile works exactly as before, with no extra question. Checking the
 // panel again clears the badge.
 const recheckBadge=()=>page.locator('.job-overview-row[data-open-job-card="p1"] .jor-recheck-badge').count();
 assert.equal(await recheckBadge(),0,'no badge while every panel is checked');
 await page.evaluate(()=>{openJobDesignForRoom('p1','r1');state.currentPart='pt-top';renderAll()});
 await page.locator('#fLength').fill('1210');
 await page.locator('#fLength').dispatchEvent('input');await page.locator('#fLength').dispatchEvent('change');
 await page.evaluate(()=>save());
 assert.equal(await page.evaluate(()=>{const pt=state.projects.find(x=>x.id==='p1').cabinets[0].parts.find(x=>x.id==='pt-top');return [pt.length,!!pt.reviewSignature&&pt.reviewSignature===window.panelReviewSignature(pt)].join('|')}),'1210|false','the real edit changed the length and cleared Panel Check');
 await page.evaluate(()=>{show('jobs');renderAll()});
 assert(await page.locator('[data-open-job-card="p1"]').count()>0,'edited room stays in Job Overview');
 assert.equal(await recheckBadge(),1,'card shows Needs recheck');
 await open();
 await page.evaluate(()=>{show('jobs');renderAll()});
 assert.equal(await recheckBadge(),1,'Needs recheck survives reopening');
 await page.evaluate(()=>{window.__mobileSends=0;['exportProjectToMobile','sendPackToPhoneDirectly'].forEach(n=>{const f=window[n];window[n]=function(){window.__mobileSends++;return f.apply(this,arguments)}})});
 const sendDialogs=[];
 page.removeAllListeners('dialog');page.on('dialog',d=>{sendDialogs.push(d.message());d.accept()});
 await page.locator('.job-overview-row[data-open-job-card="p1"] [data-owner-mobile-send]').first().click();
 await page.waitForTimeout(500);
 page.removeAllListeners('dialog');page.on('dialog',d=>d.accept());
 // This offline test has no signed-in company, so the send itself stops at sign-in as it
 // always has; what matters is that no recheck question was added in front of it.
 assert(await page.evaluate(()=>window.__mobileSends)>0,'the send counter does see a real Send to Mobile press');
 assert(!sendDialogs.some(m=>/Panel Check|recheck|checking again/i.test(m)),'Send to Mobile asks nothing extra: '+JSON.stringify(sendDialogs));
 await page.evaluate(()=>{show('customers');openCustomerCard('cust-anna')});
 assert.equal(await page.locator('[data-open-cutting-list-project="p1"][data-open-cutting-list="r1"]').count(),1,'still in Customer Library while it needs recheck');
 await page.locator('[data-open-cutting-list-project="p1"][data-open-cutting-list="r1"]').click();
 // Panel Check approval lives on the Panel Check screen (screen-parts).
 await page.evaluate(()=>{show('parts');renderAll()});
 await page.locator('#screen-parts [data-review-panel="pt-top"]').first().dblclick();
 assert.equal(await page.evaluate(()=>{const pt=state.projects.find(x=>x.id==='p1').cabinets[0].parts.find(x=>x.id==='pt-top');return pt.reviewSignature===window.panelReviewSignature(pt)}),true,'real Panel Check approval');
 await page.evaluate(()=>{show('jobs');renderAll()});
 assert.equal(await recheckBadge(),0,'badge gone after checking again');

 // 6. Finish fitting: Move to Customer Library. Gone from Job Overview, kept in the Library.
 await page.evaluate(()=>{const b=document.querySelector('[data-finish-overview-job="p1"]');b.disabled=false});
 await page.locator('[data-finish-overview-job="p1"]').first().click();
 await page.waitForFunction(()=>!!(state.projects.find(x=>x.id==='p1').rooms[0].movedToLibraryAt));
 await page.evaluate(()=>{show('jobs');renderAll()});
 assert.equal(await page.locator('[data-open-job-card="p1"]').count(),0,'removed from Job Overview only after Move to Customer Library');
 await open();
 await page.evaluate(()=>{show('customers');openCustomerCard('cust-anna')});
 assert.equal(await page.locator('[data-open-cutting-list-project="p1"]').count(),1,'still in Customer Library after the fitting job is completed and Studio reopened');
 const kept=await snapshot();
 assert.equal(kept.find(x=>x.id==='pt-top').notes,'Check wall','later edit kept');
 assert.deepEqual(kept.map(x=>x.id),['pt-side','pt-shelf','pt-top']);
 assert.equal(await page.evaluate(()=>state.customers.filter(c=>c.name==='Anna Jensen').length),1,'no duplicate customer');

 // 7. A second job for the same customer, typed differently, with two wardrobes in one room
 // and one unit outside any room: same customer record, and every unit's own Cutting List
 // can be opened from the Library.
 await page.evaluate(async()=>{
  const part=(id,code,name,length)=>{const p={id,code,name,length,width:400,thickness:18,qty:1,material:'Birch',edgeLong:0,edgeShort:0,notes:'',status:'ready',x:30,y:30,copies:[]};p.reviewSignature=window.panelReviewSignature(p);return p};
  state.projects.push({id:'p2',name:'Jensen bedroom',customer:'  anna JENSEN ',rooms:[{id:'r2',name:'Bedroom',icon:'🛏️'}],cabinets:[
   {id:'c2a',roomId:'r2',name:'Wardrobe 1',parts:[part('w1','P-001','Door',2000)]},
   {id:'c2b',roomId:'r2',name:'Wardrobe 2',parts:[part('w2','P-001','Shelf',900),part('w3','P-002','Rail',880)]},
   {id:'c2c',roomId:'',name:'Hall shelf',parts:[part('h1','P-001','Board',1100)]}],jobLog:[],updatedAt:Date.now()});
  switchToProject('p2','c2a');await finishDesignToCard('p2');
 });
 assert.equal(await page.evaluate(()=>state.projects.find(x=>x.id==='p2').customerId),'cust-anna','differently typed name joins the same customer');
 assert.equal(await page.evaluate(()=>state.customers.filter(c=>customerKeyFor(c.name)==='anna jensen').length),1,'no duplicate customer');
 await open();
 await page.evaluate(()=>{show('customers');openCustomerCard('cust-anna')});
 for(const [cab,codes] of [['c2a',['P-001']],['c2b',['P-001','P-002']],['c2c',['P-001']]]){
  const btn=page.locator(`[data-open-cutting-list-project="p2"][data-open-cutting-list-cabinet="${cab}"]`);
  assert.equal(await btn.count(),1,'Library has a Cutting List button for unit '+cab);
  await btn.click();
  assert.equal(await page.evaluate(()=>state.currentCabinet),cab,'opens that unit');
  assert.deepEqual(await page.evaluate(()=>cabinet().parts.map(p=>p.code)),codes);
  await page.evaluate(()=>{show('customers');openCustomerCard('cust-anna')});
 }
 const libText=await page.locator('#customerCardBody').innerText();
 assert.match(libText,/Bedroom · Wardrobe 2/,'second wardrobe named in the Library');
 assert.match(libText,/Hall shelf/,'unit outside rooms listed');
 assert.equal(await page.locator('[data-open-cutting-list-project="p1"]').count(),1,'first job still listed once');
 assert.deepEqual(errors,[],'no page errors');
 console.log('PASS: finished Cutting List saved under the existing customer and room without Mobile, stays in Job Overview, same record, survives reopening, opens, edits and exports from Customer Library, kept after Move to Customer Library, every unit reachable, no duplicate customers.');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
