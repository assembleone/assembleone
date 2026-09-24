# Data lifecycle stage 1: results

Branch `claude/data-lifecycle`. It is built on the unpublished crash fix e54fed3. Not merged, not published. No production cloud data was changed or deleted.

## What changed

### Studio (`Studio-Recovery.html`)

1. **Only new phone messages are read.** Imports, the inbox and the live listener use `kind == siteJobPacket && status == waiting`. The listener's copy of that set is the polling cache, so the 30-second checks cost no cloud reads. Received history is never downloaded in normal operation.
2. **Receipts are version-checked.** A message is marked received inside a transaction, and only if its `exportedAt` is still the version Studio merged. A newer phone send that lands during a merge stays waiting and is merged next.
3. **One message per job to Mobile.** `studio-job-<projectId>` carries `active: true` and is replaced on every send. A transaction stops a queued older send from overwriting a newer one. Commands still use one-off `studio-<syncId>` messages.
4. **The Customer Library and deleted jobs are quiet.** Move to Customer Library, once the whole job is filed, and Delete Job set `active: false` on that job's message. Nothing is deleted. Send to Mobile makes the job live again.
5. **The reset check** reads only `status == broadcast`, not every job ever sent.
6. **Photos and drawings upload once per job.** They are stored by content hash under `companies/{c}/jobs/{job}/media/h/`. An existing file is never overwritten, so saved links keep working.
7. **The open-time backup check** does the full scan only when this browser has no jobs, or once a week.

### Mobile (`Mobile-Core.html`)

1. **One message per job per signed-in phone**, `mobile-<jobId>-<uid>`, replaced on every send instead of one new message per send. Before, every Panel Check scan created a new message.
2. **Photos upload once per job**, by content hash under `.../mobile-media/h/`, and are never overwritten.
3. **Inbox.** Live listeners on `active == true` jobs and `status == waiting` messages. The 2.5-second poll now works from the listeners' copy, with no cloud reads.
4. **Receipts** are version-checked in a transaction, as in Studio.
5. **Waiting for Studio's receipt** uses one listener on this phone's own waiting messages, instead of reading each message every 2.5 seconds.
6. **The open-time backup check** reads only live jobs. It reads everything only when the phone has no jobs, or once a week. A job Studio switched off never comes back to a phone.

Both apps also import `runTransaction`. Mobile also imports `onSnapshot`. Both come from the same Firebase 12.2.1 module already in use.

Every new query uses at most two equality filters (`kind` plus one more field). Firebase serves these without a composite index. `kind + status` was checked read-only against production.

## Compatibility with existing data

- The 73 existing messages stay exactly as they are. Old handled messages are simply no longer re-read.
- The 14 waiting Site Measures are still read, shown and accepted exactly as before.
- A phone running the old Mobile still reads the new per-job messages, which have the same shape. Its costs stay high until it loads the new Mobile.

## Measurements

These use the fake cloud in `tests/perf-lifecycle.cjs`, seeded with the history the old sync leaves: 3 phone messages and 2 dispatches per job, all handled. There are 10 active jobs and N Customer Library jobs. "Before" is e54fed3, the current code with the crash fix. Idle means signed in and not touching anything.

| Per minute while idle | Before, N=20 | After, N=20 | Before, N=2,000 | After, N=2,000 |
| --- | --- | --- | --- | --- |
| Studio documents read | 614 | 5 | 37,111 | 5 |
| Studio downloaded | 1.72 MB | 0 | 107 MB | 0 |
| Studio writes | 0 | 0 | 0 | 0 |
| Studio JS memory | 10 to 11 MB | 6 to 9 MB | 192 to 296 MB | 18 to 21 MB |
| Phone documents read | 1,464 | 0 | 4,021 once, then stalled | 0 |
| Phone downloaded | 4.08 MB | 0 | 11.5 MB once | 0 |
| Phone writes | 0 | 0 | 718 (pulling Library jobs onto the phone) | 0 |

The 5 Studio reads a minute are the reset check: one small query about every 12 seconds, with no documents.

| Open-time backup check, N=2,000 | Before | After |
| --- | --- | --- |
| Studio, first open | 6,030 docs, 17.5 MB | 6,030 docs, 17.5 MB (runs once) |
| Studio, later opens | 6,030 docs, 17.5 MB every time | 0 |
| Phone, first open | Every job ever sent (4,021 docs) | 4,021 docs (runs once) |
| Phone, later opens | Every job ever sent, every time | 1 doc (live jobs only) |

In the lifecycle test, idle for 35 seconds after Move to Customer Library: Studio made 2 empty queries and downloaded 0 bytes. The phone made 0 queries and downloaded 0 bytes. There were no writes on either side.

On the real account, measured with the crash fix, not with this branch: memory was 22 to 63 MB over 75 minutes. With this branch the idle downloads also fall to zero. Measuring this branch on the real account, read-only, is the next check before any release.

## Tests

| Test | Covers |
| --- | --- |
| `tests/lifecycle.cjs` (new) | Real Studio and Mobile pages through a Firebase-like fake cloud. Site Measure arrives and waits, also after refresh, and one message per Site Measure. A Job Overview job goes Studio to Mobile with its Cutting List, and a resend replaces the message. Panel Check, damaged with photo, missing and a note with photo come back to Studio, with one message for several sends. An update sent during Studio's merge is kept and confirmed. An update sent while Studio was closed arrives after reopening. Move to Customer Library switches the job off, Mobile removes it, nothing is deleted. 35 seconds idle show no downloads or writes. Opening the Library job shows its Cutting List, statuses, drawing and notes, with no cloud reads or writes, and does not reactivate it. Delete Job switches that job off and leaves every other message and file unchanged. The waiting Site Measure is untouched and can still be accepted. Recovery: a lost Studio gets jobs back, a normal open skips the full scan, a new phone gets live jobs but not Library or deleted jobs, and a normal phone open reads 1 document. Photos and drawings are uploaded once. |
| `tests/perf-lifecycle.cjs` (new) | The measurements above. Run with `ROOT=<checkout>` to measure another version. |
| `tests/helpers/fake-cloud.cjs` (new) | The metered Firebase stand-in: equality queries, change-only listeners, transactions, server timestamps, Storage. |
| `tests/sync-roundtrip.cjs` (updated) | The phone now writes its per-job message, and no message per send. |
| `tests/studio-sync-loop.cjs` (updated) | Its fake now applies every query filter and tells listeners about new messages, like Firebase. |
| All other existing tests | Pass unchanged: Cutting List and Customer Library, dot deletion, Mobile send outbox, site job switching, Panel Check, sync outbox, Studio workspace, viewport, floors, job cards. |

## Remaining risks and limits

1. **A Customer Library of thousands of jobs does not fit in Studio's browser storage.** The 5 MB `localStorage` copy overflows at about 2,000 full jobs. This is today's design, not this change. The permanent cloud record (stage 2) is the fix.
2. **Several Studio browsers** each keep their own local data, as today. A message received by one Studio is picked up by another only through its weekly or empty-browser full scan.
3. **Two phones signed in to the same account** would share one per-job message per direction. Each still applies only newer versions. Separate fitter accounts each get their own message.
4. **Old messages** stay in the cloud until a cleanup stage is approved. They are no longer read in normal operation.
5. **Phones only save costs once they load the new Mobile.** The loader fetches the core fresh on every open, so this should follow publishing quickly.
6. **Not yet checked:** this branch on the real account, a real phone camera, and several fitter accounts at once.
