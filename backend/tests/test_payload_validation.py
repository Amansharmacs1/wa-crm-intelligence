import pytest
from pydantic import ValidationError
from app.schemas.lead import LeadAnalysisRequest
from app.schemas.conversation import ConversationSchema

def test_6_empty_messages_validation():
    """Test 6: Payload with empty messages array must fail validation."""
    invalid_data = {
        "consent": {
            "status": "approved",
            "response": "YES",
            "scope": "current-conversation-analysis"
        },
        "conversation": {
            "contactName": "Rahul Mehta",
            "source": "whatsapp-web",
            "messages": []  # Empty array
        }
    }
    with pytest.raises(ValidationError) as excinfo:
        LeadAnalysisRequest(**invalid_data)
    assert "messages" in str(excinfo.value)

def test_7_invalid_payload_fields():
    """Test 7: Payload missing mandatory fields fails validation."""
    # Missing contactName
    with pytest.raises(ValidationError):
        LeadAnalysisRequest(**{
            "consent": {"status": "approved", "response": "YES"},
            "conversation": {
                "messages": [{"sender": "customer", "text": "Hello"}]
            }
        })

    # Empty message text
    with pytest.raises(ValidationError):
        ConversationSchema(
            contactName="Rahul",
            messages=[{"sender": "customer", "text": ""}]
        )
