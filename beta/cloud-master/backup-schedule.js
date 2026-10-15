// FittersIQ automatic Studio backup timing and status (Stage 2.3c). Pure logic, no network:
// the Studio adapter calls change()/online()/started()/finished() and asks due()/status().
//  - A backup starts 2 minutes after the last change (quiet), and at the latest 10 minutes
//    after the first change that is not backed up yet, even while editing never stops (max).
//  - It also starts when Studio opens with unbacked changes and when the internet returns.
//  - A failed backup retries after 1, 2, 5 and 10 minutes, then every 10 minutes.
//  - Changes made while a backup runs stay pending and get their own backup.
//  - Status: 'backed-up' (time and age of the last completed, verified backup and what it
//    covered), 'pending' (since when and why) or 'failed' (reason, next try).
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FiqBackupSchedule=api})(typeof self!=='undefined'?self:this,function(){
'use strict';
const MIN=60*1000;
function createBackupSchedule(o){
 o=o||{};
 const quietMs=o.quietMs||2*MIN,maxMs=o.maxMs||10*MIN,retry=o.retryMs||[1*MIN,2*MIN,5*MIN,10*MIN];
 // Persisted between page loads by the adapter (localStorage); everything needed to resume.
 const s=Object.assign({pendingSince:null,lastChangeAt:null,lastVerified:null,running:null,failures:0,nextTryAt:null,lastError:null,offline:false},o.saved||{});
 const api={
  change(t){if(s.pendingSince==null)s.pendingSince=t;s.lastChangeAt=t},
  online(on,t){s.offline=!on;if(on&&s.failures)s.nextTryAt=Math.min(s.nextTryAt||t,t)},
  // Opening Studio with changes the cloud does not have: back them up straight away.
  opened(t){if(s.pendingSince!=null){s.nextTryAt=null;s.failures=0;s.forceAt=t}},
  due(t){
   if(s.running||s.offline||s.pendingSince==null)return false;
   if(s.failures)return t>=s.nextTryAt;
   if(s.forceAt!=null&&t>=s.forceAt)return true;
   return t-s.lastChangeAt>=quietMs||t-s.pendingSince>=maxMs;
  },
  // When the next backup is due if nothing else changes (for the adapter's timer).
  nextDueAt(){
   if(s.running||s.offline||s.pendingSince==null)return null;
   if(s.failures)return s.nextTryAt;
   return Math.min(s.lastChangeAt+quietMs,s.pendingSince+maxMs,s.forceAt||Infinity);
  },
  started(t){s.running={at:t,coversChangesUpTo:s.lastChangeAt}},
  finished(t,r){
   const run=s.running;s.running=null;s.forceAt=null;
   if(r&&r.ok){
    s.lastVerified={at:t,startedAt:run?run.at:t,coverage:r.coverage||null};s.failures=0;s.nextTryAt=null;s.lastError=null;
    // Changes made after the backup started are not in it.
    if(s.lastChangeAt!=null&&run&&s.lastChangeAt>run.coversChangesUpTo)s.pendingSince=Math.max(run.at,s.pendingSince||0);else s.pendingSince=null;
   }else{
    s.failures++;s.lastError=(r&&r.error)||'unknown';s.nextTryAt=t+retry[Math.min(s.failures-1,retry.length-1)];
   }
  },
  status(t){
   const lv=s.lastVerified,age=lv?t-lv.at:null;
   const base={lastVerifiedAt:lv?lv.at:null,lastVerifiedAgeMs:age,coverage:lv?lv.coverage:null,pendingSince:s.pendingSince,unprotectedMs:s.pendingSince!=null?t-s.pendingSince:0};
   if(s.failures)return {...base,state:'failed',reason:s.lastError,nextTryAt:s.nextTryAt,failures:s.failures};
   if(s.pendingSince!=null)return {...base,state:'pending',reason:s.offline?'offline':s.running?'backing up now':'changes waiting'};
   if(!lv)return {...base,state:'pending',reason:'no backup yet'};
   return {...base,state:'backed-up'};
  },
  saved(){return JSON.parse(JSON.stringify(s))}
 };
 return api;
}
return {createBackupSchedule,MIN};
});
