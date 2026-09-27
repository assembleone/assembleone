// Studio Job Overview cards lead to what they show. Real Studio and Mobile over the fake
// cloud; Mobile driven through its own screens:
//  1. Site Update: on Mobile's room screen, Site Update -> text + photo -> Send Update to
//     Studio. Studio's Job Overview card for that room counts it, and clicking Site Updates
//     opens that update with its text and photo.
//  2. Damaged / Missing (a piece damaged with a note and photo, another panel missing):
//     the card counts them, and clicking Damaged / Missing opens the list of exactly those
//     panels for that room -- panel, size, note, photos -- with a way to the panel.
//  3. Navigation: every stat goes where it says; the rest of the card opens the room.
const {chromium}=require('playwright');
const path=require('node:path'),assert=require('node:assert/strict');
const {createCloud,serve}=require('./helpers/fake-cloud.cjs');
const user={uid:'owner',companyId:'co',role:'company_owner',email:'owner@test',fitterId:'F1'};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const PHOTO='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVR42mP8z8DwnwEJMDKgAQYGBgA0GAX7m0AaNQAAAABJRU5ErkJggg==';
async function until(fn,label,ms=20000){const end=Date.now()+ms;let last;while(Date.now()<end){try{last=await fn();if(last)return last}catch(e){last=e}await wait(250)}throw new Error('Timed out: '+label+(last instanceof Error?' ('+last.message+')':' ('+JSON.stringify(last)+')'))}
(async()=>{
 const served=await serve(path.resolve(__dirname,'..')),server=served.server,base=process.env.LIVE_BASE||served.base;
 const site=process.env.LIVE_BASE?process.env.LIVE_BASE.replace(/\/beta$/,'')+'/':'http://127.0.0.1';
 const cloud=createCloud();let browser;
 try{
 browser=await chromium.launch({headless:true});
 const errors=[];
 async function open(ctx,client,url,viewport){
  const page=await ctx.newPage();if(viewport)await page.setViewportSize(viewport);
  page.on('pageerror',e=>errors.push(client+': '+e.message));page.on('dialog',d=>d.accept());
  await page.route(u=>!String(u).startsWith(site),r=>r.abort());
  await cloud.attach(page,client,user);
  await page.goto(base+url);
  await page.waitForFunction(()=>document.readyState==='complete'&&typeof save==='function'&&(typeof exportJob==='function'||typeof exportProjectToMobile==='function')&&typeof (0,eval)('typeof state!=="undefined"&&state')==='object');
  await page.waitForTimeout(500);
  await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});
  return page;
 }
 const studio=await open(await browser.newContext(),'studio','/Studio.html',{width:1366,height:900});
 const mobile=await open(await browser.newContext(),'mobile','/Mobile.html',{width:390,height:844});
 const S=(fn,a)=>studio.evaluate(fn,a),M=(fn,a)=>mobile.evaluate(fn,a);

 await S(async()=>{
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#eee"/></svg>');
  const part=(id,code,name,qty,x,y)=>{const p={id,code,name,length:800,width:400,thickness:18,qty,material:'Oak melamine',edgeLong:1,edgeShort:0,notes:'',status:'ready',x,y,copies:[]};p.reviewSignature=window.panelReviewSignature(p);return p};
  const st=(0,eval)('state');
  st.projects.push({id:'oj',name:'Overview job',customer:'Olga Overview',rooms:[{id:'k1',name:'Kitchen'},{id:'b1',name:'Bedroom'}],cabinets:[
   {id:'kc',roomId:'k1',name:'Kitchen run',drawing,drawingType:'image',parts:[part('k1a','P-001','Side',1,20,30),part('k1b','P-002','Shelf',3,55,40),part('k1c','P-003','Top',1,70,20)]},
   {id:'bc',roomId:'b1',name:'Wardrobe',drawing,drawingType:'image',parts:[part('b1a','P-001','Door',2,40,40)]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));switchToProject('oj','kc');save();
  await exportProjectToMobile(st.projects.find(x=>x.id==='oj'));
 });
 await until(()=>M(()=>!!(0,eval)('state').projects.find(x=>x.id==='oj')),'job reaches Mobile');

 // 1. Mobile: Site Update from the Kitchen room screen, with a photo.
 await M(()=>{state.currentProject='oj';state.currentRoom='k1';save();show('drawings')});await mobile.waitForTimeout(400);
 await until(()=>M(()=>!!document.getElementById('fiqSiteUpdateTop')),'Site Update chip');
 await mobile.locator('#fiqSiteUpdateTop').click();await mobile.waitForTimeout(300);
 await mobile.locator('#jobNoteText').fill('Wall is out of plumb by 8 mm');
 await M(p=>{jobNotePendingPhotos.push(p);renderJobNotePhotoPreview()},PHOTO);
 await mobile.locator('#saveJobNote').click();
 await until(()=>S(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='oj');return (p.jobLog||[]).some(e=>/out of plumb/.test(e.text))}),'Site Update reaches Studio');
 await mobile.locator('#closeJobNotes').click();
 const logged=await S(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='oj');const e=p.jobLog.find(x=>/out of plumb/.test(x.text));return {roomId:e.roomId,photos:(e.photos||[]).map(x=>String(x).slice(0,21))}});
 assert.deepEqual(logged,{roomId:'k1',photos:['https://storage.test/']},'update and photo arrived, for the Kitchen');

 const overview=async()=>{await S(()=>{show('jobs');renderAll()});await studio.waitForTimeout(400)};
 const card=room=>studio.locator(`.job-overview-row[data-open-job-card="oj"][data-card-room-id="${room}"]`);
 const stat=async(room,label)=>(await card(room).locator('.jor-stat',{hasText:label}).first().innerText()).replace(/\s+/g,' ').trim().toLowerCase();
 await overview();
 assert.equal(await stat('k1','Site Updates'),'site updates 1','Kitchen card counts the update');
 assert.equal(await stat('b1','Site Updates'),'site updates 0','Bedroom card does not');
 await card('k1').locator('.jor-stat',{hasText:'Site Updates'}).click();await studio.waitForTimeout(300);
 const dlg=await S(()=>{const d=document.querySelector('.job-notes-dialog-sheet');return d?{h:d.querySelector('h2').innerText,text:d.innerText,imgs:[...d.querySelectorAll('.job-notes-list img')].map(i=>i.getAttribute('src').slice(0,21))}:null});
 assert.ok(dlg&&/Site Updates/.test(dlg.h)&&/out of plumb by 8 mm/.test(dlg.text),'Site Updates opens the update: '+JSON.stringify(dlg));
 assert.deepEqual(dlg.imgs,['https://storage.test/'],'with its photo');
 await S(()=>document.querySelector('#studioJobNotesClose').click());

 // 2. Mobile: P-002 piece 3 damaged (note + photo) and later fitted -- like the real test --
 //    and P-003 missing, through the Panel Check cards and the damage form.
 const png=require('node:path').join(require('node:os').tmpdir(),'fiq-damage-photo.png');require('node:fs').writeFileSync(png,Buffer.from(PHOTO.split(',')[1],'base64'));
 const room=async()=>{await M(()=>{state.currentProject='oj';state.currentRoom='k1';closeFindPanelResult();save();show('drawings')});await mobile.waitForTimeout(300)};
 const mcard=code=>mobile.locator('#panelCheckSection .panel-check-row',{hasText:code+' ·'});
 await room();await mcard('P-002').click();await mobile.waitForTimeout(250);
 await mobile.locator('[data-fp-piece="3"]').click();await mobile.locator('#fpMarkDamaged').click();
 await mobile.locator('#damageNote').fill('Chipped front edge');await mobile.locator('#damagePhotoInput').setInputFiles(png);await mobile.waitForTimeout(600);
 await mobile.locator('#saveDamage').click();
 await until(()=>M(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='oj').cabinets[0].parts[1];return p.pieceStates&&p.pieceStates['3']&&p.pieceStates['3'].status==='damaged'}),'piece 3 damaged');
 await mobile.locator('#closeDamagePanel').click();
 await mobile.locator('#fpMarkFitted').click();await mobile.waitForTimeout(200);// replaced and fitted later
 await room();await mcard('P-003').click();await mobile.waitForTimeout(250);await mobile.locator('#fpMarkMissing').click();
 await M(async()=>{await exportJob('oj',true)});
 await until(()=>S(()=>{const c=(0,eval)('state').projects.find(x=>x.id==='oj').cabinets[0];return c.parts[1].damagedQty===1&&(c.parts[2].pieceStates||{})['1']?.status==='missing'&&(c.parts[1].panelPhotos||[]).length}),'damage and missing reach Studio');

 await overview();
 assert.equal(await stat('k1','Damaged'),'damaged 1 ⚠️');assert.equal(await stat('k1','Missing'),'missing 1 ⚠️');
 const cabsBefore=await S(()=>(0,eval)('state').projects.find(x=>x.id==='oj').cabinets.length);
 const modal=()=>S(()=>{const m=document.getElementById('attentionModal');return {open:m.classList.contains('open'),title:document.getElementById('attentionModalTitle').innerText,
  items:[...document.querySelectorAll('#attentionList .attention-item')].map(it=>({panel:it.querySelector('.attention-item-panel').innerText,now:it.querySelector('.attention-item-now')?.innerText||'',note:it.querySelector('.attention-item-note')?.innerText||'',photos:[...it.querySelectorAll('img')].map(i=>i.getAttribute('src').slice(0,21)),buttons:[...it.querySelectorAll('button')].map(b=>b.innerText)})),empty:document.querySelector('#attentionList .attention-empty')?.innerText||''}});
 // Damaged -> the damaged panel with its note and photo, even though it is fitted now.
 await card('k1').locator('.jor-stat',{hasText:'Damaged'}).click();await studio.waitForTimeout(300);
 let md=await modal();
 assert.deepEqual([md.open,md.title,md.items.length],[true,'⚠️ Damaged panels',1]);
 assert.deepEqual({...md.items[0],now:md.items[0].now.replace(/\s+/g,' ')},{panel:'P-002 Shelf',now:'Now: Ready · piece 3 fitted',note:'"Chipped front edge"',photos:['https://storage.test/'],buttons:['Go to panel','Show on drawing','✓ Sorted']},'damaged panel, note, photo');
 assert.equal(await S(()=>state.screen),'jobs','Damaged no longer jumps to Drawing');
 // Show on drawing -> that panel selected on its own unit's drawing.
 await studio.locator('#attentionList button',{hasText:'Show on drawing'}).click();await studio.waitForTimeout(300);
 assert.deepEqual(await S(()=>[state.screen,state.currentCabinet,state.currentPart]),['mark','kc','k1b'],'drawing with P-002 selected');
 // Missing -> the missing panel only.
 await overview();await card('k1').locator('.jor-stat',{hasText:'Missing'}).click();await studio.waitForTimeout(300);
 md=await modal();assert.deepEqual([md.title,md.items.map(x=>x.panel)],['❔ Missing panels',['P-003 Top']]);
 await studio.locator('#attentionList button',{hasText:'Go to panel'}).click();await studio.waitForTimeout(300);
 assert.deepEqual(await S(()=>[state.screen,state.currentCabinet,state.currentPart]),['parts','kc','k1c'],'Go to panel opens it in Panel Check');
 // A card with nothing damaged says so.
 await overview();await card('b1').locator('.jor-stat',{hasText:'Damaged'}).click();await studio.waitForTimeout(300);
 md=await modal();assert.deepEqual([md.items.length,md.empty],[0,'No damaged panels reported for this card.']);
 await S(()=>window.closeAttentionModal());

 // 3. Navigation: Panel Check opens that card's own unit; the card itself opens its drawing.
 await overview();await card('b1').locator('[data-open-panel-check]').first().click();await studio.waitForTimeout(300);
 assert.deepEqual(await S(()=>[state.screen,state.currentCabinet]),['parts','bc'],'Bedroom Panel Check opens the Bedroom unit');
 await overview();await card('b1').locator('.jor-name').click();await studio.waitForTimeout(300);
 assert.deepEqual(await S(()=>[state.screen,state.currentCabinet]),['mark','bc'],'Bedroom card opens the Bedroom drawing');
 assert.equal(await S(()=>(0,eval)('state').projects.find(x=>x.id==='oj').cabinets.length),cabsBefore,'no unit created by navigating');

 // 4. The real case: a job sent without rooms. Mobile shows its unit as its own room and
 //    tags the Site Update with that room; Studio's card must still count and show it.
 await S(async()=>{
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const p={id:'P-001x',code:'P-001',name:'Top / Bottom',length:700,width:500,thickness:18,qty:1,material:'Oak',edgeLong:0,edgeShort:0,notes:'',status:'ready',x:30,y:30,copies:[]};p.reviewSignature=window.panelReviewSignature(p);
  const st=(0,eval)('state');
  st.projects.push({id:'nr',name:'New Job',customer:'No Rooms',rooms:[],cabinets:[{id:'nrc',name:'Wardrobe 1',drawing,drawingType:'image',parts:[p]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));switchToProject('nr','nrc');save();
  await exportProjectToMobile(st.projects.find(x=>x.id==='nr'));
 });
 await until(()=>M(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='nr');return p&&p.rooms.some(r=>r.id==='auto-room-nrc')}),'no-rooms job on Mobile with its own room');
 await M(()=>{closeFindPanelResult();state.currentProject='nr';state.currentRoom='auto-room-nrc';save();show('drawings')});await mobile.waitForTimeout(400);
 await mobile.locator('#fiqSiteUpdateTop').click();await mobile.waitForTimeout(300);
 await mobile.locator('#jobNoteText').fill('Skirting in the way');
 await M(p=>{jobNotePendingPhotos.push(p);renderJobNotePhotoPreview()},PHOTO);
 await mobile.locator('#saveJobNote').click();
 await until(()=>S(()=>((0,eval)('state').projects.find(x=>x.id==='nr').jobLog||[]).some(e=>/Skirting/.test(e.text))),'no-rooms Site Update reaches Studio');
 await mobile.locator('#closeJobNotes').click();
 assert.deepEqual(await S(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='nr');return [p.rooms.map(r=>r.id+':'+r.name),p.cabinets.map(c=>c.id+':'+(c.roomId||'')),p.jobLog[0].roomId]}),[['auto-room-nrc:Wardrobe 1'],['nrc:'],'auto-room-nrc'],'exactly the real data shape');
 await overview();
 assert.equal(await stat('__general__','Site Updates').catch(()=>null)||await (async()=>{const c=studio.locator('.job-overview-row[data-open-job-card="nr"]');return (await c.locator('.jor-stat',{hasText:'Site Updates'}).first().innerText()).replace(/\s+/g,' ').trim().toLowerCase()})(),'site updates 1','the no-rooms card counts it');
 const nr=studio.locator('.job-overview-row[data-open-job-card="nr"]');
 await nr.locator('.jor-stat',{hasText:'Site Updates'}).click();await studio.waitForTimeout(300);
 const d2=await S(()=>{const d=document.querySelector('.job-notes-dialog-sheet');return {text:d.innerText,imgs:[...d.querySelectorAll('.job-notes-list img')].length}});
 assert.ok(/Skirting in the way/.test(d2.text)&&d2.imgs===1,'and shows it with its photo');
 await S(()=>document.querySelector('#studioJobNotesClose').click());
 const nrCabs=await S(()=>(0,eval)('state').projects.find(x=>x.id==='nr').cabinets.length);
 await overview();await nr.locator('.jor-name').click();await studio.waitForTimeout(300);
 assert.deepEqual(await S(()=>[state.screen,state.currentCabinet,(0,eval)('state').projects.find(x=>x.id==='nr').cabinets.length]),['mark','nrc',nrCabs],'no-rooms card opens its own unit, creates nothing');

 console.log(JSON.stringify({ok:true}));
 assert.deepEqual(errors,[],'no page errors');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
