/* FittersIQ Studio: compact header for narrow windows (Mads, 12 Nov 2026).
   In a half-screen window (for example Studio next to SketchUp) the right side of the header stacked into three rows
   (Saved, How It Works, then the bell / search / Signed in / language / sign out bar), was taller than the header and hung
   down over the drawing toolbar. Now, only when the header does not fit, everything stays on ONE row inside the header:
   Saved, bell, search and a menu button; the menu button folds out How It Works, Signed in, the language and Sign out.
   Wide windows look exactly as before. This file changes no Studio data and does not touch the Studio core. */
(function(){
  if(window.__fiqHeaderCompact)return;window.__fiqHeaderCompact=true;
  var css=document.createElement('style');css.id='fiq-header-compact-style';
  css.textContent=
    '.header-right.fiq-hdr-compact{flex-direction:row!important;align-items:center!important;gap:8px!important;flex-wrap:nowrap!important}'+
    '.header-right.fiq-hdr-compact .header-right-stack{flex-direction:row-reverse!important;align-items:center!important;gap:8px!important}'+
    '.fiq-topbar-account{position:relative}'+
    '.fiq-more-btn{display:none;border:1px solid #d7dfea;background:#f6f9ff;border-radius:10px;min-width:40px;min-height:36px;font-size:18px;font-weight:900;color:#0b2545;cursor:pointer;line-height:1;padding:0 10px}'+
    '.fiq-more-btn:hover,.fiq-more-btn[aria-expanded="true"]{border-color:#0051ff;background:#eef3ff}'+
    '.fiq-hdr-compact .fiq-more-btn{display:inline-flex;align-items:center;justify-content:center}'+
    '.fiq-more-panel{display:none;position:absolute;top:calc(100% + 8px);right:0;z-index:1200;flex-direction:column;align-items:stretch;gap:10px;min-width:250px;background:#fff;border:1px solid #d7dfea;border-radius:14px;box-shadow:0 14px 32px rgba(18,35,59,.20);padding:12px}'+
    '.fiq-more-panel.open{display:flex}'+
    '.fiq-more-panel .fiq-topbar-who{border-right:0!important;padding-right:0!important;max-width:none!important}'+
    '.fiq-more-panel #fiqStudioHelpBtn{margin:0!important;width:100%;justify-content:center}'+
    '.fiq-more-panel .fiq-lang-chip{width:100%!important;justify-content:space-between}'+
    '.fiq-more-panel .fiq-account-badge{justify-content:flex-start}';
  document.head.appendChild(css);

  function setup(){
    var tb=document.getElementById('fiqTopbarAccount'),right=document.querySelector('.app>.header .header-right'),header=document.querySelector('.app>.header');
    if(!tb||!right||!header)return setTimeout(setup,300);
    var items=[document.getElementById('fiqStudioHelpBtn'),tb.querySelector('.fiq-topbar-who'),document.getElementById('fiqLangWrap'),document.getElementById('fiqAccountBadge')].filter(Boolean);
    var home=items.map(function(el){return {el:el,parent:el.parentNode,next:el.nextSibling}});   // where each item lives in the full header
    var more=document.createElement('button');more.type='button';more.id='fiqMoreBtn';more.className='fiq-more-btn';more.title='More';more.setAttribute('aria-label','More: How It Works, account and language');more.setAttribute('aria-expanded','false');more.innerHTML='<span aria-hidden="true">&#9776;</span>';
    var panel=document.createElement('div');panel.id='fiqMorePanel';panel.className='fiq-more-panel';
    tb.appendChild(more);tb.appendChild(panel);
    var compact=false;
    function close(){panel.classList.remove('open');more.setAttribute('aria-expanded','false')}
    function full(){
      if(!compact)return;close();
      for(var i=home.length-1;i>=0;i--){var h=home[i];if(h.next&&h.next.parentNode===h.parent)h.parent.insertBefore(h.el,h.next);else h.parent.appendChild(h.el)}
      right.classList.remove('fiq-hdr-compact');compact=false;
    }
    function fold(){
      if(compact)return;
      items.forEach(function(el){panel.appendChild(el)});
      right.classList.add('fiq-hdr-compact');compact=true;
    }
    // Fold only when the full header really does not fit: taller than the header bar, or wider than the window.
    function fits(){var r=right.getBoundingClientRect(),h=header.getBoundingClientRect();return r.top>=h.top-1&&r.bottom<=h.bottom+1&&r.right<=window.innerWidth+1}
    function check(){full();if(!fits())fold()}
    var t=0;function later(){clearTimeout(t);t=setTimeout(check,120)}
    more.addEventListener('click',function(e){e.stopPropagation();var o=!panel.classList.contains('open');panel.classList.toggle('open',o);more.setAttribute('aria-expanded',o?'true':'false')});
    document.addEventListener('click',function(e){if(panel.classList.contains('open')&&!panel.contains(e.target)&&e.target!==more)close()});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
    window.addEventListener('resize',later);
    // things in the header change size after sign-in, a language change or a save (Saved chip): check again
    if(window.ResizeObserver){var ro=new ResizeObserver(function(){if(!compact)later()});ro.observe(right)}
    check();setTimeout(check,800);setTimeout(check,2500);
    window.fiqHeaderCompactCheck=check;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
