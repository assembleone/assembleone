// Site Measure: "Received in Studio" only from Studio's own complete receipt, and photos
// removed from the phone only by hand. Real Studio and Mobile loaders in separate browser
// profiles over the fake cloud (tests/helpers/fake-cloud.cjs), Mobile driven through its
// own Send to Studio button and Delete photos button:
//  1. signal drops mid-upload: some photos reach storage, no message is written, the
//     phone says it will send automatically, never Received;
//  2. Mobile reloads with signal back: the queued send goes by itself; with Studio closed
//     the phone shows Waiting for confirmation;
//  3. an incomplete receipt is never shown as Received and triggers a resend;
//  4. Studio opens: it saves the Site Measure and confirms every photo, measurement and
//     note -> "Received in Studio · 6 of 6 photos received" + Delete photos button;
//  5. changing the job after sending withdraws Received and the Delete button; sending
//     again (same single message) is confirmed again;
//  6. Delete photos: Cancel keeps everything; OK removes only the phone's copies (Studio
//     and cloud copies, measurements, notes and the job stay), also after a reload;
//  7. a resend after removal is still complete; Studio's Accept never downgrades it.
const {chromium}=require('playwright');
const path=require('node:path'),assert=require('node:assert/strict');
const {createCloud,serve}=require('./helpers/fake-cloud.cjs');
const JOBS='companies/co/jobs/';
const user={uid:'owner',companyId:'co',role:'company_owner',email:'owner@test',fitterId:'F1'};
const pic=(tag,n=6000)=>'data:image/jpeg;base64,'+(tag+'A'.repeat(n)).slice(0,n);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label,ms=20000){const end=Date.now()+ms;let last;while(Date.now()<end){try{last=await fn();if(last)return last}catch(e){last=e}await wait(200)}throw new Error('Timed out: '+label+(last instanceof Error?' ('+last.message+')':' (last: '+JSON.stringify(last)+')'))}
(async()=>{
 const served=await serve(path.resolve(__dirname,'..')),server=served.server,base=process.env.LIVE_BASE||served.base;
 const site=process.env.LIVE_BASE?process.env.LIVE_BASE.replace(/\/beta$/,'')+'/':'http://127.0.0.1';
 const cloud=createCloud();let browser;
 try{
 browser=await chromium.launch({headless:true});
 const errors=[],dialogs=[];let confirmAnswer=true;
 async function open(ctx,client,url){
  const page=await ctx.newPage();
  page.on('pageerror',e=>errors.push(client+': '+e.message));
  page.on('dialog',d=>{dialogs.push(client+': '+d.message());if(d.type()==='confirm'&&!confirmAnswer)d.dismiss();else d.accept()});
  await page.route(u=>!String(u).startsWith(site),r=>r.abort());
  await cloud.attach(page,client,user);
  await page.goto(base+url);
  await page.waitForFunction(()=>document.readyState==='complete'&&typeof save==='function'&&(typeof exportJob==='function'||typeof exportProjectToMobile==='function')&&typeof (0,eval)('typeof state!=="undefined"&&state')==='object');
  await page.waitForTimeout(500);
  if(client==='mobile')await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});
  return page;
 }
 const studioCtx=await browser.newContext(),mobileCtx=await browser.newContext();
 let mobile=await open(mobileCtx,'mobile','/Mobile.html');
 const M=(fn,a)=>mobile.evaluate(fn,a);
 const DOC=JOBS+'mobile-sm1-owner';

 // A Site Measure with 6 photos across 2 rooms, a room note, the whole-site note and marks.
 await M(p=>{
  const st=(0,eval)('state');
  st.projects.push({id:'sm1',name:'Loft conversion',customer:'Sara Site',address:'9 High St',siteNotes:'Parking behind the house',
   siteNotePhotos:[{id:'snp1',data:p.a}],sitePhotos:[{id:'sp1',data:p.b}],siteMeasurements:[],cabinets:[],
   rooms:[{id:'r1',name:'Bedroom',notes:'Sloped ceiling on the left',notePhotos:[{id:'rnp1',data:p.c}],beforePhotos:[{id:'bp1',data:p.d}],measureCaptures:[{id:'cap1',image:p.e,marks:[{id:'m1',value:2400},{id:'m2',value:1200}]}]},
          {id:'r2',name:'Landing',notes:'',notePhotos:[],beforePhotos:[],measureCaptures:[{id:'cap2',image:p.f,marks:[{id:'m3',value:900}]}]}]});
  st.currentProject='sm1';save();show('siteVisitSummary');renderSendBar();
 },{a:pic('snp1'),b:pic('sp1'),c:pic('rnp1'),d:pic('bp1'),e:pic('cap1'),f:pic('cap2')});
 await mobile.waitForTimeout(700);// let the photos reach the phone's own storage
 const bar=()=>M(()=>{const b=document.getElementById('measureSendBar');return {text:b.innerText.replace(/\s+/g,' '),del:!!b.querySelector('[data-delete-device-photos]')}});
 const send=async()=>{await M(()=>{show('siteVisitSummary');renderSendBar()});await mobile.locator('#sendAllRoomsBtn').click()};

 // 1. Signal drops after 2 of 6 photos are uploaded.
 await M(()=>{const fns=window.fiqStorageFns,orig=fns.uploadString;window.__uploads=0;fns.uploadString=async(r,v,f)=>{if(++window.__uploads>2)throw new Error('network-request-failed');return orig(r,v,f)}});
 await send();
 await until(()=>bar().then(b=>/No signal — will send automatically/.test(b.text)&&b),'queued after dropped signal');
 assert.equal(cloud.docs.get(DOC),undefined,'no Site Measure message is written from a partial upload');
 assert.ok([...cloud.files.keys()].some(k=>k.includes('/jobs/sm1/')),'some photos did reach storage before the signal dropped');
 let b=await bar();assert.ok(!/Received/.test(b.text)&&!b.del,'never Received, no delete: '+b.text);
 assert.ok(dialogs.some(d=>/No signal right now/.test(d)),'the fitter is told it will send by itself');

 // 2. Reload Mobile with signal back; Studio is not open: Waiting for confirmation.
 await mobile.close();mobile=await open(mobileCtx,'mobile','/Mobile.html');
 await M(()=>{state.currentProject='sm1';show('siteVisitSummary');renderSendBar()});
 await until(()=>cloud.docs.get(DOC),'queued send goes by itself after reload');
 await until(()=>M(()=>{renderSendBar();return true}).then(()=>bar()).then(b=>/Waiting for confirmation…/.test(b.text)),'waiting for Studio');
 b=await bar();assert.ok(!b.del,'no delete while waiting');
 assert.equal(cloud.docs.get(DOC).status,'waiting');assert.equal(cloud.docs.get(DOC).receipt,undefined);

 // 3. An incomplete receipt (Studio missing a photo) is never Received and is sent again.
 const t1=cloud.docs.get(DOC).transferManifest.transferId;
 await cloud.writeAs('studio',DOC,{...cloud.docs.get(DOC),receipt:{transferId:t1,complete:false,photosExpected:6,photosReceived:5,missing:['room-photo|r1|bp1'],checkedAt:new Date().toISOString(),photoUrls:{}}});
 await until(()=>bar().then(b=>/did not receive everything/.test(b.text)||/Waiting for confirmation|Sending/.test(b.text)&&cloud.docs.get(DOC).transferManifest.transferId!==t1),'incomplete handled');
 b=await bar();assert.ok(!/Received in Studio/.test(b.text)&&!b.del,'incomplete is not Received: '+b.text);
 await until(()=>cloud.docs.get(DOC).transferManifest.transferId!==t1,'sent again automatically after an incomplete receipt');

 // 4. Studio opens and saves it: complete receipt, Received in Studio, 6 of 6 photos.
 let studio=await open(studioCtx,'studio','/Studio.html');
 await until(()=>bar().then(b=>/✓ Received in Studio/.test(b.text)&&b),'Received in Studio');
 b=await bar();
 assert.match(b.text,/✓ Received in Studio 6 of 6 photos received/);assert.ok(b.del,'Delete photos offered');
 const rc=cloud.docs.get(DOC).receipt;
 assert.deepEqual([rc.complete,rc.photosExpected,rc.photosReceived,rc.rooms,rc.measurements,rc.notes,cloud.docs.get(DOC).status],[true,6,6,2,3,4,'waiting'],'Studio receipt: everything, acceptance still pending');
 assert.equal(Object.keys(rc.photoUrls).length,6);
 const studioHas=await studio.evaluate(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='sm1');return p&&[p.siteNotes,p.rooms[0].notes,p.rooms[0].measureCaptures[0].marks.length,p.rooms[0].beforePhotos[0].data.startsWith('https://')]});
 assert.deepEqual(studioHas,['Parking behind the house','Sloped ceiling on the left',2,true],'Studio really holds it');

 // 5. Change after sending: no longer Received, no Delete. Send again: one message, confirmed.
 await M(p=>{const x=(0,eval)('state').projects.find(y=>y.id==='sm1');x.sitePhotos.push({id:'sp2',data:p});save();renderSendBar()},pic('sp2'));
 b=await bar();assert.match(b.text,/Changed since last send/);assert.ok(!b.del,'no delete for a changed job');
 await send();
 await until(()=>bar().then(b=>/✓ Received in Studio 7 of 7 photos received/.test(b.text)),'second send confirmed');
 assert.equal([...cloud.docs.keys()].filter(k=>k.startsWith(JOBS+'mobile-sm1')).length,1,'repeated sends keep one message');

 // 6. Delete photos: Cancel first, then OK.
 const blobs=()=>M(async()=>{const ids=['snp1','sp1','sp2','rnp1','bp1','cap1','cap2'];return Promise.all(ids.map(id=>getPhotoBlob(id).then(x=>!!x)))});
 assert.deepEqual(await blobs(),Array(7).fill(true),'all 7 photos stored on the phone');
 confirmAnswer=false;await mobile.locator('#measureSendBar [data-delete-device-photos]').click();await mobile.waitForTimeout(300);
 assert.ok(dialogs.includes('mobile: 7 photos will be removed from this device. They have been received in Studio.'),'confirmation text');
 assert.deepEqual(await blobs(),Array(7).fill(true),'Cancel keeps every photo');
 confirmAnswer=true;await mobile.locator('#measureSendBar [data-delete-device-photos]').click();await mobile.waitForTimeout(500);
 assert.deepEqual(await blobs(),Array(7).fill(false),'OK removes the phone copies');
 const local=()=>M(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='sm1');const all=[...p.sitePhotos.map(x=>x.data),p.siteNotePhotos[0].data,p.rooms[0].notePhotos[0].data,p.rooms[0].beforePhotos[0].data,p.rooms[0].measureCaptures[0].image,p.rooms[1].measureCaptures[0].image];
  return {cloud:all.every(v=>/^https:\/\/storage\.test\//.test(v)),n:all.length,marks:p.rooms[0].measureCaptures[0].marks.length+p.rooms[1].measureCaptures[0].marks.length,notes:[p.siteNotes,p.rooms[0].notes],rooms:p.rooms.length}});
 assert.deepEqual(await local(),{cloud:true,n:7,marks:3,notes:['Parking behind the house','Sloped ceiling on the left'],rooms:2},'job, measurements and notes stay; photos point to the Studio copies');
 b=await bar();assert.match(b.text,/7 of 7 photos received · removed from this device/);assert.ok(!b.del);
 assert.equal([...cloud.files.keys()].filter(k=>k.includes('/jobs/sm1/')).length>=7,true,'cloud copies untouched');
 assert.equal(await studio.evaluate(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='sm1');return [...p.sitePhotos,...p.rooms[0].beforePhotos].every(x=>x.data.startsWith('https://'))&&p.sitePhotos.length}),2,'Studio copies untouched');
 // Reload: still removed, still Received.
 await mobile.close();mobile=await open(mobileCtx,'mobile','/Mobile.html');
 await M(()=>{state.currentProject='sm1';show('siteVisitSummary');renderSendBar()});
 assert.deepEqual(await local(),{cloud:true,n:7,marks:3,notes:['Parking behind the house','Sloped ceiling on the left'],rooms:2},'after reload');
 b=await bar();assert.match(b.text,/✓ Received in Studio 7 of 7 photos received · removed from this device/);

 // 7. Resend after removal is still complete; Studio accepting never downgrades it.
 await send();
 await until(()=>bar().then(b=>/✓ Received in Studio 7 of 7 photos received/.test(b.text)&&cloud.docs.get(DOC).receipt.transferId===cloud.docs.get(DOC).transferManifest.transferId),'resend after removal confirmed');
 await studio.evaluate(async()=>{const packs=await studioInboxPackets();const pk=packs.find(x=>(x.project||{}).id==='sm1');if(pk)await applyOneSitePacket(pk,true)});
 await until(()=>cloud.docs.get(DOC).status==='received','accepted in Studio');
 await until(()=>M(()=>(0,eval)('state').projects.find(x=>x.id==='sm1').mobileArchived),'phone sees the acceptance');
 const final=await M(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='sm1');return studioSyncStatus(p).label});
 assert.equal(final,'✓ Received in Studio','acceptance keeps Received in Studio');

 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true,dialogs:dialogs.length}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
