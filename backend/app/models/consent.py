from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class ConsentRecord:
    status: str
    method: str
    requested_at: Optional[datetime]
    responded_at: Optional[datetime]
    response: str
    scope: str
    is_valid: bool = False
    validation_error: Optional[str] = None
