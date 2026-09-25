// A Site Note with text and a photo travels Mobile -> Studio and shows BOTH in Studio's
// Site Measure room view. Mobile stores note photos as {id,data,takenAt}; the room view
// used to read only src/image/dataUrl, so it counted the photos but showed only the text.
// Real public Studio and Mobile loaders, separate browser profiles, fake cloud only.
const {chromium}=require('playwright');
const path=require('node:path'),assert=require('node:assert/strict');
const {createCloud,serve}=require('./helpers/fake-cloud.cjs');
const user={uid:'owner',companyId:'co',role:'company_owner',email:'owner@test',fitterId:'F1'};
const pic=(tag,n=9000)=>'data:image/jpeg;base64,'+(tag+'A'.repeat(n)).slice(0,n);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label,ms=15000){const end=Date.now()+ms;let last;while(Date.now()<end){try{last=await fn();if(last)return last}catch(e){last=e}await wait(200)}throw new Error('Timed out: '+label+(last instanceof Error?' ('+last.message+')':''))}
(async()=>{
 const {server,base}=await serve(path.resolve(__dirname,'..'));
 const cloud=createCloud();let browser;
 try{
 browser=await chromium.launch({headless:true});
 const errors=[];
 async function open(ctx,client,url){
  const page=await ctx.newPage();
  page.on('pageerror',e=>errors.push(client+': '+e.message));page.on('dialog',d=>d.accept());
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
  await cloud.attach(page,client,user);
  await page.goto(base+url);
  await page.waitForFunction(()=>document.readyState==='complete'&&typeof save==='function'&&(typeof exportJob==='function'||typeof exportProjectToMobile==='function')&&typeof (0,eval)('typeof state!=="undefined"&&state')==='object');
  await page.waitForTimeout(500);
  return page;
 }
 const studio=await open(await browser.newContext({viewport:{width:1366,height:657}}),'studio','/Studio.html');
 const mobile=await open(await browser.newContext(),'mobile','/Mobile.html');

 // Two rooms. Room 1 has a room note with a photo; the whole Site Job has a Site Note with a photo.
 await mobile.evaluate(async({cap,roomNote,siteNote,sitePhoto})=>{
  const st=(0,eval)('state');
  st.projects.push({id:'sn1',name:'Note Job',customer:'Nora Note',address:'3 Mill Lane',
   rooms:[
    {id:'r1',name:'Kitchen',location:'Ground',notes:'Mind the pipe behind the sink',measureCaptures:[{id:'cap1',image:cap,marks:[{id:'m1',type:'measure',value:900},{id:'m2',type:'measure',value:600}]}],beforePhotos:[],notePhotos:[{id:'np1',data:roomNote,takenAt:new Date().toISOString()}]},
    {id:'r2',name:'Utility',location:'Ground',notes:'',measureCaptures:[{id:'cap2',image:cap,marks:[{id:'m3',type:'measure',value:500},{id:'m4',type:'measure',value:400}]}],beforePhotos:[],notePhotos:[]}],
   cabinets:[],sitePhotos:[{id:'sp1',data:sitePhoto,note:''}],siteMeasurements:[{id:'sm1',area:'Hall',name:'Ceiling height',value:'2480',note:''}],jobLog:[],
   siteNotes:'Customer wants handles fitted last',siteNotePhotos:[{id:'snp1',data:siteNote,takenAt:new Date().toISOString()}]});
  save();await exportJob('sn1',true);
 },{cap:pic('cap'),roomNote:pic('room-note'),siteNote:pic('site-note'),sitePhoto:pic('site-photo')});

 const doc='companies/co/jobs/mobile-sn1-owner';
 await until(()=>cloud.docs.get(doc),'site measure message');
 const sent=cloud.docs.get(doc).project;
 const roomNoteUrl=sent.rooms[0].notePhotos[0].data,siteNoteUrl=sent.siteNotePhotos[0].data,sitePhotoUrl=sent.sitePhotos[0].data;
 assert(/^https:\/\/storage\.test\//.test(roomNoteUrl)&&/^https:\/\/storage\.test\//.test(siteNoteUrl),'note photos travel as stored files under data');

 await until(()=>studio.evaluate(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='sn1');return p&&(p.siteNotePhotos||[]).length&&p.rooms.length===2}),'site measure in Studio');

 // The room view keeps each note with its own photos: the room note in its group, the
 // Site Note (and anything else recorded for the whole Site Measure) in a second group.
 const view=async roomId=>studio.evaluate(rid=>{
  openSiteRoomDetails('sn1',rid);
  const srcs=sel=>[...document.querySelectorAll(sel+' img')].map(i=>i.getAttribute('src'));
  const box=sel=>{const r=document.querySelector(sel).getBoundingClientRect();return {top:r.top,bottom:r.bottom}};
  return {roomNote:document.getElementById('siteRoomNotes').textContent,roomPhotos:srcs('#siteRoomNotePhotos'),
   siteGroupShown:!document.getElementById('siteJobNoteGroup').hidden,siteNote:document.getElementById('siteJobNotes').textContent,
   sitePhotos:srcs('#siteJobNotePhotos'),generalPhotos:srcs('#siteJobPhotos'),measures:document.getElementById('siteJobMeasureList').textContent,
   thumbs:document.querySelectorAll('#siteRoomThumbs img').length,measureCount:document.getElementById('siteRoomMeasureCount').textContent,
   photoArea:box('.site-reference-pane'),notesBox:box('.site-notes-box'),notesScroll:(()=>{const n=document.querySelector('.site-notes-box');return n.scrollHeight-n.clientHeight})()};
 },roomId);
 const noOverlap=(v,label)=>{assert(v.notesBox.top>=v.photoArea.bottom,label+': Notes sit below the measurement photos, not over them');assert(v.notesScroll<=1,label+': Notes are not clipped')};

 const kitchen=await view('r1');
 assert.equal(kitchen.roomNote,'Mind the pipe behind the sink','room note text in the room group');
 assert.deepEqual(kitchen.roomPhotos,[roomNoteUrl],'room note photo sits with the room note');
 assert(kitchen.siteGroupShown&&kitchen.siteNote==='Customer wants handles fitted last','Site Note text in its own group');
 assert.deepEqual(kitchen.sitePhotos,[siteNoteUrl],'Site Note photo sits with the Site Note');
 assert(kitchen.measures.includes('Ceiling height')&&kitchen.measures.includes('2480'),'typed Site Measure measurements shown');
 assert.deepEqual(kitchen.generalPhotos,[sitePhotoUrl],'general site photos shown');
 assert.equal(kitchen.thumbs,1,'measurement photo shown');assert.equal(kitchen.measureCount,'2','room measurements counted');
 noOverlap(kitchen,'laptop');

 const utility=await view('r2');
 assert.equal(utility.roomNote,'No room note','a room without a note says so');
 assert.deepEqual(utility.roomPhotos,[],'the Kitchen room note photo does not follow into another room');
 assert.deepEqual(utility.sitePhotos,[siteNoteUrl],'the Site Note and its photo follow the Site Measure into every room');

 // Clicking a note photo opens it in the big picture frame.
 for(const [sel,url] of [['#siteRoomNotePhotos',roomNoteUrl],['#siteJobNotePhotos',siteNoteUrl],['#siteJobPhotos',sitePhotoUrl]]){
  const shown=await studio.evaluate(sel=>{openSiteRoomDetails('sn1','r1');document.querySelector(sel+' img').click();return document.querySelector('#siteRoomReferenceFrame img').getAttribute('src')},sel);
  assert.equal(shown,url,sel+' photo opens large');
 }

 // Phone-sized window: still no overlap.
 await studio.setViewportSize({width:390,height:844});
 noOverlap(await view('r1'),'phone');
 await studio.setViewportSize({width:1366,height:657});

 // Customer page: no separate Notes tab; Jobs / Designs, Site Measurements, Photos and Documents stay.
 const tabs=await studio.evaluate(()=>{closeSiteRoomDetails();const p=(0,eval)('state').projects.find(x=>x.id==='sn1');openCustomerCard(p.customerId);return new Promise(r=>setTimeout(()=>r([...document.querySelectorAll('.customer-card-tabs .customer-tab')].map(b=>b.dataset.tab||b.textContent.trim())),600))});
 assert(!tabs.includes('notes'),'no separate Notes tab');
 for(const k of ['jobs','site','photos','documents'])assert(tabs.includes(k),k+' tab kept');

 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({kitchen:{roomNote:kitchen.roomNote,siteNote:kitchen.siteNote,measures:kitchen.measures},tabs,ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
