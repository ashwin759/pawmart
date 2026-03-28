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
        
        # Vercel Lambda working directories vary. We check multiple likely paths:
        cwd = os.getcwd()
        possible_sources = [
            os.path.join(cwd, "backend", "petmarket.db"),
            os.path.join(cwd, "petmarket.db"),
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "petmarket.db")
        ]
        
        source_db = None
        for p in possible_sources:
            if os.path.exists(p):
                source_db = p
                break

        if source_db and not os.path.exists(db_path):
            try:
                shutil.copy2(source_db, db_path)
            except Exception:
                pass
        return Settings(DATABASE_URL=f"sqlite+aiosqlite:///{db_path}")
    return Settings()
