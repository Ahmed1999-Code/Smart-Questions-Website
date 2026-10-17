// Shared helpers: service-role client, caller verification, guards.
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export function adminClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// Client bound to the caller's JWT (respects RLS).
export function userClient(authHeader: string | null): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  return createClient(url, anon, {
    global: { headers: { Authorization: authHeader ?? "" } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getCaller(authHeader: string | null) {
  if (!authHeader) return null;
  const admin = adminClient();
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  const { data, error } = await admin.auth.getUser(jwt);
  if (error) return null;
  return data.user;
}

export async function getCallerProfile(authHeader: string | null) {
  const user = await getCaller(authHeader);
  if (!user) return { user: null, profile: null };
  const admin = adminClient();
  const { data: profile } = await admin
    .from("profiles").select("*").eq("id", user.id).single();
  return { user, profile };
}

// Best-effort device summary derived ONLY from the User-Agent header.
// No IP address is ever read or stored.
export function deviceSummary(req: Request): string {
  const ua = req.headers.get("user-agent") ?? "unknown";
  const mobile = /Mobile|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";
  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /OPR\//.test(ua) ? "Opera" :
    /Chrome\//.test(ua) ? "Chrome" :
    /Safari\//.test(ua) ? "Safari" :
    /Firefox\//.test(ua) ? "Firefox" : "other";
  const os =
    /Windows/i.test(ua) ? "Windows" :
    /Mac OS X/i.test(ua) ? "macOS" :
    /Android/i.test(ua) ? "Android" :
    /(iPhone|iPad|iPod)/i.test(ua) ? "iOS" :
    /Linux/i.test(ua) ? "Linux" : "other";
  return `${os} · ${browser} · ${mobile}`;
}

export async function audit(
  actorId: string | null,
  actorEmail: string | null,
  action: string,
  targetType: string | null,
  targetId: string | null,
  before: unknown = null,
  after: unknown = null,
) {
  const admin = adminClient();
  await admin.from("audit_log").insert({
    actor_id: actorId, actor_email: actorEmail, action,
    target_type: targetType, target_id: targetId, before, after,
  });
}
