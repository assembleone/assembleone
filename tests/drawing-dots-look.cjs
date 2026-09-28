// Drawing dots on a busy drawing (appearance only). 70 panels plus repeated dots:
//  - ordinary dots are small (10 px) with a light shadow; the selected dot is unchanged:
//    48 px, numbered ("049"), same green glow as before;
//  - while a panel is selected every other dot is faded to 35 %; the dot under the mouse
//    grows back to 18 px at full opacity; clearing the selection brings all dots back;
//  - the expanded drawing uses slightly larger ordinary dots (12 px);
//  - every dot stays centred exactly on its saved coordinate, one dot per mark (no
//    clustering), and a click on a small dot still selects that panel (nothing added).
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
 await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor');
 await page.waitForTimeout(800);
 const S=(fn,a)=>page.evaluate(fn,a);
 await S(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const st=(0,eval)('state');
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900"><rect width="1400" height="900" fill="#f7f7f7"/>'+Array.from({length:9},(_,i)=>'<rect x="'+(40+i*150)+'" y="60" width="130" height="780" fill="none" stroke="#999" stroke-width="3"/>').join('')+'</svg>');
  const parts=[];
  for(let i=0;i<70;i++){const col=i%9,row=Math.floor(i/9);
   parts.push({id:'p'+i,code:'P-'+String(i+1).padStart(3,'0'),name:'Shelf',length:600,width:400,thickness:18,qty:1,material:'White melamine',edgeLong:0,edgeShort:0,notes:'',status:'ready',
    x:+(5+col*10.7+(row%2)*2.5).toFixed(2),y:+(10+row*10.5).toFixed(2),copies:i%10===3?[{x:+(8+col*10.7).toFixed(2),y:+(14+row*10.5).toFixed(2)}]:[]})}
  st.projects.push({id:'busy',name:'Busy wardrobe',customer:'Busy',rooms:[{id:'r',name:'Bedroom'}],cabinets:[{id:'c',roomId:'r',name:'Wall',drawing,drawingType:'image',parts}],jobLog:[]});
  ensureCustomerForProject(st.projects.at(-1));switchToProject('busy','c');state.currentPart=null;renderAll();show('mark');
 });
 await page.waitForTimeout(700);
 const look=()=>S(()=>[...document.querySelectorAll('#drawingCanvas .pin')].map(el=>{const cs=getComputedStyle(el),r=el.getBoundingClientRect(),c=document.getElementById('drawingCanvas').getBoundingClientRect();
  return {id:el.dataset.id,copy:el.dataset.copy,sel:el.classList.contains('selected'),w:cs.width,op:cs.opacity,shadow:cs.boxShadow,text:el.textContent,title:el.title,cx:(r.left+r.width/2-c.left)/c.width*100,cy:(r.top+r.height/2-c.top)/c.height*100}}));
 const marks=await S(()=>cabinet().parts.flatMap(p=>[{id:p.id,copy:'-1',x:p.x,y:p.y},...(p.copies||[]).map((m,i)=>({id:p.id,copy:String(i),x:m.x,y:m.y}))]));
 let dots=await look();
 assert.equal(dots.length,marks.length,'one dot per mark, no clustering');
 for(const m of marks){const d=dots.find(x=>x.id===m.id&&x.copy===m.copy);assert.ok(Math.abs(d.cx-m.x)<0.2&&Math.abs(d.cy-m.y)<0.2,'dot on its exact coordinate: '+m.id)}
 assert.ok(dots.every(d=>d.w==='10px'&&d.op==='1'),'ordinary dots small, full opacity');
 assert.equal(dots.find(d=>d.id==='p0').title,'P-001 — Shelf','panel number shown on hover (tooltip)');

 // Select P-049 by a real click on its small dot.
 const box=async id=>(await page.locator(`#drawingCanvas .pin[data-id="${id}"][data-copy="-1"]`).boundingBox());
 const b=await box('p48');
 await page.mouse.click(b.x+b.width/2,b.y+b.height/2);await page.waitForTimeout(400);
 assert.equal(await S(()=>state.currentPart),'p48','a click on a small dot selects it');
 assert.equal(await S(()=>cabinet().parts.length),70,'nothing added');
 dots=await look();
 const sel=dots.find(d=>d.sel);
 assert.deepEqual([sel.id,sel.w,sel.text,sel.op],['p48','48px','049','1'],'selected dot unchanged: large and numbered');
 assert.equal(sel.shadow,'rgba(69, 164, 62, 0.2) 0px 0px 0px 8px, rgba(0, 0, 0, 0.28) 0px 4px 13px 0px','same strong glow as before');
 assert.ok(dots.filter(d=>!d.sel).every(d=>d.op==='0.35'),'other dots faded');
 await S(()=>document.getElementById('fiqPinMenu')?.remove());
 if(process.env.SHOT){await S(()=>document.getElementById('drawingCanvas').scrollIntoView({block:'center'}));await page.locator('#drawingStage').screenshot({path:process.env.SHOT+'/busy-selected.png'})}
 // Hover: the dot grows back to full size and full opacity.
 const h=await box('p10');await page.mouse.move(h.x+h.width/2,h.y+h.height/2);await page.waitForTimeout(250);
 const hovered=(await look()).find(d=>d.id==='p10'&&d.copy==='-1');
 assert.deepEqual([hovered.w,hovered.op],['18px','1'],'hovered dot grows back');
 await page.mouse.move(5,5);
 // Clearing the selection brings every dot back.
 await S(()=>{state.currentPart=null;renderAll()});await page.waitForTimeout(300);
 assert.ok((await look()).every(d=>d.w==='10px'&&d.op==='1'),'all normal again');
 if(process.env.SHOT){await S(()=>document.getElementById('drawingCanvas').scrollIntoView({block:'center'}));await page.locator('#drawingStage').screenshot({path:process.env.SHOT+'/busy-normal.png'})}
 // Expanded drawing: slightly larger, still small.
 await S(()=>{document.getElementById('drawingStage').classList.add('expanded')});await page.waitForTimeout(300);
 assert.ok((await look()).every(d=>d.w==='12px'),'expanded: 12 px');
 await S(()=>{document.getElementById('drawingStage').classList.remove('expanded')});

 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true,dots:marks.length}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
