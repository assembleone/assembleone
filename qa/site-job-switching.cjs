const fs=require('fs'),assert=require('node:assert/strict'),vm=require('vm');
const source=fs.readFileSync('Mobile-Core.html','utf8');
const start=source.indexOf('function isBlankSiteJob('),end=source.indexOf('// Tapping the Site Measure nav tab',start);
const navigation=source.slice(source.indexOf('function openSavedSiteJobs('),source.indexOf('if($("#newJob"))'));
const original={id:'unsent',name:'New Site Job',customer:'First customer',notes:'Keep these notes',rooms:[{id:'room1',location:'11th floor',notes:'Room notes',measureCaptures:[{image:'data:image/png;base64,photo',marks:[{value:2400}]}]}],cabinets:[],sitePhotos:['photo'],siteMeasurements:[{value:2500}]};
const context={state:{projects:[structuredClone(original)],currentProject:'unsent',currentRoom:'room1',currentCaptureIndex:2},window:{},document:{querySelectorAll:()=>[]},isStudioJob:p=>!!p.studioOrigin,uid:()=> 'new-'+Math.random(),save:()=>{context.persisted=JSON.stringify(context.state)},show:x=>{context.screen=x}};
vm.createContext(context);vm.runInContext(source.slice(start,end)+'\n'+navigation,context);
context.newJob();assert.equal(context.screen,'newSiteJob');assert.equal(context.state.projects.length,2);assert.equal(context.state.currentRoom,null);assert.equal(context.state.currentCaptureIndex,0);assert.deepEqual(context.state.projects.find(x=>x.id==='unsent'),original);
context.newJob();assert.equal(context.state.projects.length,2,'Repeated clicks must reuse a blank draft');
const second=context.state.projects[0];second.notes='Second job notes';context.newJob();assert.equal(context.state.projects.length,3,'A notes-only draft must be preserved');
context.openSavedSiteJobs();assert.equal(context.projectsListMode,'site');assert.equal(context.screen,'projects');
context.state=JSON.parse(context.persisted);assert.deepEqual(context.state.projects.find(x=>x.id==='unsent'),original);assert.equal(context.state.projects.find(x=>x.id===second.id).notes,'Second job notes');
for(const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(!/\bsrc=|type=["'](?:module|application\/ld\+json)/i.test(match[1])&&match[2].trim())new vm.Script(match[2])}
console.log('PASS: new job before sending, no changes to prior notes/photos/measurements, repeat clicks, notes-only draft preservation, saved-job navigation and reload.');
if(process.argv.includes('--browser'))(async()=>{
 const {chromium}=require('playwright'),browser=await chromium.launch();try{
 const page=await browser.newPage();const css=[...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(x=>x[1]).join('\n');
 for(const screen of ['measure','siteVisitSummary','newSiteJob']){
  const from=source.indexOf('<section id="'+screen+'"'),to=source.indexOf('</section>',from);
  await page.setContent('<style>'+css+'</style>'+source.slice(from,to+10).replace('class="screen"','class="screen active"'));
  await page.evaluate(()=>{window.state={projects:[{id:'old',name:'New Site Job',customer:'Existing',rooms:[{id:'r',notes:'keep'}]}],currentProject:'old',currentRoom:'r'};window.isStudioJob=p=>!!p.studioOrigin;window.uid=()=> 'new';window.save=()=>{window.snapshot=JSON.stringify(state)};window.show=x=>{window.destination=x}});
  await page.addScriptTag({content:source.slice(start,end)+'\n'+navigation});
  for(const width of [320,390,430]){
   await page.setViewportSize({width,height:844});
   for(const selector of ['[data-start-site-job]','[data-saved-site-jobs]']){const b=await page.locator(selector).boundingBox();assert(b&&b.x>=0&&b.x+b.width<=width&&b.y<200,'Job controls must be visible at '+width)}
  }
  await page.click('[data-start-site-job]');assert.equal(await page.evaluate(()=>destination),'newSiteJob');assert.equal(await page.evaluate(()=>state.projects.find(p=>p.id==='old').rooms[0].notes),'keep');
  await page.click('[data-saved-site-jobs]');assert.equal(await page.evaluate(()=>destination),'projects');assert.equal(await page.evaluate(()=>projectsListMode),'site');
 }
 console.log('PASS: actual New Job and Saved Site Jobs buttons on all three screens at phone widths.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
