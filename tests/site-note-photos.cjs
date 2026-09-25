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

 // Two rooms. Room 1 has three measurement photos and a room note with two photos; the whole Site Job has a Site Note with a photo.
 await mobile.evaluate(async({cap,cap2,cap3,roomNote,roomNote2,siteNote,sitePhoto})=>{
  const st=(0,eval)('state');
  st.projects.push({id:'sn1',name:'Note Job',customer:'Nora Note',address:'3 Mill Lane',
   rooms:[
    {id:'r1',name:'Kitchen',location:'Ground',notes:'Mind the pipe behind the sink',measureCaptures:[{id:'cap1',image:cap,marks:[{id:'m1',type:'measure',value:900},{id:'m2',type:'measure',value:600}]},{id:'cap1b',image:cap2,marks:[{id:'m1b',type:'measure',value:300}]},{id:'cap1c',image:cap3,marks:[{id:'m1c',type:'measure',value:200}]}],beforePhotos:[],notePhotos:[{id:'np1',data:roomNote,takenAt:new Date().toISOString()},{id:'np2',data:roomNote2,takenAt:new Date().toISOString()}]},
    {id:'r2',name:'Utility',location:'Ground',notes:'',measureCaptures:[{id:'cap2',image:cap,marks:[{id:'m3',type:'measure',value:500},{id:'m4',type:'measure',value:400}]}],beforePhotos:[],notePhotos:[]}],
   cabinets:[],sitePhotos:[{id:'sp1',data:sitePhoto,note:''}],siteMeasurements:[{id:'sm1',area:'Hall',name:'Ceiling height',value:'2480',note:''}],jobLog:[],
   siteNotes:'Customer wants handles fitted last',siteNotePhotos:[{id:'snp1',data:siteNote,takenAt:new Date().toISOString()}]});
  save();await exportJob('sn1',true);
 },{cap:pic('cap'),cap2:pic('cap-two'),cap3:pic('cap-three'),roomNote:pic('room-note'),roomNote2:pic('room-note-two'),siteNote:pic('site-note'),sitePhoto:pic('site-photo')});

 const doc='companies/co/jobs/mobile-sn1-owner';
 await until(()=>cloud.docs.get(doc),'site measure message');
 const sent=cloud.docs.get(doc).project;
 const roomNoteUrls=sent.rooms[0].notePhotos.map(x=>x.data),capUrls=sent.rooms[0].measureCaptures.map(x=>x.image),roomNoteUrl=roomNoteUrls[0],siteNoteUrl=sent.siteNotePhotos[0].data,sitePhotoUrl=sent.sitePhotos[0].data;
 assert(/^https:\/\/storage\.test\//.test(roomNoteUrl)&&/^https:\/\/storage\.test\//.test(siteNoteUrl),'note photos travel as stored files under data');

 await until(()=>studio.evaluate(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='sn1');return p&&(p.siteNotePhotos||[]).length&&p.rooms.length===2}),'site measure in Studio');

 // The room view: one photo strip (measurement photos, Room Note photos with a pencil badge,
 // then the whole Site Measure's Site Note photos with a green pencil badge and general site
 // photos). Under the strip, note text only: no Notes heading and no second copy of a photo.
 const view=async roomId=>studio.evaluate(rid=>{
  openSiteRoomDetails('sn1',rid);
  const modal=document.getElementById('siteRoomDetailsModal');
  const box=sel=>{const r=document.querySelector(sel).getBoundingClientRect();return {top:r.top,bottom:r.bottom}};
  const items=[...document.querySelectorAll('#siteRoomThumbs [data-site-thumb]')];
  return {strip:items.map(x=>({src:x.querySelector('img').getAttribute('src'),kind:x.dataset.thumbKind,badge:x.querySelector('.site-thumb-badge')?(x.querySelector('.site-thumb-badge.site-note')?'site-note':'room-note'):null})),
   stripTops:[...new Set(items.map(x=>Math.round(x.getBoundingClientRect().top)))].length,
   notesImages:document.querySelectorAll('.site-notes-box img').length,notesText:document.querySelector('.site-notes-box').textContent,notesHeading:!!document.querySelector('.site-notes-box h3'),
   modalImages:[...modal.querySelectorAll('img')].map(i=>i.getAttribute('src')),
   roomNote:document.getElementById('siteRoomNotes').textContent,
   siteGroupShown:!document.getElementById('siteJobNoteGroup').hidden,siteNote:document.getElementById('siteJobNotes').textContent,
   measures:document.getElementById('siteJobMeasureList').textContent,measureCount:document.getElementById('siteRoomMeasureCount').textContent,
   large:document.querySelector('#siteRoomReferenceFrame img')?.getAttribute('src'),
   photoArea:box('.site-reference-pane'),notesBox:box('.site-notes-box'),notesScroll:(()=>{const n=document.querySelector('.site-notes-box');return n.scrollHeight-n.clientHeight})()};
 },roomId);
 const noOverlap=(v,label)=>{assert(v.notesBox.top>=v.photoArea.bottom,label+': Notes sit below the photos, not over them');assert(v.notesScroll<=1,label+': Notes are not clipped');assert.equal(v.stripTops,1,label+': the photo strip stays one horizontal row')};
 const once=(v,url,label)=>assert.equal(v.modalImages.filter(x=>x===url).length,1,label+' appears once, not repeated under the note');

 const kitchen=await view('r1');
 assert.deepEqual(kitchen.strip,[
  {src:capUrls[0],kind:'photo',badge:null},{src:capUrls[1],kind:'photo',badge:null},{src:capUrls[2],kind:'photo',badge:null},
  {src:roomNoteUrls[0],kind:'room-note',badge:'room-note'},{src:roomNoteUrls[1],kind:'room-note',badge:'room-note'},
  {src:siteNoteUrl,kind:'site-note',badge:'site-note'},{src:sitePhotoUrl,kind:'site',badge:null}],'every room photo in one strip, note photos badged');
 assert.equal(kitchen.large,capUrls[0],'the first measurement photo is shown large');
 assert.equal(kitchen.notesImages,0,'no photos repeated under the notes');assert(!kitchen.notesHeading,'no general Notes heading');
 [...roomNoteUrls,siteNoteUrl,sitePhotoUrl,capUrls[1],capUrls[2]].forEach((u,i)=>once(kitchen,u,'photo '+i));
 assert.equal(kitchen.roomNote,'Mind the pipe behind the sink','Room Note text');
 assert.equal(kitchen.notesText.includes('photo strip'),false,'no explanatory photo lines under the notes');
 assert(kitchen.siteGroupShown&&kitchen.siteNote==='Customer wants handles fitted last','Site Note text in its own group');
 assert(kitchen.measures.includes('Ceiling height')&&kitchen.measures.includes('2480'),'typed Site Measure measurements shown');
 assert.equal(kitchen.measureCount,'4','room measurements counted');
 noOverlap(kitchen,'laptop');

 // Clicking any thumbnail shows that photo large and marks it as selected.
 for(let i=0;i<kitchen.strip.length;i++){
  const r=await studio.evaluate(i=>{document.querySelector(`#siteRoomThumbs [data-site-thumb="${i}"]`).click();return {large:document.querySelector('#siteRoomReferenceFrame img').getAttribute('src'),active:[...document.querySelectorAll('#siteRoomThumbs .site-thumb')].map(x=>x.classList.contains('active'))}},i);
  assert.equal(r.large,kitchen.strip[i].src,'thumbnail '+i+' opens large');
  assert.deepEqual(r.active,kitchen.strip.map((_,j)=>j===i),'thumbnail '+i+' marked as selected');
 }

 const utility=await view('r2');
 assert.deepEqual(utility.strip.map(x=>x.kind),['photo','site-note','site'],'other room: its own photo plus the whole Site Measure photos, no Kitchen note photos');
 assert(!utility.strip.some(x=>roomNoteUrls.includes(x.src)),'Kitchen Room Note photos stay in the Kitchen');
 assert.equal(utility.roomNote,'No room note','a room without a note says so');
 assert.equal(utility.siteNote,'Customer wants handles fitted last','the Site Note follows the Site Measure into every room');
 assert.equal(utility.notesImages,0,'no photos under the notes in the other room either');

 // Phone-sized window: still no overlap, and the strip still one row.
 await studio.setViewportSize({width:390,height:844});
 noOverlap(await view('r1'),'phone');
 await studio.setViewportSize({width:1366,height:657});

 // Customer page: no separate Notes tab; Jobs / Designs, Site Measurements, Photos and Documents stay.
 const tabs=await studio.evaluate(()=>{closeSiteRoomDetails();const p=(0,eval)('state').projects.find(x=>x.id==='sn1');openCustomerCard(p.customerId);return new Promise(r=>setTimeout(()=>r([...document.querySelectorAll('.customer-card-tabs .customer-tab')].map(b=>b.dataset.tab||b.textContent.trim())),600))});
 assert(!tabs.includes('notes'),'no separate Notes tab');
 for(const k of ['jobs','site','photos','documents'])assert(tabs.includes(k),k+' tab kept');

 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({strip:kitchen.strip.map(x=>x.kind+(x.badge?'+badge':'')),roomNote:kitchen.roomNote,siteNote:kitchen.siteNote,tabs,ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
