from pathlib import Path

p=Path('Studio.html')
s=p.read_text(encoding='utf-8')

old_apply=""" const room=merged.rooms?.find(r=>bestSiteReference(r).image)||merged.rooms?.[0];
 const ref=(room&&bestSiteReference(room).image)?bestSiteReference(room):bestSiteReference(merged);
 const roomId=room?.id||'';
 let c=merged.cabinets?.find(x=>x.roomId===roomId);
 if(!c){c={id:uid(),name:(room?.name||merged.name||'Site')+' drawing',roomId,drawing:null,drawingType:null,drawingName:'',parts:[]};merged.cabinets=merged.cabinets||[];merged.cabinets.push(c)}
 if(ref.image){c.drawing=ref.image;c.drawingType='image';c.drawingName=(room?.name||merged.name||'Site')+' site measurements';c.siteReference=true;c.beforePicture=ref.image;c.siteMarkup=ref.siteMarkup?JSON.parse(JSON.stringify(ref.siteMarkup)):null}
 return {merged,cabinet:c};"""

new_apply=""" // Site Measurements are permanent reference records only. Never create a Drawing
 // cabinet or copy a site photo into the Drawing Area. Remove only untouched legacy
 // auto-created Site Measurement cabinets, never a real design carrying panels.
 merged.cabinets=(merged.cabinets||[]).filter(c=>!(c&&c.siteReference&&!(c.parts||[]).length&&(!c.drawingName||/site measurements/i.test(c.drawingName))));
 const room=merged.rooms?.find(r=>bestSiteReference(r).image)||merged.rooms?.[0]||null;
 return {merged,room};"""

if s.count(old_apply)!=1:
    raise SystemExit(f'Expected one Site Measurement cabinet creation block, found {s.count(old_apply)}')
s=s.replace(old_apply,new_apply,1)

old_receive="""  const {merged,cabinet:c}=result;
  switchToProject(merged.id,c.id);renderAll();await save();await paintSiteInbox();show('mark');
  toast('Site Measure opened. Check every photo and measurement, then return and press Accept Site Measure.');"""

new_receive="""  const {merged,room}=result;
  // Receiving a Site Measure no longer switches Studio into Drawing. Save and refresh
  // the permanent record, then open only the Site Measurement card.
  await save();renderAll();await paintSiteInbox();
  if(room&&typeof openSiteRoomDetails==='function')openSiteRoomDetails(merged.id,room.id);
  else show('jobs');
  toast('Site Measure opened. Check the photos and measurements on the Site Measurement card.');"""

if s.count(old_receive)!=1:
    raise SystemExit(f'Expected one receiveSitePacket Drawing jump, found {s.count(old_receive)}')
s=s.replace(old_receive,new_receive,1)

for forbidden in [
    "c.drawingName=(room?.name||merged.name||'Site')+' site measurements'",
    "switchToProject(merged.id,c.id);renderAll();await save();await paintSiteInbox();show('mark')"
]:
    if forbidden in s:
        raise SystemExit(f'Forbidden old coupling still exists: {forbidden}')

p.write_text(s,encoding='utf-8')
