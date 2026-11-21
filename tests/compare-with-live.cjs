// BEFORE any hosting release: shows exactly what a release of this folder would change on the live site.
// Run on a computer that can reach the internet, from the repo folder that will be deployed:
//    node tests/compare-with-live.cjs [https://app.fittersiq.com]
// It fetches each file of this folder from the live address and compares (line endings ignored). Nothing is changed anywhere; it only reads.
// Read the result like this:  "Production files that would change" must be 0 for a Beta-only release.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process');
const root=path.resolve(__dirname,'..'),live=(process.argv[2]||'https://app.fittersiq.com').replace(/\/$/,'');
// Files a Firebase Hosting release of this folder would serve: everything tracked by git except what firebase.json hosting ignores (read below if present).
const tracked=cp.execSync('git ls-files',{cwd:root,encoding:'utf8'}).split('\n').filter(Boolean);
let ignore=['firebase.json','**/.*','**/node_modules/**'];try{const fj=JSON.parse(fs.readFileSync(path.join(root,'firebase.json'),'utf8'));const h=[].concat(fj.hosting||[]);h.forEach(x=>ignore=ignore.concat(x.ignore||[]))}catch(e){}
const skip=f=>/^(functions|scripts|qa|tests|academy-rules|cloud-master)\//.test(f)||/\.(md|txt|rules|cjs|json)$/.test(f)&&!/^manifest/.test(f)||f==='.firebaserc'||f==='CNAME'||f==='firestore.indexes.json';
const norm=b=>crypto.createHash('sha256').update(b.toString('utf8').replace(/\r\n/g,'\n')).digest('hex');
(async()=>{
 const out={same:[],differ:[],missingLive:[]};
 for(const f of tracked.filter(f=>!skip(f))){
  let r;try{r=await fetch(live+'/'+f.split('/').map(encodeURIComponent).join('/'),{cache:'no-store'})}catch(e){console.error('Cannot reach '+live+' ('+e.message+'). Run this on a computer with internet.');process.exit(2)}
  const local=fs.readFileSync(path.join(root,f));
  if(r.status===404){out.missingLive.push(f);continue}
  const body=Buffer.from(await r.arrayBuffer());
  // a missing page may answer 200 with the home page: treat a different content type for scripts/html as missing
  (norm(body)===norm(local)?out.same:out.differ).push(f);
 }
 const isBeta=f=>f.startsWith('beta/');
 const prodDiff=out.differ.filter(f=>!isBeta(f)),prodMissing=out.missingLive.filter(f=>!isBeta(f));
 console.log('Compared with '+live+'\n');
 console.log('Beta files that would be added or changed: '+(out.differ.filter(isBeta).length+out.missingLive.filter(isBeta).length));
 out.differ.filter(isBeta).concat(out.missingLive.filter(isBeta)).forEach(f=>console.log('   '+f));
 console.log('\nProduction files that would change (not under beta/): '+prodDiff.length);prodDiff.forEach(f=>console.log('   DIFFERS FROM LIVE: '+f));
 console.log('Production files not found live (not under beta/): '+prodMissing.length);prodMissing.forEach(f=>console.log('   NOT LIVE: '+f));
 console.log('\n'+(prodDiff.length+prodMissing.length===0?'RESULT: a release of this folder changes only beta/. Production files are identical to live.':'RESULT: STOP. A release of this folder would also change the Production files listed above. Do not release this folder as it is; ask Claude to build a Beta-only release folder.'));
 process.exit(prodDiff.length+prodMissing.length===0?0:1);
})();
