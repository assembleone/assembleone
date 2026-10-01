# Stage 2.2 slice 2: plan (for review, not implemented)

Builds on slice 1 (`d410737`). Browser stays master. Company A stays clean; live tests in Company B only. No Production media is read or copied. No frozen Studio code is changed until approved. The PDF rule change is prepared and emulator-tested only.

## 1. Job package (schema 2)

A new job version file is a package instead of the plain job:

```json
{ "fiqPackage": 2,
  "job": { ...the exact browser job... },
  "drawings": { "<unitId>": { "sha256": "...", "contentType": "image/jpeg | application/pdf",
                              "drawingType": "image | pdf", "drawingName": "plan.pdf", "bytes": 12345 } },
  "links":    { "<exact link text found in the job>": { "sha256": "...", "contentType": "image/jpeg", "bytes": 2345 } },
  "lifecycle": [ { "event": "deleted | restored", "localAt": 0, "cloudAt": "<server time>", "device": "..." } ],
  "recycleBin": null | { "deletedAt": 0, "job": { ...the bin copy... } } }
```

- `JSON.stringify(package.job)` must equal the browser job text exactly (checked on every read-back). Ids and QR / piece identities stay byte for byte.
- Slice 1 plain files stay readable (a file without `fiqPackage` is a plain job). The first slice 2 run turns each job into a new version (package) once.
- File name and record rules are unchanged: `r<rev>-<sha256>.json`, version + lock rules from Stage 2.1.

## 2. Media (drawings and photos) owned by the cloud master

- Stored once by content fingerprint: `fiqmaster/{companyId}/{env}/media/{sha256}` (sha256 of the raw bytes), uploaded with the Studio lock; an existing file is reused only after its bytes are checked.
- **Drawings**: read from IndexedDB `assembleone_stable_v1` / `drawings`, key `jobId:unitId` (`{drawing: data URL, drawingType, drawingName}`); decoded to bytes; recorded in the package `drawings` map by unit id. Same drawing in several units = one media file.
- **Photo links** (Mobile / Studio `https://firebasestorage...` links inside the job: job notes, room design images / note photos, site captures, Site Note photos, panel photos): bytes fetched and stored by fingerprint, recorded in the package `links` map by the exact link text. The job itself is not changed. Only allowed hosts are fetched: in this phase the staging bucket (and the emulator). Links to Production are **not** fetched: the job is reported "media not yet owned" and the run cannot be verified (no marker).
- **Copied versus verified (decided 2 October 2026, Option A).** A changed job is always copied straight away, even when one of its photos cannot be owned yet: the new job version is written, and the photo is recorded as pending (absent from the package `links` map, listed in the run's `mediaNotOwned`). *Copied* = the cloud has the latest job data. *Verified* = the cloud has the latest job data **and** every media file belonging to it, owned and checked. While any media is pending the run is `incomplete`, no verified marker is written, and `checkVerified()` is false for that browser state.
- **Embedded images** (data URLs already inside the job, e.g. drawing previews): stay inside the job (already exact and verified in slice 1).
- **PDF drawings** need the media rule change below.

## 3. Orphan drawings (recovery storage)

Drawings in IndexedDB whose `jobId:unitId` matches no current job, no recycle-bin job and no unit: never discarded. Bytes go to media by fingerprint; the list is kept in the cloud settings record under the key `recovery.orphanDrawings` (JSON: key, jobId, unitId, sha256, contentType, drawingType, drawingName, bytes, firstSeen), append-only (an entry is never removed). Reported on every run. (No rule change needed: settings `values` is a map of strings.)

## 4. Settings

`fiqMaster/{env}/settings/studio` `{ rev, values }`, values are strings copied exactly:

- browser keys (Stage 2.0 allow-list): `assembleone_material_library_v1`, `assembleone_notes_library_v1`, `assembleone_supplier_system`, `assembleone_sheet_settings`, `fiq_supplier_prices_v1`, `assembleone_language`, `assembleone_mobile_lang`, every `assembleone-checklist-<jobId>`, stored as `ls:<key>`;
- from the saved data: `units`, `fitters`, `lastChosenPartName`, stored as `state:<field>` (JSON text);
- excluded (temporary UI state): `currentProject`, `currentCabinet`, `currentPart`, `currentRoom`, `currentCustomerCard`, `screen`, `drawingZoom`, `dotCycle`, `newPanelDraft`, `focusMarker`, `selectedCopy`, `showStartShell`;
- plus `recovery.orphanDrawings` (section 3).

Version + lock rules as for jobs; a stale settings version stops the run.

## 5. Deleted jobs (tombstones kept forever in the cloud)

For each id in `deletedProjectIds` (and each recycle-bin entry):

- no cloud record yet: version 1 package with the bin copy (or `job: null` if the bin copy is gone), then version 2 tombstone (`deleted: true`, `deletedAt` = server time); the package keeps `recycleBin.deletedAt` = the real local delete time;
- live cloud record: next version as tombstone, package as above;
- already a tombstone: nothing written, never again.

The cloud keeps tombstones and bin copies indefinitely, even after the local 30-day purge or "Delete forever".

## 6. Restore history (needs the approved Studio change)

Today a restore leaves no trace, so a job that is live in the browser but a tombstone in the cloud is a conflict. With `state.jobLifecycle` (proposed change below):

- job live in the browser + cloud tombstone + a local `restored` event newer than the cloud delete: write the deliberate Restore (`deleted: false`, `restoredAt` = server time, `deletedAt` kept), package `lifecycle` gains the event with the local time;
- no such event: stays a conflict (stale browser), never overwritten.

The package `lifecycle` list is carried forward on every version (fixes the slice 1 observation that the record only keeps the latest state).

## 7. Verification and the marker

The read-back covers everything above: package fingerprint and exact job text; every drawing and link media file (bytes and fingerprint against the browser's IndexedDB bytes / fetched bytes); settings values exactly; tombstones and bin copies; orphan list. The marker fingerprint (`verifiedSha256`) is extended to the whole browser master: customers, job texts, drawing bytes fingerprints, settings values, deleted ids, recycle bin, lifecycle, orphan drawings. Any change to any of these makes `checkVerified` false. Outcome per run: `verified | failed | incomplete | conflicts`.

## 8. Proposed rule change (prepared, NOT deployed)

`firebase-staging/proposed-pdf/storage.rules`, only the media rule:

```
-                      && request.resource.contentType.matches('image/.*');
+                      && (request.resource.contentType.matches('image/.*')
+                          || request.resource.contentType == 'application/pdf');
```

Emulator results on the proposed rules: PDF checks 15/15 (`pdf-media.test.cjs`); full suite unchanged (242/242, orphan test 0 unsafe, cloud copy 15/15). Firestore rules: no change.

## 9. Proposed Studio change (frozen code, NOT applied)

`proposed-restore-history.patch` (8 added lines in `Studio-Recovery.html`): `deleteProjectRecord` and `restoreDeletedProject` each append one entry to `state.jobLifecycle` (`{jobId, event: 'deleted' | 'restored', at, deletedAt}`); nothing reads or shows it. Test `proposed-restore-history.test.cjs` (real clicks, current vs patched code): visible behaviour and saved data identical except the new field; history recorded and kept after reload — 10/10.

## 10. Tests to write for slice 2 (emulator, generated data, Stage 2.1 rules + PDF change)

1. Package: exact job inside, slice 1 plain file upgraded once, ids/QR identities.
2. Drawings: JPEG and PDF from IndexedDB, byte-exact read-back, one media file for a shared drawing.
3. Interrupted media upload: no marker; rerun reuses media; nothing duplicated.
4. Tampered media file: verification fails, no marker.
5. Photo links: generated image in the emulator bucket copied by fingerprint; a Production link is not fetched and blocks verification.
6. Settings: exact values; UI state excluded; checklists; stale settings version.
7. Deleted jobs: never-copied deleted job (v1 + tombstone with bin copy and local time); previously copied job; bin copy already purged; later runs never touch a tombstone.
8. Restore: with a lifecycle event (deliberate restore) and without (conflict).
9. Orphan drawings preserved, listed, never removed from the list.
10. Marker covers everything: changing a drawing, a setting, the deleted list or the lifecycle makes `checkVerified` false.
11. Browser data unchanged in every test; lock held elsewhere stops everything.
12. Scale: 40 jobs, 80 drawings (~100 KB), 200 photo links.

Then a live run in Company B (generated data, generated media, after the PDF rule is approved and deployed to staging).

## Found during this review (not part of slice 2)

Display bug in the current Beta (frozen workflow, not fixed): the Deleted Jobs window opens behind the New Project window (z-index 700 vs 850). Restore / Delete forever look greyed out, and a click first hits the New Project backdrop and closes it, so restoring needs two clicks or closing New Project first.

## Status (2 October 2026 recovery point)

- Approved Studio changes applied: restore history (`recordJobLifecycle`, identical to `proposed-restore-history.patch`) and the Deleted Jobs stacking fix (`#deletedJobsDialog{z-index:860}`). Real-click test `tests/deleted-jobs-restore.cjs` (fails on the old code at "Restore is on top"). Studio suite 64/64.
- Slice 2 implemented in `cloud-master/fiq-cloud-copy.js`. Emulator, proposed PDF rules: `cloud-copy-slice2.test.cjs` 12/12, `cloud-copy.test.cjs` 15/15 (adapted to packages), `pdf-media.test.cjs` 15/15, `rules.test.cjs` 242/242, `orphan.test.cjs` 0 unsafe. On the currently deployed rules every slice 2 run with a PDF drawing fails safely (upload refused, no marker): the PDF rule is required.
- Not yet done: PDF rule deploy to staging (command awaiting approval), live Company B run.
