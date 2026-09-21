from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.consent import ConsentSchema
from app.schemas.conversation import ConversationSchema

class LeadAnalysisRequest(BaseModel):
    consent: ConsentSchema
    conversation: ConversationSchema

class ScoreReason(BaseModel):
    score: int
    reasons: List[str]

class LeadResponse(BaseModel):
    id: str
    contactName: str
    phone: Optional[str] = None
    leadScore: int = Field(alias="leadScore")
    category: str
    intent: str
    sentiment: str
    budget: Optional[float] = None
    location: Optional[str] = None
    requirement: Optional[str] = None
    purchaseTimeline: Optional[str] = None
    urgencyScore: int
    revenueRiskScore: int
    followUpStatus: str
    summary: Optional[str] = None
    recommendedAction: Optional[str] = None
    suggestedReply: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

    model_config = {"populate_by_name": True}

class AnalysisResult(BaseModel):
    summary: str
    intent: str
    sentiment: str
    budget: Optional[float] = None
    location: Optional[str] = None
    requirement: Optional[str] = None
    purchaseTimeline: Optional[str] = None
    buyingSignals: List[str] = []
    recommendedAction: str
    suggestedReply: str
    leadScore: int
    urgencyScore: int
    revenueRiskScore: int
    category: str
    followUpStatus: str
    scoreReasons: List[str] = []

class LeadAnalysisResponse(BaseModel):
    success: bool = True
    lead: LeadResponse
    analysis: AnalysisResult

class LeadUpdateSchema(BaseModel):
    contactName: Optional[str] = None
    phone: Optional[str] = None
    budget: Optional[float] = None
    location: Optional[str] = None
    requirement: Optional[str] = None
    followUpStatus: Optional[str] = None
    category: Optional[str] = None
    summary: Optional[str] = None
    recommendedAction: Optional[str] = None
    suggestedReply: Optional[str] = None
