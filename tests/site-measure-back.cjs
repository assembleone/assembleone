// Site Measure is its own section: Back stays inside it. Real taps on an iPhone-size Mobile,
// real Studio over the fake cloud for the receipt. "In Site Measure" = a Site Measure screen,
// or the shared list screen showing the Site Measure list, with Site Measure highlighted in
// the bottom navigation. Checked after every step:
//  - new Site Measure: wizard Back step by step; Back on the first question -> Site Measure list;
//  - rooms: measure -> 🏠 -> Summary; tap a room -> measure -> 🏠; Add Room -> 🏠;
//  - Summary Back -> Site Measure list; reload on the list, on the Summary, on the measuring
//    screen (reopens at its Summary) -> still Site Measure;
//  - a saved Site Measure opened from its card; a room removed there; "Not this job? Switch";
//  - Send to Studio -> Waiting -> Received in Studio (Studio opens it) -> Studio accepts;
//    Delete from this device -> still the Site Measure list;
//  - only a tap on Jobs in the bottom navigation shows the Jobs list;
//  - no measurement, note or photo is lost on the way.
const {chromium,devices}=require('playwright');
const path=require('node:path'),assert=require('node:assert/strict');
const {createCloud,serve}=require('./helpers/fake-cloud.cjs');
const user={uid:'owner',companyId:'co',role:'company_owner',email:'owner@test',fitterId:'F1'};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label,ms=60000){const end=Date.now()+ms;let last;while(Date.now()<end){try{last=await fn();if(last)return last}catch(e){last=e}await wait(250)}throw new Error('Timed out: '+label+' '+JSON.stringify(last))}
const SITE=['measure','newSiteJob','siteVisitSummary','sentToStudio'];
(async()=>{
 const served=await serve(path.resolve(__dirname,'..')),server=served.server,base=process.env.LIVE_BASE||served.base;
 const site=process.env.LIVE_BASE?process.env.LIVE_BASE.replace(/\/beta$/,'')+'/':'http://127.0.0.1';
 const cloud=createCloud();const browser=await chromium.launch({headless:true});const errors=[];
 try{
 async function open(client,url,ctxOpts){
  const ctx=await browser.newContext(ctxOpts||{});const page=await ctx.newPage();
  page.on('pageerror',e=>errors.push(client+': '+e.message));page.on('dialog',d=>d.accept());
  await page.route(u=>!String(u).startsWith(site),r=>r.abort());
  await cloud.attach(page,client,user);await page.goto(base+url);
  await boot(page);return page;
 }
 async function boot(page){await page.waitForFunction(()=>document.readyState==='complete'&&typeof save==='function'&&typeof (0,eval)('typeof state!=="undefined"&&state')==='object');await wait(900);
  await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'})}
 const mobile=await open('mobile','/Mobile.html',{...devices['iPhone 13'],viewport:{width:390,height:664}});
 const where=()=>mobile.evaluate(()=>{const vis=[...document.querySelectorAll('.screen.active')].map(s=>s.id);return {screen:state.screen,visible:vis.join(','),list:(0,eval)('projectsListMode'),nav:[...document.querySelectorAll('.nav.active')].map(n=>n.dataset.screen).join(',')}});
 const inSite=async(label,expectScreen)=>{const w=await where();
  const ok=w.nav==='siteMeasureFlow'&&w.visible===w.screen&&(SITE.includes(w.screen)||(w.screen==='projects'&&w.list==='site')||w.screen==='drawings');
  assert.ok(ok,label+': still in Site Measure '+JSON.stringify(w));
  if(expectScreen)assert.equal(w.screen,expectScreen,label+': '+JSON.stringify(w));
  if(w.screen==='projects')assert.equal(await mobile.evaluate(()=>getComputedStyle(document.getElementById('siteMeasureCreateRow')).display!=='none'),true,label+': the Site Measure list (not Jobs) is showing');
 };
 const tap=sel=>mobile.locator(sel).first().tap();
 const reload=async()=>{await mobile.reload();await boot(mobile)};
 // New Site Measure.
 await tap('.nav[data-screen="siteMeasureFlow"]');await wait(300);await inSite('Site Measure','newSiteJob');
 await tap('#nsjBackBtn');await wait(300);await inSite('Back on the first question','projects');
 await tap('.nav[data-screen="siteMeasureFlow"]');await wait(300);
 await mobile.fill('#nsjCustomerName','Sam Site');await tap('#nsjNextBtn');await tap('#nsjNextBtn');await wait(200);
 assert.equal(await mobile.evaluate(()=>project().nsjStep),3);
 await tap('#nsjBackBtn');await tap('#nsjBackBtn');await wait(200);
 assert.equal(await mobile.evaluate(()=>project().nsjStep),1,'wizard Back goes one question back');await inSite('wizard Back','newSiteJob');
 await tap('#nsjBackBtn');await wait(300);await inSite('Back from a named new Site Measure','projects');
 await tap('.nav[data-screen="siteMeasureFlow"]');await wait(300);await inSite('resume','newSiteJob');
 for(let i=0;i<5&&await mobile.evaluate(()=>project().nsjStep)<5;i++){await tap('#nsjNextBtn');await wait(120)}
 await mobile.locator('#nsjRoomGrid [data-room-type="Kitchen"]').tap();await wait(250);
 await mobile.locator('#nsjFloorGrid [data-floor="Ground"]').tap();await wait(500);
 await inSite('room + floor chosen','measure');
 // A measured photo, a room note and a whole-site note (the data must survive every step).
 const cap='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
 await mobile.evaluate(c=>{const p=project(),r=p.rooms[0];r.measureCaptures=[{id:'c1',image:c,w:1,h:1,marks:[{type:'measure',value:'2400',x1:0,y1:0,x2:1,y2:1}]}];r.notes='Sloped ceiling';p.siteNotes='Parking behind';save()},cap);
 const data=()=>mobile.evaluate(()=>{const p=state.projects.find(x=>x.customer==='Sam Site');return p?JSON.stringify([p.rooms.map(r=>[r.name,(r.measureCaptures||[]).length,r.notes||'']),p.siteNotes]):null});
 const before=await data();
 await tap('#measureHomeBtn');await wait(300);await inSite('measuring -> 🏠','siteVisitSummary');
 await tap('[data-svs-room]');await wait(300);await inSite('Summary -> room','measure');
 await tap('#measureHomeBtn');await wait(300);await inSite('room -> 🏠','siteVisitSummary');
 await tap('#svsAddRoomBtn');await wait(300);await inSite('Add Room','measure');
 await tap('#measureHomeBtn');await wait(300);await inSite('Add Room -> 🏠','siteVisitSummary');
 // Reload on the measuring screen: reopens at its Summary.
 await tap('[data-svs-room]');await wait(300);await reload();await inSite('reload while measuring','siteVisitSummary');
 await reload();await inSite('reload on the Summary','siteVisitSummary');
 await tap('#svsBackBtn');await wait(300);await inSite('Summary Back','projects');
 await reload();await inSite('reload on the Site Measure list','projects');
 assert.equal(await data(),before,'nothing lost so far');
 // A saved Site Measure opened from its card; a second room added and removed there.
 await mobile.locator('#jobList .open-job:visible').first().tap();await wait(400);await inSite('open a saved Site Measure','drawings');
 await mobile.evaluate(()=>{const p=project();p.rooms.push({id:'extra',name:'Hall',icon:'🚪',measureCaptures:[],notes:''});state.currentRoom='extra';save();renderAll()});await wait(200);
 await tap('#deleteRoomBtn');await wait(300);await inSite('room removed','drawings');
 assert.equal(await mobile.evaluate(()=>project().rooms.some(r=>r.id==='extra')),false,'extra room removed');
 await tap('#currentJobBannerSwitch');await wait(300);await inSite('Not this job? Switch','projects');
 assert.equal(await data(),before,'nothing lost after opening and switching');
 // Send to Studio -> Waiting -> Received in Studio -> accepted.
 await tap('.nav[data-screen="siteMeasureFlow"]');await wait(400);
 if((await where()).screen!=='siteVisitSummary'){await mobile.locator('#jobList .open-job:visible').first().tap();await wait(300);await mobile.evaluate(()=>show('siteVisitSummary'))}
 await inSite('back in the Summary to send','siteVisitSummary');
 await tap('#sendAllRoomsBtn');
 const bar=()=>mobile.evaluate(()=>document.getElementById('measureSendBar').innerText.replace(/\s+/g,' '));
 await until(async()=>/Waiting for Studio/i.test(await bar()),'Waiting for Studio');
 await inSite('Waiting','siteVisitSummary');
 const studio=await open('studio','/Studio.html',{viewport:{width:1366,height:900}});
 await until(async()=>{const w=await where();return w.screen!=='siteVisitSummary'||/Received in Studio/i.test(await bar())},'Received in Studio');
 await wait(2500);// the short "Sent to Studio" screen returns by itself
 await inSite('after Received in Studio');
 const pid=await mobile.evaluate(()=>state.projects.find(x=>x.customer==='Sam Site').id);
 await studio.evaluate(async id=>{const packs=await studioInboxPackets();const pk=packs.find(x=>(x.project||{}).id===id);if(pk)await applyOneSitePacket(pk,true)},pid);
 await until(()=>mobile.evaluate(id=>state.projects.find(x=>x.id===id).mobileArchived,pid),'phone sees the acceptance');
 await mobile.evaluate(()=>renderAll());await inSite('after Studio accepts');
 assert.equal(await data(),before,'nothing lost through send and receipt');
 // Delete from this device (the settled workflow) -> still the Site Measure list.
 await mobile.evaluate(()=>{projectsListMode='site';show('projects')});await wait(200);
 const safety=mobile.locator('#jobList details.mobile-archived-jobs > summary').first();if(await safety.count())await safety.tap();await wait(200);
 const del=mobile.locator('[data-remove-site-measure]:visible').first();
 await del.tap();await wait(500);await inSite('Delete from this device','projects');
 assert.equal(await mobile.evaluate(id=>!!state.projects.find(x=>x.id===id),pid),false,'removed from this device');
 // Only the Jobs button shows Jobs.
 await tap('.nav[data-screen="projects"]');await wait(300);
 const j=await where();assert.deepEqual([j.screen,j.list,j.nav],['projects','jobs','projects'],'Jobs button shows the Jobs list');
 await reload();const j2=await where();assert.deepEqual([j2.screen,j2.list,j2.nav],['projects','jobs','projects'],'reload on Jobs stays Jobs');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
