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
