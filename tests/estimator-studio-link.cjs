// Studio <-> Estimator link (Beta): Estimator button, panel snapshot import, sheet settings, cuts,
// edging, price-list matching, update notices. Air-gapped, real Studio code, throwaway profile.
// Run: FIQ_EST_DIR=beta node tests/estimator-studio-link.cjs   (needs Playwright)
const { chromium } = require('playwright');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const BASE_DIR = process.env.FIQ_EST_DIR || 'beta';
const PAGE = BASE_DIR === '.' ? '/Studio.html' : '/' + BASE_DIR + '/Studio.html';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.css': 'text/css', '.svg': 'image/svg+xml' };
const canon = v => Array.isArray(v) ? '[' + v.map(canon).join(',') + ']' : (v && typeof v === 'object') ? '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}' : JSON.stringify(v);
const SCREEN_KEYS = ['activeCabinetId', 'lastOpenedAt', 'updatedAt', 'isNewFromSite', 'lastViewedAt'];

(async () => {
  const server = http.createServer((req, res) => { const u = decodeURIComponent(req.url.split('?')[0]); if (!u.startsWith('/assembleone/')) { res.statusCode = 404; return res.end(); } const f = path.join(root, u.slice('/assembleone/'.length)); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end(); } res.setHeader('Content-Type', types[path.extname(f)] || 'application/octet-stream'); res.end(fs.readFileSync(f)); });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port + '/assembleone';
  const browser = await chromium.launch(); const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const escaped = []; await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  ctx.on('requestfinished', rq => { const u = rq.url(); if (!/^(http:\/\/127\.0\.0\.1|data:|blob:)/.test(u)) escaped.push(u); });
  const errors = [];
  async function open() {
    const p = await ctx.newPage(); p.setDefaultTimeout(20000); p.on('pageerror', e => errors.push(e.message)); p.on('dialog', d => d.accept());
    await p.goto(base + PAGE);
    await p.waitForFunction(() => document.readyState === 'complete' && typeof save === 'function' && window.fiqEditor && window.fiqEditor.role === 'editor' && typeof window.fiqOpenEstimator === 'function', null, { timeout: 60000 });
    await p.addStyleTag({ content: '#fiqAuthGate{display:none!important}' }); await p.evaluate(() => document.body.classList.remove('fiq-locked')); // nobody can sign in with the network blocked
    await p.waitForTimeout(1500); return p;
  }
  const jobsSnapshot = page => page.evaluate(() => { const s = (0, eval)('state'); return JSON.parse(JSON.stringify({ projects: s.projects, customers: s.customers })); });
  const strip = ps => ps.map(p => { const c = JSON.parse(JSON.stringify(p)); SCREEN_KEYS.forEach(k => delete c[k]); return c; });
  const diffJobs = (a, b) => { const out = []; strip(a.projects).forEach((p, i) => { const q = strip(b.projects)[i] || {}; Object.keys({ ...p, ...q }).forEach(k => { if (canon(p[k]) !== canon(q[k])) out.push(p.id + '.' + k + ': ' + String(canon(q[k])).slice(0, 80) + ' -> ' + String(canon(p[k])).slice(0, 80)); }); }); return out.join(' | '); };
  const same = (a, b) => canon(strip(a.projects)) === canon(strip(b.projects)) && canon(a.customers) === canon(b.customers);
  const shot = async (name) => { if (process.env.FIQ_SHOT) await page.screenshot({ path: path.join(process.env.FIQ_SHOT, name + '.png') }); };
  const r = {};

  // ---- Seed: one customer job with TWO rooms. Kitchen = final cutting list, Bedroom = rough estimate-stage panels.
  let page = await open();
  await page.evaluate(() => {
    const s = (0, eval)('state'), C = window.FiqEstimatorCore;
    s.customers.push({ id: 'cust1', name: 'Smith Family' });
    const part = (id, code, name, l, w, th, q, mat, eL, eS) => ({ id, code, name, length: l, width: w, thickness: th, qty: q, material: mat, edgeLong: eL || 0, edgeShort: eS || 0 });
    s.projects.push({ id: 'job1', name: 'Kitchen and wardrobe', customer: 'Smith Family', customerId: 'cust1', address: '1 High St', jobLog: [],
      rooms: [{ id: 'rk', name: 'Kitchen' }, { id: 'rb', name: 'Bedroom' }],
      cabinets: [
        { id: 'k1', name: 'Kitchen run', roomId: 'rk', stage: 'final', siteReference: true, parts: [
          part('p1', 'P-001', 'Side', 720, 560, 18, 4, 'White melamine', 1, 0),
          part('p2', 'P-002', 'Shelf', 764, 540, 18, 6, 'White melamine', 1, 0),
          part('p3', 'P-003', 'Door', 716, 396, 18, 8, 'Oak veneer', 2, 2)] },
        { id: 'w1', name: 'Wardrobe 1', roomId: 'rb', stage: 'estimate', parts: [
          part('p4', 'P-001', 'Gable', 2380, 580, 18, 2, 'White melamine', 1, 0),
          part('p5', 'P-002', 'Shelf', 1100, 560, 18, 5, 'White melamine', 1, 0)] }] });
    s.projects.push({ id: 'empty1', name: 'Empty job', customer: 'Smith Family', customerId: 'cust1', rooms: [], cabinets: [] });
    s.priceList = C.normalisePriceList({ items: [
      C.makeItem({ category: 'sheet', name: 'White melamine 18 mm (2800 × 2070)', unit: 'sheet', cost: 45, sheet: { thickness: 18, w: 2800, h: 2070 } }),
      C.makeItem({ category: 'sheet', name: 'Oak veneer 18 mm (2440 × 1220)', unit: 'sheet', cost: 88, sheet: { thickness: 18, w: 2440, h: 1220 } }),
      C.makeItem({ category: 'edging', name: 'Edging White melamine', unit: 'metre', cost: 0.8 }),
      C.makeItem({ category: 'edging', name: 'Edging Oak veneer', unit: 'metre', cost: 1.9 })] });
    save();
  });
  await page.close(); page = await open();

  console.error('STEP 2 button');
  // ---- STAGE 2: Estimator button beside Site Measurements, opens the same customer and job.
  r.s2_noPanels = await page.evaluate(async () => { switchToProject('empty1'); renderAll(); show('mark'); await new Promise(x => setTimeout(x, 400)); const b = document.getElementById('fiqxStudioEstimatorBtn'); return { exists: !!b, hidden: b ? b.hidden : null }; });
  assert.equal(r.s2_noPanels.hidden, true, 'hidden while the job has no panels');
  r.s2_withPanels = await page.evaluate(async () => { switchToProject('job1', 'k1'); renderAll(); show('mark'); await new Promise(x => setTimeout(x, 500));
    const b = document.getElementById('fiqxStudioEstimatorBtn'), site = document.getElementById('drawingViewSiteMeasurementBtn');
    const rb = b.getBoundingClientRect(), rs = site.getBoundingClientRect();
    return { hidden: b.hidden, text: b.textContent.trim(), nextToSite: b.previousElementSibling === site, siteVisible: !site.hidden, visible: rb.width > 0 && rb.height > 0, overlaps: !(rb.right <= rs.left || rb.left >= rs.right || rb.bottom <= rs.top || rb.top >= rs.bottom) }; });
  assert.ok(!r.s2_withPanels.hidden && r.s2_withPanels.visible && r.s2_withPanels.nextToSite && r.s2_withPanels.siteVisible && !r.s2_withPanels.overlaps, JSON.stringify(r.s2_withPanels));
  await page.setViewportSize({ width: 800, height: 900 }); await page.waitForTimeout(300);
  r.s2_narrow = await page.evaluate(() => { const b = document.getElementById('fiqxStudioEstimatorBtn'), site = document.getElementById('drawingViewSiteMeasurementBtn'), tb = b.closest('.drawing-toolbar');
    const rb = b.getBoundingClientRect(), rs = site.getBoundingClientRect(), rt = tb.getBoundingClientRect();
    return { visible: rb.width > 0 && rb.height > 0, inside: rb.left >= rt.left - 1 && rb.right <= rt.right + 1, overlaps: !(rb.right <= rs.left || rb.left >= rs.right || rb.bottom <= rs.top || rb.top >= rs.bottom) }; });
  assert.ok(r.s2_narrow.visible && r.s2_narrow.inside && !r.s2_narrow.overlaps, 'narrow layout: ' + JSON.stringify(r.s2_narrow));
  await page.setViewportSize({ width: 1400, height: 900 });
  const beforeS2 = await jobsSnapshot(page);
  await page.click('#fiqxStudioEstimatorBtn'); await page.waitForSelector('#fiqxEst');
  r.s2_opened = await page.evaluate(() => { const o = document.getElementById('fiqxEst'); return { pickerShown: !!o.querySelector('#fiqxJobSearch'), top: o.querySelector('.fiqx-title').textContent }; });
  assert.ok(!r.s2_opened.pickerShown, 'the button must not open the job picker');
  assert.ok(/Smith Family/.test(r.s2_opened.top) && /Kitchen and wardrobe/.test(r.s2_opened.top), 'customer and job shown: ' + r.s2_opened.top);
  await page.evaluate(() => window.fiqCloseEstimator());
  assert.ok(same(await jobsSnapshot(page), beforeS2), 'Stage 2 changes nothing in the job');

  // ================= STAGE 3: copy the whole job into a separate estimate =================
  console.error('STEP 3 import');
  const baseline = await jobsSnapshot(page);                       // production data before any estimate exists
  const lsBefore = await page.evaluate(() => ({ prices: localStorage.getItem('fiq_supplier_prices_v1'), sheets: localStorage.getItem('assembleone_sheet_settings') }));
  const plBefore = await page.evaluate(() => JSON.stringify((0, eval)('state').priceList));
  await page.evaluate(async () => { switchToProject('job1', 'k1'); renderAll(); show('mark'); await new Promise(x => setTimeout(x, 400)); });
  await page.click('#fiqxStudioEstimatorBtn'); await page.waitForSelector('#fiqxMaterials');
  r.s3 = await page.evaluate(() => { const e = (0, eval)('state').estimates, est = e[0], d = est.draft;
    return { count: e.length, projectId: est.projectId, customerId: est.customerId, customer: est.customer,
      sections: d.sections.map(s => [s.name, s.roomId, s.lines.length]), source: !!d.source, sourceCount: d.source && d.source.panelCount,
      unmatched: d.sections.flatMap(s => s.lines).filter(l => !l.itemId).length, rowsOnScreen: document.querySelectorAll('#fiqxEst tbody tr').length,
      studioRows: [...document.querySelectorAll('#fiqxEst tbody tr td:first-child')].filter(t => /Studio panel/.test(t.textContent)).length,
      card: (document.getElementById('fiqxPanels') || {}).textContent || '' }; });
  assert.equal(r.s3.count, 1); assert.deepEqual([r.s3.projectId, r.s3.customerId, r.s3.customer], ['job1', 'cust1', 'Smith Family']);
  assert.deepEqual(r.s3.sections, [['Kitchen', 'rk', 3], ['Bedroom', 'rb', 2]], 'whole job, one section per room');
  assert.equal(r.s3.source, true); assert.equal(r.s3.sourceCount, 5); assert.equal(r.s3.unmatched, 0, 'every panel matched one price-list sheet');
  assert.equal(r.s3.studioRows, 0, 'panel details are folded until opened'); assert.ok(/Matches Studio/.test(r.s3.card) && /5 panels in 2 rooms/.test(r.s3.card), 'summary: ' + r.s3.card);
  await page.click('#fiqxEst [data-act="togglepanels"]');
  assert.equal(await page.evaluate(() => [...document.querySelectorAll('#fiqxEst tbody tr td:first-child')].filter(t => /Studio panel/.test(t.textContent)).length), 5, 'five Studio panels listed once opened');
  await page.click('#fiqxEst [data-act="togglepanels"]');
  assert.ok(same(await jobsSnapshot(page), baseline), 'Stage 3: the job is untouched by the copy');
  await shot('estimator-top');
  // Reload: the snapshot is saved with the estimate.
  await page.evaluate(() => window.fiqCloseEstimator()); await page.waitForTimeout(800);
  await page.close(); page = await open();
  r.s3_persist = await page.evaluate(() => { const est = (0, eval)('state').estimates[0]; return { n: (0, eval)('state').estimates.length, src: !!est.draft.source, cfgKeys: Object.keys(est.draft.sheetCfg || {}).length, srcOnLines: est.draft.sections.every(s => s.lines.every(l => l.src && l.src.srcId)) }; });
  assert.deepEqual(r.s3_persist, { n: 1, src: true, cfgKeys: 2, srcOnLines: true }, JSON.stringify(r.s3_persist));
  await page.evaluate(async () => { switchToProject('job1', 'k1'); renderAll(); show('mark'); await new Promise(x => setTimeout(x, 400)); });
  await page.click('#fiqxStudioEstimatorBtn'); await page.waitForSelector('#fiqxMaterials');
  r.s3_reopen = await page.evaluate(() => (0, eval)('state').estimates.length); assert.equal(r.s3_reopen, 1, 'pressing the button again opens the same estimate, no duplicate');

  // ================= STAGES 4 + 5: sheet sizes, quantities, cuts, edging; match Panel Check =================
  console.error('STEP 4/5 sheets');
  await page.click('#fiqxEst [data-act="togglesheets"]');
  const ids = await page.evaluate(() => { const pl = (0, eval)('state').priceList.items; const f = n => pl.find(i => i.name.indexOf(n) === 0).id; return { white: f('White melamine'), oak: f('Oak veneer 18'), eWhite: f('Edging White'), eOak: f('Edging Oak') }; });
  const pc = await page.evaluate(() => { // Panel Check's own calculation for the same job
    const job = (0, eval)('state').projects.find(p => p.id === 'job1'), parts = job.cabinets.flatMap(c => c.parts);
    return window.a181ComputeGroups(parts).map(g => ({ mat: g.materialLabel, th: g.thickness, sheets: g.sheets.length, cuts: g.sheets.reduce((n, s) => n + (s.cuts || 0), 0), cfg: { w: g.cfg.w, h: g.cfg.h, kerf: g.cfg.kerf, trim: g.cfg.trim, grain: g.cfg.grain } })); });
  const est0 = await page.evaluate(() => { const d = (0, eval)('state').estimates[0].draft; return JSON.parse(JSON.stringify({ sheets: d.derived.sheets, edging: d.derived.edging, notes: d.derived.notes })); });
  const pcWhite = pc.find(g => /white/i.test(g.mat)), pcOak = pc.find(g => /oak/i.test(g.mat));
  assert.equal(est0.sheets[ids.white].count, pcWhite.sheets, 'white melamine: same sheet count as Panel Check');
  assert.equal(est0.sheets[ids.oak].count, pcOak.sheets, 'oak veneer: same sheet count as Panel Check');
  assert.equal(est0.sheets[ids.white].cuts, pcWhite.cuts, 'same estimated cuts as Panel Check'); assert.equal(est0.sheets[ids.oak].cuts, pcOak.cuts);
  assert.deepEqual({ w: est0.sheets[ids.white].cfg.w, h: est0.sheets[ids.white].cfg.h, kerf: est0.sheets[ids.white].cfg.kerf, trim: est0.sheets[ids.white].cfg.trim, grain: est0.sheets[ids.white].cfg.grain }, pcWhite.cfg, 'starts from the Panel Check settings');
  assert.deepEqual([pcWhite.cfg.kerf, pcWhite.cfg.trim], [3, 5], 'Panel Check defaults are 3 mm saw cut and 5 mm trim');
  assert.equal(est0.notes.cuts, pcWhite.cuts + pcOak.cuts, 'total estimated cuts');
  assert.equal(est0.edging[ids.eWhite].metres, 17.8); assert.equal(est0.edging[ids.eOak].metres, 17.8, 'edging from Studio long and short edge counts');
  r.s45_screen = await page.evaluate((id) => ({ w: document.querySelector('[data-cfg="' + id + '|w"]').value, h: document.querySelector('[data-cfg="' + id + '|h"]').value, kerf: document.querySelector('[data-cfg="' + id + '|kerf"]').value, trim: document.querySelector('[data-cfg="' + id + '|trim"]').value, cuts: /About \d+ cuts/.test(document.getElementById('fiqxMaterials').textContent) }), ids.white);
  assert.deepEqual([r.s45_screen.w, r.s45_screen.h, r.s45_screen.kerf, r.s45_screen.trim, r.s45_screen.cuts], [String(pcWhite.cfg.w), String(pcWhite.cfg.h), '3', '5', true], 'sheet length and width, saw cut, trim and cuts are shown');
  // Change the sheet size inside the estimate: sheets and cost recalculate by themselves.
  await page.fill('[data-cfg="' + ids.white + '|w"]', '2440'); await page.fill('[data-cfg="' + ids.white + '|h"]', '1220');
  const afterSize = await page.evaluate((id) => { const d = (0, eval)('state').estimates[0].draft, g = d.derived.sheets[id]; return { count: g.count, cuts: g.cuts, differs: g.sizeDiffers, listW: g.listW, unitCost: g.unitCost, cfg: d.sheetCfg[id], mat: window.FiqEstimatorCore.compute(d).materialCost, warn: /differs from the price list/.test(document.getElementById('fiqxSettingsBody').textContent), summary: document.getElementById('fiqxSummary').textContent }; }, ids.white);
  assert.deepEqual([afterSize.cfg.w, afterSize.cfg.h, afterSize.differs, afterSize.warn, afterSize.unitCost], [2440, 1220, true, true, 45], 'new size kept, warning shown, price per sheet kept');
  assert.ok(afterSize.count > pcWhite.sheets, 'a smaller sheet needs more sheets: ' + afterSize.count + ' vs ' + pcWhite.sheets);
  const expectPack = await page.evaluate((id) => { const d = (0, eval)('state').estimates[0].draft, c = d.sheetCfg[id]; const pieces = []; d.sections.forEach(s => s.lines.forEach(l => { if (l.itemId === id) for (let i = 0; i < l.qty; i++) pieces.push({ w: Math.round(l.lengthCm * 10), h: Math.round(l.widthCm * 10), code: l.id, name: l.name }); }));
    const res = window.a181Pack(pieces, c.w, c.h, c.kerf, !c.grain, c.trim); return { count: res.sheets.length, cuts: res.sheets.reduce((n, s) => n + (s.cuts || 0), 0) }; }, ids.white);
  assert.deepEqual([afterSize.count, afterSize.cuts], [expectPack.count, expectPack.cuts], 'recalculated with the sheet optimiser at the new size');
  const expectMat = Math.round((afterSize.count * 45 + est0.sheets[ids.oak].count * 88 + 17.8 * 0.8 + 17.8 * 1.9) * 100) / 100;
  assert.equal(afterSize.mat, expectMat, 'material cost followed the new sheet count');
  // Price per sheet typed in this estimate only; quantity of a copied panel changed in this estimate only.
  await page.fill('[data-gb="sheets|' + ids.white + '|unitCost"]', '52');
  await page.click('#fiqxEst [data-act="togglepanels"]');
  const firstLine = await page.evaluate(() => { const l = (0, eval)('state').estimates[0].draft.sections[0].lines[0]; return { sec: (0, eval)('state').estimates[0].draft.sections[0].id, id: l.id, qty: l.qty }; });
  await page.fill('[data-b="' + firstLine.sec + '|' + firstLine.id + '|qty"]', '12');
  const mid = await page.evaluate((id) => { const s = (0, eval)('state'); return { cost: s.estimates[0].draft.derived.sheets[id].unitCost, listCost: s.priceList.items.find(i => i.id === id).cost, jobQty: s.projects.find(p => p.id === 'job1').cabinets[0].parts[0].qty, pl: JSON.stringify(s.priceList), cfgJob: JSON.stringify(s.projects.find(p => p.id === 'job1').sheetSettings || null), ls: localStorage.getItem('assembleone_sheet_settings') }; }, ids.white);
  assert.equal(mid.cost, 52); assert.equal(mid.listCost, 45, 'the company price list is not changed'); assert.equal(mid.pl, plBefore, 'price list byte-identical');
  assert.equal(mid.jobQty, 4, 'the Studio panel quantity is not changed'); assert.equal(mid.ls, lsBefore.sheets, 'Panel Check sheet settings are not changed');
  assert.ok(same(await jobsSnapshot(page), baseline), 'Stages 4-5: production data untouched');
  await shot('estimator-sheets');
  // Put the quantity back so later numbers stay simple.
  await page.fill('[data-b="' + firstLine.sec + '|' + firstLine.id + '|qty"]', '4');

  // ================= STAGE 6: costs on top of the copied materials =================
  console.error('STEP 6 costs');
  await page.fill('[data-gb="sheets|' + ids.white + '|unitCost"]', '45');
  await page.click('#fiqxEst [data-act="mkset"][data-v="30"]');
  await page.fill('[data-ib="labourDays"]', '2'); await page.fill('[data-ib="dayRate"]', '400');
  await page.click('#fiqxEst [data-act="addother"]'); await page.fill('[data-ob="0|label"]', 'Delivery'); await page.fill('[data-ob="0|amount"]', '40');
  await page.fill('[data-ib="taxRate"]', '21'); await page.fill('[data-ib="taxLabel"]', 'IVA');
  const c6 = await page.evaluate(() => { const d = (0, eval)('state').estimates[0].draft; return { r: window.FiqEstimatorCore.compute(d), w: d.derived.sheets, e: d.derived.edging }; });
  const wid = ids.white, mat6 = Math.round((c6.w[wid].count * 45 + c6.w[ids.oak].count * 88 + 17.8 * 0.8 + 17.8 * 1.9) * 100) / 100;
  const mk6 = Math.round(mat6 * 30) / 100, sub6 = Math.round((mat6 + mk6 + 800 + 40) * 100) / 100, tax6 = Math.round(sub6 * 21) / 100;
  assert.deepEqual([c6.r.materialCost, c6.r.markupAmount, c6.r.labourCharged, c6.r.otherCosts, c6.r.subtotal, c6.r.taxAmount, c6.r.suggestedTotal, c6.r.profit],
    [mat6, mk6, 800, 40, sub6, tax6, Math.round((sub6 + tax6) * 100) / 100, Math.round((mk6 + 800) * 100) / 100], 'subtotal, tax, suggested total and profit');
  assert.equal(c6.r.marginPct, Math.round((mk6 + 800) / sub6 * 1000) / 10, 'margin');
  const sumText = await page.evaluate(() => document.getElementById('fiqxSummary').textContent);
  assert.ok(/suggested customer total/i.test(sumText) && /IVA/.test(sumText));
  await page.click('#fiqxEst [data-act="savev"]'); await page.waitForSelector('#fiqxEst [data-act="won"]');
  const saved6 = await page.evaluate(() => { const e = (0, eval)('state').estimates[0]; return { n: e.versions.length, same: JSON.stringify(window.FiqEstimatorCore.compute(e.versions[0])) === JSON.stringify(e.versions[0].results), src: !!e.versions[0].source, cfg: !!e.versions[0].sheetCfg }; });
  assert.deepEqual(saved6, { n: 1, same: true, src: true, cfg: true }, 'saved version keeps results, snapshot and sheet settings');
  // Mark Won changes the estimate status only.
  await page.click('#fiqxEst [data-act="won"]');
  r.s6_won = await page.evaluate(() => { const s = (0, eval)('state'); return { status: s.estimates[0].status, stages: s.projects.find(p => p.id === 'job1').cabinets.map(c => c.stage) }; });
  assert.deepEqual(r.s6_won, { status: 'won', stages: ['final', 'estimate'] }, 'Mark Won does not alter the design');
  assert.ok(same(await jobsSnapshot(page), baseline), 'Stage 6: production data untouched');

  // ================= STAGE 7: Studio changes later; nothing is overwritten silently =================
  console.error('STEP 7 update');
  await page.evaluate(() => window.fiqCloseEstimator());
  // The user keeps working in Studio: bigger quantity, a longer gable, the door deleted, a new back panel.
  await page.evaluate(() => { const job = (0, eval)('state').projects.find(p => p.id === 'job1'); job.cabinets[0].parts.find(p => p.id === 'p1').qty = 6; job.cabinets[1].parts.find(p => p.id === 'p4').length = 2400;
    job.cabinets[0].parts = job.cabinets[0].parts.filter(p => p.id !== 'p3'); job.cabinets[1].parts.push({ id: 'p9', code: 'P-003', name: 'Back', length: 2300, width: 600, thickness: 18, qty: 1, material: 'White melamine', edgeLong: 0, edgeShort: 0 }); save(); });
  const changedJob = await jobsSnapshot(page);
  await page.click('#fiqxStudioEstimatorBtn'); await page.waitForSelector('#fiqxEst [data-act="editnew"]');
  r.s7_stale = await page.evaluate(() => ({ card: (document.getElementById('fiqxWarn') || {}).textContent || '', mode: 'version', savedLine: (0, eval)('state').estimates[0].versions[0].sections[0].lines[0].qty }));
  assert.ok(/Studio design has changed/.test(r.s7_stale.card) && /may be out of date/.test(r.s7_stale.card), 'clear out-of-date message: ' + r.s7_stale.card);
  assert.equal(r.s7_stale.savedLine, 4, 'the saved estimate was not changed by the Studio edit');
  await page.click('#fiqxEst [data-act="editnew"]'); await page.waitForSelector('#fiqxEst [data-act="studioreview"]');
  // The user also edits a copied panel inside the estimate: the Gable quantity.
  await page.click('#fiqxEst [data-act="togglepanels"]');
  const gb = await page.evaluate(() => { const s = (0, eval)('state').estimates[0].draft.sections[1]; const l = s.lines.find(x => x.src.srcId === 'p4'); return { sec: s.id, id: l.id }; });
  await page.fill('[data-b="' + gb.sec + '|' + gb.id + '|qty"]', '3');
  const draftBefore = await page.evaluate((id) => { const d = (0, eval)('state').estimates[0].draft; return JSON.stringify({ cfg: d.sheetCfg, white: [d.derived.sheets[id].unitCost, d.derived.sheets[id].override] }); }, ids.white);
  await shot('estimator-stale');
  await page.click('#fiqxEst [data-act="studioreview"]'); await page.waitForSelector('#fiqxDiff');
  await shot('estimator-review');
  r.s7_modal = await page.evaluate(() => document.getElementById('fiqxDiff').textContent);
  assert.ok(/Changed in Studio/.test(r.s7_modal) && /New in Studio/.test(r.s7_modal) && /Removed in Studio/.test(r.s7_modal) && /Not touched by an update/.test(r.s7_modal), 'the differences and what stays are explained');
  assert.ok(same(await jobsSnapshot(page), changedJob), 'reviewing changes nothing');
  assert.equal(await page.evaluate(() => (0, eval)('state').estimates[0].draft.sections[0].lines.find(l => l.src.srcId === 'p1').qty), 4, 'nothing applied before Update');
  await page.click('#fiqxDiff [data-act="studioapply"]'); await page.waitForTimeout(400);
  r.s7_after = await page.evaluate((wid) => { const d = (0, eval)('state').estimates[0].draft, all = d.sections.flatMap(s => s.lines), g = id => all.find(l => l.src && l.src.srcId === id);
    return { p1: g('p1').qty, p4qty: g('p4').qty, p4len: g('p4').lengthCm, p3: !!g('p3'), p9: !!g('p9'), cfg: JSON.stringify(d.sheetCfg), white: [d.derived.sheets[wid].unitCost, d.derived.sheets[wid].override], card: (document.getElementById('fiqxPanels') || {}).textContent || '' }; }, ids.white);
  assert.deepEqual([r.s7_after.p1, r.s7_after.p4qty, r.s7_after.p4len, r.s7_after.p3, r.s7_after.p9], [6, 3, 240, false, true], 'Studio changes applied; the quantity edited here is protected');
  assert.ok(/Matches Studio/.test(r.s7_after.card), 'up to date again');
  assert.equal(r.s7_after.cfg, JSON.stringify(JSON.parse(draftBefore).cfg), 'sheet sizes untouched by the update');
  assert.deepEqual(r.s7_after.white, JSON.parse(draftBefore).white, 'prices and sheet quantities untouched by the update');
  assert.ok(same(await jobsSnapshot(page), changedJob), 'Stage 7: the update never changes Studio');
  await page.evaluate(() => window.fiqCloseEstimator());

  // ================= STAGE 8: both orders of working =================
  console.error('STEP 8 both orders');
  // Estimate first: a job that only has a rough estimate-stage design. Cutting list first: a job with a final, reviewed list.
  await page.evaluate(() => { const s = (0, eval)('state');
    const part = (id, code, name, l, w, q, eL) => ({ id, code, name, length: l, width: w, thickness: 18, qty: q, material: 'White melamine', edgeLong: eL || 0, edgeShort: 0 });
    s.projects.push({ id: 'jobE', name: 'Estimate first', customer: 'Smith Family', customerId: 'cust1', rooms: [{ id: 're', name: 'Hall' }], cabinets: [{ id: 'ue', name: 'Hall unit', roomId: 're', stage: 'estimate', parts: [part('e1', 'P-001', 'Side', 2000, 500, 2, 1)] }] });
    s.projects.push({ id: 'jobF', name: 'Cutting list first', customer: 'Smith Family', customerId: 'cust1', rooms: [{ id: 'rf', name: 'Study' }], cabinets: [{ id: 'uf', name: 'Study unit', roomId: 'rf', stage: 'final', parts: [Object.assign(part('f1', 'P-001', 'Side', 2000, 500, 2, 1), { reviewSignature: 'x' })], orderedPanels: {} }], orderedPanels: { f1: { sig: 's', at: 1 } } });
    save(); });
  for (const [jid, unit] of [['jobE', 'ue'], ['jobF', 'uf']]) {
    await page.evaluate(async ([j, u]) => { switchToProject(j, u); renderAll(); show('mark'); await new Promise(x => setTimeout(x, 500)); save(); }, [jid, unit]);
    const pre = await jobsSnapshot(page);   // Studio has opened the job (its own tidy-up done); now only the Estimator acts
    await page.click('#fiqxStudioEstimatorBtn'); await page.waitForSelector('#fiqxMaterials');
    const got = await page.evaluate((j) => { const e = (0, eval)('state').estimates.find(x => x.projectId === j), d = e.draft; return { customer: e.customer, lines: d.sections.flatMap(s => s.lines).length, sheets: Object.values(d.derived.sheets).map(g => g.count), edge: Object.values(d.derived.edging).map(g => g.metres) }; }, jid);
    assert.deepEqual(got, { customer: 'Smith Family', lines: 1, sheets: [1], edge: [4] }, jid + ' ' + JSON.stringify(got));
    await page.evaluate(() => window.fiqCloseEstimator());
    const now = await jobsSnapshot(page);
    assert.ok(same(now, pre), 'Stage 8 ' + jid + ' (estimate-first / cutting-list-first): the job is untouched by the Estimator: ' + diffJobs(now, pre));
  }
  // A job whose price-list item is missing: panels are left out loudly, not guessed.
  r.s8_estimates = await page.evaluate(() => (0, eval)('state').estimates.map(e => [e.projectId, e.status]));

  // ================= STAGE 9: production data byte-identical =================
  console.error('STEP 9 production untouched');
  // Production panels hold exactly what the user typed in Studio (including the Studio edits made while the estimate existed), nothing more.
  const finalSnap = await jobsSnapshot(page);
  const prod = finalSnap.projects.find(p => p.id === 'job1').cabinets.map(c => [c.id, c.stage, c.parts.map(p => [p.id, p.name, p.length, p.width, p.thickness, p.qty, p.material, p.edgeLong, p.edgeShort])]);
  assert.deepEqual(prod, [
    ['k1', 'final', [['p1', 'Side', 720, 560, 18, 6, 'White melamine', 1, 0], ['p2', 'Shelf', 764, 540, 18, 6, 'White melamine', 1, 0]]],
    ['w1', 'estimate', [['p4', 'Gable', 2400, 580, 18, 2, 'White melamine', 1, 0], ['p5', 'Shelf', 1100, 560, 18, 5, 'White melamine', 1, 0], ['p9', 'Back', 2300, 600, 18, 1, 'White melamine', 0, 0]]]], 'production panels are exactly the Studio data');
  r.s9 = await page.evaluate(() => ({ prices: localStorage.getItem('fiq_supplier_prices_v1'), sheets: localStorage.getItem('assembleone_sheet_settings'), pl: JSON.stringify((0, eval)('state').priceList), inJobs: /"(estimates|priceList|sheetCfg)"/.test(JSON.stringify((0, eval)('state').projects)) }));
  assert.equal(r.s9.prices, lsBefore.prices); assert.equal(r.s9.sheets, lsBefore.sheets); assert.equal(r.s9.pl, plBefore); assert.equal(r.s9.inJobs, false, 'no estimate data inside any job');


  // ================= STAGE 10: simplified screen, fixed navigation, Back to Studio, Customer Job =================
  console.error('STEP 10 interface');
  await page.evaluate(() => { const s = (0, eval)('state');
    const part = (id, code, name, l, w, q, mat, eL, eS) => ({ id, code, name, length: l, width: w, thickness: 18, qty: q, material: mat, edgeLong: eL || 0, edgeShort: eS || 0 });
    s.projects.push({ id: 'jobUI', name: 'Interface job', customer: 'Smith Family', customerId: 'cust1', rooms: [{ id: 'ra', name: 'Kitchen' }, { id: 'rc', name: 'Bedroom' }],
      cabinets: [{ id: 'ua', name: 'Run', roomId: 'ra', stage: 'final', parts: [part('ui1', 'P-001', 'Side', 720, 560, 4, 'White melamine', 1, 0), part('ui2', 'P-002', 'Door', 716, 396, 8, 'Oak veneer', 2, 2), part('ui3', 'P-003', 'Shelf', 764, 540, 6, 'White melamine', 1, 0)] },
                 { id: 'uc', name: 'Wardrobe', roomId: 'rc', stage: 'estimate', parts: [part('ui4', 'P-001', 'Gable', 2380, 580, 2, 'White melamine', 1, 0), part('ui5', 'P-002', 'Shelf', 1100, 560, 5, 'White melamine', 1, 0)] }] });
    save(); });
  const openDrawing = async (j, u) => { await page.evaluate(async ([jj, uu]) => { switchToProject(jj, uu); renderAll(); show('mark'); await new Promise(x => setTimeout(x, 500)); save(); }, [j, u]); };
  const where = () => page.evaluate(() => { const s = (0, eval)('state'); const a = document.querySelector('.screen.active'); return { project: s.currentProject, cabinet: s.currentCabinet, screen: a && a.id, overlay: !!document.getElementById('fiqxEst') }; });
  const prodPanels = id => page.evaluate((jid) => (0, eval)('state').projects.find(p => p.id === jid).cabinets.map(c => [c.id, c.stage, c.parts.map(p => [p.id, p.name, p.length, p.width, p.thickness, p.qty, p.material, p.edgeLong, p.edgeShort])]), id);
  await openDrawing('jobUI', 'ua');
  const uiBefore = await prodPanels('jobUI');
  await page.click('#fiqxStudioEstimatorBtn'); await page.waitForSelector('#fiqxMaterials .fiqx-mrow');

  // -- the page: order, material requirements first, detail folded
  r.s10_layout = await page.evaluate(() => { const q = s => document.querySelector(s);
    return { nav: [...document.querySelectorAll('.fiqx-nav .fiqx-nbtn')].map(b => b.textContent.trim()), title: q('.fiqx-title').textContent, rows: [...document.querySelectorAll('#fiqxMaterials .fiqx-mrow')].map(x => x.textContent.replace(/\s+/g, ' ').trim()),
      panelsTable: !!q('#fiqxPanels table'), settingsBody: !!q('#fiqxSettingsBody'), panelsHead: q('#fiqxPanels').textContent.replace(/\s+/g, ' ').trim(), buttons: [...document.querySelectorAll('#fiqxPanels [data-act], #fiqxSheets [data-act]')].map(b => b.textContent.trim()),
      order: [...document.querySelectorAll('.fiqx-main > *')].map(e => e.id || (e.className.indexOf('fiqx-head') >= 0 ? 'head' : 'card')), summary: q('#fiqxSummary').textContent.replace(/\s+/g, ' ') }; });
  assert.deepEqual(r.s10_layout.nav, ['← BACK TO STUDIO', 'CUSTOMER JOB', 'SAVE ESTIMATE']);
  assert.ok(/Smith Family/.test(r.s10_layout.title) && /Interface job/.test(r.s10_layout.title), 'customer and job heading');
  assert.equal(r.s10_layout.rows.length, 2, 'one line per material: ' + JSON.stringify(r.s10_layout.rows));
  assert.ok(r.s10_layout.rows.every(x => /\d+ sheets?/.test(x)), 'each line shows the sheets needed');
  assert.ok(r.s10_layout.rows.some(x => /white melamine 18 mm/i.test(x)) && r.s10_layout.rows.some(x => /oak veneer 18 mm/i.test(x)), 'material names: ' + JSON.stringify(r.s10_layout.rows));
  assert.deepEqual([r.s10_layout.panelsTable, r.s10_layout.settingsBody], [false, false], 'panel details and sheet settings are folded');
  assert.ok(/PANELS IMPORTED FROM STUDIO/.test(r.s10_layout.panelsHead) && /5 panels in 2 rooms/.test(r.s10_layout.panelsHead), r.s10_layout.panelsHead);
  assert.deepEqual(r.s10_layout.buttons, ['VIEW PANEL DETAILS', 'SHOW']);
  assert.deepEqual(r.s10_layout.order.slice(0, 5), ['head', 'fiqxWarn', 'fiqxMaterialsCard', 'fiqxPanels', 'fiqxSheets'], 'order: heading, warnings, materials, panels, sheet settings, then costs');
  assert.ok(['Material cost', 'Material markup', 'Labour', 'Other costs', 'Subtotal', 'SUGGESTED CUSTOMER TOTAL', 'ESTIMATED PROFIT'].every(w => r.s10_layout.summary.indexOf(w) >= 0), 'price summary figures: ' + r.s10_layout.summary);
  await shot('interface-desktop');

  // -- fixed navigation: still in view and still clickable after scrolling to the very bottom
  await page.click('#fiqxEst [data-act="togglepanels"]'); await page.click('#fiqxEst [data-act="togglesheets"]');
  const navBefore = await page.evaluate(() => document.querySelector('.fiqx-nav').getBoundingClientRect().top);
  r.s10_fixed = await page.evaluate(async () => { const body = document.querySelector('#fiqxEst .fiqx-body'); body.scrollTop = body.scrollHeight; await new Promise(x => setTimeout(x, 200));
    const nav = document.querySelector('.fiqx-nav'), nr = nav.getBoundingClientRect(), btn = nav.querySelector('[data-act="close"]'), br = btn.getBoundingClientRect(), hit = document.elementFromPoint(br.left + br.width / 2, br.top + br.height / 2);
    return { scrolled: body.scrollTop, navTop: nr.top, h: br.height, w: br.width, hitIsButton: !!(hit && hit.closest('[data-act="close"]')) }; });
  assert.ok(r.s10_fixed.scrolled > 300, 'the page really scrolled: ' + r.s10_fixed.scrolled);
  assert.ok(Math.abs(r.s10_fixed.navTop - navBefore) < 2 && r.s10_fixed.navTop >= 0, 'top bar did not move');
  assert.ok(r.s10_fixed.h >= 44 && r.s10_fixed.w >= 90 && r.s10_fixed.hitIsButton, 'big, reachable buttons: ' + JSON.stringify(r.s10_fixed));
  await shot('interface-scrolled');
  await page.evaluate(() => { document.querySelector('#fiqxEst .fiqx-body').scrollTop = 0; });

  // -- warnings: one short line; an uncounted panel is named and cannot be mistaken for a finished total
  const sec10 = await page.evaluate(() => (0, eval)('state').estimates.find(e => e.projectId === 'jobUI').draft.sections[0].id);
  await page.click('#fiqxEst [data-act="add"][data-type="panel"][data-sec="' + sec10 + '"]');
  const ln10 = await page.evaluate(() => { const d = (0, eval)('state').estimates.find(e => e.projectId === 'jobUI').draft; return d.sections[0].lines.slice(-1)[0].id; });
  await page.fill('[data-b="' + sec10 + '|' + ln10 + '|name"]', 'Mystery'); await page.fill('[data-b="' + sec10 + '|' + ln10 + '|lengthCm"]', '100'); await page.fill('[data-b="' + sec10 + '|' + ln10 + '|widthCm"]', '40'); await page.fill('[data-b="' + sec10 + '|' + ln10 + '|qty"]', '2');
  r.s10_warn = await page.evaluate(() => ({ lines: document.querySelectorAll('#fiqxWarn .fiqx-warnline').length, text: document.getElementById('fiqxWarn').textContent, summary: document.getElementById('fiqxSummary').textContent, need: !!document.querySelector('#fiqxPanels select.fiqx-need') }));
  assert.equal(r.s10_warn.lines, 1, 'warnings grouped in one line'); assert.ok(/1 panel without sheet material/.test(r.s10_warn.text) && r.s10_warn.need, r.s10_warn.text);
  assert.ok(/Incomplete/.test(r.s10_warn.summary), 'total marked incomplete');
  await page.click('#fiqxWarn [data-act="fixsheet"]');
  await page.selectOption('[data-s="' + sec10 + '|' + ln10 + '|itemId"]', { label: await page.evaluate(() => [...document.querySelectorAll('select[data-s$="|itemId"] option')].map(o => o.textContent).find(t => /^White melamine/.test(t))) });
  r.s10_warnGone = await page.evaluate(() => document.getElementById('fiqxWarn').textContent);
  assert.ok(!/without sheet material/.test(r.s10_warnGone), 'warning clears once a sheet is chosen');
  // The new line was only an estimate-side panel: remove it again.
  await page.click('#fiqxEst [data-act="rmline"][data-id="' + ln10 + '"]');

  // -- Save Estimate waits for a tax rate and says why; then saves
  r.s10_saveBlocked = await page.evaluate(() => ({ disabled: document.getElementById('fiqxSaveBtn').disabled, msg: document.getElementById('fiqxNavMsg').textContent }));
  assert.ok(r.s10_saveBlocked.disabled && /tax/i.test(r.s10_saveBlocked.msg), JSON.stringify(r.s10_saveBlocked));
  await page.fill('[data-ib="taxRate"]', '21'); await page.fill('[data-ib="taxLabel"]', 'IVA');
  assert.equal(await page.evaluate(() => document.getElementById('fiqxSaveBtn').disabled), false, 'enabled once a tax rate is typed');
  await page.click('#fiqxSaveBtn'); await page.waitForSelector('#fiqxEst [data-act="editnew"]');
  r.s10_saved = await page.evaluate(() => { const e = (0, eval)('state').estimates.find(x => x.projectId === 'jobUI'); return { versions: e.versions.length, status: e.status, third: document.querySelector('.fiqx-nav .fiqx-npri').textContent.trim() }; });
  assert.deepEqual(r.s10_saved, { versions: 1, status: 'saved', third: 'EDIT ESTIMATE' });

  // -- Customer Job: the job page of this job, not a list
  await page.click('#fiqxEst [data-act="custjob"]'); await page.waitForTimeout(300);
  r.s10_custjob = await where(); assert.deepEqual(r.s10_custjob, { project: 'jobUI', cabinet: r.s10_custjob.cabinet, screen: 'screen-jobs', overlay: false }, JSON.stringify(r.s10_custjob));

  // -- Back to Studio: exactly the drawing it was opened from, even if Studio moved on behind the Estimator
  await openDrawing('jobUI', 'ua');
  await page.click('#fiqxStudioEstimatorBtn'); await page.waitForSelector('#fiqxEst [data-act="close"]');
  await page.evaluate(() => { switchToProject('job1', 'k1'); show('customers'); });   // Studio wandered off behind the overlay
  await page.click('#fiqxEst [data-act="close"]'); await page.waitForTimeout(400);
  r.s10_back = await where(); assert.deepEqual(r.s10_back, { project: 'jobUI', cabinet: 'ua', screen: 'screen-mark', overlay: false }, 'back to the same drawing: ' + JSON.stringify(r.s10_back));
  // From the job page it returns to the job page.
  await page.evaluate(() => { switchToProject('jobUI', 'ua'); show('jobs'); });
  await page.evaluate(() => window.fiqOpenEstimator('jobUI')); await page.waitForSelector('#fiqxEst [data-act="close"]');
  await page.click('#fiqxEst [data-act="close"]'); await page.waitForTimeout(300);
  r.s10_back2 = await where(); assert.equal(r.s10_back2.screen, 'screen-jobs'); assert.equal(r.s10_back2.overlay, false);

  // -- small screen: same order, big buttons in view, nothing sideways
  await openDrawing('jobUI', 'ua');
  await page.setViewportSize({ width: 390, height: 800 }); await page.waitForTimeout(300);
  await page.click('#fiqxStudioEstimatorBtn'); await page.waitForSelector('#fiqxEst [data-act="editnew"], #fiqxEst [data-act="savev"]');
  r.s10_small = await page.evaluate(async () => { const body = document.querySelector('#fiqxEst .fiqx-body'); body.scrollTop = body.scrollHeight; await new Promise(x => setTimeout(x, 200));
    const btns = [...document.querySelectorAll('.fiqx-nav .fiqx-nbtn')].map(b => { const rr = b.getBoundingClientRect(); return { t: b.textContent.trim(), w: Math.round(rr.width), h: Math.round(rr.height), inView: rr.top >= 0 && rr.left >= 0 && rr.right <= innerWidth + 1 && rr.bottom <= innerHeight }; });
    const win = document.querySelector('#fiqxEst .fiqx-win'), main = document.querySelector('.fiqx-main');
    return { btns, pageSideways: document.documentElement.scrollWidth > innerWidth + 1, winSideways: win.scrollWidth > win.clientWidth + 1, bodySideways: body.scrollWidth > body.clientWidth + 1, banner: (document.getElementById('fiqBetaBanner') || { getBoundingClientRect: () => ({ bottom: 0 }) }).getBoundingClientRect().bottom, navTop: document.querySelector('.fiqx-nav').getBoundingClientRect().top, scrolled: body.scrollTop, mainW: Math.round(main.getBoundingClientRect().width) }; });
  assert.equal(r.s10_small.btns.length, 3); assert.ok(r.s10_small.btns.every(b => b.h >= 44 && b.w >= 120 && b.inView), JSON.stringify(r.s10_small.btns));
  assert.ok(!r.s10_small.winSideways && !r.s10_small.bodySideways, 'the Estimator itself does not scroll sideways (the Studio page behind it is not part of this check): ' + JSON.stringify(r.s10_small));
  assert.ok(r.s10_small.navTop >= r.s10_small.banner - 1, 'the top bar sits below the red Beta strip, not under it: ' + r.s10_small.navTop + ' vs ' + r.s10_small.banner);
  await shot('interface-small');
  await page.click('#fiqxEst [data-act="close"]'); await page.waitForTimeout(300);
  await page.setViewportSize({ width: 1400, height: 900 });
  assert.deepEqual(await prodPanels('jobUI'), uiBefore, 'Stage 10: the Studio panels are exactly as they were');
  await shot('interface-before-11');

  // ================= STAGE 11: no matching price-list items (a new company): the sheets still show =================
  console.error('STEP 11 empty price list');
  await page.evaluate(() => { const s = (0, eval)('state'), C = window.FiqEstimatorCore;
    s.priceList = C.normalisePriceList({ items: [C.makeItem({ category: 'sheet', name: 'Birch ply 18 mm (2440 × 1220)', unit: 'sheet', cost: 70, sheet: { thickness: 18, w: 2440, h: 1220 } })] });   // nothing here matches the panels below
    s.customers.push({ id: 'cust2', name: 'Anna' });
    s.projects.push({ id: 'jobAnna', name: 'New Job', customer: 'Anna', customerId: 'cust2', rooms: [{ id: 'rn', name: 'Room' }],
      cabinets: [{ id: 'un', name: 'Unit', roomId: 'rn', stage: 'estimate', parts: [
        { id: 'an1', code: 'P-001', name: 'Panel A', length: 2000, width: 500, thickness: 18, qty: 2, material: '', edgeLong: 1, edgeShort: 0 },
        { id: 'an2', code: 'P-002', name: 'Panel B', length: 1000, width: 400, thickness: 19, qty: 3, material: 'Oak melamine', edgeLong: 2, edgeShort: 0 }] }] });
    save(); });
  await openDrawing('jobAnna', 'un');
  const annaBefore = await prodPanels('jobAnna'), plAnna = await page.evaluate(() => JSON.stringify((0, eval)('state').priceList));
  await page.click('#fiqxStudioEstimatorBtn'); await page.waitForSelector('#fiqxMaterials .fiqx-mrow');
  r.s11 = await page.evaluate(() => ({ rows: [...document.querySelectorAll('#fiqxMaterials .fiqx-mrow')].map(x => x.querySelector('.fiqx-mname').textContent.trim() + ' | ' + x.querySelector('.fiqx-mbig').textContent.trim()),
    empty: /No sheets yet/.test(document.getElementById('fiqxMaterials').textContent), warn: document.getElementById('fiqxWarn').textContent, summary: document.getElementById('fiqxSummary').textContent,
    edgeRows: document.querySelectorAll('#fiqxMaterials .fiqx-erow').length }));
  await shot('interface-anna');
  assert.equal(r.s11.empty, false, 'sheets are shown even though no price-list item matches');
  assert.equal(r.s11.rows.length, 2, JSON.stringify(r.s11.rows)); assert.ok(r.s11.rows.some(x => /^MATERIAL NOT SET 18 MM|^Material not set 18 mm/i.test(x)) && r.s11.rows.some(x => /oak melamine 19 mm/i.test(x)), JSON.stringify(r.s11.rows));
  assert.ok(/1 panel with no material in Studio/.test(r.s11.warn) && /without a price/.test(r.s11.warn), r.s11.warn); assert.ok(/Incomplete/.test(r.s11.summary));
  assert.equal(r.s11.edgeRows, 2, 'edging shown per material as well');
  // Same sheet count as Panel Check for the panel that has a material.
  const pcOakAnna = await page.evaluate(() => { const parts = (0, eval)('state').projects.find(p => p.id === 'jobAnna').cabinets[0].parts.filter(p => p.material); const g = window.a181ComputeGroups(parts)[0]; return { sheets: g.sheets.length, cuts: g.sheets.reduce((n, s) => n + (s.cuts || 0), 0), cfg: g.cfg }; });
  const oakKey = 'mat:oak melamine~19';
  const oakNow = await page.evaluate((k) => { const g = (0, eval)('state').estimates.find(e => e.projectId === 'jobAnna').draft.derived.sheets[k]; return { count: g.count, cuts: g.cuts, w: g.cfg.w, h: g.cfg.h, kerf: g.cfg.kerf, trim: g.cfg.trim }; }, oakKey);
  assert.deepEqual([oakNow.count, oakNow.cuts, oakNow.w, oakNow.h, oakNow.kerf, oakNow.trim], [pcOakAnna.sheets, pcOakAnna.cuts, pcOakAnna.cfg.w, pcOakAnna.cfg.h, pcOakAnna.cfg.kerf, pcOakAnna.cfg.trim], 'matches Panel Check: ' + JSON.stringify([oakNow, pcOakAnna]));
  // Type the price straight on the line: the cursor stays in the box while the totals follow.
  await page.focus('[data-gb="sheets|' + oakKey + '|unitCost"]'); await page.keyboard.type('60');
  r.s11_typed = await page.evaluate((k) => { const a = document.activeElement; return { value: a.value, stillThere: a.getAttribute('data-gb'), cost: (0, eval)('state').estimates.find(e => e.projectId === 'jobAnna').draft.derived.sheets[k].unitCost, row: document.querySelector('#fiqxMaterials').textContent }; }, oakKey);
  assert.deepEqual([r.s11_typed.value, r.s11_typed.stillThere, r.s11_typed.cost], ['60', 'sheets|' + oakKey + '|unitCost', 60], 'typing keeps the cursor in the price box');
  await page.fill('[data-gb="edging|' + oakKey + '|unitCost"]', '1.5');
  await page.fill('[data-gb="sheets|mat:~18|unitCost"]', '50'); await page.fill('[data-gb="edging|mat:~18|unitCost"]', '1');
  r.s11_priced = await page.evaluate(() => ({ warn: document.getElementById('fiqxWarn').textContent, mat: document.getElementById('fiqxSummary').textContent }));
  assert.ok(!/without a price/.test(r.s11_priced.warn) && /1 panel with no material/.test(r.s11_priced.warn), 'only the real problem is left: ' + r.s11_priced.warn);
  // Sheet settings for a material without a price-list item: change the size, the count follows.
  await page.click('#fiqxEst [data-act="togglesheets"]');
  const oldCount = oakNow.count;
  await page.fill('[data-cfg="' + oakKey + '|w"]', '1220'); await page.fill('[data-cfg="' + oakKey + '|h"]', '600');
  const newGroup = await page.evaluate((k) => { const g = (0, eval)('state').estimates.find(e => e.projectId === 'jobAnna').draft.derived.sheets[k]; return { count: g.count, w: g.cfg.w, h: g.cfg.h, listW: g.listW, rowText: document.getElementById('fiqxMaterials').textContent }; }, oakKey);
  assert.deepEqual([newGroup.w, newGroup.h], [1220, 600]); assert.ok(newGroup.count > oldCount, 'smaller sheet, more sheets: ' + newGroup.count + ' vs ' + oldCount);
  // Choose a price-list item for the panel that has no material: it moves into that item and is priced from the list.
  await page.click('#fiqxWarn [data-act="fixsheet"]');
  const optLabel = await page.evaluate(() => [...document.querySelectorAll('#fiqxPanels select[data-s$="|itemId"].fiqx-need option')].map(o => o.textContent).find(t => /^Birch ply/.test(t)));
  await page.selectOption('#fiqxPanels select[data-s$="|itemId"].fiqx-need', { label: optLabel });
  r.s11_chosen = await page.evaluate(() => ({ rows: [...document.querySelectorAll('#fiqxMaterials .fiqx-mname')].map(x => x.textContent.trim()), warn: document.getElementById('fiqxWarn').textContent }));
  assert.ok(r.s11_chosen.rows.some(x => /birch ply 18 mm/i.test(x)) && !r.s11_chosen.rows.some(x => /material not set/i.test(x)), JSON.stringify(r.s11_chosen));
  assert.ok(!/no material/.test(r.s11_chosen.warn), r.s11_chosen.warn);
  assert.equal(await page.evaluate(() => JSON.stringify((0, eval)('state').priceList)), plAnna, 'the price list is not changed');
  await page.evaluate(() => window.fiqCloseEstimator());
  assert.deepEqual(await prodPanels('jobAnna'), annaBefore, 'Stage 11: the Studio panels are exactly as they were');

  r.network = { escaped: escaped.length }; assert.equal(escaped.length, 0);
  r.pageErrors = errors; assert.equal(errors.length, 0, 'page errors: ' + errors.join(' | '));
  console.log(JSON.stringify(r, null, 1));
  await browser.close(); server.close();
})().catch(e => { console.error(String(e && e.stack || e).split('\n').slice(0, 4).join('\n')); process.exitCode = 1; }).finally(() => setTimeout(() => process.exit(), 500));
