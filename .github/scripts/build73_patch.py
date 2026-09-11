from pathlib import Path

p=Path('Studio-Recovery.html')
s=p.read_text(encoding='utf-8')

old_dom='''<div class="drawing-toolbar">
<select aria-label="Wardrobe or cabinet" data-i18n-aria="studio.drawing.wardrobeOrCabinetAria" class="toolbar-select" id="cabinetSelect"></select>'''
new_dom='''<div class="drawing-toolbar">
<select aria-label="Choose customer" class="toolbar-select" id="drawingCustomerSelect"><option value="">Choose customer</option></select>
<select aria-label="Room or design" class="toolbar-select" id="cabinetSelect"></select>'''
if s.count(old_dom)!=1:
    raise SystemExit(f'Expected one drawing selector block, found {s.count(old_dom)}')
s=s.replace(old_dom,new_dom,1)

old_css='''  #screen-mark .drawing-toolbar{
    display:grid;
    grid-template-columns:minmax(0,1fr) auto auto;
    grid-template-areas:"selector zoom zoom" "site paste choose";
    overflow:visible;
  }
  #screen-mark #cabinetSelect{grid-area:selector;width:100%;min-width:0}
  #screen-mark #drawingViewSiteMeasurementBtn{grid-area:site;width:100%}'''
new_css='''  #screen-mark .drawing-toolbar{
    display:grid;
    grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto auto;
    grid-template-areas:"customer room zoom zoom" "site site paste choose";
    overflow:visible;
  }
  #screen-mark #drawingCustomerSelect{grid-area:customer;width:100%;min-width:0}
  #screen-mark #cabinetSelect{grid-area:room;width:100%;min-width:0}
  #screen-mark #drawingViewSiteMeasurementBtn{grid-area:site;width:100%}'''
if s.count(old_css)!=1:
    raise SystemExit(f'Expected one responsive drawing toolbar block, found {s.count(old_css)}')
s=s.replace(old_css,new_css,1)

css_anchor='''.drawing-canvas iframe{width:100%;height:100%}
.zoom-controls{display:flex;align-items:center;gap:3px;margin-left:auto}'''
css_replacement='''.drawing-canvas iframe{width:100%;height:100%}
#screen-mark #drawingCustomerSelect{min-width:185px;max-width:250px;font-weight:800;background:#fff}
#screen-mark #cabinetSelect{min-width:165px;max-width:250px;font-weight:800;background:#fff}
#screen-mark #drawingCustomerSelect:disabled,#screen-mark #cabinetSelect:disabled{opacity:.6}
.zoom-controls{display:flex;align-items:center;gap:3px;margin-left:auto}'''
if s.count(css_anchor)!=1:
    raise SystemExit(f'Expected one drawing CSS anchor, found {s.count(css_anchor)}')
s=s.replace(css_anchor,css_replacement,1)

old_render='''function renderCabinetSelect(){
 const p=project(),s=$("#cabinetSelect");s.innerHTML=p?.cabinets.length?p.cabinets.map(c=>`<option value="${c.id}">${safe(c.name)}</option>`).join(""):`<option>${t("studio.home.noWardrobeOption")}</option>`;if(p?.cabinets.some(c=>c.id===state.currentCabinet))s.value=state.currentCabinet
}'''
new_render='''function drawingRoomIcon(name){
 const n=String(name||"").toLowerCase();
 if(/living|lounge|sofa/.test(n))return "🛋️";
 if(/kitchen/.test(n))return "🍳";
 if(/bed|master|guest/.test(n))return "🛏️";
 if(/wardrobe|closet|dressing/.test(n))return "👕";
 if(/office|study/.test(n))return "💻";
 if(/hall|entrance|corridor/.test(n))return "🚪";
 if(/bath|shower/.test(n))return "🛁";
 if(/utility|laundry/.test(n))return "🧺";
 return "🏠";
}
function renderCabinetSelect(){
 const p=project(),customerSelect=$("#drawingCustomerSelect"),s=$("#cabinetSelect");
 if(customerSelect){
  const customers=(state.customers||[]).filter(c=>c&&c.id&&String(c.name||"").trim()).slice().sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")));
  customerSelect.innerHTML=`<option value="">Choose customer</option>`+customers.map(c=>`<option value="${safe(c.id)}">${safe(c.name)}</option>`).join("");
  customerSelect.disabled=!p;
  customerSelect.value=p?.customerId&&customers.some(c=>c.id===p.customerId)?p.customerId:"";
 }
 if(!s)return;
 s.innerHTML=p?.cabinets.length?p.cabinets.map(c=>`<option value="${c.id}">${drawingRoomIcon(c.name)} ${safe(c.name||"Room / Design")}</option>`).join(""):`<option value="">🏠 Room / Design</option>`;
 s.disabled=!p;
 if(p?.cabinets.some(c=>c.id===state.currentCabinet))s.value=state.currentCabinet;
}'''
if s.count(old_render)!=1:
    raise SystemExit(f'Expected one renderCabinetSelect function, found {s.count(old_render)}')
s=s.replace(old_render,new_render,1)

old_event='''$("#cabinetSelect").onchange=e=>{state.currentCabinet=e.target.value;state.currentPart=null;save();renderAll()};'''
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
$("#cabinetSelect").onchange=e=>{state.currentCabinet=e.target.value;state.currentPart=null;save();renderAll()};'''
if s.count(old_event)!=1:
    raise SystemExit(f'Expected one cabinet selector handler, found {s.count(old_event)}')
s=s.replace(old_event,new_event,1)

if s.count('id="drawingCustomerSelect"')!=1:
    raise SystemExit('drawingCustomerSelect id is not unique')
if s.count('id="cabinetSelect"')!=1:
    raise SystemExit('cabinetSelect id is not unique')
if 'fittersiq-studio-customer-link.js' in s:
    raise SystemExit('Old observer-based customer link script must not be present')

p.write_text(s,encoding='utf-8')
