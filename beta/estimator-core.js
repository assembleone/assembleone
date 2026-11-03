/* FittersIQ Estimator core (spec v1.1, sections 7-10, 14). Pure calculations: no screen, no
   saving, no access to jobs. Used by estimator-studio.js in Studio and by the Node tests.
   Estimates live in state.estimates and the price list in state.priceList; nothing here ever
   reads or writes a job's production panels. Money is calculated in whole cents. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FiqEstimatorCore = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CATEGORIES = [
    ['sheet', 'Sheet material'], ['edging', 'Edging'], ['hinges', 'Hinges'], ['drawers', 'Drawer systems'],
    ['lighting', 'Lighting'], ['transformers', 'Transformers'], ['hardware', 'Other hardware'], ['other', 'Other']
  ];
  var UNITS = ['sheet', 'metre', 'each', 'pack', 'set'];
  var DEFAULT_SHEET = { w: 2800, h: 2070 };
  var KERF_MM = 4;

  function cents(v) { var n = Number(v); return isFinite(n) ? Math.round(n * 100) : 0; }
  function euros(c) { return Math.round(c) / 100; }
  function parseAmount(v) {
    if (v === null || v === undefined) return null;
    var s = String(v).trim().replace(/\s|€/g, '');
    if (!s) return null;
    if (s.indexOf(',') >= 0 && s.indexOf('.') < 0) s = s.replace(',', '.'); else s = s.replace(/,/g, '');
    var n = Number(s);
    return isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
  }
  function num(v, dflt) { var n = Number(v); return isFinite(n) ? n : dflt; }
  function newId(prefix) {
    var r = Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
    return (prefix || 'id') + '_' + r;
  }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function norm(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, ' '); }

  // ---------- Price list (section 8) ----------
  function emptyPriceList() {
    return { currency: 'EUR', defaults: { taxRate: null, taxLabel: '', markupPct: 0 }, items: [], importedBrowserPricesAt: null };
  }
  function normalisePriceList(pl) {
    var base = emptyPriceList();
    if (!pl || typeof pl !== 'object') return base;
    var d = pl.defaults || {};
    return {
      currency: pl.currency || 'EUR',
      defaults: {
        taxRate: d.taxRate === null || d.taxRate === undefined || d.taxRate === '' ? null : num(d.taxRate, null),
        taxLabel: typeof d.taxLabel === 'string' ? d.taxLabel : '',
        markupPct: num(d.markupPct, 0)
      },
      items: Array.isArray(pl.items) ? pl.items : [],
      importedBrowserPricesAt: pl.importedBrowserPricesAt || null
    };
  }
  function makeItem(fields, who) {
    var it = {
      id: newId('pl'), category: 'other', name: '', unit: 'each', cost: null,
      sheet: null, supplier: '', notes: '', priceKey: '', archived: false,
      updatedAt: new Date().toISOString(), updatedBy: who || null
    };
    Object.keys(fields || {}).forEach(function (k) { it[k] = fields[k]; });
    return it;
  }
  // Reads the Shopping List's browser price store (fiq_supplier_prices_v1) WITHOUT changing it.
  // Codes: sheet|<material>|<thickness>|<w>x<h>, edge|<material>|<thickness>, hw|<name>, cut|all.
  function importBrowserPrices(rawJson, existingItems, who) {
    var data; try { data = JSON.parse(rawJson || '{}') || {}; } catch (e) { return { items: [], skipped: ['The saved prices could not be read.'] }; }
    var have = {}; (existingItems || []).forEach(function (i) { if (i.priceKey) have[i.priceKey] = true; });
    var items = [], skipped = [];
    Object.keys(data).forEach(function (key) {
      var cost = parseAmount(data[key]);
      if (cost === null) { skipped.push(key + ' (no usable price)'); return; }
      if (have[key]) { skipped.push(key + ' (already in the price list)'); return; }
      var p = key.split('|');
      var title = function (s) { return String(s || '').replace(/\b\w/g, function (c) { return c.toUpperCase(); }); };
      if (p[0] === 'sheet' && p.length >= 4) {
        var wh = String(p[3]).split('x'); var w = num(wh[0], DEFAULT_SHEET.w), h = num(wh[1], DEFAULT_SHEET.h), th = num(p[2], 0);
        items.push(makeItem({ category: 'sheet', name: title(p[1]) + ' ' + th + ' mm (' + w + ' × ' + h + ')', unit: 'sheet', cost: cost, sheet: { thickness: th, w: w, h: h }, priceKey: key }, who));
      } else if (p[0] === 'edge' && p.length >= 3) {
        items.push(makeItem({ category: 'edging', name: 'Edging ' + title(p[1]) + (num(p[2], 0) ? ' ' + num(p[2], 0) + ' mm' : ''), unit: 'metre', cost: cost, priceKey: key }, who));
      } else if (p[0] === 'hw' && p.length >= 2) {
        items.push(makeItem({ category: 'hardware', name: title(p.slice(1).join('|')), unit: 'each', cost: cost, priceKey: key }, who));
      } else if (p[0] === 'cut') {
        items.push(makeItem({ category: 'other', name: 'Cutting service', unit: 'each', cost: cost, priceKey: key }, who));
      } else skipped.push(key + ' (unknown kind)');
    });
    return { items: items, skipped: skipped };
  }
  function findItem(pl, id) { return ((pl && pl.items) || []).find(function (i) { return i.id === id; }) || null; }

  // ---------- Estimates (sections 9, 11, 14) ----------
  function emptyVersion(pl) {
    var d = normalisePriceList(pl).defaults;
    return {
      sections: [{ id: newId('sec'), name: 'Section 1', roomId: null, lines: [] }],
      derived: { sheets: {}, edging: {} },
      inputs: { markupPct: d.markupPct || 0, labourDays: 0, dayRate: 0, otherCosts: [], allowancePct: 0, taxRate: d.taxRate, taxLabel: d.taxLabel || '' },
      notes: ''
    };
  }
  function newEstimate(opts, pl) {
    return {
      id: newId('est'), customerId: opts.customerId || null, customer: opts.customer || '', projectId: opts.projectId,
      name: opts.name || 'Estimate', status: 'draft', createdAt: new Date().toISOString(),
      wonAt: null, lostAt: null, lostReason: '', archived: false,
      draft: emptyVersion(pl), versions: []
    };
  }
  // A line taking a price-list item copies its price now (snapshot); it never reads the list again by itself.
  function lineFromItem(type, item, extra) {
    var l = { id: newId('ln'), type: type, name: item ? item.name : '', unit: item ? item.unit : 'each', qty: 1,
      itemId: item ? item.id : null, unitCost: item && item.cost !== null ? item.cost : null,
      listCost: item && item.cost !== null ? item.cost : null, overridden: false };
    Object.keys(extra || {}).forEach(function (k) { l[k] = extra[k]; });
    return l;
  }
  function setLineCost(line, value) {
    var v = parseAmount(value);
    line.unitCost = v;
    line.overridden = line.listCost === null || v === null ? v !== null : v !== line.listCost;
  }

  // Sheets from rough panels: grouped by the sheet item chosen on each panel line, packed with the
  // same engine as the Sheet Optimiser when given (packFn = window.a181Pack), always whole sheets.
  function sheetDemand(version, pl, packFn) {
    var groups = {};
    (version.sections || []).forEach(function (s) {
      (s.lines || []).forEach(function (l) {
        if (l.type !== 'panel' || !l.itemId) return;
        var g = groups[l.itemId] || (groups[l.itemId] = { pieces: [], area: 0 });
        var w = Math.round(num(l.lengthCm, 0) * 10), h = Math.round(num(l.widthCm, 0) * 10), q = Math.max(0, Math.floor(num(l.qty, 0)));
        for (var i = 0; i < q; i++) if (w > 0 && h > 0) { g.pieces.push({ w: w, h: h, code: l.id, name: l.name || 'Panel' }); g.area += w * h; }
      });
    });
    var out = {};
    Object.keys(groups).forEach(function (itemId) {
      var it = findItem(pl, itemId), sw = (it && it.sheet && num(it.sheet.w, 0)) || DEFAULT_SHEET.w, sh = (it && it.sheet && num(it.sheet.h, 0)) || DEFAULT_SHEET.h;
      var g = groups[itemId], count = 0, tooBig = 0;
      if (typeof packFn === 'function' && g.pieces.length) {
        var r = packFn(g.pieces, sw, sh, KERF_MM, true, 0);
        count = (r && r.sheets ? r.sheets.length : 0); tooBig = (r && r.unplaced ? r.unplaced.length : 0);
      } else if (g.pieces.length) {
        count = Math.ceil(g.area / (sw * sh));
        tooBig = g.pieces.filter(function (p) { return !((p.w <= sw && p.h <= sh) || (p.h <= sw && p.w <= sh)); }).length;
      }
      out[itemId] = { count: count, tooBig: tooBig, sheetW: sw, sheetH: sh };
    });
    return out;
  }
  function edgingDemand(version) {
    var out = {};
    (version.sections || []).forEach(function (s) {
      (s.lines || []).forEach(function (l) {
        if (l.type !== 'panel' || !l.edgeItemId || !l.edges || l.edges === 'none') return;
        var L = num(l.lengthCm, 0), W = num(l.widthCm, 0), q = Math.max(0, num(l.qty, 0));
        var cm = l.edges === 'all' ? 2 * (L + W) : 2 * L;
        out[l.edgeItemId] = (out[l.edgeItemId] || 0) + (cm * q) / 100;
      });
    });
    return out;
  }
  // Keeps version.derived in step with the panel lines: a new sheet/edging group takes its price
  // from the list once (snapshot); existing groups keep their snapshot and any override.
  function syncDerived(version, pl, packFn) {
    version.derived = version.derived || { sheets: {}, edging: {} };
    var allow = 1 + Math.max(0, num(version.inputs && version.inputs.allowancePct, 0)) / 100;
    var sd = sheetDemand(version, pl, packFn), ed = edgingDemand(version);
    var sheets = {}, edging = {};
    Object.keys(sd).forEach(function (id) {
      var prev = version.derived.sheets[id], it = findItem(pl, id);
      sheets[id] = {
        itemId: id, name: (prev && prev.name) || (it && it.name) || 'Sheet', count: Math.ceil(sd[id].count * allow - 1e-9), tooBig: sd[id].tooBig,
        override: prev && prev.override !== undefined ? prev.override : null,
        unitCost: prev ? prev.unitCost : (it ? it.cost : null), listCost: prev ? prev.listCost : (it ? it.cost : null)
      };
    });
    Object.keys(ed).forEach(function (id) {
      var prev = version.derived.edging[id], it = findItem(pl, id);
      edging[id] = {
        itemId: id, name: (prev && prev.name) || (it && it.name) || 'Edging', metres: Math.ceil(ed[id] * allow * 10 - 1e-9) / 10,
        override: prev && prev.override !== undefined ? prev.override : null,
        unitCost: prev ? prev.unitCost : (it ? it.cost : null), listCost: prev ? prev.listCost : (it ? it.cost : null)
      };
    });
    version.derived = { sheets: sheets, edging: edging };
    return version;
  }

  // ---------- Calculations (section 10) ----------
  function compute(version) {
    var inp = version.inputs || {}, missing = [], material = 0;
    (version.sections || []).forEach(function (s) {
      (s.lines || []).forEach(function (l) {
        if (l.type === 'panel') return; // costed through derived sheets and edging
        var q = Math.max(0, num(l.qty, 0));
        if (l.unitCost === null || l.unitCost === undefined) { if (q > 0) missing.push(l.name || 'Unnamed item'); return; }
        material += Math.round(cents(l.unitCost) * q);
      });
    });
    var d = version.derived || { sheets: {}, edging: {} };
    Object.keys(d.sheets || {}).forEach(function (id) {
      var g = d.sheets[id], q = g.override !== null && g.override !== undefined ? num(g.override, 0) : g.count;
      if (g.unitCost === null || g.unitCost === undefined) { if (q > 0) missing.push(g.name); return; }
      material += Math.round(cents(g.unitCost) * q);
    });
    Object.keys(d.edging || {}).forEach(function (id) {
      var g = d.edging[id], q = g.override !== null && g.override !== undefined ? num(g.override, 0) : g.metres;
      if (g.unitCost === null || g.unitCost === undefined) { if (q > 0) missing.push(g.name); return; }
      material += Math.round(cents(g.unitCost) * q);
    });
    var markupPct = Math.max(0, num(inp.markupPct, 0));
    var markup = Math.round(material * markupPct / 100);
    var labour = Math.round(cents(Math.max(0, num(inp.dayRate, 0))) * Math.max(0, num(inp.labourDays, 0)));
    var other = (inp.otherCosts || []).reduce(function (a, o) { return a + cents(Math.max(0, num(o.amount, 0))); }, 0);
    var subtotal = material + markup + labour + other;
    var taxSet = inp.taxRate !== null && inp.taxRate !== undefined && inp.taxRate !== '' && isFinite(Number(inp.taxRate));
    var rate = taxSet ? Number(inp.taxRate) : null;
    var tax = taxSet ? Math.round(subtotal * rate / 100) : null;
    var profit = markup + labour;
    return {
      materialCost: euros(material), markupAmount: euros(markup), labourCharged: euros(labour), otherCosts: euros(other),
      subtotal: euros(subtotal), taxRate: rate, taxLabel: inp.taxLabel || '', taxAmount: tax === null ? null : euros(tax),
      suggestedTotal: tax === null ? null : euros(subtotal + tax), profit: euros(profit),
      marginPct: subtotal ? Math.round(profit / subtotal * 1000) / 10 : 0,
      missingPrices: missing, taxSet: taxSet
    };
  }
  function validateForSave(version) {
    var inp = version.inputs || {}, problems = [];
    var t = inp.taxRate;
    if (t === null || t === undefined || t === '' || !isFinite(Number(t))) problems.push('Tax rate not set');
    else if (Number(t) < 0 || Number(t) > 100) problems.push('Tax rate must be between 0 and 100');
    return problems;
  }
  // Freezes the draft as the next version (V1, V2...). Results are stored exactly as shown.
  function saveVersion(est, who, packFn, pl) {
    var draft = est.draft; syncDerived(draft, pl, packFn);
    var problems = validateForSave(draft); if (problems.length) return { ok: false, problems: problems };
    var v = clone(draft); v.n = (est.versions.length ? est.versions[est.versions.length - 1].n : 0) + 1;
    v.savedAt = new Date().toISOString(); v.savedBy = who || null; v.results = compute(v);
    est.versions.push(v); if (est.status === 'draft') est.status = 'saved';
    est.draft = null;
    return { ok: true, version: v };
  }
  function editAsNewVersion(est) {
    var last = est.versions[est.versions.length - 1]; if (!last) return est;
    var d = clone(last); delete d.n; delete d.savedAt; delete d.savedBy; delete d.results; est.draft = d; return est;
  }
  // Draft only: lists lines whose snapshot differs from the current list; applies only when told.
  function priceDifferences(version, pl) {
    var diffs = [];
    (version.sections || []).forEach(function (s) { (s.lines || []).forEach(function (l) {
      if (!l.itemId) return; var it = findItem(pl, l.itemId); if (!it || it.cost === null) return;
      if (it.cost !== l.listCost) diffs.push({ kind: 'line', ref: l.id, name: l.name, was: l.listCost, now: it.cost, overridden: !!l.overridden });
    }); });
    ['sheets', 'edging'].forEach(function (k) { var g = (version.derived || {})[k] || {}; Object.keys(g).forEach(function (id) {
      var it = findItem(pl, id); if (!it || it.cost === null) return;
      if (it.cost !== g[id].listCost) diffs.push({ kind: k, ref: id, name: g[id].name, was: g[id].listCost, now: it.cost, overridden: g[id].unitCost !== g[id].listCost });
    }); });
    return diffs;
  }
  function applyPriceRefresh(version, pl, refs) {
    var want = {}; (refs || []).forEach(function (r) { want[r] = true; });
    (version.sections || []).forEach(function (s) { (s.lines || []).forEach(function (l) {
      var it = l.itemId && findItem(pl, l.itemId); if (!it || !want[l.id]) return; l.listCost = it.cost; l.unitCost = it.cost; l.overridden = false;
    }); });
    ['sheets', 'edging'].forEach(function (k) { var g = (version.derived || {})[k] || {}; Object.keys(g).forEach(function (id) {
      var it = findItem(pl, id); if (!it || !want[id]) return; g[id].listCost = it.cost; g[id].unitCost = it.cost;
    }); });
    return version;
  }
  function suggestedOf(est) {
    var v = est.versions[est.versions.length - 1]; return v && v.results ? v.results.suggestedTotal : null;
  }

  return {
    CATEGORIES: CATEGORIES, UNITS: UNITS, DEFAULT_SHEET: DEFAULT_SHEET,
    cents: cents, euros: euros, parseAmount: parseAmount, newId: newId, clone: clone, norm: norm,
    emptyPriceList: emptyPriceList, normalisePriceList: normalisePriceList, makeItem: makeItem, findItem: findItem,
    importBrowserPrices: importBrowserPrices,
    emptyVersion: emptyVersion, newEstimate: newEstimate, lineFromItem: lineFromItem, setLineCost: setLineCost,
    sheetDemand: sheetDemand, edgingDemand: edgingDemand, syncDerived: syncDerived,
    compute: compute, validateForSave: validateForSave, saveVersion: saveVersion, editAsNewVersion: editAsNewVersion,
    priceDifferences: priceDifferences, applyPriceRefresh: applyPriceRefresh, suggestedOf: suggestedOf
  };
});
