import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from jose import jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db import get_db
from app.models.db_models import User
from app.services import spotify as spotify_svc

router = APIRouter(prefix="/auth", tags=["auth"])

_STATE_STORE: set[str] = set()  # ephemeral; swap for Redis in prod


@router.get("/login")
async def login():
    state = secrets.token_urlsafe(16)
    _STATE_STORE.add(state)
    return RedirectResponse(spotify_svc.get_auth_url(state))


@router.get("/callback")
async def callback(
    code: str = Query(...),
    state: str = Query(...),
    db: Session = Depends(get_db),
):
    if state not in _STATE_STORE:
        raise HTTPException(status_code=400, detail="Invalid state")
    _STATE_STORE.discard(state)

    token_data = await spotify_svc.exchange_code(code)
    access_token = token_data["access_token"]
    profile = await spotify_svc.get_current_profile(access_token)

    user = db.query(User).filter(User.spotify_id == profile["id"]).first()
    expires_at = datetime.utcnow() + timedelta(seconds=token_data["expires_in"])

    if user:
        user.access_token = access_token
        user.refresh_token = token_data["refresh_token"]
        user.token_expires_at = expires_at
        user.display_name = profile.get("display_name")
    else:
        user = User(
            spotify_id=profile["id"],
            display_name=profile.get("display_name"),
            access_token=access_token,
            refresh_token=token_data["refresh_token"],
            token_expires_at=expires_at,
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    jwt_token = jwt.encode({"sub": str(user.id)}, settings.jwt_secret, algorithm="HS256")
    # Redirect to frontend — token travels in the URL fragment so it never hits server logs
    return RedirectResponse(f"{settings.frontend_url}/callback#token={jwt_token}")
