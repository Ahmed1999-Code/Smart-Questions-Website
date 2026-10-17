// invite-instructor — ADMIN ONLY. Creates a single-use, expiring invite that
// promotes the accepting user to 'instructor'. Instructors cannot be self-made.
// POST body: { email }
import { badRequest, handleOptions, json } from "../_shared/cors.ts";
import { adminClient, audit, deviceSummary, getCallerProfile } from "../_shared/supabase.ts";
import { inviteEmail, sendMail } from "../_shared/email.ts";

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") return badRequest("method not allowed", 405);

  const { user, profile } = await getCallerProfile(req.headers.get("authorization"));
  if (!user || !profile) return badRequest("unauthenticated", 401);
  if (profile.role !== "admin") return badRequest("forbidden", 403);

  let body: { email?: string };
  try { body = await req.json(); } catch { return badRequest("invalid json"); }
  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return badRequest("valid email required");

  const admin = adminClient();

  const { error: revErr } = await admin
    .from("instructor_invites")
    .update({ revoked_at: new Date().toISOString() })
    .eq("email", email).is("accepted_at", null).is("revoked_at", null);
  if (revErr) return badRequest(revErr.message, 500);

  const token = crypto.randomUUID() + "." + crypto.randomUUID();
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error: insErr } = await admin.from("instructor_invites").insert({
    email, invited_by: user.id, token_hash: tokenHash, expires_at: expiresAt,
  });
  if (insErr) return badRequest(insErr.message, 500);

  const site = Deno.env.get("SITE_URL") ?? "";
  const link = `${site}/accept-invite.html?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  const sent = await sendMail({ to: email, subject: "You're invited to EduAI Pro as an Instructor", html: inviteEmail(link) });

  await admin.from("activity_events").insert({
    user_id: user.id, email: profile.email, role: profile.role,
    event_type: "instructor_invited", entity_type: "instructor_invite", entity_id: email,
    metadata: { invited_email: email, delivered: sent.delivered, provider: sent.provider },
    device_summary: deviceSummary(req),
  });
  await audit(user.id, profile.email, "invite_instructor", "instructor_invite", email, null, { email, expires_at: expiresAt });

  // When the default SMTP path is used no custom mail is sent, so we return the
  // link to the admin so they can deliver it manually. Never returned otherwise.
  const payload: Record<string, unknown> = { ok: true, email, expires_at: expiresAt, delivered: sent.delivered, provider: sent.provider };
  if (!sent.delivered) payload.manual_link = link;
  return json(payload);
});
