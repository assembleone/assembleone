// The cloud backup list gains 'priceList' and 'estimates'. A company that has not used the
// Estimator must fingerprint exactly as before (no new backup, nothing changes); once it has
// estimates they are included, and restore puts them back (fiq-cloud-restore reads any state: key).
const assert = require('node:assert/strict'), path = require('node:path');
const dir = process.env.FIQ_EST_DIR || 'staging';
// "Before" is always the published Production copier (c294580, 1 Nov 2026), read from git history,
// so the comparison stays meaningful once the release itself has changed cloud-master/.
const os = require('node:os'), fs = require('node:fs'), { execFileSync } = require('node:child_process');
const baseFile = path.join(os.tmpdir(), 'fiq-cloud-copy.c294580.js');
fs.writeFileSync(baseFile, execFileSync('git', ['show', 'c294580:cloud-master/fiq-cloud-copy.js'], { cwd: path.join(__dirname, '..') }));
const before = require(baseFile);
const after = require(path.join(__dirname, '..', dir === '.' ? '' : dir, 'cloud-master', 'fiq-cloud-copy.js'));
(async () => {
  const net = new Proxy({}, { get: (t, k) => () => { throw new Error('network not used: ' + String(k)); } });
  const mk = m => m.createCloudCopy({ fb: net, st: net, db: {}, storage: {}, companyId: 'companyTest', env: 'beta', uid: 'u1', sessionId: 's1', deviceId: 'd1' });
  const state = { customers: [{ id: 'c1', name: 'A' }], projects: [{ id: 'j1', name: 'Job', cabinets: [] }], units: [], fitters: [] };
  const fpBefore = await mk(before).fingerprint({ state, settings: {}, drawings: [] });
  const fpAfter = await mk(after).fingerprint({ state, settings: {}, drawings: [] });
  assert.equal(fpAfter, fpBefore, 'no Estimator data: identical backup fingerprint');
  const withEst = Object.assign({}, state, { priceList: { items: [] }, estimates: [{ id: 'e1' }] });
  assert.notEqual(await mk(after).fingerprint({ state: withEst, settings: {}, drawings: [] }), fpAfter, 'Estimator data is included');
  assert.equal(await mk(before).fingerprint({ state: withEst, settings: {}, drawings: [] }), fpBefore, 'old copier ignored it (proves the one-line change is what includes it)');
  console.log('estimator-cloud-copy: passed (fingerprint unchanged without Estimator data; included with it)');
})().catch(e => { console.error(e.message); process.exitCode = 1; });
