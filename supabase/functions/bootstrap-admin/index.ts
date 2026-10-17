// bootstrap-admin — one-time first-admin creation.
// Guarded by BOOTSTRAP_ADMIN_TOKEN. Refuses to run if ANY admin already exists.
// POST body: { email, password, full_name? }
// Header:  x-bootstrap-token: <BOOTSTRAP_ADMIN_TOKEN>
import { badRequest, handleOptions, json } from "../_shared/cors.ts";
import { adminClient, audit } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") return badRequest("method not allowed", 405);

  const expected = Deno.env.get("BOOTSTRAP_ADMIN_TOKEN");
  const provided = req.headers.get("x-bootstrap-token");
  if (!expected || !provided || provided !== expected) {
    return badRequest("forbidden", 403);
  }

  let body: { email?: string; password?: string; full_name?: string };
  try { body = await req.json(); } catch { return badRequest("invalid json"); }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const fullName = (body.full_name ?? "Administrator").trim();
  if (!email || !password) return badRequest("email and password required");
  if (password.length < 10) return badRequest("password must be at least 10 characters");

  const admin = adminClient();

  const { count, error: cErr } = await admin
    .from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin");
  if (cErr) return badRequest(cErr.message, 500);
  if ((count ?? 0) > 0) return badRequest("an admin already exists; use the invite flow", 409);

  const { data: created, error: uErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (uErr) return badRequest(uErr.message, 400);

  const { error: pErr } = await admin
    .from("profiles")
    .update({ role: "admin", full_name: fullName, onboarding_complete: true, onboarding_step: 5 })
    .eq("id", created.user.id);
  if (pErr) return badRequest(pErr.message, 500);

  await admin.from("activity_events").insert({
    user_id: created.user.id, email, role: "admin",
    event_type: "admin_bootstrap", entity_type: "profile", entity_id: created.user.id,
    metadata: { note: "first admin created via bootstrap" },
  });
  await audit(created.user.id, email, "bootstrap_admin", "profile", created.user.id, null, { role: "admin" });

  return json({ ok: true, user_id: created.user.id, email, role: "admin" });
});
