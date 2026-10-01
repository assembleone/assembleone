# Stage 2.2 slice 1: browser to cloud copy-and-verify (recovery point)

Accepted by Mads on 1 October 2026. Builds on the Stage 2.1 baseline (`8ae3939`, `STAGE-2.1-BASELINE.md`). Staging only; Firebase rules unchanged (same sha256 as the baseline). Not connected to Studio, not published.

## What was built

`cloud-master/fiq-cloud-copy.js`: a standalone module (browser and Node), loaded by no page.

- Input: the browser's saved Studio state (customers, jobs). Read only; the browser stays the master.
- Studio lock first; another computer's active lock stops the run before any write; the same browser installation (device id) may take over its own earlier lock.
- Customers: `fiqMaster/{env}/customers/{customerId}` = `{ rev, data: <customer>, ... }`.
- Jobs: file `fiqmaster/{companyId}/{env}/jobs/{jobId}/r{rev}-{sha256}.json` holding `JSON.stringify(job)` exactly, then the job record (`rev`, `file`, `sha256`, ...) in a transaction that checks the version.
- Never overwritten: cloud tombstones, records last written by another installation, a version that moved on during the run (all reported as conflicts / stale).
- Read-back of every record and file: fingerprint, exact content, ids and QR / piece identities, customer data.
- Verified marker (switch record, mode stays `local`) only after a complete match with no conflicts. `verifiedSha256` = fingerprint of the exact browser snapshot that was verified; `checkVerified(state)` answers whether the current browser state is that one, so an old marker can never verify newer or different data. Every run returns its own attempt record (`verified | failed | incomplete | conflicts`).
- Cloud-only records are reported, never deleted.

Not in slice 1: drawings, photos as separate files, settings, deleted jobs / recycle bin, delete-restore history (slice 2 design).

## Tests

| Test | Result |
| --- | --- |
| Emulator `cloud-copy.test.cjs` (generated data, Stage 2.1 rules) | 15 / 15 |
| Emulator `rules.test.cjs`, `orphan.test.cjs` (unchanged rules) | 242 / 242, 0 unsafe |
| Live `live-cloud-copy.cjs --run`, fittersiq-staging Company B only | 10 / 10 (`live-cloud-copy-results.json`) |

## Staging state after the live test

- Company A (FittersIQ STAGING, `AGEO6HnQuj4id29ERJGV`): unchanged, 6 records, no master data, no files.
- Company B (FittersIQ STAGING OTHER, `SivhuYsf35ktlq7DXo9H`): Stage 2.1 evidence unchanged, plus customers `livecopy-cA`, `livecopy-cS1`, `livecopy-cS2`, jobs `livecopy-job-1` to `-5` (jobs 2, 3, 4 at version 2), 8 job files, marker at run `live-7`.

## Approved decisions

1. Live tests in Company B only; Company A stays clean.
2. One permanent random device id per Studio browser installation.
3. Conflicts are reported, never overwritten; resolution belongs to Stage 2.5.
4. A failed or incomplete run never erases an earlier verified marker, and an old marker can never verify a newer or different browser state.
5. Cloud-only records are reported and left untouched.
