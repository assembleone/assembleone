// Deleted Jobs and restore history, with real clicks:
//  - delete a job from the Customer Library (row menu, confirm accepted);
//  - New Project -> Deleted Jobs opens ABOVE New Project: Restore and Delete forever are the
//    top element under the pointer and work on the FIRST click (they used to sit behind);
//  - Restore brings the job back unchanged; Delete forever removes only the recycle-bin copy
//    (the id stays in the deleted list, as before);
//  - state.jobLifecycle records deleted / restored (with the original delete time), kept
//    after reload; nothing about it is shown.
// Runs the real Studio loader with every network request blocked.
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
 const ready=async()=>{await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor'&&typeof window.openNewProjectLanding==='function');await page.waitForTimeout(700);await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'})};
 await page.goto(process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}/Studio.html`);await ready();
 await page.evaluate(async()=>{const st=(0,eval)('state');
  st.customers.push({id:'dj-c',name:'Deleted Jobs Customer',createdAt:1,updatedAt:1});
  for(const n of [1,2])st.projects.push({id:'dj-'+n,name:'Kitchen '+n,customer:'Deleted Jobs Customer',customerId:'dj-c',rooms:[{id:'dj-r'+n,name:'Kitchen'}],cabinets:[{id:'dj-u'+n,roomId:'dj-r'+n,name:'Unit',parts:[{id:'dj-p'+n,code:'P-001',name:'Side',length:700,width:500,thickness:18,qty:1,material:'White',edgeLong:0,edgeShort:0,status:'ready',x:10,y:10,copies:[]}]}],updatedAt:1});
  await window.a131StableSave(false)});
 await page.reload();await ready();
 const jobBefore=await page.evaluate(()=>JSON.stringify(state.projects.find(p=>p.id==='dj-1')));
 // Delete both jobs through the Customer Library row menu.
 for(const id of ['dj-1','dj-2']){
  await page.evaluate(()=>{show('customers');openCustomerCard('dj-c')});await page.waitForTimeout(300);
  await page.locator('.customer-row-overflow:has([data-delete-customer-job="'+id+'"]) [data-overflow-toggle]').first().click();await page.waitForTimeout(150);
  await page.locator('[data-delete-customer-job="'+id+'"]').first().click();await page.waitForTimeout(250);
 }
 const st1=await page.evaluate(()=>({jobs:state.projects.filter(p=>/^dj-/.test(p.id)).length,bin:state.deletedProjects.map(x=>x.project.id).sort(),ids:state.deletedProjectIds.filter(x=>/^dj-/.test(x)).sort()}));
 assert.deepEqual(st1,{jobs:0,bin:['dj-1','dj-2'],ids:['dj-1','dj-2']},'both deleted');
 const openDeleted=async()=>{await page.evaluate(()=>window.openNewProjectLanding());await page.waitForTimeout(250);await page.locator('#openDeletedJobs').click();await page.waitForTimeout(250)};
 const onTop=sel=>page.evaluate(s=>{const b=document.querySelector(s);const r=b.getBoundingClientRect();const top=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return !!top&&(top===b||b.contains(top))},sel);
 // Restore, first click.
 await openDeleted();
 assert.equal(await page.locator('#deletedJobsDialog h2').innerText(),'Deleted Jobs');
 assert.match(await page.locator('#deletedJobsDialog').innerText(),/Jobs can be restored for 30 days\./);
 assert.equal(await onTop('[data-restore-deleted="dj-1"]'),true,'Restore is on top (not behind New Project)');
 assert.equal(await onTop('[data-forget-deleted="dj-2"]'),true,'Delete forever is on top');
 await page.locator('[data-restore-deleted="dj-1"]').click();await page.waitForTimeout(400);
 const st2=await page.evaluate(()=>({job:JSON.stringify(state.projects.find(p=>p.id==='dj-1')||null),bin:state.deletedProjects.map(x=>x.project.id),ids:state.deletedProjectIds.filter(x=>/^dj-/.test(x))}));
 assert.equal(st2.job,jobBefore,'restored with one click, unchanged');
 assert.deepEqual([st2.bin,st2.ids],[['dj-2'],['dj-2']]);
 // Delete forever, first click.
 await page.evaluate(()=>{document.getElementById('newProjectLanding')?.remove();document.getElementById('deletedJobsDialog')?.remove()});
 await openDeleted();
 await page.locator('[data-forget-deleted="dj-2"]').click();await page.waitForTimeout(400);
 const st3=await page.evaluate(()=>({bin:state.deletedProjects.map(x=>x.project.id),ids:state.deletedProjectIds.filter(x=>/^dj-/.test(x))}));
 assert.deepEqual(st3,{bin:[],ids:['dj-2']},'Delete forever with one click removes the bin copy; the id stays deleted');
 // Close works with one click.
 await page.evaluate(()=>{document.getElementById('newProjectLanding')?.remove();document.getElementById('deletedJobsDialog')?.remove()});
 await openDeleted();await page.locator('[data-close-deleted]').click();await page.waitForTimeout(200);
 assert.equal(await page.locator('#deletedJobsDialog').count(),0,'Close works');
 // History recorded, kept after reload, not shown.
 await page.evaluate(()=>window.a131StableSave(false));
 await page.reload();await ready();
 const life=await page.evaluate(()=>(JSON.parse(localStorage.getItem(STORE)).jobLifecycle||[]).filter(e=>/^dj-/.test(e.jobId)));
 assert.deepEqual(life.map(e=>[e.jobId,e.event]),[['dj-1','deleted'],['dj-2','deleted'],['dj-1','restored']]);
 assert.ok(life[2].deletedAt>0&&Math.abs(life[2].deletedAt-life[0].at)<5000,'restore remembers the original delete time');
 assert.equal(await page.evaluate(()=>/jobLifecycle|lifecycle/i.test(document.body.innerText)),false,'nothing shown');
 assert.deepEqual(errors,[],'no page errors');
 console.log('PASS: Deleted Jobs opens above New Project; Restore and Delete forever work on the first click; delete/restore history recorded and kept, nothing shown.');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
