// Site Measure notes, end to end. On Mobile a Room Note is written from the Measure screen and
// always belongs to the room being measured; the Whole Site Note on the Site Visit Summary
// belongs to the complete Site Measure. Studio shows a Room Note only when a room has one, and
// the Whole Site Note (with Access details) only when there is whole-site information.
// Real public Mobile and Studio loaders, separate browser profiles, fake cloud only.
const {chromium}=require('playwright');
const path=require('node:path'),assert=require('node:assert/strict');
const {createCloud,serve}=require('./helpers/fake-cloud.cjs');
const user={uid:'owner',companyId:'co',role:'company_owner',email:'owner@test',fitterId:'F1'};
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
 const studio=await open(await browser.newContext({viewport:{width:1366,height:657}}),'studio',process.env.STUDIO_PAGE||'/Studio.html');
 const mobile=await open(await browser.newContext({viewport:{width:390,height:844}}),'mobile',process.env.MOBILE_PAGE||'/Mobile.html');
 await mobile.evaluate(()=>{document.body.classList.remove('fiq-locked');document.querySelectorAll('#fiqAuthGate,.fiq-auth-gate').forEach(g=>g.style.display='none')});

 // Real photo files, each a different colour so every photo is its own file.
 const colours=['#c62828','#2e7d32','#1565c0','#f9a825','#6a1b9a','#00838f'];
 const files=(await mobile.evaluate(cs=>cs.map(c=>{const cv=document.createElement('canvas');cv.width=40;cv.height=30;const x=cv.getContext('2d');x.fillStyle=c;x.fillRect(0,0,40,30);return cv.toDataURL('image/png').split(',')[1]}),colours))
  .map((b64,i)=>({name:'photo'+i+'.png',mimeType:'image/png',buffer:Buffer.from(b64,'base64')}));

 // A Site Measure with access details, as typed on the New Site Job screen.
 await mobile.evaluate(()=>{
  const st=(0,eval)('state');
  st.projects.push({id:'nm1',name:'Note Measure',customer:'Nina Notes',address:'4 Oak Row',accessNotes:'',rooms:[],cabinets:[],siteMeasurements:[],sitePhotos:[],measureCaptures:[],jobLog:[]});
  st.currentProject='nm1';st.currentRoom=null;save();
  const a=document.getElementById('nsjAccessNotes');a.value='Gate code 4321, park at the back';a.dispatchEvent(new Event('input',{bubbles:true}));
 });
 const startRoom=(name,icon)=>mobile.evaluate(([name,icon])=>{const st=(0,eval)('state');const p=st.projects.find(x=>x.id==='nm1');st.currentRoom=null;const r=ensureCurrentRoomExists(p);r.name=name;r.icon=icon;save();show('measure');renderMeasureCurrentRoomLabel();return r.id},[name,icon]);
 const addPicture=async file=>{await mobile.setInputFiles('#markupCameraPhoto',file);await until(()=>mobile.evaluate(()=>{const st=(0,eval)('state');const r=st.projects.find(x=>x.id==='nm1').rooms.find(x=>x.id===st.currentRoom);return r&&(r.measureCaptures||[]).length}),'measurement photo saved')};

 // Kitchen: a measurement photo, then a Room Note with text and two photos from the Measure screen.
 const kitchenId=await startRoom('Kitchen','🍳');
 await addPicture(files[0]);
 assert(await mobile.isVisible('#openRoomNote'),'Room Note button is on the Measure screen');
 await mobile.click('#openRoomNote');
 assert.equal(await mobile.textContent('#roomNoteTitle'),'Kitchen Note','the window names the room');
 await mobile.fill('#roomNoteText','Pipe behind the sink');
 await mobile.setInputFiles('#roomNotePhotoInput',[files[1],files[2]]);
 await until(()=>mobile.evaluate(()=>document.querySelectorAll('#roomNotePhotoGrid img').length===2),'two Room Note photos');
 await mobile.click('#roomNoteClose');
 assert.equal((await mobile.textContent('#openRoomNote')).replace(/\s+/g,''),'📝RoomNote(3)','the button shows the note is there');
 await mobile.click('#saveMeasureToRoom');
 await until(()=>mobile.evaluate(()=>document.querySelector('section.screen.active')?.id==='siteVisitSummary'),'back on the summary');

 // TV Wall: measurement photo only, no note.
 const tvId=await startRoom('TV Wall','📺');
 await addPicture(files[3]);
 await mobile.click('#openRoomNote');
 assert.equal(await mobile.textContent('#roomNoteTitle'),'TV Wall Note','the window follows the room being measured');
 assert.equal(await mobile.inputValue('#roomNoteText'),'','the Kitchen note does not show in the TV Wall');
 await mobile.click('#roomNoteClose');
 await mobile.click('#saveMeasureToRoom');
 await until(()=>mobile.evaluate(()=>document.querySelector('section.screen.active')?.id==='siteVisitSummary'),'back on the summary');

 // Summary: the note marker shows on the Kitchen only; the Whole Site Note is set apart.
 const summary=await mobile.evaluate(()=>({rows:[...document.querySelectorAll('#svsRoomList .svs-room-row')].map(b=>({name:b.querySelector('b').textContent,note:!!b.querySelector('.svs-room-note')})),
  whole:document.getElementById('measureNotesRow').innerText.replace(/\s+/g,' ').trim()}));
 assert.deepEqual(summary.rows.sort((a,b)=>a.name.localeCompare(b.name)),[{name:'Kitchen',note:true},{name:'TV Wall',note:false}],'note marker only on the room with a Room Note');
 assert(summary.whole.startsWith('📋 Whole Site Note For the complete Site Measure, not one room'),'Whole Site Note button says what it is for: '+summary.whole);

 // Whole Site Note with text and one photo.
 await mobile.click('#measureNotesRow');
 assert.equal(await mobile.textContent('#notesBoardTitle'),'Whole Site Note');
 await mobile.fill('#notesBoardText','Customer away on Fridays');
 await mobile.setInputFiles('#notesPhotoInput',files[4]);
 await until(()=>mobile.evaluate(()=>document.querySelectorAll('#notesPhotoGrid img').length===1),'Whole Site Note photo');
 await mobile.click('#notesBoardClose');

 const local=await mobile.evaluate(([k,tv])=>{const p=(0,eval)('state').projects.find(x=>x.id==='nm1');const r=id=>p.rooms.find(x=>x.id===id);return {kitchen:{notes:r(k).notes,photos:r(k).notePhotos.length},tv:{notes:r(tv).notes||'',photos:(r(tv).notePhotos||[]).length},siteNotes:p.siteNotes,sitePhotos:p.siteNotePhotos.length,access:p.accessNotes}},[kitchenId,tvId]);
 assert.deepEqual(local,{kitchen:{notes:'Pipe behind the sink',photos:2},tv:{notes:'',photos:0},siteNotes:'Customer away on Fridays',sitePhotos:1,access:'Gate code 4321, park at the back'},'saved on the right room and on the Site Measure');

 // Send to Studio.
 await mobile.evaluate(async()=>{await exportJob('nm1',true)});
 const doc='companies/co/jobs/mobile-nm1-owner';
 await until(()=>cloud.docs.get(doc),'Site Measure message');
 const sent=cloud.docs.get(doc).project;
 const kSent=sent.rooms.find(r=>r.id===kitchenId);
 const roomNoteUrls=kSent.notePhotos.map(x=>x.data),siteNoteUrl=sent.siteNotePhotos[0].data;
 assert(roomNoteUrls.length===2&&roomNoteUrls.every(u=>/^https:\/\/storage\.test\//.test(u))&&/^https:\/\/storage\.test\//.test(siteNoteUrl),'note photos travel as stored files');
 await until(()=>studio.evaluate(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='nm1');return p&&p.rooms.length===2&&(p.siteNotePhotos||[]).length}),'Site Measure in Studio');

 const view=roomId=>studio.evaluate(([pid,rid])=>{
  openSiteRoomDetails(pid,rid);
  const shown=id=>{const e=document.getElementById(id);return !!e&&!e.hidden&&e.getClientRects().length>0};
  return {room:shown('siteRoomNoteGroup'),roomText:document.getElementById('siteRoomNotes').textContent,
   site:shown('siteJobNoteGroup'),siteText:document.getElementById('siteJobNotes').textContent,access:document.getElementById('siteJobAccess').innerText.replace(/\s+/g,' ').trim(),
   box:shown('siteNotesBoxProbe')||!!document.querySelector('.site-notes-box:not([hidden])'),
   strip:[...document.querySelectorAll('#siteRoomThumbs [data-site-thumb]')].map(x=>({src:x.querySelector('img').getAttribute('src'),kind:x.dataset.thumbKind,badge:!!x.querySelector('.site-thumb-badge')})),
   text:document.getElementById('siteRoomDetailsModal').innerText};
 },[roomId.pid||'nm1',roomId.rid||roomId]);

 const kitchen=await view(kitchenId);
 assert(kitchen.room&&kitchen.roomText==='Pipe behind the sink','Kitchen shows its Room Note');
 assert.deepEqual(kitchen.strip.filter(x=>x.kind==='room-note').map(x=>x.src),roomNoteUrls,'both Room Note photos in the Kitchen strip');
 assert(kitchen.strip.filter(x=>x.kind==='room-note').every(x=>x.badge),'Room Note photos badged');
 assert(kitchen.site&&kitchen.siteText==='Customer away on Fridays','Whole Site Note text');
 assert.equal(kitchen.access,'Access details Gate code 4321, park at the back','Access details shown with a label');
 assert.deepEqual(kitchen.strip.filter(x=>x.kind==='site-note').map(x=>x.src),[siteNoteUrl],'Whole Site Note photo in the strip');
 assert(/WHOLE SITE NOTE/i.test(kitchen.text),'section is called Whole Site Note');

 const tv=await view(tvId);
 assert(!tv.room,'a room without a Room Note shows no Room Note section');
 assert(!/No room note/i.test(tv.text),'no "No room note" text');
 assert(!tv.strip.some(x=>roomNoteUrls.includes(x.src)),'Kitchen Room Note photos stay in the Kitchen');
 assert(tv.site&&tv.siteText==='Customer away on Fridays'&&tv.access.includes('Gate code 4321'),'the Whole Site Note shows in every room');

 // Existing jobs keep displaying as before, and empty sections stay hidden.
 await studio.evaluate(()=>{
  const st=(0,eval)('state');
  st.projects.push({id:'old1',name:'Old Site Job',customer:'Olga Old',rooms:[{id:'o1',name:'Hall',notes:'',measureCaptures:[{id:'oc',image:'data:image/png;base64,iVBORw0KGgo=',marks:[]}],notePhotos:[]}],cabinets:[],jobLog:[],
   siteNotes:'Old whole site note',siteNotePhotos:[],notes:'',siteMeasurements:[{id:'sm',area:'Hall',name:'Ceiling height',value:'2480',note:''}]});
  st.projects.push({id:'bare1',name:'Bare Site Job',customer:'Ben Bare',rooms:[{id:'b1',name:'Loft',notes:'',measureCaptures:[{id:'bc',image:'data:image/png;base64,iVBORw0KGgo=',marks:[]}],notePhotos:[]}],cabinets:[],jobLog:[]});
 });
 const old=await view({pid:'old1',rid:'o1'});
 assert(!old.room&&old.site&&old.siteText==='Old whole site note'&&old.text.includes('Ceiling height'),'an old job keeps its Site Note and typed measurements as Site Note');
 assert.equal(old.access,'','no Access label when there are no access details');
 const bare=await view({pid:'bare1',rid:'b1'});
 assert(!bare.room&&!bare.site&&!bare.box,'a room with no notes and no whole-site information shows no note sections at all');

 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({summary,kitchen:{room:kitchen.roomText,site:kitchen.siteText,access:kitchen.access,strip:kitchen.strip.map(x=>x.kind+(x.badge?'+badge':''))},tvRoomNoteShown:tv.room,ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
