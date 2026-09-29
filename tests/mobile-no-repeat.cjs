// A job sent once is shown on Mobile once. Real Studio and Mobile over the fake cloud.
// The cloud write of the job is slow (31 s), so Studio's outbox times out after 30 s and
// retries the SAME send while the first write is still going. Previously each rewrite set
// the job back to "waiting" and Mobile applied and announced it again (the repeated
// "new job received" flashing). Now:
//  - Mobile shows the job and its alert exactly once; the cloud copy ends "received";
//  - further polls, idle time and a Mobile reload show nothing again;
//  - a genuinely newer send from Studio still arrives and is announced.
const {chromium}=require('playwright');
const path=require('node:path'),assert=require('node:assert/strict');
const {createCloud,serve}=require('./helpers/fake-cloud.cjs');
const user={uid:'owner',companyId:'co',role:'company_owner',email:'owner@test',fitterId:'F1'};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label,ms=15000){const end=Date.now()+ms;let last;while(Date.now()<end){try{last=await fn();if(last)return last}catch(e){last=e}await wait(200)}throw new Error('Timed out: '+label)}
(async()=>{
 const served=await serve(path.resolve(__dirname,'..')),server=served.server,base=served.base;
 const cloud=createCloud();let browser;
 try{
 browser=await chromium.launch({headless:true});
 const errors=[],alerts=[];
 async function open(client,url,ctx){
  const page=await (ctx||await browser.newContext()).newPage();
  page.on('pageerror',e=>errors.push(client+': '+e.message));
  page.on('dialog',d=>{if(client==='mobile')alerts.push(d.message());d.accept()});
  await page.route(u=>!String(u).startsWith('http://127.0.0.1'),r=>r.abort());
  await cloud.attach(page,client,user);
  await page.goto(base+url);
  await page.waitForFunction(()=>document.readyState==='complete'&&typeof save==='function'&&typeof (0,eval)('typeof state!=="undefined"&&state')==='object');
  await page.waitForTimeout(500);
  return page;
 }
 const studio=await open('studio','/Studio.html');
 const mobile=await open('mobile','/Mobile.html',await browser.newContext());
 const S=(fn,a)=>studio.evaluate(fn,a);
 const docPath='companies/co/jobs/studio-job-nr';
 cloud.hooks.push({op:'write',match:(p,c)=>c==='studio'&&p===docPath,run:()=>new Promise(r=>setTimeout(r,31000))});
 await S(()=>{
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const P=(id,code,name)=>{const p={id,code,name,length:700,width:500,thickness:18,qty:1,material:'Oak',edgeLong:0,edgeShort:0,notes:'',status:'ready',x:20,y:20,copies:[]};p.reviewSignature=window.panelReviewSignature(p);return p};
  const st=(0,eval)('state');
  st.projects.push({id:'nr',name:'No repeat job',customer:'Nora',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'nc',roomId:'r1',name:'Kitchen',drawing,drawingType:'image',parts:[P('n1','P-001','Side')]}],
   jobLog:[{id:'l1',author:'Studio',at:Date.now()-5000,text:'Office note',photos:[],roomId:'r1'}],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));save();
  exportProjectToMobile(st.projects.find(x=>x.id==='nr')).catch(()=>{});
 });
 await until(()=>mobile.evaluate(()=>!!(0,eval)('state').projects.find(x=>x.id==='nr')),'job reaches Mobile',90000);
 await wait(45000);// the slow first write lands and the retry has run
 for(let i=0;i<3;i++){await mobile.evaluate(()=>{if(typeof pollStudioSync==='function')pollStudioSync()});await wait(2000)}
 assert.equal(alerts.length,1,'shown once: '+JSON.stringify(alerts));
 assert.equal(cloud.docs.get(docPath).status,'received','cloud copy ends received');
 // A Mobile reload shows nothing again.
 const mctx=mobile.context();await mobile.reload();await mobile.waitForFunction(()=>document.readyState==='complete'&&typeof save==='function');await wait(5000);
 await mobile.evaluate(()=>{if(typeof pollStudioSync==='function')pollStudioSync()});await wait(2000);
 assert.equal(alerts.length,1,'nothing after a reload');
 // A genuinely newer send still arrives and is announced.
 await S(async()=>{const p=(0,eval)('state').projects.find(x=>x.id==='nr');p.cabinets[0].parts[0].notes='Updated';save();await exportProjectToMobile(p)});
 await until(()=>mobile.evaluate(()=>(0,eval)('state').projects.find(x=>x.id==='nr').cabinets[0].parts[0].notes==='Updated'),'newer send arrives',20000);
 await wait(1500);
 assert.equal(alerts.length,2,'the newer send is announced');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true,alerts:alerts.length}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
