"""
Seed a fake second user and join them to a room for local testing.

Usage:
    cd <repo root>
    python scripts/seed_test_user.py <room-code>

The script creates (or reuses) a test user, seeds their top data with a mix
of popular artists/tracks (some will overlap with real users), then joins
them to the specified room so the comparison endpoint returns data.
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.models.db_models import Room, RoomMember, User, UserTopData

engine = create_engine(os.environ["DATABASE_URL"])
SessionLocal = sessionmaker(bind=engine)

TEST_SPOTIFY_ID = "similarify_test_user_local"

FAKE_TOP_DATA = {
    "artists": {
        "items": [
            {"id": "06HL4z0CvFAxyc27GXpf02", "name": "Taylor Swift",    "genres": ["pop", "country pop"],           "images": [{"url": "https://i.scdn.co/image/ab6761610000e5eb5a00969a4698c3132a15fbb0", "height": 640, "width": 640}], "popularity": 100, "external_urls": {"spotify": "https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02"}},
            {"id": "1Xyo4u8uXC1ZmMpatF05PJ", "name": "The Weeknd",      "genres": ["canadian pop", "r&b"],          "images": [{"url": "https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb", "height": 640, "width": 640}], "popularity": 97,  "external_urls": {"spotify": "https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ"}},
            {"id": "3TVXtAsR1Inumwj472S9r4", "name": "Drake",            "genres": ["canadian hip hop", "rap"],      "images": [{"url": "https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9", "height": 640, "width": 640}], "popularity": 96,  "external_urls": {"spotify": "https://open.spotify.com/artist/3TVXtAsR1Inumwj472S9r4"}},
            {"id": "4q3ewBCX7sLwd24euuV69X", "name": "Bad Bunny",        "genres": ["reggaeton", "latin trap"],      "images": [{"url": "https://i.scdn.co/image/ab6761610000e5eb4bbf7af08da759f4fc875fcb", "height": 640, "width": 640}], "popularity": 95,  "external_urls": {"spotify": "https://open.spotify.com/artist/4q3ewBCX7sLwd24euuV69X"}},
            {"id": "1McMsnEElThX1knmY4oliG", "name": "Olivia Rodrigo",   "genres": ["pop", "teen pop"],              "images": [{"url": "https://i.scdn.co/image/ab6761610000e5ebd5d4ef4e64b1a4d84dc20a97", "height": 640, "width": 640}], "popularity": 90,  "external_urls": {"spotify": "https://open.spotify.com/artist/1McMsnEElThX1knmY4oliG"}},
            {"id": "6eUKZXaKkcviH0Ku9w2n3V", "name": "Ed Sheeran",      "genres": ["pop", "uk pop"],                "images": [{"url": "https://i.scdn.co/image/ab6761610000e5eb3bcef85e105dfc42399ef0ba", "height": 640, "width": 640}], "popularity": 93,  "external_urls": {"spotify": "https://open.spotify.com/artist/6eUKZXaKkcviH0Ku9w2n3V"}},
            {"id": "7dGJo4pcD2V6oG8kP0tJRR", "name": "Eminem",          "genres": ["detroit hip hop", "rap"],       "images": [{"url": "https://i.scdn.co/image/ab6761610000e5eba00b11c129b27a88fc72f36b", "height": 640, "width": 640}], "popularity": 91,  "external_urls": {"spotify": "https://open.spotify.com/artist/7dGJo4pcD2V6oG8kP0tJRR"}},
            {"id": "246dkjvS1zLTtiykXe5h60", "name": "Post Malone",      "genres": ["dfw rap", "melodic rap"],       "images": [{"url": "https://i.scdn.co/image/ab6761610000e5eb6be070445b03e0b63147c36e", "height": 640, "width": 640}], "popularity": 88,  "external_urls": {"spotify": "https://open.spotify.com/artist/246dkjvS1zLTtiykXe5h60"}},
            {"id": "2YZyLoL8N0Wb9xBt1NhZWg", "name": "Kendrick Lamar",  "genres": ["conscious hip hop", "rap"],    "images": [{"url": "https://i.scdn.co/image/ab6761610000e5eb437b9e2a82505b3d93ff1022", "height": 640, "width": 640}], "popularity": 94,  "external_urls": {"spotify": "https://open.spotify.com/artist/2YZyLoL8N0Wb9xBt1NhZWg"}},
            {"id": "66CXWjxzNUsdJxJ2JdwvnR", "name": "Ariana Grande",   "genres": ["pop", "dance pop"],             "images": [{"url": "https://i.scdn.co/image/ab6761610000e5ebc814b6daadd5f2d0adf6f89a", "height": 640, "width": 640}], "popularity": 91,  "external_urls": {"spotify": "https://open.spotify.com/artist/66CXWjxzNUsdJxJ2JdwvnR"}},
        ]
    },
    "tracks": {
        "items": [
            {"id": "0V3wPSX9ygBnCm8psDIegu", "name": "Anti-Hero",         "artists": [{"id": "06HL4z0CvFAxyc27GXpf02", "name": "Taylor Swift"}],   "album": {"id": "151w1FgRZfnKZA9FEcg9Z3", "name": "Midnights",         "images": [{"url": "https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0", "height": 640, "width": 640}], "release_date": "2022-10-21", "external_urls": {"spotify": "https://open.spotify.com/album/151w1FgRZfnKZA9FEcg9Z3"}}, "duration_ms": 200690, "popularity": 85, "external_urls": {"spotify": "https://open.spotify.com/track/0V3wPSX9ygBnCm8psDIegu"}},
            {"id": "7qiZfU4dY1lWllzX7mPBI3", "name": "Shape of You",      "artists": [{"id": "6eUKZXaKkcviH0Ku9w2n3V", "name": "Ed Sheeran"}],      "album": {"id": "3T4tUhGYeRNVUGevb0wThu", "name": "÷ (Divide)",         "images": [{"url": "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96", "height": 640, "width": 640}], "release_date": "2017-03-03", "external_urls": {"spotify": "https://open.spotify.com/album/3T4tUhGYeRNVUGevb0wThu"}}, "duration_ms": 233713, "popularity": 83, "external_urls": {"spotify": "https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3"}},
            {"id": "2LBqCSwhJGcFQeTHMVGwy3", "name": "Blinding Lights",   "artists": [{"id": "1Xyo4u8uXC1ZmMpatF05PJ", "name": "The Weeknd"}],       "album": {"id": "4yP0hdKOZPNshxUOjY0cZj", "name": "After Hours",        "images": [{"url": "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36", "height": 640, "width": 640}], "release_date": "2020-03-20", "external_urls": {"spotify": "https://open.spotify.com/album/4yP0hdKOZPNshxUOjY0cZj"}}, "duration_ms": 200040, "popularity": 87, "external_urls": {"spotify": "https://open.spotify.com/track/2LBqCSwhJGcFQeTHMVGwy3"}},
            {"id": "1zi7xx7UVEFkmKfv06H8x0", "name": "One Dance",         "artists": [{"id": "3TVXtAsR1Inumwj472S9r4", "name": "Drake"}],            "album": {"id": "3xRJKCeXAuXpMIBCXKFmFj", "name": "Views",              "images": [{"url": "https://i.scdn.co/image/ab67616d0000b2736d79c20072a5e3b2f1ee1d36", "height": 640, "width": 640}], "release_date": "2016-04-29", "external_urls": {"spotify": "https://open.spotify.com/album/3xRJKCeXAuXpMIBCXKFmFj"}}, "duration_ms": 173987, "popularity": 79, "external_urls": {"spotify": "https://open.spotify.com/track/1zi7xx7UVEFkmKfv06H8x0"}},
            {"id": "3n3Ppam7vgaVa1iaRUIOKE", "name": "drivers license",   "artists": [{"id": "1McMsnEElThX1knmY4oliG", "name": "Olivia Rodrigo"}],   "album": {"id": "6s84u2TUpR3wdUv4NgKA2j", "name": "SOUR",               "images": [{"url": "https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e52", "height": 640, "width": 640}], "release_date": "2021-05-21", "external_urls": {"spotify": "https://open.spotify.com/album/6s84u2TUpR3wdUv4NgKA2j"}}, "duration_ms": 242014, "popularity": 80, "external_urls": {"spotify": "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUIOKE"}},
            {"id": "0u2P5u6lvoDfwTYjAADbn4", "name": "lovely",            "artists": [{"id": "06HL4z0CvFAxyc27GXpf02", "name": "Taylor Swift"}],   "album": {"id": "2ODvWsOgouMbaA5xf0RkJe", "name": "when we all fall asleep","images": [{"url": "https://i.scdn.co/image/ab67616d0000b27350a3147b4edd7701a876c6ce", "height": 640, "width": 640}], "release_date": "2019-03-29", "external_urls": {"spotify": "https://open.spotify.com/album/2ODvWsOgouMbaA5xf0RkJe"}}, "duration_ms": 200186, "popularity": 81, "external_urls": {"spotify": "https://open.spotify.com/track/0u2P5u6lvoDfwTYjAADbn4"}},
            {"id": "4iJyoBOLtHqaWYs3wyVLibA", "name": "bad guy",          "artists": [{"id": "66CXWjxzNUsdJxJ2JdwvnR", "name": "Ariana Grande"}],   "album": {"id": "0S0KGZnfBGSIssfF54WSJh", "name": "thank u, next",      "images": [{"url": "https://i.scdn.co/image/ab67616d0000b273d4d8bfebfb3f2a4cc37b5adc", "height": 640, "width": 640}], "release_date": "2019-02-08", "external_urls": {"spotify": "https://open.spotify.com/album/0S0KGZnfBGSIssfF54WSJh"}}, "duration_ms": 194088, "popularity": 82, "external_urls": {"spotify": "https://open.spotify.com/track/4iJyoBOLtHqaWYs3wyVLibA"}},
            {"id": "3ee8Jmje8o58CHK66QrVC2", "name": "Believer",          "artists": [{"id": "53XhwfbYqKCa1cC15pYq2q", "name": "Imagine Dragons"}],  "album": {"id": "6vV5UrXcfyQD1wu4Qo2ZSv", "name": "Evolve",             "images": [{"url": "https://i.scdn.co/image/ab67616d0000b273537e3a0f5a3a98e6e67af71a", "height": 640, "width": 640}], "release_date": "2017-06-23", "external_urls": {"spotify": "https://open.spotify.com/album/6vV5UrXcfyQD1wu4Qo2ZSv"}}, "duration_ms": 204346, "popularity": 78, "external_urls": {"spotify": "https://open.spotify.com/track/3ee8Jmje8o58CHK66QrVC2"}},
            {"id": "6AI3ezQ4o3HUoP6Dhudph3", "name": "Sunflower",         "artists": [{"id": "246dkjvS1zLTtiykXe5h60", "name": "Post Malone"}],      "album": {"id": "3Q153HfDTIiQFuANB2PZAQ", "name": "Spider-Man: OST",   "images": [{"url": "https://i.scdn.co/image/ab67616d0000b27368c9c8e852f28b7bde7832c6", "height": 640, "width": 640}], "release_date": "2018-12-14", "external_urls": {"spotify": "https://open.spotify.com/album/3Q153HfDTIiQFuANB2PZAQ"}}, "duration_ms": 158040, "popularity": 86, "external_urls": {"spotify": "https://open.spotify.com/track/6AI3ezQ4o3HUoP6Dhudph3"}},
            {"id": "2takcwOaAZWiXQijPHIx7B", "name": "God's Plan",        "artists": [{"id": "3TVXtAsR1Inumwj472S9r4", "name": "Drake"}],            "album": {"id": "1ATL5GLyefJaxhQzSPVrLX", "name": "Scorpion",           "images": [{"url": "https://i.scdn.co/image/ab67616d0000b273f907de96b9a4fbc04accc0d5", "height": 640, "width": 640}], "release_date": "2018-06-29", "external_urls": {"spotify": "https://open.spotify.com/album/1ATL5GLyefJaxhQzSPVrLX"}}, "duration_ms": 198973, "popularity": 83, "external_urls": {"spotify": "https://open.spotify.com/track/2takcwOaAZWiXQijPHIx7B"}},
        ]
    },
}


def main():
    if len(sys.argv) != 2:
        print("Usage: python scripts/seed_test_user.py <room-code>")
        sys.exit(1)

    room_code = sys.argv[1]
    db = SessionLocal()

    try:
        # Find room
        room = db.query(Room).filter(Room.code == room_code).first()
        if not room:
            print(f"Room '{room_code}' not found.")
            sys.exit(1)

        member_count = db.query(RoomMember).filter(RoomMember.room_id == room.id).count()
        if member_count >= 2:
            print(f"Room '{room_code}' is already full (2 members).")
            sys.exit(1)

        # Get or create test user
        user = db.query(User).filter(User.spotify_id == TEST_SPOTIFY_ID).first()
        if not user:
            user = User(
                spotify_id=TEST_SPOTIFY_ID,
                display_name="Test User",
                access_token="fake_access_token",
                refresh_token="fake_refresh_token",
                token_expires_at=datetime.utcnow() + timedelta(days=365),
            )
            db.add(user)
            db.flush()
            print(f"Created test user (id={user.id})")
        else:
            print(f"Reusing existing test user (id={user.id})")

        # Seed top data
        existing = db.query(UserTopData).filter(
            UserTopData.user_id == user.id,
            UserTopData.time_range == "medium_term",
        ).first()
        if existing:
            existing.data_json = json.dumps(FAKE_TOP_DATA)
            existing.fetched_at = datetime.utcnow()
        else:
            db.add(UserTopData(
                user_id=user.id,
                time_range="medium_term",
                data_json=json.dumps(FAKE_TOP_DATA),
            ))
        print("Seeded top data for test user")

        # Join room
        already = db.query(RoomMember).filter(
            RoomMember.room_id == room.id,
            RoomMember.user_id == user.id,
        ).first()
        if not already:
            db.add(RoomMember(room_id=room.id, user_id=user.id))
            print(f"Test user joined room '{room_code}'")
        else:
            print(f"Test user was already in room '{room_code}'")

        db.commit()
        print(f"\nDone. Reload http://127.0.0.1:3000/room/{room_code} to see the comparison.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
