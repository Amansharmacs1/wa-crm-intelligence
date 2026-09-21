import logging
from typing import Optional
from app.config.settings import settings

logger = logging.getLogger("wa_crm.supabase")

_supabase_client = None

def get_supabase_client():
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not settings.SUPABASE_URL or not settings.SUPABASE_SECRET_KEY:
        logger.warning(
            "SUPABASE_URL or SUPABASE_SECRET_KEY not set. Backend will operate in local fallback mode."
        )
        return None

    try:
        from supabase import create_client, Client
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SECRET_KEY)
        logger.info("Successfully connected to Supabase PostgreSQL client.")
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}. Falling back to local mode.")
        return None
