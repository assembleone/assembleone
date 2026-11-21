// Customer Library navigation (Beta): Library -> the job's real Cutting List / Drawing -> back to the same customer, nothing lost.
// Run: node tests/studio-library-navigation.cjs   (Playwright, air-gapped, throwaway profile)
const {chromium}=require('playwright');const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();const ctx=await browser.newContext({viewport:{width:1400,height:900}});const page=await ctx.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 const url=`http://127.0.0.1:${server.address().port}${process.env.FIQ_PAGE||'/beta/Studio.html'}`;
 async function open(){await page.goto(url);await page.waitForFunction(()=>typeof openCuttingListForRoom==='function'&&typeof save==='function');await page.waitForTimeout(800);await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'})}
 await open();
 const before=await page.evaluate(()=>{
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#cde"/></svg>');
  const mk=(id,n,l,q)=>{const p={id,code:'P-'+id,name:n,length:l,width:500,thickness:18,qty:q,material:'Oak',edgeLong:1,edgeShort:0,notes:'',status:'ready',x:20,y:30,copies:[]};p.reviewSignature=window.panelReviewSignature(p);return p};
  state.customers=[{id:'cA',name:'Anna Jensen',createdAt:1,updatedAt:1},{id:'cB',name:'Bo Hansen',createdAt:1,updatedAt:1}];
  state.projects.push({id:'pA',name:'Kitchen job',customer:'Anna Jensen',customerId:'cA',address:'1 High St',rooms:[{id:'rA',name:'Kitchen'}],cabinets:[{id:'kA',roomId:'rA',name:'Kitchen',drawing,parts:[mk('1','Side',720,2),mk('2','Shelf',500,3)]}],jobLog:[],updatedAt:Date.now()});
  state.projects.push({id:'pB',name:'Wardrobe job',customer:'Bo Hansen',customerId:'cB',rooms:[{id:'rB',name:'Bedroom'}],cabinets:[{id:'kB',roomId:'rB',name:'Wardrobe',parts:[mk('3','Door',2000,1)]}],jobLog:[],updatedAt:Date.now()});
  save();renderAll();return JSON.parse(JSON.stringify({projects:state.projects,customers:state.customers}));});
 const snap=()=>page.evaluate(()=>JSON.parse(JSON.stringify({projects:state.projects,customers:state.customers})));
 const where=()=>page.evaluate(()=>[state.screen,state.currentProject,state.currentCabinet].join('|'));
 // Library -> Cutting List
 await page.evaluate(()=>{show('customers');openCustomerCard('cA')});
 assert.match(await page.locator('[data-open-cutting-list-project="pA"]').innerText(),/Cutting List/,'row is labelled Cutting List');
 await page.locator('[data-open-cutting-list-project="pA"]').click();
 assert.equal(await where(),'cutting|pA|kA','opens the real job and its cutting list');
 const t=await page.locator('#screen-cutting').innerText();['Side','Shelf','720','500','Oak'].forEach(x=>assert(t.includes(x),'list shows '+x));
 assert.equal(await page.locator('#fiqLibBar').count(),1,'return bar shown');
 assert.match(await page.locator('#fiqLibBar').innerText(),/Anna Jensen/,'bar names the customer');
 // Drawing of the same job is the original one
 await page.evaluate(()=>show('mark'));
 assert.equal(await page.locator('#fiqLibBar').count(),1,'bar stays on the drawing');
 assert.ok(await page.evaluate(()=>!!project().cabinets[0].drawing&&project().cabinets[0].drawing.length>50),'original drawing present');
 // continue working: edit a note, go back
 await page.evaluate(()=>{const pt=project().cabinets[0].parts[0];pt.notes='Edited in job';pt.reviewSignature=window.panelReviewSignature(pt);save()});
 await page.locator('#fiqLibBar [data-lib-back]').click();
 assert.equal(await page.evaluate(()=>[state.screen,state.currentCustomerCard].join('|')),'customerCard|cA','back on Anna\'s card');
 assert.equal(await page.locator('#fiqLibBar').count(),0,'bar gone in the Library');
 const after=await snap();
 assert.equal(after.projects.length,2);assert.equal(after.customers.length,2);
 assert.equal(after.projects[0].cabinets[0].parts[0].notes,'Edited in job','work kept');
 assert.deepEqual(after.projects[0].cabinets[0].parts.map(p=>[p.name,p.length,p.width,p.qty]),before.projects[0].cabinets[0].parts.map(p=>[p.name,p.length,p.width,p.qty]),'dimensions unchanged');
 assert.equal(after.projects[0].cabinets[0].drawing,before.projects[0].cabinets[0].drawing,'drawing unchanged');
 assert.deepEqual(after.projects[1],before.projects[1],'other customer job untouched');
 // Job row (not the Cutting List button) opens the job hub; its Cutting List goes live too, Saved versions stays available
 await page.locator('[data-open-job-design-project="pA"]').first().click();
 assert.equal(await page.locator('[data-job-go="saved"]').count(),1,'saved versions still reachable');
 await page.locator('[data-job-go="cutting"]').click();
 assert.equal(await where(),'cutting|pA|kA','hub Cutting List opens the real list');
 await page.locator('#fiqLibBar [data-lib-back]').click();
 // Reaching Job Overview drops the bar
 await page.locator('[data-open-cutting-list-project="pA"]').click();
 await page.evaluate(()=>{show('jobs');renderAll()});
 assert.equal(await page.locator('#fiqLibBar').count(),0,'no bar in Job Overview');
 // Job Overview hub use never shows the bar
 await page.evaluate(()=>window.fiqOpenJobPage('pB','rB','kB'));await page.locator('[data-job-go="cutting"]').click();
 assert.equal(await where(),'cutting|pB|kB');assert.equal(await page.locator('#fiqLibBar').count(),0,'bar only when you came from the Library');
 // reload keeps data
 await page.evaluate(()=>{show('jobs');save()});await open();
 const re=await snap();assert.equal(re.projects.length,2);assert.equal(re.projects.find(p=>p.id==='pA').cabinets[0].parts[0].notes,'Edited in job');
 assert.deepEqual(errors,[],'no page errors: '+errors.join('|'));
 console.log('PASS studio-library-navigation');await browser.close();server.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
