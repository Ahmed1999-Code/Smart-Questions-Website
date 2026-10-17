// Public Supabase configuration.
// The "anon"/publishable key is DESIGNED to be public — it is safe to ship in
// client code because Row-Level Security enforces all access rules server-side.
// NEVER put the service_role key here.
window.EDUAI_SUPABASE_CONFIG = {
  url: "https://YOUR-PROJECT-ref.supabase.co",
  anonKey: "REPLACE_WITH_ANON_PUBLIC_KEY",
};
