# Beta safety: what is safe to test and what could touch real company data

Beta (`/beta/`) separates only the **browser** (its own saved jobs, databases and sign-in cache, prefix `fiqbeta:`). It does **not** separate the **cloud**:
Beta, Staging Studio and Production Studio all use the same Firebase project (assembleone-fabac): the same accounts, the same company data.

## Protection added on this branch: the Beta write guard (`beta/beta-write-guard.js`, Beta only)
With it, a real account signed in on Beta can READ company data but cannot change it. Writes are allowed only to Beta's own backup area
(`companies/{id}/fiqMaster/beta`) and to Custom Sheets (`companies/{id}/estimatorSheets`) **and the Custom Sheets part stays OFF on each Beta computer until you press
"Turn cloud saving ON" in the Custom Sheets screen** (the banner then adds "CUSTOM SHEETS CLOUD ON"). The automatic cloud copy cannot be switched on in Beta (it would bypass the guard). Refused: sending jobs to Mobile, marking phone
updates as received, switching Mobile jobs on/off, team and fitter changes, device approval, price-list admin changes, photo uploads/deletes,
cloud functions. Usage-log, user-record and support-ticket writes are quietly skipped. Beta is unmistakable: red frame around the whole window, red "BETA" tab icon, tab title starting "BETA", and a banner reading "BETA TEST COPY - NOT YOUR NORMAL FITTERSIQ STUDIO - LIVE-DATA WRITES OFF". Normal Studio has none of these. Tested with
fake Firebase functions (`tests/beta-write-guard.cjs`); not yet seen with a real sign-in.

## Safe (local to your browser, even with your real account)
- Customer Library: browsing, opening cutting lists/drawings, the "Back to customer" bar, Saved versions, editing a panel note, reload.
- Estimator: new estimate, changing currency, saving versions, reopening, price list view, duplicate.
- Studio drawing and cutting list screens, scanner design (Mobile Beta page), the left navigation.
- Beta's copy of your jobs: Beta starts with its own empty local data (separate from normal Studio). Test with TEST customers/jobs you create there.

## Reads real company data (does not change it)
- Signing in, loading the company record, the Mobile site-update listener (Studio reads company job packets), the Custom Sheets list.

## Can write real company data (deliberately allowed)
- **Custom Sheets only**, and only after the rule addition is published: add/edit/delete writes to `companies/{id}/estimatorSheets`, visible to every member of the company
  and to Production later. Name test sheets "TEST ...", delete them afterwards. This is the only real-data write on Beta.

## Would be risky WITHOUT the guard (now refused; do not remove the guard)
- Send to Mobile / job writes: fitters' phones would receive test jobs.
- Merging phone updates: Beta would mark real phone updates as received, so Production Studio might never see them.
- Team changes, device approval, photo uploads, support tickets.

## What the guard cannot do
- It is only in Beta. Production Studio has no guard, and the Production site is not touched by this branch.
- It does not hide your real company id or members from you.
- Mobile Beta (`beta/Mobile.html`) is not changed here: the only change is the square scanner guide CSS.

# Final checklist before anything is published (nothing below has been done)
1. [ ] Read `tests/RULES-ADDITION-estimatorSheets.md`. Decide who applies the rule (Console paste only; never `firebase deploy` of the whole file).
2. [ ] In the Console, copy the current live rules to a safe file (rollback). Compare them with the repo's `firestore.rules`; note differences (expected: Academy, fiqMaster, health).
3. [ ] Paste the 11-line block. Run the 4 Rules Playground checks. Publish only if all pass.
4. [ ] Review the branch diff `origin/main..claude/studio-estimator-five`: it should list only `beta/*` and `tests/*`. (`git diff --name-only origin/main..claude/studio-estimator-five`)
5. [ ] Publish Beta: push ONLY the `beta/` folder changes to `main` (Production files at the repo root stay byte-identical; check with `git diff origin/main -- . ':!beta' ':!tests'` showing nothing).
6. [ ] Open Beta, sign in with your account: banner shows "LIVE-DATA WRITES OFF". Run `tests/BETA-TEST-PLAN-custom-sheets-and-library.md` (cloud check, second computer, estimates, Library).
7. [ ] Confirm normal Studio and Mobile still open and your jobs are intact.
8. [ ] Only after all of that, decide about Production. This branch does not contain Production changes; releasing the same fixes to Production is a separate step.
