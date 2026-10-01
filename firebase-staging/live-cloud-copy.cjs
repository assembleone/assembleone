// LIVE Stage 2.2 slice 1 test: cloud copy-and-verify against fittersiq-staging,
// COMPANY B ONLY ("FittersIQ STAGING OTHER"), signed in as its owner, generated data
// (ids "livecopy-..."). Stops at the first mismatch. Company A is never used.
//   node live-cloud-copy.cjs --run
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {initializeApp,deleteApp}=require('firebase/app');
const {getAuth,signInWithEmailAndPassword}=require('firebase/auth');
const fb=require('firebase/firestore'),st=require('firebase/storage');
const {createCloudCopy,identities,sha256Hex}=require('../cloud-master/fiq-cloud-copy.js');
const {makeState,deepFreeze}=require('./test-data.cjs');
const STAGING={apiKey:'AIzaSyBlglyejGrObsr25JL5-eOSfhF9joBxZUI',authDomain:'fittersiq-staging.firebaseapp.com',projectId:'fittersiq-staging',storageBucket:'fittersiq-staging.firebasestorage.app',messagingSenderId:'974434464573',appId:'1:974434464573:web:f5b5499766d6dab2e0cb54'};
const COMPANY_B='SivhuYsf35ktlq7DXo9H',COMPANY_A='AGEO6HnQuj4id29ERJGV',ENV='beta';
if(Object.values(STAGING).some(v=>/assembleone|fabac|906839446136/i.test(v)))throw new Error('Refused: not staging');
if(!process.argv.includes('--run')){console.log('usage: node live-cloud-copy.cjs --run   (writes generated data to Company B only)');process.exit(0)}
const BASE='companies/'+COMPANY_B+'/fiqMaster/'+ENV;
const log=[];let step=0;
async function check(name,fn){step++;try{await fn();log.push({step,name,ok:true});console.log(String(step).padStart(2)+'. ok    '+name)}catch(e){log.push({step,name,ok:false,error:e.message});console.log(String(step).padStart(2)+'. FAIL  '+name+'\n        '+String(e.message).split('\n').slice(0,10).join('\n        '));throw e}}

(async()=>{
 const acc=JSON.parse(fs.readFileSync(path.join(__dirname,'.staging-accounts.local.json'),'utf8')).other;
 const app=initializeApp(STAGING,'live-copy');
 const cred=await signInWithEmailAndPassword(getAuth(app),acc.email,acc.password);
 const token=await cred.user.getIdTokenResult(true);
 if(token.claims.companyId!==COMPANY_B||token.claims.role!=='company_owner')throw new Error('Refused: signed-in account is not the Company B owner');
 const db=fb.getFirestore(app),storage=st.getStorage(app);
 let sess=0;
 const copier=hooks=>createCloudCopy({fb,st,db,storage,companyId:COMPANY_B,env:ENV,uid:cred.user.uid,sessionId:'live-'+Date.now()+'-'+(++sess),deviceId:'staging-live-pc',deviceName:'Live copy test',hooks});
 if(copier().filePath('x',1,'y').indexOf('fiqmaster/'+COMPANY_A)===0)throw new Error('Refused: Company A');
 // Independent read-back (as the Company B owner, not through the module's own verify).
 const rec=async id=>{const s=await fb.getDoc(fb.doc(db,BASE+'/jobs/'+id));return s.exists()?s.data():null};
 const fileText=async p=>new TextDecoder().decode(await st.getBytes(st.ref(storage,p)));
 const exists=async p=>{try{await st.getMetadata(st.ref(storage,p));return true}catch(e){return false}};
 const marker=async()=>{const s=await fb.getDoc(fb.doc(db,BASE));return s.exists()?s.data():null};
 const before0={job:await rec('livetest-job-1'),cust:(await fb.getDoc(fb.doc(db,BASE+'/customers/livetest-cust-1'))).data()};
 const independent=async state=>{
  for(const p of state.projects){
   const r=await rec(p.id);assert.ok(r,'record for '+p.id);
   const text=await fileText(r.file);
   assert.equal(text,JSON.stringify(p),'exact content '+p.id);
   assert.equal(await sha256Hex(text),r.sha256,'fingerprint '+p.id);
   assert.equal(r.file,'fiqmaster/'+COMPANY_B+'/'+ENV+'/jobs/'+p.id+'/r'+r.rev+'-'+r.sha256+'.json','file name '+p.id);
   assert.deepEqual(identities(JSON.parse(text)),identities(p),'ids and QR identities '+p.id);
  }
  for(const c of state.customers){const s=await fb.getDoc(fb.doc(db,BASE+'/customers/'+c.id));assert.deepEqual(s.data().data,c,'customer '+c.id)}
 };
 const v1=deepFreeze(makeState({jobs:5,seed:'livecopy'}));const v1json=JSON.stringify(v1);
 let r,m;

 await check('Copy and verify 5 generated jobs (Company B): verified, marker written',async()=>{
  r=await copier().copyAndVerify(v1,'live-1');
  assert.equal(r.ok,true,JSON.stringify(r.error||r.verify&&r.verify.problems||r.conflicts));
  assert.deepEqual([r.customers.created,r.jobs.created,r.attempt.outcome,r.markerWritten],[3,5,'verified',true]);
  m=await marker();assert.deepEqual([m.mode,m.migrationId,m.verifiedSha256],['local','live-1',r.attempt.sourceSha256]);
 });
 await check('Independent read-back: exact content, fingerprints, file names, ids and QR identities, customers',()=>independent(v1));
 await check('Browser data unchanged',async()=>assert.equal(JSON.stringify(v1),v1json));
 await check('Cloud-only records reported and left untouched (earlier live test in Company B)',async()=>{
  assert.ok(r.verify.extraInCloud.some(x=>/livetest-job-1/.test(x))&&r.verify.extraInCloud.some(x=>/livetest-cust-1/.test(x)),r.verify.extraInCloud.join(', '));
  assert.deepEqual(await rec('livetest-job-1'),before0.job);
 });
 await check('Rerun with the same data: nothing new, versions unchanged, still verified',async()=>{
  const rr=await copier().copyAndVerify(v1,'live-2');
  assert.deepEqual([rr.ok,rr.customers.unchanged,rr.jobs.unchanged,rr.jobs.created,rr.jobs.updated],[true,3,5,0,0]);
  for(const p of v1.projects)assert.equal((await rec(p.id)).rev,1);
  assert.equal((await copier().checkVerified(v1)).verified,true);
 });
 const v2=makeState({jobs:5,seed:'livecopy'});v2.projects[1].name='Renamed in live test';v2.projects[1].cabinets[0].parts[0].length=712;deepFreeze(v2);
 await check('Changed job becomes version 2, version 1 file kept; new state verified, old state no longer verified',async()=>{
  const rr=await copier().copyAndVerify(v2,'live-3');
  assert.deepEqual([rr.ok,rr.jobs.updated,rr.jobs.unchanged],[true,1,4]);
  const j2=await rec('livecopy-job-2');assert.equal(j2.rev,2);
  assert.ok(await exists('fiqmaster/'+COMPANY_B+'/'+ENV+'/jobs/livecopy-job-2/r1-'+await sha256Hex(JSON.stringify(v1.projects[1]))+'.json'),'version 1 file kept');
  await independent(v2);
  assert.deepEqual([(await copier().checkVerified(v2)).verified,(await copier().checkVerified(v1)).verified],[true,false]);
 });
 const v3=makeState({jobs:5,seed:'livecopy'});v3.projects[1].name='Renamed in live test';v3.projects[1].cabinets[0].parts[0].length=712;v3.projects[2].siteNotes='Changed again';deepFreeze(v3);
 await check('Interrupted upload: failed attempt, earlier marker kept, new state not verified, browser unchanged',async()=>{
  const v3json=JSON.stringify(v3);
  const rr=await copier({afterFile:a=>{if(a.jobId==='livecopy-job-3')throw new Error('simulated network loss')}}).copyAndVerify(v3,'live-4');
  assert.deepEqual([rr.ok,rr.markerWritten,rr.attempt.outcome],[false,false,'failed']);
  assert.equal((await marker()).migrationId,'live-3','earlier marker kept');
  assert.equal((await copier().checkVerified(v3)).verified,false);
  assert.equal((await rec('livecopy-job-3')).rev,1,'record not moved');
  assert.equal(JSON.stringify(v3),v3json);
 });
 await check('Rerun completes: file from the interrupted run reused, version 2, verified',async()=>{
  const rr=await copier().copyAndVerify(v3,'live-5');
  assert.deepEqual([rr.ok,rr.filesReused,rr.jobs.updated],[true,1,1]);
  assert.equal((await rec('livecopy-job-3')).rev,2);await independent(v3);
 });
 const v4=makeState({jobs:5,seed:'livecopy'});v4.projects[1].name='Renamed in live test';v4.projects[1].cabinets[0].parts[0].length=712;v4.projects[2].siteNotes='Changed again';v4.projects[3].name='Changed job 4';deepFreeze(v4);
 await check('Incomplete copy (a changed job skipped): caught by read-back, no new marker',async()=>{
  const rr=await copier({skipJob:id=>id==='livecopy-job-4'}).copyAndVerify(v4,'live-6');
  assert.deepEqual([rr.ok,rr.markerWritten,rr.attempt.outcome],[false,false,'incomplete']);
  assert.ok(rr.verify.problems.some(p=>/livecopy-job-4/.test(p)),rr.verify.problems.join(' | '));
  assert.equal((await marker()).migrationId,'live-5');
 });
 await check('Final complete run: verified; marker confirms exactly the final browser state',async()=>{
  const rr=await copier().copyAndVerify(v4,'live-7');
  assert.equal(rr.ok,true);await independent(v4);
  const chk=await copier().checkVerified(v4);assert.deepEqual([chk.verified,chk.marker.migrationId],[true,'live-7']);
  const cust=(await fb.getDoc(fb.doc(db,BASE+'/customers/livetest-cust-1'))).data();assert.deepEqual(cust,before0.cust,'earlier evidence untouched');
 });
 fs.writeFileSync(path.join(__dirname,'live-cloud-copy-results.json'),JSON.stringify({ranAt:new Date().toISOString(),project:'fittersiq-staging',company:COMPANY_B,log},null,1));
 console.log('\nAll '+step+' live steps passed (Company B only).');
 await deleteApp(app);process.exit(0);
})().catch(async e=>{fs.writeFileSync(path.join(__dirname,'live-cloud-copy-results.json'),JSON.stringify({ranAt:new Date().toISOString(),stoppedAt:step,error:e.message,log},null,1));console.log('\nSTOPPED at step '+step+'. Nothing further was run.');process.exit(1)});
