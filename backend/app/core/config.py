from pathlib import Path
from pydantic_settings import BaseSettings

# Root of the repo, two levels above this file (backend/app/core/config.py → root)
_ROOT_ENV = Path(__file__).parent.parent.parent.parent / ".env"


class Settings(BaseSettings):
    spotify_client_id: str
    spotify_client_secret: str
    spotify_redirect_uri: str = "http://127.0.0.1:8000/auth/callback"
    frontend_url: str = "http://127.0.0.1:3000"
    jwt_secret: str
    database_url: str

    class Config:
        env_file = str(_ROOT_ENV)
        extra = "ignore"


settings = Settings()
