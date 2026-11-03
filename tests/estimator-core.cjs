// Estimator core (spec v1.1 sections 8-10, 16: T2, T4, T6, T12 at calculation level).
const assert = require('node:assert/strict');
const C = require(require('node:fs').existsSync(require('node:path').join(__dirname,'../estimator-core.js'))?'../estimator-core.js':'../staging/estimator-core.js');

function custom(name, cost, qty) { const l = C.lineFromItem('custom', null, { name, qty: qty || 1 }); C.setLineCost(l, cost); return l; }
function version(lines, inputs) { const v = C.emptyVersion(C.emptyPriceList()); v.sections[0].lines = lines; Object.assign(v.inputs, inputs); return v; }

// T4: the worked example in section 10, exactly.
{
  const v = version([custom('Materials', 693)], { markupPct: 30, labourDays: 5, dayRate: 400, otherCosts: [{ label: 'Delivery', amount: 40 }], taxRate: 21, taxLabel: 'IVA' });
  const r = C.compute(v);
  assert.deepEqual([r.materialCost, r.markupAmount, r.labourCharged, r.otherCosts, r.subtotal, r.taxAmount, r.suggestedTotal, r.profit, r.marginPct],
    [693, 207.9, 2000, 40, 2940.9, 617.59, 3558.49, 2207.9, 75.1], 'worked example');
  assert.equal(r.taxLabel, 'IVA');
}
// Tax: blank blocks saving; 0 is valid; out of range refused; tax never counts as profit.
{
  const v = version([custom('M', 100)], { markupPct: 10, taxRate: null });
  const r = C.compute(v);
  assert.equal(r.taxAmount, null); assert.equal(r.suggestedTotal, null); assert.equal(r.taxSet, false);
  assert.deepEqual(C.validateForSave(v), ['Tax rate not set']);
  v.inputs.taxRate = 0; assert.deepEqual(C.validateForSave(v), []); assert.equal(C.compute(v).taxAmount, 0);
  v.inputs.taxRate = 101; assert.equal(C.validateForSave(v).length, 1);
  v.inputs.taxRate = 21; const r2 = C.compute(v); assert.equal(r2.profit, 10); assert.equal(r2.marginPct, Math.round(10 / 110 * 1000) / 10);
}
// Edge cases: zero subtotal; 0% markup; decimals in markup and tax.
{
  assert.equal(C.compute(version([], { taxRate: 21 })).marginPct, 0);
  const v = version([custom('M', 693)], { markupPct: 12.5, taxRate: 10.5 });
  const r = C.compute(v);
  assert.equal(r.markupAmount, 86.63); assert.equal(r.subtotal, 779.63); assert.equal(r.taxAmount, 81.86);
  v.inputs.markupPct = 0; assert.equal(C.compute(v).markupAmount, 0);
}
// Missing prices are flagged, never silently counted as zero.
{
  const l = C.lineFromItem('custom', null, { name: 'Handles', qty: 4 });
  const r = C.compute(version([l, custom('M', 50)], { taxRate: 21 }));
  assert.deepEqual(r.missingPrices, ['Handles']); assert.equal(r.materialCost, 50);
}
// T2 snapshot: changing the price list never changes a line, a saved version or its totals.
{
  const pl = C.emptyPriceList(); pl.defaults.taxRate = 21;
  const hinge = C.makeItem({ category: 'hinges', name: 'Soft-close hinge', unit: 'each', cost: 2.4 }); pl.items.push(hinge);
  const est = C.newEstimate({ projectId: 'job1', name: 'Wardrobe' }, pl);
  const line = C.lineFromItem('item', hinge, { qty: 12 }); est.draft.sections[0].lines.push(line);
  hinge.cost = 3.1;
  assert.equal(line.unitCost, 2.4, 'line keeps its snapshot');
  const saved = C.saveVersion(est, 'u1', null, pl); assert.ok(saved.ok);
  assert.equal(est.versions[0].results.materialCost, 28.8); assert.equal(est.status, 'saved'); assert.equal(est.draft, null);
  hinge.cost = 9.99; assert.equal(est.versions[0].results.materialCost, 28.8, 'saved version unchanged');
  assert.deepEqual(C.compute(est.versions[0]), est.versions[0].results, 'stored results recalculate exactly');
  // Override applies to this estimate only.
  C.editAsNewVersion(est); const l2 = est.draft.sections[0].lines[0]; C.setLineCost(l2, '2,10');
  assert.equal(l2.unitCost, 2.1); assert.equal(l2.overridden, true); assert.equal(hinge.cost, 9.99);
  // T6 refresh: shows differences, changes nothing until applied, then only the chosen refs.
  const diffs = C.priceDifferences(est.draft, pl); assert.equal(diffs.length, 1); assert.equal(l2.unitCost, 2.1);
  C.applyPriceRefresh(est.draft, pl, [diffs[0].ref]); assert.equal(l2.unitCost, 9.99); assert.equal(l2.overridden, false);
  assert.equal(C.saveVersion(est, 'u1', null, pl).version.n, 2);
}
// T12 defaults: a new company starts at markup 0 with a blank tax rate and label; Save asks for a rate.
{
  const est = C.newEstimate({ projectId: 'j' }, C.emptyPriceList());
  assert.equal(est.draft.inputs.markupPct, 0); assert.equal(est.draft.inputs.taxRate, null); assert.equal(est.draft.inputs.taxLabel, '');
  const res = C.saveVersion(est, 'u', null, C.emptyPriceList()); assert.equal(res.ok, false); assert.deepEqual(res.problems, ['Tax rate not set']);
  assert.equal(est.versions.length, 0);
}
// Sheets and edging from rough panels (whole sheets, allowance, overrides, snapshot of the sheet price).
{
  const pl = C.emptyPriceList();
  const white = C.makeItem({ category: 'sheet', name: 'White 18', unit: 'sheet', cost: 45, sheet: { thickness: 18, w: 2800, h: 2070 } });
  const edge = C.makeItem({ category: 'edging', name: 'Edging white', unit: 'metre', cost: 0.8 });
  pl.items.push(white, edge);
  const v = C.emptyVersion(pl); v.inputs.taxRate = 21;
  v.sections[0].lines.push(C.lineFromItem('panel', white, { name: 'Sides', lengthCm: 240, widthCm: 60, qty: 4, edges: 'long', edgeItemId: edge.id }));
  C.syncDerived(v, pl, null);
  assert.equal(v.derived.sheets[white.id].count, Math.ceil(4 * 2400 * 600 / (2800 * 2070)));
  assert.equal(v.derived.edging[edge.id].metres, 19.2);
  assert.equal(C.compute(v).materialCost, Math.round((45 * v.derived.sheets[white.id].count + 0.8 * 19.2) * 100) / 100);
  white.cost = 60; C.syncDerived(v, pl, null); assert.equal(v.derived.sheets[white.id].unitCost, 45, 'sheet price snapshot kept');
  v.derived.sheets[white.id].override = 5; C.syncDerived(v, pl, null); assert.equal(v.derived.sheets[white.id].override, 5);
  v.inputs.allowancePct = 10; C.syncDerived(v, pl, null); assert.equal(v.derived.edging[edge.id].metres, 21.2);
  const tooBig = C.emptyVersion(pl); tooBig.sections[0].lines.push(C.lineFromItem('panel', white, { lengthCm: 300, widthCm: 300, qty: 1 }));
  assert.equal(C.syncDerived(tooBig, pl, null).derived.sheets[white.id].tooBig, 1);
}
// T8 import: reads the Shopping List's prices, never changes the source text, skips duplicates.
{
  const raw = JSON.stringify({ 'sheet|white melamine|18|2800x2070': '45.00', 'edge|white melamine|18': '0,80', 'hw|soft-close hinge': 2.4, 'cut|all': '1.5', 'sheet|bad': 'x' });
  const before = raw;
  const r = C.importBrowserPrices(raw, [], 'owner');
  assert.equal(raw, before);
  assert.deepEqual(r.items.map(i => [i.category, i.unit, i.cost]), [['sheet', 'sheet', 45], ['edging', 'metre', 0.8], ['hardware', 'each', 2.4], ['other', 'each', 1.5]]);
  assert.deepEqual(r.items[0].sheet, { thickness: 18, w: 2800, h: 2070 });
  assert.equal(r.skipped.length, 1);
  assert.equal(C.importBrowserPrices(raw, r.items, 'owner').items.length, 0, 'second import adds nothing');
}
console.log('estimator-core: all tests passed');
