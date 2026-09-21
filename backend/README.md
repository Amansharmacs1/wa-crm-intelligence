# Wa-CRM Intelligence: FastAPI Backend

Production-grade, privacy-first Python FastAPI backend for **Wa-CRM Intelligence**, an AI-powered revenue intelligence platform that extracts actionable sales signals from customer WhatsApp conversations.

---

## Architecture Overview

```
WhatsApp Web (Chrome Extension)
             │
             │ HTTP POST /api/leads/analyze
             ▼
┌──────────────────────────────────────────────┐
│             FastAPI Application              │
│                                              │
│  1. Pydantic Payload Validation             │
│  2. Strict Privacy Consent Verification      │
│     (10-minute window, explicit YES)         │
│  3. Inbound Data Sanitization                │
│  4. AI Intelligence Extraction Engine         │
│     (Hinglish/English NLP, Budget, Intent)   │
│  5. Explainable Lead & Risk Scoring          │
│  6. Lead Upsert & Conversation Persistence   │
└──────────────────────────────────────────────┘
             │                     │
             ▼                     ▼
┌────────────────────────┐  ┌────────────────────────┐
│  Supabase PostgreSQL   │  │ React / Vite Frontend  │
│  (Leads, Messages,     │  │ (Dashboard, Live Leads,│
│   Analysis Audit)      │  │  Follow-ups, Analytics)│
└────────────────────────┘  └────────────────────────┘
```

---

## Key Features

1. **Privacy-by-Design Consent Engine**:
   - Requires explicit affirmative response (`YES`, `Y`, `1`).
   - Strict 10-minute (`600s`) validity window between request and customer reply.
   - Strictly validates scope (`current-conversation-analysis`).
   - If consent is denied, ambiguous (`maybe`, `later`, etc.), or expired, **immediately returns HTTP 403 Forbidden** with zero message content logged or stored.
2. **AI Intelligence Layer (Llama 3 / LangChain ready)**:
   - High-precision extraction of budget (e.g. `80 lakh` -> `8,000,000`), location (`Whitefield`), requirement (`3BHK`), and timeline (`tomorrow`).
   - Identifies key buying signals: property interest, final pricing discussion, site visit readiness, booking token readiness.
   - Generates contextual WhatsApp reply suggestions and recommended next actions.
3. **Explainable Lead & Risk Scoring**:
   - `lead_score` (0-99), `urgency_score` (0-99), `revenue_risk_score` (0-99).
   - Generates human-readable explanations of every factor contributing to the score.
4. **Intelligent Lead Upsert**:
   - Deduplicates leads using contact name and phone number.
   - Updates existing lead telemetry instead of creating duplicate records.
5. **Supabase PostgreSQL with Safe Offline Fallback**:
   - Connects to Supabase tables: `profiles`, `leads`, `conversations`, `lead_analysis_events`.
   - Built-in thread-safe fallback memory store for local development or testing without database credentials.

---

## Folder Structure

```
backend/
├── app/
│   ├── main.py                     # FastAPI application entry point, CORS & exception handlers
│   ├── config/
│   │   ├── settings.py             # Pydantic BaseSettings for environment variables
│   │   └── supabase.py             # Supabase client singleton with graceful fallback
│   ├── models/
│   │   ├── consent.py              # Domain models for Consent
│   │   ├── conversation.py         # Domain models for Messages and Conversation
│   │   └── lead.py                 # Domain models for Leads and Scoring
│   ├── schemas/
│   │   ├── consent.py              # Pydantic schemas for Inbound Consent
│   │   ├── conversation.py         # Pydantic schemas for WhatsApp Messages
│   │   └── lead.py                 # Request/Response schemas for Lead Analysis & CRUD
│   ├── routes/
│   │   ├── health.py               # GET /health
│   │   ├── leads.py                # Lead Analysis and Management REST endpoints
│   │   └── auth.py                 # Supabase JWT authentication helpers
│   ├── services/
│   │   ├── consent_service.py      # Strict consent & privacy enforcement logic
│   │   ├── analysis_service.py     # AI analysis engine & explainable scoring
│   │   ├── lead_service.py         # Lead analysis and upsert orchestration
│   │   └── database_service.py     # Supabase persistence layer with memory fallback
│   └── utils/
│       ├── sanitization.py         # Input sanitization (HTML, control chars, names)
│       └── validators.py           # Timestamp parser and ISO date utilities
├── tests/
│   ├── test_consent.py             # Consent tests (Valid, NO, Ambiguous, Expired, Scope)
│   ├── test_payload_validation.py  # Empty messages and payload validation tests
│   ├── test_lead_analysis.py       # Entity extraction, lead creation and update tests
│   └── test_api_endpoints.py       # REST API endpoints, 403 handling, resilience tests
├── schema.sql                      # Complete Supabase PostgreSQL DDL migration
├── requirements.txt                # Python dependencies
├── .env.example                    # Environment variables template
└── README.md                       # Documentation and integration guide
```

---

## Setup & Installation

### 1. Prerequisites
- Python 3.11 or higher
- Git

### 2. Create Virtual Environment
```bash
cd backend
python -m venv venv

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Supabase PostgreSQL Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-supabase-service-role-secret-key

# AI Intelligence Layer (Options: mock, openai, langchain, llama3)
AI_PROVIDER=mock
AI_API_KEY=

# CORS Settings
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,chrome-extension://*

# Server Settings
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
CONSENT_TIMEOUT_SECONDS=600
```

---

## Running the Backend

Start the development server with hot-reload:
```bash
uvicorn app.main:app --reload --port 8000
```

Access:
- **API Root**: `http://localhost:8000/`
- **Health Check**: `http://localhost:8000/health`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health` | Server and database health status | No |
| `POST` | `/api/leads/analyze` | Ingests WhatsApp conversation, validates consent, analyzes signals, upserts lead | Optional (Extension/Token) |
| `GET` | `/api/leads` | Returns paginated list of leads for dashboard | Optional |
| `GET` | `/api/leads/{id}` | Returns single lead details | Optional |
| `PATCH` | `/api/leads/{id}` | Updates lead status, category, notes, or details | Optional |
| `GET` | `/api/leads/{id}/conversations` | Returns full conversation message history for a lead | Optional |

---

## Sample Request & Response

### `POST /api/leads/analyze`

#### Sample Request Payload:
```json
{
  "consent": {
    "status": "approved",
    "method": "whatsapp-reply",
    "requestedAt": "2026-09-21T17:20:00Z",
    "respondedAt": "2026-09-21T17:21:00Z",
    "response": "YES",
    "scope": "current-conversation-analysis"
  },
  "conversation": {
    "contactName": "Rahul Mehta",
    "phone": "+919876543210",
    "source": "whatsapp-web",
    "messages": [
      {
        "sender": "customer",
        "text": "Sir, Whitefield wala 3BHK pasand hai. Agar 80 lakh ke around final ho jaye toh kal site visit karke token kar dunga."
      }
    ]
  }
}
```

#### Sample Success Response (HTTP 200):
```json
{
  "success": true,
  "lead": {
    "id": "c79cd5a3-517d-47f1-a588-ad9413ab1561",
    "contactName": "Rahul Mehta",
    "phone": "+919876543210",
    "leadScore": 99,
    "category": "High Intent",
    "intent": "high_purchase_intent",
    "sentiment": "Positive",
    "budget": 8000000.0,
    "location": "Whitefield",
    "requirement": "3BHK",
    "purchaseTimeline": "tomorrow",
    "urgencyScore": 99,
    "revenueRiskScore": 99,
    "followUpStatus": "At Risk",
    "summary": "Rahul is actively interested in a 3BHK in Whitefield around ₹8,000,000 with tomorrow timeline. Key signals: Interested in property, Discussing final price, Ready for site visit, Ready to pay token, Immediate purchase timeline.",
    "recommendedAction": "Immediate Priority: Call customer within 15 minutes to lock in site visit for tomorrow.",
    "suggestedReply": "Namaste Rahul, thank you for your interest! We have verified 3BHK in Whitefield. I can arrange your exclusive site visit tomorrow. Would 11:00 AM or 3:00 PM suit you best?",
    "createdAt": "2026-09-21T17:22:06Z",
    "updatedAt": "2026-09-21T17:22:06Z"
  },
  "analysis": {
    "summary": "Rahul is actively interested in a 3BHK in Whitefield around ₹8,000,000 with tomorrow timeline.",
    "intent": "high_purchase_intent",
    "sentiment": "Positive",
    "budget": 8000000.0,
    "location": "Whitefield",
    "requirement": "3BHK",
    "purchaseTimeline": "tomorrow",
    "buyingSignals": [
      "Interested in property",
      "Discussing final price",
      "Ready for site visit",
      "Ready to pay token",
      "Immediate purchase timeline"
    ],
    "recommendedAction": "Immediate Priority: Call customer within 15 minutes to lock in site visit for tomorrow.",
    "suggestedReply": "Namaste Rahul, thank you for your interest! We have verified 3BHK in Whitefield. I can arrange your exclusive site visit tomorrow. Would 11:00 AM or 3:00 PM suit you best?",
    "leadScore": 99,
    "urgencyScore": 99,
    "revenueRiskScore": 99,
    "category": "High Intent",
    "followUpStatus": "At Risk",
    "scoreReasons": [
      "Customer specified concrete budget of ₹8,000,000",
      "Target location identified as Whitefield",
      "Requirement specified as 3BHK",
      "Customer requested a site visit",
      "Customer indicated intent to pay booking token",
      "Purchase timeline is immediate (tomorrow)",
      "Latest customer inquiry is currently pending agent response"
    ]
  }
}
```

#### Rejection Response on Ambiguous/Expired Consent (HTTP 403 Forbidden):
```json
{
  "success": false,
  "error": "ConsentNotGranted",
  "message": "Customer response 'maybe' is ambiguous or negative. Consent rejected."
}
```

---

## Chrome Extension Integration

In `apps/extension/config.js`, update the backend URL to point to FastAPI:
```javascript
const WA_CRM_CONFIG = {
  API_URL: "http://localhost:8000/api"
};
```

When customer consent is obtained, send the structured payload:
```javascript
const payload = {
  consent: {
    status: "approved",
    method: "whatsapp-reply",
    requestedAt: requestedTimestampISO,
    respondedAt: responseTimestampISO,
    response: "YES",
    scope: "current-conversation-analysis"
  },
  conversation: {
    contactName: contactName,
    source: "whatsapp-web",
    messages: extractedMessages
  }
};

const response = await fetch("http://localhost:8000/api/leads/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});

const data = await response.json();
if (response.ok && data.success) {
  renderAnalysis(data.lead);
} else {
  alert(`Analysis halted: ${data.message}`);
}
```

---

## Running Automated Tests

Run the complete test suite with verbose output:
```bash
pytest backend/tests/ -v
```

All 15 automated test cases verify:
1. Valid consent with explicit YES within 10-minute window
2. Explicit NO rejection (403 Forbidden)
3. Ambiguous responses rejection (`maybe`, `later`, `not sure`)
4. Expired consent rejection (> 10 minutes)
5. Invalid consent scope rejection
6. Empty messages validation (422)
7. Missing/invalid payload validation (422)
8. Lead analysis entity extraction (budget, location, requirement, signals, timeline) and explainable scoring
9. Lead creation on first conversation
10. Existing lead upsert on subsequent conversation
11. Database failure graceful resilience (in-memory fallback)
12. Authentication failure (401 Unauthorized)
13. Health endpoint status check
14. Full end-to-end REST flow
15. Privacy preservation on denied consent
