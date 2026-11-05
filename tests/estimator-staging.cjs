// Estimator on the Staging copy (spec v1.1 section 16: T1, T7, T8, T10, T11, T12 plus the flow).
// Air-gapped: every request off this computer is aborted. Real Studio code, throwaway profile.
const { chromium } = require('playwright');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const BASE_DIR = process.env.FIQ_EST_DIR || 'staging';          // staging | beta | . (production)
const PAGE = BASE_DIR === '.' ? '/Studio.html' : '/' + BASE_DIR + '/Studio.html';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.css': 'text/css', '.svg': 'image/svg+xml' };
const canon = v => Array.isArray(v) ? '[' + v.map(canon).join(',') + ']' : (v && typeof v === 'object') ? '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}' : JSON.stringify(v === undefined ? null : v);

(async () => {
  const server = http.createServer((req, res) => { const u = decodeURIComponent(req.url.split('?')[0]); if (!u.startsWith('/assembleone/')) { res.statusCode = 404; return res.end(); } const f = path.join(root, u.slice('/assembleone/'.length)); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end(); } res.setHeader('Content-Type', types[path.extname(f)] || 'application/octet-stream'); res.end(fs.readFileSync(f)); });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port + '/assembleone';
  const browser = await chromium.launch(); const ctx = await browser.newContext();
  const escaped = []; await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  ctx.on('requestfinished', rq => { const u = rq.url(); if (!/^(http:\/\/127\.0\.0\.1|data:|blob:)/.test(u)) escaped.push(u); });
  const errors = [];
  async function open() {
    const p = await ctx.newPage(); p.setDefaultTimeout(20000); p.on('pageerror', e => errors.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto(base + PAGE);
    await p.waitForFunction(() => document.readyState === 'complete' && typeof save === 'function' && window.fiqEditor && window.fiqEditor.role === 'editor' && typeof window.fiqOpenEstimator === 'function', null, { timeout: 60000 });
    await p.addStyleTag({ content: '#fiqAuthGate{display:none!important}' }); // nobody can sign in with the network blocked
    await p.waitForTimeout(1500); return p;
  }
  // ---- Seed a realistic job: production panels, ordered marks, an estimate-stage unit, site rooms, Shopping List prices.
  let page = await open();
  await page.evaluate(() => {
    const s = (0, eval)('state');
    s.customers.push({ id: 'cust1', name: 'Smith Family' });
    const part = (id, l, w, x, y) => ({ id, name: 'Panel ' + id, length: l, width: w, thickness: 18, qty: 1, material: 'White melamine', edging: 'L1', x, y });
    s.projects.push({ id: 'job1', name: 'Bedroom wardrobe', customer: 'Smith Family', customerId: 'cust1', isNewFromSite: true, jobLog: [],
      rooms: [{ id: 'r1', name: 'Bedroom', siteMeasurements: [{ id: 'm1', kind: 'Wall to wall', name: 'Wall to wall', value: '2412' }] }],
      cabinets: [{ id: 'u1', name: 'Wardrobe 1', roomId: 'r1', stage: 'final', parts: [part('p1', 2380, 580, 10, 10), part('p2', 2380, 580, 90, 10)] },
                 { id: 'u2', name: 'Wardrobe 2', roomId: 'r1', stage: 'estimate', parts: [part('p3', 2000, 560, 20, 20)] }],
      orderedPanels: { p1: { sig: 's1', at: 1761000000000 } } });
    localStorage.setItem('fiq_supplier_prices_v1', JSON.stringify({ 'sheet|white melamine|18|2800x2070': '45.00', 'edge|white melamine|18': '0.80', 'hw|soft-close hinge': '2.40' }));
    save();
  });
  await page.close(); page = await open();
  
  const r = {};
  console.error('STEP T11');
  // ---- T11: Sheet count wording on the production Panel Check card (render it for the job).
  r.sheetCountLabel = await page.evaluate(async () => {
    try { switchToProject('job1', 'u1'); renderAll(); show('parts'); } catch (e) {}
    await new Promise(x => setTimeout(x, 800));
    const t = [...document.querySelectorAll('.est-mat-title')].map(e => e.textContent.trim());
    return t;
  });
  assert.ok(r.sheetCountLabel.some(t => /Sheet count/.test(t)), 'card says Sheet count: ' + JSON.stringify(r.sheetCountLabel));
  assert.ok(!r.sheetCountLabel.some(t => /Estimated Sheets/.test(t)), 'old wording gone');

  console.error('STEP Entry point');
  // ---- Entry point: Estimate button on the New Job card.
  r.cardButton = await page.evaluate(async () => { if (typeof window.openNewProjectLanding === 'function') window.openNewProjectLanding(); await new Promise(x => setTimeout(x, 600)); return !!document.querySelector('.incoming-project-select-row [data-fiqx-estimate="job1"]'); });
  assert.ok(r.cardButton, 'Estimate button appears on the New Job card');
  // Studio's own effects of opening the job and New Project are now included in 'before'.
  await page.evaluate(() => save());
  const before = await page.evaluate(() => { const s = (0, eval)('state'); const ls = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); ls[k] = localStorage.getItem(k); } return { projects: JSON.parse(JSON.stringify(s.projects)), customers: JSON.parse(JSON.stringify(s.customers)), ls }; });
  await page.click('[data-fiqx-estimate="job1"]');
  await page.waitForSelector('#fiqxEst');
  r.chooserShown = await page.isVisible('#fiqxEst [data-act="new"]');

  console.error('STEP Price list');
  // ---- Price list: defaults blank tax / 0 markup (T12), import from Shopping List without changing it (T8, T10).
  await page.click('#fiqxEst [data-act="pricelist"]'); await page.waitForSelector('#fiqxPL');
  r.defaults = await page.evaluate(() => ({ tax: document.querySelector('[data-pld="taxRate"]').value, label: document.querySelector('[data-pld="taxLabel"]').value, markup: document.querySelector('[data-pld="markupPct"]').value }));
  assert.deepEqual(r.defaults, { tax: '', label: '', markup: '0' });
  await page.click('#fiqxPL [data-plact="import"]');
  r.priceItems = await page.evaluate(() => (0, eval)('state').priceList.items.map(i => [i.category, i.name, i.unit, i.cost]));
  assert.equal(r.priceItems.length, 3);
  // Add a lighting item by hand, as an owner would.
  await page.click('#fiqxPL [data-plact="add"]');
  const newId = await page.evaluate(() => { const it = (0, eval)('state').priceList.items.slice(-1)[0]; return it.id; });
  await page.selectOption(`[data-pl="${newId}|category"]`, 'lighting');
  await page.fill(`[data-pl="${newId}|name"]`, 'LED strip'); await page.selectOption(`[data-pl="${newId}|unit"]`, 'metre'); await page.fill(`[data-pl="${newId}|cost"]`, '12.50');
  await page.click('#fiqxPL [data-plact="close"]');

  console.error('STEP New estimate');
  // ---- New estimate: rough panels, a price-list item, markup, labour, other cost, tax.
  await page.click('#fiqxEst [data-act="new"]'); await page.waitForSelector('#fiqxSummary');
  const sec = await page.evaluate(() => (0, eval)('state').estimates[0].draft.sections[0].id);
  await page.click(`#fiqxEst [data-act="add"][data-type="panel"][data-sec="${sec}"]`);
  let ln = await page.evaluate(() => (0, eval)('state').estimates[0].draft.sections[0].lines.slice(-1)[0].id);
  await page.fill(`[data-b="${sec}|${ln}|name"]`, 'Sides'); await page.fill(`[data-b="${sec}|${ln}|lengthCm"]`, '240'); await page.fill(`[data-b="${sec}|${ln}|widthCm"]`, '60'); await page.fill(`[data-b="${sec}|${ln}|qty"]`, '4');
  const sheetItem = await page.evaluate(() => (0, eval)('state').priceList.items.find(i => i.category === 'sheet').id);
  const edgeItem = await page.evaluate(() => (0, eval)('state').priceList.items.find(i => i.category === 'edging').id);
  await page.selectOption(`[data-s="${sec}|${ln}|itemId"]`, sheetItem);
  await page.selectOption(`[data-s="${sec}|${ln}|edges"]`, 'long');
  await page.selectOption(`[data-s="${sec}|${ln}|edgeItemId"]`, edgeItem);
  await page.click(`#fiqxEst [data-act="add"][data-type="item"][data-sec="${sec}"]`);
  ln = await page.evaluate(() => (0, eval)('state').estimates[0].draft.sections[0].lines.slice(-1)[0].id);
  await page.selectOption(`[data-s="${sec}|${ln}|itemId"]`, newId); await page.fill(`[data-b="${sec}|${ln}|qty"]`, '6');
  await page.click('#fiqxEst [data-act="mkset"][data-v="30"]');
  await page.fill('[data-ib="labourDays"]', '5'); await page.fill('[data-ib="dayRate"]', '400');
  await page.click('#fiqxEst [data-act="addother"]'); await page.fill('[data-ob="0|label"]', 'Delivery'); await page.fill('[data-ob="0|amount"]', '40');
  r.taxBlank = await page.evaluate(() => ({ disabled: document.querySelector('[data-act="savev"]').disabled, text: /Tax rate not set|Enter a tax rate/.test(document.getElementById('fiqxSummary').textContent) }));
  assert.deepEqual(r.taxBlank, { disabled: true, text: true }, 'blank tax blocks saving');
  await page.fill('[data-ib="taxRate"]', '21'); await page.fill('[data-ib="taxLabel"]', 'IVA');
  r.derived = await page.evaluate(() => (0, eval)('state').estimates[0].draft.derived);
  const sheets = r.derived.sheets[sheetItem].count;
  assert.ok(sheets >= 2, 'packer counted whole sheets: ' + sheets);
  assert.equal(r.derived.edging[edgeItem].metres, 19.2);
  await page.click('#fiqxEst [data-act="savev"]');
  await page.waitForSelector('#fiqxEst [data-act="editnew"]');
  r.saved = await page.evaluate(() => { const e = (0, eval)('state').estimates[0]; return { status: e.status, n: e.versions.length, results: e.versions[0].results, recomputed: window.FiqEstimatorCore.compute(e.versions[0]) }; });
  const mat = Math.round((45 * sheets + 0.8 * 19.2 + 12.5 * 6) * 100) / 100;
  assert.equal(r.saved.status, 'saved'); assert.equal(r.saved.results.materialCost, mat);
  assert.equal(r.saved.results.markupAmount, Math.round(mat * 30) / 100);
  assert.equal(r.saved.results.labourCharged, 2000); assert.equal(r.saved.results.taxLabel, 'IVA');
  assert.deepEqual(r.saved.recomputed, r.saved.results, 'stored results recalculate exactly');

  console.error('STEP Snapshot');
  // ---- Snapshot: raise a list price; the saved version does not change.
  await page.evaluate(() => { const s = (0, eval)('state'); s.priceList.items.find(i => i.category === 'lighting').cost = 99; save(); });
  r.afterPriceChange = await page.evaluate(() => (0, eval)('state').estimates[0].versions[0].results.materialCost);
  assert.equal(r.afterPriceChange, mat);
  await page.click('#fiqxEst [data-act="won"]');
  await page.click('#fiqxEst [data-act="close"]');
  await page.waitForTimeout(1500);

  console.error('STEP Reload');
  // ---- Reload: estimates persist; Customer Library Estimate tab shows them above the unchanged estimate-stage rows.
  await page.close(); page = await open();
  r.persisted = await page.evaluate(() => { const e = (0, eval)('state').estimates; return { count: e.length, status: e[0].status }; });
  console.error('persisted', JSON.stringify(r.persisted));
  assert.deepEqual(r.persisted, { count: 1, status: 'won' });
  r.docsTab = await page.evaluate(() => { const h = window.fiqCustomerDocumentsHtml((0, eval)('state').projects); return { cost: h.includes('Cost estimates') && h.includes('Estimate 1'), stage: h.includes('Designs in estimate stage'), legacyRow: h.includes('data-open-estimate-live') }; });
  console.error('docsTab', JSON.stringify(r.docsTab));
  assert.deepEqual(r.docsTab, { cost: true, stage: true, legacyRow: true });

  console.error('STEP header');
  // ---- Header "Estimator" button -> job picker -> the real Estimator (never the Cutting List).
  r.header = await page.evaluate(async () => {
    const b = document.getElementById('fiqxHeaderEstimator'); if (!b) return { button: false };
    const cutBefore = document.querySelector('.est-mat-title') ? 1 : 0;
    b.click(); await new Promise(x => setTimeout(x, 300));
    const picker = !!document.querySelector('#fiqxEst [data-act="pickjob"][data-id="job1"]');
    document.querySelector('#fiqxEst [data-act="pickjob"][data-id="job1"]').click(); await new Promise(x => setTimeout(x, 300));
    const chooser = !!document.querySelector('#fiqxEst [data-act="open"]');
    window.fiqCloseEstimator();
    // A stray button labelled "Estimator" (as in local builds) must open the Estimator too.
    const stray = document.createElement('button'); stray.textContent = 'Estimator'; stray.onclick = () => { window.__oldRoute = true; try { show('parts'); } catch (e) {} };
    document.body.appendChild(stray); stray.click(); await new Promise(x => setTimeout(x, 300));
    const strayOpened = !!document.querySelector('#fiqxEst [data-act="pickjob"]'); window.fiqCloseEstimator(); stray.remove();
    return { button: true, label: b.textContent, picker, chooser, strayOpened, oldRouteRan: !!window.__oldRoute };
  });
  assert.deepEqual(r.header, { button: true, label: '🧮 Estimator', picker: true, chooser: true, strayOpened: true, oldRouteRan: false });

  console.error('STEP permissions');
  // ---- Price list permissions: owner edits; other signed-in member views only; listed administrator edits.
  r.perms = await page.evaluate(async () => {
    const saved = window.fittersiqUser, out = {};
    const check = async (u) => { window.fittersiqUser = u; window.fiqOpenPriceList(); await new Promise(x => setTimeout(x, 300));
      const o = document.getElementById('fiqxPL'); const res = { canAdd: !!o.querySelector('[data-plact="add"]'), viewOnly: /View only/.test(o.textContent), inputsDisabled: !!o.querySelector('[data-pl][disabled]') };
      o.querySelector('[data-plact="close"]').click(); window.fiqCloseEstimator(); return res; };
    out.owner = await check({ uid: 'o1', role: 'company_owner', companyId: 'c1' });
    out.fitter = await check({ uid: 'f1', role: 'fitter', companyId: 'c1' });
    window.fittersiqUser = saved; return out;
  });
  assert.deepEqual(r.perms.owner, { canAdd: true, viewOnly: false, inputsDisabled: false });
  assert.deepEqual(r.perms.fitter, { canAdd: false, viewOnly: true, inputsDisabled: true });

  console.error('STEP T1, T7');
  // ---- T1, T7, T10: production data untouched; no estimate data inside any job; Shopping List prices identical.
  const after = await page.evaluate(() => { const s = (0, eval)('state'); const ls = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); ls[k] = localStorage.getItem(k); } return { projects: JSON.parse(JSON.stringify(s.projects)), customers: JSON.parse(JSON.stringify(s.customers)), ls, estIds: s.estimates.map(e => e.id) }; });
  // Studio itself updates screen-state fields when a job is opened (switchToProject); compare everything else.
  const strip = ps => ps.map(p => { const c = JSON.parse(JSON.stringify(p)); ['activeCabinetId', 'lastOpenedAt', 'updatedAt', 'isNewFromSite', 'lastViewedAt'].forEach(k => delete c[k]); return c; });
  r.T1_jobsUnchanged = canon(strip(after.projects)) === canon(strip(before.projects));
  r.T1_panels = canon(after.projects.map(p => p.cabinets.map(c => [c.id, c.stage, c.parts]))) === canon(before.projects.map(p => p.cabinets.map(c => [c.id, c.stage, c.parts])));
  r.T1_ordered = canon(after.projects.map(p => p.orderedPanels)) === canon(before.projects.map(p => p.orderedPanels));
  r.T1_customers = canon(after.customers) === canon(before.customers);
  r.T7_noEstimateInJobs = !after.estIds.some(id => JSON.stringify(after.projects).includes(id)) && !/"(priceList|estimates)"/.test(JSON.stringify(after.projects));
  r.T10_shoppingPrices = after.ls['fiq_supplier_prices_v1'] === before.ls['fiq_supplier_prices_v1'];
  r.T10_sheetSettings = after.ls['assembleone_sheet_settings'] === before.ls['assembleone_sheet_settings'];
  r.changedStorageKeys = Object.keys(after.ls).filter(k => after.ls[k] !== before.ls[k]);
  r.diffJobFields = (() => { const out = []; after.projects.forEach((p, i) => Object.keys({ ...p, ...before.projects[i] }).forEach(k => { if (canon(p[k]) !== canon(before.projects[i][k])) out.push(p.id + '.' + k); })); return out; })();
  for (const k of ['T1_panels', 'T1_ordered', 'T1_customers', 'T7_noEstimateInJobs', 'T10_shoppingPrices']) assert.ok(r[k], k);
  assert.ok(r.T1_jobsUnchanged, 'jobs unchanged apart from screen-state fields: ' + r.diffJobFields.join(', '));
  r.network = { escaped: escaped.length }; assert.equal(escaped.length, 0);
  r.pageErrors = errors;
  console.log(JSON.stringify(r, null, 1));
  await browser.close(); server.close();
})().catch(e => { console.error(String(e && e.message || e).split('\n')[0]); process.exitCode = 1; }).finally(() => setTimeout(() => process.exit(), 500));
