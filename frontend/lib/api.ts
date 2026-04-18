import type {
  CompareResult,
  PlaylistArtist,
  PlaylistsResponse,
  Room,
  SpotifyArtist,
  SpotifyTrack,
  TopItemsResponse,
} from './spotify-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const TOKEN_KEY = 'similarify_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Request failed' }));
    const err = new Error(body.detail ?? 'Request failed') as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const api = {
  auth: {
    loginUrl: (): string => `${API_URL}/auth/login`,
  },

  me: {
    topArtists: (timeRange = 'medium_term') =>
      request<TopItemsResponse<SpotifyArtist>>(`/me/top-artists?time_range=${timeRange}`),
    topTracks: (timeRange = 'medium_term') =>
      request<TopItemsResponse<SpotifyTrack>>(`/me/top-tracks?time_range=${timeRange}`),
    playlists: () => request<PlaylistsResponse>('/me/playlists'),
    playlistArtists: (playlistId: string) =>
      request<PlaylistArtist[]>(`/me/playlists/${playlistId}/artists`),
  },

  rooms: {
    create: () => request<Room>('/rooms', { method: 'POST' }),
    join: (code: string) => request<Room>(`/rooms/${code}/join`, { method: 'POST' }),
    compare: (code: string) => request<CompareResult>(`/rooms/${code}/compare`),
  },
};
