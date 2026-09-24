(function(){
  'use strict';

  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

  function currentKey(){
    try{
      var st=JSON.parse(localStorage.getItem('assembleone_mobile_v2')||'{}');
      if(!st.currentProject)return '';
      return String(st.currentProject)+(st.currentRoom?'::'+String(st.currentRoom):'');
    }catch(e){return ''}
  }

  function jobRows(){
    return Array.from(document.querySelectorAll('#jobList .job')).map(function(card){
      var open=card.querySelector('.open-job[data-card-key]');
      if(!open)return null;
      var title=(card.querySelector('.job-title')||{}).textContent||'Job';
      var room=(card.querySelector('.job-room-name')||{}).textContent||'';
      var meta=(card.querySelector('.job-meta')||{}).textContent||'';
      var customer=meta.split('\n').map(function(x){return x.trim()}).filter(Boolean)[0]||'';
      return {key:open.dataset.cardKey,title:title.trim(),room:room.trim(),customer:customer.trim(),open:open};
    }).filter(Boolean);
  }

  function closeSheet(){var el=document.getElementById('fiqSwitchJobSheet');if(el)el.remove()}

  function openSwitchJob(){
    closeSheet();
    var rows=jobRows();
    var active=currentKey();
    var overlay=document.createElement('div');
    overlay.id='fiqSwitchJobSheet';
    overlay.className='fiq-switch-job-overlay';
    var items=rows.length?rows.map(function(r){
      var isActive=r.key===active;
      return '<button type="button" class="fiq-switch-job-item'+(isActive?' active':'')+'" data-key="'+esc(r.key)+'">'+
        '<span class="fiq-switch-job-main"><strong>'+esc(r.title)+'</strong>'+(r.room?'<b>'+esc(r.room)+'</b>':'')+(r.customer?'<small>'+esc(r.customer)+'</small>':'')+'</span>'+
        '<span class="fiq-switch-job-state">'+(isActive?'Working on':'Open')+'</span></button>';
    }).join(''):'<div class="fiq-switch-empty">No open jobs from Studio yet.</div>';
    overlay.innerHTML='<div class="fiq-switch-job-sheet" role="dialog" aria-modal="true" aria-label="Switch job">'+
      '<div class="fiq-switch-job-head"><div><small>FITTERSIQ MOBILE</small><h2>Switch Job</h2></div><button type="button" class="fiq-switch-close" aria-label="Close">×</button></div>'+
      '<div class="fiq-switch-job-list">'+items+'</div></div>';
    overlay.addEventListener('click',function(e){if(e.target===overlay||e.target.closest('.fiq-switch-close'))closeSheet()});
    overlay.querySelectorAll('.fiq-switch-job-item').forEach(function(btn){
      btn.addEventListener('click',function(){
        var key=btn.dataset.key;
        var row=rows.find(function(r){return r.key===key});
        closeSheet();
        if(row&&row.open)row.open.click();
      });
    });
    document.body.appendChild(overlay);
  }

  function cleanJobsScreen(){
    var importRow=document.getElementById('jobsImportRow');
    if(importRow){
      var original=importRow.querySelector('.mobile-import-project');
      if(original)original.style.display='none';
      var btn=document.getElementById('fiqSwitchJobBtn');
      if(!btn){
        btn=document.createElement('button');
        btn.type='button';
        btn.id='fiqSwitchJobBtn';
        btn.className='fiq-switch-job-btn';
        btn.innerHTML='<span>⇄</span><strong>Switch Job</strong>';
        btn.addEventListener('click',openSwitchJob);
        importRow.appendChild(btn);
      }
    }
    document.querySelectorAll('.mobile-open-jobs-head,.mobile-open-jobs-help,.mobile-bulk-toolbar').forEach(function(el){el.style.display='none'});
    document.querySelectorAll('.mobile-job-select').forEach(function(el){el.remove()});
    document.querySelectorAll('#jobList .job.mobile-job-selected').forEach(function(el){el.classList.remove('mobile-job-selected')});
  }

  function addCss(){
    if(document.getElementById('fiqBuild88JobsStyles'))return;
    var s=document.createElement('style');
    s.id='fiqBuild88JobsStyles';
    s.textContent=`
      #jobsImportRow{margin:0 0 10px!important}
      #fiqSwitchJobBtn{width:100%;min-height:52px;border:2px solid #6BBF3A;border-radius:15px;background:#f4fbea;color:#0B2545;display:flex;align-items:center;justify-content:center;gap:9px;font:inherit;font-weight:900;font-size:18px;box-shadow:0 4px 12px rgba(11,37,69,.06)}
      #fiqSwitchJobBtn span{font-size:23px;color:#4e9d28;line-height:1}
      .mobile-job-select,.mobile-bulk-toolbar{display:none!important}
      .fiq-switch-job-overlay{position:fixed;inset:0;z-index:12000;background:rgba(5,18,34,.52);display:flex;align-items:flex-end;justify-content:center;padding:12px}
      .fiq-switch-job-sheet{width:min(560px,100%);max-height:78vh;overflow:auto;background:#f7f9fc;border-radius:22px 22px 16px 16px;padding:16px;box-shadow:0 -10px 35px rgba(0,0,0,.25)}
      .fiq-switch-job-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
      .fiq-switch-job-head small{display:block;color:#6BBF3A;font-weight:950;font-size:10px;letter-spacing:1px}
      .fiq-switch-job-head h2{margin:2px 0 0;color:#0B2545;font-size:25px}
      .fiq-switch-close{width:42px;height:42px;border:0;border-radius:50%;background:#fff;color:#0B2545;font-size:28px;line-height:1;box-shadow:0 2px 8px rgba(0,0,0,.10)}
      .fiq-switch-job-list{display:grid;gap:9px}
      .fiq-switch-job-item{width:100%;border:2px solid #dce3eb;border-radius:15px;background:#fff;color:#0B2545;padding:12px 13px;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;font:inherit}
      .fiq-switch-job-item.active{border-color:#6BBF3A;background:#f1faeb}
      .fiq-switch-job-main{min-width:0;display:grid;gap:2px}
      .fiq-switch-job-main strong{font-size:18px}.fiq-switch-job-main b{font-size:14px;color:#174E98}.fiq-switch-job-main small{font-size:12px;color:#6D7D91}
      .fiq-switch-job-state{flex:none;border-radius:999px;background:#eef4fb;color:#174E98;padding:6px 9px;font-size:11px;font-weight:900}
      .fiq-switch-job-item.active .fiq-switch-job-state{background:#dff3d2;color:#34791d}
      .fiq-switch-empty{padding:22px;text-align:center;color:#6D7D91;font-weight:800}
    `;
    document.head.appendChild(s);
  }

  function apply(){addCss();cleanJobsScreen()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  var timer=null;
  new MutationObserver(function(){clearTimeout(timer);timer=setTimeout(apply,25)}).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('pageshow',apply);
})();
