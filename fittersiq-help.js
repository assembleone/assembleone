/* FittersIQ AI Helper — shared by Studio and Mobile.
   v1: matches questions against a FittersIQ-specific knowledge base (no external AI call yet —
   that needs a Cloud Function once the Firebase project is on the Blaze plan). Behaviour matches
   the FittersIQ AI Helper spec: short answers, screen-aware, Watch Video / Contact Support escalation.
*/
(function(){
  const KB = [
    {id:"what-is-fittersiq", tags:["*"], k:["what is fittersiq","what does fittersiq do","purpose"],
      q:"What is FittersIQ?", a:"FittersIQ shows you on the drawing exactly where each panel goes. Think of a fitting job as one giant jigsaw puzzle — FittersIQ helps identify the pieces and shows where they belong. It doesn't replace your CAD software or tell a fitter how to fit furniture."},

    {id:"screenshot-workflow", tags:["studio-mark"], k:["screenshot","drag drawing","upload drawing","import design","cad"],
      q:"How do I get my design into Studio?", a:"Design the furniture in your usual CAD software (e.g. SketchUp). Once approved, take a screenshot of the finished design and drag it straight into the Studio drawing area. There's no separate upload step needed."},

    {id:"identify-panel", tags:["studio-mark"], k:["click panel","identify panel","circle","mark panel","panel type"],
      q:"How do I mark a panel on the drawing?", a:"Click the panel you want to identify on the drawing — a circle appears there, linking the drawing to the physical panel. Choose the panel type (Side, Top, Bottom, Shelf, Back, Drawer Front...), enter measurements, material and edging, then Save and Next Panel."},

    {id:"move-marker", tags:["studio-mark"], k:["move circle","wrong position","marker wrong","move marker"],
      q:"The circle is on the wrong part of the drawing — do I start over?", a:"No. Click the circle and drag it to the correct position. No need to recreate the panel just because the marker was misplaced."},

    {id:"grain-direction", tags:["studio-mark"], k:["grain","with grain","which measurement first","direction"],
      q:"Which measurement is the grain direction?", a:"The first measurement is always with the grain. For example, on a 2400 × 600 mm wood-effect panel, the 2400 direction follows the grain. If the grain needs to run the other way, reverse the measurements."},

    {id:"edging", tags:["studio-mark"], k:["edging","edge banding","which edges"],
      q:"What is edging?", a:"Edging covers exposed chipboard edges on melamine/laminated panels — e.g. the front edge of a shelf. Select which edges need it. It's optional since not every panel needs an edged side."},

    {id:"required-fields", tags:["studio-mark","studio-parts"], k:["required","material required","cant save panel","panel information needed"],
      q:"What does a panel need before it can pass Panel Check?", a:"A panel type, measurements and a material are required. Edging can be left empty since not every panel needs it."},

    {id:"identical-panels", tags:["studio-mark"], k:["identical panels","same panel","copy panel","duplicate panel"],
      q:"Multiple panels are identical — do I re-enter everything?", a:"No. Finish the first panel normally, then before Save and Next, click the other identical panels on the drawing. FittersIQ applies the same measurements, material and details to all of them — each still keeps its own position and identity."},

    {id:"edit-saved-panel", tags:["studio-parts","studio-cutting"], k:["edit panel","change measurement","fix mistake","correct panel"],
      q:"How do I fix a panel I already saved?", a:"Go to the Cutting List, find the panel and choose Edit — it takes you back to the drawing and panel information to correct it. If the Cutting List has already gone to the supplier, this won't change what they've received; contact the supplier directly for an already-submitted order."},

    {id:"panel-check-purpose", tags:["studio-parts"], k:["panel check","what does tick mean","panel check purpose"],
      q:"What is Panel Check for?", a:"It's a guide to help reduce mistakes — it shows the panel types you'd normally expect (Side, Top, Bottom, Back, Shelf, Drawer Front...) so you can spot anything forgotten. It can't guarantee the furniture design itself is correct."},

    {id:"hardware-list", tags:["studio-parts"], k:["hardware","hardware list","screws","led lights"],
      q:"What is the Hardware list?", a:"It's a shopping list for the job — things like LED lights, screws and other fittings needed for installation, so they can be prepared or ordered ahead of time."},

    {id:"cutting-list-vs-panel-check", tags:["studio-parts","studio-cutting"], k:["cutting list vs panel check","difference panel check cutting list"],
      q:"What's the difference between Panel Check and the Cutting List?", a:"Panel Check is the guide used to help reduce mistakes. The Cutting List is the actual production information that goes to your supplier. You create the Cutting List from Panel Check using Send to Supplier."},

    {id:"send-to-supplier", tags:["studio-cutting"], k:["send to supplier","cutting list file","export cutting list"],
      q:"How do I send the job to my supplier?", a:"From Panel Check, use Send to Supplier — FittersIQ creates the Cutting List as a file. Send that file to your supplier using your normal method (e.g. email). FittersIQ doesn't control that communication."},

    {id:"supplier-info", tags:["studio-cutting"], k:["what does supplier see","supplier information","qr labels"],
      q:"What information does the supplier get?", a:"For each panel: measurements, name, panel number, job, material, and edging details where relevant. Suppliers normally print and apply the QR labels themselves."},

    {id:"mistake-after-sent", tags:["studio-cutting"], k:["mistake after sending","wrong measurement sent","already manufactured"],
      q:"I found a mistake after sending the Cutting List — can FittersIQ fix it?", a:"Not automatically — FittersIQ can't protect against measurements entered incorrectly. Contact your supplier as quickly as possible to ask if it can still be changed. If it's already manufactured, that has to go through your normal supplier process."},

    {id:"site-job-start", tags:["mobile-projects"], k:["start site job","new job mobile","site job"],
      q:"How do I start a new measuring job?", a:"Start in Site Job: enter the customer details, record the room and floor, and note access info (e.g. a lift) — useful for quotations. Then move on to Measuring."},

    {id:"measuring", tags:["mobile-measure"], k:["measuring","wall to wall","floor to ceiling","depth","main photo"],
      q:"How does Measuring work?", a:"Take the main photograph, then record wall to wall, floor to ceiling, and depth. You can add extra photos, notes, and additional measurements (sockets, obstacles, etc.). It's a guide, not a full survey course."},

    {id:"send-to-studio", tags:["mobile-measure","mobile-projects"], k:["send to studio","finish measuring","job sent"],
      q:"How do I send the job back to Studio?", a:"When you're finished measuring, send the Site Job — the app confirms it's been sent. It's worth taking a screenshot of your key measurements as your own backup before leaving site."},

    {id:"customer-library", tags:["studio-jobs"], k:["customer library","old jobs","find old job","previous customer"],
      q:"Where do old customers and jobs live?", a:"In the Customer Library on the Studio front page. If a customer has another job later, it stays under the same customer — name separate work with a Room Name or simple job name like Wardrobe 1, Wardrobe 2. You can reopen a completed job any time, even months or years later, to retrieve the original measurements and materials."},

    {id:"locked-job", tags:["studio-jobs","studio-cutting"], k:["locked job","design change after sent","update sent job"],
      q:"Can I change a job after it's been sent to Mobile?", a:"Once a design is approved, the Cutting List sent and the job sent to Mobile, treat that version as locked. A design change shouldn't silently update the old Mobile job — create the revised design and Cutting List, then send the updated job properly."},

    {id:"qr-scan", tags:["mobile-scan"], k:["scan qr","qr code","scan panel"],
      q:"What happens when I scan a QR code?", a:"Mobile highlights the panel location on the design guide and shows the panel name and measurements — useful if something's missing or damaged. You don't need to scan every panel, only when it's useful."},

    {id:"damaged-qr", tags:["mobile-scan"], k:["qr wont scan","damaged qr","qr not working","manual entry"],
      q:"The QR code won't scan — what do I do?", a:"Every QR sticker has a panel number printed underneath. Enter that number manually and FittersIQ behaves exactly as if it had scanned. If the whole sticker is missing, measure the panel and compare against the Cutting List to identify it. Don't waste time repeatedly trying to scan a damaged code."},

    {id:"wrong-room", tags:["mobile-scan"], k:["wrong room","which room","scan before choosing room"],
      q:"Do I need to choose the room before scanning?", a:"No — scanning identifies the correct customer, job, room and panel automatically. If a panel's been mixed into the wrong room, Mobile makes the correct location obvious. If it belongs to a different job or customer entirely, FittersIQ warns you."},

    {id:"delivery-check", tags:["mobile-scan","mobile-install"], k:["delivery check","panels arrived","check delivery"],
      q:"Should I check panels when they arrive on site?", a:"It's optional — an experienced fitter can just start fitting. If you do scan through them, it's a second check to catch anything missing early. A completed check just means all panels are accounted for — it does not mean the job is installed."},

    {id:"panel-statuses", tags:["mobile-install"], k:["on site","missing","damaged","installed","panel status"],
      q:"What do the panel statuses mean?", a:"On Site = accounted for on site. Missing = not found. Damaged = found but damaged. Installed = actually fitted. On Site and Installed are different things — a panel can be Damaged and later still get Installed if it's still usable. You can undo a status if you mark something by mistake."},

    {id:"missing-panel", tags:["mobile-install"], k:["missing panel","panel not found","cant find panel"],
      q:"I can't find a panel — what should I do?", a:"Mark it Missing so the problem is caught early. If you're a one-person business, contact your supplier directly. In a larger company, Studio can see the missing panel so the office can deal with the supplier — FittersIQ doesn't message suppliers automatically."},

    {id:"damaged-panel", tags:["mobile-install"], k:["damaged panel","panel broken","report damage"],
      q:"A panel arrived damaged — what do I do?", a:"Mark it Damaged, add one or more photos, and a note if useful. That shows up in Studio for a larger company. Nothing is sent to the supplier automatically — you or the office decide what to do. If it's still usable, just use it and mark it Installed."},

    {id:"fitting-order", tags:["mobile-install"], k:["fitting order","which panel first","start day"],
      q:"Do I have to fit panels in a specific order?", a:"No — FittersIQ never forces a fitting sequence. You can scan the top first even if you plan to fit a side first. There's no Start Day / Stop Day requirement — close Mobile at the end of the day and pick the same job up again tomorrow."},

    {id:"finish-job", tags:["mobile-install","mobile-bom"], k:["finish job","complete job","job finished"],
      q:"How do I finish a job?", a:"Use Finish Job. It won't force you through a long checklist — you can optionally take finished photographs, which become part of the permanent customer record when the job returns to Studio."},

    {id:"offline", tags:["mobile-measure","mobile-scan"], k:["offline","no internet","no signal"],
      q:"Does FittersIQ work without internet on site?", a:"A job already loaded on the phone should still show the design guide and panel information offline. When your connection returns, it syncs. (QR scanning offline still needs to be confirmed working on your device.)"},

    {id:"device-account", tags:["*"], k:["change phone","new device","licence","account device"],
      q:"I'm changing phones — do I lose my jobs?", a:"No — customer information and jobs belong to your FittersIQ account, not the device. Sign in on the new phone and your information returns. If your package allows one active Mobile user, only one phone uses that licence at a time, but changing phones doesn't mean buying another one."},

    {id:"login-trouble", tags:["*"], k:["cant login","login problem","sign in not working","wont send"],
      q:"I'm having login or send problems — what should I check?", a:"Check the obvious things first: internet connection, and that your licence/access is valid. If those are both fine and it still doesn't work, this is likely a FittersIQ bug — use Contact FittersIQ Support rather than trying more troubleshooting."},

    {id:"old-version", tags:["*"], k:["old version","update app","new version available"],
      q:"How do I know if I'm on an old version?", a:"If you seem to be running an older Studio or Mobile version, the simplest fix is to refresh/reload the page to pick up the latest version — try that before anything else."},

    {id:"contact-support", tags:["*"], k:["contact support","talk to a person","human help","real person"],
      q:"How do I reach a real person?", a:"Use Contact FittersIQ Support below. It automatically includes useful context — your company, the screen you're on, and this conversation — so you don't have to explain everything again."}
  ];

  const SCREEN_LABELS = {
    "studio-jobs":"Studio → Jobs", "studio-mark":"Studio → Drawing Area", "studio-parts":"Studio → Panel Check",
    "studio-cutting":"Studio → Cutting List", "studio-qr":"Studio → QR and Scan", "studio-bom":"Studio → Finish Job",
    "mobile-projects":"Mobile → Site Job", "mobile-measure":"Mobile → Measuring", "mobile-drawings":"Mobile → Room Guide",
    "mobile-scan":"Mobile → QR Scan", "mobile-install":"Mobile → Panel Check", "mobile-bom":"Mobile → Finish Job"
  };

  function readGlobalScreen(){
    // Studio/Mobile declare `let state` at top level of a classic script, which
    // creates a global lexical binding, not a window property - so it must be
    // read as a bare identifier (inside try/catch, since it may not exist at all).
    try { return (0, eval)("typeof state!=='undefined' && state ? state.screen : ''"); }
    catch(e){ return ""; }
  }

  function currentContext(){
    const app = window.FIQ_HELP_APP || "studio";
    const screen = readGlobalScreen() || "";
    const key = `${app}-${screen}`;
    return { key, label: SCREEN_LABELS[key] || (app==="studio"?"Studio":"Mobile") };
  }

  function search(query, ctxKey){
    const q = String(query||"").toLowerCase().trim();
    if(!q) return [];
    const words = q.split(/\s+/).filter(w=>w.length>2);
    const scored = KB.map(entry=>{
      let keywordScore = 0;
      const hay = (entry.q + " " + entry.k.join(" ")).toLowerCase();
      words.forEach(w=>{ if(hay.includes(w)) keywordScore += 2; });
      entry.k.forEach(phrase=>{ if(q.includes(phrase)) keywordScore += 5; });
      // Screen context only ever breaks ties between entries that already matched
      // on real content - it must never be the sole reason something "matches".
      let score = keywordScore;
      if(keywordScore>0){
        if(entry.tags.includes(ctxKey)) score += 3;
        if(entry.tags.includes("*")) score += 0.5;
      }
      return {entry, score};
    }).filter(x=>x.score>=2).sort((a,b)=>b.score-a.score);
    return scored.slice(0,3).map(x=>x.entry);
  }

  function el(tag, cls, html){ const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }

  function buildPanel(){
    const panel = el("div","fiq-help-panel");
    panel.innerHTML = `
      <div class="fiq-help-head">
        <strong>FittersIQ Help</strong>
        <button type="button" class="fiq-help-close" aria-label="Close help">×</button>
      </div>
      <div class="fiq-help-context" id="fiqHelpContext"></div>
      <div class="fiq-help-body" id="fiqHelpBody"></div>
      <form class="fiq-help-form" id="fiqHelpForm">
        <input id="fiqHelpInput" type="text" placeholder="Ask a question…" autocomplete="off">
        <button type="submit">Ask</button>
      </form>`;
    document.body.appendChild(panel);
    return panel;
  }

  function addMsg(body, role, html){
    const row = el("div", "fiq-help-msg fiq-help-"+role, html);
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
    return row;
  }

  function contactSupportRow(body, question, matched){
    const row = addMsg(body, "ai", "");
    const p = el("p", null, "I can't confidently answer that one.");
    row.appendChild(p);
    const btn = el("button","fiq-help-action","✉ Contact FittersIQ Support");
    btn.type="button";
    btn.onclick = ()=> submitSupport(question, matched, "help");
    row.appendChild(btn);
  }

  async function submitSupport(question, matched, kind){
    const ctx = currentContext();
    const payload = {
      type: kind, // "help" or "bug"
      question: String(question||"").slice(0,2000),
      screenKey: ctx.key,
      screenLabel: ctx.label,
      matchedIds: (matched||[]).map(m=>m.id),
      app: window.FIQ_HELP_APP || "studio",
      createdAt: new Date().toISOString(),
      status: "open"
    };
    try{
      const fns = window.fiqAuthFns;
      if(window.fiqFirestore && fns && fns.addDoc && fns.collection && window.fiqAuth && window.fiqAuth.currentUser){
        const uid = window.fiqAuth.currentUser.uid;
        const companyId = (window.fittersiqUser && window.fittersiqUser.companyId) || null;
        await fns.addDoc(fns.collection(window.fiqFirestore,"supportTickets"), {
          ...payload, uid, companyId, email: window.fiqAuth.currentUser.email||null,
          createdAt: fns.serverTimestamp ? fns.serverTimestamp() : new Date()
        });
        return true;
      }
    }catch(e){ console.warn("Support ticket write failed, queuing locally", e); }
    try{
      const key="fiq_pending_support_tickets";
      const list=JSON.parse(localStorage.getItem(key)||"[]"); list.push(payload);
      localStorage.setItem(key, JSON.stringify(list));
    }catch(e){}
    return false;
  }

  function ask(body, text){
    const ctx = currentContext();
    addMsg(body, "user", document.createTextNode ? "" : "");
    const userRow = addMsg(body, "user", "");
    userRow.textContent = text;
    const matches = search(text, ctx.key);
    if(!matches.length){
      contactSupportRow(body, text, matches);
      return;
    }
    const top = matches[0];
    const answerRow = addMsg(body, "ai", "");
    const p = el("p", null, top.a);
    answerRow.appendChild(p);
    if(top.video){
      const vbtn = el("button","fiq-help-action","▶ Watch Video");
      vbtn.type="button"; vbtn.onclick=()=>window.open(top.video,"_blank");
      answerRow.appendChild(vbtn);
    }
    if(matches.length>1){
      const more = el("div","fiq-help-related","Related:");
      matches.slice(1).forEach(m=>{
        const b=el("button","fiq-help-related-btn",m.q); b.type="button";
        b.onclick=()=>{ answerRow.querySelectorAll(".fiq-help-action-support").forEach(x=>x.remove()); showAnswer(body, m); };
        more.appendChild(b);
      });
      answerRow.appendChild(more);
    }
    const notHelpful = el("button","fiq-help-action fiq-help-action-support","Not what I needed? Contact FittersIQ Support");
    notHelpful.type="button";
    notHelpful.onclick=()=> submitSupport(text, matches, "help");
    answerRow.appendChild(notHelpful);
  }

  function showAnswer(body, entry){
    const row = addMsg(body,"ai","");
    row.appendChild(el("p",null,entry.a));
  }

  function bindPanel(panel){
    const body = panel.querySelector("#fiqHelpBody");
    const ctxLabel = panel.querySelector("#fiqHelpContext");
    const form = panel.querySelector("#fiqHelpForm");
    const input = panel.querySelector("#fiqHelpInput");
    panel.querySelector(".fiq-help-close").onclick = ()=> panel.classList.remove("open");
    form.addEventListener("submit", e=>{
      e.preventDefault();
      const text = input.value.trim();
      if(!text) return;
      ask(body, text);
      input.value = "";
    });
    panel._refreshContext = ()=>{ ctxLabel.textContent = currentContext().label; };
    panel._refreshContext();
    if(!body.childElementCount){
      addMsg(body,"ai","<p>Hi — ask me anything about FittersIQ. I'll keep it short and I know which screen you're on.</p>");
    }
  }

  function ensureStyles(){
    if(document.getElementById("fiq-help-style")) return;
    const style = document.createElement("style");
    style.id = "fiq-help-style";
    style.textContent = `
      .fiq-help-fab{position:fixed;right:16px;bottom:90px;z-index:9000;width:52px;height:52px;border-radius:50%;border:0;background:#0B2545;color:#fff;font-size:22px;box-shadow:0 8px 20px rgba(11,37,69,.35);cursor:pointer}
      .fiq-help-panel{position:fixed;top:0;right:-100%;width:min(380px,92vw);height:100%;background:#fff;box-shadow:-8px 0 30px rgba(0,0,0,.18);z-index:9500;display:flex;flex-direction:column;transition:right .22s ease}
      .fiq-help-panel.open{right:0}
      .fiq-help-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#0B2545;color:#fff}
      .fiq-help-close{border:0;background:transparent;color:#fff;font-size:20px;cursor:pointer;line-height:1}
      .fiq-help-context{padding:8px 16px;background:#eef3fb;color:#31435b;font-size:11px;font-weight:800}
      .fiq-help-body{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px}
      .fiq-help-msg{max-width:92%;font-size:13px;line-height:1.5;padding:10px 12px;border-radius:12px}
      .fiq-help-msg p{margin:0}
      .fiq-help-user{align-self:flex-end;background:#0B2545;color:#fff;border-bottom-right-radius:3px}
      .fiq-help-ai{align-self:flex-start;background:#f2f4f8;color:#171c46;border-bottom-left-radius:3px}
      .fiq-help-action{display:block;margin-top:8px;border:1px solid #d7dfea;background:#fff;border-radius:8px;padding:8px 10px;font-size:12px;font-weight:800;cursor:pointer;color:#0B2545}
      .fiq-help-related{margin-top:8px;font-size:11px;font-weight:800;color:#5B6B7C}
      .fiq-help-related-btn{display:block;width:100%;text-align:left;margin-top:4px;border:0;background:transparent;color:#1969e8;font-size:12px;font-weight:700;cursor:pointer;padding:2px 0}
      .fiq-help-form{display:flex;gap:8px;padding:12px 16px;border-top:1px solid #eee}
      .fiq-help-form input{flex:1;border:1px solid #d7dfea;border-radius:9px;padding:10px 12px;font-size:13px;font:inherit}
      .fiq-help-form button{border:0;border-radius:9px;background:#69d22e;color:#fff;padding:0 16px;font-weight:900;cursor:pointer}
      @media(max-width:480px){.fiq-help-fab{right:12px;bottom:82px;width:48px;height:48px}}
    `;
    document.head.appendChild(style);
  }

  function init(){
    ensureStyles();
    const fab = el("button","fiq-help-fab","💬");
    fab.type = "button";
    fab.setAttribute("aria-label","Open FittersIQ Help");
    document.body.appendChild(fab);
    const panel = buildPanel();
    bindPanel(panel);
    fab.onclick = ()=>{ panel.classList.add("open"); panel._refreshContext(); };
    window.fiqHelpReportBug = function(description){
      submitSupport(description||"Bug reported from "+currentContext().label, [], "bug");
    };
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
