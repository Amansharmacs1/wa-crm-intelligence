from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional

@dataclass
class LeadEntity:
    id: str
    contact_name: str
    user_id: Optional[str] = None
    phone: Optional[str] = None
    source: str = "whatsapp-web"
    budget: Optional[float] = None
    location: Optional[str] = None
    requirement: Optional[str] = None
    purchase_timeline: Optional[str] = None
    intent: str = "General Inquiry"
    sentiment: str = "Neutral"
    lead_score: int = 50
    urgency_score: int = 50
    revenue_risk_score: int = 50
    category: str = "Warm"
    follow_up_status: str = "New"
    summary: Optional[str] = None
    recommended_action: Optional[str] = None
    suggested_reply: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
