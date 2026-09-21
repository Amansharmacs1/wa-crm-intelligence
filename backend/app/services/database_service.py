import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.config.supabase import get_supabase_client
from app.schemas.conversation import MessageSchema
from app.schemas.lead import AnalysisResult, LeadResponse, LeadUpdateSchema
from app.utils.validators import current_utc_time, parse_iso_timestamp

logger = logging.getLogger("wa_crm.database")

class DatabaseService:
    def __init__(self):
        # In-memory store for fallback mode
        self._memory_leads: Dict[str, Dict[str, Any]] = {}
        self._memory_conversations: Dict[str, List[Dict[str, Any]]] = {}
        self._memory_events: List[Dict[str, Any]] = []

    def _get_client(self):
        return get_supabase_client()

    def upsert_lead(
        self,
        contact_name: str,
        phone: Optional[str],
        analysis: AnalysisResult,
        source: str = "whatsapp-web",
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Upserts lead based on contact_name and/or phone.
        Updates existing lead if found, otherwise creates a new record.
        """
        client = self._get_client()
        now_str = current_utc_time().isoformat()

        lead_data = {
            "contact_name": contact_name,
            "phone": phone,
            "source": source,
            "user_id": user_id,
            "budget": analysis.budget,
            "location": analysis.location,
            "requirement": analysis.requirement,
            "purchase_timeline": analysis.purchaseTimeline,
            "intent": analysis.intent,
            "sentiment": analysis.sentiment,
            "lead_score": analysis.leadScore,
            "urgency_score": analysis.urgencyScore,
            "revenue_risk_score": analysis.revenueRiskScore,
            "category": analysis.category,
            "follow_up_status": analysis.followUpStatus,
            "summary": analysis.summary,
            "recommended_action": analysis.recommendedAction,
            "suggested_reply": analysis.suggestedReply,
            "updated_at": now_str
        }

        # Attempt Supabase persistence
        if client is not None:
            try:
                # Find existing lead by phone or contact_name
                query = client.table("leads").select("*")
                if phone:
                    query = query.eq("phone", phone)
                else:
                    query = query.eq("contact_name", contact_name)

                res = query.execute()
                existing = res.data if res and hasattr(res, "data") else []

                if existing and len(existing) > 0:
                    lead_id = existing[0]["id"]
                    update_res = client.table("leads").update(lead_data).eq("id", lead_id).execute()
                    if update_res.data:
                        logger.info(f"Updated existing lead {lead_id} in Supabase.")
                        return update_res.data[0]
                else:
                    lead_data["id"] = str(uuid.uuid4())
                    lead_data["created_at"] = now_str
                    insert_res = client.table("leads").insert(lead_data).execute()
                    if insert_res.data:
                        logger.info(f"Created new lead {lead_data['id']} in Supabase.")
                        return insert_res.data[0]
            except Exception as e:
                logger.warning(f"Supabase upsert failed: {e}. Using in-memory fallback store.")

        # In-memory Fallback
        matched_id = None
        for lid, item in self._memory_leads.items():
            if phone and item.get("phone") == phone:
                matched_id = lid
                break
            if item.get("contact_name", "").lower() == contact_name.lower():
                matched_id = lid
                break

        if matched_id:
            self._memory_leads[matched_id].update(lead_data)
            logger.info(f"[In-Memory] Updated existing lead {matched_id}.")
            return self._memory_leads[matched_id]
        else:
            new_id = str(uuid.uuid4())
            lead_data["id"] = new_id
            lead_data["created_at"] = now_str
            self._memory_leads[new_id] = lead_data
            logger.info(f"[In-Memory] Created new lead {new_id}.")
            return lead_data

    def store_conversation(
        self,
        lead_id: str,
        messages: List[MessageSchema]
    ) -> List[Dict[str, Any]]:
        """
        Stores approved conversation messages associated with the lead.
        """
        client = self._get_client()
        now_str = current_utc_time().isoformat()
        records = []

        for m in messages:
            ts = parse_iso_timestamp(m.timestamp)
            records.append({
                "id": str(uuid.uuid4()),
                "lead_id": lead_id,
                "message": m.text,
                "sender": m.sender,
                "message_timestamp": ts.isoformat() if ts else now_str,
                "created_at": now_str
            })

        if client is not None:
            try:
                insert_res = client.table("conversations").insert(records).execute()
                if insert_res.data:
                    logger.info(f"Stored {len(records)} messages in Supabase for lead {lead_id}.")
                    return insert_res.data
            except Exception as e:
                logger.warning(f"Supabase message insert failed: {e}. Storing in-memory.")

        # In-memory Fallback
        if lead_id not in self._memory_conversations:
            self._memory_conversations[lead_id] = []
        self._memory_conversations[lead_id].extend(records)
        return records

    def record_analysis_event(
        self,
        lead_id: str,
        model_name: str = "rule-based-nlp",
        processing_time_ms: int = 15
    ) -> None:
        """
        Records lead analysis audit event.
        """
        client = self._get_client()
        event_data = {
            "id": str(uuid.uuid4()),
            "lead_id": lead_id,
            "analysis_status": "completed",
            "model_name": model_name,
            "processing_time_ms": processing_time_ms,
            "created_at": current_utc_time().isoformat()
        }

        if client is not None:
            try:
                client.table("lead_analysis_events").insert(event_data).execute()
                return
            except Exception as e:
                logger.warning(f"Supabase event logging failed: {e}.")

        self._memory_events.append(event_data)

    def get_leads(
        self,
        user_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        client = self._get_client()
        if client is not None:
            try:
                query = client.table("leads").select("*").order("created_at", desc=True).limit(limit).offset(offset)
                if user_id:
                    query = query.or_(f"user_id.eq.{user_id},user_id.is.null")
                res = query.execute()
                if res and hasattr(res, "data"):
                    return res.data
            except Exception as e:
                logger.warning(f"Supabase get_leads failed: {e}. Using in-memory fallback.")

        # In-memory fallback
        leads = list(self._memory_leads.values())
        leads.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return leads[offset:offset + limit]

    def get_lead_by_id(self, lead_id: str) -> Optional[Dict[str, Any]]:
        client = self._get_client()
        if client is not None:
            try:
                res = client.table("leads").select("*").eq("id", lead_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                logger.warning(f"Supabase get_lead_by_id failed: {e}.")

        return self._memory_leads.get(lead_id)

    def update_lead(self, lead_id: str, updates: LeadUpdateSchema) -> Optional[Dict[str, Any]]:
        update_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
        if not update_dict:
            return self.get_lead_by_id(lead_id)

        update_dict["updated_at"] = current_utc_time().isoformat()
        # Convert camelCase to snake_case if necessary
        clean_update = {}
        for k, v in update_dict.items():
            snake_k = "".join(["_" + c.lower() if c.isupper() else c for c in k]).lstrip("_")
            clean_update[snake_k] = v

        client = self._get_client()
        if client is not None:
            try:
                res = client.table("leads").update(clean_update).eq("id", lead_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                logger.warning(f"Supabase update_lead failed: {e}.")

        if lead_id in self._memory_leads:
            self._memory_leads[lead_id].update(clean_update)
            return self._memory_leads[lead_id]

        return None

    def get_conversations_by_lead_id(self, lead_id: str) -> List[Dict[str, Any]]:
        client = self._get_client()
        if client is not None:
            try:
                res = client.table("conversations").select("*").eq("lead_id", lead_id).order("message_timestamp", desc=False).execute()
                if res.data is not None:
                    return res.data
            except Exception as e:
                logger.warning(f"Supabase get_conversations failed: {e}.")

        return self._memory_conversations.get(lead_id, [])

database_service = DatabaseService()
