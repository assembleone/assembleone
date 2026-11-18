/* FittersIQ Studio Drawing: "+ Custom Part" (Mads, 18 Nov 2026). Live since 18 Nov 2026 (loaded by Studio.html and staging/Studio.html).
   - A 4th quick button after Side, Top / Bottom and Back, in the same style. Chosen Parts is unchanged.
   - It opens a small box: type a name, or press the microphone and say it (only listens while pressed / until the word is heard),
     or pick one of the names used before on this computer (most used first, up to 60 kept, × forgets one).
   - "Use name" runs exactly what Side / Top / Bottom / Back run (Studio's own setPartName): with a panel selected it is renamed,
     with no panel selected the next dot placed gets the name. The panel then gets its sizes in the normal boxes.
   - The name is only the panel's normal name (p.name), so the Cutting List, Panel Check, the phone and every supplier export show it
     with no change anywhere else. First letter capitalised ("plinth" -> "Plinth"); extra spaces removed.
   - Voice (18 Nov 2026 change): Studio records the few spoken seconds itself and FittersIQ's own cloud (fiqSpeechToText, Google, EU) turns them into text; works in any browser that can record.
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
      '#fiqCustomPartBox .fiq-cp-langrow{display:flex;align-items:center;gap:6px;margin:6px 2px 0;font-size:12.5px;color:#475569;font-weight:600}' +
      '#fiqCustomPartBox .fiq-cp-lang{min-height:28px;border:1px solid #a5b4d3;border-radius:7px;padding:2px 6px;font:700 13px Inter,Segoe UI,Arial,sans-serif;color:#0b2545;background:#f4f7ff;cursor:pointer}' +
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

  // ---------- voice: FittersIQ records the spoken name itself, only after the microphone is pressed ----------
  // (18 Nov 2026) The browser's own speech recognition fails in many browsers ("network"). So Studio records the few seconds
  // spoken (it stops by itself after a short pause, or when the microphone is pressed again, at most 6 seconds) and sends them
  // to FittersIQ's own cloud (fiqSpeechToText, Google speech service, EU), which sends back the text. Nothing is kept.
  var CAN_RECORD = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  var LANGS = { en: 'en-GB', da: 'da-DK', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', nl: 'nl-NL', sv: 'sv-SE', nb: 'nb-NO', no: 'nb-NO', it: 'it-IT', pl: 'pl-PL', pt: 'pt-PT' };
  var HINTS = ['Plinth', 'Filler', 'Spacer', 'Rail', 'Kicker', 'Scribe', 'Infill', 'Batten', 'Pelmet', 'Cornice', 'Divider', 'Shelf', 'Drawer front', 'Drawer side', 'Drawer back', 'Drawer bottom', 'Door', 'Gable', 'Upright', 'Partition', 'Rail', 'Hanging rail', 'Top', 'Bottom', 'Back', 'Side'];
  var listening = false, recState = null;
  // The language the microphone listens in: chosen in the box, remembered on this computer (Mads, 18 Nov 2026: any name in any language).
  // Until one is chosen it follows Studio's own language.
  var VOICE_LANGS = [['en-GB', 'English'], ['da-DK', 'Dansk'], ['es-ES', 'Español'], ['de-DE', 'Deutsch'], ['fr-FR', 'Français'], ['nl-NL', 'Nederlands'], ['sv-SE', 'Svenska'], ['nb-NO', 'Norsk'], ['it-IT', 'Italiano'], ['pl-PL', 'Polski'], ['pt-PT', 'Português']];
  var LANG_KEY = 'fiq_custom_part_voice_lang_v1';
  function studioLang() { var l = String(document.documentElement.lang || 'en').toLowerCase().split('-')[0]; return LANGS[l] || 'en-GB'; }
  function speechLang() { var v = ''; try { v = localStorage.getItem(LANG_KEY) || ''; } catch (e) {} return VOICE_LANGS.some(function (x) { return x[0] === v; }) ? v : studioLang(); }
  function setSpeechLang(v) { try { localStorage.setItem(LANG_KEY, v); } catch (e) { /* still used for this box */ } }
  function setMic(on) { var m = document.querySelector('#fiqCustomPartBox .fiq-cp-mic'); if (m) { m.classList.toggle('listening', on); m.setAttribute('aria-pressed', on ? 'true' : 'false'); } }
  function stopListening(send) {
    var st = recState; recState = null; listening = false; setMic(false);
    if (!st) return;
    st.send = !!send; clearInterval(st.timer);
    try { if (st.mr && st.mr.state !== 'inactive') st.mr.stop(); else st.done(); } catch (e) { st.done(); }
  }
  function callSpeech(payload) {
    if (typeof window.fiqSpeechCall === 'function') return window.fiqSpeechCall(payload);   // tests
    var fns = window.fiqAuthFns, functions = window.fiqFunctions;
    if (!fns || !functions) return Promise.reject(new Error('signin'));
    return fns.httpsCallable(functions, 'fiqSpeechToText')(payload).then(function (r) { return r.data || {}; });
  }
  function blobToB64(blob) { return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(String(fr.result).split(',')[1] || ''); }; fr.onerror = rej; fr.readAsDataURL(blob); }); }
  function startListening(box) {
    if (listening) { stopListening(true); return; }   // pressed again: stop and use what was said
    var input = box.querySelector('input'), status = box.querySelector('.fiq-cp-status');
    var say = function (t, err) { status.className = 'fiq-cp-status' + (err ? ' error' : ''); status.textContent = t; };
    if (!CAN_RECORD) { say('This browser cannot record. Type the name, or press Windows key + H.', true); return; }
    listening = true; setMic(true); say('Starting the microphone…');
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }).then(function (stream) {
      if (!listening) { stream.getTracks().forEach(function (t) { t.stop(); }); return; }
      var mime = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm'].find(function (m) { return MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m); }) || '';
      var mr; try { mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream); } catch (e) { stream.getTracks().forEach(function (t) { t.stop(); }); listening = false; setMic(false); say('This browser cannot record. Type the name, or press Windows key + H.', true); return; }
      var chunks = [], st = { mr: mr, send: true, timer: 0, heard: false };
      var ctx = null, an = null, buf = null;
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); an = ctx.createAnalyser(); an.fftSize = 1024; ctx.createMediaStreamSource(stream).connect(an); buf = new Float32Array(an.fftSize); } catch (e) { ctx = null; }
      st.done = function () {
        stream.getTracks().forEach(function (t) { t.stop(); }); try { if (ctx) ctx.close(); } catch (e) {}
        if (st.finished) return; st.finished = true;
        if (!st.send) { say(''); return; }
        if (ctx && !st.heard) { say('Nothing heard. Press the microphone and say the name.', true); input.focus(); return; }
        var blob = new Blob(chunks, { type: mr.mimeType || mime || 'audio/webm' });
        if (!blob.size) { say('Nothing was recorded. Press the microphone and try again.', true); return; }
        say('Working out the word…');
        blobToB64(blob).then(function (b64) {
          return callSpeech({ audio: b64, mime: blob.type, lang: speechLang(), phrases: window.fiqCustomPartNames().slice(0, 40).concat(/^en/.test(speechLang()) ? HINTS : []) });   // the English part words only help English
        }).then(function (r) {
          var text = tidy(String(r && r.text || '').replace(/[.!?]+$/, ''));
          if (!document.getElementById('fiqCustomPartBox')) return;
          if (!text) { say('Nothing understood. Press the microphone and try again, or type the name.', true); return; }
          input.value = text; updateUse(box); say('Heard "' + text + '". Press Use name, or change it first.'); input.focus();
        }).catch(function (e) {
          var msg = String(e && (e.message || e.code) || '');
          say(/signin/.test(msg) ? 'Sign in to FittersIQ to use voice. Or press Windows key + H.' : /resource-exhausted|a lot/.test(msg) ? 'Voice has been used a lot in the last hour. Type the name, or try again later.' : 'Voice did not work just now. Check the internet, then try again, or press Windows key + H.', true);
        });
      };
      mr.ondataavailable = function (ev) { if (ev.data && ev.data.size) chunks.push(ev.data); };
      mr.onstop = function () { st.done(); };
      recState = st; mr.start(200); say('Listening… say the part name.');
      // stop by itself: after a short pause once something was said, after 4 s of nothing, or at 6 s
      var began = Date.now(), lastLoud = 0;
      st.timer = setInterval(function () {
        var now = Date.now();
        if (an) { an.getFloatTimeDomainData(buf); var sum = 0; for (var i = 0; i < buf.length; i++) sum += buf[i] * buf[i]; var rms = Math.sqrt(sum / buf.length); if (rms > 0.02) { st.heard = true; lastLoud = now; } }
        if ((st.heard && now - lastLoud > 900) || (!st.heard && now - began > 4000) || now - began > 6000) stopListening(true);
      }, 100);
    }).catch(function (e) {
      listening = false; setMic(false);
      say(e && (e.name === 'NotAllowedError' || e.name === 'SecurityError') ? 'Microphone blocked. Allow the microphone for FittersIQ in the browser (the icon in the address bar), or press Windows key + H.'
        : e && e.name === 'NotFoundError' ? 'No microphone found on this computer. Type the name, or press Windows key + H.' : 'The microphone could not start. Type the name, or press Windows key + H.', true);
    });
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
      (CAN_RECORD ? '<button type="button" class="fiq-cp-mic" aria-pressed="false" title="Press, then say the part name" aria-label="Say the part name"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>' : '') + '</div>' +
      (CAN_RECORD ? '<label class="fiq-cp-langrow">Microphone listens in <select class="fiq-cp-lang" aria-label="Microphone language">' + VOICE_LANGS.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === speechLang() ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select></label>' : '') +
      '<div class="fiq-cp-status" aria-live="polite"></div><div class="fiq-cp-recent-wrap"></div>' +
      '<div class="fiq-cp-actions"><button type="button" class="fiq-cp-cancel">Cancel</button><button type="button" class="fiq-cp-use" disabled>Use name</button></div>' +
      '<div class="fiq-cp-hint">' + (CAN_RECORD ? 'Tip: you can also' : 'To speak the name,') + ' click the box and press <kbd>Windows</kbd> + <kbd>H</kbd> to dictate.</div>';
    document.body.appendChild(box); drawRecent(box); place(box);
    btn.setAttribute('aria-expanded', 'true');
    var input = box.querySelector('input'); input.focus();
    input.addEventListener('input', function () { updateUse(box); });
    var langSel = box.querySelector('.fiq-cp-lang');
    if (langSel) langSel.addEventListener('change', function () { setSpeechLang(langSel.value); var st = box.querySelector('.fiq-cp-status'); st.className = 'fiq-cp-status'; st.textContent = 'The microphone now listens in ' + langSel.options[langSel.selectedIndex].text + ' (remembered on this computer).'; input.focus(); });
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
