# Unfinished two-way sync repair

Reconstructed on 2026-09-13 from main aa202768b6b8c1078ccd6eda9b8145cfb99e8208 and the prior conversation. The disconnected local worktree was unavailable. This is reconstructed work, not a recovered original commit.

Do not merge or publish without completing browser and authenticated cloud verification.

Changes: remove the retired shared RTDB read that could block Mobile company polling; recover received packets with timestamp and note deduplication; respect current fitter assignments and reset/deletion history; preserve newer job details when old notes arrive; save received data before acknowledgement; keep reviewed Site Measures available for explicit acceptance; upload array photos and preserve immutable media URLs; persist Studio sends in a company/account-scoped IndexedDB outbox with automatic retries and stable Firestore document IDs.

Validation completed: node tests/sync-roundtrip.cjs exercises actual app transport and merge functions against an isolated in-memory Firebase adapter. It passes Studio to Mobile to Studio with panel status and photo notes, received history, duplicate polling, stale updates, local save failure and retry, fitter access, reset/deletion filtering, Site Measure review and acceptance, media arrays and stable retry document IDs. All 70 inline scripts in both cores and loaders parse, and git diff --check passes.

Browser outbox test: tests/sync-outbox.cjs is prepared but has not yet run successfully. Playwright is available in the working runtime, but Chromium is missing and its download timed out. This test must pass with a real browser before release. It covers a queued 2 MB photo, page reload, account isolation, retry cleanup and deletion.

Still required: run the browser outbox test; exercise the actual app loaders and UI; verify authenticated Firebase Storage/Firestore round trips on separate sessions, receipt delivery, offline recovery and existing customer/room linking. Simulated cloud tests do not prove production authentication or network delivery.

The Cutting List heading and softer Download CSV styling already exist on the base main commit; they were preserved. No customer data was accessed or changed by the isolated tests.
