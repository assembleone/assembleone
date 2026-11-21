// One check per improvement, on the BETA pages (Production files are only read, as a control).
const {chromium}=require('playwright');const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;const browser=await chromium.launch();
 const ctx=await browser.newContext({viewport:{width:1300,height:800}});await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 // 3. no "Studio" nav label (Beta), still present in Production (control: proves Production is untouched)
 const beta=fs.readFileSync(path.join(root,'beta/Studio-Recovery.html'),'utf8'),prod=fs.readFileSync(path.join(root,'Studio-Recovery.html'),'utf8');
 assert.ok(!/<small>Studio<\/small>\s*<\/aside>/.test(beta),'Beta: Studio label removed');assert.ok(/<small>Studio<\/small>\s*<\/aside>/.test(prod),'control: Production still has the label (not touched)');
 await page.goto(base+'/beta/Studio.html');await page.waitForFunction(()=>typeof save==='function'&&window.fiqEditor&&window.fiqBetaGuard,null,{timeout:60000});
 await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'});await page.waitForTimeout(1500);
 const nav=await page.evaluate(()=>[...document.querySelectorAll('aside *')].filter(e=>e.children.length===0&&/^Studio$/i.test(e.textContent.trim())&&e.getBoundingClientRect().width>0).length);assert.equal(nav,0,'no visible "Studio" label in the left navigation');
 // Beta identity + guard (1, 2 of the latest request)
 const id=await page.evaluate(()=>({banner:document.getElementById('fiqBetaBanner').textContent,frame:!!document.getElementById('fiqBetaFrame'),title:document.title}));
 assert.match(id.banner,/LIVE-DATA WRITES OFF/);assert.ok(id.frame);assert.match(id.title,/^BETA /);
 // 1. currencies
 await page.evaluate(()=>{const s=(0,eval)('state'),C=window.FiqEstimatorCore;s.customers.push({id:'c',name:'T'});s.projects.push({id:'j',name:'J',customer:'T',customerId:'c',rooms:[{id:'r',name:'R'}],jobLog:[],cabinets:[{id:'k',roomId:'r',name:'U',stage:'final',parts:[{id:'p',code:'P',name:'S',length:700,width:500,thickness:18,qty:2,material:'White',edgeLong:1,edgeShort:0}]}]});s.priceList=C.normalisePriceList({items:[C.makeItem({category:'sheet',name:'White 18 mm (2800 × 2070)',unit:'sheet',cost:45,sheet:{thickness:18,w:2800,h:2070}})]});save();window.fiqOpenEstimator('j')});
 await page.waitForSelector('#fiqxEst');await page.click('#fiqxEst [data-act="new"]');await page.waitForSelector('[data-eb="currency"]');
 assert.deepEqual(await page.$$eval('[data-eb="currency"] option',o=>o.map(x=>x.value)),['EUR','GBP','USD','DKK','SEK','NOK','CHF']);
 // 4. Custom Sheets UI reachable from the estimate and the price list
 assert.ok(await page.evaluate(()=>typeof window.fiqOpenCustomSheets==='function'));await page.click('#fiqxEst [data-act="pricelist"]');await page.waitForSelector('[data-plact="sheets"]');
 await page.click('[data-plact="sheets"]');await page.waitForSelector('#fiqxCS [data-csact="add"]');
 assert.match(await page.innerText('#fiqxCSStatus'),/switched OFF|this computer/i,'cloud saving is off by default on Beta');
 // 2. scanner guide is square in portrait phone and landscape (Mobile Beta)
 const m=await ctx.newPage();await m.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 for(const [w,h] of [[390,844],[844,390],[768,1024],[1280,720]]){
  await m.setViewportSize({width:w,height:h});await m.goto(base+'/beta/Mobile-Core.html');await m.waitForTimeout(800);
  const dims=await m.evaluate(()=>{const e=document.createElement('div');e.className='scan-frame';document.body.appendChild(e);const a=getComputedStyle(e,'::after');const d1=[parseFloat(a.width),parseFloat(a.height)];e.classList.add('number-mode');const b=getComputedStyle(e,'::after');return {qr:d1,num:[parseFloat(b.width),parseFloat(b.height)],content:a.content}});
  assert.ok(Math.abs(dims.qr[0]-dims.qr[1])<=2,`scanner guide square at ${w}x${h}: ${dims.qr}`);assert.ok(dims.qr[0]>=150,'guide is a usable size '+dims.qr);
 }
 assert.deepEqual(errors,[],errors.join('|'));console.log('PASS beta-five-improvements (currency, scanner, nav label, custom sheets, identity)');await browser.close();server.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
