// Drawing's customer field never shows a customer when no job is open. Real clicks:
//  - job open in Drawing -> its customer is shown;
//  - Home (logo) closes the open job: Drawing is empty and the field blank; the job and
//    its panels stay saved exactly as they were; a click on the empty Drawing adds nothing
//    to the previous job;
//  - opening the job again (Customer Library row -> Drawing) shows its customer again;
//  - New Project closes the open job too, also when the New Project page is left without
//    starting anything; starting a completely new project gives a blank field;
//  - Send to Job Overview keeps clearing the field as before.
// Runs the real public Studio loader with every network request blocked.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1366,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/'),r=>r.abort());
 else await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 await page.goto(process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor'&&typeof window.fiqCloseOpenJob==='function');
 await page.waitForTimeout(800);
 const S=(fn,a)=>page.evaluate(fn,a);
 await S(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const st=(0,eval)('state');
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  st.projects.push({id:'pj',name:'Poo job',customer:'💩',rooms:[{id:'pr',name:'Kitchen'}],cabinets:[{id:'pu',roomId:'pr',name:'Kitchen unit',drawing,drawingType:'image',parts:[
   {id:'pp',code:'P-001',name:'Side',length:700,width:500,thickness:18,qty:1,material:'White melamine',edgeLong:0,edgeShort:0,notes:'',status:'ready',x:20,y:20,copies:[]}]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));
  switchToProject('pj','pu');renderAll();show('mark');
 });
 await page.waitForTimeout(400);
 const field=()=>S(()=>{const i=document.querySelector('.fiq-customer-search-input');return i?i.value:null});
 const job=()=>S(()=>state.currentProject);
 const drawingNav=async()=>{await page.locator('.nav-btn[data-screen="mark"]').first().click();await page.waitForTimeout(400)};
 const home=async()=>{await page.locator('.header-logo').click();await page.waitForTimeout(500)};
 const saved=()=>S(()=>JSON.stringify(JSON.parse(localStorage.getItem(STORE)).projects.find(p=>p.id==='pj').cabinets[0].parts));
 const savedBefore=await saved();

 assert.equal(await field(),'💩','open job shows its customer');
 // Home closes the job; Drawing empty, field blank, job kept.
 await home();
 assert.equal(await job(),null,'Home closed the open job');
 await drawingNav();
 assert.deepEqual([await S(()=>state.screen),await field()],['mark',''],'empty Drawing, blank customer field');
 assert.equal(await saved(),savedBefore,'the closed job is saved unchanged');
 // A click on the empty Drawing adds nothing to the previous job.
 const box=await page.locator('#drawingStage').boundingBox();
 if(box){await page.mouse.click(box.x+box.width/2,box.y+box.height/2);await page.waitForTimeout(300)}
 assert.equal(await S(()=>state.projects.find(p=>p.id==='pj').cabinets[0].parts.length),1,'nothing added to the previous job');
 // Opening the job again shows its customer.
 await S(()=>{const p=state.projects.find(x=>x.id==='pj');show('customers');openCustomerCard(p.customerId)});await page.waitForTimeout(400);
 await page.locator('#customerCardBody [data-open-job-design-project="pj"]').first().click();await page.waitForTimeout(300);
 await page.locator('.fiq-job-dialog [data-job-go="drawing"]').click();await page.waitForTimeout(400);
 assert.deepEqual([await job(),await field()],['pj','💩'],'deliberately opened: customer shown');
 // New Project closes it too, even when its page is left without starting a project.
 await home();
 await S(()=>{switchToProject('pj','pu');renderAll();show('jobs')});await page.waitForTimeout(300);
 assert.equal(await job(),'pj');
 await page.locator('#newJobBtn').click();await page.waitForTimeout(500);
 assert.equal(await job(),null,'New Project closed the open job');
 const closeLanding=page.locator('.new-project-landing-card button').filter({hasText:'×'}).first();
 if(await closeLanding.count())await closeLanding.click();await page.waitForTimeout(300);
 await drawingNav();
 assert.equal(await field(),'','blank after leaving New Project');
 // Starting a completely new project: blank field for the new job.
 await S(()=>show('jobs'));await page.locator('#newJobBtn').click();await page.waitForTimeout(500);
 await page.locator('#startBlankProject').click();await page.waitForTimeout(600);
 const newJob=await job();
 assert.ok(newJob&&newJob!=='pj','a new job is open');
 await S(()=>document.querySelectorAll('.a100-edit-dialog').forEach(d=>d.remove()));
 await drawingNav();
 assert.equal(await field(),'','new job without a customer: blank field');
 // Send to Job Overview still clears it.
 await S(()=>{switchToProject('pj','pu');renderAll();show('mark')});await page.waitForTimeout(300);
 assert.equal(await field(),'💩');
 await S(async()=>{await finishDesignToCard('pj')});await drawingNav();
 assert.deepEqual([await job(),await field()],[null,'']);
 assert.equal(await saved(),savedBefore,'the job itself never changed');

 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
