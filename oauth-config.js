/* ============================================================
   OAUTH CONFIGURATION — EduAI Pro
   ============================================================
   Edit the values below with your own OAuth credentials and
   save. This file is the runtime config substitute for
   environment variables on a static (no-backend) site.

   IMPORTANT SECURITY NOTES:
   - Google uses Google Identity Services with a PUBLIC client ID
     only, so no secret is required or exposed here for Google.
   - GitHub's OAuth Web flow requires a client secret. On a purely
     static site the secret is unavoidably present in the browser.
     For production security, prefer proxying the token exchange
     through a small serverless function instead of placing the
     secret here.
   - Do NOT commit real secrets to version control. Keep this file
     out of public repositories (add it to .gitignore) and populate
     it only in your deployment.

   Where to obtain credentials:
   - Google: https://console.cloud.google.com/apis/credentials
     (create an "OAuth client ID" for a "Web application")
   - GitHub: https://github.com/settings/developers
     (create an "OAuth App")

   For GitHub, add the redirect URI below as an authorized
   callback URL in your GitHub OAuth App settings.
   ============================================================ */

window.EDUAI_OAUTH_CONFIG = {
    oAuth: {
        // Google OAuth client ID (public — safe to expose)
        googleClientId: 'YOUR_GOOGLE_CLIENT_ID',

        // GitHub OAuth App client ID (public — safe to expose)
        githubClientId: 'YOUR_GITHUB_CLIENT_ID',

        // GitHub OAuth App client secret (KEEP PRIVATE — see notes above)
        githubClientSecret: 'YOUR_GITHUB_CLIENT_SECRET',

        // Redirect URI GitHub will return to after authorization.
        // Must match exactly the callback URL registered in your
        // GitHub OAuth App. Defaults to the page that starts the
        // flow (the auth page) if left blank.
        redirectUri: ''
    }
};
