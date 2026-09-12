(function(){
  'use strict';

  function projectById(id){
    try{return (state.projects||[]).find(function(p){return String(p.id)===String(id)})||null}catch(e){return null}
  }

  function roomIdForRow(row){
    var raw=String(row.getAttribute('data-card-room-id')||'');
    if(!raw||raw==='__general__'||raw==='__site_visit__')return null;
    return raw;
  }

  function cabinetsForRow(project,roomId){
    var list=Array.isArray(project&&project.cabinets)?project.cabinets:[];
    return roomId?list.filter(function(c){return String(c.roomId||'')===String(roomId)}):list;
  }

  function smallPreview(src){
    if(!src)return Promise.resolve('');
    if(!String(src).startsWith('data:'))return Promise.resolve(src);
    return new Promise(function(resolve){
      var img=new Image();
      img.onload=function(){
        try{
          var maxW=360,maxH=240,scale=Math.min(1,maxW/img.naturalWidth,maxH/img.naturalHeight);
          var w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale));
          var canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
          var ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,w,h);
          resolve(canvas.toDataURL('image/jpeg',0.72));
        }catch(e){resolve('')}
      };
      img.onerror=function(){resolve('')};
      img.src=src;
    });
  }

  async function capturePreviews(project){
    var out=[];
    for(var i=0;i<(project.cabinets||[]).length;i++){
      var c=project.cabinets[i];
      if(!c||!c.drawing||c.drawingType==='pdf')continue;
      var preview=await smallPreview(c.drawing);
      if(preview)out.push({id:c.id,preview:preview});
    }
    return out;
  }

  function clearActiveWorkspace(projectId){
    try{
      if(String(state.currentProject||'')!==String(projectId||''))return;
      state.currentProject=null;
      state.currentCabinet=null;
      state.currentPart=null;
      state.currentRoom=null;
      state.screen='jobs';
    }catch(e){}
  }

  function installSendProtection(){
    if(window.__fiqDispatchSnapshotInstalled)return;
    if(typeof window.exportProjectToMobile!=='function')return;
    window.__fiqDispatchSnapshotInstalled=true;
    var original=window.exportProjectToMobile;
    window.exportProjectToMobile=async function(target){
      var p=target||((typeof project==='function')?project():null);
      if(!p)return original.apply(this,arguments);
      var beforeSync=p.lastMobileSync||'';
      var captured=await capturePreviews(p);
      var result=await original.apply(this,arguments);
      var sent=!!p.lastMobileSync&&p.lastMobileSync!==beforeSync;
      if(sent){
        captured.forEach(function(item){
          var c=(p.cabinets||[]).find(function(x){return String(x.id)===String(item.id)});
          if(c){c.sentDrawingPreview=item.preview;c.sentDrawingPreviewAt=p.lastMobileSync}
        });
        clearActiveWorkspace(p.id);
        try{if(typeof save==='function')save()}catch(e){}
        try{if(typeof renderAll==='function')renderAll()}catch(e){}
        try{if(typeof show==='function')show('jobs')}catch(e){}
        setTimeout(applyFrozenPreviews,30);
      }
      return result;
    };
    try{exportProjectToMobile=window.exportProjectToMobile}catch(e){}
  }

  function applyFrozenPreviews(){
    document.querySelectorAll('.job-overview-row[data-open-job-card]').forEach(function(row){
      var p=projectById(row.getAttribute('data-open-job-card'));
      if(!p)return;
      var cabinets=cabinetsForRow(p,roomIdForRow(row));
      var source='';
      for(var i=0;i<cabinets.length;i++){
        if(cabinets[i]&&cabinets[i].sentDrawingPreview){source=cabinets[i].sentDrawingPreview;break}
      }
      if(!source)return;
      var thumb=row.querySelector('.jor-thumb');if(!thumb)return;
      var img=thumb.querySelector('img');
      if(!img){img=document.createElement('img');img.alt='Sent drawing preview';thumb.innerHTML='';thumb.appendChild(img)}
      if(img.src!==source)img.src=source;
    });
  }

  var applying=false;
  function apply(){
    if(applying)return;applying=true;
    try{installSendProtection();applyFrozenPreviews()}finally{applying=false}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  var timer=null;
  new MutationObserver(function(){clearTimeout(timer);timer=setTimeout(apply,25)}).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('pageshow',apply);
})();
