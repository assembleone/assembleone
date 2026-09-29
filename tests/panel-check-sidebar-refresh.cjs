// Leaving multi-job Panel Check through the sidebar Panel Check button redraws the open
// unit at once: before, the combined cards of every job stayed on screen and the Shopping
// List was blank until something else redrew. Real click on the sidebar button; the
// multi-job view is entered exactly as Job Overview's "check together" button does it.
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
 else await page.route(u=>!String(u).startsWith('http://127.0.0.1'),r=>r.abort());
 await page.goto(process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor'&&typeof window.fiqRenderShoppingList==='function');
 await page.waitForTimeout(900);
 const S=(fn,a)=>page.evaluate(fn,a);
 await S(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const st=(0,eval)('state');
  const mk=(id,code,name,mat)=>{const p={id,code,name,length:700,width:500,thickness:19,qty:1,material:mat,edgeLong:1,edgeShort:0,notes:'',status:'ready',x:10,y:10,copies:[]};p.reviewSignature=window.panelReviewSignature(p);return p};
  st.projects.push({id:'ja',name:'Alpha job',customer:'Alice',rooms:[{id:'ra',name:'Bedroom'}],cabinets:[{id:'ua',roomId:'ra',name:'Wardrobe A',parts:[mk('a1','P-001','Alpha side','White melamine'),mk('a2','P-002','Alpha shelf','White melamine')]}],jobLog:[],updatedAt:Date.now()});
  st.projects.push({id:'jb',name:'Beta job',customer:'Bob',rooms:[{id:'rb',name:'Kitchen'}],cabinets:[{id:'ub',roomId:'rb',name:'Base units',parts:[mk('b1','P-001','Beta side','Grey MFC')]}],jobLog:[],updatedAt:Date.now()});
  st.projects.slice(-2).forEach(p=>ensureCustomerForProject(p));
  switchToProject('jb','ub');save();renderAll();show('parts');renderAll();
  // Job Overview "check together" (a208 #jorBulkCheckBtn): set the multi-job view, renderAll, show.
  window.__jorCombinedCheck={active:true,cards:[{projectId:'ja',roomKey:'ra'},{projectId:'jb',roomKey:'rb'}]};
  renderAll();show('parts');
 });
 await page.waitForTimeout(400);
 const view=()=>S(()=>({names:[...document.querySelectorAll('#partsSummary .panel-check-card .panel-check-name')].map(x=>x.textContent.trim()),shop:(document.querySelector('#customerSheetEstimateCard [data-shopping-list]')||{}).innerText||''}));
 let v=await view();
 assert.deepEqual(v.names.slice().sort(),['Alpha shelf','Alpha side','Beta side'],'multi-job view shows both jobs');
 // Real click on the sidebar Panel Check button.
 await page.locator('.nav-btn[data-screen="parts"]').first().click();await page.waitForTimeout(500);
 v=await view();
 assert.equal(await S(()=>window.__jorCombinedCheck),null,'multi-job view ended');
 assert.deepEqual(v.names,['Beta side'],'only the open unit\'s cards');
 assert.match(v.shop,/This unit: Beta job · Kitchen · Base units/,'Shopping List redrawn for the open unit');
 assert.ok(!/White melamine|Alpha/.test(v.shop),'nothing from the other job');
 assert.deepEqual(await S(()=>[state.currentProject,state.currentCabinet,state.screen]),['jb','ub','parts'],'same open unit, same screen');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
