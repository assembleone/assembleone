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

Open issue: Studio sometimes shows Out of Memory. Corrected by Mads: it happens now and then, and a refresh fixes it straight away. It does not happen every time on sign-in. That points to memory building up over a long session, not to loading the data. Before sign-in the live code loads at 8MB. Suspects: the 30s poll plus the snapshot listener re-reading every siteJobPacket document, with no guard against overlapping autoImportSitePackets runs, each calling save(). Also the studio-dispatch-snapshot MutationObserver, and repeated full-state saves. Plan: a signed-in session in the pane with sync left on, sampling performance.memory and counting getDocs, autoImport and save calls over time.

## Next candidates, in priority order

1. The sync queue in companies/{companyId}/jobs is never cleaned up. Studio re-reads every siteJobPacket document every 30s and on every change. Mobile re-reads every studioToMobilePacket document every 2.5s. The cost and delay keep growing.
2. Every Mobile send uploads all of the job's photos again (offloadMobileMediaForStudio uses a new transferId each time). This is slow on a weak signal.
3. The Studio Site Measure room card (openSiteRoomDetails) shows the notes box and siteNotes, but not jobLog entries.
4. Studio to Mobile notes: not tested by Mads yet.
