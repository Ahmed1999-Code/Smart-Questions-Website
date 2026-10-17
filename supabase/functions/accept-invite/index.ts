// accept-invite — the authenticated invitee redeems their instructor invite.
// POST body: { token }
// Requires: an authenticated session whose email matches the invite email.
import { badRequest, handleOptions, json } from "../_shared/cors.ts";
import { adminClient, audit, deviceSummary, getCallerProfile } from "../_shared/supabase.ts";

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") return badRequest("method not allowed", 405);

  const { user, profile } = await getCallerProfile(req.headers.get("authorization"));
  if (!user || !profile) return badRequest("unauthenticated", 401);

  let body: { token?: string };
  try { body = await req.json(); } catch { return badRequest("invalid json"); }
  const token = (body.token ?? "").trim();
  if (!token) return badRequest("token required");

  const admin = adminClient();
  const tokenHash = await sha256Hex(token);

  const { data: invite, error } = await admin
    .from("instructor_invites").select("*").eq("token_hash", tokenHash).maybeSingle();
  if (error) return badRequest(error.message, 500);
  if (!invite) return badRequest("invalid invite", 404);
  if (invite.accepted_at) return badRequest("invite already used", 409);
  if (invite.revoked_at) return badRequest("invite revoked", 410);
  if (new Date(invite.expires_at).getTime() < Date.now()) return badRequest("invite expired", 410);

  if (String(profile.email).toLowerCase() !== String(invite.email).toLowerCase()) {
    return badRequest("sign in with the invited email address", 403);
  }

  const { error: upErr } = await admin
    .from("profiles").update({ role: "instructor" }).eq("id", user.id);
  if (upErr) return badRequest(upErr.message, 500);

  await admin.from("instructor_invites")
    .update({ accepted_at: new Date().toISOString() }).eq("id", invite.id);

  await admin.from("activity_events").insert({
    user_id: user.id, email: profile.email, role: "instructor",
    event_type: "instructor_invite_accepted", entity_type: "instructor_invite", entity_id: invite.id,
    device_summary: deviceSummary(req),
  });
  await audit(user.id, profile.email, "accept_invite", "instructor_invite", invite.id, null, { role: "instructor" });

  return json({ ok: true, role: "instructor" });
});
