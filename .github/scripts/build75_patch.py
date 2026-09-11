from pathlib import Path
p=Path('Studio-Recovery.html')
s=p.read_text(encoding='utf-8')

old_dom='''<input aria-label="Choose customer" class="toolbar-select" id="drawingCustomerSearch" list="drawingCustomerList" placeholder="Choose customer" autocomplete="off"/>\n<datalist id="drawingCustomerList"></datalist>\n<select aria-label="Room or design" class="toolbar-select" id="cabinetSelect"></select>'''
new_dom='''<select aria-label="Choose customer" class="toolbar-select" id="drawingCustomerSelect"><option value="">Choose customer</option></select>\n<select aria-label="Room guide" class="toolbar-select" id="cabinetSelect"><option value="">🏠 Room Guide</option></select>'''
if s.count(old_dom)!=1: raise SystemExit(f'dom count {s.count(old_dom)}')
s=s.replace(old_dom,new_dom,1)

old_file='''<label class="file-btn" data-i18n="studio.drawing.chooseDrawingLabel">Choose drawing<input accept="image/*,application/pdf,.png,.jpg,.jpeg,.webp,.pdf" id="drawingInputTop" type="file"/></label>'''
new_file='''<button class="btn" id="chooseDrawingBtn" type="button" title="Open a drawing from this computer">📁 Choose drawing</button><input accept="image/*,application/pdf,.png,.jpg,.jpeg,.webp,.pdf" id="drawingInputTop" type="file" hidden/>'''
if s.count(old_file)!=1: raise SystemExit(f'file control count {s.count(old_file)}')
s=s.replace(old_file,new_file,1)

s=s.replace('#screen-mark #drawingCustomerSearch{min-width:185px;max-width:250px;font-weight:800;background:#fff}', '#screen-mark #drawingCustomerSelect{min-width:185px;max-width:250px;font-weight:800;background:#fff}',1)
s=s.replace('#screen-mark #drawingCustomerSearch:disabled,#screen-mark #cabinetSelect:disabled{opacity:.6}', '#screen-mark #drawingCustomerSelect:disabled,#screen-mark #cabinetSelect:disabled{opacity:.6}',1)
s=s.replace('#screen-mark #drawingCustomerSearch{grid-area:customer;width:100%;min-width:0}', '#screen-mark #drawingCustomerSelect{grid-area:customer;width:100%;min-width:0}',1)
s=s.replace('#screen-mark .drawing-toolbar>.file-btn{grid-area:choose}', '#screen-mark #chooseDrawingBtn{grid-area:choose}',1)
s=s.replace('#screen-mark #drawingViewSiteMeasurementBtn[hidden]~.file-btn{grid-column:2;grid-row:2}', '#screen-mark #chooseDrawingBtn{min-width:145px}',1)

start=s.index('function renderCabinetSelect(){')
end=s.index('\n}\n// Shared by the Drawing workspace overlay',start)+2
new_render='''function renderCabinetSelect(){
 const p=project(),customerSelect=$("#drawingCustomerSelect"),s=$("#cabinetSelect");
 // Match the Customer Library itself: only real customer records with at least one
 // project/job, and never the internal placeholder record "No customer name".
 const customers=(state.customers||[]).filter(c=>c&&c.id&&String(c.name||"").trim()&&String(c.name||"").trim().toLowerCase()!=="no customer name"&&customerProjects(c.id).length).slice().sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")));
 if(customerSelect){
  customerSelect.innerHTML=`<option value="">Choose customer</option>`+customers.map(c=>`<option value="${safe(c.id)}">${safe(c.name)}</option>`).join("");
  customerSelect.disabled=!p;
  customerSelect.value=p?.customerId&&customers.some(c=>c.id===p.customerId)?p.customerId:"";
 }
 if(!s)return;
 // Room Guide is deliberately only a guide in Drawing. It uses the same original room
 // icons as the project room picker; it does not expose cabinets/designs or alter room data.
 const roomGuideTypes=(typeof studioRoomTypes!=="undefined"?studioRoomTypes:[]).filter(([name])=>name!=="Custom");
 s.innerHTML=`<option value="">🏠 Room Guide</option>`+roomGuideTypes.map(([name,icon])=>`<option value="${safe(name)}">${icon} ${safe(typeof roomTypeLabel==="function"?roomTypeLabel(name):name)}</option>`).join("");
 s.disabled=!p;
}'''
s=s[:start]+new_render+s[end:]

old_event_start=s.index('const drawingCustomerSearch=$("#drawingCustomerSearch");')
old_event_end=s.index('$("#cabinetSelect").onchange=',old_event_start)
new_event='''const drawingCustomerSelect=$("#drawingCustomerSelect");
if(drawingCustomerSelect)drawingCustomerSelect.onchange=e=>{
 const p=project();if(!p)return;
 const customerId=e.target.value;if(!customerId)return;
 const c=(state.customers||[]).find(x=>x.id===customerId);if(!c)return;
 p.customerId=c.id;
 p.customer=c.name||"";
 p.address=c.address||"";
 p.phone=c.phone||"";
 p.email=c.email||"";
 p.updatedAt=Date.now();
 save();renderAll();
};
'''
s=s[:old_event_start]+new_event+s[old_event_end:]
# Room Guide is informational only: remove old cabinet-switching handler.
s=s.replace('$("#cabinetSelect").onchange=e=>{state.currentCabinet=e.target.value;state.currentPart=null;save();renderAll()};','$("#cabinetSelect").onchange=()=>{};',1)

anchor='''["drawingInputTop"].forEach(id=>{\n const input=$("#"+id);'''
if s.count(anchor)!=1: raise SystemExit(f'drawing input handler anchor count {s.count(anchor)}')
# Add explicit Windows/file-picker button wiring immediately before existing importer.
s=s.replace(anchor,'''const chooseDrawingBtn=$("#chooseDrawingBtn");\nif(chooseDrawingBtn)chooseDrawingBtn.onclick=()=>{const input=$("#drawingInputTop");if(input)input.click()};\n["drawingInputTop"].forEach(id=>{\n const input=$("#"+id);''',1)

for bad in ['id="drawingCustomerSearch"','id="drawingCustomerList"','Room / Design','Other / unassigned']:
 if bad in s: raise SystemExit(f'old toolbar residue remains: {bad}')
if s.count('id="drawingCustomerSelect"')!=1: raise SystemExit('customer select not unique')
if s.count('id="chooseDrawingBtn"')!=1: raise SystemExit('chooseDrawingBtn not unique')
if s.count('id="drawingInputTop"')!=1: raise SystemExit('drawing input not unique')

p.write_text(s,encoding='utf-8')
