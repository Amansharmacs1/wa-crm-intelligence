from typing import List, Optional, Union
from pydantic import BaseModel, Field, field_validator

class MessageSchema(BaseModel):
    id: Optional[Union[int, str]] = None
    sender: str = Field(description="Message sender: 'customer', 'agent', 'lead', or 'user'")
    text: str = Field(min_length=1, max_length=10000, description="Message text content")
    timestamp: Optional[str] = Field(default=None, description="Timestamp of the message")
    metadata: Optional[str] = Field(default=None, description="Optional extra metadata")

    @field_validator("sender")
    @classmethod
    def validate_sender(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean in ["customer", "lead", "client", "user"]:
            return "customer"
        if clean in ["agent", "admin", "sales", "me"]:
            return "agent"
        return "customer"

class ConversationSchema(BaseModel):
    contactName: str = Field(min_length=1, max_length=255, description="Name of the WhatsApp contact")
    phone: Optional[str] = Field(default=None, description="Optional phone number of contact")
    source: str = Field(default="whatsapp-web", description="Data source identifier")
    capturedAt: Optional[str] = Field(default=None, description="ISO timestamp when captured")
    messages: List[MessageSchema] = Field(min_length=1, description="List of messages in conversation")
