from app.models.schemas import CommonArtist, CommonTrack, CompareResult


def _weights(items: list[dict]) -> dict[str, float]:
    """Rank-based weights: w(rank) = 1/rank. Rank 1 = most listened."""
    return {item["id"]: 1.0 / (i + 1) for i, item in enumerate(items)}


def _weighted_jaccard(wa: dict[str, float], wb: dict[str, float]) -> float:
    """Weighted Jaccard: sum(min) / sum(max) over the union."""
    keys = set(wa) | set(wb)
    num = sum(min(wa.get(k, 0.0), wb.get(k, 0.0)) for k in keys)
    den = sum(max(wa.get(k, 0.0), wb.get(k, 0.0)) for k in keys)
    return num / den if den else 0.0


def compute_comparison(top_data_a: dict, top_data_b: dict) -> CompareResult:
    artists_a_list = top_data_a.get("artists", {}).get("items", [])
    artists_b_list = top_data_b.get("artists", {}).get("items", [])
    tracks_a_list = top_data_a.get("tracks", {}).get("items", [])
    tracks_b_list = top_data_b.get("tracks", {}).get("items", [])

    artists_a = {a["id"]: a for a in artists_a_list}
    artists_b = {a["id"]: a for a in artists_b_list}
    tracks_a = {t["id"]: t for t in tracks_a_list}
    tracks_b = {t["id"]: t for t in tracks_b_list}

    aw_a = _weights(artists_a_list)
    aw_b = _weights(artists_b_list)
    tw_a = _weights(tracks_a_list)
    tw_b = _weights(tracks_b_list)

    common_artist_ids = set(artists_a) & set(artists_b)
    common_track_ids = set(tracks_a) & set(tracks_b)

    # Sort by combined weight — most mutually loved items first
    common_artists = sorted(
        [
            CommonArtist(
                id=aid,
                name=artists_a[aid]["name"],
                images=artists_a[aid].get("images", []),
                genres=artists_a[aid].get("genres", []),
                spotify_url=artists_a[aid].get("external_urls", {}).get("spotify"),
            )
            for aid in common_artist_ids
        ],
        key=lambda x: -(aw_a.get(x.id, 0) + aw_b.get(x.id, 0)),
    )

    common_tracks = sorted(
        [
            CommonTrack(
                id=tid,
                name=tracks_a[tid]["name"],
                artists=tracks_a[tid].get("artists", []),
                album=tracks_a[tid].get("album", {}),
                spotify_url=tracks_a[tid].get("external_urls", {}).get("spotify"),
            )
            for tid in common_track_ids
        ],
        key=lambda x: -(tw_a.get(x.id, 0) + tw_b.get(x.id, 0)),
    )

    artist_sim = _weighted_jaccard(aw_a, aw_b)
    track_sim = _weighted_jaccard(tw_a, tw_b)

    # Weighted average: artists carry more signal than tracks
    raw = artist_sim * 0.6 + track_sim * 0.4
    # x^0.3 curve: maps small Jaccard values into a meaningful 0-100 range
    # e.g. raw=0.013 → 27, raw=0.05 → 43, raw=0.2 → 67, raw=1.0 → 100
    compatibility = round(min(raw ** 0.3 * 100, 100.0), 1)

    return CompareResult(
        common_artists=common_artists,
        common_tracks=common_tracks,
        compatibility_score=compatibility,
    )
