(function(){
  'use strict';

  function goHome(){
    try{
      if(typeof window.show==='function'){
        window.show('jobs');
        if(typeof window.renderAll==='function')window.renderAll();
        window.scrollTo({top:0,behavior:'smooth'});
      }
    }catch(e){console.error('FittersIQ home navigation failed',e)}
  }

  function wireLogoHome(){
    var logo=document.querySelector('.header-logo');
    if(!logo||logo.dataset.fiqHomeWired==='1')return;
    logo.dataset.fiqHomeWired='1';
    logo.setAttribute('role','button');logo.setAttribute('tabindex','0');logo.setAttribute('aria-label','Home');logo.setAttribute('title','Home');logo.style.cursor='pointer';
    logo.addEventListener('click',goHome);
    logo.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();goHome()}});
  }

  function removeDocumentsTab(){
    document.querySelectorAll('.customer-tab[data-tab="documents"]').forEach(function(el){el.remove()});
    document.querySelectorAll('.customer-tab-panel[data-tab-panel="documents"]').forEach(function(el){el.remove()});
  }

  function projectById(id){
    try{if(typeof state!=='undefined'&&state&&Array.isArray(state.projects))return state.projects.find(function(p){return String(p.id)===String(id)})||null}catch(e){}
    return null;
  }

  function currentCustomerProjects(){
    try{
      var customerId=state.currentCustomerCard;
      if(!customerId)return [];
      return (state.projects||[]).filter(function(p){return String(p.customerId||'')===String(customerId)}).sort(function(a,b){return (b.updatedAt||0)-(a.updatedAt||0)});
    }catch(e){return []}
  }

  function panelQtyForCabinets(cabinets){
    return (cabinets||[]).reduce(function(total,c){
      return total+(c.parts||[]).reduce(function(sum,pt){return sum+Math.max(1,Number(pt.qty)||1)},0);
    },0);
  }

  function cuttingListRows(){
    var rows=[];
    currentCustomerProjects().forEach(function(p){
      var rooms=(p.rooms||[]).filter(function(r){return r&&r.id});
      rooms.forEach(function(room){
        var cabinets=(p.cabinets||[]).filter(function(c){return String(c.roomId||'')===String(room.id)});
        if(!cabinets.length)return;
        var qty=panelQtyForCabinets(cabinets);
        if(!qty)return;
        rows.push({project:p,room:room,qty:qty,label:room.name||cabinets[0].name||p.name||'Job'});
      });
      var unroomed=(p.cabinets||[]).filter(function(c){return !c.roomId});
      if(unroomed.length){
        var qty=panelQtyForCabinets(unroomed);
        if(qty)rows.push({project:p,room:null,qty:qty,label:p.name||unroomed[0].name||'Job'});
      }
    });
    return rows;
  }

  function openCutting(projectId,roomId){
    try{
      if(typeof openCuttingListForRoom==='function'){
        openCuttingListForRoom(projectId,roomId||'');
        return;
      }
    }catch(e){console.error('Could not open Cutting List',e)}
  }

  function addCustomerCuttingListTab(){
    var tabs=document.querySelector('.customer-card-tabs');
    if(!tabs||tabs.querySelector('.fiq-cutting-tab'))return;
    var photos=tabs.querySelector('.customer-tab[data-tab="photos"]');
    var btn=document.createElement('button');
    btn.type='button';
    btn.className='customer-tab fiq-cutting-tab';
    btn.setAttribute('role','tab');
    btn.setAttribute('aria-selected','false');
    btn.textContent='Cutting List';
    if(photos&&photos.nextSibling)tabs.insertBefore(btn,photos.nextSibling);else tabs.appendChild(btn);

    var panel=document.createElement('div');
    panel.className='customer-tab-panel fiq-cutting-panel';
    panel.hidden=true;
    var existingPanels=document.querySelectorAll('.customer-tab-panel');
    var anchor=existingPanels.length?existingPanels[existingPanels.length-1]:null;
    if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(panel,anchor.nextSibling);
    else tabs.parentNode.appendChild(panel);

    function renderPanel(){
      var rows=cuttingListRows();
      if(!rows.length){panel.innerHTML='<div class="empty">No cutting lists saved for this customer yet.</div>';return}
      panel.innerHTML='<div class="fiq-cutting-intro"><strong>Cutting Lists</strong><span>Open a job to see every panel measurement and its QR labels.</span></div>'+rows.map(function(item){
        return '<button type="button" class="fiq-cutting-row" data-fiq-cut-project="'+String(item.project.id)+'" data-fiq-cut-room="'+String(item.room?item.room.id:'')+'">'+
          '<span class="fiq-cut-icon">📋</span><span class="fiq-cut-main"><strong>'+escapeHtml(item.label)+'</strong><small>'+item.qty+' panel'+(item.qty===1?'':'s')+' · measurements · QR labels</small></span><span class="fiq-cut-open">Open ›</span></button>';
      }).join('');
      panel.querySelectorAll('[data-fiq-cut-project]').forEach(function(row){
        row.addEventListener('click',function(){openCutting(row.getAttribute('data-fiq-cut-project'),row.getAttribute('data-fiq-cut-room'))});
      });
    }

    function activate(){
      renderPanel();
      tabs.querySelectorAll('.customer-tab').forEach(function(x){x.classList.remove('active');x.setAttribute('aria-selected','false')});
      document.querySelectorAll('.customer-tab-panel').forEach(function(x){x.hidden=true});
      btn.classList.add('active');btn.setAttribute('aria-selected','true');panel.hidden=false;
    }
    btn.addEventListener('click',activate);
  }

  function escapeHtml(value){
    return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]});
  }

  function addGeneralSiteNote(notesPanel,p){
    if(!p)return;
    var text=String(p.siteNotes||p.siteRoomNotes||'').trim();
    if(!text)return;
    if(notesPanel.querySelector('.fiq-site-general-note[data-project-id="'+CSS.escape(String(p.id))+'"]'))return;
    var row=document.createElement('div');row.className='customer-tab-row fiq-site-note-link fiq-site-general-note';row.dataset.projectId=String(p.id);row.style.cursor='default';
    row.innerHTML='<span class="customer-tab-row-icon">📝</span><span class="customer-tab-row-main"><strong>Site note</strong><span class="customer-tab-row-sub"></span></span>';
    var sub=row.querySelector('.customer-tab-row-sub');if(sub)sub.textContent=text;notesPanel.appendChild(row);
  }

  function mirrorSiteNotesIntoNotesTab(){
    var notesPanel=document.querySelector('.customer-tab-panel[data-tab-panel="notes"]');
    var sitePanel=document.querySelector('.customer-tab-panel[data-tab-panel="site"]');
    if(!notesPanel||!sitePanel)return;
    notesPanel.querySelectorAll('.fiq-site-note-link').forEach(function(el){el.remove()});
    var siteRows=Array.from(sitePanel.querySelectorAll('.customer-tab-row[data-open-site-room]'));
    if(!siteRows.length)return;
    var existingKeys=new Set(Array.from(notesPanel.querySelectorAll('[data-job-notes-room]')).map(function(el){return String(el.getAttribute('data-job-notes-room')||'')+'::'+String(el.getAttribute('data-job-notes')||'')}));
    var seenProjects=new Set();
    siteRows.forEach(function(row){
      var roomId=String(row.getAttribute('data-open-site-room')||''),projectId=String(row.getAttribute('data-open-site-room-project')||''),p=projectById(projectId);
      if(p&&!seenProjects.has(projectId)){seenProjects.add(projectId);addGeneralSiteNote(notesPanel,p)}
      var room=p&&Array.isArray(p.rooms)?p.rooms.find(function(r){return String(r.id)===roomId}):null;
      var noteText=String(room&&(room.notes||room.siteRoomNotes)||'').trim();var notePhotos=room&&Array.isArray(room.notePhotos)?room.notePhotos.length:0;
      if(!noteText&&!notePhotos)return;if(existingKeys.has(roomId+'::'+projectId))return;
      var clone=row.cloneNode(true);clone.classList.add('fiq-site-note-link');clone.setAttribute('title','Open site note for this room');
      var main=clone.querySelector('.customer-tab-row-main');if(main){var label=document.createElement('span');label.className='customer-tab-row-sub fiq-site-note-label';label.textContent=noteText?noteText:(notePhotos+' note photo'+(notePhotos===1?'':'s'));main.appendChild(label)}
      notesPanel.appendChild(clone);
    });
  }

  function roomIdForOverviewRow(row){
    var raw=String(row.getAttribute('data-card-room-id')||'');
    if(!raw||raw==='__general__'||raw==='__site_visit__')return null;
    return raw;
  }

  function updateCountFor(projectId,roomId){
    var p=projectById(projectId);if(!p)return 0;
    try{if(typeof jobLogEntriesForRoom==='function')return jobLogEntriesForRoom(p,roomId).length}catch(e){}
    var log=Array.isArray(p.jobLog)?p.jobLog:[];
    if(roomId)return log.filter(function(en){return String(en.roomId||'')===String(roomId)}).length;
    return log.filter(function(en){return !en.roomId}).length;
  }

  function openSiteUpdates(projectId,roomId){
    try{
      if(typeof openJobNotesDialog==='function'){
        openJobNotesDialog(projectId,roomId||null);
        var sheet=document.querySelector('.job-notes-dialog-sheet');
        if(sheet){var h=sheet.querySelector('h2');if(h)h.textContent='Site Updates'}
      }
    }catch(e){console.error('Could not open Site Updates',e)}
  }

  function polishOverviewCards(){
    document.querySelectorAll('.job-overview-row[data-open-job-card]').forEach(function(row){
      var projectId=String(row.getAttribute('data-open-job-card')||'');if(!projectId)return;
      var roomId=roomIdForOverviewRow(row),count=updateCountFor(projectId,roomId);
      row.querySelectorAll('.fiq-site-updates-btn').forEach(function(x){x.remove()});
      var main=row.querySelector('.jor-main'),room=row.querySelector('.jor-room'),name=row.querySelector('.jor-name'),summary=row.querySelector('.jor-summary-line');
      if(main&&room&&name&&room.previousElementSibling!==null){main.insertBefore(room,name)}
      if(summary)summary.style.display='none';
      var completion=row.querySelector('.jor-completion');
      if(completion){
        completion.className='jor-stat fiq-site-update-stat';
        completion.setAttribute('role','button');completion.setAttribute('tabindex','0');completion.setAttribute('title','Open Site Updates');
        completion.innerHTML='<div class="jor-stat-label">Site Updates</div><div class="jor-stat-value">'+count+'</div>';
        if(count)completion.classList.add('has-updates');
        var open=function(e){e.preventDefault();e.stopPropagation();openSiteUpdates(projectId,roomId)};
        completion.onclick=open;completion.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){open(e)}};
      }
    });
  }

  function addStyles(){
    if(document.getElementById('fiqStudioPatchStyles'))return;
    var style=document.createElement('style');style.id='fiqStudioPatchStyles';
    style.textContent=`
      .job-overview-row{padding:12px 44px 12px 12px!important}
      .jor-card-top{align-items:center!important;gap:11px!important}
      .jor-thumb{width:62px!important;height:62px!important;border-radius:12px!important;flex:0 0 62px!important}
      .jor-main{display:flex!important;flex-direction:column!important;justify-content:center!important}
      .jor-room{font-size:17px!important;font-weight:900!important;color:#0B2545!important;order:0!important}
      .jor-name{font-size:12px!important;color:#66778b!important;font-weight:750!important;order:1!important}
      .jor-summary-line{display:none!important}
      .jor-top-actions{display:flex!important;align-items:center!important;gap:7px!important;margin-left:auto!important}
      .jor-completed-badge{min-width:108px!important;padding:6px 9px!important;border-radius:11px!important;font-size:9px!important;line-height:1.05!important}
      .jor-completed-badge b{font-size:11px!important;margin-top:2px!important}
      .jor-library-slim{min-height:34px!important;padding:6px 11px!important;border-radius:10px!important;font-size:11px!important;width:auto!important;min-width:110px!important}
      .jor-delete-job{width:34px!important;height:34px!important;min-width:34px!important;padding:0!important;margin-left:2px!important;border-radius:9px!important}
      .jor-fitter{margin-top:5px!important;margin-left:73px!important}
      .jor-fitter .fitter-row{display:grid!important;grid-template-columns:minmax(118px,170px) minmax(190px,1fr)!important;gap:8px!important;align-items:center!important;width:100%!important}
      .jor-fitter .fitter-send-mobile-btn{min-height:36px!important;padding:6px 11px!important;border-radius:10px!important;font-size:12px!important;width:auto!important}
      .jor-fitter .fitter-select{min-height:36px!important;padding:6px 10px!important;font-size:12px!important}
      .jor-card-whatsapp{left:20px!important;top:86px!important;width:34px!important;height:34px!important}
      .jor-card-metrics{margin:9px 0 0 73px!important;grid-template-columns:repeat(4,minmax(92px,1fr))!important;gap:8px!important;align-items:stretch!important}
      .jor-card-metrics>.jor-stat{background:#f8fbff!important;border:1px solid #d9e5f2!important;border-radius:11px!important;padding:7px 8px!important;min-height:66px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important}
      .jor-card-metrics .jor-stat-label{font-size:10px!important;line-height:1.05!important}
      .jor-card-metrics .jor-stat-value{font-size:18px!important;line-height:1.1!important;margin-top:3px!important}
      .jor-card-metrics .jor-bar{width:100%!important;margin-top:5px!important}
      .jor-card-metrics .jor-stat-pct{font-size:9px!important}
      .fiq-site-update-stat{cursor:pointer!important;border-color:#b6dca3!important;background:#f5fbf1!important}
      .fiq-site-update-stat.has-updates{border-color:#69b949!important;background:#eef9e8!important}
      .fiq-site-update-stat.has-updates .jor-stat-label,.fiq-site-update-stat.has-updates .jor-stat-value{color:#347d18!important}
      .fiq-cutting-tab{font-weight:900!important}
      .fiq-cutting-intro{display:flex;flex-direction:column;gap:3px;margin-bottom:10px;padding:11px 13px;border:1px solid #b8dba4;border-radius:12px;background:#f5fbf1}.fiq-cutting-intro strong{font-size:16px;color:#0B2545}.fiq-cutting-intro span{font-size:12px;color:#5B6B7C;font-weight:700}
      .fiq-cutting-row{width:100%;display:grid;grid-template-columns:38px minmax(0,1fr) auto;align-items:center;gap:10px;text-align:left;border:1px solid #d6e3ef;border-radius:12px;background:#fff;padding:11px 12px;margin-bottom:8px;color:#0B2545}
      .fiq-cutting-row:hover{border-color:#69b949;background:#f8fff5}.fiq-cut-icon{font-size:23px;text-align:center}.fiq-cut-main{display:flex;flex-direction:column;gap:3px;min-width:0}.fiq-cut-main strong{font-size:15px}.fiq-cut-main small{font-size:11px;color:#5B6B7C;font-weight:700}.fiq-cut-open{font-size:12px;font-weight:900;color:#347d18;white-space:nowrap}
      @media(max-width:900px){
        .jor-card-top{grid-template-columns:68px minmax(0,1fr) auto!important}
        .jor-thumb{width:58px!important;height:58px!important;flex-basis:58px!important}
        .jor-fitter{margin-left:72px!important}
        .jor-card-whatsapp{left:19px!important;top:82px!important;width:32px!important;height:32px!important}
        .jor-card-metrics{margin-left:72px!important;grid-template-columns:repeat(4,minmax(74px,1fr))!important}
      }
      @media(max-width:600px){
        .job-overview-row{padding-right:36px!important}
        .jor-card-top{grid-template-columns:58px minmax(0,1fr)!important}
        .jor-thumb{width:52px!important;height:52px!important;flex-basis:52px!important}
        .jor-top-actions{grid-column:2!important;grid-row:2!important;justify-content:flex-start!important;flex-wrap:wrap!important}
        .jor-fitter{grid-column:2!important;grid-row:3!important;margin-left:0!important}
        .jor-fitter .fitter-row{grid-template-columns:1fr!important}
        .jor-card-whatsapp{left:15px!important;top:72px!important;width:30px!important;height:30px!important}
        .jor-card-metrics{margin-left:0!important;grid-template-columns:repeat(2,minmax(0,1fr))!important}
      }
    `;
    document.head.appendChild(style);
  }

  var applying=false;
  function apply(){
    if(applying)return;applying=true;
    try{addStyles();wireLogoHome();removeDocumentsTab();addCustomerCuttingListTab();mirrorSiteNotesIntoNotesTab();polishOverviewCards()}finally{applying=false}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  var timer=null;new MutationObserver(function(){clearTimeout(timer);timer=setTimeout(apply,25)}).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('pageshow',apply);
})();
