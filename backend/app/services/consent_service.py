import re
import logging
from datetime import datetime, timezone
from typing import Tuple
from app.schemas.consent import ConsentSchema
from app.utils.validators import parse_iso_timestamp, current_utc_time
from app.config.settings import settings

logger = logging.getLogger("wa_crm.consent")

# Permitted scopes
VALID_SCOPES = {
    "current-conversation-analysis",
    "currently-open-conversation"
}

# Ambiguous words to explicitly reject
AMBIGUOUS_PATTERNS = [
    r"\bmaybe\b", r"\blater\b", r"\bthinking\b", r"\bnot sure\b",
    r"\bdon'?t know\b", r"\bcall me\b", r"\bwho is this\b", r"\bwhy\b",
    r"\bno\b", r"\bnever\b", r"\bstop\b", r"\bunsubscribe\b"
]

class ConsentService:
    @staticmethod
    def validate_consent(consent: ConsentSchema) -> Tuple[bool, str]:
        """
        Validates customer consent according to strict privacy requirements.
        Returns (is_valid: bool, reason: str).
        If is_valid is False, the request must be rejected with 403 Forbidden.
        """
        # 1. Status and Granted Check
        if not consent.status or consent.status.lower() != "approved":
            return False, "Customer consent status is not approved."

        if consent.granted is False:
            return False, "Customer consent was explicitly declined."

        # 2. Scope Validation
        if not consent.scope or consent.scope not in VALID_SCOPES:
            return False, f"Invalid consent scope '{consent.scope}'. Permitted: {list(VALID_SCOPES)}"

        # 3. Explicit Positive Response Validation
        response_text = (consent.response or "").strip().upper()
        if not response_text:
            return False, "Customer response is missing. Explicit YES approval required."

        # Check for explicit YES
        # Accept "YES", "Y", "1"
        clean_resp = re.sub(r"[^\w\s]", "", response_text)
        is_yes = clean_resp in ["YES", "Y", "1", "TRUE"] or re.search(r"\bYES\b", clean_resp)
        
        # Check if customer gave an ambiguous or negative reply
        for pattern in AMBIGUOUS_PATTERNS:
            if re.search(pattern, response_text, re.IGNORECASE):
                return False, f"Customer response '{response_text}' is ambiguous or negative. Consent rejected."

        if not is_yes:
            return False, f"Customer response '{response_text}' is not an explicit positive approval (YES)."

        # 4. Timestamp & Expiration Validation (10-minute window)
        now = current_utc_time()
        req_time = parse_iso_timestamp(consent.requestedAt)
        resp_time = parse_iso_timestamp(consent.respondedAt or consent.grantedAt)

        if resp_time is not None:
            # Check if respondedAt is in the future beyond clock skew (5 min allowance)
            if (resp_time - now).total_seconds() > 300:
                return False, "Consent response timestamp is in the future."

            # If both requestedAt and respondedAt exist, respondedAt must be after requestedAt
            if req_time is not None:
                if resp_time < req_time:
                    return False, "Consent response timestamp cannot be before requested timestamp."
                diff_seconds = (resp_time - req_time).total_seconds()
                if diff_seconds > settings.CONSENT_TIMEOUT_SECONDS:
                    return False, f"Consent expired: Response took {int(diff_seconds)}s, exceeding maximum allowed {settings.CONSENT_TIMEOUT_SECONDS}s window."

            # Check if the consent itself has expired relative to current time
            age_seconds = (now - resp_time).total_seconds()
            if age_seconds > settings.CONSENT_TIMEOUT_SECONDS:
                return False, f"Consent expired: Granted {int(age_seconds)}s ago, exceeding 10-minute validity."

        return True, "Consent valid and verified."
