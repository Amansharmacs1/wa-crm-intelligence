from datetime import datetime, timezone
from typing import Optional

def parse_iso_timestamp(ts_str: Optional[str]) -> Optional[datetime]:
    """
    Parse an ISO timestamp string into a timezone-aware UTC datetime.
    """
    if not ts_str:
        return None
    try:
        # Handle 'Z' suffix
        normalized = ts_str.replace("Z", "+00:00")
        dt = datetime.fromisoformat(normalized)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None

def current_utc_time() -> datetime:
    return datetime.now(timezone.utc)
