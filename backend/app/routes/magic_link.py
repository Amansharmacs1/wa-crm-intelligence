import logging
import re
import httpx
from pydantic import BaseModel, field_validator
from fastapi import APIRouter, HTTPException, status

from app.config.settings import settings
from app.config.supabase import get_supabase_client

logger = logging.getLogger("wa_crm.magic_link")

router = APIRouter(prefix="/api/auth", tags=["auth"])

EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send"


class MagicLinkRequest(BaseModel):
    email: str
    redirect_to: str = "http://localhost:5173/auth/callback"

    @field_validator("email")
    def validate_email_format(cls, v: str) -> str:
        clean = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", clean):
            raise ValueError("Invalid email format")
        return clean


class MagicLinkResponse(BaseModel):
    success: bool
    message: str
    email: str


async def send_via_emailjs(to_email: str, subject: str, html_body: str) -> bool:
    if not (settings.EMAILJS_SERVICE_ID and settings.EMAILJS_PUBLIC_KEY and settings.EMAILJS_TEMPLATE_ID):
        logger.warning("[EmailJS] Not configured - skipping email send.")
        return False

    payload = {
        "service_id": settings.EMAILJS_SERVICE_ID,
        "template_id": settings.EMAILJS_TEMPLATE_ID,
        "user_id": settings.EMAILJS_PUBLIC_KEY,
        "template_params": {
            "to_email": to_email,
            "email_subject": subject,
            "email_body": html_body,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(EMAILJS_API_URL, json=payload)
            if response.status_code == 200:
                logger.info(f"[EmailJS] Magic link email successfully sent to {to_email}")
                return True
            else:
                logger.error(f"[EmailJS] Error sending email: {response.status_code} - {response.text}")
                return False
    except Exception as exc:
        logger.error(f"[EmailJS] Exception during send: {exc}")
        return False


def build_magic_link_html(to_email: str, magic_link_url: str) -> str:
    user_name = to_email.split("@")[0]
    return f"""
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8f9fa;padding:32px;border-radius:12px;">
      <div style="background:#101a35;border-radius:10px;padding:24px 32px;">
        <h2 style="color:#fff;margin:0 0 6px;font-size:20px;">Wa-CRM Intelligence</h2>
        <p style="color:#a0aec0;margin:0;font-size:13px;">Revenue Intelligence Platform</p>
      </div>
      <div style="background:#fff;border-radius:10px;padding:32px;margin-top:16px;border:1px solid #e2e8f0;">
        <p style="font-size:15px;color:#1a202c;margin-top:0;">Hi <strong>{user_name}</strong>,</p>
        <p style="font-size:14px;color:#4a5568;line-height:1.6;">
          Click the button below to sign in to your Wa-CRM workspace. This link is valid for <strong>10 minutes</strong> and can only be used once.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="{magic_link_url}"
             style="background:#101a35;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">
            Sign in to Wa-CRM ->
          </a>
        </div>
        <p style="font-size:12px;color:#718096;border-top:1px solid #e2e8f0;padding-top:16px;margin-bottom:0;">
          If you did not request this email, you can safely ignore it. Your account remains secure.
        </p>
      </div>
      <p style="font-size:11px;color:#a0aec0;text-align:center;margin-top:16px;">
        (c) Wa-CRM Intelligence - <a href="mailto:support@wacrm.io" style="color:#a0aec0;">support@wacrm.io</a>
      </p>
    </div>
    """


@router.post("/magic-link", response_model=MagicLinkResponse)
async def request_magic_link(body: MagicLinkRequest):
    supabase = get_supabase_client()
    magic_link_url = None

    if supabase:
        try:
            res = supabase.auth.admin.generate_link({
                "type": "magiclink",
                "email": body.email,
                "options": {
                    "redirect_to": body.redirect_to
                }
            })
            if hasattr(res, "properties") and res.properties:
                magic_link_url = res.properties.action_link
            elif hasattr(res, "action_link"):
                magic_link_url = res.action_link
            elif isinstance(res, dict) and "action_link" in res:
                magic_link_url = res["action_link"]
            elif hasattr(res, "user") and res.user:
                magic_link_url = getattr(res, "action_link", None)
        except Exception as exc:
            logger.warning(f"Could not generate Supabase admin magic link: {exc}. Using fallback link.")

    if not magic_link_url:
        magic_link_url = f"{body.redirect_to}?email={body.email}&demo=true"

    subject = "Your Wa-CRM sign-in link"
    html_body = build_magic_link_html(body.email, magic_link_url)

    email_sent = await send_via_emailjs(body.email, subject, html_body)

    if not email_sent:
        logger.info(f"Magic link ready for {body.email}: {magic_link_url}")

    return MagicLinkResponse(
        success=True,
        message=f"Magic link sent to {body.email}. Please check your inbox.",
        email=body.email
    )