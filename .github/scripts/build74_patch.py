from pathlib import Path

p=Path('Studio-Recovery.html')
s=p.read_text(encoding='utf-8')

old_dom='''<select aria-label="Choose customer" class="toolbar-select" id="drawingCustomerSelect"><option value="">Choose customer</option></select>\n<select aria-label="Room or design" class="toolbar-select" id="cabinetSelect"></select>'''
new_dom='''<input aria-label="Choose customer" class="toolbar-select" id="drawingCustomerSearch" list="drawingCustomerList" placeholder="Choose customer" autocomplete="off"/>\n<datalist id="drawingCustomerList"></datalist>\n<select aria-label="Room or design" class="toolbar-select" id="cabinetSelect"></select>'''
if s.count(old_dom)!=1:
    raise SystemExit(f'customer DOM block count {s.count(old_dom)}')
s=s.replace(old_dom,new_dom,1)

s=s.replace('#screen-mark #drawingCustomerSelect{min-width:185px;max-width:250px;font-weight:800;background:#fff}', '#screen-mark #drawingCustomerSearch{min-width:185px;max-width:250px;font-weight:800;background:#fff}',1)
s=s.replace('#screen-mark #drawingCustomerSelect:disabled,#screen-mark #cabinetSelect:disabled{opacity:.6}', '#screen-mark #drawingCustomerSearch:disabled,#screen-mark #cabinetSelect:disabled{opacity:.6}',1)
s=s.replace('#screen-mark #drawingCustomerSelect{grid-area:customer;width:100%;min-width:0}', '#screen-mark #drawingCustomerSearch{grid-area:customer;width:100%;min-width:0}',1)

old_render='''function renderCabinetSelect(){\n const p=project(),customerSelect=$("#drawingCustomerSelect"),s=$("#cabinetSelect");\n if(customerSelect){\n  const customers=(state.customers||[]).filter(c=>c&&c.id&&String(c.name||"").trim()).slice().sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")));\n  customerSelect.innerHTML=`<option value="">Choose customer</option>`+customers.map(c=>`<option value="${safe(c.id)}">${safe(c.name)}</option>`).join("");\n  customerSelect.disabled=!p;\n  customerSelect.value=p?.customerId&&customers.some(c=>c.id===p.customerId)?p.customerId:"";\n }\n if(!s)return;\n s.innerHTML=p?.cabinets.length?p.cabinets.map(c=>`<option value="${c.id}">${drawingRoomIcon(c.name)} ${safe(c.name||"Room / Design")}</option>`).join(""):`<option value="">🏠 Room / Design</option>`;\n s.disabled=!p;\n if(p?.cabinets.some(c=>c.id===state.currentCabinet))s.value=state.currentCabinet;\n}'''
new_render='''function renderCabinetSelect(){\n const p=project(),customerSearch=$("#drawingCustomerSearch"),customerList=$("#drawingCustomerList"),s=$("#cabinetSelect");\n const customers=(state.customers||[]).filter(c=>c&&c.id&&String(c.name||"").trim()).slice().sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")));\n if(customerList)customerList.innerHTML=customers.map(c=>`<option value="${safe(c.name)}"></option>`).join("");\n if(customerSearch){\n  customerSearch.disabled=!p;\n  const linked=p?customers.find(c=>c.id===p.customerId):null;\n  customerSearch.value=linked?.name||"";\n }\n if(!s)return;\n const cabinets=p?.cabinets||[],rooms=p?.rooms||[];\n let html=`<option value="">🏠 Room / Design</option>`;\n rooms.forEach(r=>{\n  const label=`${drawingRoomIcon(r.name)} ${safe(r.name||"Room")}`;\n  const units=cabinets.filter(c=>c.roomId===r.id);\n  if(units.length){\n   html+=`<optgroup label="${label}">`+units.map(c=>`<option value="${c.id}">✏️ ${safe(c.name||"Design")}</option>`).join("")+`</optgroup>`;\n  }else{\n   html+=`<option disabled>${label} — no design yet</option>`;\n  }\n });\n const unassigned=cabinets.filter(c=>!c.roomId||!rooms.some(r=>r.id===c.roomId));\n if(unassigned.length)html+=`<optgroup label="🏠 Other / unassigned">`+unassigned.map(c=>`<option value="${c.id}">✏️ ${safe(c.name||"Design")}</option>`).join("")+`</optgroup>`;\n s.innerHTML=html;\n s.disabled=!p;\n if(cabinets.some(c=>c.id===state.currentCabinet))s.value=state.currentCabinet;\n}'''
if s.count(old_render)!=1:
    raise SystemExit(f'render function count {s.count(old_render)}')
s=s.replace(old_render,new_render,1)

old_event='''const drawingCustomerSelect=$("#drawingCustomerSelect");\nif(drawingCustomerSelect)drawingCustomerSelect.onchange=e=>{\n const p=project();if(!p)return;\n const customerId=e.target.value;if(!customerId)return;\n const c=(state.customers||[]).find(x=>x.id===customerId);if(!c)return;\n p.customerId=c.id;\n p.customer=c.name||"";\n p.address=c.address||"";\n p.phone=c.phone||"";\n p.email=c.email||"";\n p.updatedAt=Date.now();\n save();renderAll();\n};'''
new_event='''const drawingCustomerSearch=$("#drawingCustomerSearch");\nfunction commitDrawingCustomer(){\n const p=project();if(!p||!drawingCustomerSearch)return;\n const typed=String(drawingCustomerSearch.value||"").trim().toLowerCase();\n if(!typed)return;\n const c=(state.customers||[]).find(x=>String(x.name||"").trim().toLowerCase()===typed);\n if(!c)return;\n p.customerId=c.id;\n p.customer=c.name||"";\n p.address=c.address||"";\n p.phone=c.phone||"";\n p.email=c.email||"";\n p.updatedAt=Date.now();\n save();renderAll();\n}\nif(drawingCustomerSearch){\n drawingCustomerSearch.addEventListener("change",commitDrawingCustomer);\n drawingCustomerSearch.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();commitDrawingCustomer();drawingCustomerSearch.blur();}});\n}'''
if s.count(old_event)!=1:
    raise SystemExit(f'customer event count {s.count(old_event)}')
s=s.replace(old_event,new_event,1)

if 'id="drawingCustomerSelect"' in s:
    raise SystemExit('old customer select still present')
if s.count('id="drawingCustomerSearch"')!=1 or s.count('id="drawingCustomerList"')!=1:
    raise SystemExit('customer search/list ids not unique')
if s.count('id="cabinetSelect"')!=1:
    raise SystemExit('cabinet select id not unique')

p.write_text(s,encoding='utf-8')
