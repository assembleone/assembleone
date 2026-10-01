// Stage 2.2 slice 2: job packages, drawings and media, settings, tombstones and the
// recycle bin, delete / restore history, orphan-drawing recovery, complete verification.
// Emulator only (demo-fittersiq), generated data and generated media only. Uses the rules
// in RULES_DIR (default '.'); PDF drawings need the proposed media rule ('proposed-pdf').
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {initializeTestEnvironment}=require('@firebase/rules-unit-testing');
const fb=require('firebase/firestore'),st=require('firebase/storage');
const {createCloudCopy,identities,sha256Hex,sha256Bytes,dataUrlToBytes}=require('../cloud-master/fiq-cloud-copy.js');
const {makeInput,deepFreeze,fakeBytes}=require('./test-data.cjs');
const DIR=process.env.RULES_DIR||'.';
const RULES={firestore:fs.readFileSync(path.join(__dirname,DIR,'firestore.rules'),'utf8'),storage:fs.readFileSync(path.join(__dirname,DIR,'storage.rules'),'utf8')};
const CO='cA',ENV='beta',BASE='companies/'+CO+'/fiqMaster/'+ENV,EMU='http://127.0.0.1:9199/';
let t,owner,failures=0,SEED='x';const results=[];
const J=n=>SEED+'-job-'+n;
async function check(name,fn){try{await fn();results.push({name,ok:true});console.log('ok    '+name)}catch(e){failures++;results.push({name,ok:false,error:e.message});console.log('FAIL  '+name+'\n      '+String(e.message).split('\n').slice(0,8).join('\n      '))}}
async function fresh(seed){SEED=seed;await t.clearFirestore();await t.withSecurityRulesDisabled(async c=>{await fb.setDoc(fb.doc(c.firestore(),'companies/'+CO+'/members/owner1'),{role:'company_owner',status:'active'})})}
let fetched=[];
const fetchLink=async url=>{fetched.push(url);const r=await fetch(url);if(!r.ok)throw new Error('fetch '+r.status);return {bytes:new Uint8Array(await r.arrayBuffer()),contentType:r.headers.get('content-type')||''}};
function copier(extra){
 return createCloudCopy({fb,st,db:owner.firestore(),storage:owner.storage(),companyId:CO,env:ENV,uid:'owner1',sessionId:(extra&&extra.sessionId)||('S'+Math.random()),deviceId:'pc-1',deviceName:'Test PC',hooks:extra&&extra.hooks,fetchLink,isAllowedLink:u=>u.startsWith(EMU)});
}
const asAdmin=fn=>t.withSecurityRulesDisabled(async c=>fn(c.firestore(),c.storage()));
async function cloud(){
 const out={jobs:{},files:{},settings:null,switch:null};
 await asAdmin(async(db,s)=>{
  (await fb.getDocs(fb.collection(db,BASE+'/jobs'))).forEach(d=>{out.jobs[d.id]=d.data()});
  const se=await fb.getDoc(fb.doc(db,BASE+'/settings/studio'));out.settings=se.exists()?se.data():null;
  const sw=await fb.getDoc(fb.doc(db,BASE));out.switch=sw.exists()?sw.data():null;
  for(const [id,r] of Object.entries(out.jobs)){try{out.files[id]=JSON.parse(new TextDecoder().decode(await st.getBytes(st.ref(s,r.file))))}catch(e){out.files[id]=null}}
 });
 return out;
}
async function media(sha){let r=null;await asAdmin(async(db,s)=>{try{const m=await st.getMetadata(st.ref(s,'fiqmaster/'+CO+'/'+ENV+'/media/'+sha));const b=new Uint8Array(await st.getBytes(st.ref(s,'fiqmaster/'+CO+'/'+ENV+'/media/'+sha)));r={contentType:m.contentType,sha:await sha256Bytes(b)}}catch(e){r=null}});return r}
// A Mobile-style photo link: a generated image stored where Mobile puts photos (emulator).
async function mobilePhoto(jobId,label){
 let url;await asAdmin(async(db,s)=>{const r=st.ref(s,'companies/'+CO+'/jobs/'+jobId+'/mobile-media/'+label+'.jpg');await st.uploadBytes(r,fakeBytes(label,1500),{contentType:'image/jpeg'});url=EMU+'v0/b/'+r.bucket+'/o/'+encodeURIComponent(r.fullPath)+'?alt=media'});return url;
}
const clone=x=>JSON.parse(JSON.stringify(x));

(async()=>{
 t=await initializeTestEnvironment({projectId:'demo-fittersiq',firestore:{host:'127.0.0.1',port:8181,rules:RULES.firestore},storage:{host:'127.0.0.1',port:9199,rules:RULES.storage}});
 owner=t.authenticatedContext('owner1',{companyId:CO,role:'company_owner'});

 let base;// a full input reused across the first checks
 await check('S1. Full copy: packages, drawings (JPEG + PDF, shared once), tombstone with recycle-bin copy, settings, orphan recovery, Mobile photo link; verified',async()=>{
  await fresh('a');
  base=makeInput({jobs:4,seed:'a'});
  const link=await mobilePhoto(J(1),'photo-1');base.state.projects[0].jobLog[0].photos=[link];
  deepFreeze(base);const before=JSON.stringify(base);
  const r=await copier().copyAndVerify(base,'s2-1');
  assert.equal(r.ok,true,JSON.stringify(r.error||r.verify&&r.verify.problems||r.conflicts||r.mediaNotOwned));
  assert.equal(JSON.stringify(base),before,'browser input unchanged');
  const c=await cloud();
  for(const p of base.state.projects){
   const pkg=c.files[p.id];assert.equal(pkg.fiqPackage,2);assert.equal(JSON.stringify(pkg.job),JSON.stringify(p),'exact job '+p.id);
   assert.deepEqual(identities(pkg.job),identities(p));
   for(const cab of p.cabinets){const d=base.drawings.find(x=>x.key===p.id+':'+cab.id);const want=await sha256Bytes(dataUrlToBytes(d.drawing).bytes);
    assert.equal(pkg.drawings[cab.id].sha256,want,'drawing '+d.key);const m=await media(want);assert.ok(m&&m.sha===want,'media bytes '+d.key);
    assert.equal(m.contentType,d.drawingType==='pdf'?'application/pdf':'image/jpeg')}
  }
  assert.equal(c.files[J(2)].drawings[base.state.projects[1].cabinets[1].id].sha256,c.files[J(3)].drawings[base.state.projects[2].cabinets[1].id].sha256,'shared drawing = one media file');
  assert.ok(c.files[J(1)].links[link]&&(await media(c.files[J(1)].links[link].sha256)).sha===await sha256Bytes(fakeBytes('photo-1',1500)),'Mobile photo owned by fingerprint');
  const g=c.jobs['a-gone'];assert.deepEqual([g.deleted,g.rev],[true,2],'never-copied deleted job: version 1, then tombstone');
  const gp=c.files['a-gone'];assert.equal(JSON.stringify(gp.job),JSON.stringify(base.state.deletedProjects[0].project));assert.equal(gp.recycleBin.deletedAt,base.state.deletedProjects[0].deletedAt);
  assert.ok(gp.drawings['a-gone-u']&&gp.lifecycle.some(e=>e.event==='deleted'),'bin drawing and delete history kept');
  const v=c.settings.values;
  assert.equal(v['ls:fiq_supplier_prices_v1'],base.settings.fiq_supplier_prices_v1);assert.equal(v['state:units'],'"cm"');assert.equal(v['state:fitters'],JSON.stringify(base.state.fitters));
  assert.ok(!Object.keys(v).some(k=>/screen|drawingZoom|currentProject|dotCycle/.test(k)),'screen state not copied');
  const rec=JSON.parse(v['recovery.orphanDrawings']);assert.deepEqual(rec.map(x=>x.key),['a-oldjob:a-oldunit']);assert.ok((await media(rec[0].sha256)).sha===rec[0].sha256,'orphan drawing preserved');
  assert.deepEqual(r.orphanDrawings,['a-oldjob:a-oldunit']);
  assert.equal(c.switch.verifiedSha256,r.attempt.sourceSha256);assert.equal((await copier().checkVerified(base)).verified,true);
 });
 await check('S2. Rerun: nothing new; no media uploaded again; still verified',async()=>{
  const r=await copier().copyAndVerify(base,'s2-2');
  assert.equal(r.ok,true);assert.deepEqual([r.jobs.unchanged,r.jobs.created,r.jobs.updated,r.tombstones.unchanged,r.media.uploaded,r.settings],[4,0,0,1,0,'unchanged']);
 });
 await check('S3. Slice 1 plain job file is upgraded once to a package (next version)',async()=>{
  await fresh('b');
  const inp=deepFreeze(makeInput({jobs:2,seed:'b'}));const p=inp.state.projects[0];const text=JSON.stringify(p),sha=await sha256Hex(text);
  const file='fiqmaster/'+CO+'/'+ENV+'/jobs/'+p.id+'/r1-'+sha+'.json';
  await asAdmin(async(db,s)=>{await st.uploadString(st.ref(s,file),text,'raw',{contentType:'application/json'});await fb.setDoc(fb.doc(db,BASE+'/jobs/'+p.id),{rev:1,file,sha256:sha,bytes:text.length,name:p.name,customerId:p.customerId,schema:1,deleted:false,sessionId:'old',deviceId:'pc-1',updatedAt:fb.Timestamp.now(),updatedBy:'owner1'})});
  const r=await copier().copyAndVerify(inp,'s3');
  assert.equal(r.ok,true,JSON.stringify(r.error||r.verify.problems));const c=await cloud();assert.equal(c.jobs[p.id].rev,2);assert.equal(c.files[p.id].fiqPackage,2);
 });
 await check('S4. Interrupted run (after media and files): failed, no marker; rerun reuses media and files, nothing duplicated',async()=>{
  await fresh('c');
  const inp=deepFreeze(makeInput({jobs:4,seed:'c'}));
  const r=await copier({hooks:{afterFile:a=>{if(a.jobId===J(3))throw new Error('network lost')}}}).copyAndVerify(inp,'s4');
  assert.deepEqual([r.ok,r.markerWritten,r.attempt.outcome],[false,false,'failed']);assert.equal((await cloud()).switch,null);
  const r2=await copier().copyAndVerify(inp,'s4b');
  assert.equal(r2.ok,true,JSON.stringify(r2.error||r2.verify.problems));assert.ok(r2.media.reused>=1&&r2.filesReused===1,'media and the job 3 file reused');
  const c=await cloud();assert.ok(Object.values(c.jobs).filter(j=>!j.deleted).every(j=>j.rev===1));
 });
 await check('S5. Tampered media file: verification fails, no marker',async()=>{
  await fresh('d');
  const inp=deepFreeze(makeInput({jobs:3,seed:'d'}));
  const sha=await sha256Bytes(dataUrlToBytes(inp.drawings[0].drawing).bytes);
  const r=await copier({hooks:{beforeVerify:()=>asAdmin((db,s)=>st.uploadBytes(st.ref(s,'fiqmaster/'+CO+'/'+ENV+'/media/'+sha),fakeBytes('tampered',100),{contentType:'image/jpeg'}))}}).copyAndVerify(inp,'s5');
  assert.equal(r.ok,false);assert.ok(r.verify.problems.some(p=>/Media file missing or changed/.test(p)),r.verify.problems.join(' | '));assert.equal((await cloud()).switch,null);
 });
 await check('S6. A Production photo link is never fetched: run incomplete, no marker, everything else copied',async()=>{
  await fresh('e');
  const inp=makeInput({jobs:2,seed:'e'});const prod='https://firebasestorage.googleapis.com/v0/b/assembleone-fabac.firebasestorage.app/o/companies%2FX%2Fjobs%2Fj%2Fp.jpg?alt=media&token=t';
  inp.state.projects[0].jobLog[0].photos=[prod];deepFreeze(inp);fetched=[];
  const r=await copier().copyAndVerify(inp,'s6');
  assert.deepEqual([r.ok,r.markerWritten,r.attempt.outcome],[false,false,'incomplete']);
  assert.ok(!fetched.some(u=>/assembleone-fabac/.test(u)),'Production never fetched');
  assert.ok(r.mediaNotOwned.some(m=>m.id===J(1)&&m.links.includes(prod)));
  assert.ok(r.verify.problems.some(p=>/Production photo/.test(p)));
  const c=await cloud();assert.equal(c.jobs[J(2)].rev,1);assert.equal(c.switch,null);
 });
 await check('S7. Settings: a change becomes the next version; a stale settings version stops the run',async()=>{
  await fresh('f');
  const inp=makeInput({jobs:1,seed:'f'});deepFreeze(inp);
  assert.equal((await copier().copyAndVerify(inp,'s7')).ok,true);
  const inp2=clone(inp);inp2.settings.fiq_supplier_prices_v1='{"White":{"sheet":42}}';deepFreeze(inp2);
  const r=await copier().copyAndVerify(inp2,'s7b');assert.equal(r.settings,'updated');assert.equal((await cloud()).settings.rev,2);
  const inp3=clone(inp2);inp3.settings.assembleone_material_library_v1='["White"]';deepFreeze(inp3);
  const r3=await copier({hooks:{beforeSettings:()=>asAdmin(db=>fb.updateDoc(fb.doc(db,BASE+'/settings/studio'),{rev:9}))}}).copyAndVerify(inp3,'s7c');
  assert.deepEqual([r3.ok,r3.error&&r3.error.code,r3.markerWritten],[false,'stale',false]);
 });
 await check('S8. Deleted jobs: copied job deleted later -> tombstone; purged bin copy -> tombstone with no copy; a tombstone is never written again',async()=>{
  await fresh('g');
  const inp=makeInput({jobs:3,seed:'g'});deepFreeze(inp);
  assert.equal((await copier().copyAndVerify(inp,'s8')).ok,true);
  const del=clone(inp);const job2=del.state.projects.splice(1,1)[0];const at=Date.now();
  del.state.deletedProjects.unshift({deletedAt:at,project:job2});del.state.deletedProjectIds.push(job2.id,'g-purged');del.state.jobLifecycle.push({jobId:job2.id,event:'deleted',at});deepFreeze(del);
  const r=await copier().copyAndVerify(del,'s8b');assert.equal(r.ok,true,JSON.stringify(r.error||r.verify.problems||r.conflicts));
  const c=await cloud();assert.deepEqual([c.jobs[J(2)].deleted,c.jobs[J(2)].rev],[true,2]);assert.equal(c.files[J(2)].recycleBin.deletedAt,at);
  assert.deepEqual([c.jobs['g-purged'].deleted,c.files['g-purged'].job],[true,null]);
  // Later the browser purges the bin copy (30 days): the tombstone is not touched.
  const purged=clone(del);purged.state.deletedProjects=purged.state.deletedProjects.filter(x=>x.project.id!==J(2));deepFreeze(purged);
  const r2=await copier().copyAndVerify(purged,'s8c');assert.equal(r2.ok,true,JSON.stringify(r2.verify&&r2.verify.problems));
  assert.equal((await cloud()).jobs[J(2)].rev,2,'tombstone never written again');
  base=purged;// for S9
 });
 await check('S9. Restore: with a recorded restore -> deliberate cloud restore; without -> conflict, never overwritten',async()=>{
  const job2=JSON.parse(JSON.stringify((await cloud()).files[J(2)].job));
  const stale=clone(base);stale.state.projects.push(job2);stale.state.deletedProjectIds=stale.state.deletedProjectIds.filter(x=>x!==J(2));deepFreeze(stale);
  const r=await copier().copyAndVerify(stale,'s9');assert.equal(r.ok,false);assert.ok(r.conflicts.some(x=>x.id===J(2)&&/no restore recorded/.test(x.reason)));
  assert.equal((await cloud()).jobs[J(2)].deleted,true,'not brought back');
  const rest=clone(stale);rest.state.jobLifecycle.push({jobId:J(2),event:'restored',at:Date.now()+1000,deletedAt:1});deepFreeze(rest);
  const r2=await copier().copyAndVerify(rest,'s9b');assert.equal(r2.ok,true,JSON.stringify(r2.error||r2.verify.problems||r2.conflicts));assert.equal(r2.jobs.restored,1);
  const c=await cloud();const j=c.jobs[J(2)];assert.deepEqual([j.deleted,j.rev,!!j.restoredAt,!!j.deletedAt],[false,3,true,true]);
  assert.deepEqual(c.files[J(2)].lifecycle.map(e=>e.event),['deleted','restored'],'history carried forward');
 });
 await check('S10. Orphan drawings are never dropped from the recovery list',async()=>{
  await fresh('h');
  const inp=makeInput({jobs:1,seed:'h'});deepFreeze(inp);assert.equal((await copier().copyAndVerify(inp,'s10')).ok,true);
  const later=clone(inp);later.drawings=later.drawings.filter(d=>!/oldjob/.test(d.key));deepFreeze(later);
  assert.equal((await copier().copyAndVerify(later,'s10b')).ok,true);
  const list=JSON.parse((await cloud()).settings.values['recovery.orphanDrawings']);assert.deepEqual(list.map(x=>x.key),['h-oldjob:h-oldunit']);
 });
 await check('S11. The marker covers everything: a changed drawing, setting, deleted list or history no longer counts as verified',async()=>{
  await fresh('i');
  const inp=makeInput({jobs:2,seed:'i'});deepFreeze(inp);assert.equal((await copier().copyAndVerify(inp,'s11')).ok,true);
  const v=x=>copier().checkVerified(x).then(r=>r.verified);
  assert.equal(await v(inp),true);
  const a=clone(inp);a.drawings[0].drawing='data:image/jpeg;base64,'+fakeBytes('changed',500).toString('base64');assert.equal(await v(a),false,'drawing');
  const b=clone(inp);b.settings.fiq_supplier_prices_v1='{}';assert.equal(await v(b),false,'setting');
  const c=clone(inp);c.state.deletedProjectIds.push('i-new-del');assert.equal(await v(c),false,'deleted list');
  const d=clone(inp);d.state.jobLifecycle.push({jobId:J(1),event:'restored',at:5});assert.equal(await v(d),false,'history');
  const e=clone(inp);e.state.screen='jobs';e.state.drawingZoom=3;assert.equal(await v(e),true,'screen state does not matter');
 });
 await check('S12. Scale: 40 jobs, 80 drawings (100 KB), 200 Mobile photo links, verified',async()=>{
  await fresh('z');
  const inp=makeInput({jobs:40,seed:'z',drawingSize:100*1024});
  for(let i=0;i<40;i++){const links=[];for(let k=0;k<5;k++)links.push(await mobilePhoto(inp.state.projects[i].id,'p'+i+'-'+k));inp.state.projects[i].jobLog[0].photos=links}
  deepFreeze(inp);
  const t0=Date.now();const r=await copier().copyAndVerify(inp,'s12');const ms=Date.now()-t0;
  assert.equal(r.ok,true,JSON.stringify(r.error||r.verify&&r.verify.problems.slice(0,5)));
  assert.deepEqual([r.verify.checked.jobs,r.verify.checked.drawings],[40,82]);
  console.log('      (copy + verify took '+(ms/1000).toFixed(1)+' s in the emulator; media uploaded '+r.media.uploaded+')');
 });

 await t.cleanup();
 fs.writeFileSync(path.join(__dirname,'cloud-copy-slice2-test-results.json'),JSON.stringify({ranAt:new Date().toISOString(),rules:DIR,failures,results},null,1));
 console.log('\n'+(failures?failures+' FAILED':'All '+results.length+' slice 2 tests passed'));
 process.exit(failures?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
