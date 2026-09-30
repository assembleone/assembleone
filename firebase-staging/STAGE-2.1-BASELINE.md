# Stage 2.1 baseline: cloud master rules, staging

Accepted by Mads on 30 September 2026. This is the recovery point for Stage 2.1.

## Result

| Test | Result |
| --- | --- |
| Emulator, `rules.test.cjs` (88 master checks + 154 same-answer checks for existing paths) | 242 / 242 |
| Emulator, `orphan.test.cjs` (orphan / misleading file attack, current rules) | 11 / 11 safe (the first rules, kept in `v1-tested/`, were unsafe in 6) |
| Live on fittersiq-staging, `live-rules-test.cjs --run` | 61 / 61 (results in `live-rules-test-results.json`) |

## Projects

| | Project | Status |
| --- | --- | --- |
| Production | `assembleone-fabac` | Untouched. Its rules files in the repo root (`firestore.rules`, `storage.rules`), `firebase.json`, `.firebaserc` and `functions/` code were not changed. |
| Staging | `fittersiq-staging` (project number 974434464573) | Blaze plan, budget alert set by Mads. Firestore `(default)` in eur3. Storage bucket `fittersiq-staging.firebasestorage.app`. Realtime Database `fittersiq-staging-default-rtdb.europe-west1.firebasedatabase.app`, locked (`.read`/`.write` false). |

## Deployed to staging

| What | Version |
| --- | --- |
| Firestore rules | `firebase-staging/firestore.rules`, sha256 `488b996452eec07feaaeda3160280f3d4f9bd9d808c10cff4eee12b2d4735e36`, released 30 Sep 11:19 UTC |
| Storage rules | `firebase-staging/storage.rules`, sha256 `4d5a1c06a8d500021fbededbc3e2c56028b840779b44a8ce4870f6923ab80532`, released 30 Sep 11:19 UTC |
| Storage may read Firestore | `roles/firebaserules.firestoreServiceAgent` on the Storage service agent (attached by Mads in the console) |
| Functions (Node.js 20, 2nd Gen, us-central1, code unchanged from `functions/`) | completeOnboarding, inviteFitter, acceptInvitation, setMemberStatus. Deployed with `firebase.staging-functions.json` from the repo root. |

The staging rules are the Production rules plus one new block each (`fiqMaster` in Firestore, `fiqmaster/` in Storage). Existing paths give the same answers (154 checks).

Rules summary: only an active company owner reads or writes the master; every write is exactly the next version and only from the Studio session holding the editing lock (max 5 minutes, deliberate take-over allowed); job files are `r<rev>-<sha256>.json`, never overwritten or deleted; no deletes of master records; deleted records are frozen until a deliberate owner Restore; no FittersIQ admin access.

## Staging test data

Test sign-ins (passwords only in the git-ignored `.staging-accounts.local.json`), all email-verified by the project owner (the verification emails were not delivered):

| Account | Company | Role |
| --- | --- | --- |
| madsmillereriksen+fiqstage-owner@gmail.com | A: FittersIQ STAGING `AGEO6HnQuj4id29ERJGV` | owner |
| madsmillereriksen+fiqstage-fitter1@gmail.com | A | fitter, active |
| madsmillereriksen+fiqstage-fitter2@gmail.com | A | fitter, suspended |
| madsmillereriksen+fiqstage-other@gmail.com | B: FittersIQ STAGING OTHER `SivhuYsf35ktlq7DXo9H` | owner |

Company A is kept clean for Stage 2.2 (no master data, no files).

Company B keeps the live-test evidence (do not clean up):
`fiqMaster/beta` (switch, rev 1, local), `lease/studio` (expired), `jobs/livetest-job-1` (rev 5), `customers/livetest-cust-1` (rev 2, deleted), `settings/studio` (rev 1), and Storage `fiqmaster/SivhuYsf35ktlq7DXo9H/beta/jobs/livetest-job-1/` r1, r2, r5.

## Open items (not done)

1. Node.js 20 is decommissioned on 30 October 2026, and firebase-functions is outdated: Production functions also run on Node.js 20 and must be upgraded before then (separate stage).
2. Function image cleanup policy in staging not set (small storage cost over time).
3. Staging email delivery is unreliable (first four emails never arrived; the resent link did not verify).
4. Phone pairing functions (createFitterPairingCode, redeemPairingCode) not deployed to staging; they will need permission to create sign-in tokens.
5. Stage 2.2 design review: the job record keeps only its current delete/restore state; delete and restore history must be carried forward by Studio.
6. Beta does not point at staging yet (loader override planned for review).

## Tools in this folder

`rules.test.cjs`, `orphan.test.cjs` (emulator: `npm test`), `live-rules-test.cjs`, `verify-staging-readonly.cjs`, `check-staging-email-readonly.cjs`, `readback-staging-readonly.cjs` (read-only), `create-staging-accounts.cjs`, `mark-verified-staging.cjs` (staging only, already run).
