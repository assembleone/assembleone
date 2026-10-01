// Proposed restore-history change (proposed-restore-history.patch): test.
// Runs the same real-click scenario on the CURRENT Studio code and on a PATCHED copy:
//   Customer Library -> delete job (real button, confirm accepted)
//   New Project -> Deleted Jobs (real button) -> Restore (real button)
// Proves: everything visible and every existing saved field behaves identically on both;
// only the patched copy adds state.jobLifecycle [deleted, restored], kept after reload.
//   node proposed-restore-history.test.cjs <currentRoot> <patchedRoot>
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const [CURRENT,PATCHED]=process.argv.slice(2).map(p=>path.resolve(p));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
function serve(root){return new Promise(r=>{const s=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});s.listen(0,'127.0.0.1',()=>r(s))})}
async function scenario(browser,root){
 const server=await serve(root);const ctx=await browser.newContext({viewport:{width:1366,height:900}});const page=await ctx.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 const url=`http://127.0.0.1:${server.address().port}/Studio.html`;
 const ready=async()=>{await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor'&&typeof window.openNewProjectLanding==='function');await page.waitForTimeout(700);await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'})};
 await page.goto(url);await ready();
 await page.evaluate(async()=>{const st=(0,eval)('state');
  st.customers.push({id:'lc-cust',name:'Lifecycle Customer',address:'Street 9',createdAt:1,updatedAt:1});
  st.projects.push({id:'lc-job',name:'Lifecycle kitchen',customer:'Lifecycle Customer',customerId:'lc-cust',rooms:[{id:'lc-r',name:'Kitchen'}],cabinets:[{id:'lc-u',roomId:'lc-r',name:'Unit',parts:[{id:'lc-p',code:'P-001',name:'Side',length:700,width:500,thickness:18,qty:2,material:'White',edgeLong:0,edgeShort:0,status:'ready',x:10,y:10,copies:[{x:20,y:10}]}]}],updatedAt:1});
  await window.a131StableSave(false)});
 await page.reload();await ready();
 const obs={};
 // Delete through the Customer Library.
 await page.evaluate(()=>{show('customers');openCustomerCard('lc-cust')});await page.waitForTimeout(400);
 await page.locator('.customer-row-overflow:has([data-delete-customer-job="lc-job"]) [data-overflow-toggle]').first().click();await page.waitForTimeout(200);// the job row's ⋮ menu
 await page.locator('[data-delete-customer-job="lc-job"]').first().click();await page.waitForTimeout(300);
 obs.afterDelete=await page.evaluate(()=>{const st=(0,eval)('state');return {inJobs:st.projects.some(p=>p.id==='lc-job'),inBin:(st.deletedProjects||[]).some(x=>x.project.id==='lc-job'),inDeletedIds:(st.deletedProjectIds||[]).includes('lc-job'),lifecycle:st.jobLifecycle||null}});
 // Deleted Jobs dialog through New Project.
 await page.evaluate(()=>window.openNewProjectLanding());await page.waitForTimeout(300);
 obs.landingText=(await page.locator('#newProjectLanding').innerText()).replace(/\s+/g,' ');
 await page.locator('#openDeletedJobs').click();await page.waitForTimeout(300);
 obs.deletedDialogText=(await page.locator('.deleted-jobs-list').innerText()).replace(/\s+/g,' ').replace(/Deleted [^·]*$/,'Deleted <date>');
 // Known display bug (reported, not fixed: frozen): the Deleted Jobs window opens behind
 // the New Project window, so a user closes New Project (×) first, then clicks Restore.
 await page.locator('.new-project-landing-close').click();await page.waitForTimeout(200);
 await page.locator('[data-restore-deleted="lc-job"]').click();await page.waitForTimeout(500);
 obs.afterRestore=await page.evaluate(()=>{const st=(0,eval)('state');const p=st.projects.find(x=>x.id==='lc-job');return {inJobs:!!p,customerId:p&&p.customerId,inBin:(st.deletedProjects||[]).some(x=>x.project.id==='lc-job'),inDeletedIds:(st.deletedProjectIds||[]).includes('lc-job'),job:p&&JSON.stringify(p)}});
 obs.landingAfterText=(await page.locator('#newProjectLanding').innerText().catch(()=>'')).replace(/\s+/g,' ');
 await page.evaluate(()=>window.a131StableSave(false));
 await page.reload();await ready();
 obs.afterReload=await page.evaluate(()=>{const st=JSON.parse(localStorage.getItem(STORE));const keys=Object.keys(st).sort();return {inJobs:st.projects.some(p=>p.id==='lc-job'),keys,lifecycle:st.jobLifecycle||null,bin:(st.deletedProjects||[]).length}});
 obs.errors=errors;
 await ctx.close();server.close();return obs;
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 let failed=0;const check=(name,fn)=>{try{fn();console.log('ok    '+name)}catch(e){failed++;console.log('FAIL  '+name+'\n      '+String(e.message).split('\n').slice(0,6).join('\n      '))}};
 try{
  const cur=await scenario(browser,CURRENT),pat=await scenario(browser,PATCHED);
  const strip=o=>JSON.parse(JSON.stringify(o,(k,v)=>k==='lifecycle'?undefined:v));
  check('Delete: same visible and saved result on current and patched code',()=>assert.deepEqual(strip(pat.afterDelete),strip(cur.afterDelete)));
  check('Delete really deleted (not in jobs, in recycle bin, id in deleted list)',()=>assert.deepEqual([cur.afterDelete.inJobs,cur.afterDelete.inBin,cur.afterDelete.inDeletedIds],[false,true,true]));
  check('New Project page text identical',()=>assert.equal(pat.landingText,cur.landingText));
  check('Deleted Jobs list text identical',()=>assert.equal(pat.deletedDialogText,cur.deletedDialogText));
  check('Restore: same visible and saved result (job back unchanged, bin entry and deleted id gone)',()=>{assert.deepEqual(pat.afterRestore,cur.afterRestore);assert.deepEqual([cur.afterRestore.inJobs,cur.afterRestore.customerId,cur.afterRestore.inBin,cur.afterRestore.inDeletedIds],[true,'lc-cust',false,false])});
  check('Page after restore identical',()=>assert.equal(pat.landingAfterText,cur.landingAfterText));
  check('Saved data identical apart from the one new field jobLifecycle',()=>assert.deepEqual(pat.afterReload.keys.filter(k=>k!=='jobLifecycle'),cur.afterReload.keys));
  check('Current code records no history (shows why the change is needed)',()=>assert.equal(cur.afterReload.lifecycle,null));
  check('Patched code records deleted then restored, with the original delete time, kept after reload',()=>{
   const l=pat.afterReload.lifecycle;assert.ok(Array.isArray(l)&&l.length===2,JSON.stringify(l));
   assert.deepEqual(l.map(e=>[e.jobId,e.event]),[['lc-job','deleted'],['lc-job','restored']]);
   assert.ok(l[0].at<=l[1].at&&l[1].deletedAt>0&&Math.abs(l[1].deletedAt-l[0].at)<5000);
  });
  check('No page errors on either',()=>assert.deepEqual([cur.errors,pat.errors],[[],[]]));
 }finally{await browser.close()}
 console.log('\n'+(failed?failed+' FAILED':'All restore-history checks passed'));process.exit(failed?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
