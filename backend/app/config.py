from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central app configuration, loaded from environment / .env file."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- App ---
    APP_NAME: str = "OSCE Practice Backend"
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"

    # --- CORS ---
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # --- Postgres ---
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "osce"
    POSTGRES_PASSWORD: str = "osce"
    POSTGRES_DB: str = "osce"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # --- Redis ---
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    SESSION_TTL_SECONDS: int = 60 * 60 * 2  # 2h idle expiry for a practice session

    @property
    def REDIS_URL(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    # --- Clerk auth ---
    CLERK_JWKS_URL: str = ""  # e.g. https://<your-domain>.clerk.accounts.dev/.well-known/jwks.json
    CLERK_ISSUER: str = ""
    CLERK_AUDIENCE: str | None = None
    AUTH_ENABLED: bool = True

    # --- LLM provider credentials ---
    OPENAI_API_KEY: str | None = None
    GOOGLE_API_KEY: str | None = None
    ANTHROPIC_API_KEY: str | None = None

    # --- Local HuggingFace models ---
    HF_MODELS_DIR: str = "./hf_models"
    HF_DEVICE: str = "cuda"  # "cuda" | "cpu" | "mps"

    DEFAULT_LLM_PROVIDER: str = "openai"
    DEFAULT_LLM_MODEL: str = "gpt-4o"


@lru_cache
def get_settings() -> Settings:
    return Settings()
