// READ-ONLY verification of the deployed staging rules (fittersiq-staging only).
// Uses the Firebase CLI's own sign-in for GET / getIamPolicy calls. Writes nothing.
//  1. The released Firestore and Storage rulesets equal firebase-staging/*.rules.
//  2. Whether Storage's service agent may read Firestore (needed by the Storage rules'
//     member and lease checks).
//  3. Signed-out requests (no account): what the live rules answer.
const fs=require('node:fs'),path=require('node:path');
const PROJECT='fittersiq-staging';
if(process.argv.includes('assembleone-fabac'))throw new Error('refused: production');
const FT=path.join(process.env.APPDATA,'npm','node_modules','firebase-tools','lib');
const {requireAuth}=require(path.join(FT,'requireAuth.js'));
const {Client}=require(path.join(FT,'apiv2.js'));
const API_KEY='AIzaSyBlglyejGrObsr25JL5-eOSfhF9joBxZUI';// public web key of fittersiq-staging
const BUCKET='fittersiq-staging.firebasestorage.app';
(async()=>{
 // Same account selection the CLI itself does before each command.
 const auth=require(path.join(FT,'auth.js'));
 const opts={project:PROJECT};
 const account=auth.selectAccount(undefined,__dirname);
 if(!account)throw new Error('Firebase CLI is not signed in');
 auth.setActiveAccount(opts,account);
 await requireAuth(opts);
 console.log('signed in as',account.user&&account.user.email);
 const out={};
 // 1. Released rules
 const rules=new Client({urlPrefix:'https://firebaserules.googleapis.com',apiVersion:'v1'});
 const rel=(await rules.get('/projects/'+PROJECT+'/releases')).body.releases||[];
 const norm=s=>s.replace(/\r\n/g,'\n').trim();
 out.releases=[];
 for(const r of rel){
  const rs=(await rules.get('/'+r.rulesetName)).body;
  const text=(rs.source.files||[]).map(f=>f.content).join('\n');
  const which=/cloud\.firestore/.test(r.name)?'firestore.rules':/firebase\.storage/.test(r.name)?'storage.rules':null;
  const same=which?norm(text)===norm(fs.readFileSync(path.join(__dirname,which),'utf8')):null;
  out.releases.push({release:r.name.split('/').slice(3).join('/'),updated:r.updateTime,matchesTestedFile:which?which+': '+same:'(other)'});
 }
 // 2. Storage -> Firestore permission
 const crm=new Client({urlPrefix:'https://cloudresourcemanager.googleapis.com',apiVersion:'v1'});
 const proj=(await crm.get('/projects/'+PROJECT)).body;
 const agent='serviceAccount:service-'+proj.projectNumber+'@gcp-sa-firebasestorage.iam.gserviceaccount.com';
 const policy=(await crm.post('/projects/'+PROJECT+':getIamPolicy',{})).body;
 const agentRoles=(policy.bindings||[]).filter(b=>(b.members||[]).includes(agent)).map(b=>b.role);
 out.storageAgent={member:agent,roles:agentRoles,canReadFirestore:agentRoles.includes('roles/firebaserules.firestoreServiceAgent')};
 // 3. Signed-out probes (reads only)
 const probe=async(label,url)=>{const r=await fetch(url);out.probes=(out.probes||[]);out.probes.push({label,status:r.status})};
 const fsDoc=p=>'https://firestore.googleapis.com/v1/projects/'+PROJECT+'/databases/(default)/documents/'+p+'?key='+API_KEY;
 const stObj=p=>'https://firebasestorage.googleapis.com/v0/b/'+BUCKET+'/o/'+encodeURIComponent(p)+'?alt=media';
 await probe('Firestore master switch record (signed out)',fsDoc('companies/probe/fiqMaster/beta'));
 await probe('Firestore master job record (signed out)',fsDoc('companies/probe/fiqMaster/beta/jobs/j1'));
 await probe('Firestore Mobile message (signed out)',fsDoc('companies/probe/jobs/m1'));
 await probe('Firestore unknown path (signed out)',fsDoc('anything/else'));
 await probe('Storage master file (signed out)',stObj('fiqmaster/probe/beta/jobs/j1/r1-'+'a'.repeat(64)+'.json'));
 await probe('Storage job photo under companies/ (signed out, file does not exist)',stObj('companies/probe/jobs/j1/media/none.jpg'));
 await probe('Storage unknown path (signed out)',stObj('other/none.jpg'));
 console.log(JSON.stringify(out,null,1));
})().catch(e=>{console.error('ERROR',e.message||e);process.exit(1)});
