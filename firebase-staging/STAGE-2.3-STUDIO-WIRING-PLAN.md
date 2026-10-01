# Stage 2.3: connecting the proven cloud copy to Studio (plan for review)

Builds on Stage 2.2 slice 2 (`f184851`). Design and tests only; nothing connected yet. The browser stays the master. Not cloud master. No Production change, no normal Beta publication, Company A stays clean until a separately approved rehearsal.

## 0. Prerequisite: a Studio that talks to the staging project

Beta Studio today uses the **Production** Firebase project (`assembleone-fabac`). The copier must never run against it. Proposal (smallest, keeps normal Beta exactly as it is):

- One-line change in the Studio core (and the same in the Mobile core): `const firebaseConfig = window.FIQ_FIREBASE_CONFIG || { ...today's settings... };` Without the override everything behaves exactly as today.
- New **staging loaders** `staging/Studio.html` and `staging/Mobile.html`: same loading as Beta, but they set `window.FIQ_FIREBASE_CONFIG` to the fittersiq-staging settings and use their own browser storage prefix `fiqstaging:` (so staging data can never mix with Beta's `fiqbeta:` or normal Studio data).
- Only the staging loader adds the cloud-copy script. Normal Studio and normal Beta never load it.
- Tested locally first (staging allows `localhost` sign-in); publishing the staging pages is a separate approval.

## 1. Where the code lives

- `cloud-master/fiq-cloud-copy.js`: the proven module, unchanged.
- New `cloud-master/studio-cloud-copy.js`: the small adapter, loaded only by the staging loader. It imports the Firebase functions it needs itself (same Firebase 12.2.1 files Studio already uses) and uses Studio's existing app instances (`window.fiqFirestore`, `window.fiqStorage`). **No change to any frozen workflow code.**

## 2. Gathering the data (read-only, already proven)

One call: `window.fiqBuildBackup()` (Stage 2.0, read-only, tested). It returns exactly the copier's input:

- `savedState`: the saved Studio data (customers, jobs, recycle bin, deleted ids, delete/restore history, units, fitters, ...);
- `drawings`: every IndexedDB drawing with its key `jobId:unitId`, type and name;
- `settings.values`: the durable setting keys.

Nothing in Studio is changed or wrapped to do this. Mobile photo links are fetched only from the staging bucket; Production links are never fetched (they stay "pending", as proven).

## 3. Device id (one per Studio browser installation)

- Created the first time cloud copy is enabled in that browser: `crypto.randomUUID()`, stored in browser storage key `fiq_device_id_v1` (inside the staging prefix).
- Never part of the backup file, never sent anywhere except as the writer id on cloud records.
- If the browser is wiped, a new id is created. Cloud records written by the old id then show as "changed by another computer" (conflicts) until the Stage 2.5 review screen exists. **Decision needed (D3).**

## 4. The Studio lock

- Taken **only for a copy run**, not for the whole Studio session (the browser is master; editing is still protected by the Stage 1 tab lock).
- Take: at the start of each run. Free or expired lock: taken. Held by this same installation (earlier run, reload, crash): taken over on purpose. Held by another installation: the run does not start; status "Waiting: Studio is copying on <computer>"; retried later.
- Renew: every 60 seconds during a run (lock lasts 3 minutes).
- Release: at the end of every run, success or failure (set to expire in 10 seconds; the rules do not allow deleting it).
- Only the editing tab ever copies (Stage 1 role `editor`); a read-only tab never does. No copy while a backup restore is running (`fiqEditor.restoring`).

## 5. When copying happens

Phase A (first): **manual only**: "Copy to cloud now" and "Check cloud copy" in the Data safety window.

Phase B (after review of A): automatic, in the editing tab only:

- on Studio open, once signed in as the company owner (after the editor role is confirmed);
- after changes: when the save status returns to "Saved" (watched through the existing status chip, no Studio change), wait 2 minutes without further changes, then copy; at most one run every 10 minutes while working;
- when the internet comes back (`online` event), and on a retry timer after failure (2, 5, 15, 30 minutes);
- never in parallel: one run at a time.

**Decision needed (D2):** start with phase A only, and the timings above.

## 6. What the user sees (small, next to the existing save chip)

The existing chip and its texts stay exactly as they are. One extra small line or icon shows the cloud state:

| State | Shown | Meaning |
| --- | --- | --- |
| Verified | ☁ Verified | Cloud has the latest saved data and all its media (marker matches this exact browser state) |
| Copied | ☁ Copied · photos pending | Latest job data copied, some media not owned yet (incomplete) |
| Not copied yet | ☁ Changes not copied yet | Saved data differs from the last verified copy |
| Copying | ☁ Copying… | A run is in progress |
| Conflict | ☁ Needs review | Something in the cloud was changed by another computer or deleted there; nothing was overwritten |
| Offline | ☁ Offline · will copy later | No internet; nothing lost, the browser has everything |
| Waiting | ☁ Waiting for another computer | Another installation holds the lock |
| Failed | ☁ Not copied · will retry | Last run failed (reason in Data safety) |
| Off | (nothing shown) | Cloud copy not enabled in this browser |

Clicking it opens the Data safety window.

## 7. Data safety window

The existing parts (save status, Download full backup, Data Doctor, Restore from backup file, storage protection line) stay as they are. A new section "Cloud copy (staging)":

- current state (table above), last verified run and time, last attempt and outcome;
- counts: customers, jobs, deleted jobs, drawings, photos owned / pending, settings, orphan drawings;
- lists: conflicts, pending photos, problems from the last check;
- buttons: Copy to cloud now, Check cloud copy (read-only verify), Turn cloud copy off for this browser.

The latest attempt (outcome, time, counts) is kept in browser storage `fiq_cloud_last_attempt_v1` (not in the backup), so an old verified marker is never shown as current.

## 8. Close, crash, no internet

Proven in slices 1 and 2; nothing new is needed in the copier:

- Studio closed or crashed during a run: the browser data was never touched; the lock expires (3 minutes) or is taken over by this same installation on the next open; files already uploaded are reused; no marker was written, so the state shows "Changes not copied yet" until the next run verifies.
- Internet lost during a run: the run fails, no marker; state "Offline"; retried on `online` and on the retry timer.
- Saving during a run: the run copies the snapshot taken at its start; later changes are picked up by the next run; "Verified" is only shown when the marker matches the current saved data.

## 9. Turning it off and rolling back

Immediately, in three independent ways:

1. **This browser**: "Turn cloud copy off" in Data safety (flag `fiq_cloud_copy_enabled_v1`; off by default).
2. **Remote kill switch for the whole company**: a field `fiqCloudCopy: "off"` on the company record (writable by the owner under the existing rules, no rule change); checked before every run, so all computers stop at their next run. **Decision needed (D4).**
3. **Code**: remove the one script line from the staging loader (normal Studio and Beta never had it).

Rolling back loses nothing: the browser was always the master and was never changed by the copy; the cloud copy simply stops being updated.

## 10. Tests before anything is connected

Emulator (Firestore, Storage and Auth emulators) with the real Studio page loaded through the staging loader in test mode:

1. Flag off: no network calls to the master at all; Studio behaves exactly as now.
2. Manual Copy now: verified; status "Verified"; browser storage byte-identical before and after.
3. A save after a verified copy: status "Changes not copied yet"; Copy now: verified again.
4. Read-only second tab: never copies; restore in progress: no copy.
5. Lock held by another installation: "Waiting", nothing written; free again: copies.
6. Internet off during a run (emulator stopped / requests blocked): "Offline", no marker; back online: retried and verified.
7. Tab closed mid-run, reopened: the run completes, files reused, verified.
8. Production-style link: "Copied · photos pending", never fetched.
9. Conflict (record written by another installation): "Needs review", nothing overwritten.
10. Kill switch on: no run starts; off again: runs.
11. Phase B timing: a burst of edits makes one run after the quiet period, never parallel runs.
12. Performance: copying 40 jobs / 80 drawings does not block typing (no long main-thread pauses).
13. Full Studio regression suite (64 tests) through the normal loader and through the staging loader with cloud copy off and on.

Then, with approval: the staging pages published at a separate address, and a realistic rehearsal in Company A.

## 11. Proposed steps (each approved separately)

- 2.3a Config override line in the cores + staging loaders (local only), tests 1 and 13.
- 2.3b Adapter with manual copy, status and the Data safety section (flag off by default), tests 2 to 10, 12, 13.
- 2.3c Automatic copying (phase B), test 11.
- 2.3d Publish the staging pages at their own address; Company A rehearsal plan.

## Decisions needed

- D1. Separate staging pages (recommended) instead of switching normal Beta to staging.
- D2. Manual copying first; then automatic with the timings in section 5.
- D3. A wiped browser gets a new device id; until Stage 2.5 its older cloud records show as "Needs review".
- D4. Company-wide kill switch as a field on the company record.
- D5. Cloud status shown as a small extra line next to the existing save chip.
