/* EduAI Pro — Supabase client wrapper (no build step).
 * Requires, loaded BEFORE this file:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="supabase-config.js"></script>
 * Then this module exposes `window.EduAIAuth`.
 * The anon key is public by design; all rules are enforced by RLS server-side.
 */
(function () {
  "use strict";

  var cfg = window.EDUAI_SUPABASE_CONFIG || {};
  if (!cfg.url || !cfg.anonKey || cfg.url.indexOf("YOUR-PROJECT") !== -1) {
    console.warn("[EduAI] Supabase config not set. Edit supabase-config.js.");
  }
  if (!window.supabase || !window.supabase.createClient) {
    throw new Error("[EduAI] supabase-js UMD bundle not loaded.");
  }

  var client = window.supabase.createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  var SESSION_KEY = "eduai.session.id";

  function sessionId() {
    var id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + "-" + Math.random());
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  var EduAIAuth = {
    client: client,
    sessionId: sessionId,

    getSession: function () {
      return client.auth.getSession().then(function (r) {
        return (r && r.data && r.data.session) || null;
      });
    },

    getUser: function () {
      return client.auth.getUser().then(function (r) {
        return (r && r.data && r.data.user) || null;
      });
    },

    // Reads the caller's own profile (RLS-protected).
    getProfile: function () {
      return client.from("profiles").select("*").maybeSingle().then(function (r) {
        if (r.error) throw r.error;
        return r.data || null;
      });
    },

    // Public signup is ALWAYS a student. Role is forced by a DB trigger.
    signUpStudent: function (email, password, fullName) {
      return client.auth.signUp({
        email: email,
        password: password,
        options: { data: { full_name: fullName || "" } },
      }).then(function (r) {
        if (r.error) throw r.error;
        return r.data;
      });
    },

    signIn: function (email, password) {
      return client.auth.signInWithPassword({ email: email, password: password })
        .then(function (r) {
          if (r.error) throw r.error;
          return r.data;
        });
    },

    signInWithOAuth: function (provider) {
      return client.auth.signInWithOAuth({
        provider: provider,
        options: { redirectTo: window.location.origin + "/dashboard.html" },
      });
    },

    signOut: function () {
      try { EduAIAuth.logEvent("logout"); } catch (e) { /* ignore */ }
      return client.auth.signOut();
    },

    sendReset: function (email) {
      return client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password.html",
      }).then(function (r) { if (r.error) throw r.error; return true; });
    },

    updatePassword: function (newPassword) {
      return client.auth.updateUser({ password: newPassword })
        .then(function (r) { if (r.error) throw r.error; return true; });
    },

    updateProfile: function (patch) {
      return EduAIAuth.getUser().then(function (u) {
        if (!u) throw new Error("not signed in");
        return client.from("profiles")
          .update(patch).eq("id", u.id).select().maybeSingle()
          .then(function (r) { if (r.error) throw r.error; return r.data; });
      });
    },

    logEvent: function (eventType, entityType, entityId, metadata) {
      return client.functions.invoke("log-event", {
        body: {
          event_type: eventType,
          entity_type: entityType || null,
          entity_id: entityId != null ? String(entityId) : null,
          metadata: metadata || {},
          session_id: sessionId(),
        },
      }).catch(function () { /* logging must never break UX */ });
    },

    callFunction: function (name, body) {
      return client.functions.invoke(name, { body: body || {} })
        .then(function (r) { if (r.error) throw r.error; return r.data; });
    },

    onChange: function (cb) {
      return client.auth.onAuthStateChange(function (_evt, session) { cb(session); });
    },
  };

  window.EduAIAuth = EduAIAuth;
})();
