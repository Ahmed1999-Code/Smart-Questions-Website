// Shared CORS + response helpers for all EduAI Edge Functions.
export const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-bootstrap-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function badRequest(msg: string, status = 400): Response {
  return json({ error: msg }, status);
}

export function handleOptions(): Response {
  return new Response("ok", { headers: corsHeaders });
}
