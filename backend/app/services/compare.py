import json
from collections import Counter
from app.models.schemas import CommonArtist, CommonTrack, CompareResult


def _load(data_json: str) -> dict:
    return json.loads(data_json)


def compute_comparison(top_data_a: dict, top_data_b: dict) -> CompareResult:
    artists_a = {a["id"]: a for a in top_data_a.get("artists", {}).get("items", [])}
    artists_b = {a["id"]: a for a in top_data_b.get("artists", {}).get("items", [])}
    tracks_a = {t["id"]: t for t in top_data_a.get("tracks", {}).get("items", [])}
    tracks_b = {t["id"]: t for t in top_data_b.get("tracks", {}).get("items", [])}

    common_artist_ids = set(artists_a) & set(artists_b)
    common_track_ids = set(tracks_a) & set(tracks_b)

    common_artists = [
        CommonArtist(
            id=aid,
            name=artists_a[aid]["name"],
            images=artists_a[aid].get("images", []),
            genres=artists_a[aid].get("genres", []),
        )
        for aid in common_artist_ids
    ]

    common_tracks = [
        CommonTrack(
            id=tid,
            name=tracks_a[tid]["name"],
            artists=tracks_a[tid].get("artists", []),
            album=tracks_a[tid].get("album", {}),
        )
        for tid in common_track_ids
    ]

    genres_a = Counter(g for a in artists_a.values() for g in a.get("genres", []))
    genres_b = Counter(g for a in artists_b.values() for g in a.get("genres", []))
    shared_genres = set(genres_a) & set(genres_b)
    genre_scores = {g: genres_a[g] + genres_b[g] for g in shared_genres}
    common_genres = sorted(genre_scores, key=lambda g: -genre_scores[g])

    total_artists = max(len(artists_a), len(artists_b), 1)
    total_tracks = max(len(tracks_a), len(tracks_b), 1)
    total_genres = max(len(set(genres_a) | set(genres_b)), 1)

    artist_score = len(common_artist_ids) / total_artists
    track_score = len(common_track_ids) / total_tracks
    genre_score = len(shared_genres) / total_genres

    compatibility = round((artist_score * 40 + track_score * 40 + genre_score * 20), 2)

    return CompareResult(
        common_artists=common_artists,
        common_tracks=common_tracks,
        common_genres=common_genres,
        compatibility_score=min(compatibility * 100, 100.0),
    )
