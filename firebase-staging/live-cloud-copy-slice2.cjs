// LIVE Stage 2.2 slice 2 test: fittersiq-staging, COMPANY B ONLY, signed in as its owner,
// generated data and generated media only (ids "live2-..."). Production is never contacted:
// the one Production-style link in step 8 is text only and is proven never fetched.
//   node live-cloud-copy-slice2.cjs --env <beta|production>          prints the plan
//   node live-cloud-copy-slice2.cjs --env <beta|production> --run    runs it (after approval)
// Stops at the first mismatch.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createCloudCopy,identities,sha256Hex,sha256Bytes,dataUrlToBytes}=require('../cloud-master/fiq-cloud-copy.js');
const {makeInput,deepFreeze,fakeBytes}=require('./test-data.cjs');
const STAGING={apiKey:'AIzaSyBlglyejGrObsr25JL5-eOSfhF9joBxZUI',authDomain:'fittersiq-staging.firebaseapp.com',projectId:'fittersiq-staging',storageBucket:'fittersiq-staging.firebasestorage.app',messagingSenderId:'974434464573',appId:'1:974434464573:web:f5b5499766d6dab2e0cb54'};
if(Object.values(STAGING).some(v=>/assembleone|fabac|906839446136/i.test(v)))throw new Error('Refused: not staging');
const B='SivhuYsf35ktlq7DXo9H',A='AGEO6HnQuj4id29ERJGV';
const envArg=process.argv[process.argv.indexOf('--env')+1];
if(!['beta','production'].includes(envArg))throw new Error('usage: --env beta|production');
const ENV=envArg,BASE='companies/'+B+'/fiqMaster/'+ENV,MEDIA='fiqmaster/'+B+'/'+ENV+'/media/';
const STAGING_LINK='https://firebasestorage.googleapis.com/v0/b/fittersiq-staging.firebasestorage.app/';
const PROD_TEXT='https://firebasestorage.googleapis.com/v0/b/assembleone-fabac.firebasestorage.app/o/companies%2Fexample%2Fphoto.jpg?alt=media';
const prefixArg=process.argv.includes('--prefix')?process.argv[process.argv.indexOf('--prefix')+1]:'live2';
if(!/^[a-z0-9]{3,12}$/.test(prefixArg))throw new Error('--prefix must be 3-12 lowercase letters/digits');
const SEED=prefixArg,J=n=>SEED+'-job-'+n;

const PLAN=[
 ['Upload 2 generated photos where Mobile stores photos (Company B, staging)','writes Storage companies/'+B+'/jobs/'+J(1)+'/mobile-media/'+SEED+'-photo-1.jpg, -2.jpg'],
 ['Copy and verify: 4 jobs, drawings (JPEG, PDF, one shared), a deleted job with a drawing, an orphan drawing, settings, 2 photo links, delete history','verified, marker written'],
 ['Independent read-back: exact jobs in packages, ids and QR identities, drawing and photo bytes and types (PDF = application/pdf), tombstone with recycle-bin copy and delete time, settings exact without screen state, orphan in the recovery list','read only'],
 ['Browser input unchanged','read only'],
 ['Rerun with the same input: nothing new, no media uploaded again, still verified','marker rev +1'],
 ['Delete job 2 in the browser (recycle bin + history): tombstone in the cloud with the bin copy','job 2 versions 2'],
 ['Restore job 2 in the browser (recorded restore): deliberate cloud restore, history deleted + restored','job 2 version 3'],
 ['A Production-style photo link added to job 3 (copied, not verified): the changed job is written as its next version, the photo is pending, Production is never fetched, no new marker, checkVerified false; link removed again: verified','job 3 version +1 (pending photo), then +1 again'],
 ['Interrupted run (simulated network loss after a file): failed, earlier marker kept; rerun completes, files reused','verified'],
 ['Final: the marker confirms exactly the final browser state; an older state is not verified; Company B beta / Stage 2.1 evidence untouched','read only'],
];
function printPlan(){
 console.log('Live slice 2 test — fittersiq-staging, Company B ('+B+'), area "'+ENV+'"\n');
 PLAN.forEach((p,i)=>console.log(String(i+1).padStart(2)+'. '+p[0]+'\n      '+p[1]));
 console.log('\nWritten (Company B only): '+BASE+' (switch, lease, settings/studio, customers '+SEED+'-cA/cS1/cS2, jobs '+SEED+'-job-1..4 and '+SEED+'-gone),');
 console.log('Storage '+MEDIA+'<sha256> (generated drawings and photos), fiqmaster/'+B+'/'+ENV+'/jobs/'+SEED+'-*/r<rev>-<sha>.json,');
 console.log('and 2 generated photos under companies/'+B+'/jobs/'+J(1)+'/mobile-media/.');
 console.log('Never: Company A ('+A+'), Production, real data.');
}
if(!process.argv.includes('--run')){printPlan();process.exit(0)}

(async()=>{
 const {initializeApp,deleteApp}=require('firebase/app');
 const {getAuth,signInWithEmailAndPassword}=require('firebase/auth');
 const fb=require('firebase/firestore'),st=require('firebase/storage');
 const acc=JSON.parse(fs.readFileSync(path.join(__dirname,'.staging-accounts.local.json'),'utf8')).other;
 const app=initializeApp(STAGING,'live-'+SEED);
 const cred=await signInWithEmailAndPassword(getAuth(app),acc.email,acc.password);
 const tok=await cred.user.getIdTokenResult(true);
 if(tok.claims.companyId!==B||tok.claims.role!=='company_owner')throw new Error('Refused: not the Company B owner');
 const db=fb.getFirestore(app),storage=st.getStorage(app);
 const fetched=[];
 const fetchLink=async url=>{if(/assembleone-fabac/i.test(url))throw new Error('Production must never be fetched');fetched.push(url);const r=await fetch(url);if(!r.ok)throw new Error('fetch '+r.status);return {bytes:new Uint8Array(await r.arrayBuffer()),contentType:r.headers.get('content-type')||''}};
 let n=0;
 const copier=hooks=>createCloudCopy({fb,st,db,storage,companyId:B,env:ENV,uid:cred.user.uid,sessionId:SEED+'-'+Date.now()+'-'+(++n),deviceId:'staging-live2-pc',deviceName:'Live slice 2 test',hooks,fetchLink,isAllowedLink:u=>u.startsWith(STAGING_LINK)});
 if(!copier().mediaPath('x').startsWith('fiqmaster/'+B+'/'))throw new Error('Refused: not Company B');
 const log=[];let step=0;
 const check=async(name,fn)=>{step++;try{await fn();log.push({step,name,ok:true});console.log(String(step).padStart(2)+'. ok    '+name)}catch(e){log.push({step,name,ok:false,error:e.message});console.log(String(step).padStart(2)+'. FAIL  '+name+'\n        '+String(e.message).split('\n').slice(0,10).join('\n        '));throw e}};
 const rec=async id=>{const s=await fb.getDoc(fb.doc(db,BASE+'/jobs/'+id));return s.exists()?s.data():null};
 const pkgOf=async r=>JSON.parse(new TextDecoder().decode(await st.getBytes(st.ref(storage,r.file))));
 const mediaInfo=async sha=>{const r=st.ref(storage,MEDIA+sha);const m=await st.getMetadata(r);return {type:m.contentType,sha:await sha256Bytes(new Uint8Array(await st.getBytes(r)))}};
 const marker=async()=>{const s=await fb.getDoc(fb.doc(db,BASE));return s.exists()?s.data():null};
 const clone=x=>JSON.parse(JSON.stringify(x));
 const betaEvidence=async()=>JSON.stringify([(await fb.getDoc(fb.doc(db,'companies/'+B+'/fiqMaster/beta/settings/studio'))).data()||null,(await fb.getDoc(fb.doc(db,'companies/'+B+'/fiqMaster/beta/jobs/livetest-job-1'))).data()||null,(await fb.getDoc(fb.doc(db,'companies/'+B+'/fiqMaster/beta'))).data()||null]);
 const evidenceBefore=ENV==='beta'?null:await betaEvidence();
 const links=[];
 await check(PLAN[0][0],async()=>{for(const k of [1,2]){const r=st.ref(storage,'companies/'+B+'/jobs/'+J(1)+'/mobile-media/'+SEED+'-photo-'+k+'.jpg');await st.uploadBytes(r,fakeBytes(SEED+'-photo-'+k,1500),{contentType:'image/jpeg'});links.push(await st.getDownloadURL(r))}assert.ok(links.every(u=>u.startsWith(STAGING_LINK)))});
 const raw=makeInput({jobs:4,seed:SEED});raw.state.projects[0].jobLog[0].photos=links.slice();const v1=deepFreeze(raw);const v1json=JSON.stringify(v1);
 let r1;
 await check(PLAN[1][0],async()=>{r1=await copier().copyAndVerify(v1,SEED+'-1');assert.equal(r1.ok,true,JSON.stringify(r1.error||r1.verify&&r1.verify.problems||r1.conflicts||r1.mediaNotOwned));assert.equal((await marker()).verifiedSha256,r1.attempt.sourceSha256)});
 await check(PLAN[2][0],async()=>{
  for(const p of v1.state.projects){const r=await rec(p.id);const pkg=await pkgOf(r);assert.equal(JSON.stringify(pkg.job),JSON.stringify(p));assert.deepEqual(identities(pkg.job),identities(p));
   for(const c of p.cabinets){const d=v1.drawings.find(x=>x.key===p.id+':'+c.id);const want=await sha256Bytes(dataUrlToBytes(d.drawing).bytes);assert.equal(pkg.drawings[c.id].sha256,want);const m=await mediaInfo(want);assert.equal(m.sha,want);assert.equal(m.type,d.drawingType==='pdf'?'application/pdf':'image/jpeg')}}
  const p1=await pkgOf(await rec(J(1)));for(const u of links){const m=p1.links[u];assert.ok(m,'photo owned');assert.equal((await mediaInfo(m.sha256)).sha,m.sha256)}
  const g=await rec(SEED+'-gone');assert.deepEqual([g.deleted,g.rev],[true,2]);const gp=await pkgOf(g);assert.equal(gp.recycleBin.deletedAt,v1.state.deletedProjects[0].deletedAt);assert.ok(gp.drawings[SEED+'-gone-u']);
  const sv=(await fb.getDoc(fb.doc(db,BASE+'/settings/studio'))).data().values;assert.equal(sv['ls:fiq_supplier_prices_v1'],v1.settings.fiq_supplier_prices_v1);assert.ok(!Object.keys(sv).some(k=>/screen|drawingZoom|currentProject|dotCycle/.test(k)));
  const list=JSON.parse(sv['recovery.orphanDrawings']);assert.ok(list.some(x=>x.key===SEED+'-oldjob:'+SEED+'-oldunit'));
 });
 await check(PLAN[3][0],async()=>assert.equal(JSON.stringify(v1),v1json));
 await check(PLAN[4][0],async()=>{const r=await copier().copyAndVerify(v1,SEED+'-2');assert.deepEqual([r.ok,r.jobs.unchanged,r.jobs.created,r.jobs.updated,r.media.uploaded],[true,4,0,0,0])});
 const del=clone(v1);const job2=del.state.projects.splice(1,1)[0];const at=Date.now();del.state.deletedProjects.unshift({deletedAt:at,project:job2});del.state.deletedProjectIds.push(job2.id);del.state.jobLifecycle.push({jobId:job2.id,event:'deleted',at});deepFreeze(del);
 await check(PLAN[5][0],async()=>{const r=await copier().copyAndVerify(del,SEED+'-3');assert.equal(r.ok,true,JSON.stringify(r.error||r.verify&&r.verify.problems));const x=await rec(J(2));assert.deepEqual([x.deleted,x.rev],[true,2]);assert.equal((await pkgOf(x)).recycleBin.deletedAt,at)});
 const rest=clone(del);rest.state.projects.splice(1,0,job2);rest.state.deletedProjects=rest.state.deletedProjects.filter(e=>e.project.id!==job2.id);rest.state.deletedProjectIds=rest.state.deletedProjectIds.filter(x=>x!==job2.id);rest.state.jobLifecycle.push({jobId:job2.id,event:'restored',at:at+1000,deletedAt:at});deepFreeze(rest);
 await check(PLAN[6][0],async()=>{const r=await copier().copyAndVerify(rest,SEED+'-4');assert.equal(r.ok,true,JSON.stringify(r.error||r.verify&&r.verify.problems||r.conflicts));assert.equal(r.jobs.restored,1);const x=await rec(J(2));assert.deepEqual([x.deleted,x.rev,!!x.restoredAt],[false,3,true]);assert.deepEqual((await pkgOf(x)).lifecycle.map(e=>e.event),['deleted','restored'])});
 await check(PLAN[7][0],async()=>{
  const prod=clone(rest);prod.state.projects[2].jobLog[0].photos=[PROD_TEXT];deepFreeze(prod);const before=(await rec(J(3))).rev;
  const r=await copier().copyAndVerify(prod,SEED+'-5');assert.deepEqual([r.ok,r.markerWritten,r.attempt.outcome],[false,false,'incomplete']);
  assert.ok(!fetched.some(u=>/assembleone-fabac/i.test(u)),'Production never fetched');
  const j3=await rec(J(3));assert.equal(j3.rev,before+1,'changed job copied as its next version');const p3=await pkgOf(j3);
  assert.equal(JSON.stringify(p3.job),JSON.stringify(prod.state.projects[2]),'latest job data copied');assert.ok(!(PROD_TEXT in p3.links),'photo pending, not owned');
  assert.ok(r.mediaNotOwned.some(m=>m.id===J(3)&&m.links.includes(PROD_TEXT)),'pending photo reported');
  assert.equal((await marker()).migrationId,SEED+'-4','no new marker');assert.equal((await copier().checkVerified(prod)).verified,false,'not verified');
  const r2=await copier().copyAndVerify(rest,SEED+'-6');assert.equal(r2.ok,true);assert.equal((await rec(J(3))).rev,before+2,'link removed: next version, verified');
 });
 const v5=clone(rest);v5.state.projects[3].siteNotes='Changed before an interrupted run';deepFreeze(v5);
 await check(PLAN[8][0],async()=>{
  const r=await copier({afterFile:a=>{if(a.jobId===J(4))throw new Error('simulated network loss')}}).copyAndVerify(v5,SEED+'-7');assert.deepEqual([r.ok,r.attempt.outcome],[false,'failed']);assert.equal((await marker()).migrationId,SEED+'-6');
  const r2=await copier().copyAndVerify(v5,SEED+'-8');assert.equal(r2.ok,true);assert.equal(r2.filesReused,1);
 });
 await check(PLAN[9][0],async()=>{
  assert.equal((await copier().checkVerified(v5)).verified,true);assert.equal((await copier().checkVerified(rest)).verified,false);
  if(evidenceBefore)assert.equal(await betaEvidence(),evidenceBefore,'Company B beta evidence untouched');
 });
 fs.writeFileSync(path.join(__dirname,'live-cloud-copy-slice2-results.json'),JSON.stringify({ranAt:new Date().toISOString(),project:'fittersiq-staging',company:B,env:ENV,log},null,1));
 console.log('\nAll '+step+' live slice 2 steps passed (Company B, area "'+ENV+'").');
 await deleteApp(app);process.exit(0);
})().catch(e=>{try{fs.writeFileSync(path.join(__dirname,'live-cloud-copy-slice2-results.json'),JSON.stringify({ranAt:new Date().toISOString(),error:e.message},null,1))}catch(x){}console.log('\nSTOPPED. Nothing further was run. '+e.message);process.exit(1)});
