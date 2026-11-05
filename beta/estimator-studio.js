/* FittersIQ Estimator for Studio (spec v1.1). Internal costing only.
   Writes ONLY state.estimates and state.priceList. Reads jobs, rooms and customers; never writes
   them, never touches production panels, Panel Check, supplier files, stickers or Mobile.
   Entry points: an "Estimate" button on New Job cards, a "Cost estimates" group at the top of the
   Customer Library's Estimate tab, window.fiqOpenEstimator(jobId) and window.fiqOpenPriceList(). */
(function () {
  'use strict';
  if (window.__fiqEstimatorLoaded) return; window.__fiqEstimatorLoaded = true;
  var C = window.FiqEstimatorCore;
  if (!C) { console.error('Estimator: estimator-core.js did not load'); return; }

  // ---------- data access ----------
  function st() { try { return (0, eval)('state'); } catch (e) { return null; } }
  function jobs() { var s = st(); return (s && s.projects) || []; }
  function jobById(id) { return jobs().find(function (p) { return p.id === id; }) || null; }
  function estimates() { var s = st(); return (s && Array.isArray(s.estimates)) ? s.estimates : []; }
  function priceList() { var s = st(); return C.normalisePriceList(s && s.priceList); }
  function canWrite() { var g = window.fiqEditor; return !(g && g.role && g.role !== 'editor'); }
  function user() { return window.fittersiqUser || null; }
  function who() { var u = user(); return (u && u.uid) || null; }
  // Price list editing: the company owner, or a member the owner has listed as a price list
  // administrator (companies/{companyId}.priceListAdmins, which only the owner or FittersIQ support
  // may change under the existing Firestore rules). Not signed in = single local user.
  var admins = { loaded: false, list: [], members: [], error: null };
  function isOwner() { var u = user(); return !!(u && u.role === 'company_owner'); }
  function canEditPrices() {
    if (!canWrite()) return false;
    var u = user(); if (!u || !u.uid) return true;
    return isOwner() || (admins.loaded && admins.list.indexOf(u.uid) >= 0);
  }
  function fsFns() { return window.fiqAuthFns && window.fiqFirestore ? window.fiqAuthFns : null; }
  function loadAdmins(force) {
    var u = user(), f = fsFns(); if (!u || !u.companyId || !f) return Promise.resolve();
    if (admins.loaded && !force) return Promise.resolve();
    var cref = f.doc(window.fiqFirestore, 'companies', u.companyId);
    return f.getDoc(cref).then(function (snap) {
      var d = snap && snap.exists() ? snap.data() : {}; admins.list = Array.isArray(d.priceListAdmins) ? d.priceListAdmins.slice() : []; admins.loaded = true;
      if (!isOwner()) return;
      return f.getDocs(f.collection(window.fiqFirestore, 'companies', u.companyId, 'members')).then(function (q) {
        var roster = ((st() || {}).fitters || []);
        admins.members = q.docs.map(function (m) { var x = m.data() || {}; var fit = roster.find(function (r) { return 'fitter_' + r.id === m.id || r.id === x.fitterId; });
          return { uid: m.id, role: x.role, status: x.status, label: (fit && fit.name) || x.email || x.displayName || m.id }; })
          .filter(function (m) { return m.uid !== u.uid && m.status === 'active'; });
      });
    }).catch(function (e) { admins.error = e && e.message; admins.loaded = true; });
  }
  function setAdmin(uid, on) {
    var u = user(), f = fsFns(); if (!isOwner() || !f) return;
    var next = admins.list.filter(function (x) { return x !== uid; }); if (on) next.push(uid);
    f.updateDoc(f.doc(window.fiqFirestore, 'companies', u.companyId), { priceListAdmins: next })
      .then(function () { admins.list = next; renderPriceList(); })
      .catch(function (e) { alert('Could not change price list administrators: ' + (e && e.message)); renderPriceList(); });
  }
  var saveTimer = null;
  function persist(now) {
    if (!canWrite()) return;
    clearTimeout(saveTimer);
    var go = function () { var tick = document.getElementById('fiqxAutosave'); if (tick) tick.textContent = 'Draft saved ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); if (typeof save === 'function') save(); if (now && typeof window.a131StableSave === 'function') { try { window.a131StableSave(false); } catch (e) { console.error(e); } } };
    if (now) go(); else saveTimer = setTimeout(go, 350);
  }
  function writeEstimates(fn) { var s = st(); if (!s || !canWrite()) return; if (!Array.isArray(s.estimates)) s.estimates = []; fn(s.estimates); persist(); }
  function writePriceList(fn) { var s = st(); if (!s || !canEditPrices()) return; s.priceList = C.normalisePriceList(s.priceList); fn(s.priceList); persist(true); }
  function packFn() { return typeof window.a181Pack === 'function' ? window.a181Pack : null; }

  // ---------- helpers ----------
  function esc(v) { return String(v === null || v === undefined ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(v) { return v === null || v === undefined ? '—' : '€' + Number(v).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function amt(v) { return v === null || v === undefined ? '' : String(v); }
  function jobTitle(p) { return p ? (p.customer || p.name || 'Untitled job') + (p.customer && p.name && p.name !== p.customer ? ' · ' + p.name : '') + (p.address ? ' · ' + p.address : '') : 'Job'; }
  function statusChip(e) { var m = { draft: ['Draft', 'warn'], saved: ['Saved', 'info'], won: ['Won', 'ok'], lost: ['Lost', 'muted'] }[e.status] || [e.status, 'muted']; return '<span class="fiqx-chip fiqx-' + m[1] + '">' + m[0] + '</span>'; }
  function catLabel(k) { var c = C.CATEGORIES.find(function (x) { return x[0] === k; }); return c ? c[1] : k; }
  function activeItems(pred) { return priceList().items.filter(function (i) { return !i.archived && (!pred || pred(i)); }); }
  function itemOptions(sel, pred, blank) {
    var list = activeItems(pred), cur = sel && !list.some(function (i) { return i.id === sel; }) ? C.findItem(priceList(), sel) : null;
    return '<option value="">' + esc(blank || 'Choose…') + '</option>' + (cur ? '<option value="' + esc(cur.id) + '" selected>' + esc(cur.name) + ' (archived)</option>' : '') +
      list.map(function (i) { return '<option value="' + esc(i.id) + '"' + (i.id === sel ? ' selected' : '') + '>' + esc(i.name) + (i.cost !== null ? ' · ' + money(i.cost) + '/' + i.unit : ' · no price') + '</option>'; }).join('');
  }

  // ---------- styles ----------
  var css = '' +
    '.fiqx-ov{position:fixed;inset:0;z-index:99990;background:rgba(11,37,69,.45);display:flex;align-items:stretch;justify-content:center;padding:18px;font-family:inherit}' +
    '.fiqx-win{background:#f6f8fb;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.3);width:min(1280px,100%);display:flex;flex-direction:column;overflow:hidden;color:#0b2545}' +
    '.fiqx-top{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 14px;background:#fff;border-bottom:1px solid #dfe5ee}' +
    '.fiqx-top h2{font-size:16px;margin:0 8px 0 0}.fiqx-sub{color:#5b6b80;font-size:13px}.fiqx-sp{flex:1}' +
    '.fiqx-chip{font-size:11px;font-weight:800;padding:3px 8px;border-radius:999px}.fiqx-warn{background:#fff4d6;color:#8a5a00}.fiqx-info{background:#e3efff;color:#1d4f91}.fiqx-ok{background:#dff5e6;color:#17663a}.fiqx-muted{background:#eceff3;color:#5b6b80}' +
    '.fiqx-internal{font-size:11px;font-weight:800;color:#8a5a00;background:#fff4d6;border:1px solid #f1d58a;padding:3px 8px;border-radius:6px}' +
    '.fiqx-btn{border:1px solid #c9d3e0;background:#fff;color:#0b2545;border-radius:8px;padding:6px 11px;font-weight:700;font-size:13px;cursor:pointer}.fiqx-btn:hover{background:#f0f4f9}' +
    '.fiqx-pri{background:#0b2545;color:#fff;border-color:#0b2545}.fiqx-pri:hover{background:#163a66}.fiqx-btn[disabled]{opacity:.45;cursor:not-allowed}' +
    '.fiqx-body{flex:1;overflow:auto;display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:14px;padding:14px}' +
    '.fiqx-body.single{grid-template-columns:minmax(0,1fr)}' +
    '.fiqx-card{background:#fff;border:1px solid #dfe5ee;border-radius:12px;padding:12px;margin-bottom:12px}' +
    '.fiqx-card h3{font-size:14px;margin:0 0 8px}.fiqx-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}' +
    '.fiqx-in{border:1px solid #c9d3e0;border-radius:7px;padding:5px 7px;font:inherit;font-size:13px;background:#fff;color:#0b2545;min-width:0}' +
    '.fiqx-in.num{width:78px;text-align:right}.fiqx-in.wide{width:100%}.fiqx-in:disabled{background:#f3f5f8}' +
    '.fiqx-t{width:100%;border-collapse:collapse;font-size:13px}.fiqx-t th{text-align:left;color:#5b6b80;font-weight:700;font-size:12px;padding:4px}.fiqx-t td{padding:3px 4px;border-top:1px solid #edf1f6;vertical-align:middle}' +
    '.fiqx-x{border:0;background:none;color:#a33;font-size:16px;cursor:pointer}.fiqx-ovr{font-size:11px;color:#8a5a00}' +
    '.fiqx-sum{position:sticky;top:0;align-self:start}.fiqx-sum .l{display:flex;justify-content:space-between;align-items:center;padding:4px 0;font-size:13px}' +
    '.fiqx-sum .l span:first-child{color:#5b6b80}.fiqx-sum .big{font-size:18px;font-weight:800}.fiqx-sum .sep{border-top:1px solid #dfe5ee;margin:6px 0}' +
    '.fiqx-q{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;margin:2px 0 4px}.fiqx-q button{font-size:11px;padding:2px 7px;border:1px solid #c9d3e0;border-radius:6px;background:#fff;cursor:pointer}' +
    '.fiqx-warnbox{background:#fff4d6;border:1px solid #f1d58a;color:#7a4d00;border-radius:8px;padding:6px 8px;font-size:12px;margin:6px 0}' +
    '.fiqx-list button.fiqx-item{display:flex;width:100%;justify-content:space-between;align-items:center;text-align:left;border:1px solid #dfe5ee;background:#fff;border-radius:10px;padding:10px 12px;margin-bottom:8px;cursor:pointer;font:inherit}' +
    '.fiqx-side{position:fixed;right:18px;top:70px;bottom:18px;width:360px;background:#fff;border:1px solid #dfe5ee;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,.25);z-index:99995;overflow:auto;padding:12px}' +
    '.fiqx-side img{width:100%;border-radius:8px;margin:4px 0}' +
    '#fiqxStudioEstimatorBtn{flex-shrink:0;padding:6px 10px;font-size:11px;min-height:0;font-weight:800;background:#e8f0ff;border-color:#8fa8df;color:#0b2545}' +
    '@media(max-width:1100px){#screen-mark #fiqxStudioEstimatorBtn{grid-column:1 / -1;width:100%}}' +
    '.fiqx-cfg{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;margin-top:4px;font-size:12px;color:#5b6b80}.fiqx-cfg label{display:flex;gap:4px;align-items:center;white-space:nowrap}.fiqx-cfg .fiqx-in.num{width:62px}' +
    '.fiqx-need{border-color:#d9822b;background:#fff7ea}.fiqx-studio{border-color:#8fa8df}.fiqx-stale{border-color:#e0a030;background:#fffaf0}' +
    '.fiqx-modal-bg{position:fixed;inset:0;z-index:99999;background:rgba(11,37,69,.5);display:flex;align-items:center;justify-content:center;padding:18px}' +
    '.fiqx-modal{background:#fff;border-radius:12px;max-width:760px;width:100%;max-height:88vh;overflow:auto;padding:16px;box-shadow:0 20px 60px rgba(0,0,0,.35)}.fiqx-modal h3{margin:0 0 6px}.fiqx-modal ul{margin:4px 0 10px 18px;padding:0}.fiqx-modal li{margin:3px 0;font-size:13px}' +
    '.fiqx-nav{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:8px;padding:8px 12px;background:#fff;border-bottom:1px solid #dfe5ee;flex:0 0 auto}' +
    '.fiqx-nbtn{min-height:48px;font:inherit;font-size:15px;font-weight:800;color:#0b2545;background:#fff;border:2px solid #c9d3e0;border-radius:10px;cursor:pointer;padding:6px 10px}.fiqx-nbtn:hover{background:#f0f4f9}' +
    '.fiqx-nbtn.fiqx-npri{background:#0b2545;color:#fff;border-color:#0b2545}.fiqx-nbtn[disabled]{opacity:.5;cursor:not-allowed}' +
    '.fiqx-navmsg{grid-column:1 / -1;font-size:13px;color:#8a5a00;min-height:0}.fiqx-navmsg:empty{display:none}' +
    '.fiqx-title{font-size:24px;font-weight:800;line-height:1.25}.fiqx-head{margin:2px 0 10px}.fiqx-head .fiqx-row{margin-top:6px}' +
    '.fiqx-h{font-size:14px;font-weight:800;letter-spacing:.05em;color:#5b6b80;margin:0 0 4px}' +
    '.fiqx-lg{min-height:44px;font-size:14px;font-weight:800;padding:6px 14px}' +
    '.fiqx-fold{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}.fiqx-pbody{margin-top:10px;overflow-x:auto}' +
    '.fiqx-warnline{display:flex;flex-wrap:wrap;gap:6px 16px;background:#fff4d6;border:1px solid #f1d58a;color:#7a4d00;border-radius:10px;padding:8px 12px;font-size:14px;font-weight:700;margin-bottom:12px}.fiqx-warnline a{color:#7a4d00;text-decoration:underline;font-weight:800}' +
    '.fiqx-mrow{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:4px 16px;align-items:baseline;padding:12px 0;border-top:1px solid #edf1f6}.fiqx-mrow:first-child{border-top:0}' +
    '.fiqx-mname{font-size:18px;font-weight:800;text-transform:uppercase;letter-spacing:.01em;overflow-wrap:anywhere}.fiqx-mbig{font-size:28px;font-weight:800;white-space:nowrap}.fiqx-mcost{min-width:84px;text-align:right;color:#5b6b80;font-size:15px}' +
    '.fiqx-edging{border-top:1px solid #edf1f6;margin-top:4px;padding-top:6px}.fiqx-erow{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:4px 16px;font-size:14px;color:#5b6b80;padding:3px 0}.fiqx-erow span:nth-child(2),.fiqx-erow span:nth-child(3){text-align:right;min-width:84px}.fiqx-cuts{margin-top:4px}' +
    '.fiqx-sg{border-top:1px solid #edf1f6;padding:10px 0}.fiqx-sg:first-child{border-top:0}.fiqx-sgname{font-size:15px;margin-bottom:6px}' +
    '.fiqx-fields{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px 10px;align-items:end}.fiqx-field{display:flex;flex-direction:column;gap:3px;font-size:12px;font-weight:700;color:#5b6b80}.fiqx-field .fiqx-in.num{width:100%;text-align:left}.fiqx-field small{font-weight:600;color:#7a8799}.fiqx-chk{flex-direction:row;align-items:center;gap:6px;font-size:13px;min-height:32px}' +
    '.fiqx-note{font-size:12px;color:#8a5a00;margin-top:6px}' +
    '.fiqx-total{display:flex;justify-content:space-between;align-items:baseline;gap:8px;background:#dff5e6;color:#17663a;border-radius:10px;padding:10px 12px;margin:8px 0;font-weight:800}.fiqx-total b{font-size:26px}' +
    '.fiqx-inl{display:flex;gap:4px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.fiqx-sm{padding:2px 8px;font-size:12px}' +
    '@media(max-width:900px){.fiqx-body{grid-template-columns:minmax(0,1fr)}.fiqx-sum{position:static}}' +
    '@media(max-width:600px){.fiqx-ov{padding:0}.fiqx-win{border-radius:0}.fiqx-nav{grid-template-columns:1fr 1fr}.fiqx-nav .fiqx-npri{grid-column:1 / -1}.fiqx-title{font-size:19px}.fiqx-mbig{font-size:22px}.fiqx-body{padding:10px}}' +
    '.fiqx-est-btn{margin-left:6px}.fiqx-cl{margin-bottom:14px}.fiqx-cl h4{margin:6px 0}.fiqx-cl .fiqx-clrow{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:6px 8px;border:1px solid #dfe5ee;border-radius:8px;margin:4px 0;background:#fff;cursor:pointer;width:100%;font:inherit;text-align:left}';
  function ensureStyle() { if (document.getElementById('fiqx-style')) return; var s = document.createElement('style'); s.id = 'fiqx-style'; s.textContent = css; document.head.appendChild(s); }

  // ---------- Estimator ----------
  var view = null; // {projectId, mode:'choose'|'edit'|'version', estId, n}
  // Where Studio was when the Estimator opened (job, design, screen), so Back to Studio can put it back exactly.
  var origin = null;
  function activeScreenName() { var s = document.querySelector('.screen.active'); return s && s.id ? s.id.replace(/^screen-/, '') : null; }
  function captureOrigin() { var s = st() || {}; origin = { projectId: s.currentProject || null, cabinetId: s.currentCabinet || null, screen: activeScreenName() }; }
  function overlay(id) {
    ensureStyle(); var o = document.getElementById(id);
    if (!o) { if (id === 'fiqxEst') captureOrigin(); o = document.createElement('div'); o.id = id; o.className = 'fiqx-ov'; document.body.appendChild(o); }
    return o;
  }
  // The red BETA strip is fixed over the top of the page; keep the Estimator (and its buttons) below it.
  function padForBanner(o) { var b = document.getElementById('fiqBetaBanner'), h = b ? Math.ceil(b.getBoundingClientRect().height) : 0; o.style.paddingTop = h ? (h + 6) + 'px' : ''; }
  function closeEstimator() { var o = document.getElementById('fiqxEst'); if (o) o.remove(); closeSide(); view = null; origin = null; persist(true); }
  function backToStudio() {
    var o = origin; closeEstimator(); if (!o) return;
    try {
      var s = st() || {};
      if (o.projectId && (s.currentProject !== o.projectId || (o.cabinetId && s.currentCabinet !== o.cabinetId))) switchToProject(o.projectId, o.cabinetId || null);
      if (o.screen && activeScreenName() !== o.screen) { if (typeof renderAll === 'function') renderAll(); show(o.screen); }
    } catch (x) { console.error('Estimator: back to Studio', x); }
  }
  // The job page: the same job, its rooms and designs. Never a general job list.
  function toCustomerJob() {
    var pid = view && view.projectId; closeEstimator(); if (!pid) return;
    try {
      var j = jobById(pid); switchToProject(pid, (j && j.cabinets && j.cabinets[0] && j.cabinets[0].id) || null);
      if (typeof save === 'function') save(); renderAll(); show('jobs');
    } catch (x) { console.error('Estimator: customer job', x); }
  }
  function estById(id) { return estimates().find(function (e) { return e.id === id; }) || null; }
  function jobEstimates(pid) { return estimates().filter(function (e) { return e.projectId === pid && !e.archived; }); }

  function openEstimator(projectId, estId) {
    if (!projectId && typeof window.project === 'function') { var cur = window.project(); projectId = cur && cur.id; }
    if (!projectId) { try { var c = (0, eval)('typeof project==="function"&&project()'); projectId = c && c.id; } catch (e) {} }
    if (!projectId || !jobById(projectId)) { alert('Open or choose a job first, then press Estimate.'); return; }
    if (estId) view = { projectId: projectId, mode: estById(estId) && estById(estId).draft ? 'edit' : 'version', estId: estId };
    else view = { projectId: projectId, mode: 'choose' };
    if (view.mode === 'version') { var e = estById(estId); view.n = e.versions.length ? e.versions[e.versions.length - 1].n : null; }
    render();
  }
  // ---- panels copied from Studio ----
  // Initial sheet settings come from Panel Check (the job own settings first, then this browser, then the material
  // default: 3 mm saw cut, 5 mm trim, grain by material). Read only; stored in the estimate, never back.
  function panelCheckCfg(job, material, thickness) {
    if (typeof window.a181CfgFor !== 'function' || typeof window.a181LoadSettings !== 'function') return null;
    try { var c = window.a181CfgFor(window.a181LoadSettings(), material, thickness, job); return { w: c.w, h: c.h, kerf: c.kerf, trim: c.trim, grain: !!c.grain, from: 'panelcheck' }; } catch (x) { return null; }
  }
  function ensureCfg(version, item, line, job) {
    if (!item || !version.sheetCfg || version.sheetCfg[item.id]) return;
    var c = panelCheckCfg(job, (line && line.material) || item.name, (line && line.thickness) || (item.sheet && item.sheet.thickness) || 0);
    if (c) version.sheetCfg[item.id] = c;
  }
  function initCfgs(version, job) { C.importedLines(version).forEach(function (x) { ensureCfg(version, C.findItem(priceList(), x.line.itemId), x.line, job); }); }
  function setCfg(e, a, t) {
    var pp = a.split('|'), id = pp[0], f = pp[1], d = e.draft; d.sheetCfg = d.sheetCfg || {};
    var cur = d.sheetCfg[id] || C.cfgOf(d, id, C.findItem(priceList(), id));
    cur = { w: cur.w, h: cur.h, kerf: cur.kerf, trim: cur.trim, grain: cur.grain, from: cur.from || 'estimate' };
    if (f === 'grain') cur.grain = !!t.checked; else { var n = C.parseAmount(t.value); cur[f] = n === null ? 0 : n; }
    d.sheetCfg[id] = cur;
  }
  function importInto(e) {
    var p = jobById(e.projectId); if (!p || !canWrite() || !e.draft) return;
    var imp = C.importFromJob(p, priceList()); if (!imp.count) { alert('This job has no panels with a length and width in Studio yet.'); return; }
    var d = e.draft, hasLines = d.sections.some(function (s) { return s.lines.length; });
    d.sections = hasLines ? d.sections.concat(imp.sections) : imp.sections;
    d.source = imp.source; d.source.skipped = imp.skipped; d.sheetCfg = d.sheetCfg || {}; initCfgs(d, p);
  }
  function sourceVersion(e) { var v = e.draft || e.versions[e.versions.length - 1]; return v && v.source ? v : null; }
  function staleChip(e) {
    var v = sourceVersion(e), p = v && jobById(e.projectId), d = null; if (!v || !p) return '';
    try { d = C.diffAgainstJob(v, p); } catch (x) { return ''; }
    return d.stale ? '<span class="fiqx-chip fiqx-warn" title="The Studio design changed after these panels were copied">Studio changed</span> ' : '';
  }
  function diffSummary(d) { var b = []; if (d.changed.length) b.push(d.changed.length + ' changed'); if (d.added.length) b.push(d.added.length + ' new'); if (d.removed.length) b.push(d.removed.length + ' removed'); return b.join(', '); }
  function openDiffModal(e) {
    var p = jobById(e.projectId), o = document.getElementById('fiqxEst'); if (!p || !o || !e.draft) return;
    var d = C.diffAgainstJob(e.draft, p), old = document.getElementById('fiqxDiff'); if (old) old.remove();
    var fmt = function (k, v) { return v === '' || v === undefined || v === null ? 'none' : (k === 'lengthMm' || k === 'widthMm' ? v + ' mm' : (k === 'roomId' ? 'another room' : v)); };
    var nm = function (l) { return esc((l.src && l.src.code ? l.src.code + ' ' : '') + (l.name || '')); };
    var changed = d.changed.map(function (c) {
      return '<li><strong>' + nm(c.line) + '</strong>: ' + c.fields.map(function (f) { var kept = c.edited.indexOf(f) >= 0;
        return esc(C.SRC_LABELS[f]) + ' ' + esc(fmt(f, c.line.src[f])) + ' → ' + esc(fmt(f, c.panel[f])) + (kept ? ' <span class="fiqx-ovr">(you changed this here, your value is kept)</span>' : ''); }).join('; ') + '</li>'; }).join('');
    var added = d.added.map(function (sp) { return '<li><strong>' + esc(sp.code + ' ' + sp.name) + '</strong> × ' + sp.qty + (sp.roomName ? ' (' + esc(sp.roomName) + ')' : '') + '</li>'; }).join('');
    var removed = d.removed.map(function (x) { return '<li><strong>' + nm(x.line) + '</strong>' + (x.edited.length ? ' <span class="fiqx-ovr">(kept, because you changed it here)</span>' : '') + '</li>'; }).join('');
    var bg = document.createElement('div'); bg.id = 'fiqxDiff'; bg.className = 'fiqx-modal-bg';
    bg.innerHTML = '<div class="fiqx-modal"><h3>Studio design changed</h3><div class="fiqx-sub">Nothing changes until you press Update. Studio itself is never changed.</div>' +
      (changed ? '<h4>Changed in Studio</h4><ul>' + changed + '</ul>' : '') + (added ? '<h4>New in Studio, will be added</h4><ul>' + added + '</ul>' : '') + (removed ? '<h4>Removed in Studio</h4><ul>' + removed + '</ul>' : '') +
      '<div class="fiqx-warnbox">Not touched by an update: sheet sizes, saw cut and trim, sheet quantities you typed, prices, markup, labour and every other cost in this estimate.</div>' +
      '<div class="fiqx-row" style="justify-content:flex-end"><button class="fiqx-btn" data-act="studioclose">Cancel</button><button class="fiqx-btn fiqx-pri" data-act="studioapply"' + (canWrite() ? '' : ' disabled') + '>Update estimate from Studio</button></div></div>';
    o.appendChild(bg);
  }
  function newEstimateFor(projectId, withImport) {
    if (!canWrite()) { alert('This Studio window is read-only.'); return null; }
    var p = jobById(projectId), n = jobEstimates(projectId).length + 1;
    var est = C.newEstimate({ projectId: projectId, customerId: p && p.customerId, customer: p && p.customer, name: 'Estimate ' + n }, priceList());
    var rooms = (p && p.rooms) || [];
    if (rooms.length) { est.draft.sections = rooms.map(function (r) { return { id: C.newId('sec'), name: r.name || 'Room', roomId: r.id, lines: [] }; }); }
    if (withImport) { var imp = C.importFromJob(p, priceList()); if (imp.count) { est.draft.sections = imp.sections; est.draft.source = imp.source; est.draft.source.skipped = imp.skipped; est.draft.sheetCfg = {}; initCfgs(est.draft, p); } }
    writeEstimates(function (list) { list.push(est); });
    return est;
  }

  function render() {
    if (!view) return;
    if (view.mode === 'pick') return openPicker();
    var o = overlay('fiqxEst'), p = jobById(view.projectId); padForBanner(o);
    if (view.mode === 'choose') { o.innerHTML = chooserHtml(p); return; }
    var e = estById(view.estId); if (!e) { view.mode = 'choose'; return render(); }
    if (view.mode === 'edit' && !e.draft) { view.mode = 'version'; view.n = e.versions.length ? e.versions[e.versions.length - 1].n : null; }
    // Panel details open by themselves only when there are no panels yet (nothing else to look at).
    if (!view.open) view.open = { panels: !panelLines(e.draft || e.versions[e.versions.length - 1] || { sections: [] }).length, sheets: false };
    var sc = document.querySelector('#fiqxEst .fiqx-body'), top = sc && view.lastMode === view.mode ? sc.scrollTop : 0;
    o.innerHTML = view.mode === 'edit' ? editorHtml(p, e) : versionHtml(p, e);
    view.lastMode = view.mode;
    if (view.mode === 'edit') { refreshDerived(e); }
    var sc2 = document.querySelector('#fiqxEst .fiqx-body'); if (sc2 && top) sc2.scrollTop = top;
  }
  function topBar(p, e, extra) {
    return '<div class="fiqx-top"><h2>Estimator</h2><span class="fiqx-sub">' + esc(jobTitle(p)) + '</span>' + (e ? statusChip(e) : '') +
      '<span class="fiqx-internal">Internal estimate · not for production</span><span class="fiqx-sp"></span>' + (extra || '') +
      '<button class="fiqx-btn" data-act="site">Site measurements</button><button class="fiqx-btn" data-act="pricelist">Price list</button>' +
      '<button class="fiqx-btn" data-act="close">Close</button></div>';
  }
  function chooserHtml(p) {
    var list = jobEstimates(p.id);
    return '<div class="fiqx-win">' + topBar(p, null) + '<div class="fiqx-body single"><div><div class="fiqx-card"><h3>Estimates for this job</h3>' +
      '<p class="fiqx-sub">Internal costing only. Nothing here changes the job, its Cutting List, Panel Check, supplier files or Mobile.</p>' +
      '<div class="fiqx-list">' + (list.length ? list.map(function (e) {
        var last = e.versions[e.versions.length - 1];
        return '<button class="fiqx-item" data-act="open" data-id="' + esc(e.id) + '"><span><strong>' + esc(e.name) + '</strong> ' + statusChip(e) + staleChip(e) +
          '<span class="fiqx-sub"> ' + (last ? 'V' + last.n + ' · ' + money(C.suggestedOf(e)) : 'not saved yet') + (e.draft && last ? ' · draft of V' + (last.n + 1) : '') + '</span></span><span>›</span></button>';
      }).join('') : '<p class="fiqx-sub">No estimates yet.</p>') + '</div>' +
      '<button class="fiqx-btn fiqx-pri" data-act="new"' + (canWrite() ? '' : ' disabled') + '>New estimate</button></div></div></div></div>';
  }

  function lineRow(sec, l, ro) {
    var dis = ro ? ' disabled' : '', b = function (f) { return ' data-b="' + esc(sec.id) + '|' + esc(l.id) + '|' + f + '"'; };
    var total = l.unitCost !== null && l.unitCost !== undefined ? money(Math.round(l.unitCost * 100 * Math.max(0, Number(l.qty) || 0)) / 100) : '<span class="fiqx-ovr">no price</span>';
    var cost = '<input class="fiqx-in num" inputmode="decimal" value="' + esc(amt(l.unitCost)) + '"' + b('unitCost') + dis + '>' +
      (l.overridden && l.listCost !== null ? '<div class="fiqx-ovr">overridden · list ' + money(l.listCost) + (canEditPrices() && l.itemId && !ro ? ' · <a href="#" data-act="aslist" data-sec="' + esc(sec.id) + '" data-id="' + esc(l.id) + '">save as list price</a>' : '') + '</div>' : '');
    var x = ro ? '' : '<button class="fiqx-x" title="Remove" data-act="rmline" data-sec="' + esc(sec.id) + '" data-id="' + esc(l.id) + '">×</button>';
    if (l.type === 'panel') {
      var imported = !!l.src, need = !l.itemId ? ' fiqx-need' : '', edgePred = function (i) { return i.category === 'edging'; };
      var kind = imported ? 'Studio panel' + (l.code ? '<div class="fiqx-sub">' + esc(l.code) + '</div>' : '') + (l.removedInStudio ? '<div class="fiqx-ovr">removed in Studio</div>' : '') : 'Rough panel';
      var edgeCell;
      if (l.edges === 'counts') {
        var needE = ((Number(l.edgeLong) > 0 || Number(l.edgeShort) > 0) && !l.edgeItemId) ? ' fiqx-need' : '';
        edgeCell = '<span class="fiqx-sub">Long edges</span> <input class="fiqx-in num" style="width:46px" inputmode="numeric" value="' + esc(amt(l.edgeLong)) + '"' + b('edgeLong') + dis + '> <span class="fiqx-sub">Short edges</span> <input class="fiqx-in num" style="width:46px" inputmode="numeric" value="' + esc(amt(l.edgeShort)) + '"' + b('edgeShort') + dis + '> ' +
          '<select class="fiqx-in' + needE + '" data-s="' + esc(sec.id) + '|' + esc(l.id) + '|edgeItemId"' + dis + '>' + itemOptions(l.edgeItemId, edgePred, 'Edging…') + '</select>';
      } else {
        edgeCell = '<select class="fiqx-in" data-s="' + esc(sec.id) + '|' + esc(l.id) + '|edges"' + dis + '>' + [['none', 'No edging'], ['long', 'Long edges'], ['all', 'All edges']].map(function (o) { return '<option value="' + o[0] + '"' + ((l.edges || 'none') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>' +
          (l.edges && l.edges !== 'none' ? ' <select class="fiqx-in" data-s="' + esc(sec.id) + '|' + esc(l.id) + '|edgeItemId"' + dis + '>' + itemOptions(l.edgeItemId, edgePred, 'Edging…') + '</select>' : '');
      }
      return '<tr><td>' + kind + '</td><td><input class="fiqx-in" value="' + esc(l.name) + '" placeholder="e.g. Sides"' + b('name') + dis + '>' +
        (imported && l.material ? '<div class="fiqx-sub">Studio: ' + esc(l.material) + (l.thickness ? ' ' + esc(l.thickness) + ' mm' : '') + '</div>' : '') + '</td>' +
        '<td><input class="fiqx-in num" inputmode="decimal" value="' + esc(amt(l.lengthCm)) + '"' + b('lengthCm') + dis + '> × <input class="fiqx-in num" inputmode="decimal" value="' + esc(amt(l.widthCm)) + '"' + b('widthCm') + dis + '> cm</td>' +
        '<td><input class="fiqx-in num" inputmode="numeric" value="' + esc(amt(l.qty)) + '"' + b('qty') + dis + '></td>' +
        '<td colspan="2"><select class="fiqx-in' + need + '" data-s="' + esc(sec.id) + '|' + esc(l.id) + '|itemId"' + dis + '>' + itemOptions(l.itemId, function (i) { return i.category === 'sheet'; }, 'Sheet material…') + '</select> ' + edgeCell + '</td><td>' + x + '</td></tr>';
    }
    var nameCell = l.type === 'custom'
      ? '<input class="fiqx-in" value="' + esc(l.name) + '" placeholder="Item name"' + b('name') + dis + '> <select class="fiqx-in" data-s="' + esc(sec.id) + '|' + esc(l.id) + '|unit"' + dis + '>' + C.UNITS.map(function (u) { return '<option' + (u === l.unit ? ' selected' : '') + '>' + u + '</option>'; }).join('') + '</select>'
      : '<select class="fiqx-in" data-s="' + esc(sec.id) + '|' + esc(l.id) + '|itemId"' + dis + '>' + itemOptions(l.itemId, l.type === 'sheets' ? function (i) { return i.category === 'sheet'; } : function (i) { return i.category !== 'sheet'; }) + '</select>';
    return '<tr><td>' + { sheets: 'Sheets', item: 'Price list item', custom: 'Custom item' }[l.type] + '</td><td colspan="2">' + nameCell + '</td>' +
      '<td><input class="fiqx-in num" inputmode="decimal" value="' + esc(amt(l.qty)) + '"' + b('qty') + dis + '> <span class="fiqx-sub">' + esc(l.unit || '') + '</span></td>' +
      '<td>' + cost + '</td><td>' + total + '</td><td>' + x + '</td></tr>';
  }
  // Panel rows only: hardware, lighting and other priced lines are shown under Additional costs.
  function panelLines(v) { var out = []; ((v && v.sections) || []).forEach(function (s) { (s.lines || []).forEach(function (l) { if (l.type === 'panel') out.push(l); }); }); return out; }
  function sectionHtml(p, sec, ro) {
    var rooms = (p && p.rooms) || [], lines = (sec.lines || []).filter(function (l) { return l.type === 'panel'; });
    return '<div class="fiqx-card"><div class="fiqx-row"><input class="fiqx-in" style="font-weight:800" value="' + esc(sec.name) + '" data-sb="' + esc(sec.id) + '|name"' + (ro ? ' disabled' : '') + '>' +
      (rooms.length ? '<select class="fiqx-in" data-ss="' + esc(sec.id) + '|roomId"' + (ro ? ' disabled' : '') + '><option value="">No room</option>' + rooms.map(function (r) { return '<option value="' + esc(r.id) + '"' + (r.id === sec.roomId ? ' selected' : '') + '>' + esc(r.name) + '</option>'; }).join('') + '</select>' : '') +
      '<span class="fiqx-sp"></span>' + (ro ? '' : '<button class="fiqx-x" title="Remove section" data-act="rmsec" data-sec="' + esc(sec.id) + '">×</button>') + '</div>' +
      '<table class="fiqx-t"><thead><tr><th>Type</th><th>Item</th><th>Size</th><th>Qty</th><th>Sheet and edging</th><th></th><th></th></tr></thead><tbody>' +
      lines.map(function (l) { return lineRow(sec, l, ro); }).join('') + '</tbody></table>' +
      (ro ? '' : '<div class="fiqx-row" style="margin-top:8px"><button class="fiqx-btn" data-act="add" data-type="panel" data-sec="' + esc(sec.id) + '">+ Rough panel</button></div>') + '</div>';
  }
  function matName(name) { return String(name || '').split('(')[0].trim(); }
  function lineCost(unit, q) { return unit !== null && unit !== undefined ? money(Math.round(unit * 100 * q) / 100) : '<span class="fiqx-ovr">no price</span>'; }
  function matRow(name, big, cost, tag) {
    return '<div class="fiqx-mrow"><div class="fiqx-mname">' + esc(name) + (tag ? ' <span class="fiqx-sub">(' + esc(tag) + ')</span>' : '') + '</div><div class="fiqx-mbig">' + esc(big) + '</div><div class="fiqx-mcost">' + cost + '</div></div>';
  }
  function plural(n, w) { return n + ' ' + w + (Number(n) === 1 ? '' : 's'); }
  // The main block: how many sheets of each material, edging and cuts small underneath.
  function materialsHtml(v) {
    var d = v.derived || { sheets: {}, edging: {} }, notes = d.notes || {}, rows = [], edge = [];
    Object.keys(d.sheets || {}).forEach(function (id) {
      var g = d.sheets[id], set = g.override !== null && g.override !== undefined, q = set ? Number(g.override) : g.count;
      rows.push(matRow(matName(g.name), plural(q, 'sheet'), lineCost(g.unitCost, q), set ? 'set by you' : ''));
    });
    ((v && v.sections) || []).forEach(function (s) { (s.lines || []).forEach(function (l) { if (l.type === 'sheets' && Number(l.qty) > 0) rows.push(matRow(matName(l.name) || 'Sheets', plural(Number(l.qty), 'sheet'), lineCost(l.unitCost, Number(l.qty)), 'added by hand')); }); });
    Object.keys(d.edging || {}).forEach(function (id) {
      var g = d.edging[id], q = g.override !== null && g.override !== undefined ? Number(g.override) : g.metres;
      edge.push('<div class="fiqx-erow"><span>Edging, ' + esc(matName(g.name).replace(/^Edging\s*/i, '')) + '</span><span>' + q + ' m</span><span>' + lineCost(g.unitCost, q) + '</span></div>');
    });
    return (rows.length ? rows.join('') : '<p class="fiqx-sub">No sheets yet. Copy the panels from Studio, or open Panel details and add panels.</p>') +
      (edge.length ? '<div class="fiqx-edging">' + edge.join('') + '</div>' : '') + (notes.cuts ? '<div class="fiqx-sub fiqx-cuts">About ' + notes.cuts + ' cuts (estimate)</div>' : '');
  }
  // One thin line of short messages. Anything that makes the numbers incomplete is always listed here.
  function warningsHtml(p, v, ro) {
    var d = v.derived || {}, notes = d.notes || {}, items = [], tooBig = 0, miss = [];
    var diff = v.source && p ? C.diffAgainstJob(v, p) : null;
    if (diff && diff.stale) items.push('Studio design has changed. Estimate may be out of date. ' + (ro ? 'Edit this estimate to review.' : '<a href="#" data-act="studioreview">Review</a>'));
    if (notes.noSheet && notes.noSheet.length) items.push(plural(notes.noSheet.length, 'panel') + ' without sheet material. ' + (ro ? '' : '<a href="#" data-act="fixsheet">Choose</a>'));
    if (notes.noEdge && notes.noEdge.length) items.push('Edging not selected on ' + plural(notes.noEdge.length, 'panel') + '. ' + (ro ? '' : '<a href="#" data-act="fixedge">Choose</a>'));
    Object.keys(d.sheets || {}).forEach(function (id) { tooBig += Number(d.sheets[id].tooBig) || 0; });
    if (tooBig) items.push(plural(tooBig, 'panel') + ' bigger than the sheet. ' + (ro ? '' : '<a href="#" data-act="opensheets">Sheet settings</a>'));
    try { miss = C.compute(v).missingPrices || []; } catch (x) { miss = []; }
    if (miss.length) items.push(plural(miss.length, 'item') + ' without a price. The total is incomplete.');
    return items.length ? '<div class="fiqx-warnline">' + items.map(function (i) { return '<span>⚠ ' + i + '</span>'; }).join('') + '</div>' : '';
  }
  function panelsCardHtml(p, e, v, ro) {
    var lines = panelLines(v), secs = (v.sections || []).filter(function (s) { return (s.lines || []).some(function (l) { return l.type === 'panel'; }); }), src = v.source, open = view.open.panels;
    var d = src && p ? C.diffAgainstJob(v, p) : null, stale = d && d.stale;
    var summary = lines.length ? plural(lines.length, 'panel') + (secs.length > 1 ? ' in ' + secs.length + ' rooms' : '') : 'No panels yet';
    var status = src ? (stale ? '<span class="fiqx-chip fiqx-warn">Studio changed</span>' : '<span class="fiqx-chip fiqx-ok">Matches Studio</span>') : '';
    var canCopy = !src && !ro && p && C.studioPanels(p).length > 0;
    var head = '<div class="fiqx-fold"><div><h3 class="fiqx-h">' + (src ? 'PANELS IMPORTED FROM STUDIO' : 'PANELS') + '</h3><div class="fiqx-sub">' + esc(summary) + ' ' + status + '</div></div><div class="fiqx-row">' +
      (canCopy ? '<button class="fiqx-btn fiqx-lg fiqx-pri" data-act="studioimport"' + (canWrite() ? '' : ' disabled') + '>COPY PANELS FROM STUDIO</button>' : '') +
      '<button class="fiqx-btn fiqx-lg" data-act="togglepanels">' + (open ? 'HIDE PANEL DETAILS' : 'VIEW PANEL DETAILS') + '</button></div></div>';
    if (!open) return '<div class="fiqx-card" id="fiqxPanels">' + head + '</div>';
    var when = src ? (src.updatedAt || src.importedAt) : null;
    var body = (src ? '<div class="fiqx-sub">Copied from Studio ' + esc(new Date(when).toLocaleString()) + '. A separate copy: changing it here never changes the Studio design.</div>' : '') +
      (src && src.skipped && src.skipped.length ? '<div class="fiqx-sub">Not copied, no length or width in Studio: ' + esc(src.skipped.join(', ')) + '</div>' : '') +
      (stale && !ro ? '<div class="fiqx-row" style="margin:8px 0"><button class="fiqx-btn fiqx-pri" data-act="studioreview"' + (canWrite() ? '' : ' disabled') + '>Review changes</button><span class="fiqx-sub">' + esc(diffSummary(d)) + '</span></div>' : '') +
      (v.sections || []).map(function (s) { return sectionHtml(p, s, ro); }).join('') + (ro ? '' : '<button class="fiqx-btn" data-act="addsec">+ Add section</button>');
    return '<div class="fiqx-card" id="fiqxPanels">' + head + '<div class="fiqx-pbody">' + body + '</div></div>';
  }
  function field(label, control, hint) { return '<label class="fiqx-field"><span>' + label + '</span>' + control + (hint ? '<small>' + hint + '</small>' : '') + '</label>'; }
  // Sheet settings: size, quantity, price, saw cut, trim and grain for each material. Estimate only.
  function settingsBodyHtml(v, ro) {
    var d = v.derived || { sheets: {}, edging: {} }, dis = ro ? ' disabled' : '';
    var inp = function (attr, val, ph) { return '<input class="fiqx-in num" inputmode="decimal" value="' + esc(amt(val)) + '"' + (ph !== undefined ? ' placeholder="' + esc(ph) + '"' : '') + ' ' + attr + dis + '>'; };
    var sheets = Object.keys(d.sheets || {}).map(function (id) {
      var g = d.sheets[id], c = g.cfg || C.cfgOf(v, id, C.findItem(priceList(), id)), e2 = esc(id);
      return '<div class="fiqx-sg"><div class="fiqx-mname fiqx-sgname">' + esc(matName(g.name)) + '</div><div class="fiqx-fields">' +
        field('Sheet length mm', inp('data-cfg="' + e2 + '|w"', c.w)) + field('Sheet width mm', inp('data-cfg="' + e2 + '|h"', c.h)) +
        field('Sheets to buy', inp('data-gb="sheets|' + e2 + '|override"', g.override, String(g.count)), 'calculated ' + g.count) +
        field('Price per sheet €', inp('data-gb="sheets|' + e2 + '|unitCost"', g.unitCost)) +
        field('Saw cut mm', inp('data-cfg="' + e2 + '|kerf"', c.kerf)) + field('Trim mm', inp('data-cfg="' + e2 + '|trim"', c.trim)) +
        '<label class="fiqx-field fiqx-chk"><input type="checkbox" data-cfg="' + e2 + '|grain"' + (c.grain ? ' checked' : '') + dis + '> Keep grain direction</label></div>' +
        (g.sizeDiffers ? '<div class="fiqx-note">Size differs from the price list (' + g.listW + ' × ' + g.listH + ' mm). Price per sheet kept.</div>' : '') +
        (g.tooBig ? '<div class="fiqx-note">' + plural(g.tooBig, 'panel') + ' bigger than this sheet.</div>' : '') + '</div>';
    });
    var edging = Object.keys(d.edging || {}).map(function (id) {
      var g = d.edging[id], e2 = esc(id);
      return '<div class="fiqx-sg"><div class="fiqx-mname fiqx-sgname">' + esc(matName(g.name)) + '</div><div class="fiqx-fields">' +
        field('Metres to buy', inp('data-gb="edging|' + e2 + '|override"', g.override, String(g.metres)), 'calculated ' + g.metres + ' m') + field('Price per metre €', inp('data-gb="edging|' + e2 + '|unitCost"', g.unitCost)) + '</div></div>';
    });
    var allow = '<div class="fiqx-sg"><div class="fiqx-fields">' + field('Extra for waste %', inp('data-ib="allowancePct"', v.inputs && v.inputs.allowancePct), 'added to sheets and edging, 0 if sizes are already rounded up') + '</div></div>';
    return (sheets.length || edging.length ? sheets.join('') + edging.join('') : '<p class="fiqx-sub">Settings appear once panels have a sheet material.</p>') + allow +
      (ro ? '' : '<div style="margin-top:8px"><button class="fiqx-btn" data-act="refresh">Refresh prices from the price list</button></div>');
  }
  function sheetsCardHtml(v, ro) {
    var open = view.open.sheets;
    return '<div class="fiqx-card" id="fiqxSheets"><div class="fiqx-fold"><div><h3 class="fiqx-h">SHEET SETTINGS</h3><div class="fiqx-sub">Size, quantity, price, saw cut, trim, grain</div></div>' +
      '<button class="fiqx-btn fiqx-lg" data-act="togglesheets">' + (open ? 'HIDE' : 'SHOW') + '</button></div>' +
      (open ? '<div class="fiqx-pbody" id="fiqxSettingsBody">' + (ro ? settingsBodyHtml(v, true) : '') + '</div>' : '') + '</div>';
  }
  function extrasCardHtml(p, e, v, ro) {
    var i = v.inputs, dis = ro ? ' disabled' : '', extra = [], first = (v.sections || [])[0];
    (v.sections || []).forEach(function (s) { (s.lines || []).forEach(function (l) { if (l.type !== 'panel') extra.push(lineRow(s, l, ro)); }); });
    var secAttr = first ? ' data-sec="' + esc(first.id) + '"' : '';
    var r = ro ? (v.results || C.compute(v)) : C.compute(v);
    return '<div class="fiqx-card"><h3 class="fiqx-h">ADDITIONAL COSTS</h3>' +
      '<div class="fiqx-sub" style="margin-bottom:4px">Hardware, hinges, drawers, LED lighting and other materials</div>' +
      (extra.length ? '<div style="overflow-x:auto"><table class="fiqx-t"><thead><tr><th>Type</th><th colspan="2">Item</th><th>Qty</th><th>Unit cost</th><th>Total</th><th></th></tr></thead><tbody>' + extra.join('') + '</tbody></table></div>' : '') +
      (ro ? '' : '<div class="fiqx-row" style="margin:6px 0 12px"><button class="fiqx-btn fiqx-lg" data-act="add" data-type="item"' + secAttr + '>+ Price list item</button><button class="fiqx-btn fiqx-lg" data-act="add" data-type="custom"' + secAttr + '>+ Custom item</button><button class="fiqx-btn" data-act="add" data-type="sheets"' + secAttr + '>+ Extra sheets</button></div>') +
      '<div class="fiqx-sub" style="margin-top:8px">Labour</div><div class="fiqx-row"><input class="fiqx-in num" inputmode="decimal" value="' + esc(amt(i.labourDays)) + '" data-ib="labourDays"' + dis + '> days × € <input class="fiqx-in num" inputmode="decimal" value="' + esc(amt(i.dayRate)) + '" data-ib="dayRate"' + dis + '> per day <strong id="fiqxLabourTotal">' + money(r.labourCharged) + '</strong></div>' +
      '<div class="fiqx-sub" style="margin-top:12px">Transport and other costs</div><table class="fiqx-t"><tbody>' + (i.otherCosts || []).map(function (o, k) {
        return '<tr><td><input class="fiqx-in wide" value="' + esc(o.label) + '" placeholder="e.g. Transport" data-ob="' + k + '|label"' + dis + '></td><td style="width:110px"><input class="fiqx-in num" inputmode="decimal" value="' + esc(amt(o.amount)) + '" data-ob="' + k + '|amount"' + dis + '></td><td style="width:30px">' + (ro ? '' : '<button class="fiqx-x" data-act="rmother" data-k="' + k + '">×</button>') + '</td></tr>';
      }).join('') + '</tbody></table>' + (ro ? '' : '<button class="fiqx-btn fiqx-lg" data-act="addother">+ Other cost</button>') +
      '<div class="fiqx-sub" style="margin-top:12px">Notes</div><textarea class="fiqx-in wide" rows="2" data-db="notes"' + dis + '>' + esc(v.notes || '') + '</textarea></div>';
  }
  function navHtml(ro) {
    return '<div class="fiqx-nav"><button class="fiqx-nbtn" data-act="close">← BACK TO STUDIO</button><button class="fiqx-nbtn" data-act="custjob">CUSTOMER JOB</button>' +
      (ro ? '<button class="fiqx-nbtn fiqx-npri" data-act="editnew"' + (canWrite() ? '' : ' disabled') + '>EDIT ESTIMATE</button>' : '<button class="fiqx-nbtn fiqx-npri" data-act="savev" id="fiqxSaveBtn">SAVE ESTIMATE</button>') +
      '<div class="fiqx-navmsg" id="fiqxNavMsg"></div></div>';
  }
  function headHtml(p, e, v, ro) {
    var title = p ? ((p.customer || p.name || 'Untitled job') + (p.customer && p.name && p.name !== p.customer ? ' · ' + p.name : '')) : 'Job', last = e.versions[e.versions.length - 1];
    var nameEl = ro ? '<strong>' + esc(e.name) + '</strong>' : '<input class="fiqx-in" style="font-weight:800;width:190px" value="' + esc(e.name) + '" data-eb="name">';
    var verText = ro ? 'V' + v.n + ' · saved ' + esc(new Date(v.savedAt).toLocaleString()) + ' · read-only' : (last ? 'Draft of V' + (last.n + 1) : 'Draft · not saved yet');
    var tabs = ro ? e.versions.map(function (x) { return '<button class="fiqx-btn' + (x.n === v.n ? ' fiqx-pri' : '') + '" data-act="showv" data-n="' + x.n + '">V' + x.n + '</button>'; }).join(' ') : '';
    var acts = ro && canWrite() ? '<button class="fiqx-btn" data-act="won">Mark Won</button> <button class="fiqx-btn" data-act="lost">Mark Lost</button> <button class="fiqx-btn" data-act="dup">Duplicate</button> <button class="fiqx-btn" data-act="archive">Archive</button>' : '';
    return '<div class="fiqx-head"><div class="fiqx-title">' + esc(title) + '</div>' + (p && p.address ? '<div class="fiqx-sub">' + esc(p.address) + '</div>' : '') +
      '<div class="fiqx-row">' + nameEl + statusChip(e) + staleChip(e) + '<span class="fiqx-sub">' + verText + '</span><span class="fiqx-internal">Internal estimate · not for production</span><span class="fiqx-sub" id="fiqxAutosave"></span></div>' +
      (ro && (e.wonAt || e.lostAt) ? '<div class="fiqx-sub">' + (e.wonAt ? 'Won on ' + esc(new Date(e.wonAt).toLocaleDateString()) : '') + (e.lostAt ? 'Lost on ' + esc(new Date(e.lostAt).toLocaleDateString()) + (e.lostReason ? ': ' + esc(e.lostReason) : '') : '') + '</div>' : '') +
      '<div class="fiqx-row">' + tabs + (!ro && e.versions.length ? '<button class="fiqx-btn" data-act="versions">Saved versions</button>' : '') + acts + '<button class="fiqx-btn" data-act="site">Site measurements</button><button class="fiqx-btn" data-act="pricelist">Price list</button></div></div>';
  }
  function pageHtml(p, e, v, ro) {
    var r = ro ? (v.results || C.compute(v)) : C.compute(v);
    return '<div class="fiqx-win">' + navHtml(ro) +
      '<div class="fiqx-body"><div class="fiqx-main">' + headHtml(p, e, v, ro) +
      '<div id="fiqxWarn">' + (ro ? warningsHtml(p, v, true) : '') + '</div>' +
      '<div class="fiqx-card" id="fiqxMaterialsCard"><h3 class="fiqx-h">MATERIAL REQUIREMENTS</h3><div id="fiqxMaterials">' + (ro ? materialsHtml(v) : '') + '</div></div>' +
      panelsCardHtml(p, e, v, ro) + sheetsCardHtml(v, ro) + extrasCardHtml(p, e, v, ro) +
      '</div><div class="fiqx-sum"><div class="fiqx-card" id="fiqxSummary">' + (ro ? summaryHtml(v, r, true) : '') + '</div></div></div></div>';
  }
  function editorHtml(p, e) { return pageHtml(p, e, e.draft, false); }
  function versionHtml(p, e) {
    var v = e.versions.find(function (x) { return x.n === view.n; }) || e.versions[e.versions.length - 1];
    if (!v) { view.mode = 'choose'; return chooserHtml(p); }
    return pageHtml(p, e, v, true);
  }
  // Recalculate sheets and edging, then refresh everything that shows them. Keeps the cursor where it was.
  function refreshDerived(e) {
    C.syncDerived(e.draft, priceList(), packFn());
    var a = document.activeElement, key = null, pos = a && a.selectionStart;
    if (a && a.getAttribute) { ['data-cfg', 'data-gb', 'data-ib'].forEach(function (k) { if (!key && a.getAttribute(k)) key = [k, a.getAttribute(k)]; }); }
    var m = document.getElementById('fiqxMaterials'); if (m) m.innerHTML = materialsHtml(e.draft);
    var s = document.getElementById('fiqxSettingsBody');
    if (s) { s.innerHTML = settingsBodyHtml(e.draft, false); if (key) { var again = s.querySelector('[' + key[0] + '="' + key[1] + '"]'); if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (x) {} } } }
    refreshSummary(e);
  }
  function summaryHtml(v, r, ro) {
    var i = v.inputs, dis = ro ? ' disabled' : '', notes = (v.derived && v.derived.notes) || {};
    var incomplete = (r.missingPrices && r.missingPrices.length) || (notes.noSheet && notes.noSheet.length);
    var markup = ro ? '<span>' + esc(i.markupPct) + '%</span>' : '<span class="fiqx-inl"><button class="fiqx-btn fiqx-sm" data-act="mk" data-d="-5" aria-label="Decrease markup">−</button><input class="fiqx-in num" style="width:60px" inputmode="decimal" value="' + esc(amt(i.markupPct)) + '" data-ib="markupPct" id="fiqxMarkup">%<button class="fiqx-btn fiqx-sm" data-act="mk" data-d="5" aria-label="Increase markup">+</button></span>';
    var need = !r.taxSet && !ro ? ' fiqx-need' : '';
    return '<h3 class="fiqx-h">PRICE SUMMARY</h3>' +
      '<div class="l"><span>Material cost</span><span>' + money(r.materialCost) + '</span></div>' +
      '<div class="l"><span>Material markup</span>' + markup + '</div>' +
      (ro ? '' : '<div class="fiqx-q">' + [0, 10, 20, 30, 40, 50].map(function (q) { return '<button data-act="mkset" data-v="' + q + '">' + q + '%</button>'; }).join('') + '</div>') +
      '<div class="l"><span>Markup amount</span><span>' + money(r.markupAmount) + '</span></div>' +
      '<div class="l"><span>Labour</span><span>' + money(r.labourCharged) + '</span></div>' +
      '<div class="l"><span>Other costs</span><span>' + money(r.otherCosts) + '</span></div><div class="sep"></div>' +
      '<div class="l"><span><strong>Subtotal</strong></span><span><strong>' + money(r.subtotal) + '</strong></span></div>' +
      '<div class="l"><span>Tax rate % and label</span><span class="fiqx-inl"><input class="fiqx-in num' + need + '" style="width:60px" inputmode="decimal" placeholder="rate" value="' + esc(amt(i.taxRate)) + '" data-ib="taxRate"' + dis + '><input class="fiqx-in" style="width:64px" placeholder="IVA" value="' + esc(i.taxLabel || '') + '" data-ib="taxLabel"' + dis + '></span></div>' +
      '<div class="l"><span>' + esc(i.taxLabel || 'Tax') + '</span><span>' + (r.taxSet ? money(r.taxAmount) : '<span class="fiqx-ovr">Tax rate not set</span>') + '</span></div>' +
      '<div class="fiqx-total"><span>SUGGESTED CUSTOMER TOTAL</span><b>' + (r.taxSet ? money(r.suggestedTotal) : '—') + '</b></div>' + (incomplete ? '<div class="fiqx-ovr" style="margin:-2px 0 6px">Incomplete: some prices or sheet materials are missing.</div>' : '') +
      '<div class="l"><span><strong>ESTIMATED PROFIT</strong></span><span style="color:#17663a;font-weight:800">' + money(r.profit) + ' <span class="fiqx-sub">(' + r.marginPct.toFixed(1) + '%)</span></span></div>';
  }
  function refreshSummary(e) {
    var el = document.getElementById('fiqxSummary'); if (!el) return;
    var active = document.activeElement, inSum = !!(active && el.contains(active)), key = inSum && active.getAttribute && active.getAttribute('data-ib'), pos = inSum && active.selectionStart;
    var r = C.compute(e.draft);
    el.innerHTML = summaryHtml(e.draft, r, false);
    if (key) { var again = el.querySelector('[data-ib="' + key + '"]'); if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (x) {} } }
    var lab = document.getElementById('fiqxLabourTotal'); if (lab) lab.textContent = money(r.labourCharged);
    var w = document.getElementById('fiqxWarn'); if (w) w.innerHTML = warningsHtml(jobById(e.projectId), e.draft, false);
    // Save is only possible with a tax rate; say so right beside the button.
    var problems = C.validateForSave(e.draft), sb = document.getElementById('fiqxSaveBtn'), nm = document.getElementById('fiqxNavMsg');
    if (sb) sb.disabled = !!problems.length || !canWrite();
    if (nm) nm.textContent = problems.length ? problems.join('. ') + '. Enter a rate (0 is allowed) to save.' : '';
  }

  // ---------- events ----------
  function currentEst() { return view && view.estId ? estById(view.estId) : null; }
  function findLine(e, secId, lineId) { var s = e.draft.sections.find(function (x) { return x.id === secId; }); return { sec: s, line: s && s.lines.find(function (l) { return l.id === lineId; }) }; }
  function numOrNull(v) { var n = C.parseAmount(v); return n; }
  document.addEventListener('input', function (ev) {
    var t = ev.target; if (!t.closest || !t.closest('#fiqxEst')) return;
    var e = currentEst(); if (!e || !e.draft || !canWrite()) return;
    var a;
    if ((a = t.getAttribute('data-b'))) {
      var parts = a.split('|'), f = parts[2], hit = findLine(e, parts[0], parts[1]); if (!hit.line) return;
      if (f === 'unitCost') C.setLineCost(hit.line, t.value);
      else if (f === 'name') hit.line.name = t.value;
      else hit.line[f] = numOrNull(t.value);
      if (hit.line.type === 'panel') refreshDerived(e);
    } else if ((a = t.getAttribute('data-ib'))) {
      e.draft.inputs[a] = a === 'taxLabel' ? t.value : numOrNull(t.value);
      if (a === 'allowancePct') refreshDerived(e);
    } else if ((a = t.getAttribute('data-ob'))) { var p2 = a.split('|'), o = e.draft.inputs.otherCosts[Number(p2[0])]; if (o) o[p2[1]] = p2[1] === 'amount' ? numOrNull(t.value) : t.value; }
    else if ((a = t.getAttribute('data-gb'))) { var p3 = a.split('|'), g = (e.draft.derived[p3[0]] || {})[p3[1]]; if (g) g[p3[2]] = numOrNull(t.value); refreshDerived(e); }
    else if ((a = t.getAttribute('data-cfg'))) { setCfg(e, a, t); refreshDerived(e); }
    else if ((a = t.getAttribute('data-sb'))) { var s = e.draft.sections.find(function (x) { return x.id === a.split('|')[0]; }); if (s) s.name = t.value; }
    else if (t.getAttribute('data-eb') === 'name') e.name = t.value;
    else if (t.getAttribute('data-db') === 'notes') e.draft.notes = t.value;
    else return;
    refreshSummary(e); persist();
  }, true);
  document.addEventListener('change', function (ev) {
    var t = ev.target; if (!t.closest || !t.closest('#fiqxEst')) return;
    var e = currentEst(); if (!e || !e.draft || !canWrite()) return;
    var a;
    if ((a = t.getAttribute('data-s'))) {
      var parts = a.split('|'), hit = findLine(e, parts[0], parts[1]); if (!hit.line) return;
      if (parts[2] === 'itemId') {
        var it = C.findItem(priceList(), t.value);
        hit.line.itemId = it ? it.id : null;
        if (it && hit.line.type === 'panel') ensureCfg(e.draft, it, hit.line, jobById(e.projectId));
        if (hit.line.type !== 'panel') { hit.line.name = it ? it.name : ''; hit.line.unit = it ? it.unit : 'each'; hit.line.unitCost = it ? it.cost : null; hit.line.listCost = it ? it.cost : null; hit.line.overridden = false; }
      } else hit.line[parts[2]] = t.value;
    } else if ((a = t.getAttribute('data-ss'))) { var s = e.draft.sections.find(function (x) { return x.id === a.split('|')[0]; }); if (s) { s.roomId = t.value || null; var r = ((jobById(e.projectId) || {}).rooms || []).find(function (x) { return x.id === t.value; }); if (r && /^Section \d+$/.test(s.name)) s.name = r.name; } }
    else return;
    persist(); render();
  }, true);
  document.addEventListener('wheel', function (ev) {
    var t = ev.target; if (!t || t.id !== 'fiqxMarkup' || document.activeElement !== t) return;
    var e = currentEst(); if (!e || !e.draft) return; ev.preventDefault();
    e.draft.inputs.markupPct = Math.max(0, (Number(e.draft.inputs.markupPct) || 0) + (ev.deltaY < 0 ? 1 : -1)); refreshSummary(e); persist();
  }, { passive: false });
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('#fiqxEst [data-act], .fiqx-side [data-act]'); if (!b) return;
    ev.preventDefault();
    var act = b.getAttribute('data-act'), e = currentEst();
    var mutate = function (fn) { if (!canWrite()) return; fn(); persist(); render(); };
    switch (act) {
      case 'close': return backToStudio();
      case 'custjob': return toCustomerJob();
      case 'togglepanels': view.open.panels = !view.open.panels; return render();
      case 'togglesheets': view.open.sheets = !view.open.sheets; return render();
      case 'opensheets': view.open.sheets = true; render(); { var sg = document.getElementById('fiqxSheets'); if (sg) sg.scrollIntoView({ block: 'start' }); } return;
      case 'fixsheet': case 'fixedge': {
        view.open.panels = true; render();
        var first = document.querySelector('#fiqxEst #fiqxPanels .fiqx-need'); if (first) { first.scrollIntoView({ block: 'center' }); try { first.focus(); } catch (x) {} }
        return;
      }
      case 'pricelist': return openPriceList();
      case 'site': return openSide();
      case 'sideclose': return closeSide();
      case 'new': { var n = newEstimateFor(view.projectId); if (n) { view = { projectId: view.projectId, mode: 'edit', estId: n.id }; render(); } return; }
      case 'open': { var x = estById(b.getAttribute('data-id')); if (!x) return; view = { projectId: view.projectId, mode: x.draft ? 'edit' : 'version', estId: x.id, n: x.versions.length ? x.versions[x.versions.length - 1].n : null }; return render(); }
      case 'versions': view.mode = 'version'; view.n = e.versions[e.versions.length - 1].n; return render();
      case 'showv': view.n = Number(b.getAttribute('data-n')); return render();
      case 'add': return mutate(function () {
        var sec = e.draft.sections.find(function (s) { return s.id === b.getAttribute('data-sec'); }); if (!sec) return;
        var type = b.getAttribute('data-type');
        sec.lines.push(type === 'panel' ? C.lineFromItem('panel', null, { name: '', lengthCm: null, widthCm: null, qty: 1, edges: 'none', unitCost: null, listCost: null })
          : C.lineFromItem(type, null, { name: '', unit: type === 'sheets' ? 'sheet' : 'each', qty: 1 }));
      });
      case 'rmline': return mutate(function () {
        var sec = e.draft.sections.find(function (s) { return s.id === b.getAttribute('data-sec'); }); if (!sec) return;
        var gone = sec.lines.find(function (l) { return l.id === b.getAttribute('data-id'); });
        // A copied panel removed on purpose is remembered, so it is not offered again as "new in Studio".
        if (gone && gone.src && e.draft.source) { e.draft.source.dropped = e.draft.source.dropped || {}; e.draft.source.dropped[gone.src.srcId] = gone.src.fp; }
        sec.lines = sec.lines.filter(function (l) { return l.id !== b.getAttribute('data-id'); });
      });
      case 'studioimport': return mutate(function () { importInto(e); });
      case 'studioreview': return openDiffModal(e);
      case 'studioclose': { var m = document.getElementById('fiqxDiff'); if (m) m.remove(); return; }
      case 'studioapply': return mutate(function () { var p = jobById(e.projectId); if (!p) return; C.applyUpdate(e.draft, p, priceList()); e.draft.sheetCfg = e.draft.sheetCfg || {}; initCfgs(e.draft, p); });
      case 'addsec': return mutate(function () { e.draft.sections.push({ id: C.newId('sec'), name: 'Section ' + (e.draft.sections.length + 1), roomId: null, lines: [] }); });
      case 'rmsec': return mutate(function () {
        if (e.draft.sections.length < 2 || !confirm('Remove this section and its panels?')) return;
        var gone = e.draft.sections.find(function (s) { return s.id === b.getAttribute('data-sec'); }), rest = e.draft.sections.filter(function (s) { return s.id !== b.getAttribute('data-sec'); });
        // Hardware and other priced lines are not panels: keep them, moved to the first section left.
        if (gone) gone.lines.filter(function (l) { return l.type !== 'panel'; }).forEach(function (l) { rest[0].lines.push(l); });
        e.draft.sections = rest;
      });
      case 'addother': return mutate(function () { e.draft.inputs.otherCosts.push({ label: '', amount: null }); });
      case 'rmother': return mutate(function () { e.draft.inputs.otherCosts.splice(Number(b.getAttribute('data-k')), 1); });
      case 'mk': if (!canWrite()) return; e.draft.inputs.markupPct = Math.max(0, (Number(e.draft.inputs.markupPct) || 0) + Number(b.getAttribute('data-d'))); refreshSummary(e); return persist();
      case 'mkset': if (!canWrite()) return; e.draft.inputs.markupPct = Number(b.getAttribute('data-v')); refreshSummary(e); return persist();
      case 'aslist': {
        var hit = findLine(e, b.getAttribute('data-sec'), b.getAttribute('data-id')); if (!hit.line || !canEditPrices()) return;
        if (!confirm('Update the company price list to ' + money(hit.line.unitCost) + '? Only new lines and estimates use it; saved estimates never change.')) return;
        writePriceList(function (pl) { var it = pl.items.find(function (i) { return i.id === hit.line.itemId; }); if (it) { it.cost = hit.line.unitCost; it.updatedAt = new Date().toISOString(); it.updatedBy = who(); } });
        hit.line.listCost = hit.line.unitCost; hit.line.overridden = false; persist(); return render();
      }
      case 'refresh': {
        var diffs = C.priceDifferences(e.draft, priceList());
        if (!diffs.length) { alert('Every price in this draft matches the current price list.'); return; }
        var msg = diffs.map(function (x) { return '• ' + x.name + ': ' + money(x.was) + ' → ' + money(x.now) + (x.overridden ? ' (you overrode this; it will be replaced)' : ''); }).join('\n');
        if (!confirm('These prices differ from the current price list:\n\n' + msg + '\n\nApply the new prices to this draft?')) return;
        return mutate(function () { C.applyPriceRefresh(e.draft, priceList(), diffs.map(function (x) { return x.ref; })); });
      }
      case 'savev': {
        if (!canWrite()) return;
        var res = C.saveVersion(e, who(), packFn(), priceList());
        if (!res.ok) { alert(res.problems.join('\n')); return; }
        persist(true); view.mode = 'version'; view.n = res.version.n; return render();
      }
      case 'editnew': return mutate(function () { C.editAsNewVersion(e); view.mode = 'edit'; });
      case 'won': return mutate(function () { e.status = 'won'; e.wonAt = new Date().toISOString(); e.lostAt = null; });
      case 'lost': return mutate(function () { var r = prompt('Lost: optional reason', e.lostReason || ''); if (r === null) return; e.status = 'lost'; e.lostAt = new Date().toISOString(); e.lostReason = r; e.wonAt = null; });
      case 'dup': return mutate(function () {
        var copy = C.newEstimate({ projectId: e.projectId, customerId: e.customerId, customer: e.customer, name: e.name + ' (copy)' }, priceList());
        copy.draft = C.clone(e.draft || e.versions[e.versions.length - 1]); ['n', 'savedAt', 'savedBy', 'results'].forEach(function (k) { delete copy.draft[k]; });
        estimates().push(copy); view = { projectId: e.projectId, mode: 'edit', estId: copy.id };
      });
      case 'archive': return mutate(function () { if (!confirm('Archive this estimate? It stays in the saved data but is hidden from lists.')) return; e.archived = true; view = { projectId: e.projectId, mode: 'choose' }; });
    }
  });

  // ---------- Site measurements side panel (read-only) ----------
  function closeSide() { var s = document.querySelector('.fiqx-side'); if (s) s.remove(); }
  function openSide() {
    closeSide(); var p = view && jobById(view.projectId); if (!p) return;
    var rooms = p.rooms || [];
    var html = '<div class="fiqx-row"><h3 style="margin:0">Site measurements</h3><span class="fiqx-sp"></span><button class="fiqx-btn" data-act="sideclose">Close</button></div><p class="fiqx-sub">Read-only, from the job. Use them to fill in rough sizes.</p>' +
      (rooms.length ? rooms.map(function (r) {
        var pics = []; try { if (typeof siteRoomPictures === 'function') pics = siteRoomPictures(r) || []; } catch (x) {}
        var measures = []; (r.siteMeasurements || []).forEach(function (m) { if (m && (m.value || m.value === 0)) measures.push((m.name || m.kind || 'Measure') + ': ' + m.value); });
        try { if (typeof siteRoomCaptures === 'function') (siteRoomCaptures(r) || []).forEach(function (c) { (c.marks || []).forEach(function (m) { if (m && m.type === 'measure' && m.value) measures.push((m.name || m.kind || 'Measure') + ': ' + m.value); }); }); } catch (x) {}
        return '<div class="fiqx-card"><h3>' + esc(r.name || 'Room') + '</h3>' + (measures.length ? '<div class="fiqx-sub">' + measures.map(esc).join('<br>') + '</div>' : '<div class="fiqx-sub">No typed measurements.</div>') +
          pics.slice(0, 6).map(function (src) { return /^(data:image\/|https:\/\/)/.test(String(src)) ? '<img alt="Site photo" src="' + esc(src) + '">' : ''; }).join('') + (r.notes ? '<div class="fiqx-sub">' + esc(r.notes) + '</div>' : '') + '</div>';
      }).join('') : '<p class="fiqx-sub">This job has no site measurements.</p>');
    var s = document.createElement('div'); s.className = 'fiqx-side'; s.innerHTML = html; document.body.appendChild(s);
  }

  // ---------- Material Price List ----------
  function openPriceList() {
    var o = overlay('fiqxPL'); o.style.zIndex = 99996; renderPriceList();
    loadAdmins(true).then(function () { if (document.getElementById('fiqxPL')) renderPriceList(); });
  }
  function browserPricesRaw() { try { return localStorage.getItem('fiq_supplier_prices_v1'); } catch (e) { return null; } }
  function renderPriceList() {
    var o = document.getElementById('fiqxPL'); if (!o) return;
    var pl = priceList(), edit = canEditPrices(), dis = edit ? '' : ' disabled';
    var raw = browserPricesRaw(), pending = raw ? C.importBrowserPrices(raw, pl.items, who()).items.length : 0;
    var rows = pl.items.slice().sort(function (a, b) { return (a.archived - b.archived) || String(a.category).localeCompare(b.category) || String(a.name).localeCompare(b.name); }).map(function (i) {
      var b = function (f) { return ' data-pl="' + esc(i.id) + '|' + f + '"'; };
      return '<tr' + (i.archived ? ' style="opacity:.5"' : '') + '><td><select class="fiqx-in"' + b('category') + dis + '>' + C.CATEGORIES.map(function (c) { return '<option value="' + c[0] + '"' + (c[0] === i.category ? ' selected' : '') + '>' + c[1] + '</option>'; }).join('') + '</select></td>' +
        '<td><input class="fiqx-in wide" value="' + esc(i.name) + '"' + b('name') + dis + '></td>' +
        '<td><select class="fiqx-in"' + b('unit') + dis + '>' + C.UNITS.map(function (u) { return '<option' + (u === i.unit ? ' selected' : '') + '>' + u + '</option>'; }).join('') + '</select></td>' +
        '<td><input class="fiqx-in num" inputmode="decimal" value="' + esc(amt(i.cost)) + '"' + b('cost') + dis + '></td>' +
        '<td>' + (i.category === 'sheet' ? '<input class="fiqx-in num" style="width:50px" title="Thickness mm" value="' + esc(amt(i.sheet && i.sheet.thickness)) + '"' + b('sheet.thickness') + dis + '> mm <input class="fiqx-in num" style="width:60px" title="Sheet length mm" value="' + esc(amt(i.sheet && i.sheet.w)) + '"' + b('sheet.w') + dis + '>×<input class="fiqx-in num" style="width:60px" title="Sheet width mm" value="' + esc(amt(i.sheet && i.sheet.h)) + '"' + b('sheet.h') + dis + '>' : '') + '</td>' +
        '<td><input class="fiqx-in" style="width:110px" value="' + esc(i.supplier) + '" placeholder="Supplier"' + b('supplier') + dis + '></td>' +
        '<td class="fiqx-sub">' + (i.updatedAt ? esc(new Date(i.updatedAt).toLocaleDateString()) : '') + '</td>' +
        '<td>' + (edit ? '<button class="fiqx-btn" data-plact="' + (i.archived ? 'unarchive' : 'archive') + '" data-id="' + esc(i.id) + '">' + (i.archived ? 'Restore' : 'Archive') + '</button>' : '') + '</td></tr>';
    }).join('');
    o.innerHTML = '<div class="fiqx-win"><div class="fiqx-top"><h2>Material Price List</h2><span class="fiqx-sub">Company prices, excluding tax. New estimate lines copy these prices; saved estimates never change.</span><span class="fiqx-sp"></span>' +
      (edit ? '' : '<span class="fiqx-chip fiqx-muted">View only: the company owner or an administrator can edit</span>') + '<button class="fiqx-btn" data-plact="close">Close</button></div>' +
      '<div class="fiqx-body single"><div>' +
      (edit && pending ? '<div class="fiqx-warnbox">' + pending + ' price' + (pending === 1 ? '' : 's') + ' saved in the Shopping List on this computer can be copied into the company price list. The Shopping List keeps its own prices unchanged. <button class="fiqx-btn" data-plact="import">Review and import</button></div>' : '') +
      (isOwner() && fsFns() ? '<div class="fiqx-card"><h3>Who can edit prices</h3><p class="fiqx-sub">You (the owner) always can. Tick anyone else in the company who should manage prices. Everyone signed in can use the prices in estimates.</p>' +
        (!admins.loaded ? '<p class="fiqx-sub">Loading…</p>' : admins.error ? '<div class="fiqx-warnbox">Could not load the company members: ' + esc(admins.error) + '</div>' : admins.members.length ?
          admins.members.map(function (m) { return '<label class="fiqx-row" style="padding:3px 0"><input type="checkbox" data-pladmin="' + esc(m.uid) + '"' + (admins.list.indexOf(m.uid) >= 0 ? ' checked' : '') + '> ' + esc(m.label) + ' <span class="fiqx-sub">(' + esc(m.role || 'member') + ')</span></label>'; }).join('') :
          '<p class="fiqx-sub">No other active members yet.</p>') + '</div>' : '') +
      '<div class="fiqx-card"><h3>Estimate defaults for new estimates</h3><div class="fiqx-row"><span class="fiqx-sub">Markup %</span><input class="fiqx-in num" value="' + esc(amt(pl.defaults.markupPct)) + '" data-pld="markupPct"' + dis + '>' +
      '<span class="fiqx-sub">Tax rate %</span><input class="fiqx-in num" placeholder="blank" value="' + esc(amt(pl.defaults.taxRate)) + '" data-pld="taxRate"' + dis + '>' +
      '<span class="fiqx-sub">Tax label</span><input class="fiqx-in" style="width:90px" placeholder="e.g. IVA" value="' + esc(pl.defaults.taxLabel) + '" data-pld="taxLabel"' + dis + '></div></div>' +
      '<div class="fiqx-card"><table class="fiqx-t"><thead><tr><th>Category</th><th>Name</th><th>Unit</th><th>Cost €</th><th>Sheet size</th><th>Supplier</th><th>Updated</th><th></th></tr></thead><tbody>' + (rows || '<tr><td colspan="8" class="fiqx-sub">No items yet.</td></tr>') + '</tbody></table>' +
      (edit ? '<button class="fiqx-btn fiqx-pri" data-plact="add" style="margin-top:8px">+ Add item</button>' : '') + '</div></div></div></div>';
  }
  document.addEventListener('input', function (ev) {
    var t = ev.target; if (!t.closest || !t.closest('#fiqxPL') || !canEditPrices()) return;
    var a = t.getAttribute('data-pl'), d = t.getAttribute('data-pld');
    if (a) {
      var parts = a.split('|');
      writePriceList(function (pl) {
        var it = pl.items.find(function (i) { return i.id === parts[0]; }); if (!it) return;
        var f = parts[1], v = t.value;
        if (f === 'cost') it.cost = C.parseAmount(v);
        else if (f.indexOf('sheet.') === 0) { it.sheet = it.sheet || {}; it.sheet[f.slice(6)] = C.parseAmount(v); }
        else it[f] = v;
        it.updatedAt = new Date().toISOString(); it.updatedBy = who();
      });
      if (t.tagName === 'SELECT') renderPriceList();
    } else if (d) writePriceList(function (pl) { pl.defaults[d] = d === 'taxLabel' ? t.value : (t.value.trim() === '' ? (d === 'taxRate' ? null : 0) : C.parseAmount(t.value)); });
  }, true);
  document.addEventListener('change', function (ev) {
    var t = ev.target; if (!t.closest || !t.closest('#fiqxPL')) return;
    if (t.hasAttribute('data-pladmin')) return setAdmin(t.getAttribute('data-pladmin'), t.checked);
    if (t.tagName === 'SELECT') renderPriceList();
  }, true);
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('#fiqxPL [data-plact]'); if (!b) return; ev.preventDefault();
    var act = b.getAttribute('data-plact');
    if (act === 'close') { var o = document.getElementById('fiqxPL'); if (o) o.remove(); if (view) render(); return; }
    if (!canEditPrices()) return;
    if (act === 'add') { writePriceList(function (pl) { pl.items.push(C.makeItem({ category: 'hardware', name: 'New item', unit: 'each' }, who())); }); return renderPriceList(); }
    if (act === 'archive' || act === 'unarchive') { writePriceList(function (pl) { var it = pl.items.find(function (i) { return i.id === b.getAttribute('data-id'); }); if (it) it.archived = act === 'archive'; }); return renderPriceList(); }
    if (act === 'import') {
      var res = C.importBrowserPrices(browserPricesRaw(), priceList().items, who());
      if (!res.items.length) { alert('Nothing new to import.'); return; }
      if (!confirm('Copy ' + res.items.length + ' price(s) into the company price list?\n\n' + res.items.map(function (i) { return '• ' + catLabel(i.category) + ': ' + i.name + ' · ' + money(i.cost) + '/' + i.unit; }).join('\n') + '\n\nThe Shopping List\'s own prices are not changed.')) return;
      writePriceList(function (pl) { pl.items = pl.items.concat(res.items); pl.importedBrowserPricesAt = new Date().toISOString(); });
      return renderPriceList();
    }
  });

  // ---------- job picker (header button) ----------
  function currentJobId() { try { var c = (0, eval)('typeof project==="function"&&project()'); return c && c.id; } catch (e) { return null; } }
  function openPicker() {
    ensureStyle(); loadAdmins();
    var cur = currentJobId(), list = jobs().filter(function (p) { return p && p.id; }).slice().sort(function (a, b) { return (b.id === cur) - (a.id === cur); });
    view = { mode: 'pick' };
    var o = overlay('fiqxEst');
    var rows = function (q) { q = String(q || '').toLowerCase(); return list.filter(function (p) { return !q || (String(p.customer || '') + ' ' + String(p.name || '') + ' ' + String(p.address || '')).toLowerCase().indexOf(q) >= 0; }).map(function (p) {
      var n = jobEstimates(p.id).length;
      return '<button class="fiqx-item" data-act="pickjob" data-id="' + esc(p.id) + '"><span><strong>' + esc(p.customer || p.name || 'Untitled job') + '</strong> <span class="fiqx-sub">' + esc(p.name && p.customer ? p.name : '') + (p.id === cur ? ' · open now' : '') + '</span></span><span class="fiqx-sub">' + (n ? n + ' estimate' + (n === 1 ? '' : 's') : 'no estimates') + ' ›</span></button>'; }).join('') || '<p class="fiqx-sub">No matching jobs.</p>'; };
    o.innerHTML = '<div class="fiqx-win"><div class="fiqx-top"><h2>Estimator</h2><span class="fiqx-sub">Choose the job to estimate</span><span class="fiqx-internal">Internal costing · never changes the Cutting List</span><span class="fiqx-sp"></span>' +
      '<button class="fiqx-btn" data-act="pricelist">Price list</button><button class="fiqx-btn" data-act="close">Close</button></div><div class="fiqx-body single"><div><div class="fiqx-card">' +
      '<input class="fiqx-in wide" id="fiqxJobSearch" placeholder="Search customer, job or address" style="margin-bottom:10px"><div class="fiqx-list" id="fiqxJobList">' + rows('') + '</div>' +
      (list.length ? '' : '<p class="fiqx-sub">Create a job first (New Job, or a site measurement from Mobile), then estimate it here.</p>') + '</div></div></div></div>';
    var srch = document.getElementById('fiqxJobSearch'); srch.addEventListener('input', function () { document.getElementById('fiqxJobList').innerHTML = rows(srch.value); }); srch.focus();
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('#fiqxEst [data-act="pickjob"]'); if (!b) return; ev.preventDefault(); ev.stopImmediatePropagation();
    var pid = b.getAttribute('data-id'), list = jobEstimates(pid);
    if (list.length) return openEstimator(pid);
    var n = newEstimateFor(pid); if (n) { view = { projectId: pid, mode: 'edit', estId: n.id }; render(); }
  }, true);
  function addHeaderButton() {
    if (headerFailed || document.getElementById('fiqxHeaderEstimator')) return;
    var right = document.querySelector('.header .header-right'); if (!right) return;
    var b = document.createElement('button'); b.className = 'btn'; b.id = 'fiqxHeaderEstimator'; b.type = 'button'; b.textContent = '🧮 Estimator'; b.title = 'Internal costing: materials, markup, labour, tax and profit';
    b.setAttribute('data-fiqx-header-estimator', '1');
    try {
      var before = right.querySelector('#manageFittersBtn') || right.querySelector('#refreshBomBtn');
      if (before && before.parentNode) before.parentNode.insertBefore(b, before); else right.appendChild(b);
    } catch (e) { headerFailed = true; console.error('Estimator header button', e); }
  }
  var headerFailed = false;
  // Any other button or link whose label is exactly "Estimator" opens the real Estimator,
  // never the old Cutting List route.
  document.addEventListener('click', function (ev) {
    var el = ev.target.closest && ev.target.closest('button,a,[role="button"]'); if (!el) return;
    if (el.hasAttribute('data-fiqx-from-studio')) return; // the Drawing toolbar button has its own handler
    if (el.hasAttribute('data-fiqx-header-estimator') || (!el.closest('#fiqxEst,#fiqxPL,.fiqx-side') && /^\W*estimator\s*$/i.test(String(el.textContent || '').trim()))) {
      ev.preventDefault(); ev.stopImmediatePropagation(); openPicker();
    }
  }, true);

  // ---------- Estimator button on the Drawing toolbar, beside Site Measurements ----------
  // Shown only when the open job has at least one panel (rough or final). It opens the Estimator
  // for that same job, so the customer and job are never entered again.
  function jobHasPanels(p) { return !!(p && (p.cabinets || []).some(function (c) { return (c.parts || []).length > 0; })); }
  var studioBtnQueued = false;
  function syncStudioButton() {
    studioBtnQueued = false;
    var site = document.getElementById('drawingViewSiteMeasurementBtn'); if (!site || !site.parentNode) return;
    var btn = document.getElementById('fiqxStudioEstimatorBtn');
    var show = jobHasPanels(jobById(currentJobId()));
    if (!btn) {
      ensureStyle();
      btn = document.createElement('button'); btn.className = 'btn'; btn.id = 'fiqxStudioEstimatorBtn'; btn.type = 'button';
      btn.setAttribute('data-fiqx-from-studio', '1'); btn.textContent = '🧮 Estimator';
      btn.title = 'Open the Estimator for this job. The panels come with it; nothing in the design changes.';
      site.parentNode.insertBefore(btn, site.nextSibling);
    } else if (btn.previousElementSibling !== site) site.parentNode.insertBefore(btn, site.nextSibling);
    if (btn.hidden === show) btn.hidden = !show;
  }
  function queueStudioButton() { if (studioBtnQueued) return; studioBtnQueued = true; (window.requestAnimationFrame || setTimeout)(syncStudioButton); }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-fiqx-from-studio]'); if (!b) return;
    ev.preventDefault(); ev.stopImmediatePropagation();
    openFromStudio();
  }, true);
  function openFromStudio() {
    var pid = currentJobId(); if (!pid || !jobById(pid)) { alert('Open or choose a job first.'); return; }
    ensureStyle(); loadAdmins();
    var list = jobEstimates(pid);
    // No estimate yet: make one with the whole job copied in, one section per room, and open it.
    if (!list.length) { var n = newEstimateFor(pid, true); if (n) { view = { projectId: pid, mode: 'edit', estId: n.id }; render(); } return; }
    // Otherwise open the newest estimate that already holds Studio panels; if none does, show the list.
    var linked = list.filter(function (x) { return !!sourceVersion(x); }).sort(function (a, b) { return String(b.createdAt).localeCompare(String(a.createdAt)); })[0];
    if (linked) return openEstimator(pid, linked.id);
    openEstimator(pid);
  }
  window.fiqOpenEstimatorFromStudio = openFromStudio;
  queueStudioButton();

  // ---------- entry points ----------
  window.fiqOpenEstimatorPicker = openPicker;
  window.fiqOpenEstimator = openEstimator;
  window.fiqOpenPriceList = openPriceList;
  window.fiqCloseEstimator = closeEstimator;

  // 1. "Estimate" on each New Job card (New Project screen), beside Move to Library.
  function decorateCards(rootEl) {
    (rootEl || document).querySelectorAll('.incoming-project-select-row').forEach(function (row) {
      if (row.querySelector('.fiqx-est-btn')) return;
      var open = row.querySelector('[data-open-incoming-project]'), move = row.querySelector('.incoming-move-library'); if (!open) return;
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn fiqx-est-btn'; btn.textContent = 'Estimate';
      btn.setAttribute('data-fiqx-estimate', open.getAttribute('data-open-incoming-project'));
      if (move) move.parentNode.insertBefore(btn, move); else row.appendChild(btn);
    });
  }
  new MutationObserver(function (muts) { for (var i = 0; i < muts.length; i++) if (muts[i].addedNodes.length) { decorateCards(); addHeaderButton(); queueStudioButton(); break; } }).observe(document.documentElement, { childList: true, subtree: true });
  addHeaderButton();
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-fiqx-estimate],[data-fiqx-open-est],[data-fiqx-new-est],[data-fiqx-pricelist]'); if (!b) return;
    ev.preventDefault(); ev.stopPropagation();
    if (b.hasAttribute('data-fiqx-estimate')) return openEstimator(b.getAttribute('data-fiqx-estimate'));
    if (b.hasAttribute('data-fiqx-pricelist')) return openPriceList();
    if (b.hasAttribute('data-fiqx-open-est')) { var e = estById(b.getAttribute('data-fiqx-open-est')); if (e) openEstimator(e.projectId, e.id); return; }
    var pid = b.getAttribute('data-fiqx-new-est'), n = newEstimateFor(pid); if (n) { view = { projectId: pid, mode: 'edit', estId: n.id }; render(); }
  }, true);

  // 2. "Cost estimates" group at the top of the Customer Library's Estimate tab. The existing
  //    estimate-stage rows below it are unchanged.
  function costEstimatesHtml(jobList) {
    var js = (jobList || []).filter(Boolean);
    var body = js.map(function (p) {
      var list = jobEstimates(p.id);
      return '<h4>' + esc(p.name || p.customer || 'Job') + '</h4>' + list.map(function (e) {
        var last = e.versions[e.versions.length - 1];
        return '<button type="button" class="fiqx-clrow" data-fiqx-open-est="' + esc(e.id) + '"><span><strong>' + esc(e.name) + '</strong> ' + statusChip(e) + '</span><span class="fiqx-sub">' + (last ? 'V' + last.n + ' · ' + money(C.suggestedOf(e)) : 'draft') + '</span></button>';
      }).join('') + '<button type="button" class="fiqx-btn" data-fiqx-new-est="' + esc(p.id) + '">+ New estimate</button>';
    }).join('');
    ensureStyle();
    return '<div class="fiqx-cl"><div class="fiqx-row"><h3 style="margin:0">Cost estimates</h3><span class="fiqx-internal">Internal · not for production</span><span class="fiqx-sp"></span><button type="button" class="fiqx-btn" data-fiqx-pricelist="1">Material Price List</button></div>' + (body || '<p class="fiqx-sub">No jobs.</p>') + '</div>' +
      '<h3 style="margin:10px 0 4px">Designs in estimate stage</h3>';
  }
  var origDocs = window.fiqCustomerDocumentsHtml;
  window.fiqCustomerDocumentsHtml = function (jobList) {
    var rest = ''; try { rest = typeof origDocs === 'function' ? (origDocs(jobList) || '') : ''; } catch (e) { console.error(e); }
    return costEstimatesHtml(jobList) + (rest || '<div class="empty">No designs in estimate stage.</div>');
  };
})();
