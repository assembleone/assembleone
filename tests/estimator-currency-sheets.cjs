// Beta Estimator: currencies (label only) + Custom Sheets (save, edit, delete, reuse, cloud sync with a fake company store).
// Run: node tests/estimator-currency-sheets.cjs   (needs Playwright; air-gapped, real Studio code, throwaway profile)
const { chromium } = require('playwright');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.css': 'text/css', '.svg': 'image/svg+xml' };
(async () => {
  const server = http.createServer((req, res) => { const u = decodeURIComponent(req.url.split('?')[0]); if (!u.startsWith('/assembleone/')) { res.statusCode = 404; return res.end(); } const f = path.join(root, u.slice(13)); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end(); } res.setHeader('Content-Type', types[path.extname(f)] || 'application/octet-stream'); res.end(fs.readFileSync(f)); });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port + '/assembleone';
  const browser = await chromium.launch(); const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, r => r.abort());
  const errors = [];
  // A fake "company cloud" that outlives page loads, standing in for a second computer.
  const cloud = {};
  await ctx.exposeFunction('cloudList', () => Object.values(cloud));
  await ctx.exposeFunction('cloudPut', s => { cloud[s.id] = s; });
  await ctx.exposeFunction('cloudRemove', id => { delete cloud[id]; });
  async function open(opts = {}) {
    const p = await ctx.newPage(); p.setDefaultTimeout(20000); p.on('pageerror', e => errors.push(e.message)); p.on('dialog', d => d.accept());
    if (opts.cloud) await p.addInitScript(() => { window.fiqCustomSheetsBackend = { list: () => window.cloudList(), put: s => window.cloudPut(s), remove: id => window.cloudRemove(id) }; });
    await p.goto(base + '/beta/Studio.html');
    await p.waitForFunction(() => document.readyState === 'complete' && typeof save === 'function' && window.fiqEditor && window.fiqEditor.role === 'editor' && typeof window.fiqOpenEstimator === 'function', null, { timeout: 60000 });
    await p.addStyleTag({ content: '#fiqAuthGate{display:none!important}' }); await p.evaluate(() => document.body.classList.remove('fiq-locked'));
    await p.waitForTimeout(1200); return p;
  }
  let page = await open({ cloud: true });
  await page.evaluate(() => {
    const s = (0, eval)('state'), C = window.FiqEstimatorCore;
    s.customers.push({ id: 'cust1', name: 'Smith Family' });
    s.projects.push({ id: 'job1', name: 'Kitchen', customer: 'Smith Family', customerId: 'cust1', rooms: [{ id: 'rk', name: 'Kitchen' }], jobLog: [],
      cabinets: [{ id: 'k1', name: 'Run', roomId: 'rk', stage: 'final', parts: [{ id: 'p1', code: 'P-001', name: 'Side', length: 720, width: 560, thickness: 18, qty: 4, material: 'White melamine', edgeLong: 1, edgeShort: 0 }] }] });
    s.priceList = C.normalisePriceList({ items: [C.makeItem({ category: 'sheet', name: 'White melamine 18 mm (2800 × 2070)', unit: 'sheet', cost: 45, sheet: { thickness: 18, w: 2800, h: 2070 } })] });
    // an old estimate made before currencies existed
    s.estimates = [C.createEstimate ? C.createEstimate({ projectId: 'job1', name: 'Old estimate' }, s.priceList) : null].filter(Boolean);
    save();
  });
  const legacy = await page.evaluate(() => { const e = (0, eval)('state').estimates[0]; if (e) { delete e.currency; save(); } return !!e; });
  await page.evaluate(() => { switchToProject('job1', 'k1'); window.fiqOpenEstimator('job1'); });
  await page.waitForSelector('#fiqxEst');
  const txt = () => page.evaluate(() => document.getElementById('fiqxEst').innerText);
  if (legacy) { const t = await txt(); assert.ok(/€|EUR/.test(t), 'legacy estimate shows EUR'); }
  // new estimate, change currency
  await page.click('#fiqxEst [data-act="new"]'); await page.waitForSelector('#fiqxEst [data-eb="currency"]');
  const opts = await page.$$eval('[data-eb="currency"] option', o => o.map(x => x.value));
  assert.deepEqual(opts, ['EUR', 'GBP', 'USD', 'DKK', 'SEK', 'NOK', 'CHF']);
  for (const [code, mark] of [['GBP', '£'], ['USD', '$'], ['DKK', 'DKK '], ['CHF', 'CHF']]) {
    await page.selectOption('[data-eb="currency"]', code);
    const t = await txt(); assert.ok(t.includes(mark), code + ' symbol ' + mark + ' on screen'); assert.ok(!/€/.test(t), 'no euro sign when ' + code);
  }
  await page.selectOption('[data-eb="currency"]', 'GBP');
  await page.fill('#fiqxEst [data-ib="taxRate"]', '20'); await page.dispatchEvent('#fiqxEst [data-ib="taxRate"]', 'change'); await page.waitForTimeout(300);
  await page.click('#fiqxEst [data-act="savev"]'); await page.waitForTimeout(500);
  const savedCur = await page.evaluate(() => { const e = (0, eval)('state').estimates.slice(-1)[0]; return [e.currency, e.versions.slice(-1)[0].currency]; });
  assert.deepEqual(savedCur, ['GBP', 'GBP']);
  // numbers do not change with currency (no conversion)
  const tot = await page.evaluate(() => { const C = window.FiqEstimatorCore, e = (0, eval)('state').estimates.slice(-1)[0], v = e.versions.slice(-1)[0]; const a = JSON.stringify(C.compute(v).totals || C.compute(v)); e.currency = 'USD'; const b = JSON.stringify(C.compute(v).totals || C.compute(v)); e.currency = 'GBP'; return a === b; });
  assert.ok(tot, 'currency never changes the numbers');
  await page.evaluate(() => window.fiqCloseEstimator()); await page.waitForTimeout(500);
  await page.close(); page = await open({ cloud: true });
  const after = await page.evaluate(() => (0, eval)('state').estimates.map(e => [e.name, e.currency || null]));
  assert.ok(after.some(x => x[1] === 'GBP'), 'GBP survives reload: ' + JSON.stringify(after));
  await page.evaluate(() => { switchToProject('job1', 'k1'); window.fiqOpenEstimator('job1'); }); await page.waitForSelector('#fiqxEst');
  const listTxt = await txt(); assert.ok(/£/.test(listTxt), 'saved GBP estimate listed in £'); 
  if (legacy) assert.ok(/€/.test(listTxt), 'old estimate still listed in €');
  // ---- custom sheets
  await page.evaluate(() => window.fiqOpenCustomSheets());
  await page.waitForSelector('#fiqxCS');
  await page.fill('[data-csin="name"]', 'Standard Melamine'); await page.fill('[data-csin="w"]', '2800'); await page.fill('[data-csin="h"]', '2070'); await page.click('[data-csact="add"]');
  await page.fill('[data-csin="name"]', 'Large Board'); await page.fill('[data-csin="w"]', '3050'); await page.fill('[data-csin="h"]', '1300'); await page.click('[data-csact="add"]');
  await page.fill('[data-csin="name"]', 'standard melamine'); await page.fill('[data-csin="w"]', '1000'); await page.fill('[data-csin="h"]', '1000'); await page.click('[data-csact="add"]');
  assert.ok(/already|duplicate|same name/i.test(await page.innerText('#fiqxCS')), 'duplicate name refused');
  await page.fill('[data-csin="name"]', 'Bad'); await page.fill('[data-csin="w"]', '0'); await page.fill('[data-csin="h"]', 'abc'); await page.click('[data-csact="add"]');
  assert.equal(await page.$$eval('[data-sheet-row]', r => r.length), 2, 'only the two valid sheets saved');
  await page.waitForTimeout(500);
  assert.equal(Object.keys(cloud).length, 2, 'both sheets reached the company cloud');
  // edit
  await page.click('[data-sheet-row] [data-csact="edit"] >> nth=0');
  await page.fill('[data-csedit="name"]', 'Large Board XL'); await page.click('[data-csact="save"]'); await page.waitForTimeout(400);
  assert.ok(Object.values(cloud).some(s => s.name === 'Large Board XL'), 'edit reached cloud');
  await page.click('[data-csact="close"]');
  // another computer: wipe local state, sheets come back from the cloud
  await page.evaluate(() => { const s = (0, eval)('state'); s.customSheets = []; s.customSheetsDeleted = []; save(); });
  await page.close(); page = await open({ cloud: true });
  await page.evaluate(() => window.fiqCustomSheets.sync()); await page.waitForTimeout(500);
  const back = await page.evaluate(() => window.fiqCustomSheets.list().map(x => [x.name, x.w, x.h]));
  assert.equal(back.length, 2, 'sheets restored from the cloud on a fresh computer: ' + JSON.stringify(back));
  // reuse in an estimate
  await page.evaluate(() => { switchToProject('job1', 'k1'); window.fiqOpenEstimator('job1'); }); await page.waitForSelector('#fiqxEst');
  await page.click('#fiqxEst [data-act="new"]'); await page.waitForSelector('#fiqxEst [data-eb="currency"]');
  if (await page.$('#fiqxEst [data-act="studioimport"]')) { await page.click('#fiqxEst [data-act="studioimport"]'); await page.waitForTimeout(500); }
  await page.waitForSelector('#fiqxEst [data-act="togglesheets"]');
  await page.click('#fiqxEst [data-act="togglesheets"]'); await page.waitForSelector('[data-csel]');
  const optId = await page.$eval('[data-csel] option:nth-child(3)', o => [o.value, o.textContent]);
  await page.selectOption('[data-csel]', optId[0]); await page.waitForTimeout(300);
  const cfg = await page.evaluate(() => { const e = (0, eval)('state').estimates.slice(-1)[0], k = Object.keys(e.draft.sheetCfg || {})[0]; return e.draft.sheetCfg[k]; });
  assert.ok(cfg && (cfg.w === 2800 || cfg.w === 3050 || /2800|3050/.test(String(cfg.w))), 'sheet size applied to estimate: ' + JSON.stringify(cfg));
  // delete: estimate keeps its size
  await page.evaluate(() => window.fiqOpenCustomSheets()); await page.waitForSelector('#fiqxCS');
  while (await page.$('[data-sheet-row]')) { await page.click('[data-sheet-row] [data-csact="delete"] >> nth=0'); await page.waitForTimeout(150); }
  await page.waitForTimeout(500);
  assert.equal(Object.keys(cloud).length, 0, 'deleted sheets removed from the cloud');
  const keeps = await page.evaluate(() => { const e = (0, eval)('state').estimates.slice(-1)[0], k = Object.keys(e.draft.sheetCfg || {})[0]; return e.draft.sheetCfg[k].w; });
  assert.ok(keeps, 'estimate keeps its sheet size after deleting the saved sheet');
  // offline: cloud failing keeps sheets locally and says so
  await page.close(); page = await open({});
  await page.evaluate(() => window.fiqOpenCustomSheets()); await page.waitForSelector('#fiqxCS');
  await page.fill('[data-csin="name"]', 'Special Order'); await page.fill('[data-csin="w"]', '2440'); await page.fill('[data-csin="h"]', '1220'); await page.click('[data-csact="add"]');
  assert.ok(/this computer/i.test(await page.innerText('#fiqxCSStatus')), 'honest local-only status');
  await page.waitForTimeout(800); // Studio writes to the browser database a moment after save()
  await page.close(); page = await open({});
  assert.equal(await page.evaluate(() => window.fiqCustomSheets.list().length), 1, 'locally saved sheet persists across reload');
  assert.deepEqual(errors, [], 'no page errors: ' + errors.join(' | '));
  console.log('PASS estimator-currency-sheets');
  await browser.close(); server.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
