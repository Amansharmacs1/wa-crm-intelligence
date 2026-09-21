from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, model_validator

class ConsentSchema(BaseModel):
    """
    Schema for customer consent received from WhatsApp Web Chrome Extension.
    Supports both the target strict schema and the existing extension format.
    """
    status: Optional[str] = Field(default=None, description="Approval status (e.g. approved, denied)")
    granted: Optional[bool] = Field(default=None, description="Boolean flag used by extension")
    method: Optional[str] = Field(default="whatsapp-reply", description="Method used to collect consent")
    requestedAt: Optional[str] = Field(default=None, description="ISO timestamp when consent was requested")
    respondedAt: Optional[str] = Field(default=None, description="ISO timestamp when customer responded")
    grantedAt: Optional[str] = Field(default=None, description="ISO timestamp used by extension")
    response: Optional[str] = Field(default=None, description="Customer reply (e.g. YES, NO, etc.)")
    scope: str = Field(
        default="current-conversation-analysis",
        description="Allowed scope of consent"
    )
    purpose: Optional[str] = Field(default="lead-analysis", description="Purpose of consent")

    @model_validator(mode="after")
    def normalize_consent_fields(self):
        # Normalize status & granted
        if self.status is None and self.granted is not None:
            self.status = "approved" if self.granted else "denied"
        elif self.status is not None and self.granted is None:
            self.granted = (self.status.lower() == "approved")

        # Normalize respondedAt & grantedAt
        if self.respondedAt is None and self.grantedAt is not None:
            self.respondedAt = self.grantedAt
        if self.grantedAt is None and self.respondedAt is not None:
            self.grantedAt = self.respondedAt

        # If response was not explicitly provided but status is approved, default to YES
        if self.response is None and self.status == "approved":
            self.response = "YES"

        return self
