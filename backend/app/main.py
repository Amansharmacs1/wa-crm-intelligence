import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config.settings import settings
from app.config.supabase import get_supabase_client
from app.routes import health, leads, magic_link

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("wa_crm.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Wa-CRM Intelligence FastAPI Backend...")
    client = get_supabase_client()
    if client:
        logger.info("Connected to Supabase PostgreSQL.")
    else:
        logger.warning("Supabase not configured or unreachable; operating with local memory fallback.")
    yield
    logger.info("Shutting down Wa-CRM Intelligence FastAPI Backend...")

app = FastAPI(
    title="Wa-CRM Intelligence API",
    description="AI-powered WhatsApp Conversation & Revenue Intelligence Backend",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(health.router)
app.include_router(leads.router)
app.include_router(magic_link.router)

# Custom Exception Handlers for Clean, Consistent JSON Errors
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    # Detail can be a dict or string
    detail = exc.detail
    if isinstance(detail, dict):
        return JSONResponse(status_code=exc.status_code, content=detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": "HttpError",
            "message": str(detail)
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = ".".join(str(loc) for loc in err.get("loc", []))
        errors.append({
            "field": field,
            "message": err.get("msg", "Invalid value")
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "ValidationError",
            "message": "The request payload failed validation.",
            "details": errors
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server exception on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "InternalServerError",
            "message": "An internal error occurred. Please contact support or check server logs."
        }
    )

@app.get("/")
def root():
    return {
        "service": "Wa-CRM Intelligence API",
        "status": "online",
        "docs": "/docs",
        "health": "/health"
    }
