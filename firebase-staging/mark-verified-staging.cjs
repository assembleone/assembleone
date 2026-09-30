// STAGING ONLY: sets emailVerified=true on the four FittersIQ STAGING test sign-ins.
// Changes nothing else: no password, claims, companies, members or records.
// Uses the Firebase CLI's own sign-in (project owner). Reads all four back afterwards.
const path=require('node:path'),fs=require('node:fs');
const PROJECT='fittersiq-staging';
if(PROJECT!=='fittersiq-staging'||process.argv.slice(2).some(a=>/assembleone|fabac/i.test(a)))throw new Error('Refused: staging only');
const EXPECTED={// the four reviewed test accounts, by user id and email
 '2nSaxux93yXPz3xVXDDXwruIUvB2':'madsmillereriksen+fiqstage-owner@gmail.com',
 'TmBte9xMjYcvjCuFSuJoPWR6Puq2':'madsmillereriksen+fiqstage-other@gmail.com',
 '8Ys1y1VqW0QrEzKlVmaXdEHHRLO2':'madsmillereriksen+fiqstage-fitter1@gmail.com',
 'UiEb7WgEzrNFzSpE5G1LSH8pTvA3':'madsmillereriksen+fiqstage-fitter2@gmail.com'};
const FT=path.join(process.env.APPDATA,'npm','node_modules','firebase-tools','lib');
const {requireAuth}=require(path.join(FT,'requireAuth.js'));
const {Client}=require(path.join(FT,'apiv2.js'));
const authLib=require(path.join(FT,'auth.js'));
(async()=>{
 // The local accounts file must name exactly these four.
 const local=Object.values(JSON.parse(fs.readFileSync(path.join(__dirname,'.staging-accounts.local.json'),'utf8')));
 const ids=Object.keys(EXPECTED);
 if(local.length!==4||!local.every(a=>EXPECTED[a.uid]===a.email))throw new Error('Refused: local accounts file does not match the four reviewed accounts');
 const o={project:PROJECT};authLib.setActiveAccount(o,authLib.selectAccount(undefined,__dirname));await requireAuth(o);
 const idt=new Client({urlPrefix:'https://identitytoolkit.googleapis.com'});
 const lookup=async()=>(await idt.post('/v1/projects/'+PROJECT+'/accounts:lookup',{localId:ids})).body.users||[];
 const before=await lookup();
 if(before.length!==4||!before.every(u=>EXPECTED[u.localId]===u.email))throw new Error('Refused: staging users do not match the four reviewed accounts');
 for(const u of before){
  if(u.emailVerified){console.log('already verified:',u.email);continue}
  await idt.post('/v1/projects/'+PROJECT+'/accounts:update',{localId:u.localId,emailVerified:true});
  console.log('set emailVerified=true:',u.email);
 }
 const after=await lookup();
 console.log('\nREAD BACK (fittersiq-staging)');
 after.forEach(u=>{const b=before.find(x=>x.localId===u.localId);
  const same=['email','passwordHash','customAttributes','disabled'].every(k=>JSON.stringify(u[k])===JSON.stringify(b[k]));
  console.log(' ',u.email,'| uid',u.localId,'| verified:',!!u.emailVerified,'| claims:',u.customAttributes||'none','| other fields unchanged:',same)});
 process.exit(after.length===4&&after.every(u=>u.emailVerified)?0:1);
})().catch(e=>{console.error('ERROR',e.status||'',e.message);process.exit(1)});
