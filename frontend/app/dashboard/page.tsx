'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { api, isAuthenticated, clearToken } from '@/lib/api';
import { TopList } from '@/components/TopList';
import type { SpotifyPlaylist } from '@/lib/spotify-types';

type Tab = 'artists' | 'tracks' | 'playlists';
type Range = 'short_term' | 'medium_term' | 'long_term';
const RANGE_LABELS: Record<Range, string> = {
  short_term: '4 Weeks',
  medium_term: '6 Months',
  long_term: 'All Time',
};

function PlaylistCard({ playlist }: { playlist: SpotifyPlaylist }) {
  return (
    <a
      href={playlist.external_urls.spotify}
      target="_blank"
      rel="noopener noreferrer"
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '12px 14px',
        cursor: 'pointer',
        color: 'inherit',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '8px',
          overflow: 'hidden',
          flexShrink: 0,
          background: 'var(--surface-2)',
        }}
      >
        {playlist.images?.[0] && (
          <Image
            src={playlist.images[0].url}
            alt={playlist.name}
            width={52}
            height={52}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.88rem',
            fontWeight: 500,
            color: '#f0f0f0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {playlist.name}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.75rem',
            color: 'var(--muted)',
            marginTop: '2px',
            fontStyle: playlist.items == null ? 'italic' : 'normal',
          }}
        >
          {playlist.items != null ? `${playlist.items.total} tracks` : 'This playlist is private'}
        </p>
      </div>
      <span style={{ color: 'var(--subtle)', fontSize: '0.8rem', flexShrink: 0 }}>↗</span>
    </a>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('artists');
  const [range, setRange] = useState<Range>('medium_term');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/');
    }
  }, [router]);

  const artists = useQuery({
    queryKey: ['top-artists', range],
    queryFn: () => api.me.topArtists(range),
    enabled: tab === 'artists',
  });

  const tracks = useQuery({
    queryKey: ['top-tracks', range],
    queryFn: () => api.me.topTracks(range),
    enabled: tab === 'tracks',
  });

  const playlists = useQuery({
    queryKey: ['playlists'],
    queryFn: () => api.me.playlists(),
    enabled: tab === 'playlists',
  });

  const createRoom = useMutation({
    mutationFn: api.rooms.create,
    onSuccess: (room) => setRoomCode(room.code),
  });

  const [shareLink, setShareLink] = useState<string | null>(null);
  useEffect(() => {
    setShareLink(roomCode ? `${window.location.origin}/room/${roomCode}` : null);
  }, [roomCode]);

  function copyLink() {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 32px',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          background: 'rgba(8,8,8,0.9)',
          backdropFilter: 'blur(12px)',
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 800,
            fontSize: '1.25rem',
            letterSpacing: '-0.01em',
            color: '#fff',
          }}
        >
          SIMILAR<span style={{ color: 'var(--green)' }}>IFY</span>
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {roomCode ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <code
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.8rem',
                  background: 'rgba(29,185,84,0.12)',
                  border: '1px solid rgba(29,185,84,0.3)',
                  color: 'var(--green)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                }}
              >
                {roomCode}
              </code>
              <button
                onClick={copyLink}
                className="btn-ghost"
                style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '0.8rem' }}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => createRoom.mutate()}
              disabled={createRoom.isPending}
              className="btn-green"
              style={{ padding: '9px 20px', borderRadius: '50px', fontSize: '0.85rem' }}
            >
              {createRoom.isPending ? 'Creating...' : '+ Invite Friend'}
            </button>
          )}

          <button
            onClick={() => {
              clearToken();
              router.replace('/');
            }}
            className="btn-ghost"
            style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '0.8rem' }}
          >
            Log out
          </button>
        </div>
      </nav>

      {/* Room banner */}
      {shareLink && (
        <div
          style={{
            background: 'rgba(29,185,84,0.08)',
            borderBottom: '1px solid rgba(29,185,84,0.15)',
            padding: '14px 32px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.88rem', color: 'var(--green)', fontWeight: 500 }}>
            Room created! Share this link with a friend:
          </span>
          <code
            style={{
              fontFamily: 'monospace',
              fontSize: '0.82rem',
              color: '#a0e8b8',
              background: 'rgba(0,0,0,0.3)',
              padding: '4px 10px',
              borderRadius: '6px',
            }}
          >
            {shareLink}
          </code>
          <button
            onClick={copyLink}
            className="btn-green"
            style={{ padding: '6px 16px', borderRadius: '50px', fontSize: '0.8rem' }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button
            onClick={() => router.push(`/room/${roomCode}`)}
            className="btn-ghost"
            style={{ padding: '6px 16px', borderRadius: '50px', fontSize: '0.8rem' }}
          >
            Go to Room →
          </button>
        </div>
      )}

      {/* Main content */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '24px',
          }}
        >
          Your Music
        </h2>

        {/* Tab bar + Range picker */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div className="tab-bar">
            {(['artists', 'tracks', 'playlists'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`tab-btn${tab === t ? ' active' : ''}`}
                style={{ textTransform: 'capitalize' }}
              >
                {t}
              </button>
            ))}
          </div>

          {tab !== 'playlists' && (
            <div className="tab-bar">
              {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`tab-btn${range === r ? ' active' : ''}`}
                >
                  {RANGE_LABELS[r]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab content */}
        {tab === 'artists' && (
          <div className="card" style={{ padding: '8px' }}>
            <TopList
              items={artists.data?.items ?? []}
              loading={artists.isLoading}
            />
          </div>
        )}

        {tab === 'tracks' && (
          <div className="card" style={{ padding: '8px' }}>
            <TopList
              items={tracks.data?.items ?? []}
              loading={tracks.isLoading}
            />
          </div>
        )}

        {tab === 'playlists' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {playlists.isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton"
                    style={{ height: '76px', borderRadius: '12px' }}
                  />
                ))
              : playlists.data?.items.map((pl) => (
                  <PlaylistCard key={pl.id} playlist={pl} />
                ))}
          </div>
        )}
      </main>

    </div>
  );
}
