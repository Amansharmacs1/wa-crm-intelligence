import emailjs from '@emailjs/browser';

// ============================================================
// EmailJS Configuration — Single Universal Template
// Template variables used:
//   {{email_subject}}  → email subject line
//   {{to_email}}       → recipient address
//   {{{email_body}}}   → HTML body (triple braces = raw HTML, no escaping)
//
// .env keys required:
//   VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
//   VITE_EMAILJS_PUBLIC_KEY=your_public_key
//   VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx   ← single template for all
// ============================================================

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || '';
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';

export const isEmailJSConfigured = (): boolean =>
  Boolean(SERVICE_ID && PUBLIC_KEY && TEMPLATE_ID);

// ─── Internal sender ────────────────────────────────────────────────────────

async function sendEmail(toEmail: string, subject: string, bodyHtml: string): Promise<void> {
  if (!isEmailJSConfigured()) {
    console.warn('[EmailJS] Not configured — skipping custom email.');
    return;
  }

  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_email:      toEmail,
      email_subject: subject,
      email_body:    bodyHtml,   // rendered into {{{email_body}}} (unescaped HTML)
    },
    PUBLIC_KEY
  );
}

// ─── Magic Link Login Email ──────────────────────────────────────────────────

export async function sendMagicLinkEmail(
  toEmail: string,
  toName: string,
  magicLink: string
): Promise<void> {
  const subject = 'Your Wa-CRM sign-in link';
  const body = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8f9fa;padding:32px;border-radius:12px;">
      <div style="background:#101a35;border-radius:10px;padding:24px 32px;">
        <h2 style="color:#fff;margin:0 0 6px;font-size:20px;">Wa-CRM Intelligence</h2>
        <p style="color:#a0aec0;margin:0;font-size:13px;">Revenue Intelligence Platform</p>
      </div>
      <div style="background:#fff;border-radius:10px;padding:32px;margin-top:16px;border:1px solid #e2e8f0;">
        <p style="font-size:15px;color:#1a202c;margin-top:0;">Hi <strong>${toName || toEmail.split('@')[0]}</strong>,</p>
        <p style="font-size:14px;color:#4a5568;line-height:1.6;">
          Click the button below to sign in to your Wa-CRM workspace. This link is valid for <strong>10 minutes</strong> and can only be used once.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${magicLink}"
             style="background:#101a35;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
            Sign in to Wa-CRM →
          </a>
        </div>
        <p style="font-size:12px;color:#718096;border-top:1px solid #e2e8f0;padding-top:16px;margin-bottom:0;">
          If you didn't request this email, you can safely ignore it. Your account remains secure.
        </p>
      </div>
      <p style="font-size:11px;color:#a0aec0;text-align:center;margin-top:16px;">
        © Wa-CRM Intelligence · <a href="mailto:support@wacrm.io" style="color:#a0aec0;">support@wacrm.io</a>
      </p>
    </div>`;

  await sendEmail(toEmail, subject, body);
}

// ─── Welcome Email (after signup) ───────────────────────────────────────────

export async function sendWelcomeEmail(
  toEmail: string,
  toName: string,
  company: string
): Promise<void> {
  const subject = `Welcome to Wa-CRM Intelligence, ${toName}!`;
  const loginUrl = `${window.location.origin}/login`;
  const body = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8f9fa;padding:32px;border-radius:12px;">
      <div style="background:#101a35;border-radius:10px;padding:24px 32px;">
        <h2 style="color:#fff;margin:0 0 6px;font-size:20px;">Welcome to Wa-CRM 🎉</h2>
        <p style="color:#a0aec0;margin:0;font-size:13px;">Revenue Intelligence Platform</p>
      </div>
      <div style="background:#fff;border-radius:10px;padding:32px;margin-top:16px;border:1px solid #e2e8f0;">
        <p style="font-size:15px;color:#1a202c;margin-top:0;">Hi <strong>${toName}</strong>,</p>
        <p style="font-size:14px;color:#4a5568;line-height:1.6;">
          Your <strong>${company}</strong> workspace is ready on Wa-CRM Intelligence. You can now extract lead insights, track deals, and rescue at-risk conversations — all from WhatsApp.
        </p>
        <div style="background:#f0f4ff;border-radius:8px;padding:16px;margin:20px 0;font-size:13px;color:#2d3748;">
          <p style="margin:0 0 8px;font-weight:600;">🚀 Get started:</p>
          <p style="margin:4px 0;">1. Install the Chrome Extension</p>
          <p style="margin:4px 0;">2. Open WhatsApp Web and scan a conversation</p>
          <p style="margin:4px 0;">3. View your AI-scored leads on the dashboard</p>
        </div>
        <div style="text-align:center;margin:24px 0;">
          <a href="${loginUrl}"
             style="background:#101a35;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
            Go to Dashboard →
          </a>
        </div>
        <p style="font-size:12px;color:#718096;border-top:1px solid #e2e8f0;padding-top:16px;margin-bottom:0;">
          Questions? Reply to this email or contact us at <a href="mailto:support@wacrm.io" style="color:#101a35;">support@wacrm.io</a>
        </p>
      </div>
      <p style="font-size:11px;color:#a0aec0;text-align:center;margin-top:16px;">
        © Wa-CRM Intelligence · <a href="mailto:support@wacrm.io" style="color:#a0aec0;">support@wacrm.io</a>
      </p>
    </div>`;

  await sendEmail(toEmail, subject, body);
}

// ─── Password Reset Email ────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  toEmail: string,
  toName: string,
  resetLink: string
): Promise<void> {
  const subject = 'Reset your Wa-CRM password';
  const body = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8f9fa;padding:32px;border-radius:12px;">
      <div style="background:#101a35;border-radius:10px;padding:24px 32px;">
        <h2 style="color:#fff;margin:0 0 6px;font-size:20px;">Wa-CRM Intelligence</h2>
        <p style="color:#a0aec0;margin:0;font-size:13px;">Password Reset Request</p>
      </div>
      <div style="background:#fff;border-radius:10px;padding:32px;margin-top:16px;border:1px solid #e2e8f0;">
        <p style="font-size:15px;color:#1a202c;margin-top:0;">Hi <strong>${toName || toEmail.split('@')[0]}</strong>,</p>
        <p style="font-size:14px;color:#4a5568;line-height:1.6;">
          We received a request to reset your password. Click the button below to set a new one. This link expires in <strong>1 hour</strong>.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${resetLink}"
             style="background:#c0392b;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
            Reset My Password →
          </a>
        </div>
        <p style="font-size:12px;color:#718096;border-top:1px solid #e2e8f0;padding-top:16px;margin-bottom:0;">
          If you didn't request a password reset, ignore this email — your account is safe.
        </p>
      </div>
      <p style="font-size:11px;color:#a0aec0;text-align:center;margin-top:16px;">
        © Wa-CRM Intelligence · <a href="mailto:support@wacrm.io" style="color:#a0aec0;">support@wacrm.io</a>
      </p>
    </div>`;

  await sendEmail(toEmail, subject, body);
}
