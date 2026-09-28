// A stand-in for the Firebase JS modules (served in place of www.gstatic.com/firebasejs/*),
// so Studio's real sign-in/account-check flow can run offline as a signed-in, verified,
// active company owner. Nothing here talks to Firebase.
const MODS={
 'firebase-app.js':`export function initializeApp(c){return {options:c}}`,
 'firebase-database.js':`export function getDatabase(){return {}}`,
 'firebase-auth.js':`const user={uid:'u-test',email:'owner@test.com',emailVerified:true,getIdTokenResult:async()=>({claims:{companyId:'c-test',role:'company_owner'}}),getIdToken:async()=>'t',reload:async()=>{}};
  export function getAuth(){return {currentUser:user}}
  export function onAuthStateChanged(a,cb){setTimeout(()=>cb(user),50);return ()=>{}}
  export async function signInWithEmailAndPassword(){return {user}}
  export async function signOut(){} export async function sendEmailVerification(){} export async function sendPasswordResetEmail(){} export async function reload(){}`,
 'firebase-functions.js':`export function getFunctions(){return {}} export function httpsCallable(){return async()=>({data:{}})}`,
 'firebase-firestore.js':`const snap={exists:()=>true,data:()=>({status:'active',name:'Test Co',ownerName:'Owner'}),id:'x'};
  const empty={empty:true,size:0,docs:[],forEach(){}};
  export function getFirestore(){return {}} export function doc(...a){return {path:a.slice(1).join('/'),id:String(a[a.length-1])}} export async function getDoc(){return snap}
  export async function setDoc(){} export function collection(...a){return {path:a.slice(1).join('/')}} export async function addDoc(){return {id:'new'}} export function serverTimestamp(){return new Date()}
  export function query(c){return c} export function where(){return {}} export async function getDocs(){return empty} export async function updateDoc(){} export async function deleteDoc(){}
  export function onSnapshot(q,cb){setTimeout(()=>{try{cb(empty)}catch(e){}},20);return ()=>{}} export async function runTransaction(db,fn){return fn({get:async()=>({exists:()=>false,data:()=>null}),set(){},update(){}})}`,
 'firebase-storage.js':`export function getStorage(){return {}} export function ref(){return {}} export async function uploadString(){} export async function getDownloadURL(){return 'https://example.invalid/x'} export async function listAll(){return {items:[],prefixes:[]}} export async function deleteObject(){}`
};
async function useFakeFirebase(target){
 await target.route(/^https:\/\/www\.gstatic\.com\/firebasejs\//,route=>{const name=route.request().url().split('/').pop().split('?')[0];
  if(MODS[name])return route.fulfill({status:200,contentType:'text/javascript',body:MODS[name]});return route.abort()});
}
module.exports={useFakeFirebase};
