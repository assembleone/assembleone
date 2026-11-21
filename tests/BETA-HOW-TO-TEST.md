# How to open Beta and test it with your real account (simple steps)

**Do not do this until the checklist in `BETA-SAFETY-AND-RELEASE-CHECKLIST.md` says Beta has been published.** Nothing has been published yet. The Beta address below is inferred, not verified: if it shows a 404, Beta has not been released or the address differs.

## 1. Open Beta (and know you are in Beta)
- Open the address you normally use for Studio, then change the last part: where it ends `Studio.html`, make it end `beta/Studio.html`.
  (I could not confirm your exact web address from the files. If your Studio address is `https://SOMETHING/Studio.html`, Beta is `https://SOMETHING/beta/Studio.html`.)
- You are in Beta if you can see ALL of these: a **red frame around the whole window**, a red bar at the top saying **"BETA TEST COPY ... LIVE-DATA WRITES OFF"**, a **red BETA icon** on the browser tab, and a tab title starting **"BETA"**. If you do not see them, you are NOT in Beta: close the tab.
- Bookmark Beta with the name "FittersIQ BETA" so you never type the address.

## 2. Sign in
- Use your real account. Beta can read your company but cannot change it (except Custom Sheets, see step 4).
- Beta starts EMPTY on this computer: your normal Studio jobs are not copied into it. Create TEST customers and jobs for the tests, with names starting "TEST".

## 3. Safe tests (nothing leaves this computer)
1. **Estimator and currencies:** open a TEST job, Estimate, New estimate. Change the currency (EUR, GBP, USD, DKK, SEK, NOK, CHF). Prices and totals change their symbol only, the numbers stay the same. Save the estimate, close it, reopen it: same currency.
2. **Customer Library:** open Customer Library, the TEST customer, then press the job's **Cutting List** button. You land on the real job's Cutting List; a bar at the bottom says "Back to <customer>". Press **Drawing** in the left menu: your drawing. Press the bar: you are back on the same customer. Reload the page while on the job: you land on the same place and the bar is still there.
3. **Square scanner:** open Beta Mobile the same way (`beta/Mobile.html`) on a phone and open the scanner: the frame is square.
4. **Left menu:** no "Studio" word under Academy (Beta itself has no Academy button yet; Production does).

## 4. Custom Sheets in the cloud (only after the rule has been added and checked)
1. Estimator, Price list, **Custom sheets**. The yellow line says cloud saving is OFF.
2. Press **Turn cloud saving ON (this Beta computer)**, confirm. The banner adds "CUSTOM SHEETS CLOUD ON".
3. Press **Test company cloud**: you want "Write OK / Read OK / Delete OK". If it says permission-denied, the rule has not been added yet: stop, turn cloud saving OFF.
4. Add **TEST Standard** 2800 x 2070 and **TEST Large** 3050 x 1300. Open another computer, open Beta, sign in with the same account, turn cloud saving ON there too: both sheets appear.
5. Edit and delete on one computer; check the other. Delete both TEST sheets at the end.

## 5. If anything looks wrong
Close the Beta tab. Tell me what you pressed and what you saw. Normal Studio and Mobile are unaffected by Beta.
