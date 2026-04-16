import json
import secrets
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db, get_current_user
from app.models.db_models import Room, RoomMember, User, UserTopData
from app.models.schemas import CompareResult, RoomOut
from app.services.compare import compute_comparison
from app.api.routes.me import _get_or_fetch_top_data

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.post("", response_model=RoomOut, status_code=201)
async def create_room(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    code = secrets.token_urlsafe(6)[:8]
    room = Room(code=code, created_by=user.id)
    db.add(room)
    db.flush()
    db.add(RoomMember(room_id=room.id, user_id=user.id))
    db.commit()
    db.refresh(room)
    return room


@router.post("/{code}/join", response_model=RoomOut)
async def join_room(code: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    already_member = db.query(RoomMember).filter(
        RoomMember.room_id == room.id, RoomMember.user_id == user.id
    ).first()
    if already_member:
        return room

    member_count = db.query(RoomMember).filter(RoomMember.room_id == room.id).count()
    if member_count >= 2:
        raise HTTPException(status_code=409, detail="Room is full")

    db.add(RoomMember(room_id=room.id, user_id=user.id))
    db.commit()
    return room


@router.get("/{code}/compare", response_model=CompareResult)
async def compare(code: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.code == code).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    members = db.query(RoomMember).filter(RoomMember.room_id == room.id).all()
    if len(members) < 2:
        raise HTTPException(status_code=403, detail="Room needs 2 members to compare")

    user_ids = [m.user_id for m in members]
    users = db.query(User).filter(User.id.in_(user_ids)).all()
    user_map = {u.id: u for u in users}

    top_data_a = await _get_or_fetch_top_data(user_map[user_ids[0]], db)
    top_data_b = await _get_or_fetch_top_data(user_map[user_ids[1]], db)

    return compute_comparison(top_data_a, top_data_b)
