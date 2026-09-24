// Studio sync must not feed on itself. Measured on a real account (24 Sep 2026): Studio's own
// "received" marks fired the live listener, each event started another full import with no
// guard, and runs multiplied until Edge stopped the page with Out of Memory. This runs the
// real Studio loader against an in-memory stand-in for the company's cloud queue that behaves
// like Firestore (every write notifies the listener), with 20 phone updates for one job (19
// already received, 1 waiting) and one Site Measure waiting for acceptance.
// Pass: a bounded number of downloads and exactly one "received" write, the newest phone
// update applied, and the Site Measure left waiting for the owner.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 const base=`http://127.0.0.1:${server.address().port}`;
 // Studio's saved state: one installation job whose last known phone update is from before.
 const part=status=>({id:'pa',code:'P-001',name:'Side',length:700,width:500,thickness:18,qty:1,material:'Oak',status,statusUpdatedAt:status==='installed'?Date.parse('2026-09-15T05:47:00Z'):1});
 const job={id:'job1',name:'Kitchen job',customer:'Test Customer',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'c1',roomId:'r1',name:'Kitchen',parts:[part('ready')]}],jobLog:[],_lastMobilePacketAt:Date.parse('2026-09-14T10:49:00Z')};
 await page.goto(base+'/tests/');
 await page.evaluate(job=>{localStorage.clear();localStorage.setItem('buildSOS_v12',JSON.stringify({projects:[job],customers:[],screen:'jobs'}))},job);
 await page.addInitScript(()=>{
  const docs=new Map(),listeners=[];let ts=0;
  const C=window.__cloud={docs,counts:{siteGetDocs:0,updateDoc:0,events:0,concurrent:0,maxConcurrent:0}};
  const clone=x=>JSON.parse(JSON.stringify(x));
  // Like Firestore: every equality filter of a query applies, and a listener hears only about
  // documents entering, changing within, or leaving its result set.
  const fits=(filters,d)=>(filters||[]).every(f=>d[f.field]===f.value);
  function snapOf(filters,changes){
   const list=[...docs.entries()].filter(([,d])=>fits(filters,d)).map(([id,d])=>({id,ref:{path:'companies/co/jobs/'+id,id},data:()=>clone(d)}));
   return {empty:!list.length,size:list.length,docs:list,forEach:f=>list.forEach(f),docChanges:()=>changes||list.map(doc=>({type:'added',doc}))};
  }
  function emit(id,before){
   const d=docs.get(id);if(!d)return;
   listeners.forEach(l=>{const was=before?fits(l.filters,before):fits(l.filters,d),is=fits(l.filters,d);if(!was&&!is)return;C.counts.events++;l.next(snapOf(l.filters,[{type:!was?'added':!is?'removed':'modified',doc:{id,data:()=>clone(d)}}]))});
  }
  C.emitAdded=id=>emit(id,{});
  window.fiqFirestore={};
  window.fittersiqUser={uid:'owner',companyId:'co',role:'company_owner',email:'owner@test'};
  window.fiqAuthFns={
   collection:(db,...p)=>({path:p.join('/')}),
   where:(field,op,value)=>({field,op,value}),
   query:(c,...w)=>({...c,kind:(w.find(x=>x&&x.field==='kind')||{}).value,filters:w}),
   doc:(db,...p)=>({path:p.join('/'),id:p[p.length-1]}),
   serverTimestamp:()=>({ts:++ts}),
   getDocs:async q=>{if(q.kind==='siteJobPacket'){C.counts.siteGetDocs++;C.counts.concurrent++;C.counts.maxConcurrent=Math.max(C.counts.maxConcurrent,C.counts.concurrent)}await new Promise(r=>setTimeout(r,30));if(q.kind==='siteJobPacket')C.counts.concurrent--;return snapOf(q.filters)},
   getDoc:async ref=>({exists:()=>docs.has(ref.id),data:()=>clone(docs.get(ref.id))}),
   // Like Firestore: a write with a server timestamp notifies listeners locally and again
   // when the server confirms it.
   updateDoc:async(ref,data)=>{C.counts.updateDoc++;const d=docs.get(ref.id);if(!d)throw new Error('missing');const before=clone(d);Object.assign(d,clone(data));emit(ref.id,before);setTimeout(()=>emit(ref.id,clone(d)),5)},
   setDoc:async()=>{},addDoc:async()=>({id:'new'}),onAuthStateChanged:()=>()=>{},
   runTransaction:async(db,fn)=>{const writes=[];const tx={get:async r=>({exists:()=>docs.has(r.id),data:()=>clone(docs.get(r.id))}),update:(r,d)=>{writes.push([r,d]);return tx},set:(r,d)=>{writes.push([r,d]);return tx}};const out=await fn(tx);for(const [r,d] of writes)await window.fiqAuthFns.updateDoc(r,d);return out},
   onSnapshot:(q,next)=>{listeners.push({filters:q.filters,next});setTimeout(()=>next(snapOf(q.filters)),0);return()=>{}}
  };
  // 20 phone updates for job1 (the last one marks the panel installed) and one Site Measure.
  const phoneJob=status=>({id:'job1',studioOrigin:true,name:'Kitchen job',customer:'Test Customer',rooms:[{id:'r1',name:'Kitchen'}],cabinets:[{id:'c1',roomId:'r1',name:'Kitchen',parts:[{id:'pa',code:'P-001',name:'Side',length:700,width:500,thickness:18,qty:1,material:'Oak',status,statusUpdatedAt:status==='installed'?Date.parse('2026-09-15T05:47:00Z'):1}]}],jobLog:[]});
  for(let i=0;i<20;i++){
   const at=new Date(Date.parse('2026-09-14T10:50:00Z')+i*60000).toISOString();
   docs.set('pkt'+i,{kind:'siteJobPacket',status:i<19?'received':'waiting',exportedAt:i<19?at:'2026-09-15T05:47:01.003Z',project:phoneJob(i<19?'ready':'installed')});
  }
  docs.set('site1',{kind:'siteJobPacket',status:'waiting',exportedAt:'2026-09-15T06:00:00.000Z',project:{id:'site1',name:'New Site Job',customer:'Site Customer',rooms:[{id:'sr',name:'Bathroom',beforePhotos:['data:image/png;base64,AAAA']}],cabinets:[],jobLog:[]}});
 });
 await page.goto(base+'/Studio.html');
 await page.waitForFunction(()=>typeof autoImportSitePackets==='function');
 // The live listener attaches within 2s; give the queue time to settle (or run away).
 await page.waitForTimeout(8000);
 const r=await page.evaluate(()=>{const st=(0,eval)('state');const j=st.projects.find(p=>p.id==='job1');const s=st.projects.find(p=>p.id==='site1');return {counts:window.__cloud.counts,installed:j&&j.cabinets[0].parts[0].status,waitingPkt:window.__cloud.docs.get('pkt19').status,site:window.__cloud.docs.get('site1').status,siteInStudio:!!s,siteAwaiting:!!(s&&s.siteMeasureAwaitingAcceptance),jobCount:st.projects.filter(p=>p.id==='job1').length}});
 console.log(JSON.stringify(r.counts));
 assert.equal(r.counts.updateDoc,1,'exactly one "received" write: the one waiting phone update');
 assert(r.counts.siteGetDocs<=6,'a handful of queue downloads, not a pile-up (got '+r.counts.siteGetDocs+')');
 assert.equal(r.counts.maxConcurrent,1,'never two queue downloads at the same time');
 assert.equal(r.installed,'installed','newest phone update applied');
 assert.equal(r.waitingPkt,'received','waiting phone update acknowledged');
 assert.equal(r.site,'waiting','Site Measure stays waiting for the owner to accept');
 assert(r.siteInStudio&&r.siteAwaiting,'Site Measure is in Studio, awaiting acceptance');
 assert.equal(r.jobCount,1,'no duplicate job');
 // A new phone update arriving later is still picked up straight away.
 await page.evaluate(()=>{const d=window.__cloud.docs;const p=JSON.parse(JSON.stringify(d.get('pkt19')));p.status='waiting';p.exportedAt='2026-09-16T08:00:00.000Z';p.project.jobLog=[{id:'late-note',text:'Hinge loose',at:Date.parse('2026-09-16T08:00:00Z'),roomId:'r1'}];d.set('pkt20',p);window.__cloud.emitAdded('pkt20')});
 await page.waitForTimeout(500);
 const late=await page.evaluate(()=>({note:(0,eval)('state').projects.find(p=>p.id==='job1').jobLog.some(e=>e.id==='late-note'),status:window.__cloud.docs.get('pkt20').status,writes:window.__cloud.counts.updateDoc}));
 assert(late.note,'a later phone note arrives');assert.equal(late.status,'received');assert.equal(late.writes,2,'one more write for one more update');
 assert.deepEqual(errors,[],'no page errors');
 console.log('PASS: no self-triggered sync loop (one download at a time, one write per real update), newest phone update and later note applied, Site Measure left waiting, no duplicate job.');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
