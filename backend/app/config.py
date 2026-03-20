"""Configuración central de la aplicación usando pydantic-settings."""

from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # App
    APP_NAME: str = "C-Tracks"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Base de datos
    DATABASE_URL: str = "postgresql+asyncpg://ctracks:ctracks@db:5432/ctracks"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # JWT
    SECRET_KEY: str = "dev-secret-key-cambiar-en-produccion"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # CORS
    CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:3000"]'

    @property
    def cors_origins_list(self) -> List[str]:
        return json.loads(self.CORS_ORIGINS)

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
    }


settings = Settings()
