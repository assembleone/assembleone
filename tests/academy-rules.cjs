// Academy access rules, tested on the LIVE Firestore rules plus the Academy block, in the Firestore emulator only.
// Nothing here touches a real project. Run (from a folder with firebase-tools, Java and the emulator test packages):
//   FIQ_LIVE_RULES=<copy of the live firestore.rules> firebase emulators:exec --only firestore --project demo-fiq-academy "node tests/academy-rules.cjs"
// with firebase.json giving the Firestore emulator port 8085.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc, updateDoc, deleteDoc } = require('firebase/firestore');

const live = fs.readFileSync(process.env.FIQ_LIVE_RULES, 'utf8').replace(/\r\n/g, '\n');
const block = fs.readFileSync(path.join(__dirname, '..', 'academy-rules', 'firestore.academy.rules'), 'utf8').replace(/\r\n/g, '\n');
const marker = '    match /{document=**} {';
assert.ok(live.includes(marker), 'live rules have the final catch-all');
// A probe collection stands in for the Academy content of the next stages: readable only by academyMember().
const probe = '    match /academyProbe/{id} {\n      allow read: if academyMember();\n    }\n\n';
const candidate = live.replace(marker, block + probe + marker);

(async () => {
  const env = await initializeTestEnvironment({ projectId: 'demo-fiq-academy', firestore: { host: '127.0.0.1', port: 8085, rules: candidate } });
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    for (const c of ['A', 'B']) await setDoc(doc(db, 'companies/' + c), { name: 'Co ' + c, status: 'active' });
    const mem = (c, uid, status, role) => setDoc(doc(db, 'companies/' + c + '/members/' + uid), { role: role || 'fitter', status });
    await mem('A', 'ownerA', 'active', 'company_owner'); await mem('A', 'fitA', 'active'); await mem('A', 'fitNoAcademy', 'active'); await mem('A', 'fitSuspended', 'suspended'); await mem('B', 'ownerB', 'active', 'company_owner');
    for (const u of ['ownerA', 'fitA', 'fitSuspended', 'ownerB', 'stranger']) await setDoc(doc(db, 'academyMembers/' + u), { status: 'active', displayName: u });
    await setDoc(doc(db, 'academyMembers/fitPaused'), { status: 'paused' }); await mem('A', 'fitPaused', 'active');
    await setDoc(doc(db, 'academyProbe/p1'), { title: 'private' });
  });
  const as = (uid, claims) => env.authenticatedContext(uid, claims).firestore();
  const read = (db, p) => getDoc(doc(db, p));
  const R = {};
  const ok = async (name, p) => { await assertSucceeds(p); R[name] = 'allowed'; };
  const no = async (name, p) => { await assertFails(p); R[name] = 'refused'; };

  // Private content: only a signed-in, active company member with an active Academy membership.
  await ok('active owner with Academy membership reads private content', read(as('ownerA', { companyId: 'A', role: 'company_owner' }), 'academyProbe/p1'));
  await ok('active fitter with Academy membership reads private content', read(as('fitA', { companyId: 'A', role: 'fitter' }), 'academyProbe/p1'));
  await ok('a member of another company with their own membership reads (Academy is shared)', read(as('ownerB', { companyId: 'B', role: 'company_owner' }), 'academyProbe/p1'));
  await no('company member WITHOUT an Academy membership', read(as('fitNoAcademy', { companyId: 'A', role: 'fitter' }), 'academyProbe/p1'));
  await no('Academy membership marked paused', read(as('fitPaused', { companyId: 'A', role: 'fitter' }), 'academyProbe/p1'));
  await no('suspended company member (trial ended or unpaid) even with an Academy membership', read(as('fitSuspended', { companyId: 'A', role: 'fitter' }), 'academyProbe/p1'));
  await no('Academy membership but no company at all', read(as('stranger', {}), 'academyProbe/p1'));
  await no('Academy membership but not a member of the company in their token', read(as('stranger', { companyId: 'A' }), 'academyProbe/p1'));
  await no('someone not signed in', read(env.unauthenticatedContext().firestore(), 'academyProbe/p1'));
  await no('company token claim of the wrong kind', read(as('fitA', { companyId: 12345 }), 'academyProbe/p1'));

  // The membership record itself.
  await ok('a person reads their own Academy membership', read(as('fitA', { companyId: 'A' }), 'academyMembers/fitA'));
  await no('a person cannot read someone else Academy membership', read(as('fitA', { companyId: 'A' }), 'academyMembers/ownerA'));
  await no('a person cannot give themselves a membership', setDoc(doc(as('fitNoAcademy', { companyId: 'A' }), 'academyMembers/fitNoAcademy'), { status: 'active' }));
  await no('a person cannot edit their own membership', updateDoc(doc(as('fitA', { companyId: 'A' }), 'academyMembers/fitA'), { status: 'active', extra: 1 }));
  await no('a company owner cannot grant membership to a colleague', setDoc(doc(as('ownerA', { companyId: 'A', role: 'company_owner' }), 'academyMembers/fitNoAcademy'), { status: 'active' }));
  await ok('FittersIQ admin can grant a membership', setDoc(doc(as('admin1', { fittersiq_admin: true }), 'academyMembers/newbie'), { status: 'active' }));
  await ok('FittersIQ admin can pause a membership', updateDoc(doc(as('admin1', { fittersiq_admin: true }), 'academyMembers/newbie'), { status: 'paused' }));
  await no('nobody can delete a membership record', deleteDoc(doc(as('admin1', { fittersiq_admin: true }), 'academyMembers/newbie')));

  // The existing protections are unchanged.
  await no('existing: a company member still cannot read another company', read(as('fitA', { companyId: 'A', role: 'fitter' }), 'companies/B'));
  await ok('existing: a company member still reads their own company', read(as('fitA', { companyId: 'A', role: 'fitter' }), 'companies/A'));
  await no('existing: unknown collections stay closed', read(as('ownerA', { companyId: 'A', role: 'company_owner' }), 'somethingElse/x'));

  console.log(JSON.stringify(R, null, 1));
  console.log('academy-rules: ' + Object.keys(R).length + ' checks passed');
  await env.cleanup();
})().catch((e) => { console.error(String(e && e.stack || e).split('\n').slice(0, 5).join('\n')); process.exit(1); });
