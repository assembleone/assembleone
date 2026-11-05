// Estimator core: copying panels from a Studio job (snapshot), price-list matching, edge counts,
// per-estimate sheet settings, change detection and the protected update. Pure Node, no browser.
const assert = require('node:assert/strict');
const C = require('../beta/estimator-core.js');

// A stand-in packer with the same signature as window.a181Pack: one panel per sheet position, cuts = 2 per sheet.
function stubPack(pieces, w, h, kerf, rotate, trim) {
  const uw = w - 2 * trim, uh = h - 2 * trim, sheets = [], unplaced = []; let cur = null, used = 0;
  pieces.forEach(p => {
    const fits = (p.w <= uw && p.h <= uh) || (rotate && p.h <= uw && p.w <= uh);
    if (!fits) { unplaced.push(p); return; }
    const a = p.w * p.h;
    if (!cur || used + a > uw * uh) { cur = { placements: [], cuts: 0 }; sheets.push(cur); used = 0; }
    cur.placements.push(p); cur.cuts += 2; used += a;
  });
  stubPack.last = { w, h, kerf, rotate, trim };
  return { sheets, unplaced };
}

const pl = C.normalisePriceList({ items: [
  C.makeItem({ category: 'sheet', name: 'White melamine 18 mm (2800 × 2070)', unit: 'sheet', cost: 45, sheet: { thickness: 18, w: 2800, h: 2070 } }),
  C.makeItem({ category: 'sheet', name: 'Oak veneer 18 mm (2440 × 1220)', unit: 'sheet', cost: 88, sheet: { thickness: 18, w: 2440, h: 1220 } }),
  C.makeItem({ category: 'sheet', name: 'Oak veneer 25 mm (2440 × 1220)', unit: 'sheet', cost: 120, sheet: { thickness: 25, w: 2440, h: 1220 } }),
  C.makeItem({ category: 'edging', name: 'Edging White melamine', unit: 'metre', cost: 0.8 }),
  C.makeItem({ category: 'edging', name: 'Edging Oak veneer', unit: 'metre', cost: 1.9 })] });
const white = pl.items[0].id, oak18 = pl.items[1].id, oak25 = pl.items[2].id, eWhite = pl.items[3].id, eOak = pl.items[4].id;
const part = (id, code, name, l, w, th, q, mat, eL, eS) => ({ id, code, name, length: l, width: w, thickness: th, qty: q, material: mat, edgeLong: eL || 0, edgeShort: eS || 0 });
const makeJob = () => ({ id: 'j1', name: 'Job', rooms: [{ id: 'rk', name: 'Kitchen' }, { id: 'rb', name: 'Bedroom' }, { id: 'rx', name: 'Empty room' }],
  cabinets: [
    { id: 'k1', name: 'Run', roomId: 'rk', parts: [part('p1', 'P-001', 'Side', 720, 560, 18, 4, 'White melamine', 1, 0), part('p3', 'P-003', 'Door', 716, 396, 18, 8, 'Oak veneer', 2, 2), part('p6', 'P-004', 'No size', 0, 0, 18, 1, 'White melamine')] },
    { id: 'w1', name: 'Wardrobe', roomId: 'rb', parts: [part('p4', 'P-001', 'Gable', 2380, 580, 18, 2, 'White melamine', 1, 0)] },
    { id: 'x1', name: 'Loose', roomId: '', parts: [part('p7', 'P-001', 'Odd', 500, 300, 25, 1, 'Oak veneer', 0, 0)] }] });

// ---- Import: one section per room, empty rooms left out, loose units in "No room", unsized panels reported.
{
  const job = makeJob(), before = JSON.stringify(job), imp = C.importFromJob(job, pl);
  assert.equal(JSON.stringify(job), before, 'the job is never touched');
  assert.deepEqual(imp.sections.map(s => [s.name, s.roomId, s.lines.length]), [['Kitchen', 'rk', 2], ['Bedroom', 'rb', 1], ['No room', null, 1]]);
  assert.deepEqual(imp.skipped, ['P-004']);
  assert.equal(imp.count, 4);
  const lines = imp.sections.flatMap(s => s.lines);
  assert.equal(lines[0].itemId, white); assert.equal(lines[1].itemId, oak18); assert.equal(lines[3].itemId, oak25, 'thickness picks the 25 mm item');
  assert.equal(lines[0].edgeItemId, eWhite); assert.equal(lines[1].edgeItemId, eOak); assert.equal(lines[3].edgeItemId, null, 'no edges, no edging item');
  assert.equal(lines[0].lengthCm, 72); assert.equal(lines[0].widthCm, 56); assert.equal(lines[0].qty, 4);
  assert.equal(lines[0].edges, 'counts'); assert.equal(lines[3].edges, 'none');
  assert.equal(lines[0].src.srcId, 'p1');
  // Unclear matches stay empty: unknown material, or two items that both fit.
  assert.equal(C.matchSheetItem(pl, 'Walnut', 18), null);
  const dup = C.normalisePriceList({ items: pl.items.concat([C.makeItem({ category: 'sheet', name: 'White melamine 18 mm (2440 × 1220)', unit: 'sheet', cost: 40, sheet: { thickness: 18, w: 2440, h: 1220 } })]) });
  assert.equal(C.matchSheetItem(dup, 'White melamine', 18), null, 'two candidates: never guess');
  assert.equal(C.matchSheetItem(pl, '', 18), null);
}

// ---- Edging by Studio edge counts (long edges x length + short edges x width), per edging item.
{
  const v = C.emptyVersion(pl), imp = C.importFromJob(makeJob(), pl); v.sections = imp.sections; v.source = imp.source;
  const ed = C.edgingDemand(v);
  // white: 4 x (1 x 72cm) + 2 x (1 x 238cm) = 288 + 476 = 764 cm = 7.64 m ; oak: 8 x (2 x 71.6 + 2 x 39.6) = 8 x 222.4 = 1779.2 cm
  assert.equal(Math.round(ed[eWhite] * 100) / 100, 7.64); assert.equal(Math.round(ed[eOak] * 100) / 100, 17.79);
  // The older rough-panel options are unchanged.
  const w = C.emptyVersion(pl); w.sections[0].lines = [{ id: 'a', type: 'panel', lengthCm: 100, widthCm: 50, qty: 2, itemId: white, edges: 'long', edgeItemId: eWhite }, { id: 'b', type: 'panel', lengthCm: 100, widthCm: 50, qty: 1, itemId: white, edges: 'all', edgeItemId: eWhite }];
  assert.equal(C.edgingDemand(w)[eWhite], 4 + 3);
}

// ---- Sheet settings live in the estimate only; without them behaviour is exactly as before; cuts are carried.
{
  const v = C.emptyVersion(pl); v.sections = C.importFromJob(makeJob(), pl).sections;
  assert.deepEqual(C.cfgOf(v, white, pl.items[0]), { w: 2800, h: 2070, kerf: 4, trim: 0, grain: false }, 'legacy defaults');
  C.syncDerived(v, pl, stubPack);
  assert.deepEqual(stubPack.last && { kerf: stubPack.last.kerf, rotate: stubPack.last.rotate, trim: stubPack.last.trim }, { kerf: 4, rotate: true, trim: 0 }, 'legacy: 4 mm, may turn, no trim');
  assert.ok(v.derived.sheets[white].cuts > 0, 'cuts counted');
  assert.equal(v.derived.notes.cuts, Object.keys(v.derived.sheets).reduce((n, id) => n + v.derived.sheets[id].cuts, 0));
  v.sheetCfg = { [white]: { w: 2440, h: 1220, kerf: 3, trim: 5, grain: true } };
  const plBefore = JSON.stringify(pl); C.syncDerived(v, pl, stubPack);
  assert.equal(JSON.stringify(pl), plBefore, 'the price list is never changed');
  assert.equal(v.derived.sheets[white].cfg.w, 2440); assert.equal(v.derived.sheets[white].sizeDiffers, true, 'differs from the price list item (2800 × 2070)');
  assert.equal(v.derived.sheets[white].unitCost, 45, 'price per sheet is kept, not scaled by area');
  v.sheetCfg[white].w = 1220; v.sheetCfg[white].h = 2440; C.syncDerived(v, pl, stubPack);
  assert.equal(v.derived.sheets[white].sizeDiffers, true);
  v.sheetCfg[white] = { w: 2070, h: 2800, kerf: 3, trim: 5, grain: true }; C.syncDerived(v, pl, stubPack);
  assert.equal(v.derived.sheets[white].sizeDiffers, false, 'same sheet turned round is not a difference');
  // A price typed in this estimate stays in this estimate and survives a recalculation.
  C.syncDerived(v, pl, stubPack); v.derived.sheets[white].unitCost = 52; C.syncDerived(v, pl, stubPack);
  assert.equal(v.derived.sheets[white].unitCost, 52); assert.equal(pl.items[0].cost, 45);
  // Whole cost follows the sheet count: bigger sheets, fewer of them, cost = count x kept price.
  const r = C.compute(v); assert.ok(r.materialCost > 0);
}

// ---- With no price list at all, sheets and edging are still counted by the Studio material; no material is flagged.
{
  const empty = C.normalisePriceList({ items: [] }), job = makeJob(); job.cabinets[0].parts[0].material = '';
  const imp = C.importFromJob(job, empty), v = C.emptyVersion(empty); v.sections = imp.sections; v.source = imp.source; C.syncDerived(v, empty, stubPack);
  const names = Object.keys(v.derived.sheets).map(k => [k, v.derived.sheets[k].name, v.derived.sheets[k].count, v.derived.sheets[k].unitCost]).sort();
  assert.deepEqual(names.map(n => n[1]).sort(), ['Material not set 18 mm', 'Oak veneer 18 mm', 'Oak veneer 25 mm', 'White melamine 18 mm'], 'one group per Studio material and thickness: ' + JSON.stringify(names));
  assert.ok(names.every(n => n[2] >= 1 && n[3] === null), 'sheets counted, no price yet');
  assert.deepEqual(v.derived.notes.noMaterial, ['Side'], 'the panel with no material is named');
  assert.deepEqual(v.derived.notes.noSheet, [], 'nothing is silently left out');
  assert.ok(C.compute(v).missingPrices.length >= 4, 'the missing prices are reported, so the total reads as incomplete');
  const white = v.derived.sheets['mat:white melamine~18'];
  assert.equal(v.derived.edging['mat:white melamine~18'].metres, 4.8, 'edging counted by material too (2 gables x 2.38 m, rounded up to 0.1)');
  assert.equal(v.derived.edging['mat:~18'].name, 'Edging Material not set 18 mm');
  // Typing a price on the group is enough to cost it; nothing else is needed.
  white.unitCost = 45; C.syncDerived(v, empty, stubPack); assert.equal(v.derived.sheets['mat:white melamine~18'].unitCost, 45, 'a typed price survives recalculation');
  // Choosing a price-list item for a line moves it into that item group.
  const lines = v.sections.flatMap(x => x.lines); const oakLine = lines.find(l => l.material === 'Oak veneer' && l.thickness === 18);
  oakLine.itemId = oak18; C.syncDerived(v, pl, stubPack); assert.ok(v.derived.sheets[oak18] && !v.derived.sheets['mat:oak veneer~18'], 'item chosen: grouped under the price-list item');
}
// ---- Hand-typed rough panels without an item are still left out loudly.
{
  const v = C.emptyVersion(pl); v.sections[0].lines = [{ id: 'm1', type: 'panel', name: 'Typed', lengthCm: 100, widthCm: 40, qty: 2, itemId: null, edges: 'none' }];
  C.syncDerived(v, pl, stubPack); assert.deepEqual(v.derived.notes.noSheet, ['Typed']); assert.deepEqual(Object.keys(v.derived.sheets), []);
}

// ---- Change detection and the protected update.
{
  const job = makeJob(), v = C.emptyVersion(pl), imp = C.importFromJob(job, pl); v.sections = imp.sections; v.source = imp.source;
  assert.equal(C.diffAgainstJob(v, job).stale, false, 'fresh copy matches Studio');
  // Studio: change Side qty 4 -> 6, change Gable length, delete the Door, add a Back.
  job.cabinets[0].parts[0].qty = 6; job.cabinets[1].parts[0].length = 2400;
  job.cabinets[0].parts = job.cabinets[0].parts.filter(p => p.id !== 'p3'); job.cabinets[0].parts.push(part('p8', 'P-005', 'Back', 700, 500, 18, 1, 'White melamine'));
  // Estimate: the user changed Gable qty 2 -> 3 (a manual edit) and set a sheet size.
  const gable = v.sections[1].lines[0]; gable.qty = 3; v.sheetCfg = { [white]: { w: 2440, h: 1220, kerf: 3, trim: 5, grain: true } };
  const d = C.diffAgainstJob(v, job);
  assert.equal(d.stale, true);
  assert.deepEqual([d.added.length, d.removed.length, d.changed.length], [1, 1, 2]);
  const gableDiff = d.changed.find(c => c.line.id === gable.id); assert.deepEqual(gableDiff.edited, ['qty']); assert.deepEqual(gableDiff.fields, ['lengthMm']);
  const jobBefore = JSON.stringify(job), cfgBefore = JSON.stringify(v.sheetCfg);
  const res = C.applyUpdate(v, job, pl);
  assert.equal(JSON.stringify(job), jobBefore, 'updating the estimate never touches the job');
  assert.equal(JSON.stringify(v.sheetCfg), cfgBefore, 'sheet settings are protected');
  assert.deepEqual(res.did, { added: 1, removed: 1, changed: 2 });
  assert.equal(res.kept.length, 0, "Studio changed the length, you changed the quantity: different values, nothing in conflict");
  assert.equal(gable.qty, 3, "the quantity typed in the estimate is kept"); assert.equal(gable.lengthCm, 240, "the length Studio changed is applied");
  const side = v.sections[0].lines.find(l => l.src.srcId === 'p1'); assert.equal(side.qty, 6, 'an untouched line follows Studio');
  assert.equal(C.diffAgainstJob(v, job).stale, false, 'after updating nothing is left to review');
  // A line deleted inside the estimate is not offered again as new.
  const back = v.sections[0].lines.find(l => l.src.srcId === 'p8'); v.sections[0].lines = v.sections[0].lines.filter(l => l.id !== back.id); v.source.dropped = { p8: back.src.fp };
  assert.equal(C.diffAgainstJob(v, job).added.length, 0);
}

// ---- The same value changed in Studio AND in the estimate: the estimate value is kept and listed before anything moves.
{
  const job = makeJob(), v = C.emptyVersion(pl), imp = C.importFromJob(job, pl); v.sections = imp.sections; v.source = imp.source;
  const side = v.sections[0].lines[0]; side.qty = 10; job.cabinets[0].parts[0].qty = 5;
  const d = C.diffAgainstJob(v, job); assert.deepEqual(d.changed[0].edited, ['qty']); assert.deepEqual(d.changed[0].fields, ['qty']);
  const res = C.applyUpdate(v, job, pl);
  assert.equal(side.qty, 10); assert.equal(res.kept.length, 1); assert.ok(/quantity/.test(res.kept[0].why)); assert.equal(res.did.changed, 0);
}

console.log('estimator-link-core: all tests passed');
