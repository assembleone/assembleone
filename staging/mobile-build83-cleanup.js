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

  function cardStats(key){
    var bits=String(key||'').split('::');
    var projectId=bits[0]||'';
    var roomId=bits.length>1?bits.slice(1).join('::'):'';
    var st=getMobileState();
    var p=Array.isArray(st.projects)?st.projects.find(function(x){return String(x.id)===projectId}):null;
    if(!p)return {total:0,scanned:0,pct:0};
    var cabinets=Array.isArray(p.cabinets)?p.cabinets:[];
    if(roomId)cabinets=cabinets.filter(function(c){return String(c.roomId||'')===roomId});
    var total=0,scanned=0;
    cabinets.forEach(function(c){(c.parts||[]).forEach(function(pt){
      var q=Math.max(1,Number(pt.qty)||1);
      total+=q;
      scanned+=Math.min(q,Math.max(0,Number(pt.scannedQty)||0));
    })});
    return {total:total,scanned:scanned,pct:total?Math.round(scanned/total*100):0};
  }

  function currentRoomStats(){
    var st=getMobileState();
    if(!st.currentProject)return {total:0,scanned:0,pct:0};
    var key=String(st.currentProject)+(st.currentRoom?'::'+String(st.currentRoom):'');
    return cardStats(key);
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
      var open=card.querySelector('.open-job[data-card-key]');
      if(!open)return;
      var existing=card.querySelector('.fiq-job-directions');
      var p=projectForCardKey(open.dataset.cardKey);
      if(!p)return;
      var hasAddress=String(p.address||'').trim();
      var hasPin=p.geoLat!=null&&p.geoLng!=null;
      if(!hasAddress&&!hasPin){if(existing)existing.remove();return}
      if(existing)return;
      var btn=document.createElement('button');
      btn.type='button';
      btn.className='btn fiq-job-directions';
      btn.innerHTML='📍 <span>Directions</span>';
      btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openDirectionsForProject(p)});
      card.appendChild(btn);
    });
  }

  function decorateJobProgress(){
    document.querySelectorAll('#jobList .job').forEach(function(card){
      var open=card.querySelector('.open-job[data-card-key]');
      if(!open)return;
      var stats=cardStats(open.dataset.cardKey);
      var check=card.querySelector('.job-panelcheck');
      var text=check&&check.querySelector('span');
      if(stats.total&&text){
        text.textContent=stats.scanned+' / '+stats.total+' scanned · '+stats.pct+'%';
        check.classList.toggle('fiq-progress-complete',stats.pct===100);
      }
    });
  }

  function relabelDesignGuide(){
    var section=document.getElementById('designGuideSection');
    if(!section)return;
    var heading=section.querySelector('h3');
    if(heading&&heading.textContent.indexOf('Design Guide')!==-1)heading.textContent='Design Guide';
  }

  function addRoomScanProgress(){
    var cutting=document.getElementById('openCuttingList');
    if(!cutting)return;
    var stats=currentRoomStats();
    var row=document.getElementById('fiqRoomScanProgress');
    if(!stats.total){if(row)row.remove();return}
    if(!row){
      row=document.createElement('div');
      row.id='fiqRoomScanProgress';
      row.className='fiq-room-scan-progress';
      cutting.insertAdjacentElement('afterend',row);
    }
    row.classList.toggle('complete',stats.pct===100);
    row.innerHTML='<div><strong>Panel Check</strong><span>'+stats.scanned+' / '+stats.total+' scanned · '+stats.pct+'%</span></div><div class="fiq-room-progress-bar"><i style="width:'+stats.pct+'%"></i></div>';
  }

  function polishScanNav(){
    var nav=document.querySelector('.nav.scan-main');
    if(!nav)return;
    var label=nav.querySelector('span');
    if(!label)return;
    var st=getMobileState();
    var stats=currentRoomStats();
    var inOpenedJob=st.screen==='drawings'&&!!st.currentProject;
    nav.classList.remove('fiq-ready-scan','fiq-scan-complete');
    if(inOpenedJob&&stats.total){
      if(stats.pct===100){label.textContent='100% Scanned';nav.classList.add('fiq-scan-complete')}
      else if(stats.scanned>0){label.textContent=stats.pct+'% Scanned';nav.classList.add('fiq-ready-scan')}
      else{label.textContent='Ready to Scan';nav.classList.add('fiq-ready-scan')}
    }else if(st.screen!=='scan'){
      label.textContent='Scan';
    }
  }

  function addHowItWorksBack(){
    var card=document.getElementById('fiqOnboardCard');
    if(!card)return;
    var heading=card.querySelector('h1');
    if(!heading||!/^How FittersIQ works$/i.test((heading.textContent||'').trim()))return;
    if(card.querySelector('.fiq-back-to-mobile'))return;
    var btn=document.createElement('button');
    btn.type='button';
    btn.className='fiq-back-to-mobile';
    btn.textContent='← Back to FittersIQ';
    btn.onclick=function(){
      var close=document.getElementById('fiqOnboardCloseBtn');
      if(close)close.click();
      else document.getElementById('fiqOnboardOverlay')?.classList.remove('open');
    };
    heading.insertAdjacentElement('beforebegin',btn);
  }

  function decorateCuttingList(){
    try{
      var box=document.getElementById('mobileJobBom');
      if(!box)return;
      var units=box.querySelectorAll('.mobile-bom-unit');
      if(!units.length)return;
      var st=getMobileState();
      var p=Array.isArray(st.projects)?st.projects.find(function(x){return String(x.id)===String(st.currentProject)}):null;
      if(!p)return;
      var cabinets=Array.isArray(p.cabinets)?p.cabinets:[];
      if(st.currentRoom)cabinets=cabinets.filter(function(c){return String(c.roomId||'')===String(st.currentRoom)});
      var parts=[];
      cabinets.forEach(function(c){(c.parts||[]).forEach(function(pt){parts.push(pt)})});
      units.forEach(function(unit,i){
        var pt=parts[i];
        if(!pt)return;
        var q=Math.max(1,Number(pt.qty)||1);
        var scanned=Math.min(q,Math.max(0,Number(pt.scannedQty)||0));
        var mark=unit.querySelector('.fiq-bom-scanmark');
        if(!mark){mark=document.createElement('span');mark.className='fiq-bom-scanmark';unit.appendChild(mark)}
        mark.classList.toggle('complete',scanned>=q);
        mark.classList.toggle('partial',scanned>0&&scanned<q);
        mark.textContent=scanned>=q?'✓':(scanned>0?scanned+'/'+q:'—');
        unit.classList.toggle('fiq-bom-scanned',scanned>=q);
      });
    }catch(e){console.error('Cutting List scan marks failed',e)}
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
    relabelDesignGuide();
    addRoomScanProgress();
    makeDesignImagesFullscreen();
  }

  function wrapCuttingListRender(){
    var fn=window.renderMobileBom;
    if(typeof fn!=='function'||fn.__fiqWrapped)return;
    var wrapped=function(){var out=fn.apply(this,arguments);setTimeout(decorateCuttingList,0);return out};
    wrapped.__fiqWrapped=true;
    window.renderMobileBom=wrapped;
  }

  function addCss(){
    if(document.getElementById('fiqMobileBuild83Styles'))return;
    var style=document.createElement('style');
    style.id='fiqMobileBuild83Styles';
    style.textContent=`
      #buildVersionBadge{display:none!important}
      .mobile-open-jobs-help{display:none!important}
      .fiq-help-fab{display:none!important}
      .job-finished-banner{display:none!important}
      #jobList .job{position:relative!important;padding-top:14px!important}
      .fiq-job-directions{position:absolute!important;right:10px!important;top:10px!important;z-index:4!important;background:#f5fbff!important;color:#0B5DB3!important;border:1.5px solid #8fc0f1!important;border-radius:11px!important;font-weight:850!important;min-height:34px!important;padding:6px 9px!important;white-space:nowrap!important;font-size:12px!important;box-shadow:0 2px 7px rgba(11,93,179,.09)!important}
      .fiq-job-directions span{vertical-align:middle}
      .mobile-job-actions{display:flex!important;flex-direction:column!important;gap:7px!important;align-items:stretch!important}
      .job-panelcheck.fiq-progress-complete{border-color:#69bd45!important;background:#f2fbec!important}
      .job-panelcheck.fiq-progress-complete b,.job-panelcheck.fiq-progress-complete span{color:#277c1f!important}
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
      #designGuideSection .room-photo-grid{grid-template-columns:1fr!important}
      #designGuideSection .room-photo-tile img{height:auto!important;max-height:none!important;object-fit:contain!important;transition:transform .12s ease}
      #designGuideSection .room-photo-tile img:active{transform:scale(.99)}
      .fiq-room-scan-progress{margin:8px 0 10px;padding:9px 11px;border:2px solid #9bc6ee;border-radius:13px;background:#f7fbff;color:#0B2545}
      .fiq-room-scan-progress.complete{border-color:#69bd45;background:#f2fbec}
      .fiq-room-scan-progress>div:first-child{display:flex;justify-content:space-between;gap:10px;align-items:center;font-size:12px}
      .fiq-room-scan-progress strong{font-size:13px}
      .fiq-room-scan-progress span{font-weight:850}
      .fiq-room-progress-bar{height:7px;margin-top:7px;background:#d9e7f6;border-radius:999px;overflow:hidden}
      .fiq-room-progress-bar i{display:block;height:100%;background:#5fae36;border-radius:999px}
      .fitters-bottom-nav .scan-main.fiq-ready-scan .fitters-scan-icon{box-shadow:0 7px 18px rgba(0,0,0,.3),0 0 0 5px #6BBF3A,0 0 0 9px rgba(107,191,58,.22)!important}
      .fitters-bottom-nav .scan-main.fiq-ready-scan span{color:#8FE063!important}
      .fitters-bottom-nav .scan-main.fiq-scan-complete .fitters-scan-icon{box-shadow:0 7px 18px rgba(0,0,0,.3),0 0 0 5px #6BBF3A!important}
      .fitters-bottom-nav .scan-main.fiq-scan-complete span{color:#8FE063!important;font-weight:950!important}
      .fiq-back-to-mobile{width:100%;min-height:44px;margin:0 0 12px;border:2px solid #6BBF3A;border-radius:12px;background:#f3fbed;color:#0B2545;font-weight:900;font-size:15px}
      .mobile-bom-unit{position:relative!important;padding-left:46px!important}
      .fiq-bom-scanmark{position:absolute;left:7px;top:50%;transform:translateY(-50%);width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#eef0f5;color:#7c8491;font-weight:900;font-size:12px}
      .fiq-bom-scanmark.partial{background:#eaf3ff;color:#174E98;border:1px solid #9bc6ee}
      .fiq-bom-scanmark.complete{background:#27AE60;color:#fff;border:0;font-size:18px}
      .mobile-bom-unit.fiq-bom-scanned{background:#f3fbf0!important}
      .fiq-design-fullscreen{position:fixed;inset:0;z-index:10000;background:rgba(5,12,25,.96);display:flex;align-items:center;justify-content:center;padding:18px}
      .fiq-design-fullscreen img{max-width:100%;max-height:92vh;object-fit:contain;border-radius:10px}
      .fiq-design-fullscreen button{position:absolute;right:14px;top:calc(14px + env(safe-area-inset-top));width:48px;height:48px;border-radius:50%;border:0;background:#fff;color:#0B2545;font-size:31px;line-height:1;z-index:2}
      @media(max-width:390px){.fiq-room-toolbar{grid-template-columns:repeat(2,minmax(0,1fr))!important}.fiq-job-directions{font-size:11px!important;padding:5px 7px!important}.fiq-room-scan-progress>div:first-child{align-items:flex-start;flex-direction:column;gap:2px}}
    `;
    document.head.appendChild(style);
  }

  var busy=false;
  function apply(){
    if(busy)return;
    busy=true;
    try{
      addCss();
      wrapCuttingListRender();
      cleanRoomDetail();
      addDirectionsToJobCards();
      decorateJobProgress();
      polishScanNav();
      addHowItWorksBack();
      decorateCuttingList();
    }finally{busy=false}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  var timer=null;
  new MutationObserver(function(){clearTimeout(timer);timer=setTimeout(apply,30)}).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('pageshow',apply);
})();
