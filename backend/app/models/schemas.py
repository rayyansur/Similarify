from datetime import datetime
from typing import Any
from pydantic import BaseModel


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    spotify_id: str
    display_name: str | None

    model_config = {"from_attributes": True}


class RoomOut(BaseModel):
    id: int
    code: str
    created_by: int
    created_at: datetime

    model_config = {"from_attributes": True}


class RoomMemberOut(BaseModel):
    user_id: int
    joined_at: datetime

    model_config = {"from_attributes": True}


class TopDataOut(BaseModel):
    time_range: str
    data: Any
    fetched_at: datetime


class CommonArtist(BaseModel):
    id: str
    name: str
    images: list[dict]
    genres: list[str]


class CommonTrack(BaseModel):
    id: str
    name: str
    artists: list[dict]
    album: dict


class CompareResult(BaseModel):
    common_artists: list[CommonArtist]
    common_tracks: list[CommonTrack]
    common_genres: list[str]
    compatibility_score: float
