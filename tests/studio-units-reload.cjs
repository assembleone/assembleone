// Opening or refreshing Studio must never change a panel's size, in any unit. Found on the
// live Studio (24 Sep 2026): with units set to cm, every open with a panel selected
// multiplied that panel's length, width and thickness by 10, because the form was filled
// in millimetres before the unit helpers loaded and then read back as centimetres.
// Runs the real Studio loader, reloads five times per unit with a panel selected on the
// drawing screen, and checks every panel is unchanged. Then checks that typing a size in
// cm still saves the right millimetres and keeps them across reloads.
const {chromium}=require('playwright');
const path=require('node:path'),assert=require('node:assert/strict');
const http=require('node:http'),fs=require('node:fs');
function serve(root){const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});return new Promise(r=>server.listen(0,'127.0.0.1',()=>r({server,base:'http://127.0.0.1:'+server.address().port})))}
const panels=()=>[
 {id:'p1',code:'P-001',name:'Side',length:667,width:250,thickness:19,qty:1,material:'Oak',status:'ready',x:10,y:10,copies:[]},
 {id:'p2',code:'P-002',name:'Shelf',length:1200.5,width:600,thickness:18,qty:2,material:'Oak',status:'ready',x:30,y:30,copies:[]},
 {id:'p3',code:'P-003',name:'Back',length:2400,width:1220,thickness:6,qty:1,material:'MDF',status:'ready',x:50,y:50,copies:[]}];
const sizes=st=>st.projects[0].cabinets[0].parts.map(p=>[p.code,p.length,p.width,p.thickness].join(' '));
(async()=>{
 const {server,base}=await serve(path.resolve(__dirname,'..'));let browser;
 try{
 browser=await chromium.launch({headless:true});
 for(const units of ['mm','cm','in']){
  const page=await browser.newPage();page.on('dialog',d=>d.accept());
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
  await page.goto(base+'/tests/');
  const seed={units,screen:'mark',currentProject:'j',currentCabinet:'c',currentPart:'p1',projects:[{id:'j',name:'Job',customer:'C',rooms:[],cabinets:[{id:'c',name:'Unit',parts:panels()}]}],customers:[]};
  await page.evaluate(s=>{localStorage.clear();indexedDB.deleteDatabase('assembleone_stable_v1');localStorage.setItem('buildSOS_v12',JSON.stringify(s))},seed);
  const expected=sizes(seed);
  for(let i=1;i<=5;i++){
   await page.goto(base+'/Studio.html');
   // Past the 4-second autosave, so the automatic read-back has run at least once.
   await page.waitForTimeout(5500);
   assert.deepEqual(await page.evaluate(()=>(0,eval)('state').units),units);
   const now=await page.evaluate(()=>JSON.parse(localStorage.getItem('buildSOS_v12')));
   assert.deepEqual(sizes(now),expected,units+': sizes unchanged after open number '+i);
  }
  // Also after moving between panels and screens and reopening.
  await page.evaluate(()=>{state.currentPart='p2';renderAll();show('cutting');show('mark')});
  await page.waitForTimeout(4500);await page.goto(base+'/Studio.html');await page.waitForTimeout(5500);
  assert.deepEqual(sizes(await page.evaluate(()=>JSON.parse(localStorage.getItem('buildSOS_v12')))),expected,units+': unchanged after switching panels and reopening');
  // The form shows the selected panel in the chosen unit.
  const shown=await page.evaluate(()=>['fLength','fWidth','fThickness'].map(id=>document.getElementById(id).value));
  const f={mm:1,cm:10,in:25.4}[units];
  assert.deepEqual(shown.map(Number),[1200.5,600,18].map(v=>Math.round(v/f*100)/100),units+': form shows the chosen unit');
  // Typing a real change still saves it, and it survives reopening.
  if(units==='cm'){
   await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';state.currentPart='p1';renderAll();show('mark')});
   await page.fill('#fLength','70');await page.dispatchEvent('#fLength','input');await page.dispatchEvent('#fLength','change');
   await page.waitForTimeout(4500);
   for(let i=0;i<2;i++){await page.goto(base+'/Studio.html');await page.waitForTimeout(5500)}
   const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('buildSOS_v12')).projects[0].cabinets[0].parts[0]);
   assert.deepEqual([after.length,after.width,after.thickness],[700,250,19],'typing 70 cm saves 700 mm and nothing else changes');
  }
  assert.deepEqual(errors,[],units+': no page errors');
  await page.close();
  console.log(units+': 5 opens and a panel switch, sizes unchanged');
 }
 console.log('PASS: opening or refreshing Studio never changes a panel size in mm, cm or inches; typed changes still save correctly.');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
