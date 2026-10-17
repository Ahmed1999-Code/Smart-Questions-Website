/* EduAI Pro — route guards (UX layer only; RLS is the real enforcement).
 * Load AFTER supabase-client.js.
 *
 * Usage in a protected page <head>:
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="supabase-config.js"></script>
 *   <script src="lib/supabase-client.js"></script>
 *   <script src="lib/auth-guard.js"></script>
 *   <script>EduAIGuard.boot({ roles:["student"], requireOnboarding:true });</script>
 */
(function () {
  "use strict";

  var root = document.documentElement;
  var style = document.createElement("style");
  style.textContent = "html.eduai-guarding body{visibility:hidden!important}";
  (document.head || root).appendChild(style);
  root.classList.add("eduai-guarding");

  var cache = null;

  function ready() {
    if (cache) return Promise.resolve(cache);
    if (!window.EduAIAuth) {
      return Promise.reject(new Error("[EduAI] supabase-client.js not loaded."));
    }
    return window.EduAIAuth.getSession().then(function (session) {
      if (!session) return (cache = { session: null, profile: null });
      return window.EduAIAuth.getProfile().then(function (profile) {
        return (cache = { session: session, profile: profile });
      });
    }).catch(function () {
      return (cache = { session: null, profile: null });
    });
  }

  function reveal() { root.classList.remove("eduai-guarding"); }

  function go(url) {
    var here = window.location.pathname.split("/").pop() + window.location.search;
    var sep = url.indexOf("?") === -1 ? "?" : "&";
    window.location.replace(url + (url.indexOf("next=") === -1 ? sep + "next=" + encodeURIComponent(here) : ""));
  }

  function homeFor(role) {
    if (role === "admin") return "admin.html";
    if (role === "instructor") return "instructor.html";
    return "dashboard.html";
  }

  var EduAIGuard = {
    ready: ready,

    boot: function (opts) {
      opts = opts || {};
      return ready().then(function (ctx) {
        if (!ctx.session) { go("auth.html"); return; }

        if (!ctx.profile) {
          // Session exists but no profile row yet (rare race). Send to onboarding.
          if (opts.requireOnboarding === false) { reveal(); return; }
          go("onboarding.html"); return;
        }

        if (opts.roles && opts.roles.indexOf(ctx.profile.role) === -1) {
          go(homeFor(ctx.profile.role)); return;
        }

        if (opts.requireOnboarding !== false
            && ctx.profile.role === "student"
            && !ctx.profile.onboarding_complete) {
          go("onboarding.html"); return;
        }

        reveal();
        if (typeof opts.onReady === "function") {
          try { opts.onReady(ctx.profile, ctx.session); } catch (e) { console.error(e); }
        }
      }).catch(function (e) {
        console.error("[EduAI] guard error", e);
        reveal();
      });
    },
  };

  window.EduAIGuard = EduAIGuard;
})();
