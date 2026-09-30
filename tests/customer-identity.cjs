// Customer identity: a valid customer ID is the job's identity. Names never move a job
// away from it, same-name customers are never merged or deleted, and only a missing or
// broken link is recovered by name (carefully). Proves, through real reloads and the
// Customer Library:
//  1. customer renamed on the Customer Card + an older Mobile Site Measure still carrying
//     the old name -> the job stays with its customer (the Site Measure itself still lands);
//  2. two different customers with exactly the same name both survive, each keeps its job;
//  3. a job whose stored customer text differs from its linked customer keeps its ID;
//  4. broken/missing links are recovered: unique name -> that customer; same name twice ->
//     the one whose address/phone match the job, otherwise a separate new record; a New Job
//     still on the blank "No customer name" placeholder goes to the name typed on it;
//  5. repeated reloads + Customer Library renders create, delete and move nothing.
// Runs the real Studio loader with every network request blocked.
// FIQ_ROOT=<folder> runs it against another checkout (used to show it fails on old code).
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(process.env.FIQ_ROOT||path.resolve(__dirname,'..'));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;const failures=[];
 const check=(label,fn)=>{try{fn();console.log('ok  ',label)}catch(e){failures.push(label);console.log('FAIL',label,'\n     ',String(e.message).split('\n').slice(0,6).join('\n      '))}};
 try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1366,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 const ready=async()=>{await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor');await page.waitForTimeout(600)};
 const openLibrary=()=>page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';show('customers');renderCustomers()});
 const reload=async()=>{await page.reload();await ready();await openLibrary();await page.waitForTimeout(200)};
 await page.goto(`http://127.0.0.1:${server.address().port}/Studio.html`);
 await ready();
 await page.evaluate(()=>{
  const st=(0,eval)('state');
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const job=(id,name,customer,customerId,extra)=>Object.assign({id,name,customer,customerId,rooms:[{id:id+'r',name:'Kitchen'}],cabinets:[{id:id+'u',roomId:id+'r',name:'Unit',drawing,drawingType:'image',parts:[{id:id+'p',code:'P-001',name:'Side',length:700,width:500,thickness:18,qty:1,material:'White',edgeLong:0,edgeShort:0,status:'ready',x:20,y:20,copies:[]}]}],jobLog:[],updatedAt:Date.now()},extra||{});
  st.customers.push(
   {id:'cA',name:'Anna Berg',address:'Street 1',phone:'111',createdAt:1,updatedAt:1},
   {id:'cS1',name:'John Smith',address:'Palma 1',phone:'222',createdAt:1,updatedAt:1},
   {id:'cS2',name:'John Smith',address:'Soller 9',phone:'333',createdAt:1,updatedAt:1},
   {id:'cC',name:'Carla Ruiz',address:'Inca 3',phone:'444',createdAt:1,updatedAt:1},
   {id:'cD',name:'Dan Holm',address:'Alcudia 5',phone:'555',createdAt:1,updatedAt:1},
   {id:'cE',name:'Eva Lind',address:'Pollensa 7',phone:'666',createdAt:1,updatedAt:1},
   {id:'cP',name:'No customer name',address:'',phone:'',createdAt:1,updatedAt:1});
  st.projects.push(
   job('JA','Anna kitchen','Anna Berg','cA',{address:'Street 1',phone:'111'}),
   job('JS1','Palma wardrobe','John Smith','cS1',{address:'Palma 1',phone:'222'}),
   job('JS2','Soller kitchen','John Smith','cS2',{address:'Soller 9',phone:'333'}),
   job('JC','Carla bath','Dan Holm','cC'),                 // text names another existing customer
   job('JN','Carla office','Someone Else','cC'),           // text names nobody
   job('JD','Eva office','Eva Lind','cGONE'),              // broken link, unique name
   job('JF','Fresh job','Fresh Person',null,{address:'Deia 2',phone:'777'}), // no link, no match
   job('JG','Soller garage','John Smith','cGONE2',{address:'Soller 9',phone:''}), // broken, same name twice, address matches cS2
   job('JH','Mystery job','John Smith',null,{address:'Nowhere 0',phone:'999'}), // broken, same name twice, no detail match
   job('JP','New job','Eva Lind','cP'));                   // New Job placeholder, then the real name typed
  save();
 });
 // 1. Rename on the Customer Card, then an older Mobile Site Measure arrives with the old name.
 await page.evaluate(async()=>{
  updateCustomerDetails('cA',{name:'Anna Berg-Hansen'});save();
  const p=JSON.parse(JSON.stringify(state.projects.find(x=>x.id==='JA')));
  delete p.customerId;p.customer='Anna Berg';p.siteNotes='Whole site note from Mobile';
  await applyOneSitePacket({syncId:'sm-JA',exportedAt:new Date().toISOString(),project:p},false);
  save();
 });
 const snap=()=>page.evaluate(()=>{const st=(0,eval)('state');return {
  customers:st.customers.map(c=>({id:c.id,name:c.name,address:c.address||'',phone:c.phone||''})).sort((a,b)=>a.id<b.id?-1:1),
  links:Object.fromEntries(st.projects.filter(p=>/^J/.test(p.id)).map(p=>[p.id,p.customerId])),
  text:Object.fromEntries(st.projects.filter(p=>/^J/.test(p.id)).map(p=>[p.id,p.customer])),
  siteNotes:(st.projects.find(p=>p.id==='JA')||{}).siteNotes,
  library:[...document.querySelectorAll('#customersList [data-open-customer]')].map(b=>b.dataset.openCustomer)}});
 const s0=await snap();
 await reload();
 const s=await snap();
 const byId=id=>s.customers.find(c=>c.id===id);
 const named=n=>s.customers.filter(c=>c.name===n);

 check('1. rename + old Site Measure: job stays with its customer, no customer created',()=>{
  assert.equal(s.links.JA,'cA');
  assert.equal(byId('cA').name,'Anna Berg-Hansen');
  assert.equal(named('Anna Berg').length,0,'no new "Anna Berg" card');
  assert.equal(s.text.JA,'Anna Berg-Hansen','job keeps its customer name');
  assert.equal(s.siteNotes,'Whole site note from Mobile','the Site Measure itself still landed');
 });
 check('2. two customers with the same name both survive reload and Customer Library',()=>{
  assert.ok(byId('cS1')&&byId('cS2'),'both John Smith records kept');
  assert.deepEqual([byId('cS1').address,byId('cS2').address],['Palma 1','Soller 9']);
  assert.deepEqual([s.links.JS1,s.links.JS2],['cS1','cS2']);
  assert.ok(s.library.includes('cS1')&&s.library.includes('cS2'),'both shown in Customer Library');
 });
 check('3. valid customer IDs never change because the name differs',()=>{
  assert.deepEqual([s.links.JC,s.links.JN],['cC','cC']);
  assert.equal(named('Someone Else').length,0,'no customer created from the job text');
  assert.ok(byId('cD'),'Dan Holm untouched');
 });
 check('4. broken or missing links are recovered safely',()=>{
  assert.equal(s.links.JD,'cE','unique name -> that customer');
  const fresh=byId(s.links.JF);assert.ok(fresh&&fresh.name==='Fresh Person'&&fresh.address==='Deia 2','no match -> new record with the job details');
  assert.equal(s.links.JG,'cS2','same name twice -> the one whose address matches');
  assert.equal(s.links.JP,'cE','New Job placeholder -> the customer whose name was typed');
  const h=byId(s.links.JH);assert.ok(h&&h.id!=='cS1'&&h.id!=='cS2'&&h.name==='John Smith'&&h.address==='Nowhere 0','ambiguous -> separate new record, not attached to a stranger');
 });
 // 5. Idempotent: more reloads and Library renders change nothing.
 for(let i=0;i<3;i++){await reload();await page.evaluate(()=>{migrateCustomers();renderCustomers()})}
 const s2=await snap();
 check('5. repeated reloads/migrations create, delete and move nothing',()=>{
  // First load: every customer kept, every valid link kept, new records only for the two unrecoverable jobs.
  const valid=new Set(s0.customers.map(c=>c.id));
  s0.customers.forEach(c=>assert.ok(s2.customers.some(x=>x.id===c.id),'customer '+c.name+' ['+c.id+'] still exists'));
  Object.entries(s0.links).forEach(([j,id])=>{if(valid.has(id)&&id!=='cP')assert.equal(s2.links[j],id,'job '+j+' kept its customer')});
  assert.equal(s2.customers.length,s0.customers.length+2,'only JF and JH got new records');
  // Later loads: nothing changes at all.
  assert.deepEqual(s2.customers,s.customers);
  assert.deepEqual(s2.links,s.links);
  assert.deepEqual(s2.text,s.text);
 });
 check('no page errors',()=>assert.deepEqual(errors,[]));
 }finally{if(browser)await browser.close();server.close()}
 if(failures.length){console.log(`\n${failures.length} check(s) failed`);process.exit(1)}
 console.log('\ncustomer-identity: all checks passed');
})().catch(e=>{console.error(e);process.exit(1)});
