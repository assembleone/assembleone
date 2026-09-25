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
 const studio=await open(await browser.newContext(),'studio','/Studio.html');
 const mobile=await open(await browser.newContext(),'mobile','/Mobile.html');

 // Two rooms. Room 1 has a room note with a photo; the whole Site Job has a Site Note with a photo.
 await mobile.evaluate(async({cap,roomNote,siteNote})=>{
  const st=(0,eval)('state');
  st.projects.push({id:'sn1',name:'Note Job',customer:'Nora Note',address:'3 Mill Lane',
   rooms:[
    {id:'r1',name:'Kitchen',location:'Ground',notes:'Mind the pipe behind the sink',measureCaptures:[{id:'cap1',image:cap,marks:[{id:'m1',type:'measure',value:900},{id:'m2',type:'measure',value:600}]}],beforePhotos:[],notePhotos:[{id:'np1',data:roomNote,takenAt:new Date().toISOString()}]},
    {id:'r2',name:'Utility',location:'Ground',notes:'',measureCaptures:[{id:'cap2',image:cap,marks:[{id:'m3',type:'measure',value:500},{id:'m4',type:'measure',value:400}]}],beforePhotos:[],notePhotos:[]}],
   cabinets:[],sitePhotos:[],siteMeasurements:[],jobLog:[],
   siteNotes:'Customer wants handles fitted last',siteNotePhotos:[{id:'snp1',data:siteNote,takenAt:new Date().toISOString()}]});
  save();await exportJob('sn1',true);
 },{cap:pic('cap'),roomNote:pic('room-note'),siteNote:pic('site-note')});

 const doc='companies/co/jobs/mobile-sn1-owner';
 await until(()=>cloud.docs.get(doc),'site measure message');
 const sent=cloud.docs.get(doc).project;
 const roomNoteUrl=sent.rooms[0].notePhotos[0].data,siteNoteUrl=sent.siteNotePhotos[0].data;
 assert(/^https:\/\/storage\.test\//.test(roomNoteUrl)&&/^https:\/\/storage\.test\//.test(siteNoteUrl),'note photos travel as stored files under data');

 await until(()=>studio.evaluate(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='sn1');return p&&(p.siteNotePhotos||[]).length&&p.rooms.length===2}),'site measure in Studio');

 const view=async roomId=>studio.evaluate(rid=>{
  openSiteRoomDetails('sn1',rid);
  return {notes:document.getElementById('siteRoomNotes').textContent,
   photos:[...document.querySelectorAll('#siteRoomNotePhotos img')].map(i=>i.getAttribute('src'))};
 },roomId);

 const kitchen=await view('r1');
 assert(kitchen.notes.includes('Mind the pipe behind the sink')&&kitchen.notes.includes('Customer wants handles fitted last'),'note text shown');
 assert.deepEqual(kitchen.photos.sort(),[roomNoteUrl,siteNoteUrl].sort(),'room note photo and Site Note photo shown with the note');

 const utility=await view('r2');
 assert(utility.notes.includes('Customer wants handles fitted last'),'Site Note text follows the Site Job into the other room');
 assert.deepEqual(utility.photos,[siteNoteUrl],'Site Note photo follows it, and the Kitchen room photo does not');

 // Clicking a note photo opens it in the big picture frame.
 await studio.evaluate(()=>{openSiteRoomDetails('sn1','r2');document.querySelector('#siteRoomNotePhotos img').click()});
 assert.equal(await studio.evaluate(()=>document.querySelector('#siteRoomReferenceFrame img').getAttribute('src')),siteNoteUrl,'note photo opens large');

 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({kitchen,utility,ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
