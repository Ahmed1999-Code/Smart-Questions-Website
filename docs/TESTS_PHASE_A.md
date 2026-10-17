# Phase A — Verification Checklist

Run after Sections 1–6 of `docs/SETUP.md`. Each test has a **pass condition**.
Tests marked *(manual)* need a browser; the rest are API/SQL and can be scripted.

Legend: `$ANON` = anon key, `$URL` = project URL, `$SVC` = service_role key.

---

## A1. Public signup can NEVER create a non-student *(manual)*
1. In the browser console on `/auth.html`, force a role injection:
   ```js
   await EduAIAuth.client.auth.signUp({
     email: "rolehack@example.com", password: "Password123!",
     options: { data: { role: "admin", full_name: "Hacker" } }
   });
   ```
2. In SQL: `select role from public.profiles where email = 'rolehack@example.com';`

**Pass:** role = `student`. (The `handle_new_user` trigger ignores client metadata.)

## A2. Signup UI offers no privileged role *(manual)*
- Open `/auth.html?mode=signup`.

**Pass:** there is **no** Admin/Teacher selector; only student signup fields.

## A3. Student cannot change their own role (SQL / API)
Sign in as a student, then:
```js
await EduAIAuth.client.from("profiles").update({ role: "admin" }).eq("id", "<student-id>");
```
**Pass:** request errors (permission denied on column `role`) — column privilege revoked.

## A4. Student cannot self-complete onboarding (API)
```js
await EduAIAuth.client.from("profiles").update({ onboarding_complete: true }).eq("id", "<student-id>");
```
**Pass:** error — `onboarding_complete` is not a grantable column; only
`complete_onboarding()` / admin / service role may set it.

## A5. Student cannot read other profiles (RLS)
As student A:
```js
const r = await EduAIAuth.client.from("profiles").select("email");
```
**Pass:** only A's own row is returned. As an instructor with an enrollment,
that instructor can read the enrolled student's row; other students remain hidden.

## A6. Login routes by role *(manual)*
- Student w/ onboarding incomplete → `/onboarding.html`
- Student w/ onboarding complete → `/dashboard.html`
- Instructor → `/instructor.html`
- Admin → `/admin.html`

**Pass:** each role lands on the correct page. (Admin/instructor pages arrive in later phases; until then they may 404 — routing itself is what is verified.)

---

## A7. First-admin bootstrap is one-shot
```powershell
# First call
Invoke-RestMethod -Method Post -Uri "$URL/functions/v1/bootstrap-admin" `
  -Headers @{ "x-bootstrap-token" = "$ENV:BOOTSTRAP_ADMIN_TOKEN"; "Content-Type"="application/json" } `
  -Body (@{ email="owner2@example.com"; password="Password123!" } | ConvertTo-Json)
```
**Pass:** first call returns `{ ok:true }`; **second** call returns `409 "an admin already exists"`.
Wrong/no token → `403`.

## A8. Non-admin cannot invite instructors
As a student/instructor:
```js
await EduAIAuth.callFunction("invite-instructor", { email: "x@example.com" });
```
**Pass:** `403 forbidden`.

## A9. Admin invite flow works end-to-end
1. As admin: `await EduAIAuth.callFunction("invite-instructor", { email: "teach@example.com" })`
   → returns `manual_link` (when using default SMTP).
2. Sign up `teach@example.com` (normal student signup), then redeem:
   `await EduAIAuth.callFunction("accept-invite", { token: "<token from link>" })`
**Pass:** role becomes `instructor`; a second redemption → `409 already used`;
token for a **different** email → `403`.

## A10. `accept-invite` rejects expired/revoked tokens
- Set `expires_at` in the past via SQL, retry → `410 expired`.
- Revoke (`revoked_at = now()`), retry → `410 revoked`.

## A11. Activity log is append-only (RLS)
As any authenticated user:
```js
await EduAIAuth.client.from("activity_events").insert({ event_type: "login", user_id: "<own-id>" }); // ok
await EduAIAuth.client.from("activity_events").update({ event_type: "x" }).eq("user_id", "<own-id>");  // must fail
await EduAIAuth.client.from("activity_events").delete().eq("user_id", "<own-id>");                      // must fail
```
**Pass:** insert succeeds; update & delete error (no policy + privileges revoked).

## A12. No IP is ever stored
```sql
select device_summary, metadata from public.activity_events
 where device_summary ~ '[0-9]{1,3}(\.[0-9]{1,3}){3}';   -- expect 0 rows
```
**Pass:** zero rows. The `sanitize_device_summary` trigger also redacts IP-like
strings defensively. Column list contains **no** `ip` field.

## A13. `log-event` validation
```js
await EduAIAuth.callFunction("log-event", { event_type: "drop_table" });
```
**Pass:** `400 event_type not allowed`. Unauthenticated call → `401`.

---

## A14. Front-end still renders *(manual, regression)*
- `/auth.html` loads with correct theme, tabs switch, password strength bar works.
- No console errors. **No hardcoded credentials** anywhere in `auth.html`
  (`grep -i "webnexus\|atob" auth.html` → nothing).

## A15. Exposed file is gone
- Visit `https://<host>/Link%20This%20Website/Username%20AND%20PASSWORD%20ADMIN%20.txt`

**Pass:** `404`. Git history purge performed or scheduled (Section 0.2).

---

## Sign-off
| Test | Result | Notes |
|------|--------|-------|
| A1 | ☐ | |
| A2 | ☐ | |
| A3 | ☐ | |
| A4 | ☐ | |
| A5 | ☐ | |
| A6 | ☐ | |
| A7 | ☐ | |
| A8 | ☐ | |
| A9 | ☐ | |
| A10 | ☐ | |
| A11 | ☐ | |
| A12 | ☐ | |
| A13 | ☐ | |
| A14 | ☐ | |
| A15 | ☐ | |
