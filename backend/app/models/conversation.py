from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class ChatMessage:
    id: Optional[str]
    lead_id: Optional[str]
    sender: str
    message: str
    message_timestamp: Optional[datetime]
    created_at: Optional[datetime] = None
