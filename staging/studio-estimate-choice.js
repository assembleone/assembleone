/* FittersIQ Studio: Estimate, or straight to the job (Mads, 13 Nov 2026).
   Since 29 Oct every new design starts as an Estimate, and sending to the phone, stickers and supplier files wait for
   "Quote accepted". For a job that is already going ahead that meant going through the estimate first and back again.
   Now, the first time a new, still empty design is opened, Studio asks once: "Is this an estimate?"
     Estimate                    -> stays an Estimate, exactly as before.
     No, straight to the job     -> the design is Final at once: phone, stickers, cutting list and supplier all work.
   A small switch on the Drawing screen changes it afterwards if the wrong one was picked. Older designs are never asked
   and do not change. The phone is unchanged. Its own file: the Estimate rules in the Studio core are untouched. */
(function(){
  if(window.__fiqEstimateChoice)return;window.__fiqEstimateChoice=true;
  var css=document.createElement('style');css.id='fiq-estimate-choice-style';
  css.textContent=
    '.fiq-ec-back{position:fixed;inset:0;z-index:5000;background:rgba(11,37,69,.45);display:flex;align-items:center;justify-content:center;padding:16px}'+
    '.fiq-ec-box{background:#fff;border-radius:18px;box-shadow:0 24px 60px rgba(11,37,69,.35);max-width:520px;width:100%;padding:24px;font-family:inherit;color:#0b2545}'+
    '.fiq-ec-box h2{margin:0 0 4px;font-size:24px}'+
    '.fiq-ec-box p{margin:0 0 16px;color:#5B6B7C;font-weight:600}'+
    '.fiq-ec-box button{display:block;width:100%;text-align:left;border-radius:14px;padding:14px 16px;margin:10px 0 0;cursor:pointer;font:inherit;font-size:17px;font-weight:900;border:2px solid #d7dfea;background:#fff;color:#0b2545}'+
    '.fiq-ec-box button small{display:block;font-size:13px;font-weight:600;color:#5B6B7C;margin-top:3px}'+
    '.fiq-ec-box button.fiq-ec-final{border-color:#6BBF3A;background:#f1faea}'+
    '.fiq-ec-box button:hover,.fiq-ec-box button:focus{border-color:#0051ff;outline:none}'+
    '.fiq-ec-chip{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 8px;font-size:13px;font-weight:800;color:#0b2545}'+
    '.fiq-ec-chip b{padding:3px 10px;border-radius:999px;background:#FFF7E6;border:1px solid #F0C36D;color:#5a3d00}'+
    '.fiq-ec-chip b.final{background:#e6f7ec;border-color:#9be0af;color:#16a34a}'+
    '.fiq-ec-chip button{border:1px solid #d7dfea;background:#f6f9ff;border-radius:10px;padding:5px 10px;font:inherit;font-size:13px;font-weight:800;color:#0b2545;cursor:pointer}';
  document.head.appendChild(css);

  var asking=false;
  function current(){try{return {pr:typeof project==='function'?project():null,c:typeof cabinet==='function'?cabinet():null}}catch(e){return {}}}
  function label(pr,c){var room=(pr&&pr.rooms||[]).find(function(r){return r.id===c.roomId});return [room&&room.name,c.name].filter(Boolean).filter(function(v,i,a){return a.indexOf(v)===i}).join(' · ')||'this design'}
  // Ask only for a new design that is still empty and was never decided. Older designs (no stage) are Final and never asked.
  function needsAsk(c){return !!c&&c.stage==='estimate'&&!c.stageChosen&&!(c.parts||[]).length}
  function decide(c,final){
    if(final)delete c.stage;else c.stage='estimate';
    c.stageChosen=final?'final':'estimate';c.stageChosenAt=new Date().toISOString();
    try{if(typeof save==='function')save()}catch(e){}
    try{if(typeof renderAll==='function')renderAll()}catch(e){}
    chip();
  }
  function ask(pr,c){
    asking=true;
    var back=document.createElement('div');back.className='fiq-ec-back';back.id='fiqEstimateChoice';back.setAttribute('role','dialog');back.setAttribute('aria-modal','true');back.setAttribute('aria-labelledby','fiqEcTitle');
    back.innerHTML='<div class="fiq-ec-box"><h2 id="fiqEcTitle">Is this an estimate?</h2><p></p>'+
      '<button type="button" class="fiq-ec-est" data-ec="estimate">📝 Yes, an estimate<small>I am working out the price first. Sending to the phone, stickers and supplier files wait for Quote accepted.</small></button>'+
      '<button type="button" class="fiq-ec-final" data-ec="final">✅ No, straight to the job<small>The sizes are known. Everything works at once: phone, stickers, cutting list and supplier.</small></button></div>';
    back.querySelector('p').textContent=label(pr,c);
    document.body.appendChild(back);
    back.querySelector('.fiq-ec-final').focus();
    back.addEventListener('click',function(e){var b=e.target.closest('[data-ec]');if(!b)return;back.remove();asking=false;decide(c,b.dataset.ec==='final')});
  }
  // The small switch on the Drawing screen, for designs decided with the question above.
  function chip(){
    var scr=document.getElementById('screen-mark');if(!scr)return;
    var cur=current(),c=cur.c,el=document.getElementById('fiqEstimateChip');
    if(!c||!c.stageChosen){if(el)el.remove();return}
    var est=c.stage==='estimate';
    if(!el){el=document.createElement('div');el.id='fiqEstimateChip';el.className='fiq-ec-chip';scr.insertBefore(el,scr.firstChild)}
    var html='This design: <b class="'+(est?'':'final')+'">'+(est?'📝 Estimate':'✅ Final')+'</b><button type="button" id="fiqEcChange">'+(est?'Change to Final':'Change to Estimate')+'</button>';
    if(el.dataset.html!==html){el.innerHTML=html;el.dataset.html=html;
      el.querySelector('#fiqEcChange').onclick=function(){
        var c2=current().c;if(!c2)return;var toFinal=c2.stage==='estimate';
        if(!confirm(toFinal?'Make this design FINAL?\n\nSending to the phone, stickers and supplier files will work at once.':'Make this design an ESTIMATE?\n\nSending to the phone, stickers and supplier files will wait for Quote accepted.'))return;
        decide(c2,toFinal);
      };
    }
  }
  function check(){
    try{
      if(typeof state==='undefined'||!state)return;
      if(state.screen==='mark'){var cur=current();if(!asking&&needsAsk(cur.c)&&!document.body.classList.contains('fiq-locked'))ask(cur.pr,cur.c);chip()}
    }catch(e){}
  }
  setInterval(check,600);
  window.fiqEstimateChoiceCheck=check;
})();
