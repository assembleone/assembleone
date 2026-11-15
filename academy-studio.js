/* FittersIQ Studio: the Academy button and page (Academy in Studio and Mobile, Stage 3, 10 Nov 2026). STAGING ONLY for now (loaded by staging/Studio.html).
   - Adds one square "Academy" button under Cutting List in the left sidebar, in the same style as the other buttons (the selected one is highlighted by Studio's
     own .nav-btn.active style). The icon is a PLACEHOLDER (navy square, graduation cap, small green QR squares) until Mads supplies the final Academy icon.
   - Adds one Studio screen, #screen-academy, switched by Studio's own show() like every other screen, so Studio's Back/Forward keep working.
   - The page shows the two Studio videos of "Getting Started with FittersIQ" (included with the software) and one button into the full Academy, which opens
     in its own tab on the same address, already signed in with the same FittersIQ login.
   - It never reads or changes jobs, cutting lists, settings or anything else Studio keeps. If the Academy cannot be reached, only this page says so. */
(function () {
  if (window.__fiqAcademyStudio) return; window.__fiqAcademyStudio = true;
  var ICON = '<svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true" focusable="false"><rect x="1" y="1" width="30" height="30" rx="7" fill="#0b2545"/>' +
    '<path d="M16 8 4.5 13 16 18l11.5-5z" fill="#fff"/><path d="M9 15.3v4.4c0 1.8 3.1 3.3 7 3.3s7-1.5 7-3.3v-4.4L16 18.4z" fill="#fff" opacity=".85"/>' +
    '<path d="M26 13.6v5.2" stroke="#fff" stroke-width="1.4"/>' +
    '<rect x="21.5" y="21.5" width="3" height="3" fill="#22c55e"/><rect x="25.5" y="21.5" width="3" height="3" fill="#22c55e"/><rect x="25.5" y="25.5" width="3" height="3" fill="#22c55e"/><rect x="21.5" y="25.5" width="1.6" height="1.6" fill="#22c55e"/></svg>';
  var HREF = '/academy/members/';
  var viewMod = null, renderedAt = 0;

  function css() {
    if (document.getElementById('fiq-academy-studio-css')) return;
    var s = document.createElement('style'); s.id = 'fiq-academy-studio-css';
    s.textContent = '.nav-btn.fiq-academy-nav .nav-colour-icon{display:inline-grid;place-items:center}.nav-btn.fiq-academy-nav svg{display:block}' +
      '#screen-academy{padding:18px 22px 40px}#screen-academy .fiqa-loading{color:#475569;font:15px Inter,Segoe UI,Arial,sans-serif;padding:20px}' +
      // the whole Academy inside Studio (12 Nov 2026, Mads): the members area fills the Academy screen, signed in with the same login
      '#screen-academy.fiqa-full{padding:8px 10px 10px}#screen-academy .fiqa-frame{display:block;width:100%;height:calc(100vh - 150px);min-height:520px;border:0;border-radius:14px;background:#fff;box-shadow:0 2px 10px rgba(11,37,69,.08)}';
    document.head.appendChild(s);
  }
  function loadView() {
    if (viewMod) return Promise.resolve(viewMod);
    return import(HREF + 'included-view.js').then(function (m) { viewMod = m; return m; });
  }
  function render(force) {
    var host = document.getElementById('fiqAcademyHost'); if (!host) return;
    if (!force && renderedAt && Date.now() - renderedAt < 60000 && host.firstChild) return;   // reopening within a minute keeps the page (and a playing video) as it was
    renderedAt = Date.now();
    host.innerHTML = '<div class="fiqa-loading">Opening FittersIQ Academy&hellip;</div>';
    var sec = document.getElementById('screen-academy'); if (sec) sec.classList.remove('fiqa-full');
    loadView().then(function (m) {
      // Someone with Academy access (a member, or the FittersIQ team) gets the WHOLE Academy right here in Studio, like Mobile (12 Nov 2026, Mads).
      return m.renderIncluded(host, { app: 'studio', mode: 'app', academyHref: HREF, call: m.appCaller(window.fiqAuth), openAcademy: function (href) { showFull(href); } })
        .then(function (d) { if (d && (d.member || d.staff)) showFull(HREF); });
    }).catch(function () {
      renderedAt = 0;
      host.innerHTML = '<div class="fiqa-loading">The Academy could not be opened just now. Your Studio work is not affected. Please check the internet connection and try again. <button type="button" id="fiqAcademyRetry">Try again</button></div>';
      var r = document.getElementById('fiqAcademyRetry'); if (r) r.onclick = function () { render(true); };
    });
  }
  // The members area in a frame on the same address: same login; Library, Gallery, Community, Training videos, all of it, without leaving Studio.
  function showFull(href) {
    var host = document.getElementById('fiqAcademyHost'), sec = document.getElementById('screen-academy'); if (!host) return;
    if (sec) sec.classList.add('fiqa-full');
    host.innerHTML = '<iframe class="fiqa-frame" title="FittersIQ Academy" src="' + String(href || HREF).replace(/"/g, '') + '" allow="autoplay; fullscreen; picture-in-picture"></iframe>';
  }
  function init() {
    var side = document.querySelector('aside.sidebar'), cut = side && side.querySelector('.nav-btn[data-screen="cutting"]'), main = document.querySelector('main.main');
    if (!side || !cut || !main || typeof window.show !== 'function') return setTimeout(init, 300);
    if (side.querySelector('.nav-btn[data-screen="academy"]')) return;
    css();
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'nav-btn fiq-academy-nav'; btn.dataset.screen = 'academy'; btn.title = 'FittersIQ Academy'; btn.setAttribute('aria-label', 'FittersIQ Academy');
    btn.innerHTML = '<span class="nav-colour-icon">' + ICON + '</span><span class="nav-word">Academy</span>';
    cut.insertAdjacentElement('afterend', btn);
    var sec = document.createElement('section'); sec.className = 'screen'; sec.id = 'screen-academy'; sec.innerHTML = '<div id="fiqAcademyHost"></div>';
    main.appendChild(sec);
    // Remember the Studio screen before the Academy, so the Academy's "Back to Studio" button returns there (14 Nov 2026).
    var before = 'jobs';
    btn.onclick = function () { try { if (state && state.screen && state.screen !== 'academy') before = state.screen; } catch (e) { /* no state yet */ } window.show('academy'); };
    window.fiqLeaveAcademy = function () { window.show(before || 'jobs'); };
    // Studio's own show() switches the screen (button, Back, Forward, a reload that remembers the screen); the page is drawn whenever it becomes visible.
    new MutationObserver(function () { if (sec.classList.contains('active')) render(false); }).observe(sec, { attributes: true, attributeFilter: ['class'] });
    try { if (typeof state !== 'undefined' && state && state.screen === 'academy') window.show('academy'); } catch (e) { /* no saved screen */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
