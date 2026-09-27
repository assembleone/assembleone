// Find Panel: a small solid target sits exactly on the dot Studio Drawing saved for the
// panel, inside the unchanged large circle. Real Studio and Mobile over the fake cloud.
// Panels with dots close together on a wide drawing (shorter than the drawing box, where
// a box-relative position would drift): for each panel, opened by tapping its card and by
// scanning its QR, the target's centre is measured in pixels against the saved Studio
// coordinate on the drawing image. Also a repeated-marker panel: each piece's own marker.
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
 async function open(ctx,client,url,viewport){
  const page=await ctx.newPage();if(viewport)await page.setViewportSize(viewport);
  page.on('pageerror',e=>errors.push(client+': '+e.message));page.on('dialog',d=>d.accept());
  await page.route(u=>!String(u).startsWith(site),r=>r.abort());
  await cloud.attach(page,client,user);
  await page.goto(base+url);
  await page.waitForFunction(()=>document.readyState==='complete'&&typeof save==='function'&&(typeof exportJob==='function'||typeof exportProjectToMobile==='function')&&typeof (0,eval)('typeof state!=="undefined"&&state')==='object');
  await page.waitForTimeout(500);
  if(client==='mobile')await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});
  return page;
 }
 const studio=await open(await browser.newContext(),'studio','/Studio.html');
 const mobile=await open(await browser.newContext(),'mobile','/Mobile.html',{width:390,height:844});
 const S=(fn,a)=>studio.evaluate(fn,a),M=(fn,a)=>mobile.evaluate(fn,a);
 // A detailed-looking wide drawing (3:1), so at phone width it is shorter than the box.
 const DOTS={'P-001':[50,50],'P-002':[52.5,50],'P-003':[50,54],'P-004':[53,54.5],'P-006':[81.3,22.7]};
 await S(async dots=>{
  const lines=Array.from({length:40},(_,i)=>`<line x1="${i*30}" y1="0" x2="${i*30}" y2="400" stroke="#999"/>`).join('');
  const drawing='data:image/svg+xml;base64,'+btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400"><rect width="1200" height="400" fill="#fafafa"/>${lines}</svg>`);
  const part=(id,code,x,y,qty,copies)=>{const p={id,code,name:'Shelf '+code,length:800,width:400,thickness:18,qty:qty||1,material:'White melamine',edgeLong:1,edgeShort:0,notes:'',status:'ready',x,y,copies:copies||[]};p.reviewSignature=window.panelReviewSignature(p);return p};
  const st=(0,eval)('state');
  st.projects.push({id:'dj',name:'Dot job',customer:'Dora Dot',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'dc',roomId:'r1',name:'Run',drawing,drawingType:'image',parts:[
   ...Object.entries(dots).map(([code,[x,y]],i)=>part('d'+i,code,x,y)),part('d9','P-009',30,60,3,[{x:31.5,y:60,status:'ready'},{x:33,y:60,status:'ready'}])]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));switchToProject('dj','dc');save();
  await exportProjectToMobile(st.projects.find(x=>x.id==='dj'));
 },DOTS);
 await until(()=>M(()=>!!(0,eval)('state').projects.find(x=>x.id==='dj')),'job reaches Mobile');
 const saved=await S(()=>{switchToProject('dj','dc');return Object.fromEntries(cabinet().parts.map(p=>[p.code,[p.x,p.y,(p.copies||[]).map(c=>[c.x,c.y])]]))});
 const qr=await S(()=>{switchToProject('dj','dc');const o={};fiqSupplierDataset().rows.forEach(r=>o[r.pieceRef]=r.qr);return o});

 // Where the target is, relative to where Studio's saved coordinate falls on the image.
 const measure=()=>M(()=>{const b=document.getElementById('findPanelResultBody');const img=b.querySelector('.panel-drawing img'),dot=b.querySelector('.fp-exact-dot'),circle=b.querySelector('.panel-highlight.active');
  const ir=img.getBoundingClientRect(),dr=dot.getBoundingClientRect(),cr=circle.getBoundingClientRect(),box=b.querySelector('.panel-drawing').getBoundingClientRect();
  const x=Number(dot.dataset.exactX),y=Number(dot.dataset.exactY),ex=ir.left+x/100*ir.width,ey=ir.top+y/100*ir.height;
  return {code:b.querySelector('.panel-big-code').innerText,x,y,dx:dr.left+dr.width/2-ex,dy:dr.top+dr.height/2-ey,cdx:cr.left+cr.width/2-ex,cdy:cr.top+cr.height/2-ey,size:[dr.width,dr.height],circle:[cr.width,cr.height],
   imgShorterThanBox:ir.height<box.height,dots:b.querySelectorAll('.fp-exact-dot').length}});
 const check=(m,code,[x,y],how)=>{
  assert.equal(m.code,code,how);assert.deepEqual([m.x,m.y],[x,y],how+': target uses the saved Studio coordinate');
  assert.ok(Math.abs(m.dx)<=0.6&&Math.abs(m.dy)<=0.6,how+': target on the exact point '+JSON.stringify(m));
  assert.ok(Math.abs(m.cdx)<=0.6&&Math.abs(m.cdy)<=0.6,how+': large circle centred on it');
  assert.deepEqual([m.size,m.circle,m.dots],[[12,12],[76,76],1],how+': small target, unchanged large circle');
 };
 const room=async()=>{await M(()=>{state.currentProject='dj';state.currentRoom='r1';closeFindPanelResult();save();show('drawings')});await mobile.waitForTimeout(250)};
 const card=code=>mobile.locator('#panelCheckSection .panel-check-row',{hasText:code+' ·'});
 let shown=null;
 for(const code of Object.keys(DOTS)){
  await room();await card(code).click();await mobile.waitForTimeout(300);
  const m=await measure();check(m,code,saved[code].slice(0,2),code+' card');shown=shown||m.imgShorterThanBox;
  if(code==='P-002')await mobile.screenshot({path:require('node:path').join(process.env.SHOT_DIR||require('node:os').tmpdir(),'find-exact-dot.png')});
  await M(t=>{closeFindPanelResult();state.scanMode='find';lastScannedQrText=null;handleDetectedQrText(t)},qr[code+'-1']);await mobile.waitForTimeout(300);
  check(await measure(),code,saved[code].slice(0,2),code+' QR scan');
 }
 assert.ok(shown,'the drawing is shorter than its box at phone width (the case a box-relative position gets wrong)');
 // Repeated markers: each piece's target on its own saved marker.
 const markers=[[saved['P-009'][0],saved['P-009'][1]],...saved['P-009'][2]];
 await M(()=>closeFindPanelResult());await room();await card('P-009').click();await mobile.waitForTimeout(300);
 for(const k of [1,2,3]){await mobile.locator(`[data-fp-piece="${k}"]`).click();await mobile.waitForTimeout(150);check(await measure(),'P-009',markers[k-1],'P-009 piece '+k)}
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true,panels:Object.keys(DOTS).length+1}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
