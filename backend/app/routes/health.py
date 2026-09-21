from fastapi import APIRouter
from app.config.settings import settings
from app.config.supabase import get_supabase_client

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    client = get_supabase_client()
    return {
        "status": "healthy",
        "service": "wa-crm-intelligence-backend",
        "environment": settings.ENVIRONMENT,
        "database_connected": client is not None,
        "ai_provider": settings.AI_PROVIDER
    }
