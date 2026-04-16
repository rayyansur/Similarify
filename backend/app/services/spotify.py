from datetime import datetime, timedelta
import httpx
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.db_models import User

SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_BASE = "https://api.spotify.com/v1"
SCOPES = "user-top-read playlist-read-private user-read-private"


def get_auth_url(state: str) -> str:
    params = (
        f"response_type=code"
        f"&client_id={settings.spotify_client_id}"
        f"&scope={SCOPES.replace(' ', '%20')}"
        f"&redirect_uri={settings.spotify_redirect_uri}"
        f"&state={state}"
    )
    return f"https://accounts.spotify.com/authorize?{params}"


async def exchange_code(code: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            SPOTIFY_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.spotify_redirect_uri,
            },
            auth=(settings.spotify_client_id, settings.spotify_client_secret),
        )
        resp.raise_for_status()
        return resp.json()


async def refresh_access_token(refresh_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            SPOTIFY_TOKEN_URL,
            data={"grant_type": "refresh_token", "refresh_token": refresh_token},
            auth=(settings.spotify_client_id, settings.spotify_client_secret),
        )
        resp.raise_for_status()
        return resp.json()


async def get_valid_token(user: User, db: Session) -> str:
    if datetime.utcnow() >= user.token_expires_at - timedelta(seconds=60):
        data = await refresh_access_token(user.refresh_token)
        user.access_token = data["access_token"]
        user.token_expires_at = datetime.utcnow() + timedelta(seconds=data["expires_in"])
        if "refresh_token" in data:
            user.refresh_token = data["refresh_token"]
        db.commit()
    return user.access_token


async def get_current_profile(access_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SPOTIFY_API_BASE}/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        resp.raise_for_status()
        return resp.json()


async def get_top_items(access_token: str, item_type: str, time_range: str = "medium_term", limit: int = 50) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SPOTIFY_API_BASE}/me/top/{item_type}",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"time_range": time_range, "limit": limit},
        )
        resp.raise_for_status()
        return resp.json()


async def get_playlists(access_token: str, limit: int = 50) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SPOTIFY_API_BASE}/me/playlists",
            headers={"Authorization": f"Bearer {access_token}"},
            params={"limit": limit},
        )
        resp.raise_for_status()
        return resp.json()


async def get_artists_batch(access_token: str, artist_ids: list[str]) -> list[dict]:
    """Fetch artist details in batches of 50."""
    results = []
    async with httpx.AsyncClient() as client:
        for i in range(0, len(artist_ids), 50):
            batch = artist_ids[i : i + 50]
            resp = await client.get(
                f"{SPOTIFY_API_BASE}/artists",
                headers={"Authorization": f"Bearer {access_token}"},
                params={"ids": ",".join(batch)},
            )
            resp.raise_for_status()
            results.extend(resp.json()["artists"])
    return results
