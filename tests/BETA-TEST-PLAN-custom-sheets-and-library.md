# Beta test plan: Custom Sheets (real company account) and Customer Library

Do not publish anything to Production. Beta shares the live Firebase project, so Custom Sheets made on Beta are real company data:
**start every test sheet name with "TEST"** and delete them afterwards.

## Before you can test Custom Sheets in the cloud
Read `RULES-ADDITION-estimatorSheets.md` (exact block, where it goes, Rules Playground checks, rollback) and `BETA-SAFETY-AND-RELEASE-CHECKLIST.md`.
Never deploy the whole `firestore.rules` file. Beta has a write guard: only Custom Sheets can be written to the live company; sending jobs to
Mobile etc. is refused on Beta by design. Start every test sheet name with "TEST" and delete them afterwards.

## A. Cloud check (computer 1, Beta, signed in with the company account)
1. Estimator, Price list, Custom sheets, press **Test company cloud**. Expected: Signed in yes, your company id, Write OK, Read OK, Delete OK.
   "permission-denied" means the rule is not published yet.
2. Add "TEST Standard" 2800 x 2070 and "TEST Large" 3050 x 1300. Status line should say "Saved in your company cloud".

## B. Second computer
3. Open Beta on another computer (or another browser profile), sign in with the same company account.
4. Open Estimator, Custom sheets: both TEST sheets appear within a few seconds.
5. Edit "TEST Large" to 3050 x 1320 on computer 2. On computer 1 reopen Custom sheets: shows 1320.
6. Delete "TEST Standard" on computer 1; on computer 2 reopen Estimator: it is gone.
7. Sign in as a user of a DIFFERENT company (if you have one): no TEST sheets visible.

## C. Estimates
8. New estimate, choose a saved sheet in the sheet settings: length/width fill in. Save the estimate, then delete the saved sheet: the estimate keeps its size.
9. Change the estimate currency to GBP, save, close, reopen: still GBP. An older estimate still shows EUR.

## D. Customer Library
10. Customer Library, open a customer, press a job's **Cutting List** button: the real job opens on its Cutting List, with the bar "Back to <customer>" at the bottom.
11. Press Drawing (left menu): the original drawing is there. Change a note, press the bar: back on the same customer card.
12. Click the job row, then **Saved versions**: the sent copy opens read-only. **Cutting List** there opens the live list.
13. Reload the browser while on the job: you land on the same job, and the bar is still there.
14. Check a customer with several jobs and a job with two wardrobes in one room: each Cutting List button opens its own unit.

Report anything that differs, with the customer/job name and what you pressed.
