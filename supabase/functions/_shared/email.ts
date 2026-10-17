// Email abstraction. Default provider is Supabase (no-op here: Supabase's
// built-in SMTP already delivers auth emails). Custom invite emails route
// through whichever provider is configured — swap in ONE place.
//
// EMAIL_PROVIDER = 'supabase' | 'resend' | 'sendgrid' | 'postmark'
import { json } from "./cors.ts";

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail(mail: Mail): Promise<{ delivered: boolean; provider: string }> {
  const provider = (Deno.env.get("EMAIL_PROVIDER") ?? "supabase").toLowerCase();

  try {
    switch (provider) {
      case "resend":   return await sendResend(mail);
      case "sendgrid": return await sendSendGrid(mail);
      case "postmark": return await sendPostmark(mail);
      default:         return { delivered: false, provider: "supabase" };
    }
  } catch (_e) {
    return { delivered: false, provider };
  }
}

async function sendResend(mail: Mail) {
  const key = Deno.env.get("RESEND_API_KEY")!;
  const from = Deno.env.get("MAIL_FROM")!;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: mail.to, subject: mail.subject, html: mail.html, text: mail.text }),
  });
  return { delivered: r.ok, provider: "resend" };
}

async function sendSendGrid(mail: Mail) {
  const key = Deno.env.get("SENDGRID_API_KEY")!;
  const from = Deno.env.get("MAIL_FROM")!;
  const r = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: mail.to }] }],
      from: { email: from },
      subject: mail.subject,
      content: [{ type: "text/html", value: mail.html }],
    }),
  });
  return { delivered: r.ok, provider: "sendgrid" };
}

async function sendPostmark(mail: Mail) {
  const key = Deno.env.get("POSTMARK_TOKEN")!;
  const from = Deno.env.get("MAIL_FROM")!;
  const r = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: { "X-Postmark-Server-Token": key, "Content-Type": "application/json" },
    body: JSON.stringify({ From: from, To: mail.to, Subject: mail.subject, HtmlBody: mail.html, TextBody: mail.text }),
  });
  return { delivered: r.ok, provider: "postmark" };
}

export function inviteEmail(link: string): string {
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;background:#f7f7fb;padding:32px">
  <div style="max-width:520px;margin:auto;background:#fff;border-radius:16px;padding:32px">
    <h1 style="margin:0 0 8px;font-size:20px;color:#111">You're invited to EduAI Pro</h1>
    <p style="color:#444;line-height:1.6">An administrator has invited you to join as an
    <strong>Instructor</strong>. Click below to set your password and accept.</p>
    <p style="margin:28px 0">
      <a href="${link}" style="background:#6d28d9;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;display:inline-block">Accept invitation</a>
    </p>
    <p style="color:#888;font-size:12px">If you didn't expect this, you can ignore this email.</p>
  </div></body></html>`;
}

export { json };
