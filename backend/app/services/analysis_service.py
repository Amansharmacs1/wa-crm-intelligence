import re
import logging
from typing import List, Dict, Any, Optional
from app.schemas.conversation import MessageSchema
from app.schemas.lead import AnalysisResult, ScoreReason
from app.config.settings import settings

logger = logging.getLogger("wa_crm.analysis")

class BaseAnalysisEngine:
    def analyze(self, contact_name: str, messages: List[MessageSchema]) -> AnalysisResult:
        raise NotImplementedError

class RuleBasedAnalysisEngine(BaseAnalysisEngine):
    """
    High-accuracy domain-specific extractor and explainable scorer for real estate
    and B2C sales conversations supporting English and Hinglish patterns.
    """
    def analyze(self, contact_name: str, messages: List[MessageSchema]) -> AnalysisResult:
        full_text = " ".join([m.text for m in messages])
        customer_msgs = [m.text for m in messages if m.sender == "customer"]
        customer_text = " ".join(customer_msgs) if customer_msgs else full_text

        # 1. Budget Extraction (e.g. "80 lakh", "1.5 cr", "50L", "8000000", "85k")
        budget = self._extract_budget(customer_text)

        # 2. Location Extraction (e.g. "Whitefield", "Indiranagar", "Noida", "Gurgaon", "Bandra")
        location = self._extract_location(customer_text)

        # 3. Requirement Extraction (e.g. "3BHK", "2 BHK", "Villa", "Plot", "Penthouse")
        requirement = self._extract_requirement(customer_text)

        # 4. Purchase Timeline Extraction (e.g. "kal", "tomorrow", "this weekend", "urgent")
        timeline = self._extract_timeline(customer_text)

        # 5. Buying Signals Extraction
        buying_signals = self._extract_buying_signals(customer_text)

        # 6. Intent & Sentiment
        intent = self._classify_intent(customer_text, buying_signals)
        sentiment = self._classify_sentiment(customer_text)

        # 7. Explainable Scoring Calculation
        scoring = self._calculate_scores(
            customer_text=customer_text,
            budget=budget,
            location=location,
            requirement=requirement,
            timeline=timeline,
            buying_signals=buying_signals,
            intent=intent,
            messages=messages
        )

        lead_score = scoring["lead_score"]
        urgency_score = scoring["urgency_score"]
        revenue_risk_score = scoring["revenue_risk_score"]
        reasons = scoring["reasons"]

        # 8. Category & Follow-up Status
        category = self._determine_category(lead_score, urgency_score)
        follow_up_status = self._determine_follow_up_status(urgency_score, revenue_risk_score)

        # 9. Recommendations & Suggested WhatsApp Reply
        first_name = contact_name.split()[0] if contact_name else "Customer"
        summary = self._generate_summary(first_name, requirement, location, budget, timeline, buying_signals)
        recommended_action = self._generate_recommended_action(urgency_score, requirement, location, timeline)
        suggested_reply = self._generate_suggested_reply(first_name, requirement, location, budget, timeline)

        return AnalysisResult(
            summary=summary,
            intent=intent,
            sentiment=sentiment,
            budget=budget,
            location=location,
            requirement=requirement,
            purchaseTimeline=timeline,
            buyingSignals=buying_signals,
            recommendedAction=recommended_action,
            suggestedReply=suggested_reply,
            leadScore=lead_score,
            urgencyScore=urgency_score,
            revenueRiskScore=revenue_risk_score,
            category=category,
            followUpStatus=follow_up_status,
            scoreReasons=reasons
        )

    def _extract_budget(self, text: str) -> Optional[float]:
        # Crore matches: e.g. 1.5 cr, 2 crore
        cr_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)\b", text, re.IGNORECASE)
        if cr_match:
            return float(cr_match.group(1)) * 10000000

        # Lakh matches: e.g. 80 lakh, 75 lac, 50L, 80lakhs
        lakh_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)\b", text, re.IGNORECASE)
        if lakh_match:
            return float(lakh_match.group(1)) * 100000

        # Thousand matches: e.g. 50k, 50 thousand
        k_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:k|thousand)\b", text, re.IGNORECASE)
        if k_match:
            return float(k_match.group(1)) * 1000

        # Raw numbers: e.g. 80,00,000 or 8000000
        raw_match = re.search(r"\b(\d{2,3}(?:,\d{2,3})+|\d{6,8})\b", text)
        if raw_match:
            clean_num = raw_match.group(1).replace(",", "")
            return float(clean_num)

        return None

    def _extract_location(self, text: str) -> Optional[str]:
        known_locations = [
            "Whitefield", "Indiranagar", "Koramangala", "HSR Layout", "Bellandur",
            "Electronic City", "Sarjapur", "Marathahalli", "Hebbal", "Yelahanka",
            "Bandra", "Andheri", "Juhu", "Powai", "Thane", "Navi Mumbai",
            "Gurgaon", "Noida", "Dwarka", "South Delhi", "Golf Course Road",
            "Gachibowli", "Hitec City", "Madhapur", "Jubilee Hills"
        ]
        for loc in known_locations:
            if re.search(r"\b" + re.escape(loc) + r"\b", text, re.IGNORECASE):
                return loc

        # Pattern like "in <Location>" or "<Location> wala"
        loc_pattern = re.search(r"\b([A-Z][a-zA-Z]+)\s*(?:wala|wali|area|road|location)\b", text)
        if loc_pattern:
            return loc_pattern.group(1)

        return None

    def _extract_requirement(self, text: str) -> Optional[str]:
        # BHK pattern (e.g. 1BHK, 2 BHK, 3BHK, 4 BHK, Studio)
        bhk_match = re.search(r"\b([1-5]\s*BHK|Studio|Villa|Penthouse|Duplex|Plot|Commercial)\b", text, re.IGNORECASE)
        if bhk_match:
            val = bhk_match.group(1).upper()
            return val.replace(" ", "")
        return None

    def _extract_timeline(self, text: str) -> Optional[str]:
        lower = text.lower()
        if any(w in lower for w in ["kal", "tomorrow"]):
            return "tomorrow"
        if any(w in lower for w in ["aaj", "today", "now", "immediately"]):
            return "immediate"
        if any(w in lower for w in ["weekend", "this weekend", "sunday", "saturday"]):
            return "this weekend"
        if any(w in lower for w in ["this week", "agle hafte", "next week"]):
            return "this week"
        if any(w in lower for w in ["this month", "agle mahine", "next month"]):
            return "this month"
        return "flexible"

    def _extract_buying_signals(self, text: str) -> List[str]:
        signals = []
        lower = text.lower()
        
        if any(w in lower for w in ["pasand", "interested", "like", "love", "shortlisted"]):
            signals.append("Interested in property")
        if any(w in lower for w in ["budget", "price", "rate", "cost", "lakh", "cr", "final ho jaye", "discount"]):
            signals.append("Discussing final price")
        if any(w in lower for w in ["site visit", "visit", "aana", "dekhne", "tour", "inspect"]):
            signals.append("Ready for site visit")
        if any(w in lower for w in ["token", "booking", "cheque", "advance", "payment", "down payment"]):
            signals.append("Ready to pay token")
        if any(w in lower for w in ["kal", "today", "immediately", "urgent"]):
            signals.append("Immediate purchase timeline")
        if any(w in lower for w in ["loan", "bank", "pre approved"]):
            signals.append("Finance / loan ready")

        if not signals:
            signals.append("Initial inquiry received")
        return signals

    def _classify_intent(self, text: str, signals: List[str]) -> str:
        if "Ready to pay token" in signals:
            return "high_purchase_intent"
        if "Ready for site visit" in signals:
            return "Site Visit"
        if "Discussing final price" in signals:
            return "Price Negotiation"
        if "Interested in property" in signals:
            return "Property Interest"
        return "General Inquiry"

    def _classify_sentiment(self, text: str) -> str:
        lower = text.lower()
        if any(w in lower for w in ["urgent", "jaldi", "asap", "immediate"]):
            return "Urgent"
        if any(w in lower for w in ["not happy", "delay", "waiting", "bad", "disappointed", "complaint"]):
            return "Critical"
        if any(w in lower for w in ["pasand", "good", "great", "nice", "final", "ready", "thanks"]):
            return "Positive"
        return "Neutral"

    def _calculate_scores(
        self,
        customer_text: str,
        budget: Optional[float],
        location: Optional[str],
        requirement: Optional[str],
        timeline: Optional[str],
        buying_signals: List[str],
        intent: str,
        messages: List[MessageSchema]
    ) -> Dict[str, Any]:
        lead_score = 40
        urgency_score = 30
        revenue_risk_score = 30
        reasons = []

        if budget is not None:
            lead_score += 15
            reasons.append(f"Customer specified concrete budget of ₹{int(budget):,}")

        if location is not None:
            lead_score += 10
            reasons.append(f"Target location identified as {location}")

        if requirement is not None:
            lead_score += 10
            reasons.append(f"Requirement specified as {requirement}")

        if "Ready for site visit" in buying_signals:
            lead_score += 15
            urgency_score += 25
            revenue_risk_score += 20
            reasons.append("Customer requested a site visit")

        if "Ready to pay token" in buying_signals:
            lead_score += 20
            urgency_score += 30
            revenue_risk_score += 35
            reasons.append("Customer indicated intent to pay booking token")

        if timeline in ["immediate", "tomorrow"]:
            urgency_score += 25
            revenue_risk_score += 25
            reasons.append(f"Purchase timeline is immediate ({timeline})")
        elif timeline == "this weekend":
            urgency_score += 15
            reasons.append("Timeline targeted for upcoming weekend")

        # Check conversation history for customer waiting on agent
        if messages and messages[-1].sender == "customer":
            revenue_risk_score += 15
            reasons.append("Latest customer inquiry is currently pending agent response")

        # Clamp scores between 0 and 99
        lead_score = min(99, max(15, lead_score))
        urgency_score = min(99, max(15, urgency_score))
        revenue_risk_score = min(99, max(10, revenue_risk_score))

        return {
            "lead_score": lead_score,
            "urgency_score": urgency_score,
            "revenue_risk_score": revenue_risk_score,
            "reasons": reasons
        }

    def _determine_category(self, lead_score: int, urgency_score: int) -> str:
        if lead_score >= 80 or urgency_score >= 80:
            return "High Intent"
        if lead_score >= 60:
            return "Warm"
        return "Cold"

    def _determine_follow_up_status(self, urgency_score: int, revenue_risk_score: int) -> str:
        if urgency_score >= 80 or revenue_risk_score >= 80:
            return "At Risk"
        if urgency_score >= 50:
            return "Pending"
        return "Scheduled"

    def _generate_summary(
        self,
        name: str,
        req: Optional[str],
        loc: Optional[str],
        budget: Optional[float],
        timeline: Optional[str],
        signals: List[str]
    ) -> str:
        details = []
        if req:
            details.append(req)
        if loc:
            details.append(f"in {loc}")
        if budget:
            details.append(f"around ₹{int(budget):,}")
        
        detail_str = " ".join(details) if details else "property"
        return f"{name} is actively interested in a {detail_str} with {timeline or 'flexible'} timeline. Key signals: {', '.join(signals)}."

    def _generate_recommended_action(
        self,
        urgency: int,
        req: Optional[str],
        loc: Optional[str],
        timeline: Optional[str]
    ) -> str:
        if urgency >= 75:
            return f"Immediate Priority: Call customer within 15 minutes to lock in site visit for {timeline or 'tomorrow'}."
        return f"Send curated property portfolio matching {req or 'options'} in {loc or 'desired area'}."

    def _generate_suggested_reply(
        self,
        first_name: str,
        req: Optional[str],
        loc: Optional[str],
        budget: Optional[float],
        timeline: Optional[str]
    ) -> str:
        if timeline in ["tomorrow", "kal", "immediate"]:
            return f"Namaste {first_name}, thank you for your interest! We have verified {req or 'units'} in {loc or 'the area'}. I can arrange your exclusive site visit {timeline or 'tomorrow'}. Would 11:00 AM or 3:00 PM suit you best?"
        return f"Hi {first_name}, great to connect! We have matching options in {loc or 'the area'}. Let me know when you'd be available for a brief walkthrough this week."

class AnalysisService:
    def __init__(self):
        self.engine = RuleBasedAnalysisEngine()
        # If AI_PROVIDER == "langchain" or "llama3" and AI_API_KEY is configured,
        # LangChainLlamaEngine can be initialized here.

    def analyze_conversation(self, contact_name: str, messages: List[MessageSchema]) -> AnalysisResult:
        """
        Public facade for conversation analysis.
        """
        return self.engine.analyze(contact_name, messages)

analysis_service = AnalysisService()
