// FittersIQ Studio UI helpers
// Kept separate from the shared Studio and Mobile help script so Studio-only UI changes
// cannot interfere with Mobile or with the main application workflow.
(function(){
  if((window.FIQ_HELP_APP||"studio")!=="studio") return;

  function returnToStudioFront(){
    const overlay=document.getElementById("fiqStudioOnboardOverlay");
    if(overlay) overlay.classList.remove("open");
    try{
      const go=(0,eval)("typeof show==='function' ? show : null");
      if(go) go("jobs");
    }catch(e){}
  }

  function addHowItWorksBack(){
    const overlay=document.getElementById("fiqStudioOnboardOverlay");
    const card=document.getElementById("fiqStudioOnboardCard");
    if(!overlay||!card||!overlay.classList.contains("open")) return;
    if(!card.querySelector("[data-onboard-jump]")) return;
    if(document.getElementById("fiqStudioHowItWorksBack")) return;

    const controls=document.createElement("div");
    controls.className="fiq-onboard-controls";
    const button=document.createElement("button");
    button.type="button";
    button.className="fiq-onboard-back";
    button.id="fiqStudioHowItWorksBack";
    button.textContent="Back";
    button.addEventListener("click",returnToStudioFront);
    controls.appendChild(button);
    card.appendChild(controls);
  }

  function init(){
    addHowItWorksBack();
    const observer=new MutationObserver(addHowItWorksBack);
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]});
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
  else init();
})();
