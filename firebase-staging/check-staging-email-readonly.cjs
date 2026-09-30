// READ-ONLY: staging sign-in accounts and email settings (fittersiq-staging only).
// accounts:lookup and config GET only. Sends nothing, changes nothing.
const path=require('node:path'),fs=require('node:fs');
const PROJECT='fittersiq-staging';
const FT=path.join(process.env.APPDATA,'npm','node_modules','firebase-tools','lib');
const {requireAuth}=require(path.join(FT,'requireAuth.js'));
const {Client}=require(path.join(FT,'apiv2.js'));
const authLib=require(path.join(FT,'auth.js'));
(async()=>{
 const opts={project:PROJECT};const account=authLib.selectAccount(undefined,__dirname);authLib.setActiveAccount(opts,account);await requireAuth(opts);
 const idt=new Client({urlPrefix:'https://identitytoolkit.googleapis.com'});
 const uids=Object.values(JSON.parse(fs.readFileSync(path.join(__dirname,'.staging-accounts.local.json'),'utf8'))).map(a=>a.uid);
 const users=(await idt.post('/v1/projects/'+PROJECT+'/accounts:lookup',{localId:uids})).body.users||[];
 console.log('ACCOUNTS');
 users.forEach(u=>console.log(' ',u.email,'| verified:',!!u.emailVerified,'| created:',new Date(Number(u.createdAt)).toISOString(),'| last sign-in:',u.lastLoginAt?new Date(Number(u.lastLoginAt)).toISOString():'-','| providers:',(u.providerUserInfo||[]).map(p=>p.providerId).join(',')));
 const cfg=(await idt.get('/admin/v2/projects/'+PROJECT+'/config')).body;
 const n=cfg.notification||{},se=n.sendEmail||{};
 console.log('EMAIL SETTINGS');
 console.log('  method:',se.method||'(default)');
 console.log('  callback (link) URL:',se.callbackUri||'(default)');
 console.log('  default locale:',n.defaultLocale||'-');
 const t=se.verifyEmailTemplate||{};
 console.log('  verify-email template: from',t.senderLocalPart?t.senderLocalPart+'@'+(se.dnsInfo&&se.dnsInfo.customDomain||'<default domain>'):'(default)','| display name:',t.senderDisplayName||'(default)','| subject:',t.subject||'(default)','| customized:',!!t.customized);
 console.log('  custom sender domain:',se.dnsInfo?JSON.stringify(se.dnsInfo):'none');
 console.log('  authorized domains:',(cfg.authorizedDomains||[]).join(', '));
 console.log('  email sign-in enabled:',cfg.signIn&&cfg.signIn.email?JSON.stringify(cfg.signIn.email):'-');
 console.log('  Identity Platform subscription:',cfg.subtype||'-');
})().catch(e=>{console.error('ERROR',e.status||'',e.message);process.exit(1)});
