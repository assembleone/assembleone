// Orphan / misleading master files: can a stale or second Studio (same owner sign-in, but
// NOT holding the editing lock) use Storage to overwrite a version, block a later
// legitimate version, get a file treated as master, or get around the lock?
// Runs the same attack against the first tested rules (v1-tested/) and the current rules,
// in the local emulator only (project demo-fittersiq). Prints both and exits 1 if the
// CURRENT rules are unsafe anywhere.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {initializeTestEnvironment}=require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,serverTimestamp,Timestamp}=require('firebase/firestore');
const {ref,uploadString,getBytes}=require('firebase/storage');
const load=dir=>({firestore:fs.readFileSync(path.join(__dirname,dir,'firestore.rules'),'utf8'),storage:fs.readFileSync(path.join(__dirname,dir,'storage.rules'),'utf8')});
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
async function outcome(fn){try{await fn();return 'allow'}catch(e){const m=String(e&&e.code||'')+' '+String(e&&e.message||'');if(/permission|unauthorized|PERMISSION_DENIED/i.test(m))return 'deny';return 'error: '+m.slice(0,80)}}

async function scenario(label,rules,scheme){
 const t=await initializeTestEnvironment({projectId:'demo-fittersiq',firestore:{host:'127.0.0.1',port:8181,rules:rules.firestore},storage:{host:'127.0.0.1',port:9199,rules:rules.storage}});
 await t.clearFirestore();await t.clearStorage();
 await t.withSecurityRulesDisabled(async c=>{await setDoc(doc(c.firestore(),'companies/c1/members/owner1'),{role:'company_owner',status:'active'})});
 const owner=t.authenticatedContext('owner1',{companyId:'c1',role:'company_owner'});
 const db=owner.firestore(),st=owner.storage();
 const M='companies/c1/fiqMaster/beta',J='fiqmaster/c1/beta/jobs/j1/';
 const fileName=(rev,h)=>scheme==='v1'?J+'r'+rev+'.json':J+'r'+rev+'-'+h+'.json';
 const upload=(p,text,session)=>uploadString(ref(st,p),text,'raw',{contentType:'application/json',customMetadata:{sessionId:session}});
 const index=(rev,h,session,file)=>setDoc(doc(db,M+'/jobs/j1'),{rev,file:file||fileName(rev,h),sha256:h,bytes:10,name:'Job',customerId:'cu1',schema:1,deleted:false,sessionId:session,deviceId:'d',updatedAt:serverTimestamp(),updatedBy:'owner1'});
 const lease=(session,extra)=>setDoc(doc(db,M+'/lease/studio'),{holderUid:'owner1',sessionId:session,deviceId:'d',deviceName:'PC',heartbeatAt:serverTimestamp(),expiresAt:Timestamp.fromMillis(Date.now()+120000),...(extra||{})});
 const readBack=async p=>{let s='';await t.withSecurityRulesDisabled(async c=>{s=new TextDecoder().decode(await getBytes(ref(c.storage(),p)))});return s};
 const rows=[];const row=(step,got,safeWhen)=>rows.push({step,got,safe:safeWhen(got)});
 const good1='{"job":"v1 by the editing Studio"}',h1=sha(good1);
 const good2='{"job":"v2 by the editing Studio"}',h2=sha(good2);
 const stale='{"job":"old copy from a stale Studio"}',hs=sha(stale);

 // The editing Studio (session S1) holds the lock and saves version 1.
 await lease('S1');
 row('Setup: editing Studio saves version 1 (file + record)',await outcome(async()=>{await upload(fileName(1,h1),good1,'S1');await index(1,h1,'S1')}),g=>g==='allow');
 // A stale Studio (session S0, same owner, no lock) tries its tricks.
 row('Stale Studio overwrites the valid version-1 file',await outcome(()=>upload(fileName(1,h1),stale,'S0')),g=>g==='deny');
 row('Stale Studio adds its own next-version file (lock bypass)',await outcome(()=>upload(fileName(2,hs),stale,'S0')),g=>g==='deny');
 row('Stale Studio adds a photo (lock bypass)',await outcome(()=>uploadString(ref(st,'fiqmaster/c1/beta/media/'+hs),'img','raw',{contentType:'image/jpeg',customMetadata:{sessionId:'S0'}})),g=>g==='deny');
 row('Stale Studio moves the record to version 2',await outcome(()=>index(2,hs,'S0')),g=>g==='deny');
 // Worst case: an orphan next-version file exists anyway (planted with rules off,
 // e.g. from before a lock change). It must not block or mislead the editing Studio.
 const orphan=fileName(2,hs);
 await t.withSecurityRulesDisabled(async c=>uploadString(ref(c.storage(),orphan),stale,'raw',{contentType:'application/json'}));
 const legit=fileName(2,h2);
 row('Orphan present: editing Studio adds its version-2 file',await outcome(()=>upload(legit,good2,'S1')),g=>g==='allow');
 row('Orphan present: editing Studio moves the record to version 2',await outcome(()=>index(2,h2,'S1')),g=>g==='allow');
 let rec;await t.withSecurityRulesDisabled(async c=>{rec=(await getDoc(doc(c.firestore(),M+'/jobs/j1'))).data()});
 const content=await readBack(rec.file).catch(()=>'(missing)');
 row('The record points at content matching its checksum',sha(content)===rec.sha256?'match':'MISMATCH ('+(content===stale?'stale copy':'other')+')',g=>g==='match');
 row('Record pointing at the orphan file with the right checksum',await outcome(()=>index(3,h2,'S1',orphan)),g=>g==='deny');
 // Lock hand-over: the old holder can no longer add files.
 await lease('S2',{takenOverAt:serverTimestamp()});
 const h3=sha('v3');
 row('After take-over, the old Studio (S1) adds a file',await outcome(()=>upload(fileName(3,h3),'{"job":"v3 by old holder"}','S1')),g=>g==='deny');
 row('After take-over, the new holder (S2) adds a file',await outcome(()=>upload(fileName(3,sha('{"job":"v3"}')),'{"job":"v3"}','S2')),g=>g==='allow');
 await t.cleanup();
 console.log('\n== '+label+' ==');
 rows.forEach(r=>console.log((r.safe?'safe  ':'UNSAFE')+'  '+r.got.padEnd(22)+' '+r.step));
 return rows;
}
(async()=>{
 const v1=await scenario('First tested rules (v1): job files named r<rev>.json, files not tied to the lock',load('v1-tested'),'v1');
 const v2=await scenario('Current rules: job files named r<rev>-<sha256>.json, files need the lock',load('.'),'v2');
 const unsafe=v2.filter(r=>!r.safe).length;
 fs.writeFileSync(path.join(__dirname,'orphan-test-results.json'),JSON.stringify({ranAt:new Date().toISOString(),v1,v2},null,1));
 console.log('\nv1 unsafe steps: '+v1.filter(r=>!r.safe).length+' · current unsafe steps: '+unsafe);
 process.exit(unsafe?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
