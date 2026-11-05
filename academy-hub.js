/* FittersIQ Academy Members Hub (stage 2): sign in with the normal FittersIQ account, check the access rules, show the four areas.
   Nothing here creates accounts or changes any company data. Access is the combination of:
   1. a signed-in, email-verified FittersIQ user who belongs to a company;
   2. that user's membership of the company being active (the existing system suspends every member when a trial
      ends or payment stops, so an unpaid company is shut out automatically);
   3. an Academy membership for that person: the document academyMembers/{uid} with status "active".
   The page only decides what to show. The database rules (academy/firestore.academy.rules) enforce the same check on
   everything private, so knowing an address is never enough. Any failure to check closes the door. */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, doc, getDoc, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const CONFIGS = {
  production: { apiKey: "AIzaSyAaLqtidxyPh9qIAMsCtKMVoKg5US1hat0", authDomain: "assembleone-fabac.firebaseapp.com", projectId: "assembleone-fabac", storageBucket: "assembleone-fabac.firebasestorage.app", messagingSenderId: "906839446136", appId: "1:906839446136:web:1f78d18408b0796752d38d" },
  staging: { apiKey: "AIzaSyBlglyejGrObsr25JL5-eOSfhF9joBxZUI", authDomain: "fittersiq-staging.firebaseapp.com", projectId: "fittersiq-staging", storageBucket: "fittersiq-staging.firebasestorage.app", messagingSenderId: "974434464573", appId: "1:974434464573:web:f5b5499766d6dab2e0cb54" },
  emulator: { apiKey: "demo-key", authDomain: "demo-fiq-academy.firebaseapp.com", projectId: "demo-fiq-academy" }
};
function pickEnv() {
  const h = location.hostname, local = h === "localhost" || h === "127.0.0.1";
  if (local && /[?&]emu=1\b/.test(location.search)) return "emulator";   // tests only, never reachable on a real address
  if (/fittersiq-staging/.test(h) || location.pathname.indexOf("/staging/") >= 0) return "staging";
  return "production";
}
const ENV = pickEnv();
const app = initializeApp(CONFIGS[ENV]);
const auth = getAuth(app), db = getFirestore(app);
if (ENV === "emulator") { connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true }); connectFirestoreEmulator(db, "127.0.0.1", 8085); }

const $ = (s) => document.querySelector(s);
const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const app$ = $("#app"), outBtn = $("#signOut");
const SUPPORT = "mailto:hello@fittersiq.com?subject=FittersIQ%20Academy%20membership";

const AREAS = [
  { key: "community", cls: "t1", title: "COMMUNITY", text: "Ask questions, share tips, talk to other fitters.", soon: "Discussions, replies, photos and short videos open in the next step." },
  { key: "gallery", cls: "t2", title: "PROJECT GALLERY", text: "Finished work from members, by category.", soon: "Browse projects and upload your own from your phone in the next step." },
  { key: "library", cls: "t3", title: "KNOWLEDGE LIBRARY", text: "Short guides kept for good, easy to search.", soon: "The searchable library of guides opens in a later step." },
  { key: "training", cls: "t4", title: "TRAINING", text: "Practical video lessons.", soon: "Lessons open in a later step." }
];

function card(inner, wide) { app$.innerHTML = '<div class="card' + (wide ? " wide" : "") + '">' + inner + "</div>"; }
function show(state, data) {
  outBtn.hidden = state === "loading" || state === "signin";
  if (state === "loading") return card('<p class="muted">Checking your account&hellip;</p>');
  if (state === "signin") {
    card('<h1>Academy sign in</h1><p>Use your normal FittersIQ email and password.</p><form id="f" novalidate><label for="em">Email</label><input id="em" type="email" autocomplete="username" required><label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password" required><div id="e"></div><button class="btn" type="submit">Sign in</button></form>' +
      '<div class="links"><a href="reset.html">Forgot password?</a><a href="signup.html">Start free trial</a></div>');
    $("#f").onsubmit = async (ev) => {
      ev.preventDefault(); const e = $("#e"); e.innerHTML = "";
      try { await signInWithEmailAndPassword(auth, $("#em").value.trim(), $("#pw").value); }
      catch (x) { e.innerHTML = '<div class="err">That email and password did not work. Please try again.</div>'; }
    };
    return;
  }
  if (state === "verify") return card('<h1>Please confirm your email</h1><p>Open the FittersIQ email we sent you and confirm your address, then come back here.</p><a class="btn" href="verify.html">Go to confirmation</a>');
  if (state === "nocompany") return card('<h1>Finish your FittersIQ account</h1><p>Your FittersIQ account needs setting up before you can join the Academy.</p><a class="btn" href="account.html">Go to my account</a>');
  if (state === "paused") return card('<h1>Your FittersIQ account is paused</h1><p>The Academy is open to people with an active FittersIQ subscription. Once your account is active again, you are back in.</p><a class="btn" href="account.html">Go to my account</a><a class="btn line" href="' + SUPPORT + '">Contact FittersIQ</a>');
  if (state === "nomembership") return card('<h1>Join FittersIQ Academy</h1><p>You are signed in as <strong>' + esc(data.who) + '</strong>. The Academy is a private community for FittersIQ customers, with a small additional monthly membership.</p><p class="muted">Each person has their own membership. Tell us you would like to join and we will switch it on.</p><a class="btn" href="' + SUPPORT + '">Ask about Academy membership</a><a class="btn line" href="https://fittersiq.com/academy.html">What is the Academy?</a>');
  if (state === "soon") return card('<h1>The Academy is opening soon</h1><p>We are putting the finishing touches to FittersIQ Academy. Nothing is wrong with your account, and there is nothing you need to do.</p><a class="btn line" href="https://fittersiq.com/academy.html">What is the Academy?</a>');
  if (state === "error") return card('<h1>The Academy is not available right now</h1><p>We could not check your membership just now. Nothing is wrong with your account. Please try again in a moment.</p><button class="btn" id="retry" type="button">Try again</button>');
  if (state === "member") return dashboard(data);
}
function dashboard(d) {
  const first = String(d.name || "").split(" ")[0];
  app$.innerHTML = '<section class="hello"><span class="eyebrow">WELCOME TO THE ACADEMY</span><h1>' + (first ? "Hello, " + esc(first) : "Welcome") + '</h1><p>Better together. Learn from the people who do the work.</p></section>' +
    '<div class="dom-soon"><strong>DESIGNER OF THE MONTH</strong><br>The most-loved project of the month will be featured here once the Project Gallery opens.</div>' +
    '<div class="tiles">' + AREAS.map((a) => '<button class="tile ' + a.cls + '" data-area="' + a.key + '" type="button"><span class="ti">' + a.title + '</span><span class="td">' + esc(a.text) + "</span></button>").join("") + "</div>";
  app$.querySelectorAll("[data-area]").forEach((b) => (b.onclick = () => { location.hash = b.dataset.area; route(); }));
}
function route() {
  const area = AREAS.find((a) => "#" + a.key === location.hash);
  if (!area || !current || current.state !== "member") return;
  app$.innerHTML = '<div class="view"><button class="back" id="back" type="button">&larr; Back to the Academy</button><h2>' + area.title + "</h2><p>" + esc(area.soon) + "</p></div>";
  $("#back").onclick = () => { location.hash = ""; dashboard(current); };
}

let current = null;
// Works out what this person may see. Every doubt closes the door: only a clean pass reaches "member".
async function evaluate(user) {
  if (!user.emailVerified) return { state: "verify" };
  const tok = await user.getIdTokenResult(true);
  const companyId = tok.claims && tok.claims.companyId;
  if (!companyId) return { state: "nocompany" };
  const who = user.displayName || user.email || "your account";
  let mem;
  // A suspended member (trial ended, unpaid, switched off) is refused even this read by the existing rules: that means paused.
  try { mem = await getDoc(doc(db, "companies", companyId, "members", user.uid)); } catch (e) { return { state: e && e.code === "permission-denied" ? "paused" : "error" }; }
  if (!mem.exists() || mem.data().status !== "active") return { state: "paused" };
  let ent;
  try { ent = await getDoc(doc(db, "academyMembers", user.uid)); } catch (e) { return { state: e && e.code === "permission-denied" ? "soon" : "error" }; }   // rules not published yet = opening soon; anything else: closed
  if (!ent.exists() || ent.data().status !== "active") return { state: "nomembership", who };
  return { state: "member", name: ent.data().displayName || user.displayName || "" };
}
async function check(user) {
  show("loading");
  try { current = await evaluate(user); } catch (e) { current = { state: "error" }; }
  show(current.state, current);
  if (current.state === "member") route();
  const r = $("#retry"); if (r) r.onclick = () => check(user);
}
outBtn.onclick = async () => { try { await signOut(auth); } catch (e) {} location.hash = ""; };
window.addEventListener("hashchange", () => { if (current && current.state === "member") { if (location.hash) route(); else dashboard(current); } });
onAuthStateChanged(auth, (user) => { current = null; if (!user) return show("signin"); check(user); });
show("loading");
