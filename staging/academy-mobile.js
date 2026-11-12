/* FittersIQ Mobile: the Academy button and page (Academy in Studio and Mobile, Stage 4, 10 Nov 2026). STAGING ONLY for now (loaded by staging/Mobile.html).
   - Adds one compact "Academy" button in the top bar next to the FittersIQ branding. The icon is a PLACEHOLDER until Mads supplies the final Academy icon.
   - Pressing it opens a full-screen Academy page ON TOP of Mobile (Mobile itself stays exactly where it was underneath, nothing is reloaded or changed).
     The page shows the two Mobile videos of "Getting Started with FittersIQ" (included with the software) and one button into the full Academy.
   - The phone's Back button, and the page's own Back button, close the page and return to the same place in Mobile.
   - It never reads or changes jobs, scans, photos or anything else Mobile keeps. Without internet only this page says so; Mobile keeps working offline. */
(function () {
  if (window.__fiqAcademyMobile) return; window.__fiqAcademyMobile = true;
  var ICON = '<svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true" focusable="false"><rect x="1" y="1" width="30" height="30" rx="7" fill="#0b2545"/>' +
    '<path d="M16 8 4.5 13 16 18l11.5-5z" fill="#fff"/><path d="M9 15.3v4.4c0 1.8 3.1 3.3 7 3.3s7-1.5 7-3.3v-4.4L16 18.4z" fill="#fff" opacity=".85"/>' +
    '<rect x="21.5" y="21.5" width="3" height="3" fill="#22c55e"/><rect x="25.5" y="21.5" width="3" height="3" fill="#22c55e"/><rect x="25.5" y="25.5" width="3" height="3" fill="#22c55e"/></svg>';
  var HREF = '/academy/members/';
  var viewMod = null, panel = null, openState = false;

  function css() {
    if (document.getElementById('fiq-academy-mobile-css')) return;
    var s = document.createElement('style'); s.id = 'fiq-academy-mobile-css';
    s.textContent =
      // a compact square button (icon with the word under it, like the Studio sidebar), so the top bar keeps room for everything it had before
      '.fiq-academy-btn{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;flex:0 0 auto;width:50px;min-height:46px;padding:3px 2px;margin:0 2px;border-radius:12px;border:1.5px solid #cfe9d8;background:#fff;color:#0b2545;font:800 9.5px/1 Inter,Segoe UI,Arial,sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
      '.fiq-academy-btn svg{display:block}.fiq-academy-btn:active{background:#dcfce7}' +
      '@media(max-width:370px){.fiq-academy-btn{width:44px}.fiq-academy-btn .fiq-ab-word{font-size:8.5px}}' +
      '#fiqAcademyPanel{position:fixed;inset:0;z-index:2147483000;background:#f4f7fb;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top) + 18px) 14px calc(env(safe-area-inset-bottom) + 24px)}' +
      '#fiqAcademyPanel[hidden]{display:none}' +
      '#fiqAcademyPanel .fiqa-top{display:flex;align-items:center;gap:8px;margin:0 0 6px}' +
      '#fiqAcademyPanel .fiqa-back{min-height:44px;padding:8px 14px;border-radius:12px;border:1.5px solid #cbd5e1;background:#fff;color:#0b2545;font:700 15px Inter,Segoe UI,Arial,sans-serif;cursor:pointer}' +
      '#fiqAcademyPanel .fiqa-loading{color:#475569;font:15px Inter,Segoe UI,Arial,sans-serif;padding:16px 4px}' +
      // the whole Academy inside Mobile (12 Nov 2026): the members area fills the page under the Back button, signed in with the same login
      '#fiqAcademyPanel.fiqa-full{overflow:hidden;display:flex;flex-direction:column;padding-left:0;padding-right:0;padding-bottom:0}' +
      '#fiqAcademyPanel.fiqa-full .fiqa-top{padding:0 14px}#fiqAcademyPanel.fiqa-full .fiqa-host{flex:1;min-height:0;display:flex}' +
      '#fiqAcademyPanel .fiqa-frame{flex:1;width:100%;height:100%;border:0;background:#fff}' +
      'body.fiq-academy-open{overflow:hidden}';
    document.head.appendChild(s);
  }
  function loadView() {
    if (viewMod) return Promise.resolve(viewMod);
    return import(HREF + 'included-view.js').then(function (m) { viewMod = m; return m; });
  }
  function draw() {
    var host = panel.querySelector('.fiqa-host');
    host.innerHTML = '<div class="fiqa-loading">Opening FittersIQ Academy&hellip;</div>';
    if (navigator.onLine === false) { host.innerHTML = '<div class="fiqa-loading">The Academy needs an internet connection. Your work in FittersIQ Mobile is not affected and keeps working offline. Please try again when you have signal.</div><button class="fiqa-back" type="button" data-again>Try again</button>'; host.querySelector('[data-again]').onclick = draw; return; }
    panel.classList.remove('fiqa-full');
    loadView().then(function (m) {
      // Someone with Academy access (a member, or the FittersIQ team) gets the WHOLE Academy right here, inside Mobile (12 Nov 2026, Mads):
      // a separate window would leave the app and, on an iPhone home-screen app, would not even share the sign-in.
      return m.renderIncluded(host, { app: 'mobile', mode: 'app', academyHref: HREF, call: m.appCaller(window.fiqAuth), openAcademy: function (href) { showFull(href); } })
        .then(function (d) { if (d && (d.member || d.staff) && openState) showFull(HREF); });
    }).catch(function () {
      host.innerHTML = '<div class="fiqa-loading">The Academy could not be opened just now. Your work in FittersIQ Mobile is not affected. Please try again in a moment.</div><button class="fiqa-back" type="button" data-again>Try again</button>';
      host.querySelector('[data-again]').onclick = draw;
    });
  }
  // The members area in a frame on the same address: same login, nothing to sign in again; Library, Gallery, Community, Training, all of it.
  function showFull(href) {
    var host = panel.querySelector('.fiqa-host');
    panel.classList.add('fiqa-full');
    host.innerHTML = '<iframe class="fiqa-frame" title="FittersIQ Academy" src="' + String(href || HREF).replace(/"/g, '') + '" allow="autoplay; fullscreen; picture-in-picture"></iframe>';
  }
  function open() {
    if (openState) return;
    if (!panel) {
      panel = document.createElement('div'); panel.id = 'fiqAcademyPanel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'FittersIQ Academy'); panel.hidden = true;
      panel.innerHTML = '<div class="fiqa-top"><button class="fiqa-back" type="button" data-close>&larr; Back to FittersIQ Mobile</button></div><div class="fiqa-host"></div>';
      document.body.appendChild(panel);
      // With the whole Academy shown, pages opened inside it are in the phone's history too, so a history step would only go back inside the Academy:
      // the button then closes it directly (the phone's own Back button still steps back through the Academy pages first).
      panel.querySelector('[data-close]').onclick = function () { if (!panel.classList.contains('fiqa-full') && history.state && history.state.fiqAcademy) history.back(); else close(); };
    }
    // on Staging the purple test banner sits on top of everything: start the page below it (on Production there is no banner)
    var sb = document.getElementById('fiqStagingBanner'); panel.style.paddingTop = 'calc(env(safe-area-inset-top) + ' + ((sb && sb.offsetHeight) ? sb.offsetHeight + 10 : 18) + 'px)';
    openState = true; panel.hidden = false; panel.scrollTop = 0; document.body.classList.add('fiq-academy-open');
    try { history.pushState(Object.assign({}, history.state || {}, { fiqAcademy: 1 }), ''); } catch (e) { /* no history */ }
    draw();
  }
  function close() {
    if (!openState) return;
    openState = false; panel.hidden = true; document.body.classList.remove('fiq-academy-open');
    panel.querySelector('.fiqa-host').innerHTML = '';   // stops a playing video
  }
  // The phone's Back button: our page closes and Mobile is where it was (Mobile's own Back handling sees the same step and simply stays on its screen).
  window.addEventListener('popstate', function (e) { if (openState && !(e.state && e.state.fiqAcademy)) close(); });
  function init() {
    var header = document.querySelector('header.fitters-header'), brand = header && header.querySelector('.brand');
    if (!header || !brand) return setTimeout(init, 300);
    if (header.querySelector('.fiq-academy-btn')) return;
    css();
    var b = document.createElement('button'); b.type = 'button'; b.className = 'fiq-academy-btn'; b.title = 'FittersIQ Academy'; b.setAttribute('aria-label', 'FittersIQ Academy: help and training');
    b.innerHTML = ICON + '<span class="fiq-ab-word">Academy</span>';
    b.onclick = open;
    brand.insertAdjacentElement('afterend', b);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.fiqOpenAcademy = open;   // for tests
})();
