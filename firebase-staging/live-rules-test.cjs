// Live Stage 2.1 security test against fittersiq-staging (STAGING ONLY).
//   node live-rules-test.cjs          prints the plan only (no network, nothing written)
//   node live-rules-test.cjs --run    runs it (only after approval)
// All ALLOWED writes go into the test company "FittersIQ STAGING OTHER" (B), env "beta".
// "FittersIQ STAGING" (A) gets no master data: only refused attempts and reads of
// documents that do not exist. Test ids start with "livetest-".
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const STAGING={apiKey:'AIzaSyBlglyejGrObsr25JL5-eOSfhF9joBxZUI',authDomain:'fittersiq-staging.firebaseapp.com',projectId:'fittersiq-staging',storageBucket:'fittersiq-staging.firebasestorage.app',messagingSenderId:'974434464573',appId:'1:974434464573:web:f5b5499766d6dab2e0cb54'};
if(Object.values(STAGING).some(v=>/assembleone|fabac|906839446136/i.test(v)))throw new Error('Refused: not staging');
const A='AGEO6HnQuj4id29ERJGV',B='SivhuYsf35ktlq7DXo9H';
const MA='companies/'+A+'/fiqMaster/beta',MB='companies/'+B+'/fiqMaster/beta',FB='fiqmaster/'+B+'/beta';
const JOB='livetest-job-1',CUST='livetest-cust-1';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const C={v1:'{"job":"livetest v1"}',v2:'{"job":"livetest v2"}',stale:'{"job":"livetest stale copy"}',v5:'{"job":"livetest v5 by S2"}',s1late:'{"job":"livetest by S1 after take-over"}'};
const H=Object.fromEntries(Object.entries(C).map(([k,v])=>[k,sha(v)]));
const jobFile=(rev,h)=>FB+'/jobs/'+JOB+'/r'+rev+'-'+h+'.json';

// who: anon | owner (A owner) | other (B owner) | fitter1 (A, active) | fitter2 (A, suspended)
// kind: read | lease | job | file | del | cust | settings | switch | wait
const STEPS=[
 ['Roles and isolation (nothing is created)'],
 {who:'anon',   kind:'read', path:MB+'/lease/studio', expect:'refuse', what:'Signed out reads a master record'},
 {who:'anon',   kind:'lease',co:B,session:'X', expect:'refuse', what:'Signed out takes the editing lock'},
 {who:'fitter1',kind:'read', path:MA+'/lease/studio', expect:'refuse', what:'Active fitter reads own company master'},
 {who:'fitter1',kind:'lease',co:A,session:'X', expect:'refuse', what:'Active fitter takes own company lock'},
 {who:'fitter2',kind:'read', path:MA+'/lease/studio', expect:'refuse', what:'Suspended fitter reads own company master'},
 {who:'fitter2',kind:'lease',co:A,session:'X', expect:'refuse', what:'Suspended fitter takes own company lock'},
 {who:'owner',  kind:'read', path:MA+'/lease/studio', expect:'allow',  what:'Owner reads own company master (record does not exist)'},
 {who:'owner',  kind:'read', path:MB+'/lease/studio', expect:'refuse', what:'Owner reads OTHER company master'},
 {who:'owner',  kind:'lease',co:B,session:'X', expect:'refuse', what:'Owner takes OTHER company lock'},
 {who:'other',  kind:'read', path:MA+'/lease/studio', expect:'refuse', what:'Other company owner reads company A master'},
 ['Existing Mobile messages still behave as today (reads of a message that does not exist)'],
 {who:'fitter1',kind:'read', path:'companies/'+A+'/jobs/livetest-none', expect:'allow',  what:'Active fitter reads a message'},
 {who:'fitter2',kind:'read', path:'companies/'+A+'/jobs/livetest-none', expect:'refuse', what:'Suspended fitter reads a message'},
 {who:'other',  kind:'read', path:'companies/'+A+'/jobs/livetest-none', expect:'refuse', what:'Other company owner reads a message'},
 {who:'anon',   kind:'read', path:'companies/'+A+'/jobs/livetest-none', expect:'refuse', what:'Signed out reads a message'},
 ['Studio editing lock (company B, account "other")'],
 {who:'other',kind:'lease',co:B,session:'S1', expect:'allow',  what:'Studio S1 takes the free lock (2 minutes)', writes:MB+'/lease/studio'},
 {who:'other',kind:'lease',co:B,session:'S2', expect:'refuse', what:'Second Studio S2 takes the active lock'},
 {who:'other',kind:'lease',co:B,session:'S1', expect:'allow',  what:'S1 renews its lock', writes:MB+'/lease/studio'},
 {who:'other',kind:'lease',co:B,session:'S1',minutes:10, expect:'refuse', what:'S1 asks for a 10-minute lock'},
 {who:'other',kind:'del',  path:MB+'/lease/studio', expect:'refuse', what:'Deleting the lock'},
 ['Sequential versions and a stale writer (job '+JOB+')'],
 {who:'other',kind:'file',path:jobFile(1,H.v1),body:'v1',session:'S1', expect:'allow', what:'S1 adds the version 1 file', writes:jobFile(1,H.v1)},
 {who:'other',kind:'job', rev:1,h:'v1',session:'S1', expect:'allow', what:'S1 creates the record at version 1', writes:MB+'/jobs/'+JOB},
 {who:'other',kind:'file',path:jobFile(2,H.stale),body:'stale',session:'S0', expect:'refuse', what:'Stale Studio S0 (no lock) adds a version 2 file'},
 {who:'other',kind:'job', rev:2,h:'stale',session:'S0', expect:'refuse', what:'Stale Studio S0 moves the record to version 2'},
 {who:'other',kind:'file',path:jobFile(2,H.v2),body:'v2',session:'S1', expect:'allow', what:'S1 adds the version 2 file', writes:jobFile(2,H.v2)},
 {who:'other',kind:'job', rev:2,h:'v2',session:'S1', expect:'allow', what:'S1 moves the record to version 2', writes:MB+'/jobs/'+JOB},
 {who:'other',kind:'job', rev:2,h:'stale',session:'S1', expect:'refuse', what:'A save based on the old version (version 2 again)'},
 {who:'other',kind:'job', rev:4,h:'v2',session:'S1', expect:'refuse', what:'Skipping to version 4'},
 {who:'other',kind:'job', rev:3,h:'v2',session:'S1',clientClock:true, expect:'refuse', what:'Version 3 stamped with the computer clock'},
 {who:'other',kind:'job', rev:3,h:'v2',session:'S1',fileOf:'stale', expect:'refuse', what:'Record naming a file whose fingerprint does not match'},
 {who:'other',kind:'file',path:jobFile(1,H.v1),body:'stale',session:'S1', expect:'refuse', what:'Overwriting the version 1 file'},
 {who:'other',kind:'delfile',path:jobFile(1,H.v1), expect:'refuse', what:'Deleting the version 1 file'},
 {who:'other',kind:'del', path:MB+'/jobs/'+JOB, expect:'refuse', what:'Hard delete of the job record'},
 {who:'other',  kind:'read',    path:MB+'/jobs/'+JOB, expect:'allow',  what:'Company B owner reads its job record'},
 {who:'owner',  kind:'read',    path:MB+'/jobs/'+JOB, expect:'refuse', what:'Company A owner reads it'},
 {who:'fitter1',kind:'read',    path:MB+'/jobs/'+JOB, expect:'refuse', what:'A fitter reads it'},
 {who:'other',  kind:'readfile',path:jobFile(2,H.v2), expect:'allow',  what:'Company B owner reads its file'},
 {who:'owner',  kind:'readfile',path:jobFile(2,H.v2), expect:'refuse', what:'Company A owner reads it'},
 {who:'anon',   kind:'readfile',path:jobFile(2,H.v2), expect:'refuse', what:'Signed out reads it'},
 {who:'fitter1',kind:'file',    path:FB+'/media/'+H.stale,body:'stale',session:'S1',image:true, expect:'refuse', what:'A fitter adds a photo to company B'},
 ['Deleted records stay deleted'],
 {who:'other',kind:'job',rev:3,h:'v2',session:'S1',deleted:true, expect:'allow',  what:'S1 deletes the job (version 3, tombstone)', writes:MB+'/jobs/'+JOB},
 {who:'other',kind:'job',rev:4,h:'v2',session:'S1', expect:'refuse', what:'A save that does not know about the delete'},
 {who:'other',kind:'job',rev:4,h:'v2',session:'S1',deleted:'same', expect:'refuse', what:'Changing the deleted job'},
 {who:'other',kind:'job',rev:4,h:'v2',session:'S1',restore:true, expect:'allow',  what:'Deliberate Restore (version 4)', writes:MB+'/jobs/'+JOB},
 ['Take-over and an expired lock'],
 {who:'other',kind:'lease',co:B,session:'S2',takeover:true, expect:'allow', what:'Studio S2 takes over on purpose', writes:MB+'/lease/studio'},
 {who:'other',kind:'job', rev:5,h:'s1late',session:'S1', expect:'refuse', what:'Old Studio S1 saves after the take-over'},
 {who:'other',kind:'file',path:jobFile(5,H.s1late),body:'s1late',session:'S1', expect:'refuse', what:'Old Studio S1 adds a file after the take-over'},
 {who:'other',kind:'file',path:jobFile(5,H.v5),body:'v5',session:'S2', expect:'allow', what:'S2 adds the version 5 file', writes:jobFile(5,H.v5)},
 {who:'other',kind:'job', rev:5,h:'v5',session:'S2', expect:'allow', what:'S2 moves the record to version 5', writes:MB+'/jobs/'+JOB},
 {who:'other',kind:'lease',co:B,session:'S2',seconds:45, expect:'allow', what:'S2 renews with a 45-second lock', writes:MB+'/lease/studio'},
 {kind:'wait',seconds:60, what:'Wait 60 seconds so the lock expires'},
 {who:'other',kind:'job', rev:6,h:'v5',session:'S2', expect:'refuse', what:'S2 saves with an expired lock'},
 {who:'other',kind:'lease',co:B,session:'S3', expect:'allow', what:'Studio S3 takes the expired lock (no take-over needed)', writes:MB+'/lease/studio'},
 ['Customers, settings and the switch record (company B)'],
 {who:'other',kind:'cust',rev:1,session:'S3', expect:'allow',  what:'Create customer '+CUST, writes:MB+'/customers/'+CUST},
 {who:'other',kind:'cust',rev:1,session:'S3',wrongId:true, expect:'refuse', what:'Customer record whose id does not match'},
 {who:'other',kind:'cust',rev:2,session:'S3',deleted:true, expect:'allow',  what:'Delete the customer (tombstone)', writes:MB+'/customers/'+CUST},
 {who:'other',kind:'cust',rev:3,session:'S3', expect:'refuse', what:'Stale save brings the customer back'},
 {who:'other',kind:'settings',rev:1,session:'S3', expect:'allow',  what:'Create Studio settings', writes:MB+'/settings/studio'},
 {who:'other',kind:'settings',rev:1,session:'S3', expect:'refuse', what:'Stale settings save (version 1 again)'},
 {who:'other',kind:'switch',rev:1,mode:'local',session:'S3', expect:'allow',  what:'Create the switch record (browser master)', writes:MB},
 {who:'other',kind:'switch',rev:2,mode:'other',session:'S3', expect:'refuse', what:'Unknown switch mode'},
 {who:'fitter1',kind:'switch',rev:2,mode:'cloud',session:'S3',co:A, expect:'refuse', what:'A fitter creates company A switch record'},
 ['Finish'],
 {who:'other',kind:'lease',co:B,session:'S3',seconds:30, expect:'allow', what:'S3 shortens its lock to 30 seconds so it expires by itself', writes:MB+'/lease/studio'},
];

function printPlan(){
 let n=0;
 for(const s of STEPS){
  if(Array.isArray(s)){console.log('\n## '+s[0]);continue}
  if(s.kind==='wait'){console.log('   ~  '+s.what);continue}
  n++;console.log(String(n).padStart(3)+'. '+(s.expect==='allow'?'ALLOW ':'REFUSE')+'  '+s.who.padEnd(7)+' '+s.what+(s.writes?'   -> writes '+s.writes:''));
 }
 const w=[...new Set(STEPS.filter(s=>s.writes).map(s=>s.writes))];
 console.log('\n'+n+' checks. Written only if allowed (company B, env beta):');w.forEach(p=>console.log('   '+p));
}

async function run(){
 const {initializeApp,deleteApp}=require('firebase/app');
 const {getAuth,signInWithEmailAndPassword}=require('firebase/auth');
 const {getFirestore,doc,setDoc,getDoc,deleteDoc,serverTimestamp,Timestamp}=require('firebase/firestore');
 const {getStorage,ref,uploadString,getBytes,deleteObject}=require('firebase/storage');
 const acc=JSON.parse(fs.readFileSync(path.join(__dirname,'.staging-accounts.local.json'),'utf8'));
 const ctx={};
 for(const who of ['anon','owner','other','fitter1','fitter2']){
  const app=initializeApp(STAGING,'lt-'+who);ctx[who]={app,db:getFirestore(app),st:getStorage(app),uid:null};
  if(who!=='anon'){const c=await signInWithEmailAndPassword(getAuth(app),acc[who].email,acc[who].password);ctx[who].uid=c.user.uid}
 }
 const later=ms=>Timestamp.fromMillis(Date.now()+ms);
 let deletedAt=null;
 const outcome=async fn=>{try{await fn();return 'allow'}catch(e){const m=String(e&&e.code||'')+' '+String(e&&e.message||'');if(/permission|unauthorized|PERMISSION_DENIED/i.test(m))return 'refuse';return 'ERROR '+m.slice(0,120)}};
 let n=0,fail=0;const log=[];
 for(const s of STEPS){
  if(Array.isArray(s)){console.log('\n## '+s[0]);continue}
  if(s.kind==='wait'){console.log('   ~  '+s.what);await new Promise(r=>setTimeout(r,s.seconds*1000));continue}
  const c=ctx[s.who],uid=c.uid||'nobody';n++;
  const act=async()=>{
   switch(s.kind){
    case 'read':return getDoc(doc(c.db,s.path));
    case 'del':return deleteDoc(doc(c.db,s.path));
    case 'lease':{const co=s.co===A?MA:MB;const ms=s.seconds?s.seconds*1000:(s.minutes||2)*60000;
     return setDoc(doc(c.db,co+'/lease/studio'),{holderUid:uid,sessionId:s.session,deviceId:'livetest',deviceName:'Live test',heartbeatAt:serverTimestamp(),expiresAt:later(ms),...(s.takeover?{takenOverAt:serverTimestamp()}:{})})}
    case 'file':return uploadString(ref(c.st,s.path),C[s.body],'raw',{contentType:s.image?'image/jpeg':'application/json',customMetadata:{sessionId:s.session}});
    case 'delfile':return deleteObject(ref(c.st,s.path));
    case 'readfile':return getBytes(ref(c.st,s.path));
    case 'job':{const h=H[s.h];const d={rev:s.rev,file:jobFile(s.rev,s.fileOf?H[s.fileOf]:h),sha256:h,bytes:C[s.h].length,name:'Live test job',customerId:CUST,schema:1,deleted:false,sessionId:s.session,deviceId:'livetest',updatedAt:s.clientClock?Timestamp.now():serverTimestamp(),updatedBy:uid};
     if(s.deleted===true){d.deleted=true;d.deletedAt=serverTimestamp()}
     if(s.deleted==='same'){d.deleted=true;d.deletedAt=deletedAt}
     if(s.restore){d.deleted=false;d.deletedAt=deletedAt;d.restoredAt=serverTimestamp()}
     return setDoc(doc(c.db,MB+'/jobs/'+JOB),d)}
    case 'cust':{const d={rev:s.rev,data:{id:s.wrongId?'someone-else':CUST,name:'Live test customer'},schema:1,deleted:false,sessionId:s.session,deviceId:'livetest',updatedAt:serverTimestamp(),updatedBy:uid};
     if(s.deleted){d.deleted=true;d.deletedAt=serverTimestamp()}
     return setDoc(doc(c.db,MB+'/customers/'+(s.wrongId?'livetest-cust-x':CUST)),d)}
    case 'settings':return setDoc(doc(c.db,MB+'/settings/studio'),{rev:s.rev,values:{livetest:'1'},schema:1,sessionId:s.session,deviceId:'livetest',updatedAt:serverTimestamp(),updatedBy:uid});
    case 'switch':return setDoc(doc(c.db,s.co===A?MA:MB),{rev:s.rev,mode:s.mode,migrationId:'livetest',verifiedSha256:'0'.repeat(64),switchedAt:serverTimestamp(),switchedBy:uid,sessionId:s.session,updatedAt:serverTimestamp(),updatedBy:uid});
   }
  };
  const got=await outcome(act);
  if(s.kind==='job'&&s.deleted===true&&got==='allow'){const x=(await getDoc(doc(ctx.other.db,MB+'/jobs/'+JOB))).data().deletedAt;deletedAt=new Timestamp(x.seconds,x.nanoseconds)}
  const ok=got===s.expect;if(!ok)fail++;
  log.push({n,who:s.who,what:s.what,expect:s.expect,got,ok});
  console.log(String(n).padStart(3)+'. '+(ok?'ok  ':'FAIL')+'  expected '+s.expect.padEnd(6)+' got '+got.padEnd(6)+'  '+s.who.padEnd(7)+' '+s.what);
  if(!ok){console.log('\nSTOPPED at check '+n+' (differs from the expected result). Nothing further was run.');break}
 }
 fs.writeFileSync(path.join(__dirname,'live-rules-test-results.json'),JSON.stringify({ranAt:new Date().toISOString(),project:'fittersiq-staging',fail,log},null,1));
 console.log('\n'+(fail?fail+' of '+n+' checks FAILED':'All '+n+' live checks passed'));
 for(const k of Object.keys(ctx))await deleteApp(ctx[k].app);
 process.exit(fail?1:0);
}
if(process.argv.includes('--run'))run().catch(e=>{console.error('ERROR',e.message);process.exit(1)});
else printPlan();
