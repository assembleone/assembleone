/* FittersIQ BETA write guard (21 Nov 2026).
   Beta shares the live Firebase project (assembleone-fabac) with Production, so a real account signed in here could otherwise change
   real company data: send jobs to phones, mark phone updates as received, change team members, upload photos. This guard sits between
   Beta's Studio and Firebase and lets through only:
     - reading anything the account may read (nothing is hidden), and
     - writing to companies/{id}/estimatorSheets (Custom Sheets) and companies/{id}/fiqMaster/beta (Beta's own backup area).
   Harmless housekeeping writes (usage log, user record, support tickets) are quietly skipped and counted. Everything else is refused
   with the error code "beta-write-blocked" and counted in window.fiqBetaGuard.blocked. Normal Studio and Mobile are not affected:
   this file is only loaded by beta/Studio.html. */
(function () {
  'use strict';
  var guard = window.fiqBetaGuard = { blocked: [], skipped: [], allowed: 0, version: 2 };
  // Custom Sheets may reach the company cloud ONLY after this computer's switch is turned on (off by default; remembered per Beta computer).
  var SHEETS_KEY = 'fiqBetaSheetsCloud';
  guard.sheetsCloud = function () { try { return window.localStorage.getItem(SHEETS_KEY) === 'on'; } catch (e) { return false; } };
  guard.setSheetsCloud = function (on) { try { if (on) window.localStorage.setItem(SHEETS_KEY, 'on'); else window.localStorage.removeItem(SHEETS_KEY); } catch (e) {} paintBanner(); return guard.sheetsCloud(); };
  var SHEETS = /^companies\/[^\/]+\/estimatorSheets(\/|$)/;
  var ALLOW = [SHEETS, /^companies\/[^\/]+\/fiqMaster\/beta(\/|$)/];
  var QUIET = [/^activityLog(\/|$)/, /^users\/[^\/]+(\/|$)/, /^supportTickets(\/|$)/];
  function pathOf(ref) { try { return String((ref && (ref.path || (ref._key && ref._key.path && ref._key.path.canonical))) || ''); } catch (e) { return ''; } }
  function verdict(path) {
    if (path && SHEETS.test(path) && !guard.sheetsCloud()) return 'block';
    if (path && ALLOW.some(function (r) { return r.test(path); })) return 'allow';
    if (path && QUIET.some(function (r) { return r.test(path); })) return 'skip';
    return 'block';
  }
  function blockedError(what, path) { var e = new Error('Beta test copy: writing to the live company data is switched off (' + what + (path ? ' ' + path : '') + ').'); e.code = 'beta-write-blocked'; return e; }
  function check(what, path) {
    var v = verdict(path);
    if (v === 'allow') { guard.allowed++; return 'allow'; }
    if (v === 'skip') { guard.skipped.push(what + ' ' + path); return 'skip'; }
    guard.blocked.push(what + ' ' + path); try { console.warn('[BETA guard] blocked', what, path); } catch (e) {} return 'block';
  }
  function wrapWrite(name, real) {
    return function (ref) {
      var v = check(name, pathOf(ref));
      if (v === 'allow') return real.apply(this, arguments);
      if (v === 'skip') return Promise.resolve(name === 'addDoc' ? { id: 'skipped', path: pathOf(ref) + '/skipped' } : undefined);
      return Promise.reject(blockedError(name, pathOf(ref)));
    };
  }
  function guardTx(tx) {
    return new Proxy(tx, { get: function (t, k) {
      var v = t[k];
      if (typeof v !== 'function') return v;
      if (k === 'set' || k === 'update' || k === 'delete') return function (ref) { var r = check('transaction.' + String(k), pathOf(ref)); if (r === 'block') throw blockedError('transaction.' + String(k), pathOf(ref)); if (r === 'skip') return tx; return v.apply(t, arguments); };
      return v.bind(t);
    } });
  }
  function wrapAuthFns(fns) {
    if (!fns || fns.__fiqBetaGuarded) return fns;
    var g = Object.assign({}, fns);
    ['setDoc', 'updateDoc', 'addDoc', 'deleteDoc'].forEach(function (n) { if (typeof fns[n] === 'function') g[n] = wrapWrite(n, fns[n]); });
    if (typeof fns.runTransaction === 'function') g.runTransaction = function (db, fn, opts) { return fns.runTransaction(db, function (tx) { return fn(guardTx(tx)); }, opts); };
    if (typeof fns.httpsCallable === 'function') g.httpsCallable = function (fx, name) { return function () { guard.blocked.push('callable ' + name); try { console.warn('[BETA guard] blocked callable', name); } catch (e) {} return Promise.reject(blockedError('cloud function', name)); }; };
    Object.defineProperty(g, '__fiqBetaGuarded', { value: true });
    return g;
  }
  function wrapStorageFns(fns) {
    if (!fns || fns.__fiqBetaGuarded) return fns;
    var g = Object.assign({}, fns);
    ['uploadString', 'uploadBytes', 'deleteObject'].forEach(function (n) { if (typeof fns[n] === 'function') g[n] = function (ref) { guard.blocked.push('storage.' + n + ' ' + pathOf(ref)); return Promise.reject(blockedError('storage.' + n, pathOf(ref))); }; });
    Object.defineProperty(g, '__fiqBetaGuarded', { value: true });
    return g;
  }
  // The Studio core assigns these after this script has run, so intercept the assignment itself.
  function intercept(prop, wrap) {
    var cur = wrap(window[prop]);
    Object.defineProperty(window, prop, { configurable: true, enumerable: true, get: function () { return cur; }, set: function (v) { cur = wrap(v); } });
  }
  intercept('fiqAuthFns', wrapAuthFns); intercept('fiqStorageFns', wrapStorageFns);
  // The automatic cloud copy (Beta's backup rehearsal) talks to Firebase directly and would bypass this guard. It is off by default;
  // refuse to switch it on here so it cannot be turned on by accident.
  try {
    var proto = Storage.prototype, setItem = proto.setItem;
    proto.setItem = function (k, v) { if (k === 'fiq_cloud_copy_enabled_v1' && v === 'on') { guard.blocked.push('cloud copy switch'); try { console.warn('[BETA guard] the cloud copy cannot be switched on in Beta'); } catch (e) {} return; } return setItem.apply(this, arguments); };
  } catch (e) {}
  // ---- Make Beta impossible to mistake for the real Studio: red banner text, red frame round the whole window, red BETA tab icon ----
  function paintBanner() {
    Array.prototype.forEach.call(document.querySelectorAll('#fiqBetaBanner'), function (b) { b.textContent = 'BETA TEST COPY \u2013 NOT YOUR NORMAL FITTERSIQ STUDIO \u2013 LIVE-DATA WRITES OFF' + (guard.sheetsCloud() ? ' \u2013 CUSTOM SHEETS CLOUD ON' : ''); });
  }
  var T0 = Date.now();
  function frame() {
    if (!document.body) return;
    if (!document.getElementById('fiqBetaFrame')) { var f = document.createElement('div'); f.id = 'fiqBetaFrame'; f.setAttribute('aria-hidden', 'true'); f.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;border:5px solid #b91c1c;pointer-events:none;z-index:2147483646;box-sizing:border-box'; document.body.appendChild(f); }
    if (!document.getElementById('fiqBetaBanner') && Date.now() - T0 > 2500) { var b = document.createElement('div'); b.id = 'fiqBetaBanner'; b.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:2147483647;background:#b91c1c;color:#fff;font:800 11px/1.6 Inter,Arial,sans-serif;text-align:center;letter-spacing:.04em;pointer-events:none'; document.body.appendChild(b); }
    paintBanner();
    try {
      var svg = "data:image/svg+xml," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='10' fill='#b91c1c'/><text x='32' y='42' font-family='Arial' font-weight='900' font-size='26' text-anchor='middle' fill='#fff'>BETA</text></svg>");
      var links = document.querySelectorAll('link[rel~="icon"],link[rel="shortcut icon"]'); if (!links.length) { var l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); links = [l]; }
      Array.prototype.forEach.call(links, function (l) { l.href = svg; l.type = 'image/svg+xml'; });
    } catch (e) {}
  }
  frame(); window.addEventListener('load', frame); setInterval(frame, 700); // cheap; keeps the Beta marks in place whatever else redraws the page
})();
