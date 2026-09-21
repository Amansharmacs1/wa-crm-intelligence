import logging
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, Depends
from app.config.settings import settings
from app.config.supabase import get_supabase_client

logger = logging.getLogger("wa_crm.auth")

async def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    x_workspace_id: Optional[str] = Header(None)
) -> Optional[Dict[str, Any]]:
    """
    Extracts authenticated user from Supabase Bearer token or returns workspace context.
    If no authorization header is passed, returns None without raising an error.
    """
    if not authorization:
        if x_workspace_id:
            return {"id": x_workspace_id, "role": "workspace_client"}
        return None

    if not authorization.startswith("Bearer "):
        return None

    token = authorization.replace("Bearer ", "").strip()
    client = get_supabase_client()

    if client is not None:
        try:
            # Verify Supabase Auth token
            user_response = client.auth.get_user(token)
            if user_response and hasattr(user_response, "user") and user_response.user:
                return {
                    "id": user_response.user.id,
                    "email": user_response.user.email,
                    "role": "authenticated"
                }
        except Exception as e:
            logger.warning(f"Supabase token verification error: {e}")

    # For development/mock mode without live Supabase
    return {"id": x_workspace_id or settings.DEFAULT_WORKSPACE_ID, "role": "developer"}

async def get_current_user_required(
    user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
) -> Dict[str, Any]:
    """
    Requires an authenticated user / workspace identity. Raises 401 if missing.
    """
    if not user:
        raise HTTPException(
            status_code=401,
            detail={
                "success": False,
                "error": "Unauthorized",
                "message": "Authentication required. Please provide a valid Bearer token or workspace identity."
            }
        )
    return user
