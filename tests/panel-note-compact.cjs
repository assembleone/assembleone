// Drawing: compact Panel note beside the units, no large Notes section. Real clicks:
//  - the top line shows only the unit control ("cm ▾", no "Measurements" word) and
//    "📝 Panel note +"; the old Notes preset section is gone; the unit menu reads mm / cm / in;
//  - an EXISTING note (made before this change) shows in the control, is unchanged in the
//    data, and still reaches the supplier/QR rows;
//  - clicking it edits it in a small field (Enter saves); Escape leaves it unchanged;
//  - a panel without a note: "Panel note +", type a NEW note, Done -> saved on that panel only
//    and shown in Panel Check and the Cutting List, and the saved Cutting List keeps it;
//  - with no panel selected, a note typed first goes onto the next new dot's panel;
//  - changing units still converts the numbers exactly as before.
// With SHOT set, screenshots of the Drawing panel area are saved.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
(async()=>{
 const server=http.createServer((req,res)=>{const f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.statusCode=404;return res.end()}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f))});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1366,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 if(process.env.STUDIO_URL)await page.route(u=>!String(u).startsWith('https://assembleone.github.io/'),r=>r.abort());
 else await page.route(u=>!String(u).startsWith('http://127.0.0.1'),r=>r.abort());
 await page.goto(process.env.STUDIO_URL||`http://127.0.0.1:${server.address().port}${process.env.STUDIO_PAGE||'/Studio.html'}`);
 await page.waitForFunction(()=>window.fiqEditor&&window.fiqEditor.role==='editor'&&typeof window.fiqRenderPanelNote==='function');
 await page.waitForTimeout(900);
 const S=(fn,a)=>page.evaluate(fn,a);
 const shot=async name=>{if(!process.env.SHOT)return;const el=page.locator('#screen-mark .panel-form').first();const target=(await el.count())?el:page.locator('#screen-mark .measurement-entry-card');await target.screenshot({path:process.env.SHOT+'/'+name+'.png'})};
 await S(()=>{
  document.body.classList.remove('fiq-locked');const g=document.getElementById('fiqAuthGate');if(g)g.style.display='none';
  const st=(0,eval)('state');
  const drawing='data:image/svg+xml;base64,'+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"/>');
  const mk=(id,code,name,l,w,notes,x)=>{const p={id,code,name,length:l,width:w,thickness:19,qty:1,material:'White melamine',edgeLong:0,edgeShort:0,notes,status:'ready',x,y:40,copies:[]};p.reviewSignature=window.panelReviewSignature(p);return p};
  st.projects.push({id:'pn',name:'Note job',customer:'Nina',rooms:[{id:'pr',name:'Bedroom'}],cabinets:[{id:'pu',roomId:'pr',name:'Wardrobe',drawing,drawingType:'image',parts:[
   mk('a1','P-001','Side',2000,580,'LED channel 70 mm from front',20),mk('a2','P-002','Shelf',764,560,'',50)]}],jobLog:[],updatedAt:Date.now()});
  ensureCustomerForProject(st.projects.at(-1));switchToProject('pn','pu','a1');save();renderAll();show('mark');renderAll();
 });
 await page.waitForTimeout(400);
 const noteText=async()=>(await page.locator('#fiqPanelNoteBtn').innerText()).replace(/\s+/g,' ').trim();
 const head=()=>S(()=>{const h=document.querySelector('#screen-mark .fiq-measure-head');return h?h.innerText.replace(/\s+/g,' ').trim():null});
 // Layout: no "Measurements", no big Notes section, short unit names.
 assert.equal(await page.locator('#notesPickerDetails').count(),0,'large Notes section removed');
 assert.equal(await page.locator('#fNotes').count(),1,'hidden panel-note field kept');
 assert.ok(!/Measurements/.test(await head()),'no Measurements word: '+await head());
 assert.deepEqual(await S(()=>[...document.querySelectorAll('#fiqUnitsMenu .unit-choice')].map(b=>b.textContent.trim())),['mm','cm','in']);
 // Existing note.
 assert.equal(await noteText(),'📝 LED channel 70 mm from front');
 await shot('panel-note-existing');
 const pn=()=>S(()=>state.projects.find(p=>p.id==='pn').cabinets[0].parts.map(p=>p.notes));
 assert.deepEqual(await pn(),['LED channel 70 mm from front',''],'existing note unchanged');
 const supplier=await S(()=>fiqSupplierDataset(cabinet().parts).rows.map(r=>r.notes));
 assert.equal(supplier[0],'LED channel 70 mm from front','supplier/QR rows keep the note');
 // Escape leaves it unchanged; editing it saves.
 await page.locator('#fiqPanelNoteBtn').click();
 assert.equal(await page.locator('#fiqPanelNoteInput').inputValue(),'LED channel 70 mm from front');
 await page.keyboard.type('X');await page.keyboard.press('Escape');await page.waitForTimeout(200);
 assert.deepEqual(await pn(),['LED channel 70 mm from front',''],'Escape: unchanged');
 await page.locator('#fiqPanelNoteBtn').click();await page.locator('#fiqPanelNoteInput').fill('LED channel 60 mm from front');await page.keyboard.press('Enter');await page.waitForTimeout(300);
 assert.deepEqual(await pn(),['LED channel 60 mm from front',''],'edited');
 assert.equal(await noteText(),'📝 LED channel 60 mm from front');
 // A panel without a note: new note.
 await S(()=>{state.currentPart='a2';state.selectedCopy=-1;save();renderAll()});await page.waitForTimeout(300);
 assert.equal(await noteText(),'📝 Panel note +');
 await shot('panel-note-none');
 await page.locator('#fiqPanelNoteBtn').click();
 assert.equal(await S(()=>document.activeElement&&document.activeElement.id),'fiqPanelNoteInput','small field focused');
 await page.locator('#fiqPanelNoteInput').fill('Cable hole back left');
 await shot('panel-note-editing');
 await page.locator('#fiqPanelNoteDone').click();await page.waitForTimeout(300);
 assert.deepEqual(await pn(),['LED channel 60 mm from front','Cable hole back left'],'new note on that panel only');
 assert.equal(await noteText(),'📝 Cable hole back left');
 // Panel Check card, Cutting List, saved Cutting List.
 await S(()=>{show('parts');renderAll()});await page.waitForTimeout(300);
 const pc=await S(()=>document.getElementById('screen-parts').innerText);
 assert.ok(pc.includes('Cable hole back left')&&pc.includes('LED channel 60 mm from front'),'Panel Check shows the notes');
 await S(()=>{state.projects.find(p=>p.id==='pn').cabinets[0].parts.forEach(p=>p.reviewSignature=window.panelReviewSignature(p));save();show('cutting');renderAll()});await page.waitForTimeout(300);
 // (The Cutting List screen itself never listed notes; its supplier rows and saved list do.)
 const rows=await S(()=>fiqSupplierDataset(cabinet().parts).rows.map(r=>r.notes));
 assert.ok(rows.includes('Cable hole back left'),'supplier/QR rows carry the new note');
 await page.locator('#panelCheckReturnBtn').click();await page.waitForTimeout(600);
 const saved=await S(()=>state.projects.find(p=>p.id==='pn').sentCuttingLists['room:pr'].at(-1).panels.map(r=>r.notes));
 assert.deepEqual(saved,['LED channel 60 mm from front','Cable hole back left'],'saved Cutting List keeps the notes');
 // No panel selected: the note typed first goes onto the next dot's panel.
 await S(()=>{switchToProject('pn','pu');state.currentPart=null;save();renderAll();show('mark');renderAll()});await page.waitForTimeout(300);
 assert.equal(await noteText(),'📝 Panel note +');
 await page.locator('#fiqPanelNoteBtn').click();await page.locator('#fiqPanelNoteInput').fill('Scribe to wall');await page.keyboard.press('Enter');await page.waitForTimeout(200);
 assert.equal(await S(()=>document.getElementById('fNotes').value),'Scribe to wall');
 assert.equal(await noteText(),'📝 Scribe to wall');
 await S(()=>{state.lastChosenPartName='Top';document.getElementById('fLength').value='900';document.getElementById('fWidth').value='560'});
 const box=await page.locator('#drawingCanvas').boundingBox();
 await page.mouse.click(box.x+box.width*0.6,box.y+box.height*0.6);await page.waitForTimeout(400);
 const made=await S(()=>{const pt=part();return pt&&{code:pt.code,notes:pt.notes}});
 assert.deepEqual(made,{code:'P-003',notes:'Scribe to wall'},'new dot takes the typed note');
 // Units still convert exactly as before.
 await S(()=>{state.currentPart='a2';save();renderAll()});await page.waitForTimeout(200);
 await page.locator('#fiqUnitsBtn').click();await page.locator('#fiqUnitsMenu .unit-choice[data-unit="cm"]').click();await page.waitForTimeout(300);
 assert.equal(await page.locator('#fLength').inputValue(),'76.4','cm conversion');
 assert.equal((await page.locator('#fiqUnitsBtn').innerText()).trim(),'cm ▾');
 await page.locator('#fiqUnitsBtn').click();await page.locator('#fiqUnitsMenu .unit-choice[data-unit="mm"]').click();await page.waitForTimeout(300);
 assert.equal(await page.locator('#fLength').inputValue(),'764','back to mm');
 assert.deepEqual(await S(()=>state.projects.find(p=>p.id==='pn').cabinets[0].parts.slice(0,2).map(p=>[p.length,p.width])),[[2000,580],[764,560]],'sizes unchanged');
 assert.deepEqual(errors,[],'no page errors');
 console.log(JSON.stringify({ok:true}));
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
