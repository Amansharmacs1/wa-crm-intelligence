import pytest
from datetime import datetime, timezone, timedelta
from app.schemas.consent import ConsentSchema
from app.services.consent_service import ConsentService

def test_1_valid_consent():
    """Test 1: Valid explicit YES consent within 10-minute window."""
    now = datetime.now(timezone.utc)
    req_at = (now - timedelta(seconds=60)).isoformat()
    resp_at = now.isoformat()

    consent = ConsentSchema(
        status="approved",
        method="whatsapp-reply",
        requestedAt=req_at,
        respondedAt=resp_at,
        response="YES",
        scope="current-conversation-analysis"
    )
    is_valid, reason = ConsentService.validate_consent(consent)
    assert is_valid is True
    assert "verified" in reason.lower()

def test_2_no_response():
    """Test 2: Explicit NO rejection returns invalid consent."""
    now = datetime.now(timezone.utc)
    consent = ConsentSchema(
        status="denied",
        method="whatsapp-reply",
        requestedAt=(now - timedelta(seconds=30)).isoformat(),
        respondedAt=now.isoformat(),
        response="NO",
        scope="current-conversation-analysis"
    )
    is_valid, reason = ConsentService.validate_consent(consent)
    assert is_valid is False
    assert "not approved" in reason.lower() or "declined" in reason.lower()

def test_3_ambiguous_response():
    """Test 3: Ambiguous answers (maybe, later, thinking) are strictly rejected."""
    now = datetime.now(timezone.utc)
    for ambiguous in ["maybe", "later", "thinking about it", "not sure", "call me tomorrow"]:
        consent = ConsentSchema(
            status="approved",
            method="whatsapp-reply",
            requestedAt=(now - timedelta(seconds=30)).isoformat(),
            respondedAt=now.isoformat(),
            response=ambiguous,
            scope="current-conversation-analysis"
        )
        is_valid, reason = ConsentService.validate_consent(consent)
        assert is_valid is False, f"Expected '{ambiguous}' to be rejected"
        assert "ambiguous" in reason.lower() or "not an explicit positive approval" in reason.lower()

def test_4_expired_consent():
    """Test 4: Expired consent (> 10 minutes) is rejected."""
    now = datetime.now(timezone.utc)
    # Requested 20 minutes ago, responded 15 minutes ago
    req_at = (now - timedelta(minutes=20)).isoformat()
    resp_at = (now - timedelta(minutes=15)).isoformat()

    consent = ConsentSchema(
        status="approved",
        method="whatsapp-reply",
        requestedAt=req_at,
        respondedAt=resp_at,
        response="YES",
        scope="current-conversation-analysis"
    )
    is_valid, reason = ConsentService.validate_consent(consent)
    assert is_valid is False
    assert "expired" in reason.lower()

def test_5_invalid_consent_scope():
    """Test 5: Scope outside permitted set is rejected."""
    now = datetime.now(timezone.utc)
    consent = ConsentSchema(
        status="approved",
        method="whatsapp-reply",
        requestedAt=(now - timedelta(seconds=30)).isoformat(),
        respondedAt=now.isoformat(),
        response="YES",
        scope="unlimited-background-scraping"
    )
    is_valid, reason = ConsentService.validate_consent(consent)
    assert is_valid is False
    assert "scope" in reason.lower()
