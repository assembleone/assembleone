/* FittersIQ Studio Drawing: "+ Custom Part" (Mads, 18 Nov 2026). STAGING ONLY for now (loaded by staging/Studio.html).
   - A 4th quick button after Side, Top / Bottom and Back, in the same style. Chosen Parts is unchanged.
   - It opens a small box: type a name, or press the microphone and say it (only listens while pressed / until the word is heard),
     or pick one of the names used before on this computer (most used first, up to 60 kept, × forgets one).
   - "Use name" runs exactly what Side / Top / Bottom / Back run (Studio's own setPartName): with a panel selected it is renamed,
     with no panel selected the next dot placed gets the name. The panel then gets its sizes in the normal boxes.
   - The name is only the panel's normal name (p.name), so the Cutting List, Panel Check, the phone and every supplier export show it
     with no change anywhere else. First letter capitalised ("plinth" -> "Plinth"); extra spaces removed.
   - Voice uses the browser's own speech recognition (Chrome / Edge): the spoken word is turned into text by the browser maker's service.
     Windows' own dictation (Windows key + H) works too, in the same field. Nothing is saved from voice alone: the name still needs "Use name". */
(function () {
  'use strict';
  if (window.__fiqCustomPart) return; window.__fiqCustomPart = true;
  var KEY = 'fiq_custom_part_names_v1', MAX = 60, SHOW = 12;
  var STANDARD = ['side', 'top / bottom', 'back'];
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  // ---------- names ----------
  function tidy(name) {
    var s = String(name || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    return s ? s.charAt(0).toLocaleUpperCase() + s.slice(1) : '';
  }
  function load() {
    try { var a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a.filter(function (x) { return x && typeof x.name === 'string' && x.name; }) : []; } catch (e) { return []; }
  }
  function store(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* full browser storage: the name still works, it is just not remembered */ } }
  function sorted(list) { return list.slice().sort(function (a, b) { return (b.n || 0) - (a.n || 0) || (b.last || 0) - (a.last || 0); }); }
  function remember(name) {
    if (STANDARD.indexOf(name.toLowerCase()) >= 0) return;
    var list = load(), low = name.toLowerCase(), hit = list.find(function (x) { return x.name.toLowerCase() === low; });
    if (hit) { hit.n = (hit.n || 0) + 1; hit.last = Date.now(); hit.name = name; } else list.push({ name: name, n: 1, last: Date.now() });
    store(sorted(list).slice(0, MAX));
  }
  function forget(name) { var low = name.toLowerCase(); store(load().filter(function (x) { return x.name.toLowerCase() !== low; })); }
  window.fiqCustomPartNames = function () { return sorted(load()).map(function (x) { return x.name; }); };   // for tests

  // ---------- look ----------
  function css() {
    if (document.getElementById('fiq-custom-part-css')) return;
    var s = document.createElement('style'); s.id = 'fiq-custom-part-css';
    s.textContent =
      // five on the row (Side, Top / Bottom, Back, + Custom Part, Chosen Parts); the existing button look is kept
      '#screen-mark .quick-main.fiq-cp-row{grid-template-columns:repeat(5,minmax(0,1fr))!important}' +
      '@media(max-width:700px){#screen-mark .quick-main.fiq-cp-row{grid-template-columns:repeat(3,minmax(0,1fr))!important}}' +
      '#screen-mark .quick-main-btn.fiq-cp-btn{color:#0b4bd6;border-style:dashed}' +
      '#screen-mark .quick-main-btn.fiq-cp-btn[aria-expanded="true"]{border-style:solid;border-color:#0051ff;box-shadow:0 0 0 3px rgba(37,99,235,.2)}' +
      '#fiqCustomPartBox{position:absolute;z-index:2147481000;width:340px;max-width:calc(100vw - 24px);box-sizing:border-box;background:#fff;border:1px solid #c9d3e3;border-radius:12px;box-shadow:0 14px 34px rgba(11,37,69,.22);padding:12px;font:14px/1.4 Inter,Segoe UI,Arial,sans-serif;color:#0b2545}' +
      '#fiqCustomPartBox .fiq-cp-title{font-weight:800;font-size:14px;margin:0 0 8px}' +
      '#fiqCustomPartBox .fiq-cp-entry{display:flex;gap:6px}' +
      '#fiqCustomPartBox input{flex:1;min-width:0;min-height:40px;border:1.5px solid #a5b4d3;border-radius:9px;padding:6px 10px;font:600 15px Inter,Segoe UI,Arial,sans-serif;color:#0b2545;background:#fff}' +
      '#fiqCustomPartBox input:focus{outline:none;border-color:#0051ff;box-shadow:0 0 0 3px rgba(37,99,235,.18)}' +
      '#fiqCustomPartBox .fiq-cp-mic{flex:0 0 44px;min-height:40px;border:1.5px solid #a5b4d3;border-radius:9px;background:#f4f7ff;color:#0b4bd6;cursor:pointer;display:inline-grid;place-items:center}' +
      '#fiqCustomPartBox .fiq-cp-mic.listening{background:#dc2626;border-color:#dc2626;color:#fff;animation:fiqCpPulse 1s ease-in-out infinite}' +
      '@keyframes fiqCpPulse{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.45)}50%{box-shadow:0 0 0 7px rgba(220,38,38,0)}}' +
      '#fiqCustomPartBox .fiq-cp-status{min-height:18px;margin:5px 2px 0;font-size:12.5px;color:#475569}' +
      '#fiqCustomPartBox .fiq-cp-status.error{color:#b91c1c}' +
      '#fiqCustomPartBox .fiq-cp-recent-head{margin:8px 0 5px;font-size:12px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:.03em}' +
      '#fiqCustomPartBox .fiq-cp-recent{display:flex;flex-wrap:wrap;gap:6px}' +
      '#fiqCustomPartBox .fiq-cp-chip{display:inline-flex;align-items:center;border:1px solid #a5b4d3;border-radius:999px;background:#f4f7ff;overflow:hidden}' +
      '#fiqCustomPartBox .fiq-cp-chip button{border:0;background:transparent;cursor:pointer;font:700 13px Inter,Segoe UI,Arial,sans-serif;color:#293a4e;padding:5px 4px 5px 11px}' +
      '#fiqCustomPartBox .fiq-cp-chip button.fiq-cp-x{padding:5px 9px 5px 5px;color:#94a3b8;font-weight:800}' +
      '#fiqCustomPartBox .fiq-cp-chip button.fiq-cp-x:hover{color:#b91c1c}' +
      '#fiqCustomPartBox .fiq-cp-chip:hover{border-color:#0051ff}' +
      '#fiqCustomPartBox .fiq-cp-actions{display:flex;gap:6px;justify-content:flex-end;margin-top:10px}' +
      '#fiqCustomPartBox .fiq-cp-actions button{min-height:38px;border-radius:9px;padding:6px 14px;font:800 14px Inter,Segoe UI,Arial,sans-serif;cursor:pointer;border:1px solid #d5d9e1;background:#fff;color:#293a4e}' +
      '#fiqCustomPartBox .fiq-cp-actions button.fiq-cp-use{background:#0051ff;border-color:#0051ff;color:#fff}' +
      '#fiqCustomPartBox .fiq-cp-actions button.fiq-cp-use[disabled]{opacity:.45;cursor:not-allowed}' +
      '#fiqCustomPartBox .fiq-cp-hint{margin-top:8px;font-size:12px;color:#64748b}' +
      '#fiqCustomPartBox kbd{font:700 11px Inter,Segoe UI,Arial,sans-serif;border:1px solid #cbd5e1;border-bottom-width:2px;border-radius:4px;padding:0 4px;background:#f8fafc}';
    document.head.appendChild(s);
  }

  // ---------- voice: only listens after the microphone is pressed ----------
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null, rec = null, listening = false;
  function stopListening() { listening = false; try { if (rec) rec.abort(); } catch (e) {} rec = null; var m = document.querySelector('#fiqCustomPartBox .fiq-cp-mic'); if (m) { m.classList.remove('listening'); m.setAttribute('aria-pressed', 'false'); } }
  function startListening(box) {
    if (!SR || listening) { stopListening(); return; }
    var input = box.querySelector('input'), status = box.querySelector('.fiq-cp-status'), mic = box.querySelector('.fiq-cp-mic');
    try {
      rec = new SR(); rec.lang = document.documentElement.lang || navigator.language || 'en-GB'; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
    } catch (e) { status.textContent = 'The microphone is not available in this browser. Type the name, or press Windows key + H.'; status.className = 'fiq-cp-status error'; return; }
    listening = true; mic.classList.add('listening'); mic.setAttribute('aria-pressed', 'true');
    status.className = 'fiq-cp-status'; status.textContent = 'Listening… say the part name.';
    rec.onresult = function (ev) {
      var txt = ''; for (var i = ev.resultIndex; i < ev.results.length; i++) txt += ev.results[i][0].transcript;
      input.value = tidy(txt.replace(/[.!?]+$/, '')); updateUse(box);
      if (ev.results[ev.results.length - 1].isFinal) status.textContent = 'Heard "' + input.value + '". Press Use name, or change it first.';
    };
    rec.onerror = function (ev) {
      status.className = 'fiq-cp-status error';
      status.textContent = ev.error === 'not-allowed' || ev.error === 'service-not-allowed' ? 'Microphone blocked. Allow the microphone for FittersIQ in the browser, or press Windows key + H.'
        : ev.error === 'no-speech' ? 'Nothing heard. Press the microphone and try again.' : 'Voice did not work just now (' + ev.error + '). Type the name, or press Windows key + H.';
    };
    rec.onend = function () { var keep = status.textContent; stopListening(); if (/^Listening/.test(keep)) status.textContent = ''; input.focus(); };
    try { rec.start(); } catch (e) { stopListening(); }
  }

  // ---------- the box ----------
  var btn = null;
  function updateUse(box) { var u = box.querySelector('.fiq-cp-use'); if (u) u.disabled = !tidy(box.querySelector('input').value); }
  function drawRecent(box) {
    var names = window.fiqCustomPartNames().slice(0, SHOW), wrap = box.querySelector('.fiq-cp-recent-wrap');
    wrap.innerHTML = names.length ? '<div class="fiq-cp-recent-head">Used before on this computer</div><div class="fiq-cp-recent">' +
      names.map(function (n) { return '<span class="fiq-cp-chip"><button type="button" data-fiq-cp-pick="' + esc(n) + '" title="Use ' + esc(n) + '">' + esc(n) + '</button><button type="button" class="fiq-cp-x" data-fiq-cp-forget="' + esc(n) + '" title="Forget ' + esc(n) + '" aria-label="Forget ' + esc(n) + '">×</button></span>'; }).join('') + '</div>' : '';
  }
  function place(box) {
    if (!btn) return; var r = btn.getBoundingClientRect(), w = box.offsetWidth || 340;
    var left = Math.max(12, Math.min(window.scrollX + r.left, window.scrollX + document.documentElement.clientWidth - w - 12));
    box.style.left = left + 'px'; box.style.top = (window.scrollY + r.bottom + 6) + 'px';
  }
  function closeBox() { stopListening(); var b = document.getElementById('fiqCustomPartBox'); if (b) b.remove(); if (btn) btn.setAttribute('aria-expanded', 'false'); }
  function use(name) {
    name = tidy(name); if (!name) return;
    remember(name);
    closeBox();
    if (typeof window.setPartName === 'function') window.setPartName(name);   // exactly what Side / Top / Bottom / Back run
  }
  function openBox() {
    if (document.body.classList.contains('fiq-drawing-locked')) return;   // job with the fitter: Drawing is read only
    if (document.getElementById('fiqCustomPartBox')) return closeBox();
    css();
    var box = document.createElement('div'); box.id = 'fiqCustomPartBox'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Custom part name');
    var selected = null; try { selected = typeof part === 'function' ? part() : null; } catch (e) {}
    box.innerHTML = '<div class="fiq-cp-title">' + (selected ? 'Rename ' + esc(selected.code || 'the selected panel') + ' to:' : 'Name for the next dot you place:') + '</div>' +
      '<div class="fiq-cp-entry"><input type="text" autocomplete="off" spellcheck="true" maxlength="60" placeholder="e.g. Plinth, Filler, Spacer, Rail" aria-label="Custom part name">' +
      (SR ? '<button type="button" class="fiq-cp-mic" aria-pressed="false" title="Press, then say the part name" aria-label="Say the part name"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>' : '') + '</div>' +
      '<div class="fiq-cp-status" aria-live="polite"></div><div class="fiq-cp-recent-wrap"></div>' +
      '<div class="fiq-cp-actions"><button type="button" class="fiq-cp-cancel">Cancel</button><button type="button" class="fiq-cp-use" disabled>Use name</button></div>' +
      '<div class="fiq-cp-hint">' + (SR ? 'Tip: you can also' : 'To speak the name,') + ' click the box and press <kbd>Windows</kbd> + <kbd>H</kbd> to dictate.</div>';
    document.body.appendChild(box); drawRecent(box); place(box);
    btn.setAttribute('aria-expanded', 'true');
    var input = box.querySelector('input'); input.focus();
    input.addEventListener('input', function () { updateUse(box); });
    box.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest('.fiq-cp-mic')) return startListening(box);
      if (t.closest('.fiq-cp-cancel')) return closeBox();
      if (t.closest('.fiq-cp-use')) return use(input.value);
      var pick = t.closest('[data-fiq-cp-pick]'); if (pick) return use(pick.dataset.fiqCpPick);
      var fg = t.closest('[data-fiq-cp-forget]'); if (fg) { forget(fg.dataset.fiqCpForget); drawRecent(box); input.focus(); }
    });
  }
  // Enter = Use name, Escape = close (only the box: it must not reach Studio's own Escape handling)
  window.addEventListener('keydown', function (e) {
    var box = document.getElementById('fiqCustomPartBox'); if (!box) return;
    if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); closeBox(); }
    else if (e.key === 'Enter' && e.target && e.target.closest && e.target.closest('#fiqCustomPartBox input')) { e.preventDefault(); e.stopImmediatePropagation(); use(e.target.value); }
  }, true);
  document.addEventListener('mousedown', function (e) { var box = document.getElementById('fiqCustomPartBox'); if (box && !box.contains(e.target) && !(btn && btn.contains(e.target))) closeBox(); }, true);
  window.addEventListener('resize', function () { var b = document.getElementById('fiqCustomPartBox'); if (b) place(b); });
  document.addEventListener('scroll', function () { var b = document.getElementById('fiqCustomPartBox'); if (b) place(b); }, true);

  function init() {
    var row = document.querySelector('#screen-mark .quick-main'), back = row && row.querySelector('.quick-main-btn[data-quick-name="Back"]');
    if (!row || !back || typeof window.setPartName !== 'function') return setTimeout(init, 300);
    if (row.querySelector('.fiq-cp-btn')) return;
    css();
    btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'quick-main-btn fiq-cp-btn'; btn.textContent = '+ Custom Part';
    btn.title = 'Type or say your own part name (Plinth, Filler, Spacer, Rail …)'; btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-expanded', 'false');
    // deliberately NOT data-quick-name: it opens the box instead of naming straight away
    btn.addEventListener('click', function (e) { e.preventDefault(); openBox(); });
    back.insertAdjacentElement('afterend', btn);
    row.classList.add('fiq-cp-row');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
