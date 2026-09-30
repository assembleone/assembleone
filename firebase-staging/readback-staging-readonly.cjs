// READ-ONLY read-back of everything in the staging project's Firestore and the four test
// sign-ins (claims). fittersiq-staging only. GET / lookup / list calls only.
const path=require('node:path'),fs=require('node:fs');
const PROJECT='fittersiq-staging';
const FT=path.join(process.env.APPDATA,'npm','node_modules','firebase-tools','lib');
const {requireAuth}=require(path.join(FT,'requireAuth.js'));
const {Client}=require(path.join(FT,'apiv2.js'));
const authLib=require(path.join(FT,'auth.js'));
const val=v=>{if(!v)return v;const k=Object.keys(v)[0],x=v[k];
 if(k==='mapValue')return Object.fromEntries(Object.entries(x.fields||{}).map(([a,b])=>[a,val(b)]));
 if(k==='arrayValue')return (x.values||[]).map(val);if(k==='integerValue')return Number(x);if(k==='nullValue')return null;return x};
(async()=>{
 const o={project:PROJECT};authLib.setActiveAccount(o,authLib.selectAccount(undefined,__dirname));await requireAuth(o);
 const idt=new Client({urlPrefix:'https://identitytoolkit.googleapis.com'});
 const fsc=new Client({urlPrefix:'https://firestore.googleapis.com',apiVersion:'v1'});
 const base='/projects/'+PROJECT+'/databases/(default)/documents';
 const local=JSON.parse(fs.readFileSync(path.join(__dirname,'.staging-accounts.local.json'),'utf8'));
 const who=Object.fromEntries(Object.entries(local).map(([k,a])=>[a.uid,k]));
 const users=(await idt.post('/v1/projects/'+PROJECT+'/accounts:lookup',{localId:Object.keys(who)})).body.users||[];
 console.log('SIGN-INS (claims)');
 users.forEach(u=>console.log(' ',who[u.localId].padEnd(7),u.email,'| verified:',!!u.emailVerified,'| claims:',u.customAttributes||'none'));
 // Walk every document in the database (collections at top level and below).
 const all=[];
 async function walk(parent){
  const cols=(await fsc.post(parent+':listCollectionIds',{pageSize:100})).body.collectionIds||[];
  for(const c of cols){
   const docs=(await fsc.get(parent+'/'+c+'?pageSize=300&showMissing=true')).body.documents||[];
   for(const d of docs){const rel=d.name.split('/documents/')[1];all.push({path:rel,data:d.fields?Object.fromEntries(Object.entries(d.fields).map(([a,b])=>[a,val(b)])):'(no fields: parent of subcollections only)'});await walk(base+'/'+rel)}
  }
 }
 await walk(base);
 console.log('\nFIRESTORE ('+all.length+' documents)');
 const name=uid=>who[uid]?who[uid]+'('+uid.slice(0,6)+'…)':uid;
 for(const d of all.sort((a,b)=>a.path<b.path?-1:1)){
  const shown=d.path.split('/').map(s=>who[s]?name(s):s).join('/');
  const data=typeof d.data==='string'?d.data:JSON.stringify(d.data,(k,v)=>typeof v==='string'&&who[v]?name(v):v);
  console.log(' ',shown,'\n     ',data);
 }
})().catch(e=>{console.error('ERROR',e.status||'',e.message);process.exit(1)});
