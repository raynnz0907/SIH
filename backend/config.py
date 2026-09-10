from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./athletiq.db"
    SECRET_KEY: str = "change-this-secret-key-must-be-at-least-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Gemini API configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.6-flash"
    GEMINI_FALLBACK_MODEL: str = "gemini-2.0-flash"

    UPLOAD_DIR: str = "./uploads"
    MAX_VIDEO_SIZE_MB: int = 100

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
