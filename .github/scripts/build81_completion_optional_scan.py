from pathlib import Path

# Mobile: completing the job is independent of scan/panel status.
m=Path('Mobile.html')
s=m.read_text(encoding='utf-8')
old=''' r.mobileJobCompleted=true;r.mobileJobCompletedAt=new Date().toISOString();\n  if(Array.isArray(state.activeCardKeys)){'''
new=''' r.mobileJobCompleted=true;r.mobileJobCompletedAt=new Date().toISOString();\n  // Completion is a fitter decision, not a scan requirement. Keep panel/check data as\n  // optional progress only, and mirror completion onto the parent project when this is\n  // the only room or when every real room is now complete so Studio's general job card\n  // can turn green even for legacy/unassigned cabinet jobs.\n  const realRooms=(p.rooms||[]).filter(x=>x&&x.id);\n  if(realRooms.length<=1||realRooms.every(x=>!!x.mobileJobCompleted)){\n   p.mobileJobCompleted=true;\n   p.mobileJobCompletedAt=r.mobileJobCompletedAt;\n  }\n  if(Array.isArray(state.activeCardKeys)){'''
if s.count(old)!=1: raise SystemExit(f'Mobile completion anchor count {s.count(old)}')
s=s.replace(old,new,1)
m.write_text(s,encoding='utf-8')

# Studio: accept project-level completion from Mobile and support the same one-room fallback.
p=Path('Studio-Recovery.html')
s=p.read_text(encoding='utf-8')
old='''["name","customer","address","phone","notes","siteMeasurements","sitePhotos","siteRoomName","siteRoomLocation","siteRoomNotes","siteMarkup","measureCaptures","notePhotos","geoLat","geoLng","siteNotes","siteNotePhotos"].forEach(k=>{if(incoming[k]!==undefined)base[k]=incoming[k]});'''
new='''["name","customer","address","phone","notes","siteMeasurements","sitePhotos","siteRoomName","siteRoomLocation","siteRoomNotes","siteMarkup","measureCaptures","notePhotos","geoLat","geoLng","siteNotes","siteNotePhotos","mobileJobCompleted","mobileJobCompletedAt"].forEach(k=>{if(incoming[k]!==undefined)base[k]=incoming[k]});'''
if s.count(old)!=1: raise SystemExit(f'Studio top-level merge field list count {s.count(old)}')
s=s.replace(old,new,1)
old='''const jobCompleted=!siteVisit&&(card.room&&card.room!=='__general__'?!!card.room.mobileJobCompleted:!!p.mobileJobCompleted);'''
new='''const mobileCompletedRooms=(p.rooms||[]).filter(r=>r&&r.mobileJobCompleted);\n      const jobCompleted=!siteVisit&&(card.room&&card.room!=='__general__'?!!card.room.mobileJobCompleted:(!!p.mobileJobCompleted||((p.rooms||[]).length===1&&mobileCompletedRooms.length===1)));'''
if s.count(old)!=1: raise SystemExit(f'Studio jobCompleted expression count {s.count(old)}')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
