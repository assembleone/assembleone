(function(){
  'use strict';

  function openSiteUpdate(){
    try{
      if(typeof window.openJobNotesPanel==='function'){
        window.openJobNotesPanel();
        var title=document.getElementById('jobNotesTitle');
        if(title)title.textContent='📤 Site Update';
        var panel=document.getElementById('jobNotesPanel');
        var helper=panel&&panel.querySelector('.job-notes-sheet > .muted');
        if(helper)helper.textContent='Add a note and photos, then send the update back to Studio.';
        var field=document.getElementById('jobNoteText');
        if(field)field.placeholder='Add an update for Studio';
        var send=document.getElementById('saveJobNote');
        if(send)send.textContent='Send Update to Studio';
      }
    }catch(e){console.error('Site Update panel failed',e)}
  }

  function makeDesignImagesFullscreen(){
    document.querySelectorAll('#designGuideSection .room-photo-tile img').forEach(function(img){
      if(img.dataset.fiqFullscreen==='1')return;
      img.dataset.fiqFullscreen='1';
      img.style.cursor='zoom-in';
      img.addEventListener('click',function(){
        var overlay=document.createElement('div');
        overlay.className='fiq-design-fullscreen';
        overlay.innerHTML='<button type="button" aria-label="Close">×</button><img alt="Design Guide" src="'+String(img.src).replace(/"/g,'&quot;')+'">';
        overlay.addEventListener('click',function(e){if(e.target===overlay||e.target.tagName==='BUTTON')overlay.remove()});
        document.body.appendChild(overlay);
      });
    });
  }

  function getMobileState(){
    try{return JSON.parse(localStorage.getItem('assembleone_mobile_v2')||'{}')}catch(e){return {}}
  }

  function projectForCardKey(key){
    var id=String(key||'').split('::')[0];
    var st=getMobileState();
    return Array.isArray(st.projects)?st.projects.find(function(p){return String(p.id)===id}):null;
  }

  function openDirectionsForProject(p){
    if(!p)return;
    var url='';
    if(p.geoLat!=null&&p.geoLng!=null){
      url='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(String(p.geoLat)+','+String(p.geoLng));
    }else if(String(p.address||'').trim()){
      url='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(String(p.address).trim());
    }
    if(url)window.open(url,'_blank','noopener');
  }

  function addDirectionsToJobCards(){
    document.querySelectorAll('#jobList .job').forEach(function(card){
      if(card.querySelector('.fiq-job-directions'))return;
      var open=card.querySelector('.open-job[data-card-key]');
      var actions=card.querySelector('.mobile-job-actions');
      if(!open||!actions)return;
      var p=projectForCardKey(open.dataset.cardKey);
      if(!p)return;
      var hasAddress=String(p.address||'').trim();
      var hasPin=p.geoLat!=null&&p.geoLng!=null;
      if(!hasAddress&&!hasPin)return;
      var btn=document.createElement('button');
      btn.type='button';
      btn.className='btn fiq-job-directions';
      btn.innerHTML='📍 Directions';
      btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openDirectionsForProject(p)});
      actions.insertBefore(btn,open);
    });
  }

  function cleanRoomDetail(){
    var toolbar=document.querySelector('.room-check-chips');
    var notes=document.getElementById('roomNotesSection');
    var actions=document.querySelector('.room-action-row');
    if(!toolbar)return;

    toolbar.classList.add('fiq-room-toolbar');

    if(!document.getElementById('fiqSiteUpdateTop')){
      var update=document.createElement('button');
      update.type='button';
      update.className='bomp-chip fiq-site-update';
      update.id='fiqSiteUpdateTop';
      update.innerHTML='Site Update <b>↑</b>';
      update.addEventListener('click',openSiteUpdate);
      toolbar.appendChild(update);
    }

    if(notes){
      notes.classList.add('fiq-studio-notes');
      if(notes.previousElementSibling!==toolbar)toolbar.insertAdjacentElement('afterend',notes);
      var summary=notes.querySelector('summary');
      if(summary&&!summary.dataset.fiqRelabelled){
        summary.dataset.fiqRelabelled='1';
        var txt=summary.textContent||'';
        if(!/from studio/i.test(txt))summary.textContent='📝 Notes from Studio'+(/no notes/i.test(txt)?' — No notes':'');
      }
    }

    if(actions)actions.classList.add('fiq-duplicate-actions-hidden');
    makeDesignImagesFullscreen();
  }

  function addCss(){
    if(document.getElementById('fiqMobileBuild83Styles'))return;
    var style=document.createElement('style');
    style.id='fiqMobileBuild83Styles';
    style.textContent=`
      .fiq-room-toolbar{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:7px!important;margin:10px 0 8px!important}
      .fiq-room-toolbar .bomp-chip{min-width:0!important;min-height:46px!important;border:2px solid #59b83a!important;border-radius:14px!important;background:#fff!important;color:#0B2545!important;padding:7px 5px!important;font-weight:850!important;box-shadow:0 2px 7px rgba(72,157,42,.08)!important}
      .fiq-room-toolbar .bomp-chip.active{background:#edf9e9!important;box-shadow:0 0 0 2px rgba(89,184,58,.16)!important}
      .fiq-room-toolbar .bomp-chip b{display:inline!important;margin-left:3px!important;color:#138a2e!important}
      .fiq-site-update{line-height:1.05!important}
      .fiq-studio-notes{margin:0 0 10px!important;padding:0!important;border:2px solid #59b83a!important;border-radius:14px!important;background:#fff!important;overflow:hidden!important}
      .fiq-studio-notes summary{padding:10px 12px!important;font-size:14px!important;font-weight:850!important}
      .fiq-studio-notes .installer-note-box{margin:0 10px 10px!important;padding:10px 11px!important;min-height:0!important;font-size:14px!important;line-height:1.35!important;border-radius:10px!important}
      .fiq-duplicate-actions-hidden{display:none!important}
      .room-status-strip{display:none!important}
      .room-customer-row{display:none!important}
      .fiq-job-directions{background:#fff!important;color:#0B5DB3!important;border:2px solid #8fc0f1!important;font-weight:850!important;min-height:42px!important;white-space:nowrap!important}
      .mobile-job-actions{display:flex!important;flex-direction:column!important;gap:7px!important;align-items:stretch!important}
      #designGuideSection .room-photo-tile img{transition:transform .12s ease}
      #designGuideSection .room-photo-tile img:active{transform:scale(.99)}
      .fiq-design-fullscreen{position:fixed;inset:0;z-index:10000;background:rgba(5,12,25,.96);display:flex;align-items:center;justify-content:center;padding:18px}
      .fiq-design-fullscreen img{max-width:100%;max-height:92vh;object-fit:contain;border-radius:10px}
      .fiq-design-fullscreen button{position:absolute;right:14px;top:calc(14px + env(safe-area-inset-top));width:48px;height:48px;border-radius:50%;border:0;background:#fff;color:#0B2545;font-size:31px;line-height:1;z-index:2}
      @media(max-width:390px){.fiq-room-toolbar{grid-template-columns:repeat(2,minmax(0,1fr))!important}.fiq-job-directions{font-size:13px!important;padding:8px 6px!important}}
    `;
    document.head.appendChild(style);
  }

  var busy=false;
  function apply(){
    if(busy)return;
    busy=true;
    try{addCss();cleanRoomDetail();addDirectionsToJobCards()}finally{busy=false}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  var timer=null;
  new MutationObserver(function(){clearTimeout(timer);timer=setTimeout(apply,30)}).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('pageshow',apply);
})();
