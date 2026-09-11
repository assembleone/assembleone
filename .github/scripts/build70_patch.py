from pathlib import Path

p = Path("Studio.html")
s = p.read_text(encoding="utf-8")

old_modal = '''  <div class="site-room-head"><div class="room-badge" id="siteRoomDetailsIcon">📍</div><div style="flex:1;min-width:0"><h2 id="siteRoomDetailsTitle">Site room</h2><p id="siteRoomDetailsMeta">Project details</p><div class="site-room-status-row"><span class="site-room-kind-badge" id="siteRoomDetailsKindBadge"></span><div class="site-room-address" id="siteRoomDetailsAddress"></div></div></div><button class="site-room-close" id="siteRoomDetailsClose" type="button" aria-label="Close">×</button></div>
  <div class="site-room-body">
   <section class="site-reference-pane"><div class="site-reference-frame" id="siteRoomReferenceFrame"><div class="site-reference-empty">No picture</div></div><div class="site-photo-measure-label" id="siteRoomPhotoMeasureLabel"></div><div class="site-thumb-row" id="siteRoomThumbs"></div></section>
   <section class="site-design-pane"><div class="site-facts"><div class="site-fact"><b id="siteRoomMeasureCount">0</b><span>Measurements</span></div><div class="site-fact"><b id="siteRoomFloor">—</b><span>Floor</span></div></div><div class="site-notes-box"><h3>Notes</h3><div id="siteRoomNotes">No extra notes</div><div class="site-note-photo-row" id="siteRoomNotePhotos"></div></div></section>
  </div>
  <div class="site-detail-actions"><button class="btn primary" id="siteStartDesignBtn" type="button">Start Design</button></div>'''

new_modal = '''  <div class="site-room-head"><div class="room-badge" id="siteRoomDetailsIcon">📍</div><div class="site-room-head-main"><h2 id="siteRoomDetailsTitle">Site room</h2><p id="siteRoomDetailsMeta">Project details</p><div class="site-measure-summary"><b id="siteRoomMeasureCount">0</b><span>Measurements from site</span><b id="siteRoomFloor" class="site-room-floor-data">—</b></div><div class="site-room-status-row"><span class="site-room-kind-badge" id="siteRoomDetailsKindBadge"></span><div class="site-room-address" id="siteRoomDetailsAddress"></div></div></div><button class="site-room-close" id="siteRoomDetailsClose" type="button" aria-label="Close">×</button></div>
  <div class="site-room-body">
   <section class="site-reference-pane"><div class="site-reference-frame" id="siteRoomReferenceFrame"><div class="site-reference-empty">No picture</div></div><div class="site-photo-measure-label" id="siteRoomPhotoMeasureLabel"></div><div class="site-thumb-row" id="siteRoomThumbs"></div></section>
   <section class="site-design-pane"><div class="site-notes-box"><h3>Notes</h3><div id="siteRoomNotes">No extra notes</div><div class="site-note-photo-row" id="siteRoomNotePhotos"></div></div></section>
  </div>'''

if s.count(old_modal) != 1:
    raise SystemExit(f"Expected one original Site Measurement modal, found {s.count(old_modal)}")
s = s.replace(old_modal, new_modal, 1)

style_marker = '''@media(max-width:760px){.site-room-address{margin:3px 0 0 auto}.site-room-address a{font-size:11px}.site-reference-pane{flex:1 1 auto;min-height:0}.site-reference-frame{height:auto;min-height:220px;max-height:none;flex:1 1 auto}.site-note-photo{width:44px;height:36px}.site-notes-box{min-height:64px;max-height:150px}}
</style>'''
style_replacement = '''@media(max-width:760px){.site-room-address{margin:3px 0 0 auto}.site-room-address a{font-size:11px}.site-reference-pane{flex:1 1 auto;min-height:0}.site-reference-frame{height:auto;min-height:220px;max-height:none;flex:1 1 auto}.site-note-photo{width:44px;height:36px}.site-notes-box{min-height:64px;max-height:150px}}
/* Build 70: Site Measurement card remains a read-only site reference. */
.site-room-head{align-items:flex-start;gap:9px;padding:14px 18px}
.site-room-head .room-badge{font-size:34px;line-height:1;margin-top:2px}
.site-room-head-main{flex:1;min-width:0}
.site-room-head h2{font-size:28px}
.site-room-head p{margin:2px 0 0}
.site-room-kind-badge,.site-room-address{display:none!important}
.site-measure-summary{display:inline-flex;align-items:center;gap:5px;margin-top:7px;border:1px solid #cddbd8;border-radius:999px;padding:4px 9px;background:#f8fbfa;color:#294157;font-size:12px;font-weight:800}
.site-measure-summary b{font-size:13px}
.site-room-floor-data{display:none!important}
.site-room-body{display:flex;flex-direction:column;min-height:0;flex:1 1 auto;overflow:hidden}
.site-reference-pane{border-right:0;border-bottom:2px solid #eaf2f1;flex:1 1 auto;min-height:0;padding:8px 12px}
.site-reference-frame{height:auto;min-height:360px;max-height:none;flex:1 1 auto}
.site-photo-measure-label{display:none}
.site-thumb-row{padding-top:7px;min-height:56px}
.site-thumb{width:66px;height:50px;border-radius:9px}
.site-design-pane{flex:0 0 auto;padding:8px 12px 12px;margin:0}
.site-notes-box{min-height:76px;max-height:180px}
.site-detail-actions{display:none!important}
@media(max-width:760px){.site-room-head{padding:9px 10px;gap:7px}.site-room-head .room-badge{font-size:25px}.site-room-head h2{font-size:21px}.site-measure-summary{margin-top:4px;padding:3px 7px;font-size:10px}.site-measure-summary b{font-size:11px}.site-reference-pane{padding:6px 8px}.site-reference-frame{min-height:300px}.site-thumb{width:56px;height:43px}.site-design-pane{padding:7px 8px 9px}.site-notes-box{min-height:68px;max-height:135px}}
</style>'''

if s.count(style_marker) != 1:
    raise SystemExit(f"Expected one Site Measurement style marker, found {s.count(style_marker)}")
s = s.replace(style_marker, style_replacement, 1)

old_script = '<script src="fittersiq-help.js?v=20260911-clean1"></script>'
new_script = old_script + '\n<script src="fittersiq-studio-ui.js?v=20260911-build70"></script>'
if s.count(old_script) != 1:
    raise SystemExit(f"Expected one helper script tag, found {s.count(old_script)}")
s = s.replace(old_script, new_script, 1)

required_ids = [
    "siteRoomDetailsModal", "siteRoomDetailsIcon", "siteRoomDetailsTitle",
    "siteRoomDetailsMeta", "siteRoomDetailsKindBadge", "siteRoomDetailsAddress",
    "siteRoomReferenceFrame", "siteRoomThumbs", "siteRoomMeasureCount",
    "siteRoomFloor", "siteRoomNotes", "siteRoomNotePhotos"
]
for required in required_ids:
    count = s.count(f'id="{required}"')
    if count != 1:
        raise SystemExit(f"{required} count is {count}, expected 1")

if 'id="siteStartDesignBtn"' in s:
    raise SystemExit("Start Design button still exists after patch")

p.write_text(s, encoding="utf-8")
print("Build 70 patch checks passed")
