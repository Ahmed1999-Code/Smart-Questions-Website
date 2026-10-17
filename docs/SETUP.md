# EduAI Pro — Setup & Deployment Runbook (Phase A)

This runbook stands up the **secure backend foundation** (Supabase) and wires the
existing static site to it. Nothing here exposes secrets to the browser.

> ⚠️ **Do the emergency secret rotation first (Section 0).** The old admin
> password and a GitHub token were publicly served. They are compromised.

---

## 0. Emergency rotation (do this BEFORE anything else)

These values were publicly exposed and must be treated as **already leaked**.

| # | What | Action |
|---|------|--------|
| S1 | `/Link This Website/Username AND PASSWORD ADMIN .txt` (served live) | File has been deleted from the repo. **Rotate the admin password** (Section 4 issues a new one). Confirm the file returns 404 on the live host. |
| S3 | GitHub PAT `ghp_…` embedded in `.git/config` origin URL | **Revoke the token** at https://github.com/settings/tokens. |
| S2 | Hardcoded base64 admin creds in `auth.html` | Removed (auth.html rewritten). No action beyond deploy. |

### 0.1 Revoke the GitHub token
1. Open https://github.com/settings/tokens and delete the leaked token.
2. Update the local remote without a token:
   ```powershell
   git remote set-url origin https://github.com/<owner>/<repo>.git
   ```
3. (Recommended) `git config --local credential.helper manager` and sign in via Git Credential Manager instead.

### 0.2 Purge the secrets from git history (destructive — confirm with owner first)
Deleting the file only removes it from the latest commit; it remains in history.
Only run this after you have rotated the secrets and coordinated with collaborators.

```powershell
# Option A — git filter-repo (preferred)
pip install git-filter-repo
git filter-repo --invert-paths --path "Link This Website/Username AND PASSWORD ADMIN .txt"
git push --force --all

# Option B — BFG
java -jar bfg.jar --delete-files "Username AND PASSWORD ADMIN .txt" .git
git reflog expire --expire=now --all; git gc --prune=now --aggressive
git push --force --all
```

> After a force-push, every collaborator must re-clone. Also rotate anything
> that was ever in `.git/config`.

---

## 1. Create the Supabase project

1. Create a project at https://supabase.com (note the **Project URL** and **anon public key**).
2. Keep the **service_role key** server-side only — it goes in Edge Function secrets, never in the site.

## 2. Apply the database schema

Via the Supabase CLI (recommended):

```powershell
# from the repo root
supabase login
supabase link --project-ref <your-project-ref>
supabase db push          # applies supabase/migrations/*.sql in order
```

Or paste each file in order into the SQL editor:
1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_rls.sql`
3. `supabase/migrations/0003_triggers.sql`
4. `supabase/migrations/0004_seed.sql`

Verify:
```sql
select count(*) from public.role_permissions;   -- expect many rows
select value from public.app_config where key = 'signup';
```

## 3. Deploy Edge Functions

```powershell
supabase functions deploy bootstrap-admin
supabase functions deploy invite-instructor
supabase functions deploy accept-invite
supabase functions deploy log-event
```

`verify_jwt` is configured per function in `supabase/config.toml`
(`bootstrap-admin` uses a custom token instead of a JWT).

### Set function secrets
```powershell
supabase secrets set `
  BOOTSTRAP_ADMIN_TOKEN="<long-random-string>" `
  SITE_URL="https://your-new-host.example" `
  ALLOWED_ORIGIN="https://your-new-host.example" `
  EMAIL_PROVIDER="supabase" `
  MAIL_FROM="no-reply@your-domain.example"
```
Add provider keys later when you pick an email vendor
(`RESEND_API_KEY`, `SENDGRID_API_KEY`, or `POSTMARK_TOKEN`).

## 4. Create the first admin (one-time)

```powershell
$body = @{ email = "owner@your-domain.example"; password = "STRONG-UNIQUE-PASSWORD"; full_name = "Platform Owner" } | ConvertTo-Json
Invoke-RestMethod -Method Post `
  -Uri "https://<project-ref>.supabase.co/functions/v1/bootstrap-admin" `
  -Headers @{ "x-bootstrap-token" = "<the BOOTSTRAP_ADMIN_TOKEN>"; "Content-Type" = "application/json" } `
  -Body $body
```

The function **refuses** to run if any admin already exists. After it succeeds you
may unset `BOOTSTRAP_ADMIN_TOKEN`.

## 5. Configure Auth settings (Supabase dashboard → Authentication)

- **Email**: enable "Confirm email" (the app tells users to verify).
- **Email templates**: sender name "EduAI Pro".
- **Providers**: enable Google / GitHub only if you want social login; set the
  callback URL to `https://your-host/auth.html` (and `.../reset-password.html` for password reset).
- **URL configuration**: Site URL = your host; add `https://your-host/**` to redirect allow-list.
- (Later) Plug in a custom SMTP provider when you pick one — the app does not need changes.

## 6. Point the front-end at Supabase

Edit `supabase-config.js`:
```js
window.EDUAI_SUPABASE_CONFIG = {
  url: "https://<project-ref>.supabase.co",
  anonKey: "<anon public key>",     // public by design
};
```
The **anon key is safe to ship** — Row-Level Security enforces every rule server-side.

## 7. Hosting (security headers)

This repo includes ready-made configs:
- **Netlify** → `netlify.toml` (publish = repo root, security headers, 404).
- **Cloudflare Pages** → `public/_headers` (build output = `/public` folder contents plus site; or copy `_headers` to publish root).
- **Vercel** → `vercel.json`.

Deploy the static site to one of these (NOT plain GitHub Pages) so HSTS/CSP and
clean 404 handling are available.

> Netlify: set **Publish directory = `.`** and no build command.
> Cloudflare Pages: set **Build output directory = `.`** and copy `public/_headers` to repo root as `_headers` (Cloudflare reads `_headers` from the output root).

---

## 8. Local development (optional)

```powershell
supabase start          # local Postgres + Auth + Functions
supabase db reset       # applies migrations
supabase functions serve bootstrap-admin --no-verify-jwt
```
Then set `supabase-config.js` to the local URL/anon key printed by `supabase start`.

---

## Architecture recap

- **Roles**: `admin` | `instructor` | `student` — DB enum + CHECK.
- **Public signup → student only** (forced by `handle_new_user` trigger; client metadata is ignored).
- **Instructor** is granted only through the admin invite flow (`invite-instructor` → `accept-invite`).
- **First admin** only via `bootstrap-admin` (self-disabling).
- **Authorization** is enforced by **RLS policies + column privileges** and Edge Functions — never by the UI.
- **Activity** is append-only with server timestamps; **no IP is ever stored**; device is a UA-derived summary only.
- **Engagement thresholds** live in `app_config.engagement` (admin-tunable).

See `docs/TESTS_PHASE_A.md` for the verification checklist.
