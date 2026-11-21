# How Beta is released, and why it cannot change Production (found 21 Nov 2026 from the repo history)

Confidence: high for the mechanism (read from the committed release scripts and past commits); medium for the exact Beta web address (not fetched; the live sites cannot be reached from Claude's workspace).

## What is where
| Thing | Served from | Updated by |
|---|---|---|
| Production app: `app.fittersiq.com` | Firebase Hosting, project `assembleone-fabac` | `node firebase-staging/prod/deploy-new-home.cjs` on Mads's computer (after `release-app.cjs --publish`) |
| Beta app: `/beta/` folder | GitHub Pages, repo `main` branch: `https://assembleone.github.io/assembleone/beta/Studio.html` (inferred from `release-app.cjs`, which names `https://assembleone.github.io/assembleone/`) | a commit pushed to `main` that changes only `beta/` |
| Staging: `/staging/` folder | GitHub Pages / `fittersiq-staging.web.app` | same idea |

## Why a Beta release cannot touch the live app
- `hosting-production/build.cjs` builds the Firebase app from a fixed list of root pages plus `assets/` and `cloud-master/`. Its own header says: "Left out: staging/, beta/, old backup pages". So `beta/` is never uploaded to `app.fittersiq.com`.
- The Firebase upload only happens when someone runs `deploy-new-home.cjs`. Pushing to `main` does not run it. (No GitHub Action deploys Firebase; the only workflows are test/preview jobs.)
- This branch changes 0 root files. Even if `deploy-new-home.cjs` were run afterwards, the app files would be exactly the 5 Nov ones.
- Past Beta releases (e.g. `41ef314`, `143abbf`, `7ff3ccc`) were `beta/`-only commits on `main`. The 5 Nov Production release was a separate commit (`14c5068`).

## Steps to release Beta (Mads says yes first; nothing has been done)
1. On Mads's computer, in the release repo (AssembleOne-publish): `git fetch`, confirm `git diff --name-only origin/main..claude/studio-estimator-five` lists only `beta/` and `tests/`.
2. Publish: `git push origin claude/studio-estimator-five:main` (a fast-forward; main has not moved since 38e43ca). Do NOT run `release-app.cjs` or `deploy-new-home.cjs`.
3. Wait for GitHub Pages (a build once "never started" on 5 Nov; if the new files are not live after ~10 minutes, re-run the Pages build).
4. Check: `node tests/compare-with-live.cjs https://assembleone.github.io/assembleone` must show "Production files that would change: 0" and no differences outside `beta/`. Then check `app.fittersiq.com` still shows the old Estimator (no red BETA frame).
5. Open the Beta address, look for the red frame and the "LIVE-DATA WRITES OFF" bar. Test with the safe list in `BETA-HOW-TO-TEST.md`.

## Rollback
`git revert <the Beta commits>` and push to `main`. Only `beta/` changes. Production, Firebase Hosting and all company data are not part of it.

## Still unverified
- Whether Beta sign-in works on the github.io address: that domain must be in Firebase Authentication "Authorized domains". My notes list only localhost, assembleone-fabac.firebaseapp.com, assembleone-fabac.web.app and app.fittersiq.com, which may be out of date. If sign-in says "unauthorized domain", stop and tell Claude; adding a domain is a Firebase Console change that needs Mads's yes.
- GitHub Pages terms: the repo's own runbook notes GitHub Pages does not allow a commercial service. Beta there is for testing only.

## Permanent, properly isolated environments (proposal, not done)
Files are already separated (beta/ is never deployed to the app). Data is not: Beta and Staging use the live Firebase project `assembleone-fabac`; only the browser storage is separate, and the Beta write guard blocks writes. For real isolation:
1. Production: `app.fittersiq.com`, project `assembleone-fabac` (unchanged).
2. Staging/Beta: a second Firebase project (`fittersiq-staging` already exists for the Academy) with its own Hosting site, test companies and rules, e.g. `beta.fittersiq.com`. Beta would then be able to write safely, and the write guard becomes a second layer.
3. One release script per environment, each refusing to run if the files do not belong to that environment (the compare script is a first version).
Cost: copying the Firestore rules, test data and Auth setup to that project, and a DNS record for `beta`. I would do this as a separate, approved task.
