import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Supabase PostgreSQL Configuration
    SUPABASE_URL: str = ""
    SUPABASE_SECRET_KEY: str = ""

    # EmailJS Configuration (server-side email delivery)
    EMAILJS_SERVICE_ID: str = ""
    EMAILJS_PUBLIC_KEY: str = ""
    EMAILJS_TEMPLATE_ID: str = ""

    # AI Intelligence Layer Configuration
    AI_PROVIDER: str = "mock"
    AI_API_KEY: str = ""

    # CORS & Security
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,chrome-extension://*"
    
    # Server & Runtime Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    CONSENT_TIMEOUT_SECONDS: int = 600  # Strict 10-minute validity
    DEFAULT_WORKSPACE_ID: str = "00000000-0000-0000-0000-000000000001"

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def allowed_origins_list(self) -> List[str]:
        if not self.ALLOWED_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

settings = Settings()
