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
module.exports={makeState,deepFreeze};
