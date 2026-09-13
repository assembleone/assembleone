(function(){
  'use strict';
  const originalSend=window.sendPackToPhoneDirectly;
  if(typeof originalSend!=='function')return;
  let database;
  function db(){
    if(!database)database=new Promise((resolve,reject)=>{
      const req=indexedDB.open('fittersiq_outgoing_mobile_v1',1);
      req.onupgradeneeded=()=>req.result.createObjectStore('pending',{keyPath:'key'});
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>{database=null;reject(req.error)};
    });
    return database;
  }
  async function operation(mode,action){
    const connection=await db();
    return new Promise((resolve,reject)=>{
      const tx=connection.transaction('pending',mode),req=action(tx.objectStore('pending'));
      tx.oncomplete=()=>resolve(req.result);
      tx.onerror=()=>reject(tx.error);
      tx.onabort=()=>reject(tx.error||new Error('Pending send storage was interrupted'));
    });
  }
  function identity(){const user=window.fittersiqUser;return user&&user.companyId&&user.uid?{companyId:user.companyId,uid:user.uid}:null}
  function sameAccount(entry){const user=identity();return !!user&&user.companyId===entry.companyId&&user.uid===entry.uid}
  let tail=Promise.resolve();
  function serial(action){const work=tail.then(action);tail=work.catch(()=>{});return work}
  function superseded(entry){
    const resetAt=Number(localStorage.getItem('fittersiq_test_reset_at_v1')||0);
    return (resetAt&&entry.queuedAt<=resetAt)||(entry.pack.project&&typeof state!=='undefined'&&(state.deletedProjectIds||[]).includes(entry.pack.project.id));
  }
  async function transmit(entry){
    if(!sameAccount(entry))throw new Error('Sign in to the account that queued this update.');
    let timer;
    const result=await Promise.race([
      originalSend(entry.pack),
      new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('The connection timed out.')),30000)})
    ]).finally(()=>clearTimeout(timer));
    if(!result||!result.cloudSent)throw new Error(result&&result.cloudError||'The cloud connection is unavailable.');
    await operation('readwrite',store=>store.delete(entry.key));
    return result;
  }
  window.sendPackToPhoneDirectly=function(pack){
    const user=identity();
    if(!user)return Promise.reject(new Error('Sign in to your company before sending to Mobile.'));
    const snapshot=JSON.parse(JSON.stringify(pack));
    snapshot.syncId=snapshot.syncId||crypto.randomUUID();
    const entry={...user,key:user.companyId+':'+user.uid+':'+snapshot.syncId,pack:snapshot,queuedAt:Date.now()};
    // Persist immediately, before waiting for another transfer to finish.
    const stored=operation('readwrite',store=>store.put(entry)).then(()=>null,error=>error);
    return serial(async()=>{
      if(await stored)throw new Error('The pending update could not be saved. Please free browser storage and send again.');
      try{return await transmit(entry)}catch(error){throw new Error(String(error&&error.message||error)+' The update is saved and will retry automatically.')}
    });
  };
  try{sendPackToPhoneDirectly=window.sendPackToPhoneDirectly}catch(e){}
  let retrying=false;
  window.retryPendingMobileSends=function(){
    if(retrying||!identity())return Promise.resolve();
    retrying=true;
    return serial(async()=>{
      const rows=await operation('readonly',store=>store.getAll());
      let changed=false;
      for(const entry of rows.sort((a,b)=>a.queuedAt-b.queuedAt)){
        if(!sameAccount(entry))continue;
        if(superseded(entry)){await operation('readwrite',store=>store.delete(entry.key));continue}
        try{
          const result=await transmit(entry);
          const p=entry.pack.project&&(typeof state!=='undefined'&&state.projects||[]).find(x=>x.id===entry.pack.project.id);
          if(p&&sameAccount(entry)){
            const previous=Date.parse(p.lastMobileSync||'')||0;
            if(Date.parse(entry.pack.exportedAt)>previous){p.lastMobileSync=entry.pack.exportedAt;(p.rooms||[]).forEach(r=>{r.lastMobileSync=p.lastMobileSync})}
            p.pendingMobileReceiptDocId=result.cloudDocId||null;
            changed=true;
          }
        }catch(error){console.warn('Mobile send remains queued',error)}
      }
      // An empty outbox must not clone every photo and rebuild every screen.
      if(changed){
        if(typeof save==='function')await save();
        if(typeof renderAll==='function')renderAll();
      }
    }).catch(error=>console.warn('Pending sends could not be read',error)).finally(()=>{retrying=false});
  };
  window.addEventListener('focus',window.retryPendingMobileSends);
  window.addEventListener('online',window.retryPendingMobileSends);
  setInterval(window.retryPendingMobileSends,5000);
  setTimeout(window.retryPendingMobileSends,800);
})();
