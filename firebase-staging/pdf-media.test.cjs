// Proposed staging media rule change: allow application/pdf for master media (drawings).
// Runs the same PDF checks against the deployed rules ('.') and the proposed rules
// ('proposed-pdf'). Emulator only (demo-fittersiq). Exits 1 if the proposed rules
// differ from the expected answers anywhere.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {initializeTestEnvironment}=require('@firebase/rules-unit-testing');
const {doc,setDoc,serverTimestamp,Timestamp}=require('firebase/firestore');
const {ref,uploadString,getBytes,deleteObject}=require('firebase/storage');
const load=dir=>({firestore:fs.readFileSync(path.join(__dirname,dir,'firestore.rules'),'utf8'),storage:fs.readFileSync(path.join(__dirname,dir,'storage.rules'),'utf8')});
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
async function outcome(fn){try{await fn();return 'allow'}catch(e){const m=String(e&&e.code||'')+' '+String(e&&e.message||'');if(/permission|unauthorized|PERMISSION_DENIED/i.test(m))return 'refuse';return 'error: '+m.slice(0,80)}}
const PDF='%PDF-1.4\n% generated test drawing\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF';
const PDF2=PDF+'\n% second';
async function run(dir){
 const t=await initializeTestEnvironment({projectId:'demo-fittersiq',firestore:{host:'127.0.0.1',port:8181,rules:load(dir).firestore},storage:{host:'127.0.0.1',port:9199,rules:load(dir).storage}});
 await t.clearFirestore();
 await t.withSecurityRulesDisabled(async c=>{const db=c.firestore();
  await setDoc(doc(db,'companies/c1/members/owner1'),{role:'company_owner',status:'active'});
  await setDoc(doc(db,'companies/c1/members/fitter1'),{role:'fitter',status:'active'});
  await setDoc(doc(db,'companies/c1/members/susp1'),{role:'company_owner',status:'suspended'});
  await setDoc(doc(db,'companies/c2/members/owner2'),{role:'company_owner',status:'active'});
 });
 const owner=t.authenticatedContext('owner1',{companyId:'c1',role:'company_owner'});
 await setDoc(doc(owner.firestore(),'companies/c1/fiqMaster/beta/lease/studio'),{holderUid:'owner1',sessionId:'S1',deviceId:'d',deviceName:'PC',heartbeatAt:serverTimestamp(),expiresAt:Timestamp.fromMillis(Date.now()+120000)});
 const tag=dir.replace(/\W/g,'')||'deployed';// unique file names per run (emulator storage is not cleared between runs)
 const M='fiqmaster/c1/beta/media/',J='fiqmaster/c1/beta/jobs/j1/';
 const up=(ctx,p,body,type,session)=>uploadString(ref(ctx.storage(),p),body,'raw',{contentType:type,customMetadata:{sessionId:session||'S1'}});
 const pdfA=PDF+'\n% '+tag,pdfB=PDF2+'\n% '+tag;
 const who={fitter:t.authenticatedContext('fitter1',{companyId:'c1',role:'fitter'}),susp:t.authenticatedContext('susp1',{companyId:'c1',role:'company_owner'}),other:t.authenticatedContext('owner2',{companyId:'c2',role:'company_owner'}),anon:t.unauthenticatedContext()};
 const rows=[];const row=async(label,want,fn)=>rows.push({label,want,got:await outcome(fn)});
 await row('Owner holding the lock adds a PDF drawing to media','allow',()=>up(owner,M+sha(pdfA),pdfA,'application/pdf'));
 await row('Owner reads the PDF back','allow',()=>getBytes(ref(owner.storage(),M+sha(pdfA))));
 await row('Overwriting the PDF','refuse',()=>up(owner,M+sha(pdfA),pdfB,'application/pdf'));
 await row('Deleting the PDF','refuse',()=>deleteObject(ref(owner.storage(),M+sha(pdfA))));
 await row('PDF from a Studio session without the lock','refuse',()=>up(owner,M+sha(pdfB),pdfB,'application/pdf','S0'));
 await row('PDF by a fitter','refuse',()=>up(who.fitter,M+sha(pdfB),pdfB,'application/pdf'));
 await row('PDF by a suspended owner','refuse',()=>up(who.susp,M+sha(pdfB),pdfB,'application/pdf'));
 await row('PDF by another company\'s owner','refuse',()=>up(who.other,M+sha(pdfB),pdfB,'application/pdf'));
 await row('PDF signed out','refuse',()=>up(who.anon,M+sha(pdfB),pdfB,'application/pdf'));
 await row('Fitter reads the PDF','refuse',()=>getBytes(ref(who.fitter.storage(),M+sha(pdfA))));
 await row('PDF under a name that is not a fingerprint','refuse',()=>up(owner,M+'drawing.pdf',pdfB,'application/pdf'));
 await row('PDF as a job file (job files are JSON only)','refuse',()=>up(owner,J+'r1-'+sha(pdfB)+'.json',pdfB,'application/pdf'));
 await row('Other document types still refused (text/html)','refuse',()=>up(owner,M+sha('<html>'+tag),'<html>'+tag,'text/html'));
 await row('Other document types still refused (application/zip)','refuse',()=>up(owner,M+sha('zip'+tag),'zip'+tag,'application/zip'));
 await row('Images still allowed','allow',()=>up(owner,M+sha('jpeg'+tag),'jpeg'+tag,'image/jpeg'));
 await t.cleanup();
 return rows;
}
(async()=>{
 const deployed=await run('.');
 const proposed=await run('proposed-pdf');
 let unsafe=0;
 console.log('\nPDF media checks          deployed rules   proposed rules   expected (proposed)');
 proposed.forEach((p,i)=>{const ok=p.got===p.want;if(!ok)unsafe++;console.log((ok?'ok    ':'FAIL  ')+deployed[i].got.padEnd(8)+'         '+p.got.padEnd(8)+'         '+p.want.padEnd(8)+'  '+p.label)});
 fs.writeFileSync(path.join(__dirname,'pdf-media-test-results.json'),JSON.stringify({ranAt:new Date().toISOString(),deployed,proposed},null,1));
 console.log('\n'+(unsafe?unsafe+' check(s) FAILED':'All '+proposed.length+' PDF checks pass on the proposed rules'));
 process.exit(unsafe?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
