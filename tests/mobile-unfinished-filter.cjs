// Unfinished panels stay in Drawing: Send to Mobile never sends a panel without Part Name,
// Length, Width, Thickness, Material or Quantity. Real Studio and Mobile over the fake cloud:
//  - job with a finished checked panel, a finished unchecked panel and an unfinished panel
//    (no name, no width): Mobile gets the two finished ones only; Studio keeps all three;
//  - a Mobile update coming back does not remove the unfinished panel from Studio;
//  - once finished in Studio and sent again, it reaches Mobile.
const {chromium}=require('playwright');
const path=require('node:path'),assert=require('node:assert/strict');
const {createCloud,serve}=require('./helpers/fake-cloud.cjs');
const user={uid:'owner',companyId:'co',role:'company_owner',email:'owner@test',fitterId:'F1'};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label,ms=15000){const end=Date.now()+ms;let last;while(Date.now()<end){try{last=await fn();if(last)return last}catch(e){last=e}await wait(200)}throw new Error('Timed out: '+label)}
(async()=>{
 const served=await serve(path.resolve(__dirname,'..')),server=served.server,base=process.env.LIVE_BASE||served.base;
 const site=process.env.LIVE_BASE?process.env.LIVE_BASE.replace(/\/beta$/,'')+'/':'http://127.0.0.1';
 const cloud=createCloud();let browser;
 try{
 browser=await chromium.launch({headless:true});
 const errors=[];
 async function open(client,url){
  const page=await (await browser.newContext()).newPage();
  page.on('pageerror',e=>errors.push(client+': '+e.message));page.on('dialog',d=>d.accept());
  await page.route(u=>!String(u).startsWith(site),r=>r.abort());
  await cloud.attach(page,client,user);
  await page.goto(base+url);
  await page.waitForFunction(()=>document.readyState==='complete'&&typeof save==='function'&&(typeof exportJob==='function'||typeof exportProjectToMobile==='function')&&typeof (0,eval)('typeof state!=="undefined"&&state')==='object');
  await page.waitForTimeout(500);
  return page;
 }
 const studio=await open('studio','/Studio.html'),mobile=await open('mobile','/Mobile.html');
 const S=(fn,a)=>studio.evaluate(fn,a),M=(fn,a)=>mobile.evaluate(fn,a);
 await S(async()=>{
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const P=(id,code,name,l,w,extra)=>({id,code,name,length:l,width:w,thickness:18,qty:1,material:'Oak',edgeLong:0,edgeShort:0,notes:'',status:'ready',x:20,y:20,copies:[],...extra});
  const a=P('fa','P-001','Side',700,500),b=P('fb','P-002','Top',800,500),u=P('fu','P-003','',900,'');
  a.reviewSignature=window.panelReviewSignature(a);
  const st=(0,eval)('state');
  st.projects.push({id:'mj',name:'Mobile filter job',customer:'Mo',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'mc',roomId:'r1',name:'Kitchen',drawing,drawingType:'image',parts:[a,b,u]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));save();
  await exportProjectToMobile(st.projects.find(x=>x.id==='mj'));
 });
 const mobileCodes=()=>M(()=>{const p=(0,eval)('state').projects.find(x=>x.id==='mj');return p?p.cabinets[0].parts.map(x=>x.code):null});
 const studioCodes=()=>S(()=>(0,eval)('state').projects.find(x=>x.id==='mj').cabinets[0].parts.map(x=>x.code));
 await until(()=>mobileCodes(),'job reaches Mobile');
 assert.deepEqual(await mobileCodes(),['P-001','P-002'],'Mobile gets only finished panels');
 assert.deepEqual(await S(()=>(0,eval)('state').projects.find(x=>x.id==='mj').cuttingList.map(x=>x.code)),['P-001','P-002'],'the Mobile cutting list too');
 assert.deepEqual(await studioCodes(),['P-001','P-002','P-003'],'Studio keeps the unfinished panel');
 // An update from Mobile comes back: Studio still has it.
 await M(async()=>{const p=(0,eval)('state').projects.find(x=>x.id==='mj');p.cabinets[0].parts[0].scannedQty=1;p.cabinets[0].parts[0].lastScannedAt=new Date().toISOString();save();await exportJob('mj',true)});
 await until(()=>S(()=>(0,eval)('state').projects.find(x=>x.id==='mj').cabinets[0].parts[0].scannedQty===1),'Mobile update reaches Studio');
 assert.deepEqual(await studioCodes(),['P-001','P-002','P-003'],'still there after the Mobile update');
 // Finished in Studio and sent again: now it reaches Mobile.
 await S(async()=>{const p=(0,eval)('state').projects.find(x=>x.id==='mj');const u=p.cabinets[0].parts[2];u.name='Back';u.width=600;save();await exportProjectToMobile(p)});
 await until(()=>mobileCodes().then(c=>c&&c.length===3),'finished panel reaches Mobile');
 assert.deepEqual(await mobileCodes(),['P-001','P-002','P-003']);
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
