// Stage 2.2 slice 1: cloud copy-and-verify, against the exact Stage 2.1 staging rules in
// the local emulator (project demo-fittersiq). Generated data only.
// Successful copy, interrupted upload, bad fingerprint, stale revision, incomplete copy,
// plus: lock held elsewhere, cloud tombstone, another computer's change, bad ids, scale.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {initializeTestEnvironment}=require('@firebase/rules-unit-testing');
const fb=require('firebase/firestore'),st=require('firebase/storage');
const {createCloudCopy,identities,sha256Hex}=require('../cloud-master/fiq-cloud-copy.js');
const {makeState,deepFreeze}=require('./test-data.cjs');
const RULES={firestore:fs.readFileSync(path.join(__dirname,process.env.RULES_DIR||'.','firestore.rules'),'utf8'),storage:fs.readFileSync(path.join(__dirname,process.env.RULES_DIR||'.','storage.rules'),'utf8')};
const CO='cA',ENV='beta',BASE='companies/'+CO+'/fiqMaster/'+ENV;
let t,owner,failures=0,SEED='t';const results=[];
const mk=o=>makeState({...o,seed:(o&&o.seed)||SEED}),J=n=>SEED+'-job-'+n,esc=x=>x.replace(/[-]/g,'\\-');
async function check(name,fn){/*debug*/
 try{await fn();results.push({name,ok:true});console.log('ok    '+name)}
 catch(e){failures++;results.push({name,ok:false,error:e.message});console.log('FAIL  '+name+'\n      '+String(e.message).split('\n').slice(0,8).join('\n      '))}
}
async function fresh(seed){
 SEED=seed;
 await t.clearFirestore();await t.clearStorage();
 await t.withSecurityRulesDisabled(async c=>{await fb.setDoc(fb.doc(c.firestore(),'companies/'+CO+'/members/owner1'),{role:'company_owner',status:'active'})});
}
function copier(extra){
 return createCloudCopy({fb,st,db:owner.firestore(),storage:owner.storage(),companyId:CO,env:ENV,uid:'owner1',sessionId:(extra&&extra.sessionId)||'S1',deviceId:(extra&&extra.deviceId)||'pc-1',deviceName:'Test PC',hooks:extra&&extra.hooks});
}
// Independent look at the cloud with rules off (not through the module).
async function cloud(){
 const out={jobs:{},customers:{},files:{},switch:null,lease:null};
 await t.withSecurityRulesDisabled(async c=>{
  const db=c.firestore(),s=c.storage();
  (await fb.getDocs(fb.collection(db,BASE+'/jobs'))).forEach(d=>{out.jobs[d.id]=d.data()});
  (await fb.getDocs(fb.collection(db,BASE+'/customers'))).forEach(d=>{out.customers[d.id]=d.data()});
  const sw=await fb.getDoc(fb.doc(db,BASE));out.switch=sw.exists()?sw.data():null;
  const ls=await fb.getDoc(fb.doc(db,BASE+'/lease/studio'));out.lease=ls.exists()?ls.data():null;
  for(const [id,r] of Object.entries(out.jobs)){try{out.files[id]=new TextDecoder().decode(await st.getBytes(st.ref(s,r.file)))}catch(e){out.files[id]=null}}
 });
 return out;
}
const asAdmin=fn=>t.withSecurityRulesDisabled(async c=>fn(c.firestore(),c.storage()));
const fileExists=async p=>{let found=false;await asAdmin(async(db,s)=>{try{await st.getBytes(st.ref(s,p));found=true}catch(e){found=false}});return found};// withSecurityRulesDisabled returns nothing, so the result is carried out

(async()=>{
 t=await initializeTestEnvironment({projectId:'demo-fittersiq',firestore:{host:'127.0.0.1',port:8181,rules:RULES.firestore},storage:{host:'127.0.0.1',port:9199,rules:RULES.storage}});
 owner=t.authenticatedContext('owner1',{companyId:CO,role:'company_owner'});

 // ---------------------------------------------------------------- 1. success
 await check('1. Successful copy: everything copied, read back, identical; marker written; browser data untouched',async()=>{
  await fresh('s1');
  const state=deepFreeze(mk({jobs:5}));const before=JSON.stringify(state);
  const r=await copier().copyAndVerify(state,'run-1');
  assert.equal(r.ok,true,JSON.stringify(r.error||r.verify&&r.verify.problems));
  assert.deepEqual([r.customers.created,r.jobs.created,r.conflicts.length,r.markerWritten],[3,5,0,true]);
  assert.equal(JSON.stringify(state),before,'browser data unchanged');
  const c=await cloud();
  for(const p of state.projects){
   assert.equal(c.jobs[p.id].rev,1);const pkg=JSON.parse(c.files[p.id]);assert.equal(pkg.fiqPackage,2);assert.equal(JSON.stringify(pkg.job),JSON.stringify(p),'job package holds the exact browser JSON');
   assert.equal(c.jobs[p.id].sha256,await sha256Hex(c.files[p.id]),'record fingerprint = file fingerprint');
   assert.deepEqual(identities(pkg.job),identities(p),'ids and QR / piece identities preserved');
  }
  for(const cu of state.customers)assert.deepEqual(c.customers[cu.id].data,cu,'customer identical');
  assert.equal(Object.keys(c.customers).length,3);
  assert.deepEqual([c.switch.mode,c.switch.migrationId,c.switch.verifiedSha256],['local','run-1',r.attempt.sourceSha256]);
  assert.ok(c.lease.expiresAt.toMillis()-Date.now()<15000,'lock released (short expiry)');
 });
 await check('1b. Second copy of the same data changes nothing (no new versions)',async()=>{
  const state=deepFreeze(mk({jobs:5}));
  const r=await copier({sessionId:'S2'}).copyAndVerify(state,'run-2');
  assert.equal(r.ok,true);assert.deepEqual([r.customers.unchanged,r.jobs.unchanged,r.jobs.created,r.jobs.updated],[3,5,0,0]);
  const c=await cloud();assert.ok(Object.values(c.jobs).filter(j=>!j.deleted).every(j=>j.rev===1));assert.equal(c.switch.rev,2);
 });
 await check('1c. One changed job becomes version 2; version 1 file is kept',async()=>{
  const v1File=(await cloud()).jobs[J(2)].file;
  const s=mk({jobs:5});s.projects[1].name='Renamed job';s.projects[1].cabinets[0].parts[0].length=711;deepFreeze(s);
  const r=await copier({sessionId:'S3'}).copyAndVerify(s,'run-3');
  assert.equal(r.ok,true);assert.deepEqual([r.jobs.updated,r.jobs.unchanged],[1,4]);
  const c=await cloud();assert.equal(c.jobs[J(2)].rev,2);assert.equal(JSON.stringify(JSON.parse(c.files[J(2)]).job),JSON.stringify(s.projects[1]));
  assert.ok(await fileExists(v1File),'old version file still there');
 });

 // ---------------------------------------------------------------- 2. interrupted upload
 await check('2. Interrupted upload: failure reported, no marker, browser untouched; a rerun completes without duplicates',async()=>{
  await fresh('s2');
  const state=deepFreeze(mk({jobs:5}));const before=JSON.stringify(state);
  const r=await copier({hooks:{afterFile:a=>{if(a.jobId===J(3))throw new Error('network lost')}}}).copyAndVerify(state,'run-i');
  assert.equal(r.ok,false);assert.equal(r.markerWritten,false);assert.match(r.error.message,/network lost/);
  assert.equal(JSON.stringify(state),before,'browser data unchanged');
  let c=await cloud();
  assert.deepEqual(Object.keys(c.jobs).sort(),[J(1),J(2)],'only completed jobs have records');
  assert.equal(c.switch,null,'no verified-copy marker');
  const r2=await copier({sessionId:'S2'}).copyAndVerify(state,'run-i2');
  assert.equal(r2.ok,true,JSON.stringify(r2.error||r2.verify.problems));
  assert.deepEqual([r2.jobs.unchanged,r2.jobs.created,r2.filesReused],[2,3,1],'job 3 file from the interrupted run reused');
  c=await cloud();assert.ok(Object.values(c.jobs).filter(j=>!j.deleted).every(j=>j.rev===1),'no extra versions');assert.equal(c.switch.migrationId,'run-i2');
 });

 // ---------------------------------------------------------------- 3. bad fingerprint
 await check('3. Bad fingerprint: a cloud file that does not match its fingerprint fails verification; no marker',async()=>{
  await fresh('s3');
  const state=deepFreeze(mk({jobs:4}));
  const r=await copier({hooks:{beforeVerify:async()=>{const c=await cloud();await asAdmin((db,s)=>st.uploadString(st.ref(s,c.jobs[J(2)].file),'{"tampered":true}','raw',{contentType:'application/json'}))}}}).copyAndVerify(state,'run-f');
  assert.equal(r.ok,false);assert.equal(r.markerWritten,false);
  assert.ok(r.verify.problems.some(p=>new RegExp('fingerprint does not match.*'+esc(J(2))).test(p)),r.verify.problems.join(' | '));
  assert.equal((await cloud()).switch,null);
 });
 await check('3b. A record whose fingerprint differs from the browser job fails verification',async()=>{
  await fresh('s4');
  const state=deepFreeze(mk({jobs:3}));
  const r=await copier({hooks:{beforeVerify:()=>asAdmin(db=>fb.updateDoc(fb.doc(db,BASE+'/jobs/'+J(1)),{sha256:'b'.repeat(64)}))}}).copyAndVerify(state,'run-f2');
  assert.equal(r.ok,false);assert.ok(r.verify.problems.some(p=>new RegExp('(different version|wrong file).*'+esc(J(1))).test(p)));
 });

 // ---------------------------------------------------------------- 4. stale revision
 await check('4. Stale revision: another writer moves a record during the copy; copy stops, nothing overwritten, no marker',async()=>{
  await fresh('s5');
  const state=deepFreeze(mk({jobs:4}));
  const other={rev:1,file:'fiqmaster/'+CO+'/'+ENV+'/jobs/'+J(2)+'/r1-'+'c'.repeat(64)+'.json',sha256:'c'.repeat(64),bytes:10,name:'Other PC version',customerId:null,schema:1,deleted:false,sessionId:'X',deviceId:'pc-2',updatedAt:fb.Timestamp.now(),updatedBy:'owner1'};
  const r=await copier({hooks:{afterFile:a=>{if(a.jobId===J(2))return asAdmin(db=>fb.setDoc(fb.doc(db,BASE+'/jobs/'+J(2)),other))}}}).copyAndVerify(state,'run-s');
  assert.equal(r.ok,false,JSON.stringify(r));assert.equal(r.error&&r.error.code,'stale',JSON.stringify(r.error));assert.equal(r.markerWritten,false);
  const c=await cloud();assert.equal(c.jobs[J(2)].deviceId,'pc-2','the other writer\'s record kept');assert.equal(c.switch,null);
 });
 await check('4b. Job changed by another computer before the copy: reported as a conflict, not overwritten, no marker',async()=>{
  await fresh('s6');
  const state=deepFreeze(mk({jobs:3}));
  await asAdmin(db=>fb.setDoc(fb.doc(db,BASE+'/jobs/'+J(3)),{rev:4,file:'fiqmaster/'+CO+'/'+ENV+'/jobs/'+J(3)+'/r4-'+'d'.repeat(64)+'.json',sha256:'d'.repeat(64),bytes:10,name:'Newer on another PC',customerId:null,schema:1,deleted:false,sessionId:'Y',deviceId:'pc-2',updatedAt:fb.Timestamp.now(),updatedBy:'owner1'}));
  const r=await copier().copyAndVerify(state,'run-c');
  assert.equal(r.ok,false);assert.equal(r.markerWritten,false);
  assert.ok(r.conflicts.some(x=>x.id===J(3)&&/another computer/.test(x.reason)));
  const c=await cloud();assert.equal(c.jobs[J(3)].rev,4);assert.equal(c.jobs[J(3)].deviceId,'pc-2');assert.equal(c.jobs[J(1)].rev,1);
 });
 await check('4c. Studio lock held by another computer: nothing is copied at all',async()=>{
  await fresh('s7');
  await asAdmin(db=>fb.setDoc(fb.doc(db,BASE+'/lease/studio'),{holderUid:'owner1',sessionId:'OTHER',deviceId:'pc-2',deviceName:'Workshop PC',heartbeatAt:fb.Timestamp.now(),expiresAt:fb.Timestamp.fromMillis(Date.now()+120000)}));
  const r=await copier().copyAndVerify(deepFreeze(mk({jobs:3})),'run-l');
  assert.equal(r.ok,false);assert.equal(r.error.code,'lease-busy');assert.match(r.error.message,/Workshop PC/);
  const c=await cloud();assert.deepEqual([Object.keys(c.jobs).length,Object.keys(c.customers).length,c.switch],[0,0,null]);assert.equal(c.lease.sessionId,'OTHER');
 });
 await check('4d. Job deleted in the cloud (tombstone): not brought back by a copy',async()=>{
  await fresh('s8');
  await asAdmin(db=>fb.setDoc(fb.doc(db,BASE+'/jobs/'+J(1)),{rev:2,file:'fiqmaster/'+CO+'/'+ENV+'/jobs/'+J(1)+'/r2-'+'e'.repeat(64)+'.json',sha256:'e'.repeat(64),bytes:10,name:'x',customerId:null,schema:1,deleted:true,deletedAt:fb.Timestamp.now(),sessionId:'Z',deviceId:'pc-1',updatedAt:fb.Timestamp.now(),updatedBy:'owner1'}));
  const r=await copier().copyAndVerify(deepFreeze(mk({jobs:2})),'run-t');
  assert.equal(r.ok,false);assert.ok(r.conflicts.some(x=>x.id===J(1)&&/deleted in the cloud/.test(x.reason)));
  assert.equal((await cloud()).jobs[J(1)].deleted,true);
 });

 // ---------------------------------------------------------------- 5. incomplete copy
 await check('5. Incomplete copy: a job silently skipped is caught by verification; no marker',async()=>{
  await fresh('s9');
  const r=await copier({hooks:{skipJob:id=>id===J(4)}}).copyAndVerify(deepFreeze(mk({jobs:5})),'run-x');
  assert.equal(r.ok,false);assert.equal(r.markerWritten,false);assert.ok(r.verify.problems.includes('Job missing in the cloud: '+J(4)),r.verify.problems.join(' | '));
  assert.equal((await cloud()).switch,null);
 });
 await check('5b. Verification alone detects a customer missing from the cloud',async()=>{
  await fresh('s10');
  const state=deepFreeze(mk({jobs:2}));
  assert.equal((await copier().copyAndVerify(state,'run-y')).ok,true);
  await asAdmin(db=>fb.deleteDoc(fb.doc(db,BASE+'/customers/'+SEED+'-cS2')));
  const v=await copier({sessionId:'S9'}).verifyOnly(state);
  assert.equal(v.ok,false);assert.ok(v.problems.includes('Customer missing in the cloud: '+SEED+'-cS2'));
 });
 await check('5c. Ids that cannot be stored are refused before anything is written',async()=>{
  await fresh('s11');
  const s=mk({jobs:2});s.projects[0].id='bad/id';
  const r=await copier().copyAndVerify(deepFreeze(s),'run-b');
  assert.equal(r.ok,false);assert.equal(r.error.code,'source');assert.ok(r.error.detail.some(d=>/bad\/id/.test(d)));
  const c=await cloud();assert.deepEqual([Object.keys(c.jobs).length,c.lease],[0,null]);
 });

 // ---------------------------------------------------------------- 7. latest attempt vs older marker
 await check('7. A failed attempt keeps the earlier marker, reports itself as failed, and the old marker does not verify the new browser state',async()=>{
  await fresh('s7');
  const v1=deepFreeze(mk({jobs:3}));
  const ok=await copier().copyAndVerify(v1,'run-ok');
  assert.equal(ok.attempt.outcome,'verified');
  assert.equal((await copier().checkVerified(v1)).verified,true,'this exact state is verified');
  const v2=mk({jobs:3});v2.projects[0].name='Changed after the verified run';deepFreeze(v2);
  const bad=await copier({sessionId:'S2',hooks:{afterFile:()=>{throw new Error('network lost')}}}).copyAndVerify(v2,'run-bad');
  assert.deepEqual([bad.ok,bad.markerWritten,bad.attempt.outcome],[false,false,'failed']);
  assert.ok(bad.attempt.sourceSha256&&bad.attempt.finishedAt);
  const c=await cloud();assert.equal(c.switch.migrationId,'run-ok','earlier successful marker kept');
  const chk=await copier({sessionId:'S3'}).checkVerified(v2);
  assert.equal(chk.verified,false,'old marker does not verify the changed browser state');
  assert.equal(chk.marker.migrationId,'run-ok');
  const inc=await copier({sessionId:'S4',hooks:{skipJob:id=>id===J(1)}}).copyAndVerify(v2,'run-inc');
  assert.deepEqual([inc.ok,inc.attempt.outcome],[false,'incomplete']);
  const done=await copier({sessionId:'S5'}).copyAndVerify(v2,'run-ok2');
  assert.equal(done.attempt.outcome,'verified');
  assert.deepEqual([(await copier({sessionId:'S6'}).checkVerified(v2)).verified,(await copier({sessionId:'S7'}).checkVerified(v1)).verified],[true,false],'marker now confirms only the new state');
 });

 // ---------------------------------------------------------------- scale
 await check('6. Scale: 40 jobs, 2,000 panels, copied and verified',async()=>{
  await fresh('s12');
  const state=deepFreeze(mk({jobs:40,panelsPerUnit:25,seed:'big'}));
  const t0=Date.now();const r=await copier().copyAndVerify(state,'run-big');const ms=Date.now()-t0;
  assert.equal(r.ok,true,JSON.stringify(r.error||r.verify.problems));assert.equal(r.verify.checked.jobs,40);
  const panels=state.projects.reduce((n,p)=>n+p.cabinets.reduce((m,c)=>m+c.parts.length,0),0);assert.equal(panels,2000);
  console.log('      (copy + verify took '+(ms/1000).toFixed(1)+' s in the emulator)');
 });

 await t.cleanup();
 fs.writeFileSync(path.join(__dirname,'cloud-copy-test-results.json'),JSON.stringify({ranAt:new Date().toISOString(),failures,results},null,1));
 console.log('\n'+(failures?failures+' FAILED':'All '+results.length+' cloud copy tests passed'));
 process.exit(failures?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
