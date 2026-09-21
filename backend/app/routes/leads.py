import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query
from app.schemas.lead import (
    LeadAnalysisRequest,
    LeadAnalysisResponse,
    LeadResponse,
    LeadUpdateSchema
)
from app.services.lead_service import lead_service
from app.services.database_service import database_service
from app.routes.auth import get_current_user_optional

logger = logging.getLogger("wa_crm.routes.leads")

router = APIRouter(prefix="/api/leads", tags=["Leads"])

@router.post("/analyze", response_model=LeadAnalysisResponse)
async def analyze_lead(
    request: LeadAnalysisRequest,
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    """
    Main ingestion endpoint called by the Chrome extension after customer consent is verified.
    Validates consent, extracts sales intelligence, upserts the lead, stores messages,
    and returns structured actionable intelligence.
    """
    user_id = current_user.get("id") if current_user else None
    return lead_service.process_lead_analysis(request, user_id=user_id)

@router.get("", response_model=List[LeadResponse])
async def list_leads(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user_optional)
):
    """
    Returns list of leads for the CRM dashboard.
    """
    user_id = current_user.get("id") if current_user else None
    records = database_service.get_leads(user_id=user_id, limit=limit, offset=offset)
    
    results = []
    for r in records:
        results.append(
            LeadResponse(
                id=r["id"],
                contactName=r.get("contact_name", "Unknown Contact"),
                phone=r.get("phone"),
                leadScore=r.get("lead_score", 0),
                category=r.get("category", "Warm"),
                intent=r.get("intent", "General Inquiry"),
                sentiment=r.get("sentiment", "Neutral"),
                budget=r.get("budget"),
                location=r.get("location"),
                requirement=r.get("requirement"),
                purchaseTimeline=r.get("purchase_timeline"),
                urgencyScore=r.get("urgency_score", 0),
                revenueRiskScore=r.get("revenue_risk_score", 0),
                followUpStatus=r.get("follow_up_status", "New"),
                summary=r.get("summary"),
                recommendedAction=r.get("recommended_action"),
                suggestedReply=r.get("suggested_reply"),
                createdAt=r.get("created_at"),
                updatedAt=r.get("updated_at")
            )
        )
    return results

@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(lead_id: str):
    """
    Fetches details for a specific lead.
    """
    record = database_service.get_lead_by_id(lead_id)
    if not record:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": "NotFound",
                "message": f"Lead with ID '{lead_id}' not found."
            }
        )

    return LeadResponse(
        id=record["id"],
        contactName=record.get("contact_name", "Unknown Contact"),
        phone=record.get("phone"),
        leadScore=record.get("lead_score", 0),
        category=record.get("category", "Warm"),
        intent=record.get("intent", "General Inquiry"),
        sentiment=record.get("sentiment", "Neutral"),
        budget=record.get("budget"),
        location=record.get("location"),
        requirement=record.get("requirement"),
        purchaseTimeline=record.get("purchase_timeline"),
        urgencyScore=record.get("urgency_score", 0),
        revenueRiskScore=record.get("revenue_risk_score", 0),
        followUpStatus=record.get("follow_up_status", "New"),
        summary=record.get("summary"),
        recommendedAction=record.get("recommended_action"),
        suggestedReply=record.get("suggested_reply"),
        createdAt=record.get("created_at"),
        updatedAt=record.get("updated_at")
    )

@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(lead_id: str, updates: LeadUpdateSchema):
    """
    Updates status, category, budget, or other fields for a lead.
    """
    record = database_service.update_lead(lead_id, updates)
    if not record:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": "NotFound",
                "message": f"Lead with ID '{lead_id}' not found."
            }
        )

    return LeadResponse(
        id=record["id"],
        contactName=record.get("contact_name", "Unknown Contact"),
        phone=record.get("phone"),
        leadScore=record.get("lead_score", 0),
        category=record.get("category", "Warm"),
        intent=record.get("intent", "General Inquiry"),
        sentiment=record.get("sentiment", "Neutral"),
        budget=record.get("budget"),
        location=record.get("location"),
        requirement=record.get("requirement"),
        purchaseTimeline=record.get("purchase_timeline"),
        urgencyScore=record.get("urgency_score", 0),
        revenueRiskScore=record.get("revenue_risk_score", 0),
        followUpStatus=record.get("follow_up_status", "New"),
        summary=record.get("summary"),
        recommendedAction=record.get("recommended_action"),
        suggestedReply=record.get("suggested_reply"),
        createdAt=record.get("created_at"),
        updatedAt=record.get("updated_at")
    )

@router.get("/{lead_id}/conversations")
async def get_lead_conversations(lead_id: str):
    """
    Retrieves stored message history for a lead.
    """
    lead = database_service.get_lead_by_id(lead_id)
    if not lead:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": "NotFound",
                "message": f"Lead with ID '{lead_id}' not found."
            }
        )

    messages = database_service.get_conversations_by_lead_id(lead_id)
    return {
        "success": True,
        "leadId": lead_id,
        "count": len(messages),
        "messages": messages
    }
