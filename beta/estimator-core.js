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

  // Sheet settings for one sheet item inside ONE estimate (version.sheetCfg[itemId]). They live only in the
  // estimate: never in the price list, never in the job. Without an entry the estimate behaves exactly as it
  // always did (size from the price list item, 4 mm saw cut, no trim, panels may be turned).
  function legacyCfg(item) {
    var s = item && item.sheet;
    return { w: (s && num(s.w, 0)) || DEFAULT_SHEET.w, h: (s && num(s.h, 0)) || DEFAULT_SHEET.h, kerf: KERF_MM, trim: 0, grain: false };
  }
  function cfgOf(version, itemId, item) {
    var c = version && version.sheetCfg && version.sheetCfg[itemId], d = legacyCfg(item);
    if (!c) return d;
    // A sheet side under 300 mm is a half-typed number, not a real sheet: keep the previous default meanwhile.
    return { w: num(c.w, 0) >= 300 ? num(c.w, 0) : d.w, h: num(c.h, 0) >= 300 ? num(c.h, 0) : d.h,
      kerf: Math.max(0, num(c.kerf, d.kerf)), trim: Math.max(0, num(c.trim, d.trim)), grain: c.grain === undefined || c.grain === null ? d.grain : !!c.grain };
  }
  // Panels copied from Studio are counted by their own material even when no price-list item fits, so the sheets
  // needed are always visible; a price can then be typed on the line, or an item chosen. A panel with no material
  // is counted under "Material not set" (as Panel Check does) and flagged. Hand-typed rough panels still need an item.
  function matKey(l) {
    if (!l.src && !l.material) return null;
    return 'mat:' + norm(l.material).replace(/\|/g, '/') + '~' + num(l.thickness, 0);
  }
  function matLabel(l) { var m = String(l.material || '').trim() || 'Material not set', th = num(l.thickness, 0); return m + (th ? ' ' + th + ' mm' : ''); }
  function sheetKeyOf(l) { return l.itemId || matKey(l); }
  // Sheets from rough panels: grouped by the sheet item chosen on each panel line (or by the Studio material),
  // packed with the same engine as the Sheet Optimiser when given (packFn = window.a181Pack), always whole sheets.
  function sheetDemand(version, pl, packFn) {
    var groups = {};
    (version.sections || []).forEach(function (s) {
      (s.lines || []).forEach(function (l) {
        var key = l.type === 'panel' ? sheetKeyOf(l) : null; if (!key) return;
        var g = groups[key] || (groups[key] = { pieces: [], area: 0, label: l.itemId ? '' : matLabel(l) });
        var w = Math.round(num(l.lengthCm, 0) * 10), h = Math.round(num(l.widthCm, 0) * 10), q = Math.max(0, Math.floor(num(l.qty, 0)));
        for (var i = 0; i < q; i++) if (w > 0 && h > 0) { g.pieces.push({ w: w, h: h, code: l.id, name: l.name || 'Panel' }); g.area += w * h; }
      });
    });
    var out = {};
    Object.keys(groups).forEach(function (itemId) {
      var it = findItem(pl, itemId), cfg = cfgOf(version, itemId, it), sw = cfg.w, sh = cfg.h;
      var g = groups[itemId], count = 0, tooBig = 0, cuts = 0;
      if (typeof packFn === 'function' && g.pieces.length) {
        var r = packFn(g.pieces, sw, sh, cfg.kerf, !cfg.grain, cfg.trim);
        count = (r && r.sheets ? r.sheets.length : 0); tooBig = (r && r.unplaced ? r.unplaced.length : 0);
        cuts = (r && r.sheets ? r.sheets : []).reduce(function (n, s) { return n + (Number(s.cuts) || 0); }, 0);
      } else if (g.pieces.length) {
        var uw = Math.max(1, sw - 2 * cfg.trim), uh = Math.max(1, sh - 2 * cfg.trim);
        count = Math.ceil(g.area / (uw * uh));
        tooBig = g.pieces.filter(function (p) { return !((p.w <= uw && p.h <= uh) || (!cfg.grain && p.h <= uw && p.w <= uh)); }).length;
      }
      out[itemId] = { label: g.label, count: count, tooBig: tooBig, sheetW: sw, sheetH: sh, cuts: cuts, cfg: cfg, listW: it && it.sheet ? num(it.sheet.w, 0) : 0, listH: it && it.sheet ? num(it.sheet.h, 0) : 0 };
    });
    return out;
  }
  function edgingGroups(version) {
    var out = {};
    (version.sections || []).forEach(function (s) {
      (s.lines || []).forEach(function (l) {
        if (l.type !== 'panel' || !l.edges || l.edges === 'none') return;
        var key = l.edgeItemId || (l.edges === 'counts' ? matKey(l) : null); if (!key) return;
        var L = num(l.lengthCm, 0), W = num(l.widthCm, 0), q = Math.max(0, num(l.qty, 0));
        // Panels copied from Studio carry Studio own long and short edge counts (the same method as the Shopping List).
        var cm = l.edges === 'counts' ? Math.max(0, num(l.edgeLong, 0)) * L + Math.max(0, num(l.edgeShort, 0)) * W
          : l.edges === 'all' ? 2 * (L + W) : 2 * L;
        var g = out[key] || (out[key] = { cm: 0, label: l.edgeItemId ? '' : 'Edging ' + matLabel(l) });
        g.cm += (cm * q) / 100;
      });
    });
    return out;
  }
  function edgingDemand(version) {
    var g = edgingGroups(version), out = {};
    Object.keys(g).forEach(function (k) { out[k] = g[k].cm; });
    return out;
  }
  // Keeps version.derived in step with the panel lines: a new sheet/edging group takes its price
  // from the list once (snapshot); existing groups keep their snapshot and any override.
  function syncDerived(version, pl, packFn) {
    version.derived = version.derived || { sheets: {}, edging: {} };
    var allow = 1 + Math.max(0, num(version.inputs && version.inputs.allowancePct, 0)) / 100;
    var sd = sheetDemand(version, pl, packFn), eg = edgingGroups(version), ed = {};
    Object.keys(eg).forEach(function (k) { ed[k] = eg[k].cm; });
    var sheets = {}, edging = {};
    Object.keys(sd).forEach(function (id) {
      var prev = version.derived.sheets[id], it = findItem(pl, id);
      sheets[id] = {
        itemId: id, name: (prev && prev.name) || (it && it.name) || sd[id].label || 'Sheet', count: Math.ceil(sd[id].count * allow - 1e-9), tooBig: sd[id].tooBig,
        cuts: sd[id].cuts, cfg: sd[id].cfg, listW: sd[id].listW, listH: sd[id].listH,
        sizeDiffers: !!(sd[id].listW && sd[id].listH && !((sd[id].cfg.w === sd[id].listW && sd[id].cfg.h === sd[id].listH) || (sd[id].cfg.w === sd[id].listH && sd[id].cfg.h === sd[id].listW))),
        override: prev && prev.override !== undefined ? prev.override : null,
        unitCost: prev ? prev.unitCost : (it ? it.cost : null), listCost: prev ? prev.listCost : (it ? it.cost : null)
      };
    });
    Object.keys(ed).forEach(function (id) {
      var prev = version.derived.edging[id], it = findItem(pl, id);
      edging[id] = {
        itemId: id, name: (prev && prev.name) || (it && it.name) || eg[id].label || 'Edging', metres: Math.ceil(ed[id] * allow * 10 - 1e-9) / 10,
        override: prev && prev.override !== undefined ? prev.override : null,
        unitCost: prev ? prev.unitCost : (it ? it.cost : null), listCost: prev ? prev.listCost : (it ? it.cost : null)
      };
    });
    // Panel lines that cannot be counted yet, so a short total is never mistaken for a complete one.
    var notes = { noSheet: [], noEdge: [], noMaterial: [], cuts: 0 };
    (version.sections || []).forEach(function (s) { (s.lines || []).forEach(function (l) {
      if (l.type !== 'panel') return;
      var sized = num(l.lengthCm, 0) > 0 && num(l.widthCm, 0) > 0 && num(l.qty, 0) > 0;
      if (sized && !l.itemId && !matKey(l)) notes.noSheet.push(l.name || l.code || 'Panel');
      if (sized && !l.itemId && l.src && !String(l.material || '').trim()) notes.noMaterial.push(l.name || l.code || 'Panel');
      var hasEdges = l.edges === 'counts' ? (num(l.edgeLong, 0) > 0 || num(l.edgeShort, 0) > 0) : (l.edges && l.edges !== 'none');
      if (sized && hasEdges && !l.edgeItemId && !(l.edges === 'counts' && matKey(l))) notes.noEdge.push(l.name || l.code || 'Panel');
    }); });
    Object.keys(sheets).forEach(function (id) { notes.cuts += Number(sheets[id].cuts) || 0; });
    version.derived = { sheets: sheets, edging: edging, notes: notes };
    return version;
  }

  // ---------- Panels copied from a Studio job (snapshot) ----------
  // The Estimator never reads a job live. Importing COPIES each panel into an estimate line together with the
  // values it had at that moment (line.src). Nothing here writes to the job. Later changes in Studio are only
  // reported (diffAgainstJob) and applied when the user says so (applyUpdate).
  var SRC_FIELDS = ['name', 'lengthMm', 'widthMm', 'thickness', 'qty', 'material', 'edgeLong', 'edgeShort', 'roomId'];
  var SRC_LABELS = { name: 'name', lengthMm: 'length', widthMm: 'width', thickness: 'thickness', qty: 'quantity', material: 'material', edgeLong: 'long edges', edgeShort: 'short edges', roomId: 'room' };
  // A panel material is its own, else the job default, else the unit last used. (Studio materialForPanel
  // reads whichever job is open on screen, so it is not used here.)
  function studioMaterial(job, unit, part) { return String(part.material || job.defaultMaterial || unit.lastMaterial || '').trim(); }
  function studioPanels(job) {
    var rooms = (job && job.rooms) || [], out = [], skipped = [];
    ((job && job.cabinets) || []).forEach(function (u) {
      var room = rooms.find(function (r) { return r.id === u.roomId; });
      (u.parts || []).forEach(function (p) {
        var L = num(p.length, 0), W = num(p.width, 0);
        if (!(L > 0 && W > 0)) { skipped.push(p.code || p.name || 'panel'); return; }
        var q = Math.floor(num(p.qty, 1)); if (!(q >= 1)) q = 1;
        out.push({ srcId: String(p.id), unitId: u.id, unitName: u.name || '', roomId: room ? room.id : null, roomName: room ? room.name : '',
          code: p.code || '', name: p.name || '', lengthMm: L, widthMm: W, thickness: num(p.thickness, 0), qty: q,
          material: studioMaterial(job, u, p), edgeLong: Math.max(0, num(p.edgeLong, 0)), edgeShort: Math.max(0, num(p.edgeShort, 0)) });
      });
    });
    out.skipped = skipped; return out;
  }
  function panelFp(sp) { return SRC_FIELDS.map(function (k) { return String(sp[k] === null || sp[k] === undefined ? '' : sp[k]); }).join('|'); }
  function srcCopy(sp) { var s = {}; SRC_FIELDS.forEach(function (k) { s[k] = sp[k]; }); s.srcId = sp.srcId; s.unitId = sp.unitId; s.code = sp.code; return s; }
  // Price-list matching by material name and thickness. Only a single clear match is taken; anything else stays
  // empty ("choose item") rather than guessing.
  function itemBase(it) { return norm(String(it.name || '').replace(/\(.*?\)/g, ' ').replace(/\b\d+(\.\d+)?\s*mm\b/gi, ' ')); }
  function nameMatches(it, material) {
    var m = norm(material); if (!m) return false;
    var base = itemBase(it); return norm(it.name).indexOf(m) >= 0 || (base.length >= 3 && m.indexOf(base) >= 0);
  }
  function matchSheetItem(pl, material, thickness) {
    var hits = ((pl && pl.items) || []).filter(function (it) { return !it.archived && it.category === 'sheet' && it.sheet && num(it.sheet.thickness, 0) === num(thickness, 0) && nameMatches(it, material); });
    return hits.length === 1 ? hits[0].id : null;
  }
  function matchEdgeItem(pl, material, thickness) {
    var all = ((pl && pl.items) || []).filter(function (it) { return !it.archived && it.category === 'edging' && nameMatches(it, material); });
    if (all.length > 1 && num(thickness, 0)) { var th = all.filter(function (it) { return (String(it.name).match(/\d+(\.\d+)?/g) || []).indexOf(String(num(thickness, 0))) >= 0; }); if (th.length === 1) all = th; }
    return all.length === 1 ? all[0].id : null;
  }
  function lineFromStudioPanel(sp, pl) {
    var itemId = matchSheetItem(pl, sp.material, sp.thickness), edgeItemId = (sp.edgeLong || sp.edgeShort) ? matchEdgeItem(pl, sp.material, sp.thickness) : null;
    var l = { id: newId('ln'), type: 'panel', name: sp.name || sp.code || 'Panel', code: sp.code, material: sp.material, thickness: sp.thickness,
      lengthCm: sp.lengthMm / 10, widthCm: sp.widthMm / 10, qty: sp.qty, itemId: itemId, edges: (sp.edgeLong || sp.edgeShort) ? 'counts' : 'none',
      edgeLong: sp.edgeLong, edgeShort: sp.edgeShort, edgeItemId: edgeItemId, unitCost: null, listCost: null, overridden: false };
    l.src = srcCopy(sp); l.src.itemId = itemId; l.src.edgeItemId = edgeItemId; l.src.fp = panelFp(sp);
    return l;
  }
  // One section per room (rooms in the job order), then one for panels in no room.
  function importFromJob(job, pl) {
    var panels = studioPanels(job), sections = [], rooms = (job && job.rooms) || [];
    rooms.forEach(function (r) { sections.push({ id: newId('sec'), name: r.name || 'Room', roomId: r.id, lines: [] }); });
    var other = { id: newId('sec'), name: 'No room', roomId: null, lines: [] };
    panels.forEach(function (sp) {
      var line = lineFromStudioPanel(sp, pl), sec = sections.find(function (s) { return s.roomId && s.roomId === sp.roomId; });
      (sec || other).lines.push(line);
    });
    if (other.lines.length) sections.push(other);
    sections = sections.filter(function (s) { return s.lines.length; });
    var all = []; sections.forEach(function (s) { s.lines.forEach(function (l) { all.push(l); }); });
    return { sections: sections, skipped: panels.skipped, count: all.length,
      noSheet: all.filter(function (l) { return !l.itemId; }).length, noEdge: all.filter(function (l) { return l.edges === 'counts' && !l.edgeItemId; }).length,
      source: { projectId: job.id, importedAt: new Date().toISOString(), updatedAt: null, panelCount: all.length, dropped: {} } };
  }
  function importedLines(version) {
    var out = []; (version.sections || []).forEach(function (s) { (s.lines || []).forEach(function (l) { if (l.type === 'panel' && l.src) out.push({ sec: s, line: l }); }); }); return out;
  }
  // Which of the Studio values on a line has the user changed inside the estimate?
  function lineEditedFields(l) {
    var s = l.src, out = []; if (!s) return out;
    if (String(l.name || '') !== String(s.name || s.code || '') && String(l.name || '') !== String(s.name || '')) out.push('name');
    if (Math.round(num(l.lengthCm, 0) * 10) !== Math.round(s.lengthMm)) out.push('lengthMm');
    if (Math.round(num(l.widthCm, 0) * 10) !== Math.round(s.widthMm)) out.push('widthMm');
    if (num(l.qty, 0) !== s.qty) out.push('qty');
    if (num(l.edgeLong, 0) !== s.edgeLong) out.push('edgeLong');
    if (num(l.edgeShort, 0) !== s.edgeShort) out.push('edgeShort');
    return out;
  }
  // What changed in Studio since the snapshot, and what an update would touch.
  function diffAgainstJob(version, job) {
    var cur = studioPanels(job), byId = {}; cur.forEach(function (sp) { byId[sp.srcId] = sp; });
    var lines = importedLines(version), have = {}; lines.forEach(function (x) { have[x.line.src.srcId] = x; });
    var dropped = (version.source && version.source.dropped) || {};
    var added = cur.filter(function (sp) { return !have[sp.srcId] && dropped[sp.srcId] !== panelFp(sp); });
    var removed = lines.filter(function (x) { return !byId[x.line.src.srcId]; }).map(function (x) { return { line: x.line, sec: x.sec, edited: lineEditedFields(x.line) }; });
    var changed = [];
    lines.forEach(function (x) {
      var sp = byId[x.line.src.srcId]; if (!sp || panelFp(sp) === x.line.src.fp) return;
      var fields = SRC_FIELDS.filter(function (k) { return String(sp[k] === undefined ? '' : sp[k]) !== String(x.line.src[k] === undefined ? '' : x.line.src[k]); });
      changed.push({ line: x.line, sec: x.sec, panel: sp, fields: fields, edited: lineEditedFields(x.line) });
    });
    return { stale: !!(added.length || removed.length || changed.length), added: added, removed: removed, changed: changed, skipped: cur.skipped };
  }
  function sectionFor(version, sp) {
    var s = (version.sections || []).find(function (x) { return sp.roomId ? x.roomId === sp.roomId : (!x.roomId && x.name === 'No room'); });
    if (!s) { s = { id: newId('sec'), name: sp.roomId ? (sp.roomName || 'Room') : 'No room', roomId: sp.roomId || null, lines: [] }; version.sections.push(s); }
    return s;
  }
  // Applies an update the user has agreed to. Estimate-side edits are protected: a line the user changed keeps its
  // own values (only its Studio reference is refreshed); sheet settings, sheet quantities and prices are never touched.
  function applyUpdate(version, job, pl) {
    var d = diffAgainstJob(version, job), kept = [], did = { added: 0, removed: 0, changed: 0 };
    d.added.forEach(function (sp) { sectionFor(version, sp).lines.push(lineFromStudioPanel(sp, pl)); did.added++; });
    d.removed.forEach(function (x) {
      if (x.edited.length) { x.line.removedInStudio = true; kept.push({ code: x.line.src.code, name: x.line.name, why: 'removed in Studio, kept because you changed it here' }); return; }
      x.sec.lines = x.sec.lines.filter(function (l) { return l.id !== x.line.id; }); did.removed++;
    });
    // Field by field: a value Studio changed is applied unless the user also changed that same value in the
    // estimate, in which case the estimate value stays and is listed.
    d.changed.forEach(function (c) {
      var l = c.line, sp = c.panel, keptFields = [], applied = false;
      c.fields.forEach(function (f) {
        if (c.edited.indexOf(f) >= 0) { keptFields.push(f); return; }
        applied = true;
        if (f === 'name') l.name = sp.name || sp.code || 'Panel';
        else if (f === 'lengthMm') l.lengthCm = sp.lengthMm / 10;
        else if (f === 'widthMm') l.widthCm = sp.widthMm / 10;
        else if (f === 'thickness') l.thickness = sp.thickness;
        else if (f === 'qty') l.qty = sp.qty;
        else if (f === 'material') l.material = sp.material;
        else if (f === 'edgeLong') l.edgeLong = sp.edgeLong;
        else if (f === 'edgeShort') l.edgeShort = sp.edgeShort;
      });
      l.code = sp.code;
      if (c.fields.indexOf('edgeLong') >= 0 || c.fields.indexOf('edgeShort') >= 0) l.edges = (num(l.edgeLong, 0) || num(l.edgeShort, 0)) ? 'counts' : 'none';
      // Re-match the price-list item only if the user had not chosen a different one.
      if ((c.fields.indexOf('material') >= 0 || c.fields.indexOf('thickness') >= 0) && l.itemId === l.src.itemId) l.itemId = matchSheetItem(pl, l.material, l.thickness);
      if ((c.fields.indexOf('material') >= 0 || c.fields.indexOf('thickness') >= 0 || c.fields.indexOf('edgeLong') >= 0 || c.fields.indexOf('edgeShort') >= 0) && l.edgeItemId === l.src.edgeItemId)
        l.edgeItemId = (num(l.edgeLong, 0) || num(l.edgeShort, 0)) ? matchEdgeItem(pl, l.material, l.thickness) : null;
      if (c.fields.indexOf('roomId') >= 0) { c.sec.lines = c.sec.lines.filter(function (x) { return x.id !== l.id; }); sectionFor(version, sp).lines.push(l); }
      if (applied) did.changed++;
      if (keptFields.length) kept.push({ code: sp.code, name: l.name, why: 'Studio changed ' + keptFields.map(function (f) { return SRC_LABELS[f]; }).join(', ') + ', but you changed ' + (keptFields.length > 1 ? 'them' : 'it') + ' in the estimate, so your ' + (keptFields.length > 1 ? 'values are' : 'value is') + ' kept' });
      l.src = srcCopy(sp); l.src.itemId = l.itemId; l.src.edgeItemId = l.edgeItemId; l.src.fp = panelFp(sp);
    });
    version.source = version.source || {}; version.source.updatedAt = new Date().toISOString(); version.source.panelCount = importedLines(version).length;
    return { did: did, kept: kept };
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
    sheetDemand: sheetDemand, edgingDemand: edgingDemand, syncDerived: syncDerived, cfgOf: cfgOf, legacyCfg: legacyCfg, matKey: matKey, sheetKeyOf: sheetKeyOf,
    studioPanels: studioPanels, importFromJob: importFromJob, diffAgainstJob: diffAgainstJob, applyUpdate: applyUpdate, importedLines: importedLines,
    lineEditedFields: lineEditedFields, matchSheetItem: matchSheetItem, matchEdgeItem: matchEdgeItem, panelFp: panelFp, SRC_LABELS: SRC_LABELS,
    compute: compute, validateForSave: validateForSave, saveVersion: saveVersion, editAsNewVersion: editAsNewVersion,
    priceDifferences: priceDifferences, applyPriceRefresh: applyPriceRefresh, suggestedOf: suggestedOf
  };
});
