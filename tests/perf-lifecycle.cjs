// Background cost at scale. Seeds the fake cloud with the history the old sync builds up
// (several received messages per job in both directions, as today), a Studio holding 10
// active and N Customer Library jobs, and a phone holding the 10 active jobs. Then measures,
// while idle: cloud queries, documents read, bytes downloaded, writes, listener events and
// JavaScript memory. Library jobs are kept small in Studio's own browser storage (3 panels):
// the browser's ~5 MB limit cannot hold thousands of full jobs, a limit of today's design that
// the planned permanent cloud record addresses. The cloud history keeps full-size jobs. Run with ROOT=<a checkout> to measure another version of the apps.
//   node tests/perf-lifecycle.cjs 20      node tests/perf-lifecycle.cjs 2000
const {chromium}=require('playwright');
const path=require('node:path');
const {createCloud,serve}=require('./helpers/fake-cloud.cjs');
const N=Number(process.argv[2]||20),ACTIVE=10,STUDIO_IDLE=65000,MOBILE_IDLE=30000;
const root=path.resolve(process.env.ROOT||path.join(__dirname,'..'));
const user={uid:'owner',companyId:'co',role:'company_owner',email:'owner@test',fitterId:'F1'};
const JOBS='companies/co/jobs/';
const iso=t=>new Date(t).toISOString();
function job(id,active,count=12){
 const parts=Array.from({length:count},(_,i)=>({id:id+'p'+i,code:'P-'+String(i+1).padStart(3,'0'),name:'Panel '+i,length:700+i,width:500,thickness:18,qty:1,material:'Oak',edgeLong:1,edgeShort:0,notes:'',status:active?'ready':'installed',x:10+i,y:20,copies:[]}));
 return {id,name:'Job '+id,customer:'Customer '+id,rooms:[{id:id+'r',name:'Kitchen',notes:'Room notes for '+id}],cabinets:[{id:id+'c',roomId:id+'r',name:'Kitchen',parts}],jobLog:[{id:id+'n',text:'Fitted and signed off',at:1,roomId:id+'r',photos:['https://storage.test/photo-'+id]}]};
}
(async()=>{
 const {server,base}=await serve(root);
 const cloud=createCloud();
 const t0=Date.parse('2026-01-01T00:00:00Z');
 const all=[...Array.from({length:ACTIVE},(_,i)=>({id:'act'+i,active:true})),...Array.from({length:N},(_,i)=>({id:'lib'+i,active:false}))];
 let n=0;
 all.forEach(({id,active})=>{
  const p=job(id,active);
  // History the old sync leaves behind: 3 phone updates and 2 dispatches per job, all handled.
  for(let k=0;k<3;k++)cloud.docs.set(JOBS+'auto'+(++n),{kind:'siteJobPacket',status:'received',exportedAt:iso(t0+n*1000),createdBy:'owner',project:{...p,studioOrigin:true}});
  for(let k=0;k<2;k++)cloud.docs.set(JOBS+'studio-s'+(++n),{kind:'studioToMobilePacket',status:'received',exportedAt:iso(t0+n*1000),project:p});
 });
 cloud.docs.set(JOBS+'reset1',{kind:'studioToMobilePacket',status:'broadcast',command:{type:'reset-all-test-data',resetId:'r1',resetAt:t0}});
 const studioState={projects:all.map(({id,active})=>({...job(id,active,active?12:3),_lastMobilePacketAt:t0+10e9,_lastRoomsSyncAt:t0+10e9,...(active?{}:{movedToLibraryAt:t0,overviewFinishedAt:t0})})),customers:[],screen:'jobs'};
 const mobileState={projects:all.filter(x=>x.active).map(({id})=>({...job(id,true),studioOrigin:true,_lastStudioPacketAt:t0+10e9})),currentProject:null};
 const browser=await chromium.launch({headless:true,args:['--enable-precise-memory-info']});
 const out={N,root:path.basename(root)};
 try{
  for(const [client,url,idle,key,seed] of [['studio','/Studio.html',STUDIO_IDLE,'buildSOS_v12',studioState],['mobile','/Mobile.html',MOBILE_IDLE,'assembleone_mobile_v2',mobileState]]){
   const ctx=await browser.newContext();const page=await ctx.newPage();
   page.on('dialog',d=>d.accept());
   await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
   await page.goto(base+'/tests/');
   await page.evaluate(([k,v])=>{localStorage.clear();localStorage.setItem(k,v);localStorage.setItem('fittersiq_last_test_reset_v1','r1')},[key,JSON.stringify(seed)]);
   await cloud.attach(page,client,user);
   const loadStart=cloud.snapshot(client);
   await page.goto(base+url);
   await page.waitForFunction(()=>document.readyState==='complete'&&typeof save==='function');
   await page.waitForTimeout(8000);
   const settled=cloud.snapshot(client);
   const heap0=await page.evaluate(()=>performance.memory?performance.memory.usedJSHeapSize:0);
   await page.waitForTimeout(idle);
   const end=cloud.snapshot(client);
   const heap1=await page.evaluate(()=>performance.memory?performance.memory.usedJSHeapSize:0);
   const perMin=(v)=>Math.round(v*60000/idle);
   const d=cloud.diff(settled,end),start=cloud.diff(loadStart,settled);
   // Open-time backup check, as run at sign-in: first open, then a later normal open.
   const recover=async()=>{const a=cloud.snapshot(client);await page.evaluate(()=>typeof recoverAllCompanySiteJobs==='function'?recoverAllCompanySiteJobs():typeof window.fiqRecoverAccessibleCompanyJobs==='function'?window.fiqRecoverAccessibleCompanyJobs('co'):null);await page.waitForTimeout(1500);const x=cloud.diff(a,cloud.snapshot(client));return {docReads:x.docReads,mbDown:+(x.bytesDown/1e6).toFixed(2)}};
   const firstOpenCheck=await recover(),laterOpenCheck=await recover();
   out[client+'OpenCheck']={first:firstOpenCheck,later:laterOpenCheck};
   out[client]={startup:{queries:start.queries,docReads:start.docReads,mbDown:+(start.bytesDown/1e6).toFixed(2)},idlePerMinute:{queries:perMin(d.queries),docReads:perMin(d.docReads),mbDown:+(perMin(d.bytesDown)/1e6).toFixed(2),writes:perMin(d.writes),listenerEvents:perMin(d.listenerEvents)},heapMB:[Math.round(heap0/1e6),Math.round(heap1/1e6)]};
   await ctx.close();
  }
 }finally{await browser.close();server.close()}
 console.log(JSON.stringify(out));
})().catch(e=>{console.error(e);process.exitCode=1});
