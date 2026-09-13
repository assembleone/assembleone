const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const mobile=fs.readFileSync(path.join(root,'Mobile-Core.html'),'utf8');
const studio=fs.readFileSync(path.join(root,'Studio-Recovery.html'),'utf8');
const protocol=fs.readFileSync(path.join(root,'sync-protocol.js'),'utf8');
function section(src,start,end){const a=src.indexOf(start),b=src.indexOf(end,a+start.length);assert(a>=0&&b>a,start);return src.slice(a,b)}
function script(src,id){return src.match(new RegExp('<script id="'+id+'">([\\s\\S]*?)</script>'))[1]}
function context(){
 const values=new Map();
 const c={state:{projects:[],deletedProjectIds:[]},console,document:{},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},uid:()=>crypto.randomUUID(),Blob,receivingStudioPack:false,renderAll(){},show(){},alert(){},t:x=>x,save:()=>true,ensureExtras:p=>p,ensureSharedProject:p=>p,ensureCustomerForProject(){},verifySitePacket:()=>({complete:true}),bestSiteReference:()=>({}),fittersiqUser:{uid:'owner',companyId:'company',role:'company_owner'}};
 c.window=c;vm.createContext(c);vm.runInContext(protocol,c);return c;
}
function project(name='Latest'){return {id:'job',name,rooms:[{id:'room',name:'Kitchen',beforePhotos:['photo']}],cabinets:[{id:'cabinet',roomId:'room',parts:[{id:'panel',qty:1,status:'ready'}]}],jobLog:[]}}
function packet(p,at,status='received'){return {project:p,exportedAt:new Date(at).toISOString(),status,kind:'studioToMobilePacket'}}
function loadMobile(c){
 vm.runInContext(section(mobile,'function canSeeJob(', '// Human-readable denial'),c);
 vm.runInContext(section(mobile,'function mergePanelStatus(', 'function crc32('),c);
 vm.runInContext(script(mobile,'a201-sync-v1089-site-fix'),c);
}
function loadStudio(c){
 vm.runInContext(section(studio,'function mergeJobLog(', 'function addJobLogEntry('),c);
 vm.runInContext(section(studio,'function mergePanelStatus(', 'async function importMobileUpdates('),c);
 vm.runInContext(section(studio,'function sitePacketNeedsMerge(', 'async function studioInboxPackets('),c);
 vm.runInContext(section(studio,'async function applyOneSitePacket(', 'async function receiveSitePacket('),c);
}
(async()=>{
 const c=context();loadMobile(c);let packets=[];let acknowledged=[];let legacyReads=0;
 c.firebaseGet=()=>{legacyReads++;return new Promise(()=>{})};
 c.fiqFirestore={};c.fiqAuthFns={serverTimestamp:()=>1,query:(...x)=>x,collection:(...x)=>x,where:(...x)=>x,doc:(...x)=>x,getDocs:async()=>({forEach:f=>packets.forEach((p,i)=>f({id:String(i),data:()=>structuredClone(p)}))}),updateDoc:async(...x)=>acknowledged.push(x)};
 packets=[packet(project(),2000)];
 await c.receiveStudioDirect();
 assert.equal(c.state.projects.length,1,'another session receiving must not hide the packet');
 assert.equal(legacyReads,0,'retired connection cannot block company connection');
 assert.equal(c.state.projects[0].cabinets[0].parts.length,1);
 await c.receiveStudioDirect();assert.equal(c.state.projects.length,1,'duplicate polling does not duplicate jobs');
 const late=project('Old');late.jobLog=[{id:'late',text:'Recovered note',photos:['photo'],at:1}];
 packets.push(packet(late,1000));await c.receiveStudioDirect();
 assert.equal(c.state.projects[0].name,'Latest','old note packet cannot roll back job details');
 assert.equal(c.state.projects[0].jobLog.length,1,'late note is recovered');
 packets=[packet(project('Updated'),3000,'waiting')];c.save=()=>false;acknowledged=[];
 await c.receiveStudioDirect();assert.equal(acknowledged.length,0,'failed durable save must not acknowledge');
 c.save=()=>true;await c.receiveStudioDirect();assert.equal(acknowledged.length,1,'save retry acknowledges');
 c.state.projects=[];c.fittersiqUser={uid:'fitter',companyId:'company',fitterId:'B'};
 const assigned=project();assigned.rooms[0].assignedFitterIds=['A'];packets=[packet(assigned,4000,'waiting')];
 await c.receiveStudioDirect();assert.equal(c.state.projects.length,0,'unassigned fitter must not import job');
 c.fittersiqUser.role='company_owner';c.localStorage.setItem('fittersiq_test_reset_at_v1','5000');
 await c.receiveStudioDirect();assert.equal(c.state.projects.length,0,'old packet cannot undo reset');
 c.localStorage.setItem('fittersiq_test_reset_at_v1','0');c.state.deletedProjectIds=['job'];packets=[packet(assigned,4000)];
 await c.receiveStudioDirect();assert.equal(c.state.projects.length,0,'history does not undo deletion');
 const d=context();loadStudio(d);d.state.projects=[project()];d.state.projects[0]._lastMobilePacketAt=3000;
 const old=project('Old');old._packetExportedAt=new Date(2000).toISOString();old.jobLog=[{id:'late',text:'note'}];
 d.mergeMobileProject(old);assert.equal(d.state.projects[0].name,'Latest');assert.equal(d.state.projects[0].jobLog.length,1);
 const visit={id:'visit',rooms:[{id:'room',beforePhotos:['photo']}],cabinets:[],jobLog:[]};
 const visitPacket={project:visit,exportedAt:new Date(4000).toISOString(),syncId:'cloud:visit',status:'waiting'};
 let receipts=0;d.removeInboxPacket=async()=>receipts++;
 await d.applyOneSitePacket(structuredClone(visitPacket),false);
 assert(d.sitePacketNeedsMerge(visitPacket),'reviewed site visit stays available for explicit acceptance');
 assert.equal(receipts,0);
 await d.applyOneSitePacket(structuredClone(visitPacket),true);assert.equal(receipts,1);
 assert(!d.sitePacketNeedsMerge(visitPacket),'accepted duplicate stays hidden');
 const progress=project();progress.studioOrigin=true;progress.cabinets[0].parts[0]={id:'panel',qty:1,status:'damaged',statusUpdatedAt:6000,damageNote:'Corner',panelPhotos:['photo']};
 await d.applyOneSitePacket({project:progress,exportedAt:new Date(6000).toISOString(),syncId:'cloud:progress'},true);
 assert.equal(d.state.projects.find(p=>p.id==='job').cabinets[0].parts[0].status,'damaged');
 // Real Studio media walker must upload both string arrays and object photos.
 const media=context();let uploads=[];
 media.fiqStorage={};media.fiqStorageFns={ref:(_,p)=>p,uploadString:async(p,v)=>uploads.push([p,v]),getDownloadURL:async p=>'https://media.test/'+p};
 vm.runInContext(section(studio,'const HEAVY_MEDIA_INLINE_THRESHOLD=', 'async function sendPackToPhoneDirectly('),media);
 const image='data:image/jpeg;base64,'+'a'.repeat(7000);const photographed={id:'job',photos:[image,{id:'photo',data:image}]};
 const cloud=await media.offloadHeavyMediaForMobileSync(photographed,'company');
 assert.equal(uploads.length,2);assert(cloud.photos[0].startsWith('https:'));assert(photographed.photos[0].startsWith('data:'));
 const paths=uploads.map(x=>x[0]);await media.offloadHeavyMediaForMobileSync(photographed,'company');assert(!paths.includes(uploads[2][0]),'different transfers cannot overwrite old photo URLs');
 // Exercise real transport functions against an isolated in-memory company collection.
 vm.runInContext(section(studio,'async function sendPackToPhoneDirectly(', 'async function exportProjectToMobile('),media);
 let docs=new Map();media.fiqFirestore={};media.fiqAuthFns={doc:(...x)=>x.slice(1).join('/'),serverTimestamp:()=>1,setDoc:async(k,v)=>docs.set(k,structuredClone(v))};
 const outgoing={project:project(),exportedAt:new Date(7000).toISOString(),syncId:'fixed'};
 await media.sendPackToPhoneDirectly(outgoing);await media.sendPackToPhoneDirectly(outgoing);
 assert.equal(docs.size,1,'retry uses the same cloud document');
 c.state.projects=[];c.state.deletedProjectIds=[];c.fittersiqUser={uid:'owner',companyId:'company',role:'company_owner'};packets=[...docs.values()];
 await c.receiveStudioDirect();assert.equal(c.state.projects.length,1,'Studio transport arrives through real Mobile receiver');
 vm.runInContext(script(mobile,'a200-sync-v1088-fix'),media);
 media.fiqAuthFns.collection=(...x)=>x;media.fiqAuthFns.addDoc=async(_,v)=>{docs.set('return',structuredClone(v));return{id:'return'}};
 const returned=structuredClone(c.state.projects[0]);returned.cabinets[0].parts[0].status='installed';returned.cabinets[0].parts[0].statusUpdatedAt=8000;returned.jobLog=[{id:'installed',text:'Fitted',photos:[image]}];
 await media.sendPackDirectly({project:returned,exportedAt:new Date(8000).toISOString()});
 await d.applyOneSitePacket({...docs.get('return'),syncId:'cloud:return'},true);
 const completed=d.state.projects.find(p=>p.id==='job');assert.equal(completed.cabinets[0].parts[0].status,'installed');assert(completed.jobLog.some(n=>n.id==='installed'&&n.photos[0].startsWith('https:')));
 console.log('PASS: actual transport and merge functions, two-way round trip, received history, duplicates, late notes, save failure/retry, fitter access, reset/deletion, acceptance, photos.');
})().catch(e=>{console.error(e);process.exitCode=1});
