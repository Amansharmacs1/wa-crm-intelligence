import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.services.database_service import DatabaseService
from app.routes.auth import get_current_user_required

client = TestClient(app)

def test_11_database_failure_resilience(monkeypatch):
    """
    Test 11: Backend gracefully falls back to local memory store when Supabase throws exceptions.
    """
    db = DatabaseService()
    # Force _get_client to return a faulty client
    class MockFaultyClient:
        def table(self, *args, **kwargs):
            raise ConnectionError("Simulated Supabase network disconnect")

    monkeypatch.setattr(db, "_get_client", lambda: MockFaultyClient())

    from app.schemas.lead import AnalysisResult
    dummy_analysis = AnalysisResult(
        summary="Test summary",
        intent="Site Visit",
        sentiment="Positive",
        leadScore=85,
        urgencyScore=80,
        revenueRiskScore=75,
        category="High Intent",
        followUpStatus="At Risk",
        recommendedAction="Call now",
        suggestedReply="Hi"
    )

    # Should not raise an exception; falls back gracefully to in-memory store
    res = db.upsert_lead("Faulty Test Contact", "+919999900000", dummy_analysis)
    assert res is not None
    assert res["contact_name"] == "Faulty Test Contact"

def test_12_authentication_failure():
    """
    Test 12: Calling authenticated endpoint without credentials returns 401 Unauthorized.
    """
    # Create an app route that strictly requires authentication
    from fastapi import Depends
    @app.get("/api/test-protected")
    def protected_route(user=Depends(get_current_user_required)):
        return {"user": user}

    # Request without header
    res = client.get("/api/test-protected")
    assert res.status_code == 401
    data = res.json()
    assert data["error"] == "Unauthorized"

def test_health_endpoint():
    """Test GET /health returns status healthy."""
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "wa-crm-intelligence-backend"

def test_post_analyze_api_flow():
    """Test full POST /api/leads/analyze flow with HTTP client."""
    now = datetime.now(timezone.utc)
    payload = {
        "consent": {
            "status": "approved",
            "response": "YES",
            "scope": "current-conversation-analysis",
            "requestedAt": (now - timedelta(seconds=20)).isoformat(),
            "respondedAt": now.isoformat()
        },
        "conversation": {
            "contactName": "Rahul Mehta",
            "source": "whatsapp-web",
            "messages": [
                {
                    "sender": "customer",
                    "text": "Sir, Whitefield wala 3BHK pasand hai. Agar 80 lakh ke around final ho jaye toh kal site visit karke token kar dunga."
                }
            ]
        }
    }

    res = client.post("/api/leads/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["lead"]["contactName"] == "Rahul Mehta"
    assert data["lead"]["budget"] == 8000000.0
    assert data["lead"]["location"] == "Whitefield"
    assert data["lead"]["requirement"] == "3BHK"
    lead_id = data["lead"]["id"]

    # Test GET /api/leads
    get_res = client.get("/api/leads")
    assert get_res.status_code == 200
    leads_list = get_res.json()
    assert any(l["id"] == lead_id for l in leads_list)

    # Test GET /api/leads/{id}
    detail_res = client.get(f"/api/leads/{lead_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["contactName"] == "Rahul Mehta"

    # Test PATCH /api/leads/{id}
    patch_res = client.patch(f"/api/leads/{lead_id}", json={"followUpStatus": "Completed"})
    assert patch_res.status_code == 200
    assert patch_res.json()["followUpStatus"] == "Completed"

    # Test GET /api/leads/{id}/conversations
    conv_res = client.get(f"/api/leads/{lead_id}/conversations")
    assert conv_res.status_code == 200
    assert conv_res.json()["count"] >= 1

def test_rejected_consent_returns_403():
    """Test that customer refusal returns 403 Forbidden with zero data processed."""
    now = datetime.now(timezone.utc)
    payload = {
        "consent": {
            "status": "denied",
            "response": "NO",
            "scope": "current-conversation-analysis",
            "requestedAt": (now - timedelta(seconds=20)).isoformat(),
            "respondedAt": now.isoformat()
        },
        "conversation": {
            "contactName": "Private Customer",
            "source": "whatsapp-web",
            "messages": [
                {"sender": "customer", "text": "Do not track me"}
            ]
        }
    }

    res = client.post("/api/leads/analyze", json=payload)
    assert res.status_code == 403
    data = res.json()
    assert data["error"] == "ConsentNotGranted"
