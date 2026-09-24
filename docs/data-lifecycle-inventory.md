# AssembleOne data lifecycle and sync: inventory and proposal

Prepared 24 September 2026 on branch `claude/data-lifecycle`, which starts from the unpublished crash fix e54fed3. No code was changed for this document. No production data was changed.

The cloud numbers below come from read-only queries on the owner account.

## 1. Where the data lives today

### 1.1 Permanent project data

There is no permanent project record in the cloud.

Every job lives in the Studio browser, and only there:

| Where | What |
| --- | --- |
| `localStorage["buildSOS_v12"]` | The whole Studio state without drawings |
| IndexedDB `assembleone_stable_v1` | Drawings, plus a full state snapshot |

That browser state holds the customers, the Job Overview jobs, the Customer Library jobs, the Cutting Lists, the Site Measures and the local recycle bin (`state.deletedProjects`, 30 days).

Mobile keeps its own copy of each job in the phone's localStorage and IndexedDB.

The Customer Library is therefore only as durable as that one Studio browser. The only copy anywhere else is the transfer messages described below. Studio already uses them as a recovery net: `recoverAllCompanySiteJobs()` runs on every Studio open, and `recoverAccessibleCompanyJobs()` runs on every Mobile open.

### 1.2 Cloud records

All sync messages share one Firestore collection, `companies/{companyId}/jobs`. A `kind` field separates them.

| Record | Written by | Document id | Contents | Status values | Read by |
| --- | --- | --- | --- | --- | --- |
| Mobile to Studio: Site Measure or installation update | Mobile `sendPackDirectly`, which does `addDoc` on every send, including every Panel Check scan | Random, a new document each time | A full copy of the job | `waiting`, then `received` once Studio acknowledges | Studio: the import every 30s, the live listener, the inbox painter every 30s, recovery on open. Mobile: `checkPendingStudioReceipts` reads one document by id. |
| Studio to Mobile: job dispatch | Studio `sendPackToPhoneDirectly`, one `setDoc` per send | `studio-<syncId>`, a new document each send | A full copy of the job | `waiting`, then `received` | Mobile `mobileInboxPackets` every **2.5s**, reading all of them. Mobile recovery on open. Studio `checkCompanyReset` every ~12s, reading all of them. |
| Studio to Mobile: `move-to-library` command | Studio, on Move to Customer Library | New document | Ids only | `waiting`, then `received` | Mobile inbox poll |
| Studio to Mobile: `reset-all-test-data` command | Studio, on Clear all test data | New document | Ids only | `broadcast` | Studio `checkCompanyReset`, Mobile inbox poll |
| Acknowledgements | Both apps, by `updateDoc` of `status`/`receivedAt` on the message itself | Not a separate record | | | |
| Photos and drawings, Mobile to Studio | Mobile `offloadMobileMediaForStudio`, on **every send** | `companies/{c}/jobs/{jobId}/mobile-media/{transferId}/...`, with a new transferId every time | Image files | | Anyone holding the URL. Studio stores these URLs inside its local jobs, so they are part of the permanent record. |
| Photos and drawings, Studio to Mobile | Studio `offloadHeavyMediaForMobileSync`, on every send | `companies/{c}/jobs/{jobId}/media/{transferId}/...`, with a new transferId every time | Image files | | Mobile, through the URLs |
| Legacy Realtime Database paths `studioInbox/`, `sync_v3/...` | Old Mobile code | | | | Superseded. `window.sendPackDirectly` and the a201 receiver replace them. |

Company, members, fitters, devices, invitations and licences are account data. This work does not touch them.

### 1.3 What is in the cloud now

The "Clear all test data" button emptied the cloud on 11 September. These counts are from 24 September.

| | Documents | Size |
| --- | --- | --- |
| Mobile to Studio, received | 44 | 4.17 MB |
| Mobile to Studio, waiting (all are Site Measures not yet accepted, 11 to 24 Sep) | 14 | 0.05 MB |
| Studio to Mobile, received | 12 | 1.75 MB |
| Commands (move-to-library ×2, reset ×1) | 3 | ~0 |
| **Total** | **73** | **5.98 MB** |

Other findings:

1. The 73 documents refer to 18 jobs. One job alone has 24 messages from 13 days.
2. 16 documents still carry inline base64 photos.
3. Storage holds 78 files: 39 Mobile to Studio and 39 Studio to Mobile. The most for one job is 24. Listing them took 29s.

At this rate a normal working year produces thousands of messages and files. The number grows with every scan and every send, not with the number of jobs.

### 1.4 Background cost today

| Loop | Interval | What it reads | Grows with |
| --- | --- | --- | --- |
| Studio `autoImportSitePackets` | 30s, plus every live event | All Mobile to Studio documents, including received ones | Lifetime messages |
| Studio `paintSiteInbox` | 30s | All Mobile to Studio documents again | Lifetime messages |
| Studio live listener | Continuous | All Mobile to Studio documents, held in memory | Lifetime messages |
| Studio `checkCompanyReset` | ~12s | All Studio to Mobile documents, only to find one reset command | Lifetime sends |
| Mobile `mobileInboxPackets` | **2.5s** | All Studio to Mobile documents | Lifetime sends |
| Studio and Mobile recovery | Once per open | All documents of the other direction | Lifetime messages |

Measured on the fixed build: Studio made about 8.5 full downloads a minute while idle (638 in 75 minutes). With 58 documents that is roughly 16 MB a minute of repeated history.

### 1.5 Delete Job today

`deleteProjectRecord()` removes the job from `state.projects`, keeps a full copy in the local recycle bin (restore is possible for 30 days), and records the id in `state.deletedProjectIds`. It does nothing in the cloud. The job's messages and Storage files stay forever. The only cloud cleanup is "Clear all test data", which deletes **everything** in the company.

## 2. Proposal: the smallest safe change

The target: **Mobile to Studio can arrive and wait. Job Overview is live. Customer Library is permanent and quiet. Delete Job cleans up.**

### 2.1 Read only what is new (Studio)

1. The Studio import, the live listener and the inbox painter read only `kind == siteJobPacket && status == waiting`. This two-equality query was tested read-only on production and works with no extra Firestore index.
2. `checkCompanyReset` reads only `kind == studioToMobilePacket && status == broadcast`.
3. The once-per-open recovery pass stays, as the safety net for a lost or cleared browser. After section 2.4 it reads a bounded set.
4. Nothing already processed is downloaded again every 30 seconds.

Multi-tab safety: today Studio also re-reads received messages, in case another Studio tab acknowledged a message this tab never merged. The recovery pass on open, plus the existing cross-tab `storage` event, still cover that case. The details are for review.

### 2.2 Job Overview is the only live set (Studio to Mobile)

1. Studio to Mobile uses **one document per job**, overwritten on each send: `studio-job-<projectId>`, with an increasing `revision`, instead of one new document per send.
2. Moving a job to the Customer Library already sends a `move-to-library` command. The job's live document then gets `active: false`.
3. Mobile's 2.5s poll reads only `kind == studioToMobilePacket && active == true`, plus waiting commands.
4. Compatibility: phones that have not updated yet read every document and take the newest per job. That still works, because the per-job document has the same shape.

### 2.3 The Customer Library is quiet

1. Library jobs keep all their data in Studio exactly as now: Cutting List, drawings, Site Measure, photos, notes and Panel Check.
2. Opening one only reads local data and never sends anything.
3. Library jobs are no longer part of any background loop. Their Studio to Mobile document is `active: false`, and their Mobile to Studio messages are received, so neither query returns them.
4. Making a Library job active again stays an explicit action, and it goes out with the next Send to Mobile.

### 2.4 Clean up finished transport messages

A Mobile to Studio message may be removed once all three are true:

1. It is `received`.
2. Studio has saved the merge durably.
3. A newer received message for the same job exists.

The newest received message per job is kept, because it is the only cloud copy of that job (see section 1.1).

Studio to Mobile needs no cleanup after section 2.2, because each job has one document that is overwritten. The old one-per-send documents are removed once a job's per-job document exists and the phone has acknowledged it.

Waiting Site Measures are **never** removed by cleanup. They wait for acceptance exactly as now.

Commands are removed after acknowledgement. The reset broadcast is kept until the next reset.

Storage files are **not** removed by routine cleanup. Studio's saved jobs contain their URLs, and a URL cannot be proven unused without scanning every saved job. Section 2.5 handles them for deleted jobs.

### 2.5 Delete Job cleans up that job only

1. When the owner deletes a job, Studio immediately removes the transport messages of **that job id only**: Mobile to Studio, the Studio to Mobile document or documents, and its commands. Every delete is keyed by `project.id`, and never by name, customer or date.
2. Photos and drawings under `companies/{c}/jobs/{jobId}/...` belong to exactly one job, because the path contains the job id. They are removed only when the job leaves the recycle bin: "Delete forever", or the 30-day expiry. Until then, Restore must still show the photos.
3. Cleanup runs only from the owner's explicit Delete. There is no automatic detection of test jobs.

### 2.6 Performance target

Steady-state background reads depend on the number of waiting messages and active jobs, not on the Customer Library size:

| | Today, per minute, idle | Proposed, per minute, idle |
| --- | --- | --- |
| Studio | Full history × ~8.5 | Waiting messages only × ~2, plus the reset check with 0 to 1 document |
| Mobile | All dispatches × 24 | Active jobs × 24 |

With 10 active and 2,000 Library jobs, Studio's idle reads are the same as with 10 and 20. The once-per-open recovery pass reads one document per job, so about 2,000 on open. That is a one-time cost, not a continuous one. Section 3 has an option to reduce it too.

## 3. Decisions and risks to review before building

1. **No permanent cloud record.** The Customer Library exists only in one Studio browser. If that browser's data is cleared, or Studio moves to a new PC, the only way back is the transfer messages. So cleanup must keep the newest message per job, and that limits how far history can be trimmed. A real permanent store would fix this properly. Examples are `companies/{c}/projects/{id}` in Firestore, or a snapshot file per job in Storage. That is a separate, larger change. **Recommendation:** keep this task to transport cleanup that always keeps the newest copy per job, and plan the permanent record next.
2. **Mobile needs an update** for section 2.2, because its 2.5s poll must change. Old phones keep working, but the full saving only arrives once phones load the new Mobile.
3. **The recovery pass on open** still reads one document per job. Reducing that needs an incremental cursor, which needs a Firestore composite index (`kind` + `createdAt`). An index is an additive production change and needs a deploy by someone with Firebase access. **Recommendation:** not in this task.
4. **Existing data.** The first run of cleanup would remove about 40 of today's 73 documents: older received copies per job, and acknowledged commands. It keeps the newest per job and every waiting Site Measure. This is a production data change. It is proposed for after approval and publishing, never during development.
5. **Several Studio tabs or PCs** at once are only partly covered by the current design. The proposal keeps today's behaviour, where each browser has its own local data. It does not make multiple Studio PCs share one Library.

## 4. Test plan (automated, fake cloud that behaves like Firestore)

1. A new Site Measure goes Mobile to Studio and waits. A refresh keeps it. Acceptance works as now.
2. A Job Overview job goes Studio to Mobile through one per-job document. A resend overwrites it, with a higher revision.
3. A Mobile update to that job returns to Studio. An update arriving while Studio is processing an earlier one is not lost.
4. After Move to Customer Library, the job is `active: false`, and Mobile's poll and Studio's background loops no longer read it.
5. A Library job still opens, with its Cutting List, drawing, photos, measurements and notes. Opening it writes nothing to the cloud and does not make it active.
6. Delete Job removes that job's messages only. A second job, and another customer's job, keep every message and file. Photos go only on "Delete forever". Restore within 30 days still shows the photos.
7. Cleanup keeps the newest received message per job and every waiting Site Measure.
8. Refreshing Studio does not lose unprocessed Mobile updates.
9. Scaling: with 10 active and 2,000 Library jobs in the fake cloud, idle background reads over 5 minutes are the same as with 10 and 20.
10. The existing tests still pass: dot deletion, Cutting List, Customer Library, Mobile outbox, round trip, Panel Check and the sync loop.

Before any release, the numbers are measured again against the real account, read-only, in the browser pane.
