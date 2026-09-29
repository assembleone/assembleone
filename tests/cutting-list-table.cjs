// Cutting List screen = supplier-style table. Real clicks:
//  - columns exactly: Panel No. | Part name | Thickness mm | Length mm | Width mm | Long edges |
//    Short edges | Quantity | Material | Notes, sizes in mm (also when Studio shows cm);
//  - rows are the open unit's checked panels only (an unchecked panel is not listed, as before),
//    in panel-number order, from the same rows Send to Job Overview saves (nothing stored);
//  - every row equals the Customer Library supplier CSV row for the same panel (the CSV the
//    carpenter sends; its Job and Room columns are left out on screen);
//  - Panel Check (green cards) and the supplier files are unchanged: the Production File
//    rows and the saved data are identical before and after viewing the table.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const parseCsv=t=>t.replace(/^﻿/,'').split(/\r\n/).filter(Boolean).map(l=>{const out=[];let cur='',q=false;for(let i=0;i<l.length;i++){const ch=l[i];if(q){if(ch==='"'&&l[i+1]==='"'){cur+='"';i++}else if(ch==='"')q=false;else cur+=ch}else if(ch==='"')q=true;else if(ch===','){out.push(cur);cur=''}else cur+=ch}out.push(cur);return out});
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:1366,height:900},acceptDownloads:true});
 const page=await ctx.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/')&&!String(u).startsWith('https://cdnjs.cloudflare.com/'),r=>r.abort());
 else await page.route(u=>{const x=String(u);return !(x.startsWith('http://127.0.0.1')||x.startsWith('https://cdnjs.cloudflare.com/'))},r=>r.abort());
 await page.goto(process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor'&&typeof window.fiqCuttingListRows==='function');
 await page.waitForTimeout(900);
 const S=(fn,a)=>page.evaluate(fn,a);
 await S(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const st=(0,eval)('state');
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const mk=(id,code,name,th,l,w,qty,mat,eL,eS,notes,checked)=>{const p={id,code,name,length:l,width:w,thickness:th,qty,material:mat,edgeLong:eL,edgeShort:eS,notes,status:'ready',x:20,y:40,copies:[]};if(checked!==false)p.reviewSignature=window.panelReviewSignature(p);return p};
  st.projects.push({id:'tj',name:'Table job',customer:'Tess',rooms:[{id:'tr',name:'Bedroom'}],cabinets:[{id:'tu',roomId:'tr',name:'Wardrobe',drawing,drawingType:'image',parts:[
   mk('t2','P-002','Shelf',19,764,560,4,'White melamine',1,0,''),
   mk('t1','P-001','Side',19,2000,580,2,'White melamine',1,1,'LED channel 70 mm from front, "grain up"'),
   mk('t3','P-003','Back',6,1990,740,1,'MDF',0,0,''),
   mk('t4','P-004','Top',19,1200,580,1,'Oak veneer',2,1,'Scribe',false)]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));switchToProject('tj','tu');save();renderAll();show('parts');renderAll();
 });
 await page.waitForTimeout(400);
 const before=await S(()=>({data:JSON.stringify(state.projects.find(p=>p.id==='tj')),production:JSON.stringify(fiqSupplierDataset().rows),cards:document.getElementById('partsSummary').innerHTML}));
 // Studio set to cm: the table still shows mm.
 await S(()=>{state.units='cm';save();renderAll()});
 assert.equal(await S(()=>aoCurrentUnit()),'cm','Studio shows cm');
 await page.locator('.nav-btn[data-screen="cutting"]').first().click();await page.waitForTimeout(500);
 const table=await S(()=>{const t=document.querySelector('#supplierPanelCards [data-cutting-table]');return t?{head:[...t.tHead.rows[0].cells].map(c=>c.innerText.trim()),rows:[...t.tBodies[0].rows].map(r=>[...r.cells].map(c=>c.innerText.trim()))}:null});
 assert.ok(table,'the supplier-style table is shown');
 assert.deepEqual(table.head,['Panel No.','Part name','Thickness mm','Length mm','Width mm','Long edges','Short edges','Quantity','Material','Notes'],'exact column order, mm in the headings');
 assert.deepEqual(table.rows,[
  ['P-001','Side','19','2000','580','1','1','2','White melamine','LED channel 70 mm from front, "grain up"'],
  ['P-002','Shelf','19','764','560','1','0','4','White melamine',''],
  ['P-003','Back','6','1990','740','0','0','1','MDF','']],'checked panels of this unit, in mm, panel-number order; unchecked P-004 not listed');
 assert.equal(await page.locator('#supplierPanelCards .supplier-panel-card').count(),0,'the old panel cards are replaced');
 if(process.env.SHOT)await page.locator('#supplierPanelCards').screenshot({path:process.env.SHOT+'/cutting-list-table.png'});
 // Same rows as the Customer Library supplier CSV (the real export function, real download).
 const [dl]=await Promise.all([page.waitForEvent('download'),S(()=>exportCombinedSupplierCsv(['tj::tr']))]);
 const csv=parseCsv(fs.readFileSync(await dl.path(),'utf8'));
 assert.deepEqual(csv[0],['Job','Room','Panel No.','Part name','Thickness mm','Length mm','Width mm','Long edges','Short edges','Quantity','Material','Notes']);
 const csvRows=csv.slice(1).map(r=>r.slice(2)).sort((a,b)=>a[0].localeCompare(b[0]));
 assert.deepEqual(table.rows,csvRows,'every on-screen row equals the supplier CSV row (Job and Room aside)');
 // Nothing else changed: saved data, the Production File rows and the Panel Check cards.
 await S(()=>{state.units='mm';save();renderAll()});
 const after=await S(()=>({data:JSON.stringify(state.projects.find(p=>p.id==='tj')),production:JSON.stringify(fiqSupplierDataset().rows)}));
 assert.equal(after.data,before.data,'nothing stored');
 assert.equal(after.production,before.production,'Production File / PDF / sticker rows unchanged');
 await page.locator('.nav-btn[data-screen="parts"]').first().click();await page.waitForTimeout(400);
 assert.equal(await S(()=>document.getElementById('partsSummary').innerHTML),before.cards,'Panel Check cards unchanged');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
