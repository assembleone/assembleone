(function(){
  'use strict';

  function fixScanBar(){
    var nav=document.querySelector('.nav.scan-main');
    if(!nav)return;

    nav.classList.add('fiq-fixed-scan-nav');

    if(!nav.querySelector('.fiq-fixed-scan-label')){
      var label=document.createElement('span');
      label.className='fiq-fixed-scan-label';
      label.textContent='Scan';
      nav.appendChild(label);
    }

    if(!nav.dataset.fiqScanLaunchFixed){
      nav.dataset.fiqScanLaunchFixed='1';
      var original=nav.onclick;
      nav.onclick=function(e){
        if(typeof original==='function')original.call(nav,e);
        setTimeout(function(){
          var scan=document.getElementById('scan');
          var start=document.getElementById('startScanner');
          var cameraWrap=document.getElementById('cameraWrap');
          if(scan&&scan.classList.contains('active')&&start&&!start.classList.contains('hidden')){
            if(!cameraWrap||cameraWrap.classList.contains('hidden'))start.click();
          }
        },80);
      };
    }
  }

  function addStyle(){
    if(document.getElementById('fiqBuild86ScanFixStyles'))return;
    var s=document.createElement('style');
    s.id='fiqBuild86ScanFixStyles';
    s.textContent=`
      .fitters-bottom-nav .scan-main>span:not(.fiq-fixed-scan-label),
      .modern-bottom-nav .scan-main>span:not(.fiq-fixed-scan-label){display:none!important}
      .fitters-bottom-nav .scan-main .fiq-fixed-scan-label,
      .modern-bottom-nav .scan-main .fiq-fixed-scan-label{
        display:block!important;
        position:relative!important;
        z-index:3!important;
        margin-top:1px!important;
        color:#68BE3F!important;
        font-size:11px!important;
        font-weight:950!important;
        line-height:1.05!important;
        white-space:nowrap!important;
      }
    `;
    document.head.appendChild(s);
  }

  function apply(){addStyle();fixScanBar()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  new MutationObserver(function(){setTimeout(apply,0)}).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('pageshow',apply);
})();
