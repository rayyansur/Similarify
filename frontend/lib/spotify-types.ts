export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: SpotifyImage[];
  popularity: number;
  external_urls: { spotify: string };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
  external_urls: { spotify: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string; external_urls: { spotify: string } }[];
  album: SpotifyAlbum;
  duration_ms: number;
  popularity: number;
  external_urls: { spotify: string };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[];
  items: { href: string; total: number } | null;
  public: boolean | null;
  owner: { display_name: string };
  external_urls: { spotify: string };
}

export interface TopItemsResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  href: string;
}

export interface PlaylistsResponse {
  items: SpotifyPlaylist[];
  total: number;
  limit: number;
  offset: number;
}

export interface CommonArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
  genres: string[];
  spotify_url: string | null;
}

export interface CommonTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: SpotifyAlbum;
  spotify_url: string | null;
}

export interface CompareResult {
  common_artists: CommonArtist[];
  common_tracks: CommonTrack[];
  compatibility_score: number;
}

export interface Room {
  id: number;
  code: string;
  created_by: number;
  created_at: string;
}

export interface PlaylistArtist {
  id: string;
  name: string;
  image_url: string | null;
  track_count: number;
  genres: string[];
}
