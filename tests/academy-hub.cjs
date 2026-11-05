// Academy Members Hub in a real browser against the Firebase EMULATORS only (never a real project): sign-in, every
// access state, fail-closed when the rules are not live, sign-out, the four areas, phone width.
// Run from a folder with firebase.json (auth 9099, firestore 8085), Java and the emulator test packages:
//   FIQ_LIVE_RULES=<live firestore.rules> firebase emulators:exec --only auth,firestore --project demo-fiq-academy "node tests/academy-hub.cjs"
// The page loads the Firebase web SDK from Google's CDN, so this test needs internet for that one file.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const { doc, setDoc } = require('firebase/firestore');

const root = path.resolve(__dirname, '..');
const live = fs.readFileSync(process.env.FIQ_LIVE_RULES, 'utf8').replace(/\r\n/g, '\n');
const block = fs.readFileSync(path.join(root, 'academy-rules', 'firestore.academy.rules'), 'utf8').replace(/\r\n/g, '\n');
const marker = '    match /{document=**} {';
const withAcademy = live.replace(marker, block + marker), withoutAcademy = live;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

async function api(p, body, token) {
  const r = await fetch('http://127.0.0.1:9099/' + p, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (token || 'owner') }, body: JSON.stringify(body) });
  const j = await r.json(); if (!r.ok) throw new Error(p + ' ' + JSON.stringify(j)); return j;
}
async function makeUser(email, { verified = true, claims = null, name } = {}) {
  const u = await api('identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key', { email, password: 'Passw0rd!x', displayName: name || undefined, returnSecureToken: true });
  await api('identitytoolkit.googleapis.com/v1/projects/demo-fiq-academy/accounts:update', { localId: u.localId, emailVerified: verified, customAttributes: claims ? JSON.stringify(claims) : undefined });
  return u.localId;
}

(async () => {
  const server = http.createServer((req, res) => { const u = decodeURIComponent(req.url.split('?')[0]); const f = path.join(root, u === '/' ? 'academy.html' : u.slice(1)); if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end(); } res.setHeader('Content-Type', types[path.extname(f)] || 'application/octet-stream'); res.end(fs.readFileSync(f)); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port;
  const env = await initializeTestEnvironment({ projectId: 'demo-fiq-academy', firestore: { host: '127.0.0.1', port: 8085, rules: withAcademy } });

  const ids = {};
  ids.member = await makeUser('member@test.fiq', { claims: { companyId: 'A', role: 'fitter' }, name: 'Sam Carpenter' });
  ids.noacademy = await makeUser('noacademy@test.fiq', { claims: { companyId: 'A', role: 'fitter' } });
  ids.suspended = await makeUser('suspended@test.fiq', { claims: { companyId: 'A', role: 'fitter' } });
  ids.unverified = await makeUser('unverified@test.fiq', { verified: false, claims: { companyId: 'A', role: 'fitter' } });
  ids.nocompany = await makeUser('nocompany@test.fiq', {});
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'companies/A'), { name: 'Co A', status: 'active' });
    for (const [k, s] of [['member', 'active'], ['noacademy', 'active'], ['suspended', 'suspended'], ['unverified', 'active']]) await setDoc(doc(db, 'companies/A/members/' + ids[k]), { role: 'fitter', status: s });
    for (const k of ['member', 'suspended', 'unverified']) await setDoc(doc(db, 'academyMembers/' + ids[k]), { status: 'active', displayName: k === 'member' ? 'Sam Carpenter' : '' });
  });

  const browser = await chromium.launch(); const errors = [];
  const openHub = async (viewport) => {
    const ctx = await browser.newContext({ viewport: viewport || { width: 1280, height: 900 } });
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1|www\.gstatic\.com)/, (r) => r.abort());
    const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(e.message)); p.setDefaultTimeout(20000);
    await p.goto(base + '/academy.html?emu=1'); return { ctx, p };
  };
  const signIn = async (p, email, password) => { await p.waitForSelector('#f'); await p.fill('#em', email); await p.fill('#pw', password || 'Passw0rd!x'); await p.click('#f button'); };
  const text = (p) => p.evaluate(() => document.getElementById('app').innerText.replace(/\s+/g, ' ').trim());
  const R = {};
  const shot = async (p, n) => { if (process.env.FIQ_SHOT) await p.screenshot({ path: path.join(process.env.FIQ_SHOT, n + '.png') }); };

  // signed out: sign-in form, wrong password refused, no private content
  { const { ctx, p } = await openHub(); await p.waitForSelector('#f');
    assert.ok(/Academy sign in/.test(await text(p)) && await p.isHidden('#signOut'), 'signed out sees only the sign-in form');
    await signIn(p, 'member@test.fiq', 'wrong-password'); await p.waitForSelector('.err');
    assert.ok(/did not work/.test(await text(p)) && !/Hello/.test(await text(p)), 'wrong password is refused kindly');
    await shot(p, 'hub-signin'); R.signedOut = 'sign-in form, wrong password refused'; await ctx.close(); }

  // the member: dashboard with four large areas, the placeholders, back, sign out
  { const { ctx, p } = await openHub(); await signIn(p, 'member@test.fiq'); await p.waitForSelector('.tiles');
    const t = await text(p);
    assert.ok(/Hello, Sam/.test(t) && /COMMUNITY/.test(t) && /PROJECT GALLERY/.test(t) && /KNOWLEDGE LIBRARY/.test(t) && /TRAINING/.test(t) && /DESIGNER OF THE MONTH/.test(t), t);
    assert.equal(await p.locator('.tile').count(), 4, 'four areas'); await shot(p, 'hub-desktop');
    await p.click('[data-area="gallery"]'); await p.waitForSelector('.view'); assert.ok(/PROJECT GALLERY/.test(await text(p)));
    await p.click('#back'); await p.waitForSelector('.tiles'); assert.equal(await p.evaluate(() => location.hash), '');
    await p.reload(); await p.waitForSelector('.tiles'); R.member = 'dashboard with four areas; stays signed in after a reload';
    await p.click('#signOut'); await p.waitForSelector('#f'); R.signOut = 'sign out returns to the sign-in form';
    await p.reload(); await p.waitForSelector('#f'); assert.ok(/Academy sign in/.test(await text(p)), 'still signed out after reload'); await ctx.close(); }

  // every other person gets a clear, private answer
  for (const [email, re, label] of [
    ['noacademy@test.fiq', /Join FittersIQ Academy/, 'company member without a membership is invited to ask'],
    ['suspended@test.fiq', /Your FittersIQ account is paused/, 'a paused company is told so, even with a membership'],
    ['unverified@test.fiq', /Please confirm your email/, 'unconfirmed email asked to confirm'],
    ['nocompany@test.fiq', /Finish your FittersIQ account/, 'a login with no company is sent to finish setup']]) {
    const { ctx, p } = await openHub(); await signIn(p, email); await p.waitForFunction((s) => !/Checking|Academy sign in/.test(document.getElementById('app').innerText), null, { timeout: 15000 });
    const t = await text(p); assert.ok(re.test(t) && !/COMMUNITY/.test(t) && await p.locator('.tile').count() === 0, label + ': ' + t); R[email] = label; if (/Join FittersIQ/.test(t)) await shot(p, 'hub-nomembership');
    if (/Join FittersIQ/.test(t)) { const href = await p.getAttribute('.btn', 'href'); assert.ok(/^mailto:hello@fittersiq.com/.test(href) && !/[€£$]\s?\d/.test(t), 'no prices on the page, contact by email'); }
    await ctx.close(); }

  // fail closed: the same member, but the Academy rules are not live yet
  await env.clearFirestore(); await initializeTestEnvironment({ projectId: 'demo-fiq-academy', firestore: { host: '127.0.0.1', port: 8085, rules: withoutAcademy } }).then(async (e2) => {
    await e2.withSecurityRulesDisabled(async (ctx) => { const db = ctx.firestore(); await setDoc(doc(db, 'companies/A'), { name: 'Co A', status: 'active' }); await setDoc(doc(db, 'companies/A/members/' + ids.member), { role: 'fitter', status: 'active' }); await setDoc(doc(db, 'academyMembers/' + ids.member), { status: 'active' }); }); });
  { const { ctx, p } = await openHub(); await signIn(p, 'member@test.fiq'); await p.waitForFunction(() => /not available right now/.test(document.getElementById('app').innerText), null, { timeout: 15000 });
    assert.equal(await p.locator('.tile').count(), 0, 'no private content when the rules are not live'); R.failClosed = 'door stays closed when the Academy rules are not published'; await ctx.close(); }

  // phone: one column, big buttons
  await env.clearFirestore(); await initializeTestEnvironment({ projectId: 'demo-fiq-academy', firestore: { host: '127.0.0.1', port: 8085, rules: withAcademy } }).then(async (e3) => {
    await e3.withSecurityRulesDisabled(async (ctx) => { const db = ctx.firestore(); await setDoc(doc(db, 'companies/A'), { name: 'Co A', status: 'active' }); await setDoc(doc(db, 'companies/A/members/' + ids.member), { role: 'fitter', status: 'active' }); await setDoc(doc(db, 'academyMembers/' + ids.member), { status: 'active', displayName: 'Sam Carpenter' }); }); });
  { const { ctx, p } = await openHub({ width: 390, height: 844 }); await signIn(p, 'member@test.fiq'); await p.waitForSelector('.tiles');
    const m = await p.evaluate(() => { const tiles = [...document.querySelectorAll('.tile')].map((t) => { const r = t.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left) }; }); return { tiles, sideways: document.documentElement.scrollWidth > innerWidth + 1, font: parseFloat(getComputedStyle(document.body).fontSize) }; });
    assert.ok(m.tiles.length === 4 && m.tiles.every((t) => t.left === m.tiles[0].left && t.w > 300 && t.h >= 150) && !m.sideways && m.font >= 17, 'phone layout: ' + JSON.stringify(m));
    await shot(p, 'hub-phone'); R.phone = 'one column, big tiles, no sideways scroll'; await ctx.close(); }

  assert.equal(errors.length, 0, 'page errors: ' + errors.join(' | '));
  console.log(JSON.stringify(R, null, 1)); console.log('academy-hub: all checks passed');
  await browser.close(); server.close(); await env.cleanup();
})().catch((e) => { console.error(String(e && e.stack || e).split('\n').slice(0, 6).join('\n')); process.exit(1); }).finally(() => setTimeout(() => process.exit(process.exitCode || 0), 500));
