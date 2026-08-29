from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./athletiq.db"
    SECRET_KEY: str = "change-this-secret-key-must-be-at-least-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Ollama local LLM config
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "mistral"

    UPLOAD_DIR: str = "./uploads"
    MAX_VIDEO_SIZE_MB: int = 100

    class Config:
        env_file = ".env"


settings = Settings()
