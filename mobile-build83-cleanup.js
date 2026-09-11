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

  function addTopLocation(){
    var intro=document.querySelector('.installer-room-intro');
    var customerRow=document.querySelector('.room-customer-row');
    if(!intro||!customerRow)return;
    customerRow.classList.add('fiq-location-hidden');
    if(intro.querySelector('.fiq-room-map'))return;
    var small=customerRow.querySelector('.room-customer-main small');
    var addr=small?String(small.textContent||'').trim():'';
    if(!addr||/no address/i.test(addr))return;
    var map=document.createElement('button');
    map.type='button';
    map.className='fiq-room-map';
    map.innerHTML='<span>📍</span><small>Directions</small>';
    map.addEventListener('click',function(){
      window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(addr),'_blank','noopener');
    });
    intro.appendChild(map);
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
    addTopLocation();
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
      .fiq-location-hidden{display:none!important}
      .installer-room-intro{position:relative!important;padding-right:90px!important}
      .fiq-room-map{position:absolute;right:10px;top:50%;transform:translateY(-50%);width:68px;min-height:62px;border:2px solid #59b83a;border-radius:15px;background:#fff;color:#0B2545;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;font-weight:850}
      .fiq-room-map span{font-size:24px;line-height:1}.fiq-room-map small{font-size:10px;font-weight:850}
      #designGuideSection .room-photo-tile img{transition:transform .12s ease}
      #designGuideSection .room-photo-tile img:active{transform:scale(.99)}
      .fiq-design-fullscreen{position:fixed;inset:0;z-index:10000;background:rgba(5,12,25,.96);display:flex;align-items:center;justify-content:center;padding:18px}
      .fiq-design-fullscreen img{max-width:100%;max-height:92vh;object-fit:contain;border-radius:10px}
      .fiq-design-fullscreen button{position:absolute;right:14px;top:calc(14px + env(safe-area-inset-top));width:48px;height:48px;border-radius:50%;border:0;background:#fff;color:#0B2545;font-size:31px;line-height:1;z-index:2}
      @media(max-width:390px){.fiq-room-toolbar{grid-template-columns:repeat(2,minmax(0,1fr))!important}.installer-room-intro{padding-right:78px!important}.fiq-room-map{width:60px}}
    `;
    document.head.appendChild(style);
  }

  var busy=false;
  function apply(){
    if(busy)return;
    busy=true;
    try{addCss();cleanRoomDetail()}finally{busy=false}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  var timer=null;
  new MutationObserver(function(){clearTimeout(timer);timer=setTimeout(apply,30)}).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('pageshow',apply);
})();
