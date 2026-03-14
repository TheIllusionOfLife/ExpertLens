import logging

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    gemini_api_key: str  # Required — raises ValidationError at startup if GEMINI_API_KEY is unset
    gemini_live_model: str = "gemini-2.5-flash-native-audio-latest"
    gcp_project_id: str = ""

    # CORS
    cors_origins: str = "http://localhost:3000"

    # Gemini
    gemini_connect_timeout: float = Field(default=30.0, gt=0)

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    @model_validator(mode="after")
    def _check_non_empty_key(self) -> "Settings":
        if self.gemini_api_key == "":
            raise ValueError("GEMINI_API_KEY must not be empty")
        return self

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    def validate_required(self) -> None:
        """Log a CRITICAL message and exit if required settings are invalid.

        Called from the lifespan context manager so Cloud Run's structured JSON
        logger is already configured when the message fires.
        """
        if not self.gemini_api_key:
            logger.critical("GEMINI_API_KEY is not set or empty — cannot start server")
            raise SystemExit(1)


settings = Settings()  # type: ignore[call-arg]  # BaseSettings reads env vars at runtime
