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
  // Currency (21 Nov 2026): a label only, never a conversion. pageCur is the currency of what is on screen (the open estimate or
  // saved version, or the price list while it is open); the estimate lists pass each estimate's own currency.
  var pageCur = 'EUR';
  function money(v, code) { return C.formatMoney(v, code || pageCur); }
  function sym(code) { return C.currencySymbol(code || pageCur); }
  function amt(v) { return v === null || v === undefined ? '' : String(v); }
  function jobTitle(p) { return p ? (p.customer || p.name || 'Untitled job') + (p.customer && p.name && p.name !== p.customer ? ' · ' + p.name : '') + (p.address ? ' · ' + p.address : '') : 'Job'; }
  function statusChip(e) { var m = { draft: ['Draft', 'muted'], saved: ['Saved', 'info'], won: ['Won', 'ok'], lost: ['Lost', 'muted'] }[e.status] || [e.status, 'muted']; return '<span class="fiqx-chip fiqx-' + m[1] + '">' + m[0] + '</span>'; }
  function catLabel(k) { var c = C.CATEGORIES.find(function (x) { return x[0] === k; }); return c ? c[1] : k; }
  function activeItems(pred) { return priceList().items.filter(function (i) { return !i.archived && (!pred || pred(i)); }); }
  function itemOptions(sel, pred, blank) {
    var list = activeItems(pred), cur = sel && !list.some(function (i) { return i.id === sel; }) ? C.findItem(priceList(), sel) : null;
    return '<option value="">' + esc(blank || 'Choose…') + '</option>' + (cur ? '<option value="' + esc(cur.id) + '" selected>' + esc(cur.name) + ' (archived)</option>' : '') +
      list.map(function (i) { return '<option value="' + esc(i.id) + '"' + (i.id === sel ? ' selected' : '') + '>' + esc(i.name) + (i.cost !== null ? ' · ' + money(i.cost) + '/' + i.unit : ' · no price') + '</option>'; }).join('');
  }

  // ---------- styles ----------
  var css = '' +
    '.fiqx-ov{position:fixed;inset:0;z-index:99990;background:rgba(16,20,24,.5);display:flex;align-items:stretch;justify-content:center;padding:18px;font-family:inherit}' +
    '.fiqx-win{background:#f4f6f8;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.3);width:min(1280px,100%);display:flex;flex-direction:column;overflow:hidden;color:#101418;font-size:16px;line-height:1.4}' +
    '.fiqx-top{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:12px 16px;background:#fff;border-bottom:1px solid #c9d1db}' +
    '.fiqx-top h2{font-size:20px;margin:0 8px 0 0;color:#101418}.fiqx-sub{color:#2f3a47;font-size:14px}.fiqx-sp{flex:1}' +
    '.fiqx-chip{font-size:13px;font-weight:800;padding:4px 10px;border-radius:999px}.fiqx-warn,.fiqx-err{background:#fdecec;color:#8e0f1a}.fiqx-info{background:#e6eef8;color:#0f2f57}.fiqx-ok{background:#e3f3e8;color:#14532d}.fiqx-muted{background:#e8ebef;color:#101418}' +
    '.fiqx-internal{font-size:13px;font-weight:700;color:#101418;background:#fff;border:1px solid #8b95a3;padding:3px 9px;border-radius:6px}' +
    '.fiqx-btn{border:1.5px solid #7b8696;background:#fff;color:#101418;border-radius:8px;padding:8px 14px;font-weight:700;font-size:15px;cursor:pointer}.fiqx-btn:hover{background:#eef1f5}' +
    '.fiqx-pri{background:#101418;color:#fff;border-color:#101418}.fiqx-pri:hover{background:#2b3541}.fiqx-btn[disabled]{opacity:.45;cursor:not-allowed}' +
    '.fiqx-body{flex:1;min-height:0;overflow:auto;display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:16px;padding:16px}' +
    '.fiqx-body.single{grid-template-columns:minmax(0,1fr)}' +
    '.fiqx-card{background:#fff;border:1px solid #c9d1db;border-radius:12px;padding:16px;margin-bottom:14px}' +
    '.fiqx-card h3{font-size:16px;margin:0 0 8px;color:#101418}.fiqx-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}' +
    '.fiqx-in{border:1.5px solid #7b8696;border-radius:7px;padding:7px 9px;font:inherit;font-size:15px;background:#fff;color:#101418;min-width:0}' +
    '.fiqx-in::placeholder{color:#4a5563;opacity:1}.fiqx-in.num{width:84px;text-align:right}.fiqx-in.wide{width:100%}.fiqx-in:disabled{background:#eef1f5;color:#2f3a47}' +
    '.fiqx-t{width:100%;border-collapse:collapse;font-size:15px}.fiqx-t th{text-align:left;color:#1f2933;font-weight:800;font-size:13px;padding:6px 4px}.fiqx-t td{padding:5px 4px;border-top:1px solid #d5dbe3;vertical-align:middle}' +
    '.fiqx-x{border:0;background:none;color:#8e0f1a;font-size:20px;cursor:pointer}.fiqx-ovr{font-size:13px;color:#a4121c;font-weight:700}.fiqx-red{color:#a4121c;font-size:14px;font-weight:800}' +
    '.fiqx-sum{position:sticky;top:0;align-self:start}.fiqx-sum .l{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 0;font-size:18px;color:#101418}' +
    '.fiqx-sum .l span:first-child{color:#101418}.fiqx-sum .sep{border-top:2px solid #101418;margin:8px 0}.fiqx-sum .fiqx-in{font-size:17px}.fiqx-profit{font-size:21px!important;font-weight:800}' +
    '.fiqx-q{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;margin:2px 0 4px}.fiqx-q button{font-size:13px;padding:3px 9px;border:1.5px solid #7b8696;border-radius:6px;background:#fff;color:#101418;cursor:pointer}' +
    '.fiqx-warnbox{background:#fff;border:1.5px solid #7b8696;color:#101418;border-radius:8px;padding:8px 10px;font-size:14px;margin:6px 0}' +
    '.fiqx-list button.fiqx-item{display:flex;width:100%;justify-content:space-between;align-items:center;text-align:left;border:1.5px solid #c9d1db;background:#fff;color:#101418;border-radius:10px;padding:12px 14px;margin-bottom:8px;cursor:pointer;font:inherit;font-size:16px}' +
    '.fiqx-side{position:fixed;right:18px;top:70px;bottom:18px;width:360px;background:#fff;color:#101418;border:1px solid #c9d1db;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,.25);z-index:99995;overflow:auto;padding:14px}' +
    '.fiqx-side img{width:100%;border-radius:8px;margin:4px 0}' +
    '#fiqxStudioEstimatorBtn{flex-shrink:0;padding:6px 10px;font-size:11px;min-height:0;font-weight:800;background:#e8f0ff;border-color:#8fa8df;color:#0b2545}' +
    '@media(max-width:1100px){#screen-mark #fiqxStudioEstimatorBtn{grid-column:1 / -1;width:100%}}' +
    '.fiqx-need{border:2px solid #c62828;background:#fff}.fiqx-studio{border-color:#7b8696}.fiqx-stale{border-color:#c62828}' +
    '.fiqx-modal-bg{position:fixed;inset:0;z-index:99999;background:rgba(16,20,24,.55);display:flex;align-items:center;justify-content:center;padding:18px}' +
    '.fiqx-modal{background:#fff;color:#101418;border-radius:12px;max-width:760px;width:100%;max-height:88vh;overflow:auto;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.35)}.fiqx-modal h3{margin:0 0 6px;font-size:20px}.fiqx-modal ul{margin:4px 0 10px 18px;padding:0}.fiqx-modal li{margin:4px 0;font-size:15px}' +
    '.fiqx-nav{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:10px;padding:10px 16px;background:#fff;border-bottom:1px solid #c9d1db;flex:0 0 auto}' +
    '.fiqx-nbtn{min-height:52px;font:inherit;font-size:16px;font-weight:800;color:#101418;background:#fff;border:2px solid #101418;border-radius:10px;cursor:pointer;padding:6px 10px}.fiqx-nbtn:hover{background:#eef1f5}' +
    '.fiqx-nbtn.fiqx-npri{background:#101418;color:#fff}.fiqx-nbtn[disabled]{opacity:.4;cursor:not-allowed}' +
    '.fiqx-title{font-size:30px;font-weight:800;line-height:1.2;color:#101418}.fiqx-head{margin:2px 0 14px}.fiqx-head .fiqx-row{margin-top:8px}' +
    '.fiqx-h{font-size:15px;font-weight:800;letter-spacing:.05em;color:#1f2933;margin:0 0 6px}' +
    '.fiqx-lg{min-height:46px;font-size:15px;font-weight:800;padding:8px 16px}' +
    '.fiqx-fold{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.fiqx-pbody{margin-top:12px;overflow-x:auto}' +
    '.fiqx-warnline{display:flex;flex-wrap:wrap;gap:6px 20px;background:#fff;border:2px solid #c62828;color:#7f0a14;border-radius:10px;padding:10px 14px;font-size:16px;font-weight:700;margin-bottom:14px}.fiqx-warnline a{color:#7f0a14;text-decoration:underline;font-weight:800}' +
    '.fiqx-mrow{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:6px 20px;align-items:center;padding:16px 0;border-top:1px solid #d5dbe3}.fiqx-mrow:first-child{border-top:0}' +
    '.fiqx-mname{font-size:21px;font-weight:800;text-transform:uppercase;letter-spacing:.01em;overflow-wrap:anywhere;color:#101418}.fiqx-mbig{font-size:40px;line-height:1;font-weight:800;white-space:nowrap;text-transform:uppercase;color:#101418}.fiqx-mcost{min-width:90px;text-align:right;color:#101418;font-size:16px}' +
    '.fiqx-edging{border-top:1px solid #d5dbe3;margin-top:4px;padding-top:8px}.fiqx-erow{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:4px 20px;font-size:15px;color:#2f3a47;padding:4px 0;align-items:center}.fiqx-erow span:nth-child(2),.fiqx-erow span:nth-child(3){text-align:right;min-width:90px}.fiqx-cuts{margin-top:4px;font-size:15px}' +
    '.fiqx-sg{border-top:1px solid #d5dbe3;padding:12px 0}.fiqx-sg:first-child{border-top:0}.fiqx-sgname{font-size:17px;margin-bottom:8px}' +
    '.fiqx-fields{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px 12px;align-items:end}.fiqx-field{display:flex;flex-direction:column;gap:4px;font-size:14px;font-weight:700;color:#101418}.fiqx-field .fiqx-in.num{width:100%;text-align:left}.fiqx-field small{font-weight:600;color:#2f3a47;font-size:13px}.fiqx-chk{flex-direction:row;align-items:center;gap:8px;font-size:15px;min-height:36px}' +
    '.fiqx-note{font-size:14px;color:#8e0f1a;font-weight:700;margin-top:8px}' +
    '.fiqx-mprice{display:flex;flex-direction:column;align-items:flex-end;gap:3px}.fiqx-mprice .fiqx-in{width:92px;text-align:right}.fiqx-pin{display:flex;gap:6px;align-items:center;white-space:nowrap}' +
    '.fiqx-total{display:flex;flex-direction:column;gap:2px;background:#e3f3e8;color:#0b4a24;border-radius:12px;padding:14px 16px;margin:12px 0;font-weight:800}.fiqx-total span{font-size:16px;letter-spacing:.02em}.fiqx-total b{font-size:40px;line-height:1.1}' +
    '.fiqx-inl{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.fiqx-sm{padding:3px 10px;font-size:14px}' +
    '@media(max-width:900px){.fiqx-body{grid-template-columns:minmax(0,1fr)}.fiqx-sum{position:static}}' +
    '@media(max-width:600px){.fiqx-ov{padding:0}.fiqx-win{border-radius:0}.fiqx-nav{grid-template-columns:1fr 1fr}.fiqx-nav .fiqx-npri{grid-column:1 / -1}.fiqx-title{font-size:23px}.fiqx-mbig{font-size:30px}.fiqx-mrow{grid-template-columns:minmax(0,1fr) auto}.fiqx-mcost{grid-column:1 / -1;text-align:left}.fiqx-mprice{align-items:flex-start}.fiqx-body{padding:10px}.fiqx-total b{font-size:34px}}' +
    '.fiqx-job-est-btn{height:36px;padding:0 14px;border:2px solid #101418;background:#fff;color:#101418;border-radius:9px;font:800 14px Inter,Arial,sans-serif;cursor:pointer;white-space:nowrap}.fiqx-job-est-btn:hover{background:#eef1f5}' +
    '.jor-top-actions .fiqx-job-est-btn{height:48px;border-radius:12px}' +
    '.fiqx-est-btn{margin-left:6px}.fiqx-cl{margin-bottom:14px}.fiqx-cl h4{margin:6px 0}.fiqx-cl .fiqx-clrow{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:8px 10px;border:1.5px solid #c9d1db;border-radius:8px;margin:4px 0;background:#fff;color:#101418;cursor:pointer;width:100%;font:inherit;text-align:left}';
  function ensureStyle() { if (document.getElementById('fiqx-style')) return; var s = document.createElement('style'); s.id = 'fiqx-style'; s.textContent = css + sheetsCss(); document.head.appendChild(s); }

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
    syncSheets();
    if (estId) view = { projectId: projectId, mode: estById(estId) && estById(estId).draft ? 'edit' : 'version', estId: estId };
    else view = { projectId: projectId, mode: 'choose' };
    if (view.mode === 'version') { var e = estById(estId); view.n = e.versions.length ? e.versions[e.versions.length - 1].n : null; }
    render();
  }
  // ---- panels copied from Studio ----
  // Initial sheet settings are exactly what Panel Check would use for the same panels: the job own settings first,
  // then this browser, then the material default (3 mm saw cut, 5 mm trim, grain by material), including its
  // automatic choice of a bigger or least-waste standard sheet. Read only; stored in the estimate, never back.
  function groupParts(version, key, fallbackMaterial) {
    var out = [];
    (version.sections || []).forEach(function (s) { (s.lines || []).forEach(function (l) {
      if (l.type === 'panel' && C.sheetKeyOf(l) === key) out.push({ material: l.material || (l.src ? '' : fallbackMaterial) || '', thickness: l.thickness, length: Math.round((Number(l.lengthCm) || 0) * 10), width: Math.round((Number(l.widthCm) || 0) * 10), qty: Math.max(1, Math.floor(Number(l.qty)) || 1), code: l.code, name: l.name });
    }); });
    return out;
  }
  function panelCheckCfg(job, parts, material, thickness) {
    try {
      if (typeof window.a181ComputeGroups === 'function' && parts.length) {
        var g = window.a181ComputeGroups(parts, job)[0];
        if (g && g.cfg) return { w: g.cfg.w, h: g.cfg.h, kerf: g.cfg.kerf, trim: g.cfg.trim, grain: !!g.cfg.grain, from: 'panelcheck' };
      }
      if (typeof window.a181CfgFor === 'function' && typeof window.a181LoadSettings === 'function') { var c = window.a181CfgFor(window.a181LoadSettings(), material, thickness, job); return { w: c.w, h: c.h, kerf: c.kerf, trim: c.trim, grain: !!c.grain, from: 'panelcheck' }; }
    } catch (x) { console.error('Estimator: Panel Check settings', x); }
    return null;
  }
  function ensureCfg(version, key, item, line, job) {
    if (!key || !version.sheetCfg || version.sheetCfg[key]) return;
    var material = (line && line.material) || (item && item.name) || '', thickness = (line && line.thickness) || (item && item.sheet && item.sheet.thickness) || 0;
    var c = panelCheckCfg(job, groupParts(version, key, material), material, thickness);
    if (c) version.sheetCfg[key] = c;
  }
  function initCfgs(version, job) { C.importedLines(version).forEach(function (x) { var key = C.sheetKeyOf(x.line); if (key) ensureCfg(version, key, C.findItem(priceList(), x.line.itemId), x.line, job); }); }
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
    return d.stale ? '<span class="fiqx-chip fiqx-err" title="The Studio design changed after these panels were copied">Studio changed</span> ' : '';
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
      '<span class="fiqx-internal">Internal estimate · not for production</span>' + '<span class="fiqx-sp"></span>' + (extra || '') +
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
          '<span class="fiqx-sub"> ' + (last ? 'V' + last.n + ' · ' + money(C.suggestedOf(e), C.currencyOf(e, last)) : 'not saved yet') + (e.draft && last ? ' · draft of V' + (last.n + 1) : '') + '</span></span><span>›</span></button>';
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
      var imported = !!l.src, hasMat = !!String(l.material || '').trim(), need = (!l.itemId && !(imported && hasMat)) ? ' fiqx-need' : '', edgePred = function (i) { return i.category === 'edging'; };
      var kind = imported ? 'Studio panel' + (l.code ? '<div class="fiqx-sub">' + esc(l.code) + '</div>' : '') + (l.removedInStudio ? '<div class="fiqx-ovr">removed in Studio</div>' : '') : 'Rough panel';
      var edgeCell;
      if (l.edges === 'counts') {
        var needE = ((Number(l.edgeLong) > 0 || Number(l.edgeShort) > 0) && !l.edgeItemId && !hasMat) ? ' fiqx-need' : '';
        edgeCell = '<span class="fiqx-sub">Long edges</span> <input class="fiqx-in num" style="width:46px" inputmode="numeric" value="' + esc(amt(l.edgeLong)) + '"' + b('edgeLong') + dis + '> <span class="fiqx-sub">Short edges</span> <input class="fiqx-in num" style="width:46px" inputmode="numeric" value="' + esc(amt(l.edgeShort)) + '"' + b('edgeShort') + dis + '> ' +
          '<select class="fiqx-in' + needE + '" data-s="' + esc(sec.id) + '|' + esc(l.id) + '|edgeItemId"' + dis + '>' + itemOptions(l.edgeItemId, edgePred, imported ? 'Edging item (optional)…' : 'Edging…') + '</select>';
      } else {
        edgeCell = '<select class="fiqx-in" data-s="' + esc(sec.id) + '|' + esc(l.id) + '|edges"' + dis + '>' + [['none', 'No edging'], ['long', 'Long edges'], ['all', 'All edges']].map(function (o) { return '<option value="' + o[0] + '"' + ((l.edges || 'none') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>' +
          (l.edges && l.edges !== 'none' ? ' <select class="fiqx-in" data-s="' + esc(sec.id) + '|' + esc(l.id) + '|edgeItemId"' + dis + '>' + itemOptions(l.edgeItemId, edgePred, 'Edging…') + '</select>' : '');
      }
      return '<tr><td>' + kind + '</td><td><input class="fiqx-in" value="' + esc(l.name) + '" placeholder="e.g. Sides"' + b('name') + dis + '>' +
        (imported && l.material ? '<div class="fiqx-sub">Studio: ' + esc(l.material) + (l.thickness ? ' ' + esc(l.thickness) + ' mm' : '') + '</div>' : '') + '</td>' +
        '<td><input class="fiqx-in num" inputmode="decimal" value="' + esc(amt(l.lengthCm)) + '"' + b('lengthCm') + dis + '> × <input class="fiqx-in num" inputmode="decimal" value="' + esc(amt(l.widthCm)) + '"' + b('widthCm') + dis + '> cm</td>' +
        '<td><input class="fiqx-in num" inputmode="numeric" value="' + esc(amt(l.qty)) + '"' + b('qty') + dis + '></td>' +
        '<td colspan="2"><select class="fiqx-in' + need + '" data-s="' + esc(sec.id) + '|' + esc(l.id) + '|itemId"' + dis + '>' + itemOptions(l.itemId, function (i) { return i.category === 'sheet'; }, imported ? (hasMat ? 'Price list item (optional)…' : 'Choose sheet material…') : 'Sheet material…') + '</select> ' + edgeCell + '</td><td>' + x + '</td></tr>';
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
  function matRow(name, big, cost, tag, priceKey, unit, q) {
    var costCell = cost;
    if (priceKey && !viewReadOnly) {
      var sheetPrice = priceKey.indexOf('sheets|') === 0, noPrice = unit === null || unit === undefined;
      costCell = '<div class="fiqx-mprice"><span class="fiqx-pin">' + esc(sym()) + ' <input class="fiqx-in num' + (noPrice ? ' fiqx-need' : '') + '" inputmode="decimal" placeholder="price" aria-label="' + (sheetPrice ? 'Price per sheet' : 'Price per metre') + '" value="' + esc(amt(unit)) + '" data-gb="' + esc(priceKey) + '"> <span class="fiqx-sub">' + (sheetPrice ? 'per sheet' : 'per metre') + '</span></span>' + (noPrice ? '' : '<span class="fiqx-sub">= ' + lineCost(unit, q) + '</span>') + '</div>';
    }
    return '<div class="fiqx-mrow"><div class="fiqx-mname">' + esc(name) + (tag ? ' <span class="fiqx-sub">(' + esc(tag) + ')</span>' : '') + '</div><div class="fiqx-mbig">' + esc(big) + '</div><div class="fiqx-mcost">' + costCell + '</div></div>';
  }
  var viewReadOnly = false;
  function plural(n, w) { return n + ' ' + w + (Number(n) === 1 ? '' : 's'); }
  // The main block: how many sheets of each material, edging and cuts small underneath.
  function materialsHtml(v) {
    var d = v.derived || { sheets: {}, edging: {} }, notes = d.notes || {}, rows = [], edge = [];
    Object.keys(d.sheets || {}).forEach(function (id) {
      var g = d.sheets[id], set = g.override !== null && g.override !== undefined, q = set ? Number(g.override) : g.count;
      rows.push(matRow(matName(g.name), plural(q, 'sheet'), lineCost(g.unitCost, q), set ? 'set by you' : '', String(id).indexOf('mat:') === 0 ? 'sheets|' + id + '|unitCost' : null, g.unitCost, q));
    });
    ((v && v.sections) || []).forEach(function (s) { (s.lines || []).forEach(function (l) { if (l.type === 'sheets' && Number(l.qty) > 0) rows.push(matRow(matName(l.name) || 'Sheets', plural(Number(l.qty), 'sheet'), lineCost(l.unitCost, Number(l.qty)), 'added by hand')); }); });
    Object.keys(d.edging || {}).forEach(function (id) {
      var g = d.edging[id], q = g.override !== null && g.override !== undefined ? Number(g.override) : g.metres;
      var inlineEdge = String(id).indexOf('mat:') === 0 && !viewReadOnly;
      edge.push('<div class="fiqx-erow"><span>Edging, ' + esc(matName(g.name).replace(/^Edging\s*/i, '')) + '</span><span>' + q + ' m</span><span>' + (inlineEdge ? esc(sym()) + ' <input class="fiqx-in num' + (g.unitCost === null || g.unitCost === undefined ? ' fiqx-need' : '') + '" style="width:76px" inputmode="decimal" placeholder="per m" value="' + esc(amt(g.unitCost)) + '" data-gb="edging|' + esc(id) + '|unitCost"> ' : '') + (g.unitCost === null || g.unitCost === undefined ? (inlineEdge ? '' : lineCost(g.unitCost, q)) : lineCost(g.unitCost, q)) + '</span></div>');
    });
    return (rows.length ? rows.join('') : '<p class="fiqx-sub">No sheets yet. Copy the panels from Studio, or open Panel details and add panels.</p>') +
      (edge.length ? '<div class="fiqx-edging">' + edge.join('') + '</div>' : '') + (notes.cuts ? '<div class="fiqx-sub fiqx-cuts">About ' + notes.cuts + ' cuts (estimate)</div>' : '');
  }
  // One thin line of short messages. Anything that makes the numbers incomplete is always listed here.
  function warningsHtml(p, v, ro) {
    var d = v.derived || {}, notes = d.notes || {}, items = [], tooBig = 0, miss = [];
    var diff = v.source && p ? C.diffAgainstJob(v, p) : null;
    if (diff && diff.stale) items.push('Studio design has changed. Estimate may be out of date. ' + (ro ? 'Edit this estimate to review.' : '<a href="#" data-act="studioreview">Review</a>'));
    if (notes.noMaterial && notes.noMaterial.length) items.push(plural(notes.noMaterial.length, 'panel') + ' with no material in Studio. ' + (ro ? '' : '<a href="#" data-act="fixsheet">Choose</a>'));
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
    var status = src ? (stale ? '<span class="fiqx-chip fiqx-err">Studio changed</span>' : '<span class="fiqx-chip fiqx-ok">Matches Studio</span>') : '';
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
      return '<div class="fiqx-sg"><div class="fiqx-mname fiqx-sgname">' + esc(matName(g.name)) + '</div>' + (ro ? '' : sheetPickerHtml(id, c)) + '<div class="fiqx-fields">' +
        field('Sheet length mm', inp('data-cfg="' + e2 + '|w"', c.w)) + field('Sheet width mm', inp('data-cfg="' + e2 + '|h"', c.h)) +
        field('Sheets to buy', inp('data-gb="sheets|' + e2 + '|override"', g.override, String(g.count)), 'calculated ' + g.count) +
        field('Price per sheet ' + esc(sym()), inp('data-gb="sheets|' + e2 + '|unitCost"', g.unitCost)) +
        field('Saw cut mm', inp('data-cfg="' + e2 + '|kerf"', c.kerf)) + field('Trim mm', inp('data-cfg="' + e2 + '|trim"', c.trim)) +
        '<label class="fiqx-field fiqx-chk"><input type="checkbox" data-cfg="' + e2 + '|grain"' + (c.grain ? ' checked' : '') + dis + '> Keep grain direction</label></div>' +
        (g.sizeDiffers ? '<div class="fiqx-note">Size differs from the price list (' + g.listW + ' × ' + g.listH + ' mm). Price per sheet kept.</div>' : '') +
        (g.tooBig ? '<div class="fiqx-note">' + plural(g.tooBig, 'panel') + ' bigger than this sheet.</div>' : '') + '</div>';
    });
    var edging = Object.keys(d.edging || {}).map(function (id) {
      var g = d.edging[id], e2 = esc(id);
      return '<div class="fiqx-sg"><div class="fiqx-mname fiqx-sgname">' + esc(matName(g.name)) + '</div><div class="fiqx-fields">' +
        field('Metres to buy', inp('data-gb="edging|' + e2 + '|override"', g.override, String(g.metres)), 'calculated ' + g.metres + ' m') + field('Price per metre ' + esc(sym()), inp('data-gb="edging|' + e2 + '|unitCost"', g.unitCost)) + '</div></div>';
    });
    var allow = '<div class="fiqx-sg"><div class="fiqx-fields">' + field('Extra for waste %', inp('data-ib="allowancePct"', v.inputs && v.inputs.allowancePct), 'added to sheets and edging, 0 if sizes are already rounded up') + '</div></div>';
    return (sheets.length || edging.length ? sheets.join('') + edging.join('') : '<p class="fiqx-sub">Settings appear once panels have a sheet material.</p>') + allow +
      (ro ? '' : '<div style="margin-top:8px"><button class="fiqx-btn" data-act="refresh">Refresh prices from the price list</button></div>');
  }
  function sheetsCardHtml(v, ro) {
    var open = view.open.sheets;
    return '<div class="fiqx-card" id="fiqxSheets"><div class="fiqx-fold"><div><h3 class="fiqx-h">SHEET SETTINGS</h3></div>' +
      '<button class="fiqx-btn fiqx-lg" data-act="togglesheets">' + (open ? 'HIDE' : 'SHOW') + '</button></div>' +
      (open ? '<div class="fiqx-pbody" id="fiqxSettingsBody">' + (ro ? settingsBodyHtml(v, true) : '') + '</div>' : '') + '</div>';
  }
  function extrasCardHtml(p, e, v, ro) {
    var i = v.inputs, dis = ro ? ' disabled' : '', extra = [], first = (v.sections || [])[0];
    (v.sections || []).forEach(function (s) { (s.lines || []).forEach(function (l) { if (l.type !== 'panel') extra.push(lineRow(s, l, ro)); }); });
    var secAttr = first ? ' data-sec="' + esc(first.id) + '"' : '';
    var r = ro ? (v.results || C.compute(v)) : C.compute(v);
    return '<div class="fiqx-card"><h3 class="fiqx-h">ADDITIONAL COSTS</h3>' +
      (extra.length ? '<div style="overflow-x:auto"><table class="fiqx-t"><thead><tr><th>Type</th><th colspan="2">Item</th><th>Qty</th><th>Unit cost</th><th>Total</th><th></th></tr></thead><tbody>' + extra.join('') + '</tbody></table></div>' : '') +
      (ro ? '' : '<div class="fiqx-row" style="margin:6px 0 12px"><button class="fiqx-btn fiqx-lg" data-act="add" data-type="item"' + secAttr + '>+ Price list item</button><button class="fiqx-btn fiqx-lg" data-act="add" data-type="custom"' + secAttr + '>+ Custom item</button><button class="fiqx-btn" data-act="add" data-type="sheets"' + secAttr + '>+ Extra sheets</button></div>') +
      '<div class="fiqx-sub" style="margin-top:8px">Labour</div><div class="fiqx-row"><input class="fiqx-in num" inputmode="decimal" value="' + esc(amt(i.labourDays)) + '" data-ib="labourDays"' + dis + '> days × ' + esc(sym()) + ' <input class="fiqx-in num" inputmode="decimal" value="' + esc(amt(i.dayRate)) + '" data-ib="dayRate"' + dis + '> per day <strong id="fiqxLabourTotal">' + money(r.labourCharged) + '</strong></div>' +
      '<div class="fiqx-sub" style="margin-top:12px">Transport and other costs</div><table class="fiqx-t"><tbody>' + (i.otherCosts || []).map(function (o, k) {
        return '<tr><td><input class="fiqx-in wide" value="' + esc(o.label) + '" placeholder="e.g. Transport" data-ob="' + k + '|label"' + dis + '></td><td style="width:110px"><input class="fiqx-in num" inputmode="decimal" value="' + esc(amt(o.amount)) + '" data-ob="' + k + '|amount"' + dis + '></td><td style="width:30px">' + (ro ? '' : '<button class="fiqx-x" data-act="rmother" data-k="' + k + '">×</button>') + '</td></tr>';
      }).join('') + '</tbody></table>' + (ro ? '' : '<button class="fiqx-btn fiqx-lg" data-act="addother">+ Other cost</button>') +
      '</div>';
  }
  // Notes stay closed until wanted.
  function notesCardHtml(v, ro) {
    var open = view.open.notes, has = String(v.notes || '').trim();
    return '<div class="fiqx-card"><div class="fiqx-fold"><div><h3 class="fiqx-h" style="margin:0">NOTES</h3>' + (has && !open ? '<div class="fiqx-sub">Has a note</div>' : '') + '</div><button class="fiqx-btn fiqx-lg" data-act="togglenotes">' + (open ? 'HIDE' : 'SHOW') + '</button></div>' +
      (open ? '<div class="fiqx-pbody"><textarea class="fiqx-in wide" rows="3" data-db="notes"' + (ro ? ' disabled' : '') + '>' + esc(v.notes || '') + '</textarea></div>' : '') + '</div>';
  }
  function navHtml(ro) {
    return '<div class="fiqx-nav"><button class="fiqx-nbtn" data-act="close">← BACK TO STUDIO</button><button class="fiqx-nbtn" data-act="custjob">CUSTOMER JOB</button>' +
      (ro ? '<button class="fiqx-nbtn fiqx-npri" data-act="editnew"' + (canWrite() ? '' : ' disabled') + '>EDIT ESTIMATE</button>' : '<button class="fiqx-nbtn fiqx-npri" data-act="savev" id="fiqxSaveBtn">SAVE ESTIMATE</button>') +
      '</div>';
  }
  function currencyControlHtml(e, v, ro) {
    var cur = ro ? C.currencyOf(e, v) : C.currencyOf(e);
    if (ro) return '<span class="fiqx-chip" title="The currency this version was saved in">' + esc(cur) + '</span>';
    var plc = C.currencyCode(priceList().currency);
    return '<label class="fiqx-cur"><span class="fiqx-sub">Currency</span><select class="fiqx-in" data-eb="currency" aria-label="Estimate currency"' + (canWrite() ? '' : ' disabled') + '>' +
      C.CURRENCIES.map(function (c) { return '<option value="' + c[0] + '"' + (c[0] === cur ? ' selected' : '') + '>' + c[0] + ' \u2013 ' + esc(c[1]) + '</option>'; }).join('') + '</select></label>' +
      (cur !== plc ? '<span class="fiqx-sub" title="The company price list is kept in ' + plc + '. Its prices are used as typed; nothing is converted.">Price list is in ' + plc + ': prices are used as typed, not converted.</span>' : '');
  }
  function headHtml(p, e, v, ro) {
    var title = p ? ((p.customer || p.name || 'Untitled job') + (p.customer && p.name && p.name !== p.customer ? ' · ' + p.name : '')) : 'Job', last = e.versions[e.versions.length - 1];
    var nameEl = ro ? '<strong>' + esc(e.name) + '</strong>' : '<input class="fiqx-in" style="font-weight:800;width:190px" value="' + esc(e.name) + '" data-eb="name">';
    var verText = ro ? 'V' + v.n + ' · saved ' + esc(new Date(v.savedAt).toLocaleString()) + ' · read-only' : (last ? 'Draft of V' + (last.n + 1) : 'Draft · not saved yet');
    var tabs = ro ? e.versions.map(function (x) { return '<button class="fiqx-btn' + (x.n === v.n ? ' fiqx-pri' : '') + '" data-act="showv" data-n="' + x.n + '">V' + x.n + '</button>'; }).join(' ') : '';
    var acts = ro && canWrite() ? '<button class="fiqx-btn" data-act="won">Mark Won</button> <button class="fiqx-btn" data-act="lost">Mark Lost</button> <button class="fiqx-btn" data-act="dup">Duplicate</button> <button class="fiqx-btn" data-act="archive">Archive</button>' : '';
    return '<div class="fiqx-head"><div class="fiqx-title">' + esc(title) + '</div>' +
      '<div class="fiqx-row">' + nameEl + statusChip(e) + staleChip(e) + '<span class="fiqx-sub">' + verText + '</span><span class="fiqx-internal">Internal estimate · not for production</span>' + currencyControlHtml(e, v, ro) + '<span class="fiqx-sub" id="fiqxAutosave"></span></div>' +
      (ro && (e.wonAt || e.lostAt) ? '<div class="fiqx-sub">' + (e.wonAt ? 'Won on ' + esc(new Date(e.wonAt).toLocaleDateString()) : '') + (e.lostAt ? 'Lost on ' + esc(new Date(e.lostAt).toLocaleDateString()) + (e.lostReason ? ': ' + esc(e.lostReason) : '') : '') + '</div>' : '') +
      '<div class="fiqx-row">' + tabs + (!ro && e.versions.length ? '<button class="fiqx-btn" data-act="versions">Saved versions</button>' : '') + acts + '<button class="fiqx-btn" data-act="togglecust">' + (view.open.cust ? 'Hide customer details' : 'Customer details') + '</button><button class="fiqx-btn" data-act="site">Site measurements</button><button class="fiqx-btn" data-act="pricelist">Price list</button></div>' +
      (view.open.cust && p ? '<div class="fiqx-card" style="margin:10px 0 0"><div><strong>' + esc(p.customer || '') + '</strong></div>' + (p.address ? '<div>' + esc(p.address) + '</div>' : '') + (p.phone ? '<div>' + esc(p.phone) + '</div>' : '') + (!p.address && !p.phone ? '<div class="fiqx-sub">No address or phone saved.</div>' : '') + '</div>' : '') + '</div>';
  }
  function pageHtml(p, e, v, ro) {
    pageCur = ro ? C.currencyOf(e, v) : C.currencyOf(e);
    var r = ro ? (v.results || C.compute(v)) : C.compute(v);
    return '<div class="fiqx-win">' + navHtml(ro) +
      '<div class="fiqx-body"><div class="fiqx-main">' + headHtml(p, e, v, ro) +
      '<div id="fiqxWarn">' + (ro ? warningsHtml(p, v, true) : '') + '</div>' +
      '<div class="fiqx-card" id="fiqxMaterialsCard"><h3 class="fiqx-h">MATERIAL REQUIREMENTS</h3><div id="fiqxMaterials">' + (ro ? materialsHtml(v) : '') + '</div></div>' +
      panelsCardHtml(p, e, v, ro) + sheetsCardHtml(v, ro) + extrasCardHtml(p, e, v, ro) + notesCardHtml(v, ro) +
      '</div><div class="fiqx-sum"><div class="fiqx-card" id="fiqxSummary">' + (ro ? summaryHtml(v, r, true) : '') + '</div></div></div></div>';
  }
  function editorHtml(p, e) { return pageHtml(p, e, e.draft, false); }
  function versionHtml(p, e) {
    var v = e.versions.find(function (x) { return x.n === view.n; }) || e.versions[e.versions.length - 1];
    if (!v) { view.mode = 'choose'; return chooserHtml(p); }
    viewReadOnly = true; try { return pageHtml(p, e, v, true); } finally { viewReadOnly = false; }
  }
  // Recalculate sheets and edging, then refresh everything that shows them. Keeps the cursor where it was.
  function refreshDerived(e) {
    pageCur = C.currencyOf(e);
    C.syncDerived(e.draft, priceList(), packFn());
    var a = document.activeElement, key = null, host = null, pos = a && a.selectionStart;
    if (a && a.getAttribute) {
      ['data-cfg', 'data-gb', 'data-ib'].forEach(function (k) { if (!key && a.getAttribute(k)) key = [k, a.getAttribute(k)]; });
      host = a.closest && (a.closest('#fiqxMaterials') ? 'fiqxMaterials' : (a.closest('#fiqxSettingsBody') ? 'fiqxSettingsBody' : null));
    }
    var m = document.getElementById('fiqxMaterials'); if (m) m.innerHTML = materialsHtml(e.draft);
    var s = document.getElementById('fiqxSettingsBody'); if (s) s.innerHTML = settingsBodyHtml(e.draft, false);
    if (key && host) { var hostEl = document.getElementById(host), again = hostEl && hostEl.querySelector('[' + key[0] + '="' + key[1] + '"]'); if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (x) {} } }
    refreshSummary(e);
  }
  function summaryHtml(v, r, ro) {
    var i = v.inputs, dis = ro ? ' disabled' : '', notes = (v.derived && v.derived.notes) || {};
    var incomplete = (r.missingPrices && r.missingPrices.length) || (notes.noSheet && notes.noSheet.length);
    var markup = ro ? '<span>' + esc(i.markupPct) + '%</span>' : '<span class="fiqx-inl"><button class="fiqx-btn fiqx-sm" data-act="mk" data-d="-5" aria-label="Decrease markup">−</button><input class="fiqx-in num" style="width:68px" inputmode="decimal" value="' + esc(amt(i.markupPct)) + '" data-ib="markupPct" id="fiqxMarkup">%<button class="fiqx-btn fiqx-sm" data-act="mk" data-d="5" aria-label="Increase markup">+</button></span>';
    var taxUnset = !r.taxSet && !ro, taxName = esc(i.taxLabel || 'Tax');
    return '<h3 class="fiqx-h">PRICE SUMMARY</h3>' +
      '<div class="l"><span>Material cost</span><span>' + money(r.materialCost) + '</span></div>' +
      '<div class="l"><span>Material markup</span>' + markup + '</div>' +
      (ro ? '' : '<div class="fiqx-q">' + [0, 10, 20, 30, 40, 50].map(function (q) { return '<button data-act="mkset" data-v="' + q + '">' + q + '%</button>'; }).join('') + '</div>') +
      '<div class="l"><span>Markup amount</span><span>' + money(r.markupAmount) + '</span></div>' +
      '<div class="l"><span>Labour</span><span>' + money(r.labourCharged) + '</span></div>' +
      '<div class="l"><span>Other costs</span><span>' + money(r.otherCosts) + '</span></div><div class="sep"></div>' +
      '<div class="l"><span><strong>Subtotal</strong></span><span><strong>' + money(r.subtotal) + '</strong></span></div>' +
      '<div class="l"><span>Tax rate</span><span class="fiqx-inl"><input class="fiqx-in num' + (taxUnset ? ' fiqx-need' : '') + '" style="width:76px" inputmode="decimal" aria-label="Tax rate percent" placeholder="0" value="' + esc(amt(i.taxRate)) + '" data-ib="taxRate"' + dis + '> %</span></div>' +
      '<div class="l"><span>Tax name</span><span class="fiqx-inl"><input class="fiqx-in" style="width:110px" aria-label="Tax name" placeholder="e.g. VAT" value="' + esc(i.taxLabel || '') + '" data-ib="taxLabel"' + dis + '></span></div>' +
      (taxUnset ? '<div class="fiqx-red" style="text-align:right">Enter a tax rate (0 is fine)</div>' : '') +
      '<div class="l"><span>' + taxName + '</span><span>' + (r.taxSet ? money(r.taxAmount) : '—') + '</span></div>' +
      '<div class="fiqx-total"><span>SUGGESTED CUSTOMER TOTAL</span><b>' + (r.taxSet ? money(r.suggestedTotal) : '—') + '</b></div>' + (incomplete ? '<div class="fiqx-red" style="margin:-4px 0 8px">Incomplete: some prices or sheet materials are missing.</div>' : '') +
      '<div class="l fiqx-profit"><span>ESTIMATED PROFIT</span><span style="color:#0b4a24">' + money(r.profit) + ' <span class="fiqx-sub">(' + r.marginPct.toFixed(1) + '%)</span></span></div>';
  }
  function refreshSummary(e) {
    pageCur = C.currencyOf(e);
    var el = document.getElementById('fiqxSummary'); if (!el) return;
    var active = document.activeElement, inSum = !!(active && el.contains(active)), key = inSum && active.getAttribute && active.getAttribute('data-ib'), pos = inSum && active.selectionStart;
    var r = C.compute(e.draft);
    el.innerHTML = summaryHtml(e.draft, r, false);
    if (key) { var again = el.querySelector('[data-ib="' + key + '"]'); if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (x) {} } }
    var lab = document.getElementById('fiqxLabourTotal'); if (lab) lab.textContent = money(r.labourCharged);
    var w = document.getElementById('fiqxWarn'); if (w) w.innerHTML = warningsHtml(jobById(e.projectId), e.draft, false);
    // Save is only possible with a tax rate; say so right beside the button.
    var problems = C.validateForSave(e.draft), sb = document.getElementById('fiqxSaveBtn');
    if (sb) { sb.disabled = !!problems.length || !canWrite(); sb.title = problems.length ? 'Enter a tax rate first (0 is allowed)' : ''; }
  }

  // ---------- events ----------
  function currentEst() { return view && view.estId ? estById(view.estId) : null; }
  function findLine(e, secId, lineId) { var s = e.draft.sections.find(function (x) { return x.id === secId; }); return { sec: s, line: s && s.lines.find(function (l) { return l.id === lineId; }) }; }
  function numOrNull(v) { var n = C.parseAmount(v); return n; }
  document.addEventListener('input', function (ev) {
    var t = ev.target; if (!t.closest || !t.closest('#fiqxEst')) return;
    var e = currentEst(); if (!e || !e.draft || !canWrite()) return; pageCur = C.currencyOf(e);
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
    var e = currentEst(); if (!e || !e.draft || !canWrite()) return; pageCur = C.currencyOf(e);
    var a;
    if ((a = t.getAttribute('data-s'))) {
      var parts = a.split('|'), hit = findLine(e, parts[0], parts[1]); if (!hit.line) return;
      if (parts[2] === 'itemId') {
        var it = C.findItem(priceList(), t.value);
        hit.line.itemId = it ? it.id : null;
        if (it && hit.line.type === 'panel') ensureCfg(e.draft, it.id, it, hit.line, jobById(e.projectId));
        if (hit.line.type !== 'panel') { hit.line.name = it ? it.name : ''; hit.line.unit = it ? it.unit : 'each'; hit.line.unitCost = it ? it.cost : null; hit.line.listCost = it ? it.cost : null; hit.line.overridden = false; }
      } else hit.line[parts[2]] = t.value;
    } else if ((a = t.getAttribute('data-ss'))) { var s = e.draft.sections.find(function (x) { return x.id === a.split('|')[0]; }); if (s) { s.roomId = t.value || null; var r = ((jobById(e.projectId) || {}).rooms || []).find(function (x) { return x.id === t.value; }); if (r && /^Section \d+$/.test(s.name)) s.name = r.name; } }
    else if (t.getAttribute('data-eb') === 'currency') { e.currency = C.currencyCode(t.value); pageCur = e.currency; }
    else if ((a = t.getAttribute('data-csel'))) { if (!applySavedSheet(e, a, t.value)) return; }
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
    var act = b.getAttribute('data-act'), e = currentEst(); if (e) pageCur = C.currencyOf(e, view && view.mode === 'version' ? e.versions.find(function (x) { return x.n === view.n; }) : null);
    var mutate = function (fn) { if (!canWrite()) return; fn(); persist(); render(); };
    switch (act) {
      case 'close': return backToStudio();
      case 'managesheets': return openSheetManager();
      case 'savesheet': { if (!e || !e.draft) return; var sid = b.getAttribute('data-id'), sc = (e.draft.sheetCfg && e.draft.sheetCfg[sid]) || C.cfgOf(e.draft, sid, C.findItem(priceList(), sid)); return openSheetManager({ w: sc.w, h: sc.h }); }
      case 'custjob': return toCustomerJob();
      case 'togglepanels': view.open.panels = !view.open.panels; return render();
      case 'togglesheets': view.open.sheets = !view.open.sheets; return render();
      case 'togglecust': view.open.cust = !view.open.cust; return render();
      case 'togglenotes': view.open.notes = !view.open.notes; return render();
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
        var copy = C.newEstimate({ projectId: e.projectId, customerId: e.customerId, customer: e.customer, name: e.name + ' (copy)', currency: C.currencyOf(e) }, priceList());
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
    var pl = priceList(), edit = canEditPrices(), dis = edit ? '' : ' disabled'; pageCur = C.currencyCode(pl.currency);
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
      (edit ? '' : '<span class="fiqx-chip fiqx-muted">View only: the company owner or an administrator can edit</span>') + '<button class="fiqx-btn" data-plact="sheets">Custom sheets…</button><button class="fiqx-btn" data-plact="close">Close</button></div>' +
      '<div class="fiqx-body single"><div>' +
      (edit && pending ? '<div class="fiqx-warnbox">' + pending + ' price' + (pending === 1 ? '' : 's') + ' saved in the Shopping List on this computer can be copied into the company price list. The Shopping List keeps its own prices unchanged. <button class="fiqx-btn" data-plact="import">Review and import</button></div>' : '') +
      (isOwner() && fsFns() ? '<div class="fiqx-card"><h3>Who can edit prices</h3><p class="fiqx-sub">You (the owner) always can. Tick anyone else in the company who should manage prices. Everyone signed in can use the prices in estimates.</p>' +
        (!admins.loaded ? '<p class="fiqx-sub">Loading…</p>' : admins.error ? '<div class="fiqx-warnbox">Could not load the company members: ' + esc(admins.error) + '</div>' : admins.members.length ?
          admins.members.map(function (m) { return '<label class="fiqx-row" style="padding:3px 0"><input type="checkbox" data-pladmin="' + esc(m.uid) + '"' + (admins.list.indexOf(m.uid) >= 0 ? ' checked' : '') + '> ' + esc(m.label) + ' <span class="fiqx-sub">(' + esc(m.role || 'member') + ')</span></label>'; }).join('') :
          '<p class="fiqx-sub">No other active members yet.</p>') + '</div>' : '') +
      '<div class="fiqx-card"><h3>Currency</h3><div class="fiqx-row"><select class="fiqx-in" data-plcur="1" aria-label="Price list currency"' + dis + '>' +
        C.CURRENCIES.map(function (c) { return '<option value="' + c[0] + '"' + (c[0] === pageCur ? ' selected' : '') + '>' + c[0] + ' \u2013 ' + esc(c[1]) + '</option>'; }).join('') + '</select>' +
        '<span class="fiqx-sub">The currency the prices below are in, and the starting currency of new estimates. Changing it only changes the label: nothing is converted.</span></div></div>' +
      '<div class="fiqx-card"><h3>Estimate defaults for new estimates</h3><div class="fiqx-row"><span class="fiqx-sub">Markup %</span><input class="fiqx-in num" value="' + esc(amt(pl.defaults.markupPct)) + '" data-pld="markupPct"' + dis + '>' +
      '<span class="fiqx-sub">Tax rate %</span><input class="fiqx-in num" placeholder="blank" value="' + esc(amt(pl.defaults.taxRate)) + '" data-pld="taxRate"' + dis + '>' +
      '<span class="fiqx-sub">Tax label</span><input class="fiqx-in" style="width:90px" placeholder="e.g. VAT" value="' + esc(pl.defaults.taxLabel) + '" data-pld="taxLabel"' + dis + '></div></div>' +
      '<div class="fiqx-card"><table class="fiqx-t"><thead><tr><th>Category</th><th>Name</th><th>Unit</th><th>Cost ' + esc(sym()) + '</th><th>Sheet size</th><th>Supplier</th><th>Updated</th><th></th></tr></thead><tbody>' + (rows || '<tr><td colspan="8" class="fiqx-sub">No items yet.</td></tr>') + '</tbody></table>' +
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
    if (t.hasAttribute('data-plcur')) { if (canEditPrices()) writePriceList(function (pl) { pl.currency = C.currencyCode(t.value); }); return renderPriceList(); }
    if (t.tagName === 'SELECT') renderPriceList();
  }, true);
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('#fiqxPL [data-plact]'); if (!b) return; ev.preventDefault();
    var act = b.getAttribute('data-plact');
    if (act === 'close') { var o = document.getElementById('fiqxPL'); if (o) o.remove(); if (view) render(); return; }
    if (act === 'sheets') return openSheetManager();
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


  // ---------- Custom sheets: the company's own named sheet sizes (21 Nov 2026) ----------
  // Kept in state.customSheets (this computer) and in the company's private cloud data (Firestore: companies/{companyId}/estimatorSheets/{id}),
  // which only the company's active members can read or write (see firestore.rules), so they follow the login to any computer.
  // A sheet typed while offline, or before the cloud rule is published, stays here and is uploaded on the next sync.
  // An estimate copies a size as plain numbers: editing or deleting a saved sheet never changes an estimate that used it.
  var cs = { editing: null, error: '', form: { name: '', w: '', h: '' }, edit: { name: '', w: '', h: '' } };
  var csSync = { running: false, again: false, state: 'idle', message: '', p: null };
  function sheets() { var s = st(); return C.sortSheets((s && Array.isArray(s.customSheets)) ? s.customSheets : []); }
  function writeSheets(fn) {
    var s = st(); if (!s || !canWrite()) return false;
    if (!Array.isArray(s.customSheets)) s.customSheets = []; if (!Array.isArray(s.customSheetsDeleted)) s.customSheetsDeleted = [];
    fn(s); persist(true); return true;
  }
  function stripSheet(x) { return { id: x.id, name: x.name, w: x.w, h: x.h, createdAt: x.createdAt, updatedAt: x.updatedAt, updatedBy: x.updatedBy || null }; }
  function sheetBackend() {
    if (window.fiqCustomSheetsBackend) return window.fiqCustomSheetsBackend;
    if (window.fiqBetaGuard && !window.fiqBetaGuard.sheetsCloud()) return null; // Beta: cloud saving is off until switched on on this computer
    var u = user(), f = fsFns();
    if (!u || !u.uid || !u.companyId || !f || !f.setDoc || !f.deleteDoc || !f.getDocs || !f.collection || !f.doc) return null;
    var db = window.fiqFirestore, col = function () { return f.collection(db, 'companies', u.companyId, 'estimatorSheets'); };
    return {
      list: function () {
        return f.getDocs(col()).then(function (q) {
          return q.docs.map(function (d) {
            var x = d.data() || {}, w = Number(x.w), h = Number(x.h); if (!x.name || !isFinite(w) || !isFinite(h)) return null;
            return { id: d.id, name: String(x.name), w: w, h: h, createdAt: x.createdAt || x.updatedAt || '', updatedAt: x.updatedAt || '', updatedBy: x.updatedBy || null };
          }).filter(function (x) { return x && !/^_cloudcheck_/.test(x.id); });
        });
      },
      put: function (sh) { var x = stripSheet(sh); return f.setDoc(f.doc(db, 'companies', u.companyId, 'estimatorSheets', x.id), { name: x.name, w: x.w, h: x.h, createdAt: String(x.createdAt || ''), updatedAt: String(x.updatedAt || ''), updatedBy: x.updatedBy || '' }); },
      remove: function (id) { return f.deleteDoc(f.doc(db, 'companies', u.companyId, 'estimatorSheets', id)); }
    };
  }
  // Real-account check for testing: who is signed in, which company, and a write/read/delete round trip on a throw-away document.
  function cloudCheck() {
    var u = user(), f = fsFns(), out = [];
    out.push('Signed in: ' + (u && u.uid ? 'yes' : 'no') + (u && u.role ? ' (role: ' + u.role + ')' : ''));
    out.push('Company: ' + (u && u.companyId ? u.companyId : 'none'));
    if (window.fiqCustomSheetsBackend) { out.push('Test backend in use (not the real cloud).'); return Promise.resolve(out.join('\n')); }
    if (window.fiqBetaGuard && !window.fiqBetaGuard.sheetsCloud()) return Promise.resolve(out.concat('Cloud saving is switched OFF on this Beta computer. Turn it on first (button above), then test again.').join('\n'));
    if (!u || !u.uid || !u.companyId || !f) return Promise.resolve(out.concat('Cannot test: sign in with a company account first.').join('\n'));
    var ref = f.doc(window.fiqFirestore, 'companies', u.companyId, 'estimatorSheets', '_cloudcheck_' + u.uid.slice(0, 8));
    return f.setDoc(ref, { name: '_cloud check (safe to ignore)', w: 1, h: 1, createdAt: '', updatedAt: new Date().toISOString(), updatedBy: u.uid })
      .then(function () { out.push('Write: OK'); return f.getDoc(ref); })
      .then(function (snap) { out.push('Read: ' + (snap && snap.exists() ? 'OK' : 'FAILED (missing)')); return f.deleteDoc(ref); })
      .then(function () { out.push('Delete: OK'); out.push('Result: the company cloud is working for your account.'); return out.join('\n'); })
      .catch(function (e) { out.push('Result: NOT working (' + ((e && (e.code || e.message)) || 'unknown') + '). If this says permission-denied, the Custom Sheets rule has not been published yet.'); return out.join('\n'); });
  }
  function sheetStatusText() {
    if (csSync.state === 'cloud') return { ok: true, text: '✓ ' + csSync.message };
    if (csSync.state === 'error') return { ok: false, text: csSync.message };
    var pending = sheets().some(function (x) { return x.synced === false; });
    if (csSync.state === 'local') return { ok: false, text: csSync.message };
    return { ok: !pending, text: pending ? 'Saving…' : 'Checking the company cloud…' };
  }
  function refreshSheetUi() {
    var o = document.getElementById('fiqxCS');
    if (o) { var a = document.activeElement; if (cs.editing === null && !(a && o.contains(a) && /INPUT|SELECT/.test(a.tagName))) renderSheetManager(); else { var st2 = document.getElementById('fiqxCSStatus'); if (st2) { var z = sheetStatusText(); st2.textContent = z.text; st2.className = z.ok ? 'fiqx-csok' : 'fiqx-cswarn'; } } }
    var sb = document.getElementById('fiqxSettingsBody'), e = currentEst();
    if (sb && e && e.draft && !(document.activeElement && sb.contains(document.activeElement))) { pageCur = C.currencyOf(e); sb.innerHTML = settingsBodyHtml(e.draft, false); }
  }
  function syncSheets() {
    var be = sheetBackend();
    if (!be) { csSync.state = 'local'; csSync.message = (window.fiqBetaGuard && !window.fiqBetaGuard.sheetsCloud()) ? 'Cloud saving is switched OFF on this Beta computer, so sheets are saved on this computer only. Turn it on below once the company rule has been checked.' : user() && user().uid ? 'The company cloud is not ready. Your sheets are saved on this computer.' : 'Saved on this computer only. Sign in to keep them in your company cloud.'; refreshSheetUi(); return Promise.resolve(); }
    if (csSync.running) { csSync.again = true; return csSync.p; }
    csSync.running = true;
    csSync.p = be.list().then(function (cloud) {
      var s = st(); if (!s) return;
      var m = C.mergeSheets(s.customSheets || [], s.customSheetsDeleted || [], cloud);
      var tasks = m.upload.map(function (sh) { return Promise.resolve().then(function () { return be.put(sh); }).then(function () { return { id: sh.id, up: true, ok: true, at: sh.updatedAt }; }, function (er) { return { id: sh.id, up: true, ok: false, err: er }; }); })
        .concat(m.remove.map(function (id) { return Promise.resolve().then(function () { return be.remove(id); }).then(function () { return { id: id, up: false, ok: true }; }, function (er) { return { id: id, up: false, ok: false, err: er }; }); }));
      return Promise.all(tasks).then(function (res) {
        var upOk = {}, rmOk = {}, failed = res.filter(function (x) { return !x.ok; });
        res.forEach(function (x) { if (x.ok) (x.up ? upOk : rmOk)[x.id] = x.at || true; });
        var cur = (s.customSheets || []).reduce(function (o, x) { o[x.id] = x; return o; }, {}); // edits made while this ran stay unsynced
        var next = m.sheets.map(function (x) { var live = cur[x.id]; if (live && live.updatedAt !== x.updatedAt && live.synced === false) return live; return upOk[x.id] && (!live || live.updatedAt === upOk[x.id]) ? Object.assign({}, x, { synced: true }) : x; });
        Object.keys(cur).forEach(function (id) { if (!next.some(function (x) { return x.id === id; }) && cur[id].synced === false) next.push(cur[id]); });
        var before = JSON.stringify([s.customSheets || [], s.customSheetsDeleted || []]);
        s.customSheets = C.sortSheets(next);
        s.customSheetsDeleted = m.tombs.filter(function (t) { return !rmOk[t.id]; }).concat((s.customSheetsDeleted || []).filter(function (t) { return !m.tombs.some(function (k) { return k.id === t.id; }) && !m.remove.indexOf && false; }));
        if (JSON.stringify([s.customSheets, s.customSheetsDeleted]) !== before) persist(true);
        if (failed.length) { csSync.state = 'error'; csSync.message = 'Some changes could not be saved to the company cloud (' + ((failed[0].err && (failed[0].err.code || failed[0].err.message)) || 'unknown') + '). They are kept on this computer and will be tried again.'; }
        else { csSync.state = 'cloud'; csSync.message = 'Saved in your company cloud'; }
      });
    }).catch(function (er) {
      csSync.state = 'error'; csSync.message = 'Could not reach the company cloud (' + ((er && (er.code || er.message)) || 'unknown') + '). Your sheets are saved on this computer and will upload later.';
    }).then(function () { csSync.running = false; refreshSheetUi(); if (csSync.again) { csSync.again = false; return syncSheets(); } });
    return csSync.p;
  }
  function addSheet(fields) { var rec = C.newSheet(fields, who()); if (!writeSheets(function (s) { s.customSheets.push(rec); })) return null; syncSheets(); return rec; }
  function updateSheet(id, fields) {
    var ok = writeSheets(function (s) { var i = s.customSheets.findIndex(function (x) { return x.id === id; }); if (i >= 0) s.customSheets[i] = C.editSheet(s.customSheets[i], fields, who()); });
    if (ok) syncSheets(); return ok;
  }
  function deleteSheet(id) {
    var ok = writeSheets(function (s) { s.customSheets = s.customSheets.filter(function (x) { return x.id !== id; }); s.customSheetsDeleted = s.customSheetsDeleted.filter(function (t) { return t.id !== id; }).concat([{ id: id, at: new Date().toISOString() }]); });
    if (ok) syncSheets(); return ok;
  }
  // Choosing a saved sheet in an estimate copies its size into that estimate's own sheet settings (nothing else changes).
  function applySavedSheet(e, itemId, sheetId) {
    var sh = sheets().find(function (x) { return x.id === sheetId; }); if (!sh || !e || !e.draft) return false;
    setCfg(e, itemId + '|w', { value: String(sh.w) }); setCfg(e, itemId + '|h', { value: String(sh.h) });
    C.syncDerived(e.draft, priceList(), packFn()); return true;
  }
  function sheetPickerHtml(id, c) {
    var list = sheets(), w = Number(c.w), h = Number(c.h), hit = list.find(function (x) { return x.w === w && x.h === h; }) || list.find(function (x) { return x.w === h && x.h === w; });
    var dis = canWrite() ? '' : ' disabled';
    return '<div class="fiqx-row fiqx-cspick"><span class="fiqx-sub">Saved sheets</span><select class="fiqx-in" data-csel="' + esc(id) + '" aria-label="Choose a saved sheet"' + dis + '>' +
      '<option value="">' + (list.length ? 'Choose a saved sheet…' : 'No saved sheets yet') + '</option>' +
      list.map(function (x) { return '<option value="' + esc(x.id) + '"' + (hit && hit.id === x.id ? ' selected' : '') + '>' + esc(x.name) + ' · ' + x.w + ' × ' + x.h + ' mm</option>'; }).join('') + '</select>' +
      '<button class="fiqx-btn" data-act="savesheet" data-id="' + esc(id) + '"' + dis + '>Save this size…</button><button class="fiqx-btn" data-act="managesheets">Manage…</button></div>';
  }
  function openSheetManager(prefill) {
    ensureStyle(); var o = overlay('fiqxCS'); o.style.zIndex = 99998; padForBanner(o);
    cs.editing = null; cs.error = '';
    cs.form = prefill && prefill.w ? { name: '', w: String(prefill.w), h: String(prefill.h) } : { name: '', w: '', h: '' };
    renderSheetManager(); syncSheets();
    if (prefill && prefill.w) { var n = o.querySelector('[data-csin="name"]'); if (n) n.focus(); }
  }
  function renderSheetManager() {
    var o = document.getElementById('fiqxCS'); if (!o) return;
    var list = sheets(), can = canWrite(), dis = can ? '' : ' disabled', z = sheetStatusText();
    var rows = list.map(function (x) {
      if (cs.editing === x.id) return '<tr><td><input class="fiqx-in wide" value="' + esc(cs.edit.name) + '" data-csedit="name" aria-label="Sheet name"></td><td><input class="fiqx-in num" inputmode="numeric" value="' + esc(cs.edit.w) + '" data-csedit="w" aria-label="Length mm"></td><td><input class="fiqx-in num" inputmode="numeric" value="' + esc(cs.edit.h) + '" data-csedit="h" aria-label="Width mm"></td>' +
        '<td><button class="fiqx-btn fiqx-pri" data-csact="save" data-id="' + esc(x.id) + '">Save</button> <button class="fiqx-btn" data-csact="cancel">Cancel</button></td></tr>';
      return '<tr data-sheet-row="' + esc(x.id) + '"><td><strong>' + esc(x.name) + '</strong>' + (x.synced === false ? ' <span class="fiqx-sub">(not in the cloud yet)</span>' : '') + '</td><td>' + x.w + '</td><td>' + x.h + '</td>' +
        '<td><button class="fiqx-btn" data-csact="edit" data-id="' + esc(x.id) + '"' + dis + '>Edit</button> <button class="fiqx-btn" data-csact="delete" data-id="' + esc(x.id) + '"' + dis + '>Delete</button></td></tr>';
    }).join('');
    o.innerHTML = '<div class="fiqx-win"><div class="fiqx-top"><h2>Custom Sheets</h2><span class="fiqx-sub">Your own sheet sizes. Choose one in any estimate instead of typing the size again.</span><span class="fiqx-sp"></span><button class="fiqx-btn" data-csact="close">Close</button></div>' +
      '<div class="fiqx-body single"><div>' +
      '<div class="fiqx-card"><div id="fiqxCSStatus" class="' + (z.ok ? 'fiqx-csok' : 'fiqx-cswarn') + '">' + esc(z.text) + '</div><div class="fiqx-row" style="margin-top:8px"><button class="fiqx-btn" data-csact="check">Test company cloud</button>' + (window.fiqBetaGuard ? '<button class="fiqx-btn" data-csact="betacloud">' + (window.fiqBetaGuard.sheetsCloud() ? 'Turn cloud saving OFF (this Beta computer)' : 'Turn cloud saving ON (this Beta computer)') + '</button>' : '') + '</div><pre id="fiqxCSCheck" class="fiqx-sub" style="white-space:pre-wrap;margin:8px 0 0"></pre>' + (can ? '' : '<div class="fiqx-sub">This Studio window is read-only, so sheets cannot be changed here.</div>') + '</div>' +
      '<div class="fiqx-card"><h3>Saved sheets</h3>' + (list.length ? '<table class="fiqx-t" id="fiqxCSTable"><thead><tr><th>Name</th><th>Length mm</th><th>Width mm</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>' : '<p class="fiqx-sub">No saved sheets yet. Add your first one below, for example Standard Melamine 2800 × 2070.</p>') +
      (cs.editing !== null && cs.error ? '<div class="fiqx-cserr">' + esc(cs.error) + '</div>' : '') + '</div>' +
      '<div class="fiqx-card"><h3>Add a sheet</h3><div class="fiqx-csform">' +
      field('Name', '<input class="fiqx-in" value="' + esc(cs.form.name) + '" placeholder="e.g. Standard Melamine" data-csin="name"' + dis + '>') +
      field('Length mm', '<input class="fiqx-in num" inputmode="numeric" value="' + esc(cs.form.w) + '" placeholder="2800" data-csin="w"' + dis + '>') +
      field('Width mm', '<input class="fiqx-in num" inputmode="numeric" value="' + esc(cs.form.h) + '" placeholder="2070" data-csin="h"' + dis + '>') +
      '<button class="fiqx-btn fiqx-pri" data-csact="add"' + dis + '>Save sheet</button></div>' +
      (cs.editing === null && cs.error ? '<div class="fiqx-cserr">' + esc(cs.error) + '</div>' : '') + '</div></div></div></div>';
  }
  document.addEventListener('input', function (ev) {
    var t = ev.target; if (!t.closest || !t.closest('#fiqxCS')) return;
    var a = t.getAttribute('data-csin'), b = t.getAttribute('data-csedit');
    if (a) cs.form[a] = t.value; else if (b) cs.edit[b] = t.value;
  }, true);
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Enter') return; var t = ev.target; if (!t.closest || !t.closest('#fiqxCS')) return;
    var btn = t.getAttribute && t.getAttribute('data-csin') ? document.querySelector('#fiqxCS [data-csact="add"]') : (t.getAttribute && t.getAttribute('data-csedit') ? document.querySelector('#fiqxCS [data-csact="save"]') : null);
    if (btn) { ev.preventDefault(); btn.click(); }
  }, true);
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('#fiqxCS [data-csact]'); if (!b) return; ev.preventDefault();
    var act = b.getAttribute('data-csact'), id = b.getAttribute('data-id');
    if (act === 'close') { var o = document.getElementById('fiqxCS'); if (o) o.remove(); try { document.dispatchEvent(new Event('fiq-sheets-changed')); } catch (x) {} var pl = document.getElementById('fiqxPL'); if (pl) renderPriceList(); else if (view) render(); return; }
    if (act === 'betacloud' && window.fiqBetaGuard) {
      var on = !window.fiqBetaGuard.sheetsCloud();
      if (on && !confirm('Turn ON cloud saving for Custom Sheets on this Beta computer?\n\nThis writes to your real company data (only the Custom Sheets list). Only do this after the Firestore rule has been checked. Use sheet names starting with TEST.')) return;
      window.fiqBetaGuard.setSheetsCloud(on); csSync.state = 'idle'; renderSheetManager(); return syncSheets();
    }
    if (act === 'check') { var pre = document.getElementById('fiqxCSCheck'); if (pre) pre.textContent = 'Testing…'; return cloudCheck().then(function (t) { var q = document.getElementById('fiqxCSCheck'); if (q) q.textContent = t; }); }
    if (!canWrite()) return;
    if (act === 'add') {
      var v = C.validateSheet(cs.form, sheets()); if (!v.ok) { cs.error = v.problems.join(' '); return renderSheetManager(); }
      addSheet(v.sheet); cs.form = { name: '', w: '', h: '' }; cs.error = ''; return renderSheetManager();
    }
    if (act === 'edit') { var x = sheets().find(function (y) { return y.id === id; }); if (!x) return; cs.editing = id; cs.error = ''; cs.edit = { name: x.name, w: String(x.w), h: String(x.h) }; return renderSheetManager(); }
    if (act === 'cancel') { cs.editing = null; cs.error = ''; return renderSheetManager(); }
    if (act === 'save') {
      var v2 = C.validateSheet(cs.edit, sheets().filter(function (y) { return y.id !== id; })); if (!v2.ok) { cs.error = v2.problems.join(' '); return renderSheetManager(); }
      updateSheet(id, v2.sheet); cs.editing = null; cs.error = ''; return renderSheetManager();
    }
    if (act === 'delete') {
      var d = sheets().find(function (y) { return y.id === id; }); if (!d) return;
      if (!confirm('Delete the saved sheet "' + d.name + '" (' + d.w + ' × ' + d.h + ' mm)?\n\nEstimates that already used this size keep it.')) return;
      deleteSheet(id); cs.editing = null; return renderSheetManager();
    }
  });
  window.fiqOpenCustomSheets = openSheetManager;
  window.fiqCustomSheets = { list: sheets, sync: syncSheets, status: function () { return { state: csSync.state, message: csSync.message }; } };
  function sheetsCss() {
    return '.fiqx-cspick{margin:0 0 10px;gap:8px;flex-wrap:wrap;align-items:center}.fiqx-cspick .fiqx-in{min-width:220px;max-width:100%}' +
      '.fiqx-cur{display:inline-flex;gap:6px;align-items:center}.fiqx-csform{display:grid;grid-template-columns:minmax(160px,2fr) 1fr 1fr auto;gap:10px;align-items:end}' +
      '.fiqx-csok{color:#0b4a24;font-weight:800}.fiqx-cswarn{color:#7a4b00;font-weight:800}.fiqx-cserr{color:#8e0f1a;font-weight:800;margin-top:10px}' +
      '@media(max-width:700px){.fiqx-csform{grid-template-columns:1fr 1fr}.fiqx-csform .fiqx-pri{grid-column:1 / -1}}';
  }

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
    if (el.hasAttribute('data-fiqx-from-studio') || el.hasAttribute('data-fiqx-job-est')) return; // these buttons have their own handlers
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
  // Opens the Estimator for one job: a first estimate copies the job panels in; otherwise the newest estimate that
  // already holds Studio panels opens; otherwise the list of estimates. Used by the Drawing button and every job card.
  function openForJob(pid) {
    if (!pid || !jobById(pid)) { alert('Open or choose a job first.'); return; }
    ensureStyle(); loadAdmins();
    var list = jobEstimates(pid);
    if (!list.length) { var n = newEstimateFor(pid, true); if (n) { view = { projectId: pid, mode: 'edit', estId: n.id }; render(); } return; }
    var linked = list.filter(function (x) { return !!sourceVersion(x); }).sort(function (a, b) { return String(b.createdAt).localeCompare(String(a.createdAt)); })[0];
    if (linked) return openEstimator(pid, linked.id);
    openEstimator(pid);
  }
  function openFromStudio() { openForJob(currentJobId()); }
  // The Estimator button lives on every job card, not only on a brand new site job: Job Overview cards, and each job
  // in the customer card (Jobs tab and Site Measurements tab). Added to the screen, never into the job itself.
  function jobEstBtn(pid, extraClass) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'fiqx-job-est-btn' + (extraClass ? ' ' + extraClass : '');
    b.setAttribute('data-fiqx-job-est', pid); b.textContent = '🧮 Estimator'; b.title = 'Open the Estimator for this job. The panels come with it; nothing in the design changes.'; return b;
  }
  function decorateJobCards() {
    document.querySelectorAll('.job-overview-row[data-open-job-card]').forEach(function (row) {
      var box = row.querySelector('.jor-top-actions'); if (!box || box.querySelector('.fiqx-job-est-btn')) return;
      box.insertBefore(jobEstBtn(row.getAttribute('data-open-job-card')), box.firstChild);
    });
    document.querySelectorAll('.customer-job-head').forEach(function (head) {
      var box = head.querySelector('.customer-job-sheet-btns'), src = head.querySelector('[data-job-sheet]'); if (!box || !src || box.querySelector('.fiqx-job-est-btn')) return;
      box.insertBefore(jobEstBtn(src.getAttribute('data-job-sheet')), box.firstChild);
    });
    document.querySelectorAll('.customer-tab-panel[data-tab-panel="site"]').forEach(function (panel) {
      var seen = {}; panel.querySelectorAll('.customer-job-head').forEach(function (h) { var b = h.querySelector('[data-fiqx-job-est]'); if (b) seen[b.getAttribute('data-fiqx-job-est')] = true; });
      panel.querySelectorAll('[data-open-site-room-project]').forEach(function (rowBtn) {
        var pid = rowBtn.getAttribute('data-open-site-room-project'); if (!pid || seen[pid]) return; seen[pid] = true;
        var j = jobById(pid), head = document.createElement('div'); head.className = 'customer-job-head';
        var nm = document.createElement('span'); nm.textContent = (j && (j.name || j.customer)) || 'Job'; head.appendChild(nm);
        var wrap = document.createElement('span'); wrap.className = 'customer-job-sheet-btns'; wrap.appendChild(jobEstBtn(pid)); head.appendChild(wrap);
        rowBtn.parentNode.insertBefore(head, rowBtn);
      });
    });
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-fiqx-job-est]'); if (!b) return;
    ev.preventDefault(); ev.stopImmediatePropagation(); openForJob(b.getAttribute('data-fiqx-job-est'));
  }, true);
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
  new MutationObserver(function (muts) { for (var i = 0; i < muts.length; i++) if (muts[i].addedNodes.length) { decorateCards(); decorateJobCards(); addHeaderButton(); queueStudioButton(); break; } }).observe(document.documentElement, { childList: true, subtree: true });
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
        return '<button type="button" class="fiqx-clrow" data-fiqx-open-est="' + esc(e.id) + '"><span><strong>' + esc(e.name) + '</strong> ' + statusChip(e) + '</span><span class="fiqx-sub">' + (last ? 'V' + last.n + ' · ' + money(C.suggestedOf(e), C.currencyOf(e, last)) : 'draft') + '</span></button>';
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
