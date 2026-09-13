# Sync repair validation status

Reconstructed from main aa202768b6b8c1078ccd6eda9b8145cfb99e8208 after the previous local worktree became unavailable.

## Completed checks

GitHub Actions run 34754529149 passed on commit fb4188fc8bfcd3ebe342ad01e53b4fae0e326f5d:
https://github.com/assembleone/assembleone/actions/runs/34754529149

The actual Studio and Mobile transport/merge functions pass an isolated round trip with job data, panel progress and photo notes. Tests cover received-history recovery, duplicate polling, stale updates, local save failure and retry, fitter access, reset/deletion filtering, Site Measure review and explicit acceptance, media arrays and stable retry document IDs.

The real Chromium outbox test passes: offline send persists in IndexedDB, a 2 MB photo survives page reload, another company cannot send the pending data, successful retries leave the queue, and deleted jobs are not resent.

All 70 inline scripts in both app cores and loaders parse. Git diff whitespace checks pass.

## Scope

The repair removes the retired RTDB read from Mobile polling, recovers company packets regardless of another session acknowledging them, preserves newer job details when late notes arrive, keeps Site Measures available for explicit acceptance, and persists Studio sends for automatic retry. Array photos upload correctly and uploaded media gets a separate path per transfer.

The Cutting List heading and softer Download CSV styling already exist on the base commit and are preserved.

## Release boundary

The branch is not merged or deployed. The user previously instructed not to merge or publish. Automated review also rejected creating a draft pull request under that instruction; no pull request was created.

Authenticated production Firebase Storage/Firestore delivery, actual app loader/UI behaviour and separate-session receipt confirmation remain to be verified. Automated tests use generated data and isolated transport; their success is not proof that the production connection has been fixed. The live Studio page loaded and a sign-in succeeded earlier, but that browser session subsequently reset. A fresh secure sign-in is required for live checks.

No existing customer records were modified by these tests.
