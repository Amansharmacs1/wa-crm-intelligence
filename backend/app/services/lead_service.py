import time
import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException
from app.schemas.lead import (
    LeadAnalysisRequest,
    LeadAnalysisResponse,
    LeadResponse,
    AnalysisResult
)
from app.services.consent_service import ConsentService
from app.services.analysis_service import analysis_service
from app.services.database_service import database_service
from app.utils.sanitization import sanitize_contact_name, sanitize_phone, sanitize_text

logger = logging.getLogger("wa_crm.lead_service")

class LeadService:
    @staticmethod
    def process_lead_analysis(
        request: LeadAnalysisRequest,
        user_id: Optional[str] = None
    ) -> LeadAnalysisResponse:
        start_time = time.time()

        # Step 1: Validate Customer Consent (Privacy Requirement)
        is_valid, reason = ConsentService.validate_consent(request.consent)
        if not is_valid:
            # Privacy rule: Do NOT log message content, do NOT analyze, do NOT store!
            logger.warning(f"Consent validation rejected: {reason}")
            raise HTTPException(
                status_code=403,
                detail={
                    "success": False,
                    "error": "ConsentNotGranted",
                    "message": reason
                }
            )

        # Step 2: Sanitize Inbound Conversation Data
        clean_contact_name = sanitize_contact_name(request.conversation.contactName)
        clean_phone = sanitize_phone(request.conversation.phone)
        
        sanitized_messages = []
        for msg in request.conversation.messages:
            sanitized_messages.append(
                msg.model_copy(update={"text": sanitize_text(msg.text)})
            )

        # Step 3: Run AI Intelligence Analysis
        analysis_result: AnalysisResult = analysis_service.analyze_conversation(
            contact_name=clean_contact_name,
            messages=sanitized_messages
        )

        # Step 4: Upsert Structured Lead into Database
        lead_record = database_service.upsert_lead(
            contact_name=clean_contact_name,
            phone=clean_phone,
            analysis=analysis_result,
            source=request.conversation.source,
            user_id=user_id
        )

        lead_id = lead_record["id"]

        # Step 5: Store Conversation Messages Associated with Lead
        database_service.store_conversation(
            lead_id=lead_id,
            messages=sanitized_messages
        )

        # Step 6: Record Analysis Audit Event
        duration_ms = int((time.time() - start_time) * 1000)
        database_service.record_analysis_event(
            lead_id=lead_id,
            model_name="rule-based-nlp",
            processing_time_ms=duration_ms
        )

        # Step 7: Construct Standard Response
        lead_response = LeadResponse(
            id=lead_id,
            contactName=lead_record["contact_name"],
            phone=lead_record.get("phone"),
            leadScore=lead_record["lead_score"],
            category=lead_record["category"],
            intent=lead_record["intent"],
            sentiment=lead_record["sentiment"],
            budget=lead_record.get("budget"),
            location=lead_record.get("location"),
            requirement=lead_record.get("requirement"),
            purchaseTimeline=lead_record.get("purchase_timeline"),
            urgencyScore=lead_record["urgency_score"],
            revenueRiskScore=lead_record["revenue_risk_score"],
            followUpStatus=lead_record["follow_up_status"],
            summary=lead_record.get("summary"),
            recommendedAction=lead_record.get("recommended_action"),
            suggestedReply=lead_record.get("suggested_reply"),
            createdAt=lead_record.get("created_at"),
            updatedAt=lead_record.get("updated_at")
        )

        return LeadAnalysisResponse(
            success=True,
            lead=lead_response,
            analysis=analysis_result
        )

lead_service = LeadService()
