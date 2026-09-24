# Claude progress record

Resume point for the next session. See FittersIQ_Claude_Handover.md (24 September 2026) for background.

## 2026-09-24: Mobile to Studio notes lost after a failed send

Reported by Mads: notes written on the phone do not always reach Studio.

Cause: the Mobile outbox stored the whole hydrated packet, photos included, in localStorage. On any job with photos it went over the ~5MB limit, and setItem failed without any error shown. The phone said "saved, will send automatically" but never retried. Two more gaps: a send cut off by a phone lock or page reload was never retried, and every 2.5s poll started another upload of the same job while a slow one was still running.

Fix, in Mobile-Core.html:
1. The outbox stores only the job id. A retry rebuilds the packet from the saved job, so it always sends the latest notes. Entries in the old format are still read.
2. The job is marked pending before the upload starts.
3. Sends time out after 120s. Only one send per job runs at a time, and a request that comes in during a send runs straight after it.

Test: tests/mobile-send-outbox.cjs. It fails on the old code and passes on the new code. All earlier tests in tests/ and qa/ still pass.

Not yet checked: a real iPhone, and live Firebase.

## Next candidates, in priority order

1. The sync queue in companies/{companyId}/jobs is never cleaned up. Studio re-reads every siteJobPacket document every 30s and on every change. Mobile re-reads every studioToMobilePacket document every 2.5s. The cost and delay keep growing.
2. Every Mobile send uploads all of the job's photos again (offloadMobileMediaForStudio uses a new transferId each time). This is slow on a weak signal.
3. The Studio Site Measure room card (openSiteRoomDetails) shows the notes box and siteNotes, but not jobLog entries.
4. Studio to Mobile notes: not tested by Mads yet.
