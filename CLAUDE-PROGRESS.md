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

## 2026-09-24: Remove a wrongly placed dot in Studio

Mads asked for a way to remove a dot that is in the wrong place on the drawing.

1. Clicking a dot selects it and shows a Remove dot button next to it (openPinMenu).
2. Remove dot clears only the position: x/y become null for the main dot, and a repeated dot is taken out of copies and counted in part.unplacedCopies. The panel, its measurements and its quantity stay in the Cutting List.
3. With that panel selected, the next click on the drawing puts the dot back (createPartAt checks this first). A normal click still creates a new panel.
4. The cause of new dots appearing under a clicked dot: any mouse wobble during a click counted as a drag and redrew the dots. A drag now only starts after 5px of movement, and the click that ends a drag is ignored.
5. hasMarkPosition() is used in every Studio drawing view. Mobile renderInstall skips unplaced dots.

Test: tests/studio-dot-remove.cjs. tests/studio-workspace.cjs now also loads hasMarkPosition.

## 2026-09-24: Delete dot replaces Remove dot (not live yet, behaviour confirmed, publish not approved)

Mads replaced the earlier instruction. Deleting a dot now deletes the panel.

1. The dot menu offers Delete dot (deletePanelDot). If it is the panel's only dot, the panel and its measurements are deleted after a confirmation, and the unit is renumbered P-001..P-n with no gaps (deletePanelAndRenumber, also used by the Delete panel button).
2. Rule confirmed by Mads: one dot is one physical piece. Deleting a dot lowers the row quantity by one and refreshes the review stamp, so the row stays on the Cutting List. The row is deleted only when its last piece goes. A row with a typed quantity higher than its dots keeps its remaining pieces with no dot, and they can be placed again. Stored checked, fitted and damaged counts are capped at the quantity, both on delete and in mergePanelFields.
3. Panel ids never change, so QR labels (which hold the id) still find the right panel. Deleted ids go into cabinet.deletedPartIds, and mergeMobileProject skips them, so a phone resync cannot bring a deleted panel back.
4. cabinet.panelNumbersNotice shows a notice on the drawing and Cutting List screens. It lists the deleted panels and old to new numbers, and says that exported or printed lists and labels need redoing and that the job needs sending to Mobile again. It stays until the owner presses Done. Studio does not record exports, so the notice appears after any renumbering.
5. The placing logic for positionless dots from the earlier release stays, for data created while that release was live.

Test: tests/studio-dot-delete.cjs (replaces studio-dot-remove.cjs).


## 2026-09-24: Cutting List kept in Customer Library (not live yet, publish not approved)

Mads asked for a finished Cutting List to always be saved in Customer Library, under the right customer and room, without needing Send to Mobile, while the job stays in Job Overview.

Checked current behaviour with the real Studio page (Studio.html plus patches, network blocked): this already works. The Cutting List is the job record itself (project.cabinets[].parts), not a copy. finishDesignToCard links the job to a customer with ensureCustomerForProject, matching names without regard to case or spaces, and saves it. Customer Library lists all of a customer's jobs, active or filed, and each row has a Cutting List button. Move to Customer Library only sets movedToLibraryAt/overviewFinishedAt, so nothing is deleted.

Gap fixed: customerJobDesignRows only showed the first unit per room, and nothing for units outside rooms in jobs that have rooms. Every unit with work now gets its own row and Cutting List button (data-open-*-cabinet), and openJobDesignForRoom/openCuttingListForRoom take a cabinet id.

Follow-up, requested by Mads: an edit that clears Panel Check (reviewSignature) used to remove the room card from Job Overview, because the Panel Check patch replaces isCompleteSupplierPart with readyForSupplier. Now, once a card has been ready, its cabinets carry jobOverviewListedAt (stamped in cardsForProject and in finishDesignToCard via window.fiqMarkJobOverviewCards). The card stays and shows a Needs recheck badge (card.needsRecheck). Send to Mobile is unchanged from live: Mads asked for no recheck confirmation or restriction, so the brief confirmation step was removed again. Approving on the Panel Check screen removes the badge. Cards that disappeared before this update come back once their panels are checked again.

Not changed: a job with no customer name gets its own "No customer name" customer.

Test: tests/studio-cutting-list-library.cjs.

## 2026-09-24: Studio Out of Memory crash, cause found and fixed (not live yet, publish not approved)

Symptom: Edge sometimes shows "This page is having a problem", Error code: Out of Memory. A refresh fixes it.

Measured on Mads's real account in the browser pane, reading only: right after sign-in, the live Studio started 5,962 siteJobPacket downloads (up to 136 at once), received 5,940 listener events, wrote 1,000+ "received" marks every 10s and saved 57,101 times in about two minutes. Heap went from 8MB to 1.5GB. The loop was stopped in the pane once the evidence was captured.

Cause: removeInboxPacket wrote status "received" with serverTimestamp every time a packet was applied, even packets already received. Each write fired the onSnapshot listener, and each event started another autoImportSitePackets with no guard. Every run applied its whole stale list and wrote again, so runs multiplied.

Fix, in Studio-Recovery.html: (1) autoImportSitePackets is single-flight; a request during a run gets one more pass. (2) removeInboxPacket skips the cloud write for a packet already received. (3) The listener only reacts to added packets or packets still waiting, not to Studio's own "received" marks.

Evidence: tests/studio-sync-loop.cjs uses a Firestore-like fake. Old code: 42 downloads, 40 at once, and 20 writes in 8s. New code: 2 downloads, 1 write. On the real account, the fixed build served from localhost:8432 (fresh browser, signed in 75 minutes) peaked at 63MB, with 0 writes and 3 listener events.

Still wasteful but not the crash: paintSiteInbox and autoImport each download all 58 siteJobPacket documents every 30s, and checkCompanyReset downloads all studioToMobilePacket documents about every 15s. The cloud queue is never cleaned up.

## 2026-09-24: Data lifecycle stage 1 (branch claude/data-lifecycle, not merged, not published)

Brief from Mads: Job Overview is live, the Customer Library is quiet, only new information is downloaded, and sync messages are no longer created for every send. Existing production messages must not be deleted, and waiting Site Measures must stay safe. The next stage is a permanent cloud master record per customer job.

The inventory and proposal are in docs/data-lifecycle-inventory.md. The changes, measurements, tests and risks are in docs/data-lifecycle-results.md.

Key facts for a future session:
- Studio to Mobile uses one message per job, studio-job-<projectId>, with active true or false. Mobile to Studio uses mobile-<jobId>-<uid>. Commands keep studio-<syncId>.
- Studio reads only kind siteJobPacket with status waiting (listener cache). Mobile listens to kind studioToMobilePacket with active true, and with status waiting.
- Receipts are transactions checked on exportedAt.
- Media is stored at .../media/h/<sha256> and .../mobile-media/h/<sha256>, cached in fiq_*_media_url_cache_v1, and never overwritten.
- The full recovery scan runs only for an empty browser or phone, or once a week (fiq_studio_full_recovery_at_v1, fiq_mobile_full_recovery_at_v1).
- Tests: tests/lifecycle.cjs and tests/perf-lifecycle.cjs, using tests/helpers/fake-cloud.cjs.
- Found: Studio localStorage (5 MB) overflows at about 2,000 full jobs. The permanent cloud record should fix this.

## Next candidates, in priority order

1. The sync queue in companies/{companyId}/jobs is never cleaned up. Studio re-reads every siteJobPacket document every 30s and on every change. Mobile re-reads every studioToMobilePacket document every 2.5s. The cost and delay keep growing.
2. Every Mobile send uploads all of the job's photos again (offloadMobileMediaForStudio uses a new transferId each time). This is slow on a weak signal.
3. The Studio Site Measure room card (openSiteRoomDetails) shows the notes box and siteNotes, but not jobLog entries.
4. Studio to Mobile notes: not tested by Mads yet.
