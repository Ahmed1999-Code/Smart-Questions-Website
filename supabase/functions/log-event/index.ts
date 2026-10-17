// log-event — authenticated activity logging. Append-only, no IP ever stored.
// POST body: { event_type, entity_type?, entity_id?, metadata?, session_id? }
//        or: { events: [ {..}, {..} ] }   (batch)
import { badRequest, handleOptions, json } from "../_shared/cors.ts";
import { adminClient, deviceSummary, getCallerProfile } from "../_shared/supabase.ts";

const ALLOWED = new Set([
  "login", "logout", "signup",
  "onboarding_step", "onboarding_complete",
  "course_view", "lesson_view", "course_enroll",
  "quiz_start", "quiz_submit", "question_view", "question_answer",
  "study_session_start", "study_session_end",
  "profile_update", "page_view",
]);

interface Ev {
  event_type?: string; entity_type?: string; entity_id?: string;
  metadata?: Record<string, unknown>; session_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  if (req.method !== "POST") return badRequest("method not allowed", 405);

  const { user, profile } = await getCallerProfile(req.headers.get("authorization"));
  if (!user || !profile) return badRequest("unauthenticated", 401);

  let body: Ev & { events?: Ev[] };
  try { body = await req.json(); } catch { return badRequest("invalid json"); }

  const list: Ev[] = Array.isArray(body.events) ? body.events : [body];
  if (list.length === 0) return badRequest("no events");
  if (list.length > 50) return badRequest("too many events (max 50)");

  const device = deviceSummary(req);
  const rows = [];
  for (const e of list) {
    const type = String(e.event_type ?? "").trim();
    if (!ALLOWED.has(type)) return badRequest(`event_type not allowed: ${type}`);
    rows.push({
      user_id: user.id,
      email: profile.email,
      role: profile.role,
      event_type: type,
      entity_type: e.entity_type ?? null,
      entity_id: e.entity_id != null ? String(e.entity_id).slice(0, 200) : null,
      metadata: (e.metadata && typeof e.metadata === "object") ? e.metadata : {},
      session_id: e.session_id ?? null,
      device_summary: device,
    });
  }

  const admin = adminClient();
  const { error } = await admin.from("activity_events").insert(rows);
  if (error) return badRequest(error.message, 500);

  await admin.from("profiles").update({ last_active_at: new Date().toISOString() }).eq("id", user.id);

  return json({ ok: true, logged: rows.length });
});
