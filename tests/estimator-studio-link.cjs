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
  const same = (a, b) => canon(strip(a.projects)) === canon(strip(b.projects)) && canon(a.customers) === canon(b.customers);
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
  r.s2_opened = await page.evaluate(() => { const o = document.getElementById('fiqxEst'); return { pickerShown: !!o.querySelector('#fiqxJobSearch'), top: o.querySelector('.fiqx-top').textContent }; });
  assert.ok(!r.s2_opened.pickerShown, 'the button must not open the job picker');
  assert.ok(/Smith Family/.test(r.s2_opened.top) && /Kitchen and wardrobe/.test(r.s2_opened.top), 'customer and job shown: ' + r.s2_opened.top);
  await page.evaluate(() => window.fiqCloseEstimator());
  assert.ok(same(await jobsSnapshot(page), beforeS2), 'Stage 2 changes nothing in the job');

  // STAGES-GO-HERE

  r.network = { escaped: escaped.length }; assert.equal(escaped.length, 0);
  r.pageErrors = errors; assert.equal(errors.length, 0, 'page errors: ' + errors.join(' | '));
  console.log(JSON.stringify(r, null, 1));
  await browser.close(); server.close();
})().catch(e => { console.error(String(e && e.stack || e).split('\n').slice(0, 4).join('\n')); process.exitCode = 1; }).finally(() => setTimeout(() => process.exit(), 500));
