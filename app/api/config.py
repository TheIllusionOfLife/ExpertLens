import logging

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    gemini_api_key: str = ""  # Validated by validate_required() in lifespan, not at construction
    gemini_live_model: str = "gemini-2.5-flash-native-audio-latest"
    gcp_project_id: str = ""

    # JWT
    jwt_secret_key: str = ""
    jwt_algorithm: str = "HS256"
    jwt_expire_days: int = 7

    # CORS
    cors_origins: str = "http://localhost:3000"

    # Gemini
    gemini_connect_timeout: float = Field(default=30.0, gt=0)
    max_session_seconds: int = Field(default=3600, gt=0)

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    _JWT_PLACEHOLDER_SUBSTRINGS = frozenset(
        {"change-me", "changeme", "replace", "placeholder", "example", "your-secret", "fixme"}
    )

    def validate_required(self) -> None:
        """Log a CRITICAL message and exit if required settings are invalid.

        Called from the lifespan context manager so Cloud Run's structured JSON
        logger is already configured when the message fires. Intentionally not a
        Pydantic model_validator: a validator at construction time fires before
        the JSON formatter is installed, producing a raw ValidationError instead
        of a structured CRITICAL log entry.
        """
        if not self.gemini_api_key:
            logger.critical("GEMINI_API_KEY is not set or empty. Cannot start server.")
            raise SystemExit(1)
        if not self.jwt_secret_key:
            logger.critical("JWT_SECRET_KEY is not set or empty. Cannot start server.")
            raise SystemExit(1)
        if len(self.jwt_secret_key) < 32:
            logger.critical("JWT_SECRET_KEY must be at least 32 characters. Cannot start server.")
            raise SystemExit(1)
        key_lower = self.jwt_secret_key.lower()
        if any(p in key_lower for p in self._JWT_PLACEHOLDER_SUBSTRINGS):
            logger.critical(
                "JWT_SECRET_KEY contains a known placeholder value. "
                "Set a real secret before starting the server."
            )
            raise SystemExit(1)


settings = Settings()  # type: ignore[call-arg]  # BaseSettings reads env vars at runtime
