from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Audira"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://callanalytics:callanalytics@db:5432/callanalytics"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # OpenAI
    OPENAI_API_KEY: str = ""

    # JWT
    JWT_SECRET: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # Whisper
    WHISPER_PROVIDER: str = "api"  # "api" or "local"
    WHISPER_MODEL_SIZE: str = "large-v3"
    WHISPER_API_BASE_URL: str = "https://api.openai.com/v1"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:80"

    # Google Drive
    GOOGLE_DRIVE_CREDENTIALS_PATH: str = ""
    GOOGLE_DRIVE_FOLDER_ID: str = ""
    GOOGLE_DRIVE_POLL_INTERVAL: int = 300  # seconds

    # Paths
    AUDIO_DIR: str = "/app/audio"
    UPLOAD_DIR: str = "/app/uploads"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    model_config = {"env_file": ".env", "case_sensitive": True, "extra": "ignore"}


settings = Settings()
