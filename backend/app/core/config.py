import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SALESTORM | SYSCRAFTERS 2026"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "sqlite+aiosqlite:///./salestorm.db"
    
    # Simulation Defaults
    DEFAULT_STOCK: int = 100
    RESERVATION_EXPIRY_SECONDS: int = 30
    
    # Gateway & Security
    RATE_LIMIT_REQUESTS_PER_SEC: int = 10000
    SECRET_KEY: str = "salestorm-syscrafters-super-secret-key-2026"
    
    class Config:
        case_sensitive = True

settings = Settings()
