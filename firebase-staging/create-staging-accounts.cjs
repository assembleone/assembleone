// Creates the FittersIQ STAGING test accounts through the real (unchanged) staging
// functions, so every record looks exactly like Production's. STAGING ONLY.
//
//   node create-staging-accounts.cjs create   1. creates 4 sign-ins, sends 4 verification emails
//   (click the 4 verification links in the inbox)
//   node create-staging-accounts.cjs finish   2. companies, invitations, memberships, one suspension
//
// Passwords are generated here and kept only in .staging-accounts.local.json (git-ignored).
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {initializeApp,deleteApp}=require('firebase/app');
const {getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendEmailVerification,signOut}=require('firebase/auth');
const {getFunctions,httpsCallable}=require('firebase/functions');

const STAGING={// FittersIQ Staging web config (fittersiq-staging only)
 apiKey:'AIzaSyBlglyejGrObsr25JL5-eOSfhF9joBxZUI',authDomain:'fittersiq-staging.firebaseapp.com',projectId:'fittersiq-staging',
 storageBucket:'fittersiq-staging.firebasestorage.app',messagingSenderId:'974434464573',appId:'1:974434464573:web:f5b5499766d6dab2e0cb54'};
if(Object.values(STAGING).some(v=>/assembleone|fabac|906839446136/i.test(v))||STAGING.projectId!=='fittersiq-staging')throw new Error('Refused: not the staging project');

const INBOX='madsmillereriksen';// Gmail aliases: every email arrives in this one inbox
const ACCOUNTS=[
 {key:'owner', email:INBOX+'+fiqstage-owner@gmail.com', name:'Staging Owner', company:'FittersIQ STAGING'},
 {key:'other', email:INBOX+'+fiqstage-other@gmail.com', name:'Other Company Owner', company:'FittersIQ STAGING OTHER'},
 {key:'fitter1',email:INBOX+'+fiqstage-fitter1@gmail.com'},
 {key:'fitter2',email:INBOX+'+fiqstage-fitter2@gmail.com'},// suspended after joining
];
const STORE=path.join(__dirname,'.staging-accounts.local.json');
const load=()=>fs.existsSync(STORE)?JSON.parse(fs.readFileSync(STORE,'utf8')):{};
const save=d=>fs.writeFileSync(STORE,JSON.stringify(d,null,1));

async function asUser(acc,pw,fn){
 const app=initializeApp(STAGING,'s-'+acc.key+'-'+Date.now());
 try{const a=getAuth(app);const cred=await signInWithEmailAndPassword(a,acc.email,pw);await cred.user.getIdToken(true);return await fn(cred.user,getFunctions(app,'us-central1'),a)}
 finally{await deleteApp(app)}
}
(async()=>{
 const step=process.argv[2];const data=load();
 if(step==='create'){
  for(const acc of ACCOUNTS){
   if(data[acc.key])continue;
   const pw=crypto.randomBytes(18).toString('base64url');
   const app=initializeApp(STAGING,'c-'+acc.key);
   try{const cred=await createUserWithEmailAndPassword(getAuth(app),acc.email,pw);await sendEmailVerification(cred.user);data[acc.key]={email:acc.email,uid:cred.user.uid,password:pw};save(data);console.log('created',acc.key,acc.email,'uid',cred.user.uid,'- verification email sent')}
   finally{await deleteApp(app)}
  }
  console.log('Now click the verification link in each of the 4 emails, then run: node create-staging-accounts.cjs finish');
 }else if(step==='finish'){
  const call=(fns,name,payload)=>httpsCallable(fns,name)(payload).then(r=>r.data);
  const acct=k=>({...ACCOUNTS.find(a=>a.key===k),...data[k]});
  for(const k of ['owner','other']){const a=acct(k);if(a.companyId)continue;
   const r=await asUser(a,a.password,(u,f)=>{if(!u.emailVerified)throw new Error(a.email+' is not verified yet');return call(f,'completeOnboarding',{companyName:a.company,ownerName:a.name,plan:'Business'})});
   data[k].companyId=r.companyId;save(data);console.log('company',a.company,r.companyId)}
  const owner=acct('owner');
  for(const k of ['fitter1','fitter2']){const a=acct(k);if(a.companyId)continue;
   const inv=await asUser(owner,owner.password,(u,f)=>call(f,'inviteFitter',{email:a.email}));
   await asUser(a,a.password,(u,f)=>{if(!u.emailVerified)throw new Error(a.email+' is not verified yet');return call(f,'acceptInvitation',{companyId:inv.companyId,inviteId:inv.inviteId})});
   data[k].companyId=inv.companyId;save(data);console.log('joined',k,inv.companyId)}
  if(!data.fitter2.suspended){await asUser(owner,owner.password,(u,f)=>call(f,'setMemberStatus',{companyId:owner.companyId,uid:data.fitter2.uid,status:'suspended'}));data.fitter2.suspended=true;save(data);console.log('suspended fitter2')}
  console.log('Done. Accounts:',ACCOUNTS.map(a=>a.key+' '+a.email).join(' | '));
 }else if(step==='resend'){
  // Sends ONE new verification email to ONE named account, only if it is not verified yet.
  const key=process.argv[3],acc=ACCOUNTS.find(a=>a.key===key),d=data[key];
  if(!acc||!d)throw new Error('usage: node create-staging-accounts.cjs resend owner|other|fitter1|fitter2');
  await asUser({...acc,...d},d.password,async u=>{
   await u.reload();
   if(u.emailVerified){console.log(acc.email,'is already verified; nothing sent');return}
   await sendEmailVerification(u);
   console.log('Firebase accepted the resend for',acc.email,'at',new Date().toISOString(),'(UTC)');
  });
 }else console.log('usage: node create-staging-accounts.cjs create|finish|resend <account>');
 process.exit(0);
})().catch(e=>{console.error('ERROR',e.code||'',e.message);process.exit(1)});
