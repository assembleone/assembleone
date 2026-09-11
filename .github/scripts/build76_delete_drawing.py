from pathlib import Path
p=Path('Studio-Recovery.html')
s=p.read_text(encoding='utf-8')

old='''<button class="btn" id="chooseDrawingBtn" type="button" title="Open a drawing from this computer">📁 Choose drawing</button><input accept="image/*,application/pdf,.png,.jpg,.jpeg,.webp,.pdf" id="drawingInputTop" type="file" hidden/>'''
new='''<button class="btn" id="chooseDrawingBtn" type="button" title="Open a drawing from this computer">📁 Choose drawing</button><input accept="image/*,application/pdf,.png,.jpg,.jpeg,.webp,.pdf" id="drawingInputTop" type="file" hidden/><button class="btn danger" id="deleteDrawingBtn" type="button" title="Remove the current drawing only">🗑 Delete drawing</button>'''
if s.count(old)!=1: raise SystemExit(f'drawing button block count {s.count(old)}')
s=s.replace(old,new,1)

css_old='''  #screen-mark #chooseDrawingBtn{grid-area:choose}
  #screen-mark .zoom-controls{grid-area:zoom;width:auto;justify-content:flex-end;margin-left:auto}'''
css_new='''  #screen-mark #chooseDrawingBtn{grid-area:choose}
  #screen-mark #deleteDrawingBtn{grid-column:3 / 5;grid-row:3;justify-self:end}
  #screen-mark .zoom-controls{grid-area:zoom;width:auto;justify-content:flex-end;margin-left:auto}'''
if s.count(css_old)!=1: raise SystemExit(f'responsive css anchor count {s.count(css_old)}')
s=s.replace(css_old,css_new,1)

anchor='''const chooseDrawingBtn=$("#chooseDrawingBtn");
if(chooseDrawingBtn)chooseDrawingBtn.onclick=()=>{const input=$("#drawingInputTop");if(input)input.click()};'''
addition='''const chooseDrawingBtn=$("#chooseDrawingBtn");
if(chooseDrawingBtn)chooseDrawingBtn.onclick=()=>{const input=$("#drawingInputTop");if(input)input.click()};
const deleteDrawingBtn=$("#deleteDrawingBtn");
function deleteCurrentDrawing(){
 const c=cabinet();
 if(!c?.drawing)return;
 if(!confirm("Delete this drawing? The customer, room, panels, notes and measurements will stay."))return;
 c.drawing=null;
 c.drawingType=null;
 c.drawingName="";
 c.viewState={};
 save();
 renderAll();
 toast("Drawing deleted. You can paste or choose another drawing.");
}
if(deleteDrawingBtn)deleteDrawingBtn.onclick=deleteCurrentDrawing;'''
if s.count(anchor)!=1: raise SystemExit(f'choose drawing handler anchor count {s.count(anchor)}')
s=s.replace(anchor,addition,1)

render_anchor='''const c=cabinet(),stage=$("#drawingStage"),canvas=$("#drawingCanvas"),img=$("#drawingImage"),pdf=$("#drawingPdf"),empty=$("#drawingEmpty");'''
render_new='''const c=cabinet(),stage=$("#drawingStage"),canvas=$("#drawingCanvas"),img=$("#drawingImage"),pdf=$("#drawingPdf"),empty=$("#drawingEmpty");
 const deleteDrawingBtn=$("#deleteDrawingBtn");if(deleteDrawingBtn)deleteDrawingBtn.disabled=!c?.drawing;'''
if s.count(render_anchor)!=1: raise SystemExit(f'renderRooms anchor count {s.count(render_anchor)}')
s=s.replace(render_anchor,render_new,1)

if s.count('id="deleteDrawingBtn"')!=1: raise SystemExit('delete drawing button not unique')
if s.count('function deleteCurrentDrawing()')!=1: raise SystemExit('delete function not unique')

p.write_text(s,encoding='utf-8')
