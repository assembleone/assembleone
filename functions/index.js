/**
 * FittersIQ trusted backend.
 *
 * Everything here runs with the Firebase Admin SDK, so it is trusted:
 * company creation, membership changes, custom claims and support access
 * all happen here rather than on the client. Deploy with:
 *
 *   cd functions && npm install
 *   firebase deploy --only functions
 */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

const INVITE_TTL_DAYS = 7;
const MAX_SUPPORT_MINUTES = 240;

function requireAuth(request) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in first.");
  }
  return request.auth;
}

function requireVerifiedEmail(authCtx) {
  if (!authCtx.token.email_verified) {
    throw new HttpsError(
      "failed-precondition",
      "Verify your email address before continuing."
    );
  }
}

function requireAdmin(authCtx) {
  if (authCtx.token.fittersiq_admin !== true) {
    throw new HttpsError("permission-denied", "FittersIQ admin access required.");
  }
}

async function writeAuditLog(entry) {
  await db.collection("auditLogs").add({
    ...entry,
    at: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Called by the website right after a new user has verified their email.
 * Creates the company, the owner membership and the user profile.
 * Idempotent: calling it twice for the same signed-in user returns the
 * existing company instead of creating a second one.
 */
exports.completeOnboarding = onCall(async (request) => {
  const authCtx = requireAuth(request);
  requireVerifiedEmail(authCtx);

  const uid = authCtx.uid;
  const companyName = String(request.data?.companyName || "").trim();
  const ownerName = String(request.data?.ownerName || "").trim();
  const requestedPlan = String(request.data?.plan || "").trim();
  const plan = ["Professional", "Business"].includes(requestedPlan) ? requestedPlan : null;
  const maxUsers = plan === "Business" ? 2 : 1;
  if (!companyName) throw new HttpsError("invalid-argument", "Company name is required.");
  if (!ownerName) throw new HttpsError("invalid-argument", "Your name is required.");

  // Idempotency: does this user already belong to a company?
  const existingToken = await auth.getUser(uid);
  const existingCompanyId = existingToken.customClaims?.companyId;
  if (existingCompanyId) {
    return { companyId: existingCompanyId, alreadyOnboarded: true };
  }

  const companyRef = db.collection("companies").doc();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const trialDays = 14;
  const trialEndsAt = admin.firestore.Timestamp.fromMillis(
    Date.now() + trialDays * 24 * 60 * 60 * 1000
  );

  const batch = db.batch();
  batch.set(companyRef, {
    name: companyName,
    status: "trial",
    createdAt: now,
    trialStartedAt: now,
    trialEndsAt,
    subscriptionStatus: "trialing",
    plan,
    maxUsers,
    ownerName,
    ownerEmail: authCtx.token.email || null,
  });
  batch.set(companyRef.collection("members").doc(uid), {
    role: "company_owner",
    status: "active",
    joinedAt: now,
  });
  batch.set(
    db.collection("users").doc(uid),
    {
      displayName: ownerName,
      email: authCtx.token.email || null,
      createdAt: now,
      lastActiveAt: now,
    },
    { merge: true }
  );
  await batch.commit();

  await auth.setCustomUserClaims(uid, {
    ...(existingToken.customClaims || {}),
    companyId: companyRef.id,
    role: "company_owner",
  });

  await writeAuditLog({
    type: "company_created",
    companyId: companyRef.id,
    uid,
  });

  return { companyId: companyRef.id, alreadyOnboarded: false };
});

/**
 * Called by a company owner to invite a fitter. Creates an expiring
 * invitation document. Sending the actual email is not wired up yet
 * (no email provider configured) - the callable returns the invite id
 * so it can be shared manually until that is connected.
 */
exports.inviteFitter = onCall(async (request) => {
  const authCtx = requireAuth(request);
  requireVerifiedEmail(authCtx);

  const companyId = authCtx.token.companyId;
  const role = authCtx.token.role;
  if (!companyId || role !== "company_owner") {
    throw new HttpsError("permission-denied", "Only a company owner can invite fitters.");
  }

  // Re-check membership from Firestore, not just the (possibly stale) token.
  const memberSnap = await db
    .collection("companies")
    .doc(companyId)
    .collection("members")
    .doc(authCtx.uid)
    .get();
  if (!memberSnap.exists || memberSnap.data().role !== "company_owner" || memberSnap.data().status !== "active") {
    throw new HttpsError("permission-denied", "Only an active company owner can invite fitters.");
  }

  const email = String(request.data?.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new HttpsError("invalid-argument", "A valid email is required.");
  }

  const companyRef = db.collection("companies").doc(companyId);
  const inviteRef = companyRef.collection("invitations").doc();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const expiresAt = admin.firestore.Timestamp.fromMillis(
    Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  await inviteRef.set({
    email,
    role: "fitter",
    status: "pending",
    createdAt: now,
    expiresAt,
    createdBy: authCtx.uid,
  });

  await writeAuditLog({
    type: "invitation_created",
    companyId,
    inviteId: inviteRef.id,
    invitedEmail: email,
    uid: authCtx.uid,
  });

  // TODO: send the invitation email once an email provider is connected.
  return { companyId, inviteId: inviteRef.id, expiresAt: expiresAt.toDate().toISOString() };
});

/**
 * Called by the invited fitter (after they have signed in / signed up and
 * verified their email) to accept an invitation and join the company.
 */
exports.acceptInvitation = onCall(async (request) => {
  const authCtx = requireAuth(request);
  requireVerifiedEmail(authCtx);

  const companyId = String(request.data?.companyId || "").trim();
  const inviteId = String(request.data?.inviteId || "").trim();
  if (!companyId || !inviteId) {
    throw new HttpsError("invalid-argument", "companyId and inviteId are required.");
  }

  const companyRef = db.collection("companies").doc(companyId);
  const inviteRef = companyRef.collection("invitations").doc(inviteId);
  const inviteSnap = await inviteRef.get();
  if (!inviteSnap.exists) {
    throw new HttpsError("not-found", "This invitation no longer exists.");
  }
  const invite = inviteSnap.data();

  if (invite.status !== "pending") {
    throw new HttpsError("failed-precondition", "This invitation has already been used.");
  }
  if (invite.expiresAt && invite.expiresAt.toMillis() < Date.now()) {
    await inviteRef.update({ status: "expired" });
    throw new HttpsError("failed-precondition", "This invitation has expired.");
  }
  const callerEmail = String(authCtx.token.email || "").trim().toLowerCase();
  if (callerEmail !== invite.email) {
    throw new HttpsError(
      "permission-denied",
      "Sign in with the email address this invitation was sent to."
    );
  }

  const uid = authCtx.uid;
  const now = admin.firestore.FieldValue.serverTimestamp();
  const existingToken = await auth.getUser(uid);

  const batch = db.batch();
  batch.set(companyRef.collection("members").doc(uid), {
    role: invite.role || "fitter",
    status: "active",
    joinedAt: now,
  });
  batch.update(inviteRef, { status: "accepted", acceptedBy: uid, acceptedAt: now });
  batch.set(
    db.collection("users").doc(uid),
    { email: callerEmail, createdAt: now, lastActiveAt: now },
    { merge: true }
  );
  await batch.commit();

  await auth.setCustomUserClaims(uid, {
    ...(existingToken.customClaims || {}),
    companyId,
    role: invite.role || "fitter",
  });

  await writeAuditLog({
    type: "invitation_accepted",
    companyId,
    inviteId,
    uid,
  });

  return { companyId };
});

/**
 * Owner or admin action: suspend or reactivate a company member.
 * Firestore security rules already block a suspended member from any
 * company data, this just flips the flag in a trusted, audited way.
 */
exports.setMemberStatus = onCall(async (request) => {
  const authCtx = requireAuth(request);
  const companyId = String(request.data?.companyId || "").trim();
  const targetUid = String(request.data?.uid || "").trim();
  const status = String(request.data?.status || "").trim();
  if (!companyId || !targetUid || !["active", "suspended"].includes(status)) {
    throw new HttpsError("invalid-argument", "companyId, uid and a valid status are required.");
  }

  const isAdmin = authCtx.token.fittersiq_admin === true;
  if (!isAdmin) {
    const callerSnap = await db
      .collection("companies")
      .doc(companyId)
      .collection("members")
      .doc(authCtx.uid)
      .get();
    const caller = callerSnap.data();
    if (!callerSnap.exists || caller.role !== "company_owner" || caller.status !== "active") {
      throw new HttpsError("permission-denied", "Only an active company owner or FittersIQ admin can do this.");
    }
    if (targetUid === authCtx.uid) {
      throw new HttpsError("failed-precondition", "An owner cannot suspend themselves.");
    }
  }

  await db
    .collection("companies")
    .doc(companyId)
    .collection("members")
    .doc(targetUid)
    .update({ status });

  await writeAuditLog({
    type: "member_status_changed",
    companyId,
    targetUid,
    status,
    changedBy: authCtx.uid,
  });

  return { ok: true };
});

const PAIRING_CODE_TTL_MINUTES = 30;

function generatePairingCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Owner action: issue a short-lived, single-use pairing code for connecting
 * an existing fitter record (companies/{id}/fitters/{fitterId}, created by
 * Studio) to a phone. The code is only ever an invitation -- redeemPairingCode
 * below is what actually links a device, and it never becomes the fitter's
 * permanent identity.
 */
exports.createFitterPairingCode = onCall(async (request) => {
  const authCtx = requireAuth(request);
  requireVerifiedEmail(authCtx);

  const companyId = authCtx.token.companyId;
  if (!companyId || authCtx.token.role !== "company_owner") {
    throw new HttpsError("permission-denied", "Only a company owner can connect a fitter's phone.");
  }
  const memberSnap = await db.collection("companies").doc(companyId).collection("members").doc(authCtx.uid).get();
  if (!memberSnap.exists || memberSnap.data().role !== "company_owner" || memberSnap.data().status !== "active") {
    throw new HttpsError("permission-denied", "Only an active company owner can connect a fitter's phone.");
  }

  const fitterId = String(request.data?.fitterId || "").trim();
  if (!fitterId) throw new HttpsError("invalid-argument", "fitterId is required.");

  const companyRef = db.collection("companies").doc(companyId);
  const fitterSnap = await companyRef.collection("fitters").doc(fitterId).get();
  if (!fitterSnap.exists) {
    throw new HttpsError("not-found", "This fitter record was not found for your company.");
  }

  const batch = db.batch();

  // An earlier unused code for this same fitter is superseded rather than left
  // redeemable, so only the code currently on screen in Studio can ever work.
  const existing = await db
    .collection("pairingCodes")
    .where("companyId", "==", companyId)
    .where("fitterId", "==", fitterId)
    .where("used", "==", false)
    .get();
  existing.forEach((d) => batch.update(d.ref, { used: true, supersededAt: admin.firestore.FieldValue.serverTimestamp() }));

  let code = null;
  let codeRef = null;
  for (let attempt = 0; attempt < 5 && !code; attempt++) {
    const candidate = generatePairingCode();
    const ref = db.collection("pairingCodes").doc(candidate);
    const snap = await ref.get();
    if (!snap.exists) {
      code = candidate;
      codeRef = ref;
    }
  }
  if (!code) throw new HttpsError("internal", "Could not generate a pairing code, please try again.");

  const now = admin.firestore.FieldValue.serverTimestamp();
  const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + PAIRING_CODE_TTL_MINUTES * 60 * 1000);
  batch.set(codeRef, {
    companyId,
    fitterId,
    createdAt: now,
    expiresAt,
    used: false,
    createdBy: authCtx.uid,
  });
  await batch.commit();

  await writeAuditLog({ type: "fitter_pairing_code_created", companyId, fitterId, uid: authCtx.uid });

  return { code, expiresAt: expiresAt.toDate().toISOString() };
});

/**
 * Called from FittersIQ Mobile's "Join your company" screen, before the
 * fitter has any Firebase session at all -- the pairing code itself is the
 * only proof of authorisation, which is exactly why it is short-lived and
 * single-use (enforced atomically below so it can't be redeemed twice).
 *
 * The signed-in identity this produces is deterministic from companyId+
 * fitterId (uid "fitter_<fitterId>"), never from the code, the phone, or any
 * name/email/number -- redeeming a second code for the same fitter (e.g. a
 * second device) signs back into the SAME identity rather than creating a
 * new one, which is also why it doesn't consume a second Mobile seat.
 */
exports.redeemPairingCode = onCall(async (request) => {
  const code = String(request.data?.code || "").trim();
  if (!/^\d{6}$/.test(code)) {
    throw new HttpsError("invalid-argument", "Enter the 6-digit code shown in Studio.");
  }

  const codeRef = db.collection("pairingCodes").doc(code);
  const { companyId, fitterId } = await db.runTransaction(async (tx) => {
    const snap = await tx.get(codeRef);
    if (!snap.exists) throw new HttpsError("not-found", "That code was not recognised. Ask for a new one.");
    const data = snap.data();
    if (data.used) throw new HttpsError("failed-precondition", "That code has already been used. Ask for a new one.");
    if (data.expiresAt && data.expiresAt.toMillis() < Date.now()) {
      throw new HttpsError("failed-precondition", "That code has expired. Ask for a new one.");
    }
    tx.update(codeRef, { used: true, usedAt: admin.firestore.FieldValue.serverTimestamp() });
    return { companyId: data.companyId, fitterId: data.fitterId };
  });

  const companyRef = db.collection("companies").doc(companyId);
  const [companySnap, fitterSnap] = await Promise.all([
    companyRef.get(),
    companyRef.collection("fitters").doc(fitterId).get(),
  ]);
  if (!companySnap.exists || !fitterSnap.exists) {
    throw new HttpsError("not-found", "This fitter's company record could not be found.");
  }

  // Everything past this point is wrapped: the code is already spent (the
  // transaction above already marked it used, deliberately, so a half
  // finished attempt can't be replayed with the same code), so any failure
  // here needs a real message rather than leaving the fitter stuck on a
  // burned code with no idea why. uid is deterministic from fitterId alone,
  // so re-running any of this for a retry (a fresh code, same fitter) is
  // always safe -- it finds the same identity rather than creating another.
  const uid = `fitter_${fitterId}`;
  try {
    try {
      await auth.getUser(uid);
    } catch (e) {
      try {
        // No real email exists for this identity, so it's marked verified up
        // front -- otherwise Mobile's normal "verify your email" gate would
        // block a fitter who has no email to verify.
        await auth.createUser({ uid, emailVerified: true });
      } catch (e2) {
        if (e2.code !== "auth/uid-already-exists") throw e2;
      }
    }

    const membersRef = companyRef.collection("members");
    const maxUsers = Number(companySnap.data().maxUsers) || 0;
    const alreadyActiveHere = (await membersRef.doc(uid).get()).data();
    const isAlreadyActiveFitter = alreadyActiveHere && alreadyActiveHere.role === "fitter" && alreadyActiveHere.status === "active";
    if (!isAlreadyActiveFitter && maxUsers) {
      const activeFitters = await membersRef.where("role", "==", "fitter").where("status", "==", "active").get();
      if (activeFitters.size >= maxUsers) {
        throw new HttpsError("resource-exhausted", "All Mobile seats are in use. Ask the company owner to free up a seat first.");
      }
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    await membersRef.doc(uid).set({ role: "fitter", status: "active", fitterId, joinedAt: now }, { merge: true });
    await companyRef.collection("fitters").doc(fitterId).set({ linkedUid: uid, mobileStatus: "active", linkedAt: now }, { merge: true });

    await auth.setCustomUserClaims(uid, { companyId, role: "fitter", fitterId });
    const token = await auth.createCustomToken(uid, { companyId, role: "fitter", fitterId });

    await writeAuditLog({ type: "fitter_device_paired", companyId, fitterId, uid });

    return { token, companyId, fitterId };
  } catch (e) {
    if (e instanceof HttpsError) throw e;
    console.error("redeemPairingCode: could not finish connecting the device", { companyId, fitterId, uid }, e);
    throw new HttpsError(
      "internal",
      "Could not connect this phone right now. Please try again in a moment, or ask your company owner for a new code."
    );
  }
});

/**
 * FittersIQ admin only: open a time-limited, audited support session
 * against a customer's company.
 */
exports.createSupportSession = onCall(async (request) => {
  const authCtx = requireAuth(request);
  requireAdmin(authCtx);

  const companyId = String(request.data?.companyId || "").trim();
  const reason = String(request.data?.reason || "").trim();
  const minutes = Math.min(MAX_SUPPORT_MINUTES, Math.max(5, Number(request.data?.minutes) || 30));
  if (!companyId) throw new HttpsError("invalid-argument", "companyId is required.");
  if (!reason) throw new HttpsError("invalid-argument", "A reason is required for support access.");

  const now = admin.firestore.FieldValue.serverTimestamp();
  const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + minutes * 60 * 1000);

  const sessionRef = await db.collection("supportSessions").add({
    companyId,
    requestedBy: authCtx.uid,
    approvedBy: authCtx.uid,
    startedAt: now,
    expiresAt,
    status: "active",
    reason,
  });

  await writeAuditLog({
    type: "support_session_created",
    companyId,
    sessionId: sessionRef.id,
    uid: authCtx.uid,
    reason,
  });

  return { sessionId: sessionRef.id, expiresAt: expiresAt.toDate().toISOString() };
});

/**
 * FittersIQ admin only: revoke an active support session early.
 */
exports.revokeSupportSession = onCall(async (request) => {
  const authCtx = requireAuth(request);
  requireAdmin(authCtx);

  const sessionId = String(request.data?.sessionId || "").trim();
  if (!sessionId) throw new HttpsError("invalid-argument", "sessionId is required.");

  const ref = db.collection("supportSessions").doc(sessionId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Support session not found.");

  await ref.update({ status: "revoked", revokedBy: authCtx.uid, revokedAt: admin.firestore.FieldValue.serverTimestamp() });
  await writeAuditLog({
    type: "support_session_revoked",
    sessionId,
    companyId: snap.data().companyId,
    uid: authCtx.uid,
  });

  return { ok: true };
});
