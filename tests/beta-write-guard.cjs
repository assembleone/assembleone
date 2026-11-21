// Beta write guard: with fake Firebase functions, only Custom Sheets (and Beta's own backup area) may be written; everything else
// on live company data is refused; reads pass; the guard is installed whichever order Studio assigns the Firebase objects in.
const {chromium}=require('playwright');const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());
 await page.goto(`http://127.0.0.1:${server.address().port}/beta/Studio.html`);await page.waitForFunction(()=>window.fiqBetaGuard&&typeof save==='function'&&window.fiqEditor,null,{timeout:60000});
 const r=await page.evaluate(async()=>{
  const real=[];const mk=n=>(...a)=>{real.push(n+' '+(a[0]&&a[0].path||''));return Promise.resolve({ok:1})};
  const ref=(db,...s)=>({path:s.join('/')});
  window.fiqAuthFns={doc:ref,collection:ref,setDoc:mk('setDoc'),updateDoc:mk('updateDoc'),addDoc:mk('addDoc'),deleteDoc:mk('deleteDoc'),getDoc:mk('getDoc'),getDocs:mk('getDocs'),onSnapshot:mk('onSnapshot'),
   runTransaction:async(db,fn)=>fn({get:mk('tx.get'),set:mk('tx.set'),update:mk('tx.update'),delete:mk('tx.delete')}),httpsCallable:()=>()=>{real.push('CALLABLE REAL');return Promise.resolve({})}};
  window.fiqStorageFns={ref:(s,p)=>({path:p}),uploadString:mk('upload'),deleteObject:mk('delStorage'),getDownloadURL:mk('url'),listAll:mk('list')};
  const F=window.fiqAuthFns,out={};
  window.fiqBetaGuard.setSheetsCloud(false);const t=async(k,p)=>{try{await p;out[k]='ok'}catch(e){out[k]=e.code||'ERR:'+e.message}};
  await t('sheetWriteOff',F.setDoc(F.doc(0,'companies','c1','estimatorSheets','s0'),{}));
  window.fiqBetaGuard.setSheetsCloud(true);
  await t('sheetWrite',F.setDoc(F.doc(0,'companies','c1','estimatorSheets','s1'),{}));
  await t('sheetDelete',F.deleteDoc(F.doc(0,'companies','c1','estimatorSheets','s1')));
  await t('betaBackup',F.setDoc(F.doc(0,'companies','c1','fiqMaster','beta','jobs','j'),{}));
  await t('prodBackup',F.setDoc(F.doc(0,'companies','c1','fiqMaster','production','jobs','j'),{}));
  await t('jobWrite',F.setDoc(F.doc(0,'companies','c1','jobs','j1'),{}));
  await t('jobReceipt',F.updateDoc(F.doc(0,'companies','c1','jobs','j1'),{receipt:1}));
  await t('jobAdd',F.addDoc(F.collection(0,'companies','c1','jobs'),{}));
  await t('jobDelete',F.deleteDoc(F.doc(0,'companies','c1','jobs','j1')));
  await t('company',F.updateDoc(F.doc(0,'companies','c1'),{deviceApprovalEnabled:true}));
  await t('fitter',F.setDoc(F.doc(0,'companies','c1','fitters','f1'),{}));
  await t('member',F.updateDoc(F.doc(0,'companies','c1','members','u','devices','d'),{approved:true}));
  await t('callable',F.httpsCallable({}, 'setMemberStatus')({}));
  await t('txJob',F.runTransaction(0,tx=>{tx.set(F.doc(0,'companies','c1','jobs','j'),{})}));
  await t('txSheet',F.runTransaction(0,tx=>{tx.set(F.doc(0,'companies','c1','estimatorSheets','s'),{})}));
  await t('upload',window.fiqStorageFns.uploadString(window.fiqStorageFns.ref(0,'companies/c1/photo.jpg'),'x'));
  await t('storageDelete',window.fiqStorageFns.deleteObject(window.fiqStorageFns.ref(0,'companies/c1/photo.jpg')));
  await t('quietLog',F.addDoc(F.collection(0,'activityLog'),{}));
  await t('quietUser',F.setDoc(F.doc(0,'users','u1'),{}));
  await t('readJobs',F.getDocs(F.collection(0,'companies','c1','jobs')));
  await t('readDoc',F.getDoc(F.doc(0,'companies','c1')));
  await t('listen',F.onSnapshot(F.collection(0,'companies','c1','jobs')));
  localStorage.setItem('fiq_cloud_copy_enabled_v1','on');out.cloudCopyOn=localStorage.getItem('fiq_cloud_copy_enabled_v1');
  await t('readStorage',window.fiqStorageFns.getDownloadURL({path:'x'}));
  await new Promise(r=>setTimeout(r,1000));
  const b=document.getElementById('fiqBetaBanner'),fr=document.getElementById('fiqBetaFrame'),ic=document.querySelector('link[rel~="icon"]');
  return {out,real,blocked:window.fiqBetaGuard.blocked.length,banners:document.querySelectorAll('#fiqBetaBanner').length,banner:b&&b.textContent,frame:!!fr&&getComputedStyle(fr).borderTopColor,icon:ic&&ic.href.slice(0,40),title:document.title};
 });
 const o=r.out;
 assert.equal(o.sheetWriteOff,'beta-write-blocked','Custom Sheets cloud writes are blocked until the switch is on');
 assert.notEqual(o.cloudCopyOn,'on','the automatic cloud copy cannot be switched on in Beta');
 assert.equal(r.banners,1,'exactly one Beta banner');assert.match(r.banner,/LIVE-DATA WRITES OFF/);assert.match(r.banner,/CUSTOM SHEETS CLOUD ON/,'banner shows when cloud saving is on');
 assert.equal(r.frame,'rgb(185, 28, 28)','red frame round the window');assert.match(r.icon||'', /^data:image\/svg\+xml/,'red BETA tab icon');assert.match(r.title,/^BETA /,'tab title starts with BETA');
 ['sheetWrite','sheetDelete','betaBackup','txSheet','readJobs','readDoc','listen','readStorage','quietLog','quietUser'].forEach(k=>assert.equal(o[k],'ok',k+' should pass: '+o[k]));
 ['prodBackup','jobWrite','jobReceipt','jobAdd','jobDelete','company','fitter','member','callable','txJob','upload','storageDelete'].forEach(k=>assert.equal(o[k],'beta-write-blocked',k+' must be blocked: '+o[k]));
 assert.ok(!r.real.some(x=>/^(updateDoc|addDoc|upload|delStorage|CALLABLE|tx\.update|tx\.delete)/.test(x)),'no other write reached Firebase: '+JSON.stringify(r.real));
 assert.ok(!r.real.some(x=>/estimatorSheets\/s0/.test(x)),'nothing reached Firebase while the switch was off');
 assert.deepEqual(r.real.filter(x=>/^(setDoc|deleteDoc|tx\.set)/.test(x)).sort(),['deleteDoc companies/c1/estimatorSheets/s1','setDoc companies/c1/estimatorSheets/s1','setDoc companies/c1/fiqMaster/beta/jobs/j','tx.set companies/c1/estimatorSheets/s'].sort(),'only Custom Sheets and Beta backup writes got through');
 assert.deepEqual(errors,[],errors.join('|'));
 console.log('PASS beta-write-guard',JSON.stringify(o));await browser.close();server.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
