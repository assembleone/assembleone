// Stage 2.1: emulator tests for the proposed cloud master rules.
// Runs only against the local Firebase emulator (project demo-fittersiq: the demo- prefix
// can never reach a real Firebase project). Start with: npm test (in this folder).
//
// Part A: the new fiqMaster paths (Firestore) and fiqmaster/ files (Storage):
//   owner allowed; fitter, other company, forged claims, suspended owner, FittersIQ admin
//   and signed-out users denied; version numbers; the one-Studio lease; durable tombstones.
// Part B: "same answers": every existing path (Mobile job messages, members, devices,
//   fitters, invitations, licences, users, support, activity, pairing codes, company,
//   Storage job media) gives exactly the same allow/deny under the current rules
//   (../firestore.rules, ../storage.rules) and the proposed rules.
const fs=require('node:fs'),path=require('node:path');
const {initializeTestEnvironment}=require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,updateDoc,deleteDoc,serverTimestamp,Timestamp}=require('firebase/firestore');
const {ref,uploadString,getBytes,deleteObject}=require('firebase/storage');

const PROPOSED={firestore:fs.readFileSync(path.join(__dirname,process.env.RULES_DIR||'.','firestore.rules'),'utf8'),storage:fs.readFileSync(path.join(__dirname,process.env.RULES_DIR||'.','storage.rules'),'utf8')};
const CURRENT={firestore:fs.readFileSync(path.join(__dirname,'..','firestore.rules'),'utf8'),storage:fs.readFileSync(path.join(__dirname,'..','storage.rules'),'utf8')};
const FS_HOST='127.0.0.1',FS_PORT=8181,ST_PORT=9199;
const SHA='a'.repeat(64);// content fingerprint used in test file names
const results=[];let failures=0;

async function outcome(fn){
 try{await fn();return 'allow'}
 catch(e){const c=String(e&&e.code||'');if(/permission-denied|PERMISSION_DENIED|unauthorized|storage\/unauthorized/i.test(c)||/PERMISSION_DENIED|does not have permission|Permission denied/i.test(String(e&&e.message)))return 'deny';return 'error: '+(c||e.message)}
}
async function expect(label,want,fn){
 const got=await outcome(fn);
 const ok=got===want;if(!ok)failures++;
 results.push({label,want,got,ok});
 console.log((ok?'ok  ':'FAIL')+'  '+want.padEnd(5)+'  '+label+(ok?'':'   (got '+got+')'));
}
async function env(projectId,rules){
 return initializeTestEnvironment({projectId,
  firestore:{host:FS_HOST,port:FS_PORT,rules:rules.firestore},
  storage:{host:FS_HOST,port:ST_PORT,rules:rules.storage}});
}
async function seed(t){
 await t.withSecurityRulesDisabled(async ctx=>{
  const db=ctx.firestore();
  await setDoc(doc(db,'companies/c1'),{name:'Company One'});
  await setDoc(doc(db,'companies/c2'),{name:'Company Two'});
  await setDoc(doc(db,'companies/c1/members/owner1'),{role:'company_owner',status:'active'});
  await setDoc(doc(db,'companies/c1/members/fitter1'),{role:'fitter',status:'active'});
  await setDoc(doc(db,'companies/c1/members/susp1'),{role:'company_owner',status:'suspended'});
  await setDoc(doc(db,'companies/c2/members/owner2'),{role:'company_owner',status:'active'});
  await setDoc(doc(db,'companies/c1/jobs/m1'),{kind:'siteJobPacket',status:'waiting'});
  await setDoc(doc(db,'companies/c1/members/owner1/devices/dev1'),{approved:false});
  await setDoc(doc(db,'companies/c1/invitations/i1'),{email:'x@y.z'});
  await setDoc(doc(db,'companies/c1/licences/l1'),{plan:'beta'});
  await setDoc(doc(db,'pairingCodes/123456'),{companyId:'c1'});
  await uploadString(ref(ctx.storage(),'companies/c1/jobs/j1/media/seed.jpg'),'img','raw',{contentType:'image/jpeg'});
 });
}
function who(t){
 return {
  owner:t.authenticatedContext('owner1',{companyId:'c1',role:'company_owner'}),
  fitter:t.authenticatedContext('fitter1',{companyId:'c1',role:'fitter'}),
  susp:t.authenticatedContext('susp1',{companyId:'c1',role:'company_owner'}),
  other:t.authenticatedContext('owner2',{companyId:'c2',role:'company_owner'}),
  forged:t.authenticatedContext('owner2',{companyId:'c1',role:'company_owner'}),// owner of c2 claiming c1
  admin:t.authenticatedContext('admin1',{fittersiq_admin:true}),
  anon:t.unauthenticatedContext(),
 };
}

// ---------------------------------------------------------------- Part A
async function partA(){
 console.log('\n== Part A: cloud master rules (proposed) ==');
 const t=await env('demo-fittersiq',PROPOSED);
 await t.clearFirestore();await t.clearStorage();await seed(t);
 const u=who(t);
 const M='companies/c1/fiqMaster/beta';
 const later=ms=>Timestamp.fromMillis(Date.now()+ms);
 const lease=(ctx,uid,session,extra)=>setDoc(doc(ctx.firestore(),M+'/lease/studio'),{holderUid:uid,sessionId:session,deviceId:'d1',deviceName:'Office PC',heartbeatAt:serverTimestamp(),expiresAt:later(120000),...(extra||{})});
 const job=(uid,rev,session,extra)=>({rev,file:'fiqmaster/c1/beta/jobs/j1/r'+rev+'-'+SHA+'.json',sha256:'a'.repeat(64),bytes:1200,name:'Anna kitchen',customerId:'cu1',schema:1,deleted:false,sessionId:session,deviceId:'d1',updatedAt:serverTimestamp(),updatedBy:uid,...(extra||{})});
 const putJob=(ctx,data)=>setDoc(doc(ctx.firestore(),M+'/jobs/j1'),data);

 // Access by role
 await expect('lease: owner takes a free lease','allow',()=>lease(u.owner,'owner1','S1'));
 for(const [k,uid] of [['fitter','fitter1'],['other company owner','owner2'],['forged claims (other owner says c1)','owner2'],['suspended owner','susp1'],['FittersIQ admin','admin1']]){
  const ctx={fitter:u.fitter,'other company owner':u.other,'forged claims (other owner says c1)':u.forged,'suspended owner':u.susp,'FittersIQ admin':u.admin}[k];
  await expect('lease: '+k+' cannot take it','deny',()=>lease(ctx,uid,'X'));
  await expect('read: '+k+' cannot read the lease','deny',()=>getDoc(doc(ctx.firestore(),M+'/lease/studio')));
 }
 await expect('lease: signed out cannot take it','deny',()=>lease(u.anon,'nobody','X'));
 await expect('read: signed out cannot read','deny',()=>getDoc(doc(u.anon.firestore(),M+'/lease/studio')));
 await expect('read: owner reads the lease','allow',()=>getDoc(doc(u.owner.firestore(),M+'/lease/studio')));

 // One-Studio lease
 await expect('lease: a second Studio session cannot take an active lease','deny',()=>lease(u.owner,'owner1','S2'));
 await expect('lease: the holder renews it','allow',()=>lease(u.owner,'owner1','S1'));
 await expect('lease: longer than 5 minutes refused','deny',()=>lease(u.owner,'owner1','S1',{expiresAt:later(10*60000)}));
 await expect('lease: deleting it refused','deny',()=>deleteDoc(doc(u.owner.firestore(),M+'/lease/studio')));

 // Job records: versions
 await expect('job: create at version 1 while holding the lease','allow',()=>putJob(u.owner,job('owner1',1,'S1')));
 await expect('job: owner reads it','allow',()=>getDoc(doc(u.owner.firestore(),M+'/jobs/j1')));
 for(const [k,ctx] of [['fitter',u.fitter],['other company owner',u.other],['forged claims',u.forged],['suspended owner',u.susp],['FittersIQ admin',u.admin],['signed out',u.anon]])
  await expect('job: '+k+' cannot read it','deny',()=>getDoc(doc(ctx.firestore(),M+'/jobs/j1')));
 await expect('job: fitter cannot write it','deny',()=>putJob(u.fitter,job('fitter1',2,'S1')));
 await expect('job: session without the lease cannot write','deny',()=>putJob(u.owner,job('owner1',2,'S2')));
 await expect('job: update to the next version (2)','allow',()=>putJob(u.owner,job('owner1',2,'S1')));
 await expect('job: stale computer writes version 2 again','deny',()=>putJob(u.owner,job('owner1',2,'S1',{name:'old copy'})));
 await expect('job: skipping a version (4) refused','deny',()=>putJob(u.owner,job('owner1',4,'S1',{file:'fiqmaster/c1/beta/jobs/j1/r4-'+SHA+'.json'})));
 await expect('job: going back a version (1) refused','deny',()=>putJob(u.owner,job('owner1',1,'S1')));
 await expect('job: file name not matching the version refused','deny',()=>putJob(u.owner,job('owner1',3,'S1',{file:'fiqmaster/c1/beta/jobs/j1/r9-'+SHA+'.json'})));
 await expect('job: computer clock instead of server time refused','deny',()=>putJob(u.owner,job('owner1',3,'S1',{updatedAt:Timestamp.now()})));
 await expect('job: another person\'s name as writer refused','deny',()=>putJob(u.owner,job('owner1',3,'S1',{updatedBy:'fitter1'})));
 await expect('job: unknown extra field refused','deny',()=>putJob(u.owner,job('owner1',3,'S1',{hack:1})));
 await expect('job: hard delete refused','deny',()=>deleteDoc(doc(u.owner.firestore(),M+'/jobs/j1')));
 await expect('job: new job created at version 2 refused','deny',()=>setDoc(doc(u.owner.firestore(),M+'/jobs/j2'),{...job('owner1',2,'S1'),file:'fiqmaster/c1/beta/jobs/j2/r2-'+SHA+'.json'}));

 // Tombstones
 await expect('tombstone: delete (version 3, deleted, server time)','allow',()=>putJob(u.owner,job('owner1',3,'S1',{deleted:true,deletedAt:serverTimestamp()})));
 let del;await t.withSecurityRulesDisabled(async ctx=>{const d=(await getDoc(doc(ctx.firestore(),M+'/jobs/j1'))).data().deletedAt;del=new Timestamp(d.seconds,d.nanoseconds)});// exact server time, full precision
 await expect('tombstone: stale save that does not know about the delete refused','deny',()=>putJob(u.owner,job('owner1',4,'S1')));
 await expect('tombstone: changing a deleted job refused','deny',()=>putJob(u.owner,job('owner1',4,'S1',{deleted:true,deletedAt:del,name:'changed'})));
 await expect('tombstone: new delete time on a deleted job refused','deny',()=>putJob(u.owner,job('owner1',4,'S1',{deleted:true,deletedAt:serverTimestamp()})));
 await expect('tombstone: restore that changes the delete time refused','deny',()=>putJob(u.owner,job('owner1',4,'S1',{deleted:false,deletedAt:serverTimestamp(),restoredAt:serverTimestamp()})));
 await expect('tombstone: restore with computer clock refused','deny',()=>putJob(u.owner,job('owner1',4,'S1',{deleted:false,deletedAt:del,restoredAt:Timestamp.now()})));
 await expect('tombstone: fitter cannot restore','deny',()=>putJob(u.fitter,job('fitter1',4,'S1',{deleted:false,deletedAt:del,restoredAt:serverTimestamp()})));
 await expect('tombstone: hard delete of a deleted job refused','deny',()=>deleteDoc(doc(u.owner.firestore(),M+'/jobs/j1')));
 await expect('tombstone: deliberate Restore (version 4)','allow',()=>putJob(u.owner,job('owner1',4,'S1',{deleted:false,deletedAt:del,restoredAt:serverTimestamp()})));

 // Lease hand-over
 await expect('lease: another Studio takes over on purpose','allow',()=>lease(u.owner,'owner1','S2',{takenOverAt:serverTimestamp()}));
 await expect('job: the old Studio session can no longer write','deny',()=>putJob(u.owner,job('owner1',5,'S1')));
 await expect('job: the new holder writes version 5','allow',()=>putJob(u.owner,job('owner1',5,'S2')));
 await t.withSecurityRulesDisabled(async ctx=>setDoc(doc(ctx.firestore(),M+'/lease/studio'),{holderUid:'owner1',sessionId:'S2',deviceId:'d1',deviceName:'Office PC',heartbeatAt:Timestamp.fromMillis(Date.now()-600000),expiresAt:Timestamp.fromMillis(Date.now()-300000)}));
 await expect('job: holder with an expired lease cannot write','deny',()=>putJob(u.owner,job('owner1',6,'S2')));
 await expect('lease: an expired lease can be taken without take-over','allow',()=>lease(u.owner,'owner1','S3'));

 // Customers, settings, switch record, env
 const cust=(rev,extra)=>({rev,data:{id:'cu1',name:'Anna Berg'},schema:1,deleted:false,sessionId:'S3',deviceId:'d1',updatedAt:serverTimestamp(),updatedBy:'owner1',...(extra||{})});
 await expect('customer: create by id','allow',()=>setDoc(doc(u.owner.firestore(),M+'/customers/cu1'),cust(1)));
 await expect('customer: record id must match customer id','deny',()=>setDoc(doc(u.owner.firestore(),M+'/customers/cu9'),cust(1)));
 await expect('customer: fitter cannot read','deny',()=>getDoc(doc(u.fitter.firestore(),M+'/customers/cu1')));
 await expect('customer: delete (tombstone)','allow',()=>setDoc(doc(u.owner.firestore(),M+'/customers/cu1'),cust(2,{deleted:true,deletedAt:serverTimestamp()})));
 await expect('customer: stale save cannot bring it back','deny',()=>setDoc(doc(u.owner.firestore(),M+'/customers/cu1'),cust(3)));
 await expect('customer: hard delete refused','deny',()=>deleteDoc(doc(u.owner.firestore(),M+'/customers/cu1')));
 const set=(rev,extra)=>({rev,values:{fiq_supplier_prices_v1:'{}'},schema:1,sessionId:'S3',deviceId:'d1',updatedAt:serverTimestamp(),updatedBy:'owner1',...(extra||{})});
 await expect('settings: create studio settings','allow',()=>setDoc(doc(u.owner.firestore(),M+'/settings/studio'),set(1)));
 await expect('settings: other settings record refused','deny',()=>setDoc(doc(u.owner.firestore(),M+'/settings/other'),set(1)));
 await expect('settings: next version','allow',()=>setDoc(doc(u.owner.firestore(),M+'/settings/studio'),set(2)));
 await expect('settings: stale version refused','deny',()=>setDoc(doc(u.owner.firestore(),M+'/settings/studio'),set(2)));
 const sw=(rev,mode)=>({rev,mode,migrationId:'m1',verifiedSha256:'b'.repeat(64),switchedAt:serverTimestamp(),switchedBy:'owner1',sessionId:'S3',updatedAt:serverTimestamp(),updatedBy:'owner1'});
 await expect('switch: create (browser master)','allow',()=>setDoc(doc(u.owner.firestore(),M),sw(1,'local')));
 await expect('switch: unknown mode refused','deny',()=>setDoc(doc(u.owner.firestore(),M),sw(2,'other')));
 await expect('switch: fitter cannot change it','deny',()=>setDoc(doc(u.fitter.firestore(),M),sw(2,'cloud')));
 await expect('switch: delete refused','deny',()=>deleteDoc(doc(u.owner.firestore(),M)));
 await expect('env: only beta or production','deny',()=>setDoc(doc(u.owner.firestore(),'companies/c1/fiqMaster/staging/lease/studio'),{holderUid:'owner1',sessionId:'S1',deviceId:'d1',deviceName:'PC',heartbeatAt:serverTimestamp(),expiresAt:later(60000)}));
 await expect('other company: its own master works (isolated)','allow',()=>setDoc(doc(u.other.firestore(),'companies/c2/fiqMaster/beta/lease/studio'),{holderUid:'owner2',sessionId:'Q1',deviceId:'d9',deviceName:'PC',heartbeatAt:serverTimestamp(),expiresAt:later(60000)}));
 await expect('other company: owner of c1 cannot read c2 master','deny',()=>getDoc(doc(u.owner.firestore(),'companies/c2/fiqMaster/beta/lease/studio')));

 // Storage: master files
 const F='fiqmaster/c1/beta/jobs/j1/r1-'+SHA+'.json',put=(ctx,p,type,session)=>uploadString(ref(ctx.storage(),p),'{"id":"j1"}','raw',{contentType:type||'application/json',customMetadata:{sessionId:session||'S3'}});// S3 holds the lock here
 await expect('file: owner adds a job version file','allow',()=>put(u.owner,F));
 await expect('file: owner reads it','allow',()=>getBytes(ref(u.owner.storage(),F)));
 await expect('file: overwriting a version file refused','deny',()=>put(u.owner,F));
 await expect('file: deleting refused','deny',()=>deleteObject(ref(u.owner.storage(),F)));
 await expect('file: owner adds a photo','allow',()=>put(u.owner,'fiqmaster/c1/beta/media/'+'c'.repeat(64),'image/jpeg'));
 await expect('file: other file types refused','deny',()=>put(u.owner,'fiqmaster/c1/beta/media/x.txt','text/plain'));
 await expect('file: env other than beta/production refused','deny',()=>put(u.owner,'fiqmaster/c1/staging/jobs/j1/r1-'+SHA+'.json'));
 for(const [k,ctx] of [['fitter',u.fitter],['other company owner',u.other],['forged claims',u.forged],['suspended owner',u.susp],['FittersIQ admin',u.admin],['signed out',u.anon]]){
  await expect('file: '+k+' cannot read','deny',()=>getBytes(ref(ctx.storage(),F)));
  await expect('file: '+k+' cannot add','deny',()=>put(ctx,'fiqmaster/c1/beta/jobs/j1/r2-'+SHA+'.json'));
 }
 await t.cleanup();
}

// ---------------------------------------------------------------- Part B
async function matrix(t){
 await t.clearFirestore();await t.clearStorage();await seed(t);
 const u=who(t),out=[];
 const run=async(label,fn)=>out.push([label,await outcome(fn)]);
 for(const [k,ctx] of Object.entries(u)){
  const db=ctx.firestore(),st=ctx.storage(),uid={owner:'owner1',fitter:'fitter1',susp:'susp1',other:'owner2',forged:'owner2',admin:'admin1',anon:'nobody'}[k];
  await run(k+': read Mobile message',()=>getDoc(doc(db,'companies/c1/jobs/m1')));
  await run(k+': send Mobile message',()=>setDoc(doc(db,'companies/c1/jobs/mobile-j1-'+uid),{kind:'siteJobPacket',status:'waiting'}));
  await run(k+': mark message received',()=>updateDoc(doc(db,'companies/c1/jobs/m1'),{status:'received'}));
  await run(k+': Studio to Mobile message',()=>setDoc(doc(db,'companies/c1/jobs/studio-job-j1'),{kind:'studioToMobilePacket',status:'waiting',active:true}));
  await run(k+': delete message',()=>deleteDoc(doc(db,'companies/c1/jobs/m1')));
  await t.withSecurityRulesDisabled(async c=>setDoc(doc(c.firestore(),'companies/c1/jobs/m1'),{kind:'siteJobPacket',status:'waiting'}));
  await run(k+': read company',()=>getDoc(doc(db,'companies/c1')));
  await run(k+': update company',()=>updateDoc(doc(db,'companies/c1'),{name:'x'}));
  await run(k+': read member',()=>getDoc(doc(db,'companies/c1/members/fitter1')));
  await run(k+': change member',()=>updateDoc(doc(db,'companies/c1/members/fitter1'),{role:'company_owner'}));
  await run(k+': register own device',()=>setDoc(doc(db,'companies/c1/members/'+uid+'/devices/d-'+k),{approved:false}));
  await run(k+': approve device',()=>updateDoc(doc(db,'companies/c1/members/owner1/devices/dev1'),{approved:true}));
  await run(k+': create fitter record',()=>setDoc(doc(db,'companies/c1/fitters/f-'+k),{name:'F'}));
  await run(k+': read invitations',()=>getDoc(doc(db,'companies/c1/invitations/i1')));
  await run(k+': read licence',()=>getDoc(doc(db,'companies/c1/licences/l1')));
  await run(k+': create own user record',()=>setDoc(doc(db,'users/'+uid),{email:'e'}));
  await run(k+': support ticket',()=>setDoc(doc(db,'supportTickets/t-'+k),{uid,companyId:'c1'}));
  await run(k+': activity log',()=>setDoc(doc(db,'activityLog/a-'+k),{uid,companyId:'c1'}));
  await run(k+': read pairing code',()=>getDoc(doc(db,'pairingCodes/123456')));
  await run(k+': unknown top-level path',()=>setDoc(doc(db,'anything/else'),{a:1}));
  await run(k+': read job media file',()=>getBytes(ref(st,'companies/c1/jobs/j1/media/seed.jpg')));
  await run(k+': upload job media file',()=>uploadString(ref(st,'companies/c1/jobs/j1/media/'+k+'.jpg'),'img','raw',{contentType:'image/jpeg'}));
  await run(k+': upload outside companies/',()=>uploadString(ref(st,'other/'+k+'.jpg'),'img','raw',{contentType:'image/jpeg'}));
 }
 return out;
}
async function partB(){
 console.log('\n== Part B: existing paths give the same answers (current vs proposed) ==');
 let t=await env('demo-fittersiq',CURRENT);const current=await matrix(t);await t.cleanup();
 t=await env('demo-fittersiq',PROPOSED);const proposed=await matrix(t);await t.cleanup();
 let same=0;
 current.forEach(([label,a],i)=>{const b=proposed[i][1];const ok=a===b&&!/^error/.test(a);if(ok)same++;else{failures++;console.log('FAIL  '+label+': current '+a+', proposed '+b)}results.push({label:'same answer: '+label,want:a,got:b,ok})});
 const allowed=current.filter(x=>x[1]==='allow').length;
 console.log('ok    '+same+' of '+current.length+' existing-path checks give the same answer ('+allowed+' allowed, '+(current.length-allowed)+' denied under both)');
}

(async()=>{
 await partA();
 await partB();
 fs.writeFileSync(path.join(__dirname,'rules-test-results.json'),JSON.stringify({ranAt:new Date().toISOString(),failures,results},null,1));
 console.log('\n'+(failures?failures+' check(s) FAILED':'All checks passed')+' ('+results.length+' checks)');
 process.exit(failures?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
