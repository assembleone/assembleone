/* FittersIQ Studio: Panel Check size check (Mads, 17 Nov 2026). STAGING ONLY for now (loaded by staging/Studio.html).
   Catches typing mistakes such as 130 instead of 1300 before panels are approved for the supplier, inside the existing Panel Check:
   - A panel whose size looks wrong is marked strongly (whole card / whole table row) with the size in doubt named.
   - Double-clicking a marked panel opens an information window INSTEAD of approving it (the same way the edging safety check works):
     the sizes on screen and in mm, why it was marked, the panels it was compared with, and a suggested correction where there is one.
   - Nothing is ever changed automatically. "Use suggestion" changes the size only when pressed (the panel then needs its normal check);
     "The size is correct" is remembered for exactly those sizes (p.sizeCheckOk) and then runs the normal approval (edging check included).
   - Panels without a doubt are untouched: double-click turns them green exactly as before.
   Detection needs EVIDENCE, never "small" alone (spacers, infills, drawer parts and strips stay quiet):
     Rule 1  same kind of panel, same material + thickness, one size equal and the other 10x / 1/10 / 25.4x off (missing zero, cm/mm, inch/mm)
     Rule 2  the odd one out in a group of the same kind of panel (2+ others agreeing), 10x / 1/10 / 25.4x off the group size
     Rule 3  impossible sizes: thickness under 3 or over 60 mm, a side under 10 mm, bigger than the largest sheets
   Sizes are stored in mm as always (the screen unit mm / cm / in is only for display and typing); this file only reads them.
   The detection part (FiqSizeCheck.analyse) has no browser code, so it is also run by the tests and the read-only real-job dry run. */
(function (root) {
  'use strict';
  var num = function (v) { var n = Number(v); return isFinite(n) ? n : 0; };
  var close = function (a, b) { return Math.abs(a - b) <= Math.max(3, 0.01 * Math.max(Math.abs(a), Math.abs(b))); };
  var exact = function (a, b) { return Math.abs(a - b) <= 2; };
  var RATIOS = [10, 0.1, 25.4, 1 / 25.4];
  var MAX_LONG = 4200, MAX_SHORT = 2100;

  // Kinds of panel. A name is compared loosely: case, numbers, left/right and words such as "panel" do not matter.
  var FAMILIES = [
    ['filler', /\b(fill(er|ers)?|infill|spacer|strip|scribe|packer|batten)\b/],
    ['drawer front', /drawer\s*fronts?/],
    ['drawer', /\bdrawers?\b/],
    ['door', /\bdoors?\b/],
    ['rail', /\brails?\b/],
    ['plinth', /\b(plinth|kicker|kickboard|kick)\b/],
    ['shelf', /\bshel(f|ves)\b/],
    ['divider', /\b(divider|partition|mid ?panel|middle)\b/],
    ['side', /\b(sides?|gable|end panel|ends?)\b/],
    ['top', /\btops?\b/],
    ['bottom', /\b(bottom|base)\b/],
    ['back', /\bbacks?\b/]
  ];
  var NOISE = /\b(left|right|lh|rh|l|r|panel|panels|part|parts|piece|wardrobe|cabinet|unit|the|a|an|of|for|and|x|no|nr|new|unnamed)\b/g;
  function kindOf(name, extra) {
    var s = String(name || '').toLowerCase().replace(/[0-9]+/g, ' ').replace(/[^a-zÀ-ɏ ]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!s) return '';
    var fam = (extra || []).concat(FAMILIES);
    for (var i = 0; i < fam.length; i++) if (fam[i][1].test(s)) return fam[i][0];
    s = s.replace(NOISE, ' ').replace(/\s+/g, ' ').trim();
    return s;   // '' = a generic name such as "Panel 3"
  }
  function matOf(p, materialFor) { return String((materialFor ? materialFor(p) : p.material) || '').trim().toLowerCase(); }
  function sizeKey(p) { return [num(p.length), num(p.width), num(p.thickness)].join('|'); }
  var FIELD_WORD = { length: 'Length', width: 'Width', thickness: 'Thickness' };
  function ratioWord(r) {
    if (r === 10) return 'a missing zero (or centimetres read as millimetres)';
    if (r === 0.1) return 'an extra zero (or millimetres read as centimetres)';
    if (r === 25.4) return 'inches typed where millimetres were expected';
    return 'millimetres typed where inches were expected';
  }
  var round = function (v) { return Math.round(v * 2) / 2; };   // to 0.5 mm

  /* analyse(job, opts) -> { byId: {panelId: {panel, cabinet, key, ok, issues:[...]}}, flagged:[...] }
     job: {cabinets:[{id,name,parts:[...]}]}  opts.materialFor(panel) (Studio's materialForPanel), opts.extraFamilies */
  function analyse(job, opts) {
    opts = opts || {};
    var all = [];
    (job && job.cabinets || []).forEach(function (c) { (c.parts || []).forEach(function (p) {
      if (!p) return;
      all.push({ p: p, c: c, L: num(p.length), W: num(p.width), T: num(p.thickness), kind: kindOf(p.name, opts.extraFamilies), mat: matOf(p, opts.materialFor) });
    }); });
    var out = { byId: {}, flagged: [] };
    var refText = function (x, from) { return (x.p.code || '?') + (from && x.c !== from ? ' (' + (x.c.name || 'other unit') + ')' : ''); };
    all.forEach(function (x) {
      var issues = [];
      var seen = {};   // field -> true once a rule has explained it
      var dims = { length: x.L, width: x.W };
      // ---------- Rule 1: same kind, same material + thickness, one size equal, the other 10x / 25.4x off ----------
      if (x.L > 0 && x.W > 0 && x.T > 0) {
        ['length', 'width'].forEach(function (f) {
          if (seen[f]) return;
          var g = f === 'length' ? 'width' : 'length', d = dims[f], o = dims[g];
          for (var ri = 0; ri < RATIOS.length; ri++) {
            var r = RATIOS[ri], target = d * r;
            if (target < 10 || target > MAX_LONG) continue;
            var compat = function (y) { return y !== x && y.T > 0 && exact(y.T, x.T) && y.mat === x.mat && (y.kind === x.kind || !x.kind || !y.kind); };
            var sameKind = function (y) { return y.kind && y.kind === x.kind; };
            var twins = all.filter(function (y) { if (!compat(y)) return false; var yd = { length: y.L, width: y.W };
              return (close(yd[f], target) && exact(yd[g], o)) || (sameKind(y) && close(yd[g], target) && exact(yd[f], o)); });
            if (!twins.length) continue;
            var same = all.filter(function (y) { if (y !== x && !compat(y)) return false; var yd = { length: y.L, width: y.W };
              return (exact(yd[f], d) && exact(yd[g], o)) || (y !== x && sameKind(y) && exact(yd[g], d) && exact(yd[f], o)); });
            if (twins.length < same.length || (twins.length === same.length && r < 1)) continue;   // the majority size wins; on a tie the smaller one is in doubt
            var tv = twins[0], tvd = close(f === 'length' ? tv.L : tv.W, target) ? (f === 'length' ? tv.L : tv.W) : (f === 'length' ? tv.W : tv.L);
            issues.push({ rule: 1, field: f, value: d, suggest: round(tvd), ratio: r,
              refs: twins.slice(0, 6).map(function (y) { return refText(y, x.c); }), moreRefs: Math.max(0, twins.length - 6),
              text: FIELD_WORD[f] + ' ' + d + ' mm looks like ' + ratioWord(r) + ': ' + (twins.length === 1 ? 'panel ' : 'panels ') +
                twins.slice(0, 6).map(function (y) { return refText(y, x.c); }).join(', ') + (twins.length > 6 ? ' and ' + (twins.length - 6) + ' more' : '') +
                ' of the same kind, material and thickness ' + (twins.length === 1 ? 'is ' : 'are ') + round(tvd) + ' mm where this panel has ' + d + ' mm (the other size, ' + o + ' mm, is the same).' });
            seen[f] = true; break;
          }
        });
      }
      // ---------- Rule 2: the odd one out in a group of the same kind of panel ----------
      if (x.kind && x.T > 0) {
        ['length', 'width'].forEach(function (f) {
          if (seen[f] || !(dims[f] > 0)) return;
          var group = all.filter(function (y) { return y !== x && y.kind === x.kind && exact(y.T, x.T) && (f === 'length' ? y.L : y.W) > 0; });
          if (group.length < 2) return;
          var vals = group.map(function (y) { return f === 'length' ? y.L : y.W; }).sort(function (a, b) { return a - b; });
          var m = vals[Math.floor(vals.length / 2)];
          var agree = group.filter(function (y) { var v = f === 'length' ? y.L : y.W; return Math.abs(v - m) <= 0.05 * m; });
          if (agree.length < 2 || agree.length * 3 < group.length * 2) return;
          for (var ri = 0; ri < RATIOS.length; ri++) {
            var r = RATIOS[ri], d = dims[f];
            if (Math.abs(d * r - m) <= 0.03 * m) {
              issues.push({ rule: 2, field: f, value: d, suggest: round(d * r), ratio: r,
                refs: agree.slice(0, 6).map(function (y) { return refText(y, x.c); }), moreRefs: Math.max(0, agree.length - 6),
                text: FIELD_WORD[f] + ' ' + d + ' mm looks like ' + ratioWord(r) + ': the other ' + agree.length + ' ' + x.kind + ' panels in this job (' +
                  agree.slice(0, 6).map(function (y) { return refText(y, x.c); }).join(', ') + (agree.length > 6 ? ' and more' : '') + ') are about ' + m + ' mm.' });
              seen[f] = true; break;
            }
          }
        });
      }
      // ---------- Rule 3: impossible sizes ----------
      if (x.T > 0 && (x.T < 3 || x.T > 60)) {
        var sT = x.T < 3 ? x.T * 10 : x.T / 10;
        issues.push({ rule: 3, field: 'thickness', value: x.T, suggest: (sT >= 3 && sT <= 60) ? round(sT * 10) / 10 : null,
          text: 'Thickness ' + x.T + ' mm is ' + (x.T < 3 ? 'thinner than 3 mm' : 'thicker than 60 mm') + ', which no board is. ' + ((sT >= 3 && sT <= 60) ? 'Did you mean ' + (Math.round(sT * 10) / 10) + ' mm?' : '') });
      }
      ['length', 'width'].forEach(function (f) {
        if (seen[f]) return;
        var d = dims[f];
        if (d > 0 && d < 10) { issues.push({ rule: 3, field: f, value: d, suggest: null, text: FIELD_WORD[f] + ' ' + d + ' mm is less than 10 mm, too small to cut safely.' }); seen[f] = true; }
      });
      var lg = Math.max(x.L, x.W), sh = Math.min(x.L, x.W);
      if (x.L > 0 && x.W > 0 && (lg > MAX_LONG || sh > MAX_SHORT)) {
        var big = lg > MAX_LONG ? lg : sh, f3 = x.L === big ? 'length' : 'width', d3 = dims[f3];
        if (!seen[f3]) { var s3 = d3 / 10; issues.push({ rule: 3, field: f3, value: d3, suggest: (s3 >= 10 && s3 <= MAX_LONG) ? round(s3) : null,
          text: 'This panel (' + x.L + ' × ' + x.W + ' mm) is bigger than the largest sheets (' + MAX_LONG + ' × ' + MAX_SHORT + ' mm).' + ((s3 >= 10) ? ' An extra zero?' : '') }); }
      }
      var ok = !!(x.p.sizeCheckOk && x.p.sizeCheckOk === sizeKey(x.p));
      var rec = { panel: x.p, cabinet: x.c, key: sizeKey(x.p), ok: ok, issues: issues };
      out.byId[x.p.id] = rec;
      if (issues.length && !ok) out.flagged.push(rec);
    });
    return out;
  }
  var api = { analyse: analyse, kindOf: kindOf, sizeKey: sizeKey, FAMILIES: FAMILIES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.FiqSizeCheck = api;
  if (typeof document === 'undefined') return;

  // =====================================================================================================================
  // Studio: marking in Panel Check, the information window, the double-click
  // =====================================================================================================================
  if (root.__fiqSizeCheckUi) return; root.__fiqSizeCheckUi = true;
  var S = function () { try { return state; } catch (e) { return null; } };
  var matFor = function (p) { try { return typeof materialForPanel === 'function' ? materialForPanel(p) : p.material; } catch (e) { return p && p.material; } };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); };
  var cache = { sig: '', res: null };
  function jobSig(pr) { return pr.id + '#' + (pr.cabinets || []).map(function (c) { return c.id + ':' + (c.parts || []).map(function (p) { return p.id + ',' + p.name + ',' + p.length + ',' + p.width + ',' + p.thickness + ',' + p.material + ',' + (p.sizeCheckOk || ''); }).join(';'); }).join('/') + '#' + (pr.defaultMaterial || ''); }
  var resCache = {};
  function resultFor(pr) {
    if (!pr) return null;
    var sig = jobSig(pr);
    if (resCache[pr.id] && resCache[pr.id].sig === sig) return resCache[pr.id].res;
    var res = analyse(pr, { materialFor: matFor });
    resCache[pr.id] = { sig: sig, res: res };
    return res;
  }
  function projectById(id) { var st = S(); return st && (st.projects || []).find(function (x) { return String(x.id) === String(id); }); }
  function currentProject() { try { return typeof project === 'function' ? project() : null; } catch (e) { return null; } }
  function screenUnit() { try { return typeof aoCurrentUnit === 'function' ? aoCurrentUnit() : 'mm'; } catch (e) { return 'mm'; } }
  function inUnit(mm) { var u = screenUnit(); if (u === 'mm') return mm + ' mm'; try { return aoMmToUnit(mm) + ' ' + u; } catch (e) { return mm + ' mm'; } }

  function css() {
    if (document.getElementById('fiq-size-check-css')) return;
    var s = document.createElement('style'); s.id = 'fiq-size-check-css';
    s.textContent =
      '@keyframes fiqSzPulse{0%,100%{box-shadow:0 0 0 4px rgba(220,38,38,.35),0 6px 18px rgba(220,38,38,.25)}50%{box-shadow:0 0 0 9px rgba(220,38,38,.12),0 6px 18px rgba(220,38,38,.25)}}' +
      '#screen-parts .panel-check-card.fiq-sz-flag,#screen-parts .panel-check-card.fiq-sz-flag.incomplete,#screen-parts .panel-check-card.fiq-sz-flag.complete{border:3px solid #dc2626!important;border-left:12px solid #dc2626!important;background:#fff1f1!important;animation:fiqSzPulse 1.8s ease-in-out 3;position:relative}' +
      '.fiq-sz-banner{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;background:#dc2626;color:#fff;border-radius:10px;padding:10px 14px;font:800 16px/1.3 Inter,Segoe UI,Arial,sans-serif;margin:-2px 0 4px}' +
      '#screen-parts .panel-check-card.fiq-compact.fiq-sz-flag{flex-wrap:wrap!important}#screen-parts .panel-check-card.fiq-compact.fiq-sz-flag>.fiq-sz-banner{display:flex!important;width:100%}' +
      '.fiq-sz-banner .fiq-sz-why{margin-left:auto;background:#fff;color:#b91c1c;border:0;border-radius:8px;padding:7px 12px;font:800 14px Inter,Segoe UI,Arial,sans-serif;cursor:pointer}' +
      '.fiq-sz-banner small{font-weight:600;font-size:13px;opacity:.95}' +
      '.panel-check-card.fiq-sz-flag .panel-review-warning,.panel-check-card.fiq-sz-flag .panel-review-ok{border-color:#dc2626!important}' +
      'tr.fiq-sz-flag>td{background:#fee2e2!important;border-top:2px solid #dc2626!important;border-bottom:2px solid #dc2626!important}' +
      'tr.fiq-sz-flag>td:first-child{border-left:5px solid #dc2626!important;font-weight:800;color:#b91c1c}' +
      'tr.fiq-sz-flag input.fiq-sz-cell{outline:3px solid #dc2626;background:#fff;font-weight:800;color:#b91c1c}' +
      '.fiq-sz-chip{display:inline-block;margin-left:6px;background:#dc2626;color:#fff;border-radius:6px;padding:2px 6px;font:800 11px Inter,Segoe UI,Arial,sans-serif;white-space:nowrap;cursor:pointer}' +
      '#fiqSizeSummary{display:flex;flex-wrap:wrap;align-items:center;gap:8px;background:#dc2626;color:#fff;border-radius:12px;padding:12px 16px;margin:10px 0;font:800 17px/1.35 Inter,Segoe UI,Arial,sans-serif}' +
      '#fiqSizeSummary button{background:#fff;color:#b91c1c;border:0;border-radius:8px;padding:5px 10px;font:800 14px Inter,Segoe UI,Arial,sans-serif;cursor:pointer}' +
      '#fiqSizeSummary span.fiq-sz-help{font-weight:600;font-size:14px;flex-basis:100%}' +
      '#fiqSizeDialog{position:fixed;inset:0;z-index:2147482000;background:rgba(11,37,69,.55);display:flex;align-items:flex-start;justify-content:center;padding:6vh 16px 16px;overflow-y:auto}' +
      '#fiqSizeDialog .fiq-sz-box{background:#fff;color:#0b2545;border-radius:16px;max-width:640px;width:100%;box-shadow:0 20px 50px rgba(0,0,0,.35);font:15px/1.45 Inter,Segoe UI,Arial,sans-serif;overflow:hidden}' +
      '#fiqSizeDialog .fiq-sz-head{background:#dc2626;color:#fff;padding:14px 18px;font-weight:800;font-size:19px}' +
      '#fiqSizeDialog .fiq-sz-head small{display:block;font-weight:600;font-size:14px;opacity:.95}' +
      '#fiqSizeDialog .fiq-sz-body{padding:14px 18px}' +
      '#fiqSizeDialog table{width:100%;border-collapse:collapse;margin:4px 0 12px}#fiqSizeDialog th,#fiqSizeDialog td{text-align:left;padding:6px 8px;border-bottom:1px solid #e2e8f0}' +
      '#fiqSizeDialog tr.fiq-sz-doubt td{background:#fee2e2;color:#b91c1c;font-weight:800}' +
      '#fiqSizeDialog .fiq-sz-reason{background:#fff7ed;border-left:5px solid #ea580c;border-radius:8px;padding:9px 12px;margin:0 0 10px}' +
      '#fiqSizeDialog .fiq-sz-actions{display:flex;flex-wrap:wrap;gap:8px;padding:0 18px 16px}' +
      '#fiqSizeDialog .fiq-sz-actions button{min-height:44px;border-radius:10px;padding:8px 14px;font:800 15px Inter,Segoe UI,Arial,sans-serif;cursor:pointer;border:1.5px solid #cbd5e1;background:#fff;color:#0b2545}' +
      '#fiqSizeDialog .fiq-sz-actions button.fiq-sz-fix{background:#16a34a;border-color:#16a34a;color:#fff}' +
      '#fiqSizeDialog .fiq-sz-actions button.fiq-sz-okbtn{background:#0b2545;border-color:#0b2545;color:#fff}' +
      '#fiqSizeDialog .fiq-sz-actions button[disabled]{opacity:.45;cursor:not-allowed}' +
      '#fiqSizeDialog .fiq-sz-note{color:#475569;font-size:13px;margin:6px 0 0}' +
      '.fiq-sz-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:2147482001;background:#0b2545;color:#fff;border-radius:12px;padding:12px 18px;font:700 15px Inter,Segoe UI,Arial,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.3)}';
    document.head.appendChild(s);
  }

  // Which panel does a Panel Check element belong to? {project, id, key}
  function refOf(el) {
    var cr = el.querySelector && (el.querySelector('[data-combined-review]') || el.querySelector('[data-combined-edit]'));
    if (cr) { var k = (cr.dataset.combinedReview || cr.dataset.combinedEdit || '').split('::'); return { pr: projectById(k[0]), id: k[2], combinedKey: k.join('::') }; }
    var r = el.querySelector && (el.querySelector('[data-review-panel]') || el.querySelector('[data-edit-panel]') || el.querySelector('[data-pc-id]') || el.querySelector('[data-pc-drawing]'));
    if (!r) return null;
    var id = r.dataset.reviewPanel || r.dataset.editPanel || r.dataset.pcId || r.dataset.pcDrawing;
    return { pr: currentProject(), id: id };
  }
  function recFor(ref) { if (!ref || !ref.pr) return null; var res = resultFor(ref.pr); var rec = res && res.byId[ref.id]; return rec && rec.issues.length && !rec.ok ? rec : null; }

  var decorating = false;
  function decorate() {
    var screen = document.getElementById('screen-parts'); if (!screen) return;
    decorating = true;
    try {
      css();
      var flaggedHere = [];
      screen.querySelectorAll('.panel-check-card').forEach(function (card) {
        var ref = refOf(card), rec = recFor(ref);
        var old = card.querySelector(':scope > .fiq-sz-banner');
        if (!rec) { card.classList.remove('fiq-sz-flag'); if (old) old.remove(); return; }
        flaggedHere.push({ rec: rec, ref: ref, el: card });
        card.classList.add('fiq-sz-flag'); card.dataset.fiqSz = ref.id;
        var first = rec.issues[0];
        var html = '<span>⚠ CHECK SIZE: ' + esc(FIELD_WORD[first.field]) + ' ' + esc(first.value) + ' mm' + (first.suggest != null ? ' (did you mean ' + esc(first.suggest) + '?)' : '') + '</span>' +
          (rec.issues.length > 1 ? '<small>+' + (rec.issues.length - 1) + ' more</small>' : '') + '<small>Double-click this panel to see why</small><button type="button" class="fiq-sz-why">See why</button>';
        if (!old) { old = document.createElement('div'); old.className = 'fiq-sz-banner'; card.insertBefore(old, card.firstChild); }
        if (old.innerHTML !== html) old.innerHTML = html;
      });
      screen.querySelectorAll('tr[data-pc-row]').forEach(function (tr) {
        var ref = refOf(tr), rec = recFor(ref);
        tr.querySelectorAll('.fiq-sz-cell').forEach(function (i) { i.classList.remove('fiq-sz-cell'); });
        var chip = tr.querySelector('.fiq-sz-chip');
        if (!rec) { tr.classList.remove('fiq-sz-flag'); if (chip) chip.remove(); return; }
        flaggedHere.push({ rec: rec, ref: ref, el: tr });
        tr.classList.add('fiq-sz-flag'); tr.dataset.fiqSz = ref.id; tr.title = 'Size looks wrong. Double-click this row to see why.';
        rec.issues.forEach(function (is) { var i = tr.querySelector('[data-pc-edit="' + is.field + '"]'); if (i) i.classList.add('fiq-sz-cell'); });
        if (!chip) { chip = document.createElement('span'); chip.className = 'fiq-sz-chip fiq-sz-why'; chip.textContent = '⚠ Size?'; tr.firstElementChild.appendChild(chip); }
      });
      // one summary line at the top of Panel Check
      var sum = document.getElementById('fiqSizeSummary');
      var head = screen.querySelector('.title-row');   // straight under the Panel Check title, above the Shopping List, so it is seen first
      var seenIds = {}, uniq = flaggedHere.filter(function (f) { var k = (f.ref.pr && f.ref.pr.id) + ':' + f.ref.id; if (seenIds[k]) return false; seenIds[k] = 1; return true; });
      if (!uniq.length) { if (sum) sum.remove(); }
      else if (head && head.parentNode) {
        if (!sum) { sum = document.createElement('div'); sum.id = 'fiqSizeSummary'; sum.setAttribute('role', 'alert'); }
        if (head.nextSibling !== sum) head.parentNode.insertBefore(sum, head.nextSibling);
        var h = '⚠ ' + (uniq.length === 1 ? '1 panel has a size that looks wrong:' : uniq.length + ' panels have a size that looks wrong:') + ' ' +
          uniq.slice(0, 12).map(function (f) { return '<button type="button" data-fiq-sz-go="' + esc(f.ref.id) + '">' + esc(f.rec.panel.code || '?') + '</button>'; }).join(' ') + (uniq.length > 12 ? ' …' : '') +
          '<span class="fiq-sz-help">Check these before approving them for the supplier. Double-click a red panel to see why and what it was compared with. Nothing is changed unless you choose to.</span>';
        if (sum.innerHTML !== h) sum.innerHTML = h;
      }
    } finally { decorating = false; }
  }

  // ---------- the information window ----------
  var open = null;   // {ref}
  function editable(pr) {
    try { if (window.fiqEditor && window.fiqEditor.role !== 'editor') return false; } catch (e) {}
    try { if (pr === currentProject() && typeof window.fiqPanelTableLocked === 'function' && window.fiqPanelTableLocked()) return false; } catch (e) {}
    if (pr && pr.lastMobileSync && !pr.movedToLibraryAt) return false;   // with the fitter: read only, as everywhere in Panel Check
    return true;
  }
  function toast(text) { var t = document.createElement('div'); t.className = 'fiq-sz-toast'; t.textContent = text; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 4200); }
  function rerender() { try { if (typeof save === 'function') save(); } catch (e) {} try { if (typeof renderAll === 'function') renderAll(); } catch (e) {} setTimeout(decorate, 30); }
  function closeDialog() { var d = document.getElementById('fiqSizeDialog'); if (d) d.remove(); open = null; }
  function openDialog(ref) {
    var rec = recFor(ref); if (!rec) return;
    closeDialog(); css(); open = { ref: ref }; var openedAt = Date.now();
    var p = rec.panel, pr = ref.pr, u = screenUnit(), canEdit = editable(pr), doubt = {};
    rec.issues.forEach(function (is) { doubt[is.field] = true; });
    var rows = ['length', 'width', 'thickness'].map(function (f) {
      return '<tr class="' + (doubt[f] ? 'fiq-sz-doubt' : '') + '"><td>' + FIELD_WORD[f] + (doubt[f] ? ' ⚠' : '') + '</td><td>' + esc(inUnit(num(p[f]))) + '</td>' + (u !== 'mm' ? '<td>' + esc(num(p[f])) + ' mm</td>' : '') + '</tr>';
    }).join('');
    var fixes = rec.issues.filter(function (is) { return is.suggest != null; });
    var d = document.createElement('div'); d.id = 'fiqSizeDialog'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = '<div class="fiq-sz-box"><div class="fiq-sz-head">⚠ Check the size of ' + esc(p.code || '') + ' ' + esc(p.name || '') +
      '<small>' + esc(rec.cabinet && rec.cabinet.name || '') + (pr && pr !== currentProject() ? ' · ' + esc(pr.name || '') : '') + ' · ' + esc(matFor(p) || '') + ' · Qty ' + esc(p.qty || 1) + '</small></div>' +
      '<div class="fiq-sz-body"><table><thead><tr><th>Size</th><th>' + (u === 'mm' ? 'Entered and stored (mm)' : 'On screen (' + esc(u) + ')') + '</th>' + (u !== 'mm' ? '<th>Stored (mm)</th>' : '') + '</tr></thead><tbody>' + rows + '</tbody></table>' +
      rec.issues.map(function (is) { return '<div class="fiq-sz-reason"><b>Why:</b> ' + esc(is.text) + '</div>'; }).join('') +
      '<div class="fiq-sz-note">FittersIQ never changes a size by itself. A small panel can be exactly right; if it is, press "The size is correct".' + (canEdit ? '' : ' This job is read only here (sent to Mobile, or a view-only tab), so sizes cannot be changed.') + '</div></div>' +
      '<div class="fiq-sz-actions">' +
      fixes.map(function (is, i) { return '<button type="button" class="fiq-sz-fix" data-fiq-sz-fix="' + i + '"' + (canEdit ? '' : ' disabled') + '>Change ' + FIELD_WORD[is.field].toLowerCase() + ' to ' + esc(is.suggest) + ' mm' + (u !== 'mm' ? ' (' + esc(inUnit(is.suggest)) + ')' : '') + '</button>'; }).join('') +
      '<button type="button" class="fiq-sz-okbtn" data-fiq-sz-ok' + (canEdit ? '' : ' disabled') + '>The size is correct' + (typeof window.panelIsReviewed === 'function' && !window.panelIsReviewed(p) ? ', check panel' : '') + '</button>' +
      '<button type="button" data-fiq-sz-drawing>Open in Drawing</button><button type="button" data-fiq-sz-close>Close</button></div></div>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) {
      // a click on the dark background closes the window, but not the second click of the double-click that opened it
      if (e.target === d) { if (Date.now() - openedAt > 450) closeDialog(); return; }
      if (e.target.closest('[data-fiq-sz-close]')) return closeDialog();
      var fx = e.target.closest('[data-fiq-sz-fix]');
      if (fx && !fx.disabled) {
        var is = fixes[Number(fx.dataset.fiqSzFix)]; var before = p[is.field];
        p[is.field] = is.suggest; closeDialog(); rerender();
        toast((p.code || 'Panel') + ': ' + FIELD_WORD[is.field].toLowerCase() + ' changed from ' + before + ' to ' + is.suggest + ' mm. Check the panel again.');
        return;
      }
      if (e.target.closest('[data-fiq-sz-ok]') && !e.target.closest('[data-fiq-sz-ok]').disabled) {
        p.sizeCheckOk = FiqSizeCheck.sizeKey(p); closeDialog(); rerender();
        // then the normal approval, exactly as a double-click on a panel without doubts (edging safety check included)
        setTimeout(function () {
          var sel = ref.combinedKey ? '[data-combined-review="' + ref.combinedKey + '"]' : '#screen-parts [data-review-panel="' + ref.id + '"]';
          var el = document.querySelector(sel);
          if (el) el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window }));
          else toast((p.code || 'Panel') + ': size confirmed.');
        }, 60);
        return;
      }
      if (e.target.closest('[data-fiq-sz-drawing]')) {
        closeDialog();
        try {
          if (pr && pr !== currentProject() && typeof switchToProject === 'function') switchToProject(pr.id, rec.cabinet && rec.cabinet.id);
          else if (rec.cabinet && typeof state !== 'undefined' && state.currentCabinet !== undefined) state.currentCabinet = rec.cabinet.id;
          state.currentPart = p.id; state.selectedCopy = -1; state.focusMarker = true;
          if (typeof save === 'function') save(); if (typeof renderAll === 'function') renderAll(); if (typeof show === 'function') show('mark');
        } catch (err) { /* stays on Panel Check */ }
      }
    });
    var fb = d.querySelector('[data-fiq-sz-fix]:not([disabled])') || d.querySelector('[data-fiq-sz-close]'); if (fb) fb.focus();
  }
  // Escape closes the window only (it must not also reach Studio's own Escape handling)
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.getElementById('fiqSizeDialog')) { e.preventDefault(); e.stopImmediatePropagation(); closeDialog(); } }, true);

  // Double-click: a marked panel opens the window INSTEAD of being approved. Registered on window (capture), so it runs
  // before Panel Check's own approval and before the edging check; unmarked panels pass straight through, unchanged.
  window.addEventListener('dblclick', function (e) {
    var t = e.target; if (!t || !t.closest || !t.closest('#screen-parts')) return;
    var holder = t.closest('.fiq-sz-flag'); if (!holder) return;
    if (t.closest('input,select,textarea') || (t.closest('button') && !t.closest('.fiq-sz-why'))) return;   // typing in the table, or the Edit / Drawing buttons
    var ref = refOf(holder); if (!recFor(ref)) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    openDialog(ref);
  }, true);
  // single click on "See why", the "⚠ Size?" chip, or a panel number in the summary
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var why = t.closest('#screen-parts .fiq-sz-why');
    if (why) { var h = why.closest('.fiq-sz-flag'); var ref = h && refOf(h); if (ref) { e.preventDefault(); e.stopPropagation(); openDialog(ref); } return; }
    var go = t.closest('#fiqSizeSummary [data-fiq-sz-go]');
    if (go) { var el = document.querySelector('#screen-parts .fiq-sz-flag[data-fiq-sz="' + go.dataset.fiqSzGo + '"]'); if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); var r = refOf(el); if (r) setTimeout(function () { openDialog(r); }, 350); } }
  }, true);

  function init() {
    var screen = document.getElementById('screen-parts');
    if (!screen || typeof window.renderParts !== 'function') return setTimeout(init, 300);
    css();
    var pending = 0;
    new MutationObserver(function () { if (decorating || pending) return; pending = requestAnimationFrame(function () { pending = 0; decorate(); }); })
      .observe(screen, { childList: true, subtree: true });
    decorate();
  }
  window.fiqSizeCheckDecorate = function () { decorate(); };
  window.fiqSizeCheckFor = function (pr) { return resultFor(pr || currentProject()); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
