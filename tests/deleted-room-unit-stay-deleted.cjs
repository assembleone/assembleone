// A room or unit deleted in Studio stays deleted when a phone that still has the old copy
// sends an update (found in the final audit: the stale phone packet recreated both).
// Real Studio and Mobile over the fake cloud:
//  - Studio sends a job with three rooms (Kitchen / Utility / Laundry, one unit each);
//  - Studio then deletes a panel (Drawing Delete), the Utility unit (its unit Delete) and the
//    Laundry room (its room Delete), using the existing delete handlers;
//  - the phone, still holding the old copy, marks P-001 Fitted (its real button) and sends;
//  - Studio: the Fitted status merges; the Utility unit, the Laundry room and the deleted
//    panel do NOT come back -- not in the job, Drawing's units, Panel Check, the Cutting
//    List / supplier rows or Customer Library -- and stay gone after a Studio reload;
//  - a later genuine phone change (a Job Note) still merges normally;
//  - deleted-job protection is unchanged: a deleted job is not recreated by the phone.
const {chromium}=require('playwright');
const path=require('node:path'),assert=require('node:assert/strict');
const {createCloud,serve}=require('./helpers/fake-cloud.cjs');
const user={uid:'owner',companyId:'co',role:'company_owner',email:'owner@test',fitterId:'F1'};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label,ms=60000){const end=Date.now()+ms;let last;while(Date.now()<end){try{last=await fn();if(last)return last}catch(e){last=e}await wait(250)}throw new Error('Timed out: '+label+' '+JSON.stringify(last))}
(async()=>{
 const served=await serve(path.resolve(__dirname,'..')),server=served.server,base=process.env.LIVE_BASE||served.base;
 const site=process.env.LIVE_BASE?process.env.LIVE_BASE.replace(/\/beta$/,'')+'/':'http://127.0.0.1';
 const cloud=createCloud();const browser=await chromium.launch({headless:true});const errors=[];
 try{
 async function open(client,url,ctx){
  const page=await (ctx||await browser.newContext()).newPage();
  page.on('pageerror',e=>errors.push(client+': '+e.message));page.on('dialog',d=>d.accept());
  await page.route(u=>!String(u).startsWith(site),r=>r.abort());
  await cloud.attach(page,client,user);await page.goto(base+url);
  await page.waitForFunction(()=>document.readyState==='complete'&&typeof save==='function'&&typeof (0,eval)('typeof state!=="undefined"&&state')==='object');
  await page.waitForTimeout(800);
  await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});
  return page;
 }
 const studio=await open('studio','/Studio.html'),mobile=await open('mobile','/Mobile.html');
 const S=(fn,a)=>studio.evaluate(fn,a);
 await S(()=>{
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const P=(id,code,name,x)=>{const p={id,code,name,length:700,width:500,thickness:18,qty:1,material:'Oak',edgeLong:0,edgeShort:0,notes:'',status:'ready',x,y:30,copies:[]};p.reviewSignature=window.panelReviewSignature(p);return p};
  state.projects.push({id:'rj',name:'Resurrect job',customer:'Rita',rooms:[{id:'ra',name:'Kitchen'},{id:'rb',name:'Utility'},{id:'rc',name:'Laundry'}],cabinets:[
   {id:'ua',roomId:'ra',name:'Kitchen unit',drawing,drawingType:'image',parts:[P('a1','P-001','Side',20),P('a2','P-002','Shelf',40),P('a3','P-003','Top',60)]},
   {id:'ub',roomId:'rb',name:'Utility unit',drawing,drawingType:'image',parts:[P('b1','P-001','Utility side',20)]},
   {id:'uc',roomId:'rc',name:'Laundry unit',drawing,drawingType:'image',parts:[P('c1','P-001','Laundry side',20)]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(state.projects.at(-1));save();return exportProjectToMobile(state.projects.find(x=>x.id==='rj'));
 });
 await until(()=>mobile.evaluate(()=>{const p=state.projects.find(x=>x.id==='rj');return p&&p.cabinets.length===3}),'job on the phone');
 // Studio deletes: a panel (Drawing Delete), the Utility unit, the Laundry room.
 await S(()=>{switchToProject('rj','ua','a3');renderAll();show('mark')});await studio.waitForTimeout(300);
 await S(()=>document.getElementById('deletePartBtn').click());await studio.waitForTimeout(300);
 await S(()=>{renderProject();document.querySelector('[data-delete-cabinet="ub"]').click()});await studio.waitForTimeout(200);
 await S(()=>{openStudioRoom('rc');document.querySelector('.room-detail-sheet [data-detail-delete]').click()});await studio.waitForTimeout(300);
 const shape=()=>S(()=>{const p=state.projects.find(x=>x.id==='rj');if(!p)return null;return {rooms:p.rooms.map(r=>r.id).sort(),units:p.cabinets.map(c=>c.id).sort(),kitchen:p.cabinets.find(c=>c.id==='ua').parts.map(x=>x.code+':'+x.status)}});
 const afterDelete=await shape();
 assert.deepEqual(afterDelete,{rooms:['ra','rb'],units:['ua','uc'],kitchen:['P-001:ready','P-002:ready']},'Studio deletes (the Laundry unit is kept, detached, as before)');
 // The phone still has the old copy (3 rooms, 3 units, P-003) and reports P-001 Fitted.
 assert.equal(await mobile.evaluate(()=>{const p=state.projects.find(x=>x.id==='rj');return p.rooms.length+'/'+p.cabinets.length+'/'+p.cabinets[0].parts.length}),'3/3/3','phone holds the old copy');
 await mobile.evaluate(()=>{const p=state.projects.find(x=>x.id==='rj'),c=p.cabinets.find(x=>x.id==='ua'),pt=c.parts.find(x=>x.id==='a1');openPanelFromCard(p,c,pt)});await mobile.waitForTimeout(400);
 await mobile.evaluate(()=>document.getElementById('fpMarkFitted').click());await mobile.waitForTimeout(300);
 await mobile.evaluate(()=>exportJob('rj',true));
 await until(async()=>{await S(()=>{if(typeof window.receiveMobileDirect==='function')window.receiveMobileDirect()});return S(()=>{const p=state.projects.find(x=>x.id==='rj');const pt=p&&p.cabinets.find(c=>c.id==='ua').parts.find(x=>x.id==='a1');return pt&&pt.status==='installed'})},'Fitted reaches Studio');
 await wait(1500);
 const check=async label=>{
  assert.deepEqual(await shape(),{rooms:['ra','rb'],units:['ua','uc'],kitchen:['P-001:installed','P-002:ready']},label+': no deleted room, unit or panel came back; Fitted merged');
  const views=await S(()=>{switchToProject('rj','ua');renderAll();
   const p=project();const all=p.cabinets.flatMap(c=>c.parts);
   show('parts');renderAll();const pc=document.getElementById('screen-parts').innerText;
   show('cutting');renderAll();const cl=document.getElementById('screen-cutting').innerText;
   const rows=fiqSupplierDataset(all).rows.map(r=>r.name);
   show('customers');openCustomerCard(p.customerId);const lib=document.getElementById('customerCardBody').innerText;
   return {pc,cl,rows,lib}});
  for(const [k,v] of Object.entries(views)){const txt=JSON.stringify(v);assert.ok(!/Utility side|Utility unit/.test(txt),label+': '+k+' shows no deleted Utility unit');assert.ok(!/Laundry\b(?! unit| side)/.test(txt.replace(/Laundry unit|Laundry side/g,'')),label+': '+k+' shows no deleted Laundry room');assert.ok(!/P-003/.test(txt.replace(/P-003 deleted/g,'')),label+': '+k+' shows no deleted panel P-003')}
 };
 await check('after the stale phone update');
 // Reload Studio: still gone.
 await studio.reload();await studio.waitForFunction(()=>document.readyState==='complete'&&typeof save==='function'&&typeof (0,eval)('typeof state!=="undefined"&&state')==='object');await studio.waitForTimeout(1200);
 await S(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});
 await check('after Studio reload');
 // A later genuine phone change still merges.
 await mobile.evaluate(()=>{const p=state.projects.find(x=>x.id==='rj');p.jobLog=p.jobLog||[];p.jobLog.push({id:'n1',author:'Fitter',at:Date.now(),text:'Wall is out of square',photos:[],roomId:'ra'});p.updatedAt=Date.now();save();return exportJob('rj',true)});
 await until(async()=>{await S(()=>{if(typeof window.receiveMobileDirect==='function')window.receiveMobileDirect()});return S(()=>(state.projects.find(x=>x.id==='rj').jobLog||[]).some(e=>/out of square/.test(e.text)))},'Job Note reaches Studio');
 await check('after a later phone note');
 // Deleted-job protection unchanged.
 await S(()=>{deleteProjectRecord('rj');save()});
 await mobile.evaluate(()=>{const p=state.projects.find(x=>x.id==='rj');p.cabinets[0].parts[1].notes='late';p.updatedAt=Date.now();save();return exportJob('rj',true)});
 await wait(3000);await S(()=>{if(typeof window.receiveMobileDirect==='function')window.receiveMobileDirect()});await wait(3000);
 assert.equal(await S(()=>!!state.projects.find(x=>x.id==='rj')),false,'a deleted job is not recreated');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
