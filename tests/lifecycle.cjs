// Data lifecycle, end to end: the real public Studio and Mobile loaders, in separate browser
// profiles, talking only through a Firebase-like fake cloud (tests/helpers/fake-cloud.cjs).
// Covers Site Measure arrival and waiting, Job Overview live sync both ways (Panel Check,
// missing, damaged, notes, photos), one message per job, updates arriving mid-merge, Studio
// refresh with unprocessed updates, Move to Customer Library going quiet, opening a Library
// job, Delete Job going quiet without deleting anything, and photo uploads happening once.
const {chromium}=require('playwright');
const path=require('node:path'),assert=require('node:assert/strict');
const {createCloud,serve}=require('./helpers/fake-cloud.cjs');
const JOBS='companies/co/jobs/';
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
  // Wait until every script of the loader has run, not just the first one.
  await page.waitForFunction(()=>document.readyState==='complete'&&typeof save==='function'&&(typeof exportJob==='function'||typeof exportProjectToMobile==='function')&&typeof (0,eval)('typeof state!=="undefined"&&state')==='object');
  await page.waitForTimeout(500);
  return page;
 }
 const studioCtx=await browser.newContext(),mobileCtx=await browser.newContext();
 let studio=await open(studioCtx,'studio','/Studio.html');
 const mobile=await open(mobileCtx,'mobile','/Mobile.html');
 const S=fn=>studio.evaluate(fn),M=fn=>mobile.evaluate(fn);
 const docsOf=(kind,pid)=>[...cloud.docs.entries()].filter(([p,d])=>d.kind===kind&&(d.project&&d.project.id)===pid);

 // 1. A new Site Measure travels Mobile -> Studio and waits for acceptance.
 await mobile.evaluate(async({a,b})=>{
  const st=(0,eval)('state');
  st.projects.push({id:'site1',name:'New Site Job',customer:'Bob Site',address:'2 Low Road',rooms:[{id:'sr1',name:'Bathroom',location:'Ground',notes:'Tiles to ceiling',measureCaptures:[{id:'cap1',image:a,marks:[{id:'m1',value:1200}]}],beforePhotos:[{id:'bp1',data:b}],notePhotos:[]}],cabinets:[],sitePhotos:[],siteMeasurements:[],jobLog:[]});
  save();await exportJob('site1',true);
 },{a:pic('site-cap'),b:pic('site-before')});
 const siteDoc=JOBS+'mobile-site1-owner';
 await until(()=>cloud.docs.get(siteDoc),'site measure message');
 assert.equal(cloud.docs.get(siteDoc).status,'waiting');
 await until(()=>S(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='site1');return p&&p.siteMeasureAwaitingAcceptance}),'site measure in Studio awaiting acceptance');
 assert(JSON.stringify(cloud.docs.get(siteDoc).project).includes('https://storage.test/'),'site photos travel as stored files');
 // A second send of the same Site Measure replaces the message instead of adding one.
 await M(async()=>{const p=(0,eval)('state').projects.find(x=>x.id==='site1');p.rooms[0].notes='Tiles to ceiling, grey grout';save();await exportJob('site1',true)});
 await until(()=>S(()=>((0,eval)('state').projects.find(x=>x.id==='site1').rooms[0].notes||'').includes('grey grout')),'site measure update');
 assert.equal(docsOf('siteJobPacket','site1').length,1,'one message per Site Measure, however often it is sent');
 assert.equal(cloud.docs.get(siteDoc).status,'waiting','still waiting for the owner');

 // 2. Refresh Studio: the waiting Site Measure is still there and still waiting.
 await studio.close();studio=await open(studioCtx,'studio','/Studio.html');
 await until(()=>S(()=>!!(0,eval)('state').projects.find(x=>x.id==='site1'&&x.siteMeasureAwaitingAcceptance)),'site measure survives refresh');
 assert.equal(cloud.docs.get(siteDoc).status,'waiting');

 // 3. A Job Overview job goes Studio -> Mobile as one live message per job.
 await S(async()=>{
  const drawing='data:image/png;base64,'+'D'.repeat(12000);
  const part=(id,code,name,qty)=>{const p={id,code,name,length:700,width:500,thickness:18,qty,material:'Oak',edgeLong:1,edgeShort:0,notes:'',status:'ready',x:20,y:20,copies:[]};p.reviewSignature=window.panelReviewSignature(p);return p};
  const st=(0,eval)('state');
  st.projects.push({id:'job1',name:'Kitchen job',customer:'Anna Live',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'c1',roomId:'r1',name:'Kitchen',drawing,parts:[part('pa','P-001','Side',1),part('pb','P-002','Shelf',2),part('pc','P-003','Top',1)]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));save();
  await exportProjectToMobile(st.projects.find(x=>x.id==='job1'));
 });
 const liveDoc=JOBS+'studio-job-job1';
 await until(()=>cloud.docs.get(liveDoc),'live job message');
 assert.equal(cloud.docs.get(liveDoc).active,true);
 await until(()=>M(()=>!!(0,eval)('state').projects.find(x=>x.id==='job1')),'job reaches Mobile');
 assert.equal(await M(()=>(0,eval)('state').projects.find(x=>x.id==='job1').cabinets[0].parts.length),3,'Cutting List reaches Mobile');
 const uploadsAfterFirstSend=cloud.snapshot('studio').uploads;
 await S(async()=>{const p=(0,eval)('state').projects.find(x=>x.id==='job1');p.cabinets[0].parts[0].notes='Grain up';p.cabinets[0].parts[0].reviewSignature=window.panelReviewSignature(p.cabinets[0].parts[0]);save();await exportProjectToMobile(p)});
 await until(()=>M(()=>(0,eval)('state').projects.find(x=>x.id==='job1').cabinets[0].parts[0].notes==='Grain up'),'resend reaches Mobile');
 assert.equal([...cloud.docs.keys()].filter(k=>k.startsWith(JOBS+'studio-')&&!k.startsWith(JOBS+'studio-job-')&&(cloud.docs.get(k).project||{}).id==='job1').length,0,'no one-off message per send for jobs');
 assert.equal(cloud.snapshot('studio').uploads,uploadsAfterFirstSend,'the unchanged drawing is not uploaded again');

 // 4. Mobile updates to the live job return to Studio: Panel Check, damaged with photo,
 // missing, and a note with a photo. Several sends still leave one message.
 await mobile.evaluate(async({dp,np})=>{
  const p=(0,eval)('state').projects.find(x=>x.id==='job1');const [a,b,c]=p.cabinets[0].parts;const now=Date.now();
  a.scannedQty=1;a.lastScannedAt=new Date(now).toISOString();save();await exportJob('job1',true);
  b.status='damaged';b.damagedQty=1;b.damageNote='Chipped edge';b.statusUpdatedAt=now+1;b.panelPhotos=[{id:'dph',data:dp}];save();await exportJob('job1',true);
  c.status='missing';c.statusUpdatedAt=now+2;p.jobLog.push({id:'n1',author:'Fitter',at:now+3,text:'Hinge loose',photos:[np],roomId:'r1'});save();await exportJob('job1',true);
 },{dp:pic('damage'),np:pic('note')});
 await until(()=>S(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='job1');return p.jobLog.some(n=>n.id==='n1')&&p.cabinets[0].parts[2].status==='missing'}),'Mobile updates reach Studio');
 const back=await S(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='job1');const [a,b,c]=p.cabinets[0].parts;return {scanned:a.scannedQty,dmg:b.status,dmgNote:b.damageNote,dmgPhoto:(b.panelPhotos||[])[0],missing:c.status,note:p.jobLog.find(n=>n.id==='n1')}});
 assert.equal(back.scanned,1);assert.equal(back.dmg,'damaged');assert.equal(back.dmgNote,'Chipped edge');assert.equal(back.missing,'missing');
 assert(JSON.stringify(back.dmgPhoto).includes('https://storage.test/'),'damage photo arrives as a stored file');
 assert(back.note.photos[0].startsWith('https://storage.test/'),'note photo arrives as a stored file');
 assert.equal(docsOf('siteJobPacket','job1').length,1,'three sends, one message');
 await until(()=>cloud.docs.get(JOBS+'mobile-job1-owner').status==='received','Studio confirms the newest version');
 const mobileUploads=cloud.snapshot('mobile').uploads;
 await M(async()=>{await exportJob('job1',true)});
 assert.equal(cloud.snapshot('mobile').uploads,mobileUploads,'resending the same photos uploads nothing');
 await until(()=>cloud.docs.get(JOBS+'mobile-job1-owner').status==='received','resend confirmed');

 // 5. An update that lands while Studio is merging the previous one is not lost: the phone
 // overwrites the message between Studio's merge and its receipt.
 const racePath=JOBS+'mobile-job1-owner';
 // The hook runs a real phone send at the exact moment Studio checks the version it merged.
 cloud.hooks.push({op:'getDoc',match:(p,c)=>c==='studio'&&p===racePath,run:()=>M(async()=>{const p=(0,eval)('state').projects.find(x=>x.id==='job1');p.jobLog.push({id:'race',author:'Fitter',at:Date.now(),text:'Sent while Studio was busy',photos:[],roomId:'r1'});save();await exportJob('job1',true)})});
 await M(async()=>{const p=(0,eval)('state').projects.find(x=>x.id==='job1');p.jobLog.push({id:'n2',author:'Fitter',at:Date.now(),text:'Second note',photos:[],roomId:'r1'});save();await exportJob('job1',true)});
 await until(()=>S(()=>{const l=(0,eval)('state').projects.find(x=>x.id==='job1').jobLog;return l.some(n=>n.id==='n2')&&l.some(n=>n.id==='race')}),'both updates merged');
 await until(()=>cloud.docs.get(racePath).status==='received','the newer version confirmed after it was merged');

 // 6. Studio closed while the phone sends: nothing is lost after reopening.
 await studio.close();
 await M(async()=>{const p=(0,eval)('state').projects.find(x=>x.id==='job1');p.jobLog.push({id:'offline',author:'Fitter',at:Date.now(),text:'Sent while Studio was closed',photos:[],roomId:'r1'});save();await exportJob('job1',true)});
 assert.equal(cloud.docs.get(racePath).status,'waiting');
 studio=await open(studioCtx,'studio','/Studio.html');
 await until(()=>S(()=>(0,eval)('state').projects.find(x=>x.id==='job1').jobLog.some(n=>n.id==='offline')),'update sent while Studio was closed arrives after reopening');

 // 7. Move to Customer Library: the job goes quiet for Mobile. Nothing is deleted.
 const docCount=cloud.docs.size,fileCount=cloud.files.size;
 await S(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='job1');p.rooms[0].mobileJobCompleted=true;save();show('jobs');renderAll()});
 await studio.evaluate(()=>{const b=document.querySelector('[data-finish-overview-job="job1"]');b.disabled=false;b.click()});
 await until(()=>cloud.docs.get(liveDoc).active===false,'job switched off for Mobile');
 assert.equal(cloud.docs.get(liveDoc).activeChangedReason,'library');
 assert(cloud.docs.size>=docCount,'nothing deleted');assert.equal(cloud.files.size,fileCount,'no files deleted');
 await until(()=>M(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='job1');return p&&(p.mobileMovedToLibraryAt||p.rooms.some(r=>r.mobileMovedToLibraryAt))}),'Mobile takes the job off its list');

 // 8. Quiet: over 35 seconds nothing is read or written for the Library job.
 await wait(1500);
 const s0=cloud.snapshot('studio'),m0=cloud.snapshot('mobile');
 await wait(35000);
 const sQuiet=cloud.diff(s0,cloud.snapshot('studio')),mQuiet=cloud.diff(m0,cloud.snapshot('mobile'));
 console.log('idle 35s  studio',JSON.stringify(sQuiet),' mobile',JSON.stringify(mQuiet));
 assert.equal(sQuiet.writes,0,'Studio writes nothing while idle');assert.equal(mQuiet.writes,0,'Mobile writes nothing while idle');
 assert.equal(sQuiet.bytesDown,0,'Studio downloads nothing while idle');assert.equal(mQuiet.bytesDown,0,'Mobile downloads nothing while idle');

 // 9. Opening the Library job reads it from Studio only, with everything intact, and does
 // not make it live again.
 const s1=cloud.snapshot('studio');
 const lib=await S(()=>{openCuttingListForRoom('job1','r1');const p=project();return {screen:state.screen,parts:cabinet().parts.map(x=>x.code+':'+x.status),drawing:(cabinet().drawing||'').slice(0,22),notes:p.jobLog.map(n=>n.id),moved:!!p.movedToLibraryAt}});
 await wait(1000);
 assert.equal(lib.screen,'cutting');assert.deepEqual(lib.parts,['P-001:ready','P-002:damaged','P-003:missing']);
 assert.equal(lib.drawing,'data:image/png;base64,');assert.deepEqual(lib.notes.filter(x=>['n1','n2','race','offline'].includes(x)).length,4);assert(lib.moved);
 const opened=cloud.diff(s1,cloud.snapshot('studio'));
 assert.equal(opened.writes,0,'opening a Library job writes nothing');assert.equal(opened.bytesDown,0,'opening a Library job downloads nothing');
 assert.equal(cloud.docs.get(liveDoc).active,false,'still not live after opening');

 // 10. Delete Job: that job goes quiet; the other job keeps every message and file.
 await S(async()=>{const part={id:'qa',code:'P-001',name:'Door',length:600,width:400,thickness:18,qty:1,material:'Oak',edgeLong:0,edgeShort:0,notes:'',status:'ready',x:5,y:5,copies:[]};part.reviewSignature=window.panelReviewSignature(part);const st=(0,eval)('state');st.projects.push({id:'job2',name:'Test job',customer:'Test',rooms:[{id:'r2',name:'Hall'}],cabinets:[{id:'c2',roomId:'r2',name:'Hall',parts:[part]}],jobLog:[]});save();await exportProjectToMobile(st.projects.find(x=>x.id==='job2'))});
 await until(()=>cloud.docs.get(JOBS+'studio-job-job2'),'second job sent');
 const before=JSON.stringify([...cloud.docs.entries()].filter(([k])=>!k.endsWith('studio-job-job2')));const filesBefore=cloud.files.size;
 await S(()=>{deleteProjectRecord('job2');save()});
 await until(()=>cloud.docs.get(JOBS+'studio-job-job2').active===false,'deleted job switched off');
 assert.equal(cloud.docs.get(JOBS+'studio-job-job2').activeChangedReason,'deleted');
 assert.equal(JSON.stringify([...cloud.docs.entries()].filter(([k])=>!k.endsWith('studio-job-job2'))),before,'every other message unchanged');
 assert.equal(cloud.files.size,filesBefore,'no files deleted');

 // 11. The waiting Site Measure was never touched by any of this, and can still be accepted.
 assert.equal(cloud.docs.get(siteDoc).status,'waiting');
 await S(()=>acceptSitePacket('cloud:mobile-site1-owner'));
 await until(()=>cloud.docs.get(siteDoc).status==='received','Site Measure accepted as before');

 // 12. Recovery. A Studio browser with no jobs (new or cleared PC) gets them back from the
 // cloud; a normal open with jobs skips the full scan. A new phone gets live jobs back but
 // never the Library job; a normal phone open reads only live jobs.
 const freshStudioCtx=await browser.newContext();
 const fresh=await open(freshStudioCtx,'fresh-studio','/Studio.html');
 await fresh.evaluate(()=>recoverAllCompanySiteJobs());
 await until(()=>fresh.evaluate(()=>{const ids=(0,eval)('state').projects.map(p=>p.id);return ids.includes('job1')&&ids.includes('site1')}),'lost Studio recovers its jobs');
 const r0=cloud.snapshot('fresh-studio');
 await fresh.evaluate(()=>recoverAllCompanySiteJobs());
 assert.equal(cloud.diff(r0,cloud.snapshot('fresh-studio')).docReads,0,'normal Studio open skips the full scan');
 const freshPhoneCtx=await browser.newContext();
 const phone=await open(freshPhoneCtx,'fresh-phone','/Mobile.html');
 await S(async()=>{const part={id:'za',code:'P-001',name:'Door',length:600,width:400,thickness:18,qty:1,material:'Oak',edgeLong:0,edgeShort:0,notes:'',status:'ready',x:5,y:5,copies:[]};part.reviewSignature=window.panelReviewSignature(part);const st=(0,eval)('state');st.projects.push({id:'job3',name:'Live job',customer:'Carl',rooms:[{id:'r3',name:'Bath'}],cabinets:[{id:'c3',roomId:'r3',name:'Bath',parts:[part]}],jobLog:[]});save();await exportProjectToMobile(st.projects.find(x=>x.id==='job3'))});
 await until(()=>cloud.docs.get(JOBS+'studio-job-job3'),'live job sent');
 await phone.evaluate(()=>{(0,eval)('state').projects=[];save();return window.fiqRecoverAccessibleCompanyJobs('co')});
 const recovered=await until(()=>phone.evaluate(()=>{const ids=(0,eval)('state').projects.map(p=>p.id);return ids.includes('job3')?ids:null}),'new phone recovers the live job');
 assert(!recovered.includes('job1'),'the Library job does not come back to a phone');
 assert(!recovered.includes('job2'),'the deleted job does not come back to a phone');
 await wait(2000);const p0=cloud.snapshot('fresh-phone');
 await phone.evaluate(()=>window.fiqRecoverAccessibleCompanyJobs('co'));
 const normalOpen=cloud.diff(p0,cloud.snapshot('fresh-phone'));
 assert.equal(normalOpen.docReads,1,'a normal phone open reads only the live job');

 assert.deepEqual(errors,[],'no page errors');
 console.log('PASS: Site Measure arrives and waits (also after refresh), one message per job both ways, Job Overview live sync with Panel Check, damaged, missing, notes and photos, update during merge kept, update while Studio closed kept, Library quiet and fully readable, Delete quiet without deleting, photos uploaded once, acceptance unchanged.');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
