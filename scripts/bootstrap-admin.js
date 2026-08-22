/**
 * One-off script to grant the FIRST FittersIQ admin their custom claim.
 *
 * This is deliberately NOT a Cloud Function. Granting fittersiq_admin must
 * never be reachable from a client, so this only runs locally with a
 * Firebase service account key you download yourself and never commit.
 *
 * Setup (once):
 *   1. Firebase Console -> Project Settings -> Service Accounts
 *      -> Generate new private key. Save it outside this repo, e.g.
 *      C:\Users\madsm\serviceAccountKey.json
 *      (the .gitignore already blocks any *serviceAccount*.json from
 *      being committed if you save it inside the repo by mistake)
 *   2. cd scripts && npm install firebase-admin
 *
 * Run:
 *   node bootstrap-admin.js <user-email> C:\path\to\serviceAccountKey.json
 *
 * The target user must already have signed up (e.g. through the website
 * sign-in flow) before you run this - the script looks them up by email.
 */
const path = require("path");
const admin = require("firebase-admin");

const [, , email, keyPath] = process.argv;

if (!email || !keyPath) {
  console.error("Usage: node bootstrap-admin.js <user-email> <path-to-service-account-key.json>");
  process.exit(1);
}

const serviceAccount = require(path.resolve(keyPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function main() {
  const user = await admin.auth().getUserByEmail(email);
  const existingClaims = user.customClaims || {};

  if (existingClaims.fittersiq_admin === true) {
    console.log(`${email} already has fittersiq_admin. Nothing to do.`);
    return;
  }

  await admin.auth().setCustomUserClaims(user.uid, {
    ...existingClaims,
    fittersiq_admin: true,
  });

  await admin.firestore().collection("auditLogs").add({
    type: "admin_bootstrap",
    uid: user.uid,
    email,
    at: admin.firestore.FieldValue.serverTimestamp(),
    note: "Granted via local bootstrap-admin.js script",
  });

  console.log(`Granted fittersiq_admin to ${email} (uid: ${user.uid}).`);
  console.log("They must sign out and sign back in (or refresh their ID token) for the Dashboard to see the change.");
}

main().catch((err) => {
  console.error("Bootstrap failed:", err.message);
  process.exit(1);
});
