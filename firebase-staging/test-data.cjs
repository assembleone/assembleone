// Generated Studio-like browser data for cloud copy tests (no real data).
// Same shape as Studio's saved state: customers (incl. two with the same name), jobs with
// rooms, units, panels with copies, piece states, saved Cutting List versions with piece
// QR, job log with a small photo, Site Measure fields, deleted-job ids and recycle bin.
function makeState(opts){
 const jobs=(opts&&opts.jobs)||5,panelsPerUnit=(opts&&opts.panelsPerUnit)||4,seed=(opts&&opts.seed)||'t';
 const photo='data:image/jpeg;base64,'+Buffer.from('fake-jpeg-'+seed+'-'.repeat(200)).toString('base64');
 const customers=[
  {id:seed+'-cA',name:'Anna Berg',address:'Street 1, Palma',phone:'+34 600 111',email:'anna@example.test',createdAt:1727000000000,updatedAt:1727000000000},
  {id:seed+'-cS1',name:'John Smith',address:'Palma 1',phone:'222',createdAt:1727000000001,updatedAt:1727000000001},
  {id:seed+'-cS2',name:'John Smith',address:'Soller 9',phone:'333',createdAt:1727000000002,updatedAt:1727000000002,notes:'Same name, different person'},
 ];
 const projects=[];
 for(let n=1;n<=jobs;n++){
  const jid=seed+'-job-'+n,cust=customers[n%customers.length];
  const rooms=[{id:jid+'-r1',name:'Kitchen',icon:'🍳',notes:'',type:'Kitchen'},{id:jid+'-r2',name:'Pantry',icon:'⌂',notes:'',type:'Pantry'}];
  const cabinets=rooms.map((r,ri)=>({id:jid+'-u'+(ri+1),roomId:r.id,name:'Unit '+(ri+1),drawing:null,hasStoredDrawing:true,drawingType:'image',drawingName:'plan.png',
   deletedPartIds:ri?[]:[jid+'-old-panel'],
   parts:Array.from({length:panelsPerUnit},(_,pi)=>{const qty=(pi%3)+1;return {id:jid+'-u'+(ri+1)+'-p'+(pi+1),code:'P-'+String(pi+1).padStart(3,'0'),name:['Side','Shelf','Top','Back'][pi%4],length:700+pi,width:500-pi,thickness:18,qty,material:'White melamine',edgeLong:pi%2,edgeShort:(pi+1)%2,notes:pi===1?'Grain up — ½ mm':'',status:'ready',x:10+pi*7,y:20+ri*30,copies:qty>1?Array.from({length:qty-1},(_,k)=>({x:12+k*5,y:25})):[],
    pieceStates:pi===0?{'1':{status:'fitted',statusAt:1727100000000,statusBy:'fitter-1'}}:undefined,scannedQty:pi===0?1:0}})}));
  cabinets.forEach(c=>c.parts.forEach(p=>{if(p.pieceStates===undefined)delete p.pieceStates}));
  projects.push({id:jid,name:'Job '+n+' for '+cust.name,customer:cust.name,customerId:cust.id,address:cust.address,phone:cust.phone||'',rooms,cabinets,
   sentCuttingLists:{['room:'+rooms[0].id]:[{sentAt:1727200000000,panels:cabinets[0].parts.map(p=>({panelId:p.id,panelNumber:p.code,length:p.length,width:p.width,thickness:p.thickness,quantity:p.qty,pieces:Array.from({length:p.qty},(_,i)=>({piece:i+1,qr:'#panel='+jid+':'+cabinets[0].id+':'+p.id+':'+(i===0?-1:i-1)}))}))}]},
   jobLog:[{id:jid+'-log1',text:'Measured on site',photos:[photo],roomId:rooms[0].id,at:1727300000000,by:'Mads'}],
   siteNotes:'Lift is small',siteMeasurements:{[rooms[0].id]:{width:3200,height:2400}},sitePhotos:n===1?[photo]:[],
   updatedAt:1727400000000+n});
 }
 return {customers,projects,deletedProjectIds:[seed+'-gone'],deletedProjects:[{deletedAt:1727500000000,project:{id:seed+'-gone',name:'Deleted job',cabinets:[]}}],
  currentProject:null,screen:'jobs',drawingZoom:1};
}
function deepFreeze(o){if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.freeze(o);Object.values(o).forEach(deepFreeze)}return o}
// Generated file bytes (not a real image; the cloud only checks type and fingerprint).
const fakeBytes=(label,size)=>{const b=Buffer.alloc(size);const s=Buffer.from(label);for(let i=0;i<size;i++)b[i]=s[i%s.length]^(i&255);return b};
const dataUrl=(type,label,size)=>'data:'+type+';base64,'+fakeBytes(label,size).toString('base64');
// Full slice 2 input: the saved state plus IndexedDB drawings and durable setting keys.
function makeInput(opts){
 const seed=(opts&&opts.seed)||'t',drawingSize=(opts&&opts.drawingSize)||3000;
 const state=makeState(opts);
 // A recycle-bin job with a unit and an inline drawing (as Studio keeps it).
 state.deletedProjects[0].project={id:seed+'-gone',name:'Deleted job',customer:'Anna Berg',customerId:seed+'-cA',rooms:[{id:seed+'-gone-r',name:'Hall'}],
  cabinets:[{id:seed+'-gone-u',roomId:seed+'-gone-r',name:'Hall unit',drawing:dataUrl('image/jpeg',seed+'-bin-inline',800),drawingType:'image',parts:[]}]};
 state.jobLifecycle=[{jobId:seed+'-gone',event:'deleted',at:state.deletedProjects[0].deletedAt}];
 state.units='cm';state.lastChosenPartName='Side';state.fitters=[{id:'f1',name:'Fitter One',phone:'+34 600 000'}];
 state.screen='mark';state.drawingZoom=1.5;state.currentProject=state.projects[0].id;state.dotCycle={cabinetId:'x',panelId:'y'};// screen state: not copied
 const drawings=[];
 state.projects.forEach((p,i)=>p.cabinets.forEach((c,k)=>{
  if(i===0&&k===1)drawings.push({key:p.id+':'+c.id,drawing:dataUrl('application/pdf','%PDF-'+seed+'-'+p.id,drawingSize),drawingType:'pdf',drawingName:'plan.pdf'});
  else if(i===1&&k===1)drawings.push({key:p.id+':'+c.id,drawing:dataUrl('image/jpeg',seed+'-shared',drawingSize),drawingType:'image',drawingName:'shared.jpg'});
  else if(i===2&&k===1)drawings.push({key:p.id+':'+c.id,drawing:dataUrl('image/jpeg',seed+'-shared',drawingSize),drawingType:'image',drawingName:'shared.jpg'});// same drawing as job 2
  else drawings.push({key:p.id+':'+c.id,drawing:dataUrl('image/jpeg',seed+'-'+p.id+'-'+c.id,drawingSize),drawingType:'image',drawingName:'plan.jpg'});
 }));
 drawings.push({key:seed+'-gone:'+seed+'-gone-u',drawing:dataUrl('image/jpeg',seed+'-bin-idb',drawingSize),drawingType:'image',drawingName:'hall.jpg'});
 drawings.push({key:seed+'-oldjob:'+seed+'-oldunit',drawing:dataUrl('image/png',seed+'-orphan',drawingSize),drawingType:'image',drawingName:'old.png'});// orphan
 const settings={'fiq_supplier_prices_v1':'{"White":{"sheet":40}}','assembleone_material_library_v1':'["White","Oak"]','assembleone_sheet_settings':'{"White":{"w":2800,"h":2070}}',['assembleone-checklist-'+state.projects[0].id]:'[true,false,false,false,false,false]'};
 return {state,drawings,settings};
}
module.exports={makeState,makeInput,deepFreeze,dataUrl,fakeBytes};
