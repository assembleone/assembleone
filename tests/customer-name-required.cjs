// A job cannot be sent to Job Overview without a customer name. Real clicks:
//  - a finished, checked job with a genuinely blank customer name: the Cutting List shows
//    "Customer name required." and no Send to Job Overview button; still so after a reload
//    and after going to another screen and back; a name of only spaces is also blank;
//  - the send itself refuses too (nothing is marked for Job Overview);
//  - "Add customer name" opens the job's Customer field, focused, marked required; Save with
//    it still blank keeps the dialog open; after typing a name you stay on the Cutting List
//    and Send to Job Overview works, and the job reaches Customer Library under that name.
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
 const errors=[],dialogs=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>{dialogs.push(d.message());d.accept()});
 if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/'),r=>r.abort());
 else await page.route(u=>!String(u).startsWith('http://127.0.0.1'),r=>r.abort());
 const url=process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`;
 const S=(fn,a)=>page.evaluate(fn,a);
 const load=async()=>{await page.goto(url);await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor'&&typeof window.fiqJobCustomerName==='function');await page.waitForTimeout(900);
  await S(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'})};
 await load();
 await S(()=>{
  const st=(0,eval)('state');
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const mk=(id,code,name,l,w,qty)=>{const p={id,code,name,length:l,width:w,thickness:19,qty,material:'White melamine',edgeLong:0,edgeShort:0,notes:'',status:'ready',x:20,y:40,copies:[]};p.reviewSignature=window.panelReviewSignature(p);return p};
  st.projects.push({id:'nc',name:'Hall cupboard',customer:'',rooms:[{id:'nr',name:'Hall'}],cabinets:[{id:'nu',roomId:'nr',name:'Hall',drawing,drawingType:'image',parts:[mk('n1','P-001','Side',2000,580,2),mk('n2','P-002','Shelf',764,560,1)]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));// the "No customer name" placeholder, as for a real blank job
  switchToProject('nc','nu');save();renderAll();show('cutting');renderAll();
 });
 await page.waitForTimeout(400);
 const blocked=async label=>{
  assert.equal(await S(()=>state.screen),'cutting',label+': on the Cutting List');
  assert.equal(await page.locator('#panelCheckReturnBtn').count(),0,label+': no Send to Job Overview');
  const box=page.locator('#cuttingListReturnStrip [data-customer-required]');
  assert.equal(await box.count(),1,label+': customer name required shown');
  assert.match(await box.innerText(),/Customer name required\./);
 };
 await blocked('blank customer');
 // The send itself refuses as well.
 const refused=await S(async()=>{try{await finishDesignToCard('nc');return 'sent'}catch(e){return e.message}});
 assert.equal(refused,'Customer name required.');
 assert.deepEqual(await S(()=>[state.currentProject,state.screen]),['nc','cutting'],'job still open, not sent');
 // Reload.
 await load();
 await S(()=>{switchToProject('nc','nu');show('cutting');renderAll()});await page.waitForTimeout(300);
 await blocked('after reload');
 // Another screen and back.
 await S(()=>{show('parts');renderAll()});await page.waitForTimeout(200);
 await S(()=>{show('cutting');renderAll()});await page.waitForTimeout(300);
 await blocked('after navigation');
 // Only spaces is still blank.
 await S(()=>{const p=state.projects.find(x=>x.id==='nc');p.customer='   ';save();renderAll()});await page.waitForTimeout(200);
 await blocked('spaces only');
 if(process.env.SHOT)await page.locator('#cuttingListReturnStrip').screenshot({path:process.env.SHOT+'/customer-required-strip.png'});
 // Add customer name: the Customer field, focused and marked required.
 await page.locator('#cuttingListReturnStrip [data-add-customer]').click();await page.waitForTimeout(300);
 assert.equal(await S(()=>document.activeElement&&document.activeElement.id),'a100Customer','customer field focused');
 if(process.env.SHOT)await page.screenshot({path:process.env.SHOT+'/customer-required-dialog.png'});
 assert.match(await page.locator('.a100-edit-dialog [data-customer-required]').innerText(),/Customer name required\./);
 await page.locator('#a100Customer').fill('  ');await page.locator('#a100Save').click();await page.waitForTimeout(200);
 assert.equal(await page.locator('.a100-edit-dialog').count(),1,'blank Save keeps the dialog open');
 await blocked('blank save');
 await page.locator('#a100Customer').fill('Jones Family');await page.locator('#a100Save').click();await page.waitForTimeout(400);
 assert.equal(await page.locator('.a100-edit-dialog').count(),0,'dialog closed');
 assert.equal(await page.locator('#cuttingListReturnStrip [data-customer-required]').count(),0);
 assert.equal(await S(()=>state.screen),'cutting','still on the Cutting List');
 await page.locator('#panelCheckReturnBtn').click();await page.waitForTimeout(700);
 const after=await S(()=>{const p=state.projects.find(x=>x.id==='nc');const c=(state.customers||[]).find(x=>x.id===p.customerId);return {open:state.currentProject,screen:state.screen,customer:p.customer,record:c&&c.name,sent:Object.keys(p.sentCuttingLists||{})}});
 assert.deepEqual(after,{open:null,screen:'jobs',customer:'Jones Family',record:'Jones Family',sent:['room:nr']},'sent under the customer name');
 assert.deepEqual(dialogs,[],'no alerts');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
