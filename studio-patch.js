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

    siteRows.forEach(function(row){
      var roomId=String(row.getAttribute('data-open-site-room')||'');
      var projectId=String(row.getAttribute('data-open-site-room-project')||'');
      if(existingKeys.has(roomId+'::'+projectId))return;
      var clone=row.cloneNode(true);
      clone.classList.add('fiq-site-note-link');
      clone.setAttribute('title','Open site note for this room');
      var main=clone.querySelector('.customer-tab-row-main');
      if(main&&!main.querySelector('.fiq-site-note-label')){
        var label=document.createElement('span');
        label.className='customer-tab-row-sub fiq-site-note-label';
        label.textContent='Site note';
        main.appendChild(label);
      }
      notesPanel.appendChild(clone);
    });
  }

  var applying=false;
  function apply(){
    if(applying)return;
    applying=true;
    try{
      wireLogoHome();
      removeDocumentsTab();
      mirrorSiteNotesIntoNotesTab();
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
