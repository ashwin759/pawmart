import os
import shutil
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./petmarket.db"
    SECRET_KEY: str = "super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    QWEN_API_KEY: str = ""
    QWEN_API_URL: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    class Config:
        env_file = "../.env"


@lru_cache()
def get_settings():
    if os.environ.get("VERCEL"):
        db_path = "/tmp/petmarket.db"
        source_db = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "petmarket.db")
        if not os.path.exists(db_path) and os.path.exists(source_db):
            try:
                shutil.copy2(source_db, db_path)
            except Exception:
                pass
        return Settings(DATABASE_URL=f"sqlite+aiosqlite:///{db_path}")
    return Settings()
