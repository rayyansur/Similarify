# CLAUDE.md — Similarify

## What This Is
Spotify social comparison app. Users log in with Spotify, see their own top artists/tracks/playlists, then invite a friend via a link. When both users have connected, a shared "room" shows overlap: common artists, tracks, genres, and compatibility scores.

## Stack
FastAPI · PostgreSQL · Next.js · Recharts · Spotify Web API · React Query

## Structure
```
similarify/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/routes/
│   │   │   ├── auth.py        # /auth/login, /auth/callback
│   │   │   ├── me.py          # /me/top-artists, /me/top-tracks, /me/playlists
│   │   │   └── rooms.py       # /rooms (create), /rooms/{code} (join + compare)
│   │   ├── services/
│   │   │   ├── spotify.py     # Spotify API client + token refresh
│   │   │   └── compare.py     # overlap + compatibility logic
│   │   ├── models/
│   │   │   ├── db_models.py   # User, Room, RoomMember
│   │   │   └── schemas.py
│   │   └── core/config.py
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # landing + login
│   │   ├── dashboard/page.tsx    # personal stats
│   │   └── room/[code]/page.tsx  # comparison room
│   ├── components/
│   │   ├── TopList.tsx           # ranked artist/track list
│   │   ├── OverlapGrid.tsx       # shared artists/tracks side-by-side
│   │   ├── GenreVenn.tsx         # genre overlap visualization
│   │   └── CompatibilityScore.tsx
│   └── lib/
│       ├── api.ts
│       └── spotify-types.ts
└── docker-compose.yml
```

## Commands
```bash
# Backend
uvicorn app.main:app --reload --port 8000
alembic upgrade head

# Frontend
npm run dev   # localhost:3000
```

## Env
```
# backend/.env
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
JWT_SECRET=
DATABASE_URL=postgresql://user:password@localhost:5432/similarify

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=
```

## DB Schema (key tables)
```
users(id, spotify_id, display_name, access_token, refresh_token, token_expires_at)
rooms(id, code, created_by, created_at)          -- code is short invite slug (e.g. "abc123")
room_members(room_id, user_id, joined_at)         -- max 2 members for v1
user_top_data(user_id, time_range, data_json, fetched_at)  -- cached Spotify top data
```

## Auth Flow
Spotify OAuth 2.0 → backend exchanges code → stores tokens in DB → returns JWT.
Scopes: `user-top-read playlist-read-private user-read-private`
Auto-refresh in `services/spotify.py` using stored `refresh_token`.

## Room / Invite Flow
1. User A hits `POST /rooms` → gets back a room `code`
2. Frontend shows shareable link: `similarify.app/room/{code}`
3. User B opens link → prompted to log in with Spotify
4. User B hits `POST /rooms/{code}/join`
5. `GET /rooms/{code}/compare` returns overlap data (only works when room has 2 members)

## Compare Logic (`services/compare.py`)
- **Common artists**: intersect top-artist Spotify IDs for both users
- **Common tracks**: intersect top-track IDs
- **Genre overlap**: union artist genres per user → intersect, rank by combined frequency
- **Compatibility score**: weighted sum — shared artists (40%) + shared tracks (40%) + genre overlap (20%), normalized 0–100

Fetch Spotify top data with `time_range=medium_term` by default. Cache in `user_top_data` table (re-fetch if `fetched_at` > 24h old).

## Key Constraints
- Max 2 members per room for v1
- Cache top data in DB — don't re-fetch Spotify on every comparison request
- Rooms don't expire in v1 (add TTL later)
- ⚠️ Spotify `audio-features` restricted for new apps (2024) — playlist analysis uses track/artist metadata only, not audio features

## Pitfalls
- Never expose `SPOTIFY_CLIENT_SECRET` to frontend
- Don't store tokens in JWTs — store in DB, look up by user ID
- Batch artist genre fetches: 50 per request max
- `GET /rooms/{code}/compare` must return 403 if room has < 2 members, not empty data
- All frontend API calls through `lib/api.ts` only