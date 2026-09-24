// An in-memory stand-in for the company's Firestore and Storage, shared by several real
// Studio and Mobile pages in one test. It behaves like Firebase where it matters for sync:
// equality queries, live listeners that report only changes, transactions, server
// timestamps, and never-overwritten Storage objects with stable download links.
// It also meters every client: documents read, bytes downloaded, writes, listener events,
// uploads, the same things Firebase bills for.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');

function createCloud(){
 const docs=new Map();            // path -> data
 const files=new Map();           // storage path -> {bytes,token}
 const listeners=new Map();       // id -> {client,page,query,ids:Set}
 const meters=new Map();          // client -> counters
 const hooks=[];                  // one-shot hooks: {op,match,run}
 let seq=0;
 const meter=c=>{if(!meters.has(c))meters.set(c,{queries:0,docReads:0,bytesDown:0,writes:0,listenerEvents:0,uploads:0,uploadBytes:0,urlChecks:0});return meters.get(c)};
 const size=d=>JSON.stringify(d||{}).length;
 const parent=p=>p.split('/').slice(0,-1).join('/');
 function stamp(data){
  return JSON.parse(JSON.stringify(data),(k,v)=>v&&typeof v==='object'&&v.__serverTimestamp?{seconds:Math.floor(Date.now()/1000),nanos:(++seq)%1e9}:v);
 }
 function matches(query,p,data){
  if(parent(p)!==query.path||!data)return false;
  return (query.filters||[]).every(f=>f.op==='=='?data[f.field]===f.value:true);
 }
 function run(query){return [...docs.entries()].filter(([p,d])=>matches(query,p,d)).map(([p,d])=>({id:p.split('/').pop(),path:p,data:d}))}
 function read(client,list){const m=meter(client);m.queries++;m.docReads+=Math.max(1,list.length);m.bytesDown+=list.reduce((n,d)=>n+size(d.data),0)}
 async function notify(p,before){
  const after=docs.get(p);
  for(const [id,l] of listeners){
   const was=before!==undefined&&matches(l.query,p,before),is=after!==undefined&&matches(l.query,p,after);
   if(!was&&!is)continue;
   const type=!was?'added':!is?'removed':'modified';
   const list=run(l.query);
   const m=meter(l.client);m.listenerEvents++;
   if(type!=='removed'){m.docReads++;m.bytesDown+=size(after)}
   const change={type,doc:{id:p.split('/').pop(),path:p,data:type==='removed'?before:after}};
   await l.page.evaluate(([id,res])=>window.__cloudEmit&&window.__cloudEmit(id,res),[id,{docs:list,changes:[change]}]).catch(()=>{});
  }
 }
 async function write(client,p,next){
  for(const h of hooks.slice()){if(h.op==='write'&&h.match(p,client)){hooks.splice(hooks.indexOf(h),1);await h.run()}}
  const before=docs.get(p);
  if(next===undefined)docs.delete(p);else docs.set(p,next);
  meter(client).writes++;
  await notify(p,before);
 }
 async function handle(client,page,op,a){
  switch(op){
   case 'getDocs':{const list=run(a);read(client,list);return {docs:list}}
   case 'getDoc':{
    for(const h of hooks.slice()){if(h.op==='getDoc'&&h.match(a.path,client)){hooks.splice(hooks.indexOf(h),1);await h.run()}}
    const d=docs.get(a.path);read(client,d?[{data:d}]:[]);return {id:a.path.split('/').pop(),path:a.path,exists:!!d,data:d};
   }
   case 'setDoc':await write(client,a.path,a.merge?{...(docs.get(a.path)||{}),...stamp(a.data)}:stamp(a.data));return {};
   case 'addDoc':{const id='auto'+(++seq);const p=a.path+'/'+id;await write(client,p,stamp(a.data));return {id,path:p}}
   case 'updateDoc':{if(!docs.has(a.path))throw new Error('not-found: '+a.path);await write(client,a.path,{...docs.get(a.path),...stamp(a.data)});return {}}
   case 'deleteDoc':await write(client,a.path,undefined);return {};
   case 'listen':{
    const list=run(a.query);listeners.set(a.id,{client,page,query:a.query});
    const m=meter(client);m.queries++;m.docReads+=Math.max(1,list.length);m.bytesDown+=list.reduce((n,d)=>n+size(d.data),0);
    setTimeout(()=>page.evaluate(([id,res])=>window.__cloudEmit&&window.__cloudEmit(id,res),[a.id,{docs:list,changes:list.map(d=>({type:'added',doc:d}))}]).catch(()=>{}),0);
    return {};
   }
   case 'unlisten':listeners.delete(a.id);return {};
   case 'upload':{const m=meter(client);m.uploads++;m.uploadBytes+=a.bytes;const prev=files.get(a.path);files.set(a.path,{bytes:a.bytes,token:prev?prev.token+'x':'t'+(++seq)});return {}}
   case 'url':{meter(client).urlChecks++;const f=files.get(a.path);return {url:f?'https://storage.test/'+encodeURIComponent(a.path)+'?token='+f.token:null}}
   case 'listAll':{const pre=a.path.replace(/\/$/,'')+'/';return {items:[...files.keys()].filter(k=>k.startsWith(pre)).map(k=>({fullPath:k}))}}
   case 'deleteObject':files.delete(a.path);meter(client).writes++;return {};
  }
  throw new Error('unknown op '+op);
 }
 async function attach(page,client,user){
  await page.exposeBinding('__cloudCall',async(src,op,json)=>JSON.stringify(await handle(client,page,op,JSON.parse(json))));
  await page.addInitScript(({user})=>{
   const call=(op,a)=>window.__cloudCall(op,JSON.stringify(a)).then(r=>JSON.parse(r));
   const mk=d=>({id:d.id,ref:{path:d.path,id:d.id},exists:()=>d.exists!==false&&d.data!==undefined,data:()=>d.data===undefined?undefined:JSON.parse(JSON.stringify(d.data))});
   const snap=res=>{const list=res.docs.map(mk);return {empty:!list.length,size:list.length,docs:list,forEach:f=>list.forEach(f),docChanges:()=>(res.changes||res.docs.map(d=>({type:'added',doc:d}))).map(c=>({type:c.type,doc:mk(c.doc)}))}};
   const q=x=>x.kind==='col'?{path:x.path,filters:[]}:{path:x.path,filters:x.filters};
   const listeners=new Map();
   window.__cloudEmit=(id,res)=>{const l=listeners.get(id);if(l)l(snap(res))};
   window.fiqFirestore={};window.fiqStorage={};
   window.fittersiqUser=user;
   window.fiqAuthFns={
    collection:(db,...p)=>({kind:'col',path:p.join('/')}),
    doc:(db,...p)=>({kind:'doc',path:p.join('/'),id:p[p.length-1]}),
    where:(field,op,value)=>({field,op,value}),
    query:(c,...w)=>({kind:'query',path:c.path,filters:w}),
    serverTimestamp:()=>({__serverTimestamp:true}),
    getDocs:async x=>snap(await call('getDocs',q(x))),
    getDoc:async r=>mk(await call('getDoc',{path:r.path})),
    setDoc:async(r,data,opt)=>{await call('setDoc',{path:r.path,data,merge:!!(opt&&opt.merge)})},
    addDoc:async(c,data)=>{const r=await call('addDoc',{path:c.path,data});return {id:r.id,path:r.path}},
    updateDoc:async(r,data)=>{await call('updateDoc',{path:r.path,data})},
    deleteDoc:async r=>{await call('deleteDoc',{path:r.path})},
    onSnapshot:(x,next)=>{const id=Math.random().toString(36).slice(2);listeners.set(id,next);call('listen',{id,query:q(x)});return()=>{listeners.delete(id);call('unlisten',{id})}},
    runTransaction:async(db,fn)=>{const writes=[];const tx={get:async r=>mk(await call('getDoc',{path:r.path})),set:(r,d)=>{writes.push(['setDoc',{path:r.path,data:d}]);return tx},update:(r,d)=>{writes.push(['updateDoc',{path:r.path,data:d}]);return tx}};const out=await fn(tx);for(const [op,a] of writes)await call(op,a);return out},
    onAuthStateChanged:()=>()=>{},signOut:async()=>{},httpsCallable:()=>async()=>({data:{}})
   };
   window.fiqStorageFns={
    ref:(s,p)=>({path:p,fullPath:p}),
    uploadString:async(r,v)=>{await call('upload',{path:r.path,bytes:String(v).length})},
    getDownloadURL:async r=>{const res=await call('url',{path:r.path});if(!res.url){const e=new Error('storage/object-not-found');e.code='storage/object-not-found';throw e}return res.url},
    listAll:async r=>{const res=await call('listAll',{path:r.path});return {items:res.items.map(i=>({fullPath:i.fullPath,path:i.fullPath})),prefixes:[]}},
    deleteObject:async r=>{await call('deleteObject',{path:r.path||r.fullPath})}
   };
  },{user});
 }
 // Write as a given client, exactly as that app would (used to make a phone write at a chosen moment).
 async function writeAs(client,p,data){await write(client,p,stamp(data))}
 return {docs,files,meters,meter,hooks,attach,writeAs,
  reset(){meters.clear()},
  snapshot(client){return {...meter(client)}},
  diff(a,b){const o={};for(const k in b)o[k]=b[k]-(a[k]||0);return o}};
}

// Static server for the working copy, so the real public loaders (Studio.html, Mobile.html)
// run with every patch they inject.
function serve(root){
 const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 return new Promise(r=>server.listen(0,'127.0.0.1',()=>r({server,base:'http://127.0.0.1:'+server.address().port})));
}
module.exports={createCloud,serve};
