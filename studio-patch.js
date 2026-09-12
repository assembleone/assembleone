(function(){
  'use strict';

  function goHome(){
    try{
      if(typeof window.show==='function'){
        window.show('jobs');
        if(typeof window.renderAll==='function')window.renderAll();
        window.scrollTo({top:0,behavior:'smooth'});
        return;
      }
    }catch(e){console.error('FittersIQ home navigation failed',e)}
  }

  function wireLogoHome(){
    var logo=document.querySelector('.header-logo');
    if(!logo||logo.dataset.fiqHomeWired==='1')return;
    logo.dataset.fiqHomeWired='1';
    logo.setAttribute('role','button');
    logo.setAttribute('tabindex','0');
    logo.setAttribute('aria-label','Home');
    logo.setAttribute('title','Home');
    logo.style.cursor='pointer';
    logo.addEventListener('click',goHome);
    logo.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){e.preventDefault();goHome()}
    });
  }

  function removeDocumentsTab(){
    document.querySelectorAll('.customer-tab[data-tab="documents"]').forEach(function(el){el.remove()});
    document.querySelectorAll('.customer-tab-panel[data-tab-panel="documents"]').forEach(function(el){el.remove()});
  }

  function projectById(id){
    try{
      if(typeof state!=='undefined'&&state&&Array.isArray(state.projects))return state.projects.find(function(p){return String(p.id)===String(id)})||null;
    }catch(e){}
    return null;
  }

  function addGeneralSiteNote(notesPanel,p){
    if(!p)return;
    var text=String(p.siteNotes||p.siteRoomNotes||'').trim();
    if(!text)return;
    if(notesPanel.querySelector('.fiq-site-general-note[data-project-id="'+CSS.escape(String(p.id))+'"]'))return;
    var row=document.createElement('div');
    row.className='customer-tab-row fiq-site-note-link fiq-site-general-note';
    row.dataset.projectId=String(p.id);
    row.style.cursor='default';
    row.innerHTML='<span class="customer-tab-row-icon">📝</span><span class="customer-tab-row-main"><strong>Site note</strong><span class="customer-tab-row-sub"></span></span>';
    var sub=row.querySelector('.customer-tab-row-sub');
    if(sub)sub.textContent=text;
    notesPanel.appendChild(row);
  }

  function mirrorSiteNotesIntoNotesTab(){
    var notesPanel=document.querySelector('.customer-tab-panel[data-tab-panel="notes"]');
    var sitePanel=document.querySelector('.customer-tab-panel[data-tab-panel="site"]');
    if(!notesPanel||!sitePanel)return;

    notesPanel.querySelectorAll('.fiq-site-note-link').forEach(function(el){el.remove()});

    var siteRows=Array.from(sitePanel.querySelectorAll('.customer-tab-row[data-open-site-room]'));
    if(!siteRows.length)return;

    var existingKeys=new Set(Array.from(notesPanel.querySelectorAll('[data-job-notes-room]')).map(function(el){
      return String(el.getAttribute('data-job-notes-room')||'')+'::'+String(el.getAttribute('data-job-notes')||'');
    }));
    var seenProjects=new Set();

    siteRows.forEach(function(row){
      var roomId=String(row.getAttribute('data-open-site-room')||'');
      var projectId=String(row.getAttribute('data-open-site-room-project')||'');
      var p=projectById(projectId);
      if(p&&!seenProjects.has(projectId)){seenProjects.add(projectId);addGeneralSiteNote(notesPanel,p)}
      var room=p&&Array.isArray(p.rooms)?p.rooms.find(function(r){return String(r.id)===roomId}):null;
      var noteText=String(room&&(room.notes||room.siteRoomNotes)||'').trim();
      var notePhotos=room&&Array.isArray(room.notePhotos)?room.notePhotos.length:0;
      if(!noteText&&!notePhotos)return;
      if(existingKeys.has(roomId+'::'+projectId))return;
      var clone=row.cloneNode(true);
      clone.classList.add('fiq-site-note-link');
      clone.setAttribute('title','Open site note for this room');
      var main=clone.querySelector('.customer-tab-row-main');
      if(main){
        var label=document.createElement('span');
        label.className='customer-tab-row-sub fiq-site-note-label';
        label.textContent=noteText?noteText:(notePhotos+' note photo'+(notePhotos===1?'':'s'));
        main.appendChild(label);
      }
      notesPanel.appendChild(clone);
    });
  }

  function roomIdForOverviewRow(row){
    var raw=String(row.getAttribute('data-card-room-id')||'');
    if(!raw||raw==='__general__'||raw==='__site_visit__')return null;
    return raw;
  }

  function updateCountFor(projectId,roomId){
    var p=projectById(projectId);
    if(!p)return 0;
    try{
      if(typeof jobLogEntriesForRoom==='function')return jobLogEntriesForRoom(p,roomId).length;
    }catch(e){}
    var log=Array.isArray(p.jobLog)?p.jobLog:[];
    if(roomId)return log.filter(function(en){return String(en.roomId||'')===String(roomId)}).length;
    return log.filter(function(en){return !en.roomId}).length;
  }

  function openSiteUpdates(projectId,roomId){
    try{
      if(typeof openJobNotesDialog==='function'){
        openJobNotesDialog(projectId,roomId||null);
        var sheet=document.querySelector('.job-notes-dialog-sheet');
        if(sheet){
          var h=sheet.querySelector('h2');
          if(h)h.textContent='Site Updates';
        }
        return;
      }
    }catch(e){console.error('Could not open Site Updates',e)}
  }

  function addSiteUpdateButtons(){
    document.querySelectorAll('.job-overview-row[data-open-job-card]').forEach(function(row){
      var projectId=String(row.getAttribute('data-open-job-card')||'');
      if(!projectId)return;
      var roomId=roomIdForOverviewRow(row);
      var count=updateCountFor(projectId,roomId);
      var btn=row.querySelector('.fiq-site-updates-btn');
      if(!btn){
        btn=document.createElement('button');
        btn.type='button';
        btn.className='fiq-site-updates-btn';
        btn.title='Site Updates';
        btn.setAttribute('aria-label','Site Updates');
        btn.addEventListener('click',function(e){
          e.preventDefault();
          e.stopPropagation();
          openSiteUpdates(projectId,roomId);
        });
        row.appendChild(btn);
      }
      btn.textContent='Updates'+(count?' '+count:'');
      btn.classList.toggle('has-updates',count>0);
    });
  }

  function addStyles(){
    if(document.getElementById('fiqStudioPatchStyles'))return;
    var style=document.createElement('style');
    style.id='fiqStudioPatchStyles';
    style.textContent=`
      .fiq-site-updates-btn{
        position:absolute;left:22px;top:130px;z-index:4;
        min-width:54px;height:24px;padding:2px 7px;
        border:1px solid #AFC7E7;border-radius:999px;
        background:#F6FAFF;color:#174E98;
        font-size:10px;font-weight:900;line-height:1;
        box-shadow:0 2px 6px rgba(23,78,152,.08);
      }
      .fiq-site-updates-btn.has-updates{border-color:#79BF55;background:#F1FAED;color:#347D18}
      .fiq-site-updates-btn:hover{transform:translateY(-1px)}
      @media(max-width:900px){.fiq-site-updates-btn{left:22px;top:126px}}
      @media(max-width:600px){.fiq-site-updates-btn{left:14px;top:116px;min-width:50px;font-size:9px}}
    `;
    document.head.appendChild(style);
  }

  var applying=false;
  function apply(){
    if(applying)return;
    applying=true;
    try{
      addStyles();
      wireLogoHome();
      removeDocumentsTab();
      mirrorSiteNotesIntoNotesTab();
      addSiteUpdateButtons();
    }finally{applying=false}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();

  var timer=null;
  new MutationObserver(function(){
    clearTimeout(timer);
    timer=setTimeout(apply,25);
  }).observe(document.documentElement,{childList:true,subtree:true});

  window.addEventListener('pageshow',apply);
})();
