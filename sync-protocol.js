(function(root){
  function packetTime(packet){const n=Date.parse(packet&&(packet.exportedAt||packet._packetExportedAt)||'');return Number.isFinite(n)?n:0}
  function mergeLog(local,incoming){
    local.jobLog=local.jobLog||[];
    (incoming.jobLog||[]).forEach(entry=>{if(entry&&entry.id&&!local.jobLog.some(x=>x.id===entry.id))local.jobLog.push(entry)});
    local.jobLog.sort((a,b)=>(a.at||0)-(b.at||0));
  }
  function shouldApply(local,packet,field){
    if(!local)return true;
    const incoming=packet.project||packet;
    return packetTime(packet)>(Number(local[field])||0)||(incoming.jobLog||[]).some(x=>x&&x.id&&!(local.jobLog||[]).some(y=>y.id===x.id));
  }
  const api={packetTime,mergeLog,shouldApply};
  root.FittersIQSyncProtocol=api;
  if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
