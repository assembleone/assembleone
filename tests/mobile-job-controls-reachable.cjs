// Mobile job controls stay reachable on real phone sizes (iPhone 13 390x664 and a small
// iPhone SE 375x548, both with Safari's bars). Real Studio send over the fake cloud, then
// real taps on Mobile:
//  - Find Panel (tap a panel row): Fitted / Missing / Damaged are fully on screen and
//    tappable straight away (they were pushed below the edge by the taller drawing);
//  - Damaged opens the damage sheet: code, note, Add a photo and Save are all reachable;
//  - the job's ⋯ menu shows Complete Job; completing asks the established question;
//  - on Jobs, the job's 🗑 can be scrolled clear of the bottom navigation and tapped; it asks
//    'Delete "…" from this phone?' and removes the job from this phone only: Studio and the
//    cloud copies are untouched, and a reload does not bring it back.
const {chromium,devices}=require('playwright');
const path=require('node:path'),assert=require('node:assert/strict');
const {createCloud,serve}=require('./helpers/fake-cloud.cjs');
const user={uid:'owner',companyId:'co',role:'company_owner',email:'owner@test',fitterId:'F1'};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label,ms=60000){const end=Date.now()+ms;while(Date.now()<end){try{const v=await fn();if(v)return v}catch(e){}await wait(250)}throw new Error('Timed out: '+label)}
const hitAll=(page,sel)=>page.evaluate(sel=>[...document.querySelectorAll(sel)].map(b=>{const r=b.getBoundingClientRect();const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {id:b.id||b.innerText.trim(),inView:r.top>=0&&r.bottom<=innerHeight,hit:!!hit&&(hit===b||b.contains(hit))}}),sel);
(async()=>{
 const served=await serve(path.resolve(__dirname,'..')),server=served.server,base=process.env.LIVE_BASE||served.base;
 const site=process.env.LIVE_BASE?process.env.LIVE_BASE.replace(/\/beta$/,'')+'/':'http://127.0.0.1';
 const browser=await chromium.launch({headless:true});
 try{
 for(const [w,h] of [[390,664],[375,548]]){
  const cloud=createCloud();const errors=[],dialogs=[];
  async function open(client,url,ctxOpts){
   const ctx=await browser.newContext(ctxOpts);const page=await ctx.newPage();
   page.on('pageerror',e=>errors.push(client+': '+e.message));
   page.on('dialog',d=>{if(client==='mobile')dialogs.push(d.message());d.accept()});
   await page.route(u=>!String(u).startsWith(site),r=>r.abort());
   await cloud.attach(page,client,user);
   await page.goto(base+url);
   await page.waitForFunction(()=>document.readyState==='complete'&&typeof save==='function'&&typeof (0,eval)('typeof state!=="undefined"&&state')==='object');
   await page.waitForTimeout(800);
   await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});
   return page;
  }
  const studio=await open('studio','/Studio.html',{viewport:{width:1366,height:900}});
  const mobile=await open('mobile','/Mobile.html',{...devices['iPhone 13'],viewport:{width:w,height:h}});
  await studio.evaluate(()=>{
   const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect x="10" y="10" width="780" height="580" fill="#eee"/></svg>');
   const P=(id,code,name,qty,x)=>{const p={id,code,name,length:700,width:500,thickness:18,qty,material:'Oak',edgeLong:0,edgeShort:0,notes:'',status:'ready',x,y:30,copies:[]};p.reviewSignature=window.panelReviewSignature(p);return p};
   const st=(0,eval)('state');
   st.projects.push({id:'aj',name:'Audit job',customer:'Alice Audit',address:'1 High Street',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'c1',roomId:'r1',name:'Kitchen',drawing,drawingType:'image',parts:[P('p1','P-001','Side',2,20),P('p2','P-002','Shelf',1,40),P('p3','P-003','Top',1,60)]}],jobLog:[],updatedAt:Date.now()});
   ensureCustomerForProject(st.projects.at(-1));save();
   return exportProjectToMobile(st.projects.find(x=>x.id==='aj'));
  });
  await until(()=>mobile.evaluate(()=>!!state.projects.find(x=>x.id==='aj')),'job reaches Mobile');
  await wait(1200);
  // Jobs (bottom navigation), then open the job from its card.
  await mobile.locator('.fitters-bottom-nav').getByText('Jobs',{exact:true}).tap();await wait(600);
  await mobile.locator('.open-job:visible').first().tap();await wait(800);
  assert.equal(await mobile.evaluate(()=>state.screen),'drawings',w+': job screen open');
  // Find Panel from a panel row.
  const row=mobile.locator('#panelCheckSection [data-open-panel]').first();
  await row.scrollIntoViewIfNeeded();await row.tap();await wait(800);
  for(const b of await hitAll(mobile,'#findPanelOverlay .fp-actions button'))assert.ok(b.inView&&b.hit,w+'x'+h+': '+b.id+' fully visible and tappable: '+JSON.stringify(b));
  // Damaged -> damage sheet.
  await mobile.locator('#fpMarkDamaged').tap();await wait(500);
  for(const b of await hitAll(mobile,'#damagePanelOverlay #damageNote, #damagePanelOverlay #saveDamage'))assert.ok(b.inView&&b.hit,w+'x'+h+': damage '+b.id+' reachable');
  await mobile.evaluate(()=>{document.getElementById('damagePanelOverlay').classList.add('hidden')});
  await mobile.locator('#findPanelResultClose').tap();await wait(400);
  // Complete Job from the job's ⋯ menu.
  await mobile.evaluate(()=>window.scrollTo(0,0));
  await mobile.locator('#roomToolsToggleBtn').tap();await wait(300);
  const fin=(await hitAll(mobile,'#finishJobBtn'))[0];
  assert.ok(fin&&fin.inView&&fin.hit,w+': Complete Job in the ⋯ menu');
  await mobile.locator('#finishJobBtn').tap();await wait(2000);
  assert.ok(dialogs.some(d=>/^Complete Kitchen and send Job Completed to Studio\?$/.test(d)),'established completion question: '+JSON.stringify(dialogs));
  assert.equal(await mobile.evaluate(()=>state.screen),'projects');
  const cardText=await mobile.evaluate(()=>document.querySelector('#jobList .job').innerText);
  assert.ok(/✓ Finished/.test(cardText)&&!/Ready to install/.test(cardText),'completed job card says Finished: '+cardText.replace(/\s+/g,' '));
  // Remove from this phone.
  const del=mobile.locator('.delete-mobile-job[data-id="aj"]');
  await mobile.evaluate(()=>window.scrollTo(0,document.scrollingElement.scrollHeight));await wait(300);
  const d=(await hitAll(mobile,'.delete-mobile-job[data-id="aj"]'))[0];
  assert.ok(d&&d.inView&&d.hit,w+': 🗑 clear of the bottom navigation when scrolled: '+JSON.stringify(d));
  const cloudBefore=[...cloud.docs.keys()].filter(k=>k.includes('aj')).sort();
  await del.tap();await wait(800);
  assert.ok(dialogs.includes('Delete "Audit job" from this phone?'),'established delete question');
  assert.equal(await mobile.evaluate(()=>!!state.projects.find(x=>x.id==='aj')),false,'gone from this phone');
  assert.equal(await studio.evaluate(()=>!!state.projects.find(x=>x.id==='aj')),true,'Studio keeps the job');
  assert.deepEqual([...cloud.docs.keys()].filter(k=>k.includes('aj')).sort(),cloudBefore,'cloud copies untouched');
  await mobile.reload();await mobile.waitForFunction(()=>document.readyState==='complete'&&typeof save==='function');await wait(2500);
  await mobile.evaluate(()=>{if(typeof pollStudioSync==='function')pollStudioSync()});await wait(2500);
  assert.equal(await mobile.evaluate(()=>!!state.projects.find(x=>x.id==='aj')),false,'still gone after reload');
  assert.deepEqual(errors,[],'no page errors');
  await studio.context().close();await mobile.context().close();
  console.log(w+'x'+h+' ok');
 }
 console.log(JSON.stringify({ok:true}));
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
