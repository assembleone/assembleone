# Firestore rules: the exact Custom Sheets addition (NOT deployed, NOT applied)

Status: prepared only. Nothing has been published to Firebase. The repo's `firestore.rules` file is deliberately left WITHOUT this block, so
nobody can publish it by accident with `firebase deploy`.

## Why add only a block, never the whole file
Beta, Staging Studio and Production all use the same Firebase project (assembleone-fabac). The repo's `firestore.rules` does not contain
rules the apps appear to use: `academyMembers` (Academy has its own file, `academy-rules/firestore.academy.rules`), the cloud-copy area
`companies/{id}/fiqMaster/...`, device `health` records and `stripeEvents`. I cannot read the live rules, so I cannot say the repo file
equals them. Publishing the whole file could remove live rules. **Never deploy the complete file unless it has first been compared,
line by line, with the text shown in the Firebase Console.** (A rules file with a syntax error is rejected and nothing changes.)

## Where it goes
Firebase Console, project assembleone-fabac, Firestore Database, Rules tab. Find (inside `match /companies/{companyId} {`):

```
      match /jobs/{jobId} {
        allow read, create, update: if isFittersIQAdmin() || isCompanyMember(companyId);
        allow delete: if isFittersIQAdmin() || isCompanyOwner(companyId);
      }

      match /invitations/{inviteId} {          <-- insert the block on the empty line ABOVE this line
```

## The block (12 lines; paste exactly, same indentation, nothing else changes)
```
      // Estimator Custom Sheets (named sheet sizes). Private to the company: only its active members (or a FittersIQ admin)
      // can read or write them. Additive rule: nothing else in the rules changes.
      match /estimatorSheets/{sheetId} {
        allow read, delete: if isFittersIQAdmin() || isCompanyMember(companyId);
        allow create, update: if (isFittersIQAdmin() || isCompanyMember(companyId))
          && request.resource.data.keys().hasOnly(['name', 'w', 'h', 't', 'createdAt', 'updatedAt', 'updatedBy'])
          && request.resource.data.name is string && request.resource.data.name.size() > 0 && request.resource.data.name.size() <= 80
          && request.resource.data.w is number && request.resource.data.w > 0 && request.resource.data.w <= 20000
          && request.resource.data.h is number && request.resource.data.h > 0 && request.resource.data.h <= 20000
          && (!('t' in request.resource.data) || (request.resource.data.t is number && request.resource.data.t > 0 && request.resource.data.t <= 500));
      }

```
It needs the helper functions `isFittersIQAdmin()` and `isCompanyMember(companyId)` that already exist in the repo file. If the live rules do not
have them, the Console shows a red error and nothing can be published.

## What it does and does not do
- Only the path `companies/{company}/estimatorSheets/{sheet}` is affected. In Firestore, a new `match` block can only grant access to its own path;
  it cannot take access away from, or add access to, any other path. No existing code uses this path.
- Only an active member of that same company (or a FittersIQ admin) can read, create, edit or delete. Other companies, inactive members and
  signed-out users cannot. Sheets must have a name of 1 to 80 characters, numeric size between 0 and 20000, an optional thickness above 0 up to 500, and only the expected fields (name, w, h, t, createdAt, updatedAt, updatedBy).
- Jobs, members, fitters, invitations, licences, Academy, support, Mobile photos (Storage, a separate service) are untouched.

## Check it BEFORE publishing (no emulator needed): Rules Playground
In the Console's Rules editor press **Rules Playground**; it tests the draft without publishing. Use your own company id and a member uid:
1. get `companies/<your-company-id>/estimatorSheets/test1`, Authenticated as your member: Allow.
2. Same, as a uid of another company (or a made-up uid): Deny. Unauthenticated: Deny.
3. create `companies/<your-company-id>/estimatorSheets/test1` as your member with {name:"TEST", w:2800, h:2070, createdAt:"", updatedAt:"", updatedBy:""}: Allow.
   Same with w = -5, or with an extra field: Deny.
4. get `companies/<your-company-id>/jobs/anything` as your member: Allow. As the other uid: Deny. (Existing behaviour, must not change.)
5. Only then Publish.

## Rollback
Before editing, copy the whole current rules text into a safe file. To undo: paste it back and Publish (the Console also keeps a rules history).

## Verified here (container)
- `node tests/firestore-rules-addition-check.cjs`: against the repo's rules file, exactly these 12 lines are added, 0 changed, 0 removed, braces balance, placement is inside the companies block before `invitations`.
- Not verified here: how the rule behaves when evaluated. The Firebase emulator could not be downloaded in the build environment. `tests/firestore-rules-estimator-sheets.cjs`
  does that check on any computer with Java and node (it composes the repo file plus this block), but it has NOT been run yet.
