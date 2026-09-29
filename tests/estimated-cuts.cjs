// Shopping List CUTTING: estimated supplier saw cuts from the existing sheet layout.
//  - the packer only COUNTS: for known cases the count is right (a panel filling the usable
//    board: 0; a smaller panel: 2; strips share their cuts; 20 shelves 800x300 on 2440x1220: 27),
//    and on several jobs the layouts and sheet counts are identical to the packer as it was
//    before cuts were counted (frozen copy below);
//  - Shopping List (real clicks): a CUTTING section after Edge Banding, one line per sheet
//    group, "Estimated cuts: N", unpriced it says so and counts as an item with no price;
//    a €/cut price ("0,87") gives N × price and joins Estimated supplier cost; it is
//    remembered after a reload and prefilled on another job;
//  - the €/cut price never enters job data, supplier rows or a saved Cutting List.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
// The sheet packer exactly as it was before estimated cuts were added (for comparison only).
const OLD_PACK="function pack(pieces,sheetW,sheetH,kerf,allowRotate,trim){\n    kerf=Math.max(0,Number(kerf)||0);\n    trim=Math.max(0,Number(trim)||0);\n    var usableW=Math.max(1,sheetW-2*trim),usableH=Math.max(1,sheetH-2*trim);\n    var order=pieces.slice().sort(function(a,b){return Math.max(b.w,b.h)-Math.max(a.w,a.h)||(b.w*b.h-a.w*a.h)});\n    var sheets=[],unplaced=[];\n    function fitsSheet(p){\n      if(p.w<=usableW&&p.h<=usableH)return true;\n      if(allowRotate&&p.h<=usableW&&p.w<=usableH)return true;\n      return false;\n    }\n    function orientations(p){\n      var out=[{w:p.w,h:p.h,rot:false}];\n      if(allowRotate&&p.w!==p.h)out.push({w:p.h,h:p.w,rot:true});\n      return out;\n    }\n    function place(sheet,rectIndex,orient,piece){\n      var r=sheet.free[rectIndex];\n      sheet.free.splice(rectIndex,1);\n      sheet.placements.push({x:r.x,y:r.y,w:orient.w,h:orient.h,rot:orient.rot,code:piece.code,name:piece.name});\n      var rightW=r.w-orient.w-kerf; if(rightW<0)rightW=0;\n      var bottomH=r.h-orient.h-kerf; if(bottomH<0)bottomH=0;\n      var rects=[];\n      if(rightW<=bottomH){\n        if(rightW>0)rects.push({x:r.x+orient.w+kerf,y:r.y,w:rightW,h:r.h});\n        if(bottomH>0)rects.push({x:r.x,y:r.y+orient.h+kerf,w:orient.w,h:bottomH});\n      }else{\n        if(bottomH>0)rects.push({x:r.x,y:r.y+orient.h+kerf,w:r.w,h:bottomH});\n        if(rightW>0)rects.push({x:r.x+orient.w+kerf,y:r.y,w:rightW,h:orient.h});\n      }\n      rects.forEach(function(rr){if(rr.w>0.01&&rr.h>0.01)sheet.free.push(rr)});\n    }\n    order.forEach(function(piece){\n      if(!fitsSheet(piece)){unplaced.push(piece);return}\n      var best=null;\n      sheets.forEach(function(sheet){\n        sheet.free.forEach(function(rect,idx){\n          orientations(piece).forEach(function(orient){\n            if(orient.w<=rect.w+0.001&&orient.h<=rect.h+0.001){\n              var leftover=rect.w*rect.h-orient.w*orient.h;\n              if(!best||leftover<best.leftover)best={sheet:sheet,rectIndex:idx,orient:orient,leftover:leftover};\n            }\n          });\n        });\n      });\n      if(!best){\n        var sheet={w:sheetW,h:sheetH,placements:[],free:[{x:trim,y:trim,w:usableW,h:usableH}]};\n        sheets.push(sheet);\n        var idx=0,chosen=orientations(piece)[0];\n        orientations(piece).forEach(function(orient){if(orient.w<=usableW&&orient.h<=usableH)chosen=orient});\n        best={sheet:sheet,rectIndex:idx,orient:chosen,leftover:0};\n      }\n      place(best.sheet,best.rectIndex,best.orient,piece);\n    });\n    return {sheets:sheets,unplaced:unplaced};\n  }";
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1366,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/'),r=>r.abort());
 else await page.route(u=>!String(u).startsWith('http://127.0.0.1'),r=>r.abort());
 const url=process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`;
 const S=(fn,a)=>page.evaluate(fn,a);
 const load=async()=>{await page.goto(url);await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor'&&typeof window.a181Pack==='function'&&typeof window.fiqRenderShoppingList==='function');await page.waitForTimeout(900);
  await S(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none'})};
 await load();
 // A. The packer counts; known cases.
 const cuts=await S(()=>{const n=r=>r.sheets.reduce((a,s)=>a+(s.cuts||0),0);const P=(w,h,k)=>Array.from({length:k},()=>({w,h}));
  return {
   exact:n(a181Pack([{w:990,h:490}],1000,500,3,false,5)),
   smaller:n(a181Pack([{w:500,h:300}],1000,500,0,false,0)),
   strips:n(a181Pack(P(1000,100,3),1000,500,0,false,0)),
   shelves:(r=>[r.sheets.length,n(r)])(a181Pack(P(800,300,20),2440,1220,3,false,5))}});
 assert.equal(cuts.exact,0,'a panel filling the usable board needs no cut');
 assert.equal(cuts.smaller,2,'a smaller panel needs 2 cuts');
 assert.equal(cuts.strips,3,'3 full-width strips: 3 shared strip cuts, not 4 per panel (12)');
 assert.deepEqual(cuts.shelves,[2,27],'20 shelves 800 x 300 on 2440 x 1220: 2 sheets, 27 cuts');
 // Layouts and sheet counts identical to the packer before cuts were counted.
 const same=await S(oldSrc=>{const oldPack=new Function(oldSrc+';return pack;')();const P=(w,h,k)=>Array.from({length:k},(_,i)=>({w,h,code:'P'+i,name:'x'}));
  const jobs=[[[...P(2000,580,2),...P(764,560,6),...P(800,580,2),...P(764,100,2)],2800,2070,3,false,5],[[...P(720,560,16),...P(564,560,16),...P(564,100,16),...P(2400,150,2)],2800,2070,3,true,5],[P(800,300,20),2440,1220,3,false,5],[[...P(2600,600,1),...P(1200,400,5),...P(300,300,9)],2440,1220,4,true,10]];
  return jobs.map(([pieces,w,h,k,rot,trim])=>{const a=a181Pack(pieces,w,h,k,rot,trim),b=oldPack(pieces,w,h,k,rot,trim);const strip=r=>JSON.stringify({s:r.sheets.map(s=>s.placements),u:r.unplaced});return strip(a)===strip(b)&&a.sheets.length===b.sheets.length})},OLD_PACK);
 assert.deepEqual(same,[true,true,true,true],'placements, sheet counts and unplaced panels unchanged');
 // B. Shopping List.
 await S(()=>{
  const st=(0,eval)('state');
  const mk=(id,code,name,th,l,w,qty,mat)=>{const p={id,code,name,length:l,width:w,thickness:th,qty,material:mat,edgeLong:1,edgeShort:0,notes:'',status:'ready',x:10,y:10,copies:[]};p.reviewSignature=window.panelReviewSignature(p);return p};
  st.projects.push({id:'cj',name:'Cut job',customer:'Cleo',rooms:[{id:'cr',name:'Bedroom'}],cabinets:[{id:'cu',roomId:'cr',name:'Wardrobe',parts:[
   mk('c1','P-001','Side',19,2000,580,2,'White melamine'),mk('c2','P-002','Shelf',19,764,560,6,'White melamine'),mk('c3','P-003','Back',6,1990,740,1,'MDF')]}],jobLog:[],updatedAt:Date.now()});
  st.projects.push({id:'dj',name:'Other job',customer:'Dan',rooms:[{id:'dr',name:'Hall'}],cabinets:[{id:'du',roomId:'dr',name:'Hall unit',parts:[mk('d1','P-001','Side',19,900,300,2,'White melamine')]}],jobLog:[],updatedAt:Date.now()});
  st.projects.slice(-2).forEach(p=>ensureCustomerForProject(p));
  switchToProject('cj','cu');save();renderAll();show('parts');renderAll();
 });
 await page.waitForTimeout(400);
 const shop=()=>S(()=>{const b=document.querySelector('#fiqShoppingList [data-shopping-list]');const heads=[...b.querySelectorAll('.fiq-shop-head')].map(h=>h.textContent.trim());
  const groups=[...b.querySelectorAll('[data-shop-cut-group]')].map(r=>r.innerText.replace(/\s+/g,' ').trim());const row=b.querySelector('[data-shop-cuts]');
  return {heads,groups,label:row&&row.querySelector('[data-shop-label]').textContent,price:row&&row.querySelector('.fiq-price-input').value,line:row&&row.querySelector('[data-price-line]').textContent,
   total:b.querySelector('[data-supplier-cost] b').textContent,missing:b.querySelector('[data-supplier-cost-missing]').hidden?'':b.querySelector('[data-supplier-cost-missing]').textContent,text:b.innerText}});
 const expected=await S(()=>{const g=window.a181ComputeGroups(cabinet().parts.filter(p=>window.fiqPanelHasCompleteInfo(p)));return g.map(x=>[x.materialLabel+' · '+x.thickness+'mm',x.sheets.reduce((n,s)=>n+(s.cuts||0),0)])});
 let s=await shop();
 assert.deepEqual(s.heads,['Sheets','Edge Banding','Cutting','Hardware & Extras'],'CUTTING after Edge Banding');
 assert.deepEqual(s.groups,expected.map(([l,n])=>l+' '+n+' estimated cut'+(n===1?'':'s')),'one line per sheet group, counted from the sheet layout');
 const total=expected.reduce((n,x)=>n+x[1],0);
 assert.ok(total>0);assert.equal(s.label,'Estimated cuts: '+total);
 assert.equal(s.line,'cutting not priced','unpriced cutting says so');
 assert.match(s.missing,/items? ha(s|ve) no price/,'unpriced cutting counts as an item with no price');
 assert.match(s.text,/Estimated saw cuts/,'clearly an estimate');
 if(process.env.SHOT)await page.locator('#customerSheetEstimateCard').screenshot({path:process.env.SHOT+'/shopping-cutting-unpriced.png'});
 // Price per cut.
 const before=await S(()=>JSON.stringify((0,eval)('state').projects));
 const inp=page.locator('#fiqShoppingList [data-shop-cuts] .fiq-price-input');
 await inp.fill('0,87');await page.locator('#customerSheetEstimateCard .est-mat-title').click();await page.waitForTimeout(200);
 s=await shop();
 const e2=n=>'€'+(Math.round(n*100)/100).toFixed(2);
 assert.equal(s.price,'0.87');assert.equal(s.line,'= '+e2(total*0.87),'cuts × €/cut');
 assert.equal(s.total,e2(total*0.87),'included in Estimated supplier cost (only priced line)');
 if(process.env.SHOT)await page.locator('#customerSheetEstimateCard').screenshot({path:process.env.SHOT+'/shopping-cutting.png'});
 // Remembered: reload, and another job prefilled.
 await load();await S(()=>{switchToProject('cj','cu');renderAll();show('parts');renderAll()});await page.waitForTimeout(300);
 assert.equal((await shop()).price,'0.87','remembered after reload');
 await S(()=>{switchToProject('dj','du');renderAll();show('parts');renderAll()});await page.waitForTimeout(300);
 s=await shop();assert.equal(s.price,'0.87','prefilled on another job');assert.match(s.line,/^= €/);
 // Privacy: never in job data, supplier rows or a saved Cutting List; only in the browser price store.
 const leak=await S(()=>{switchToProject('cj','cu');const p=project();if(window.fiqRecordSentCuttingList)window.fiqRecordSentCuttingList(p,'cr','cu');
  const keys=Object.keys(localStorage).filter(k=>/supplier_prices/.test(k));
  return {state:JSON.stringify((0,eval)('state')),supplier:JSON.stringify(fiqSupplierDataset(p.cabinets[0].parts)),store:keys.map(k=>localStorage.getItem(k.replace(/^fiqbeta:/,''))).join('')}});
 for(const [where,txt] of [['job data',leak.state],['supplier rows',leak.supplier]]){assert.ok(!txt.includes('0.87'),'€/cut not in '+where);assert.ok(!txt.includes('cut|all'),'no price key in '+where)}
 assert.ok(leak.store.includes('"cut|all":0.87'),'kept in the browser price store');
 assert.equal(before.includes('0.87'),false);
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true,cuts:total}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
