// Measurement row alignment, proved on screenshot pixels. Sets Thickness 19 | Length 2400 |
// Width 600 | Quantity 1 with 2 Length and 2 Width edges, finds each value's digit pixels and
// checks all four share one centre line, then cycles the edging (all 9 combinations, 3 rounds,
// plus real double-clicks) and checks the Length/Width digits never move. Also checks long
// values stay fully visible with the box height unchanged. Widths: 1366, 1024, 960, 820.
// Writes the red centre-line picture to the system temp folder.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),tag='measure-row',out=require('node:os').tmpdir();
(async()=>{
 const server=http.createServer((req,res)=>{let u=decodeURIComponent(req.url.split('?')[0]).replace(/^\/assembleone\//,'/');const f=path.join(root,u);if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch();
 const tool=await browser.newPage();
 // Glyph analysis in a plain page: decode the PNG and look for "ink" inside each value area.
 async function glyphs(png,areas){
  return tool.evaluate(async([b64,areas])=>{
   const img=new Image();img.src='data:image/png;base64,'+b64;await img.decode();
   const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);
   const d=x.getImageData(0,0,c.width,c.height).data;
   return areas.map(a=>{
    const bgi=((Math.round(a.y+2))*c.width+Math.round(a.x+2))*4;const bg=[d[bgi],d[bgi+1],d[bgi+2]];
    let top=1e9,bot=-1,left=1e9,right=-1;
    for(let yy=Math.round(a.y);yy<Math.round(a.y+a.h);yy++)for(let xx=Math.round(a.x);xx<Math.round(a.x+a.w);xx++){const i=(yy*c.width+xx)*4;const r=d[i],g=d[i+1],b=d[i+2];const ink=a.id==='fQty'?(g>r+40&&g<150&&r<90):(r<110&&g<110&&b<140);if(ink){if(yy<top)top=yy;if(yy>bot)bot=yy;if(xx<left)left=xx;if(xx>right)right=xx}}
    return {id:a.id,top,bot,left,right,centre:(top+bot)/2};
   });
  },[png.toString('base64'),areas]);
 }
 async function annotate(png,y,file){
  const b64=await tool.evaluate(async([b64,y])=>{const img=new Image();img.src='data:image/png;base64,'+b64;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);x.strokeStyle='rgba(230,0,0,.9)';x.lineWidth=1;x.beginPath();x.moveTo(0,y+.5);x.lineTo(c.width,y+.5);x.stroke();return c.toDataURL('image/png').split(',')[1]},[png.toString('base64'),y]);
  fs.writeFileSync(file,Buffer.from(b64,'base64'));
 }
 const results=[];
 for(const vp of JSON.parse(process.env.VPS||'[{"w":455,"h":820,"n":"third455"},{"w":512,"h":820,"n":"third512"},{"w":640,"h":820,"n":"third640"},{"w":820,"h":800,"n":"w820"},{"w":960,"h":900,"n":"w960"},{"w":1366,"h":760,"n":"laptop"}]')){
  const page=await browser.newPage({viewport:{width:vp.w,height:vp.h}});page.on('dialog',d=>d.accept());
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
  await page.goto(`http://127.0.0.1:${server.address().port}/${process.env.PAGE||'Studio.html'}`);
  await page.waitForFunction(()=>typeof createPartAt==='function'&&typeof window.fiqRenderUnits==='function');await page.waitForTimeout(900);
  await page.evaluate(()=>{document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
   const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#f4f4f4"/></svg>');
   const st=(0,eval)('state');st.projects.push({id:'d1',name:'J',customer:'Dora',defaultMaterial:'Egger Oak',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'c1',roomId:'r1',name:'Kitchen',drawing,drawingType:'image',parts:[{id:'a',code:'P-001',name:'Shelf',length:2400,width:600,thickness:19,qty:1,material:'Egger Oak',edgeLong:2,edgeShort:2,notes:'',status:'ready',x:30,y:30,copies:[]}]}],jobLog:[]});
   if(typeof ensureCustomerForProject==='function')ensureCustomerForProject(st.projects.at(-1));switchToProject('d1','c1');st.currentPart='a';renderAll();show('mark');
   const m=document.querySelector('#screen-mark .measure-entry-row');window.scrollTo(0,m.getBoundingClientRect().top+scrollY-200)});
  await page.waitForTimeout(600);
  const row=page.locator('#screen-mark .measure-entry-row');
  // Value areas: each input box (text only), relative to the row screenshot.
  const areas=()=>page.evaluate(()=>{const r=document.querySelector('#screen-mark .measure-entry-row').getBoundingClientRect();return ['fThickness','fLength','fWidth','fQty'].map(id=>{const b=document.getElementById(id).getBoundingClientRect();return {id,x:b.left-r.left+2,y:b.top-r.top+2,w:b.width-4,h:b.height-4}})});
  const A=await areas();
  const shot=await row.screenshot();
  const g=await glyphs(shot,A);
  const centres=g.map(x=>x.centre),spread=Math.max(...centres)-Math.min(...centres);
  const values=await page.evaluate(()=>['fThickness','fLength','fWidth','fQty'].map(id=>{const e=document.getElementById(id);return e.value+' @'+getComputedStyle(e).fontSize+(window.fiqTextFits(e)?'':' CUT OFF')}));
  const longCheck=await page.evaluate(()=>{const out=[];const cases={fThickness:['19','0.75','25.4'],fLength:['2400','94.49','12345','2400.5'],fWidth:['600','94.49','12345','2400.5'],fQty:['1','12','500']};for(const [id,vals] of Object.entries(cases))for(const v of vals){const e=document.getElementById(id);const dis=e.disabled;e.disabled=false;const old=e.value;const hb=e.getBoundingClientRect().height;e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));const fits=window.fiqTextFits(e),size=getComputedStyle(e).fontSize,ha=e.getBoundingClientRect().height;if(!fits||size!=='34px'||ha!==hb)out.push(id+'='+v+'@'+size+(fits?'':' CUT')+(ha!==hb?' HEIGHT CHANGED':''));e.value=old;e.dispatchEvent(new Event('input',{bubbles:true}));e.disabled=dis}return out});
  const mid=Math.round(centres.reduce((a,b)=>a+b,0)/centres.length);
  await annotate(shot,mid,path.join(out,`${tag}-${vp.n}-line.png`));
  // Cycle edging 0 -> 1 -> 2 on both, three full rounds, comparing the glyph boxes.
  const ref=g.filter(x=>x.id==='fLength'||x.id==='fWidth').map(x=>[x.top,x.bot,x.left,x.right].join(','));
  let moved=[];
  for(let round=0;round<3;round++)for(let L=0;L<3;L++)for(let W=0;W<3;W++){
   await page.evaluate(([L,W])=>{const p=cabinet().parts[0];p.edgeLong=L;p.edgeShort=W;updateEdgePreview()},[L,W]);
   await page.waitForTimeout(30);
   const a2=await areas();const s2=await row.screenshot();const g2=(await glyphs(s2,a2)).filter(x=>x.id==='fLength'||x.id==='fWidth').map(x=>[x.top,x.bot,x.left,x.right].join(','));
   if(JSON.stringify(g2)!==JSON.stringify(ref))moved.push(`L${L}W${W}: ${g2} vs ${ref}`);
   
  }
  // And with real double-clicks on the boxes (the way it is used).
  await page.evaluate(()=>{const p=cabinet().parts[0];p.edgeLong=2;p.edgeShort=2;updateEdgePreview()});
  for(let i=0;i<6;i++){await page.dblclick('#lengthMeasureWrap');await page.dblclick('#widthMeasureWrap');await page.evaluate(()=>{document.activeElement&&document.activeElement.blur();getSelection().removeAllRanges()});await page.waitForTimeout(30);const a3=await areas();const s3=await row.screenshot();const g3=(await glyphs(s3,a3)).filter(x=>x.id==='fLength'||x.id==='fWidth').map(x=>[x.top,x.bot,x.left,x.right].join(','));if(JSON.stringify(g3)!==JSON.stringify(ref))moved.push('dblclick '+i+': '+g3)}
  results.push({vp:vp.n,longCheck,values,centres,spread,moved:moved.length,movedSample:moved.slice(0,3),errors});
  await page.close();
 }
 for(const r of results){
  assert.ok(r.spread<=0.5,`${r.vp}: values not on one centre line ${r.centres}`);
  assert.equal(r.moved,0,`${r.vp}: Length/Width digits moved when edging changed ${r.movedSample}`);
  assert.deepEqual(r.values,['19 @34px','2400 @34px','600 @34px','1 @34px'],`${r.vp}: normal values full size and fully visible`);
  assert.ok(!r.longCheck.some(x=>/CUT|HEIGHT/.test(x)),`${r.vp}: long values visible and box height fixed ${r.longCheck}`);
  assert.deepEqual(r.errors,[],`${r.vp}: page errors`);
 }
 console.log(JSON.stringify(results.map(r=>({vp:r.vp,centres:r.centres,moved:r.moved,smaller:r.longCheck})),null,0));
 await browser.close();server.close();
})().catch(e=>{console.error(e);process.exit(1)});
