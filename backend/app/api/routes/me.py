import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db, get_current_user
from app.models.db_models import User, UserTopData
from app.services import spotify as spotify_svc

router = APIRouter(prefix="/me", tags=["me"])

CACHE_TTL_HOURS = 24


async def _get_or_fetch_top_data(user: User, db: Session, time_range: str = "medium_term") -> dict:
    cached = (
        db.query(UserTopData)
        .filter(UserTopData.user_id == user.id, UserTopData.time_range == time_range)
        .first()
    )
    stale = cached is None or datetime.utcnow() - cached.fetched_at > timedelta(hours=CACHE_TTL_HOURS)

    if stale:
        token = await spotify_svc.get_valid_token(user, db)
        artists = await spotify_svc.get_top_items(token, "artists", time_range)
        tracks = await spotify_svc.get_top_items(token, "tracks", time_range)
        data = {"artists": artists, "tracks": tracks}
        data_json = json.dumps(data)

        if cached:
            cached.data_json = data_json
            cached.fetched_at = datetime.utcnow()
        else:
            cached = UserTopData(user_id=user.id, time_range=time_range, data_json=data_json)
            db.add(cached)
        db.commit()
        return data

    return json.loads(cached.data_json)


@router.get("/top-artists")
async def top_artists(
    time_range: str = "medium_term",
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = await _get_or_fetch_top_data(user, db, time_range)
    return data["artists"]


@router.get("/top-tracks")
async def top_tracks(
    time_range: str = "medium_term",
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = await _get_or_fetch_top_data(user, db, time_range)
    return data["tracks"]


@router.get("/playlists")
async def playlists(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    token = await spotify_svc.get_valid_token(user, db)
    return await spotify_svc.get_playlists(token)


@router.get("/playlists/{playlist_id}/artists")
async def playlist_artists(
    playlist_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    token = await spotify_svc.get_valid_token(user, db)
    items = await spotify_svc.get_playlist_tracks(token, playlist_id)

    artist_counts: dict[str, int] = {}
    artist_names: dict[str, str] = {}
    for item in items:
        track = item.get("track")
        if not track:
            continue
        for artist in track.get("artists", []):
            aid = artist["id"]
            artist_counts[aid] = artist_counts.get(aid, 0) + 1
            artist_names[aid] = artist["name"]

    top_ids = sorted(artist_counts, key=lambda x: -artist_counts[x])[:20]
    if not top_ids:
        return []

    details = await spotify_svc.get_artists_batch(token, top_ids)

    result = []
    for artist in details:
        if not artist:
            continue
        aid = artist["id"]
        images = artist.get("images", [])
        result.append({
            "id": aid,
            "name": artist["name"],
            "image_url": images[0]["url"] if images else None,
            "track_count": artist_counts.get(aid, 0),
            "genres": artist.get("genres", []),
        })

    return sorted(result, key=lambda x: -x["track_count"])
