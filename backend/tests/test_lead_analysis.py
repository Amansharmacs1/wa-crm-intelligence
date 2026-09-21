import pytest
from datetime import datetime, timezone, timedelta
from app.schemas.lead import LeadAnalysisRequest
from app.schemas.conversation import MessageSchema
from app.services.analysis_service import analysis_service
from app.services.lead_service import lead_service
from app.services.database_service import database_service

def test_8_valid_lead_analysis_extraction_and_scoring():
    """
    Test 8: Valid lead analysis extracts budget, location, requirement,
    buying signals, urgency, and explainable scoring reasons.
    """
    sample_text = (
        "Sir, Whitefield wala 3BHK pasand hai. "
        "Agar 80 lakh ke around final ho jaye toh kal site visit karke token kar dunga."
    )
    messages = [
        MessageSchema(sender="customer", text=sample_text, timestamp=datetime.now(timezone.utc).isoformat())
    ]

    analysis = analysis_service.analyze_conversation(
        contact_name="Rahul Mehta",
        messages=messages
    )

    # Assert extracted entities
    assert analysis.budget == 8000000.0, f"Expected budget 8000000, got {analysis.budget}"
    assert analysis.location == "Whitefield", f"Expected location Whitefield, got {analysis.location}"
    assert analysis.requirement == "3BHK", f"Expected requirement 3BHK, got {analysis.requirement}"
    assert analysis.purchaseTimeline == "tomorrow", f"Expected timeline tomorrow, got {analysis.purchaseTimeline}"

    # Assert buying signals
    assert "Interested in property" in analysis.buyingSignals
    assert "Discussing final price" in analysis.buyingSignals
    assert "Ready for site visit" in analysis.buyingSignals
    assert "Ready to pay token" in analysis.buyingSignals

    # Assert urgency & scoring
    assert analysis.urgencyScore >= 80, f"Expected high urgency score >= 80, got {analysis.urgencyScore}"
    assert analysis.leadScore >= 80, f"Expected high lead score >= 80, got {analysis.leadScore}"
    assert len(analysis.scoreReasons) >= 4, "Expected multiple explainable scoring reasons"
    assert any("budget" in r.lower() for r in analysis.scoreReasons)
    assert any("site visit" in r.lower() for r in analysis.scoreReasons)
    assert any("token" in r.lower() for r in analysis.scoreReasons)

def test_9_lead_creation_flow():
    """
    Test 9: Process lead analysis creates a new lead and links conversations.
    """
    now = datetime.now(timezone.utc)
    req = LeadAnalysisRequest(
        consent={
            "status": "approved",
            "response": "YES",
            "scope": "current-conversation-analysis",
            "requestedAt": (now - timedelta(seconds=20)).isoformat(),
            "respondedAt": now.isoformat()
        },
        conversation={
            "contactName": "Aman Sharma",
            "phone": "+919876543210",
            "source": "whatsapp-web",
            "messages": [
                {"sender": "customer", "text": "Hi, interested in a 2BHK in Indiranagar around 60 lakh"}
            ]
        }
    )

    res = lead_service.process_lead_analysis(req, user_id="test-workspace-user")
    assert res.success is True
    assert res.lead.id is not None
    assert res.lead.contactName == "Aman Sharma"
    assert res.lead.budget == 6000000.0
    assert res.lead.location == "Indiranagar"
    assert res.lead.requirement == "2BHK"

    # Check conversation stored
    convs = database_service.get_conversations_by_lead_id(res.lead.id)
    assert len(convs) >= 1
    assert "60 lakh" in convs[0]["message"]

def test_10_existing_lead_update():
    """
    Test 10: Subsequent conversation with same contact updates the existing lead record.
    """
    now = datetime.now(timezone.utc)
    # First message: initial inquiry
    req1 = LeadAnalysisRequest(
        consent={
            "status": "approved",
            "response": "YES",
            "scope": "current-conversation-analysis",
            "requestedAt": (now - timedelta(seconds=40)).isoformat(),
            "respondedAt": (now - timedelta(seconds=20)).isoformat()
        },
        conversation={
            "contactName": "Pooja Verma",
            "phone": "+919999988888",
            "source": "whatsapp-web",
            "messages": [
                {"sender": "customer", "text": "Looking for properties in Whitefield"}
            ]
        }
    )
    res1 = lead_service.process_lead_analysis(req1)
    lead_id_1 = res1.lead.id
    initial_score = res1.lead.leadScore

    # Second message: high intent, token mention, budget
    req2 = LeadAnalysisRequest(
        consent={
            "status": "approved",
            "response": "YES",
            "scope": "current-conversation-analysis",
            "requestedAt": (now - timedelta(seconds=10)).isoformat(),
            "respondedAt": now.isoformat()
        },
        conversation={
            "contactName": "Pooja Verma",
            "phone": "+919999988888",
            "source": "whatsapp-web",
            "messages": [
                {"sender": "customer", "text": "Looking for properties in Whitefield"},
                {"sender": "customer", "text": "We finalized 3BHK for 95 lakh, ready to give token today"}
            ]
        }
    )
    res2 = lead_service.process_lead_analysis(req2)
    lead_id_2 = res2.lead.id

    # Must match the same lead ID
    assert lead_id_1 == lead_id_2, "Expected lead ID to remain identical on update"
    assert res2.lead.budget == 9500000.0
    assert res2.lead.requirement == "3BHK"
    assert res2.lead.leadScore > initial_score, "Score should increase with high intent"
