import re
import html
from typing import Optional

def sanitize_text(text: Optional[str]) -> str:
    """
    Sanitize text input by removing dangerous HTML tags, excessive whitespace,
    and stripping potential injection vectors.
    """
    if not text:
        return ""
    # Unescape then re-escape / clean HTML
    cleaned = html.unescape(text)
    # Remove HTML tags
    cleaned = re.sub(r"<[^>]*>", "", cleaned)
    # Remove control characters except standard line breaks
    cleaned = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", cleaned)
    return cleaned.strip()

def sanitize_contact_name(name: Optional[str]) -> str:
    """
    Sanitize customer contact name.
    """
    if not name:
        return "Unknown Contact"
    cleaned = sanitize_text(name)
    # Limit length
    return cleaned[:100]

def sanitize_phone(phone: Optional[str]) -> Optional[str]:
    """
    Normalize phone number to digits and optional '+' prefix.
    """
    if not phone:
        return None
    cleaned = re.sub(r"[^\d+]", "", phone)
    return cleaned[:20] if cleaned else None
