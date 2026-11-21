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
  var guard = window.fiqBetaGuard = { blocked: [], skipped: [], allowed: 0, version: 1 };
  var ALLOW = [/^companies\/[^\/]+\/estimatorSheets(\/|$)/, /^companies\/[^\/]+\/fiqMaster\/beta(\/|$)/];
  var QUIET = [/^activityLog(\/|$)/, /^users\/[^\/]+(\/|$)/, /^supportTickets(\/|$)/];
  function pathOf(ref) { try { return String((ref && (ref.path || (ref._key && ref._key.path && ref._key.path.canonical))) || ''); } catch (e) { return ''; } }
  function verdict(path) {
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
  window.addEventListener('load', function () { setTimeout(function () { var b = document.getElementById('fiqBetaBanner'); if (b && b.textContent.indexOf('WRITES OFF') < 0) b.textContent += ' · LIVE-DATA WRITES OFF (Custom Sheets excepted)'; }, 800); });
})();
