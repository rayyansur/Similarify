'use client';

import Image from 'next/image';
import type { CommonArtist, CommonTrack } from '@/lib/spotify-types';

interface ArtistGridProps {
  artists: CommonArtist[];
}

interface TrackGridProps {
  tracks: CommonTrack[];
}

function EmptyState({ label }: { label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        gap: '12px',
        border: '1px dashed rgba(255,255,255,0.08)',
        borderRadius: '12px',
      }}
    >
      <span style={{ fontSize: '2rem' }}>🎵</span>
      <p style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--muted)', fontSize: '0.9rem' }}>
        No {label} in common — yet
      </p>
    </div>
  );
}

export function ArtistOverlapGrid({ artists }: ArtistGridProps) {
  if (!artists.length) return <EmptyState label="artists" />;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '12px',
      }}
    >
      {artists.map((artist) => (
        <div
          key={artist.id}
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 12px',
            gap: '10px',
            cursor: 'default',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: 'var(--surface-2)',
              border: '2px solid rgba(29,185,84,0.2)',
            }}
          >
            {artist.images?.[0] ? (
              <Image
                src={artist.images[0].url}
                alt={artist.name}
                width={72}
                height={72}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--surface-2)' }} />
            )}
          </div>
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#f0f0f0',
                lineHeight: 1.3,
              }}
            >
              {artist.name}
            </p>
            {artist.genres?.[0] && (
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.7rem',
                  color: 'var(--muted)',
                  marginTop: '3px',
                  textTransform: 'capitalize',
                }}
              >
                {artist.genres[0]}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TrackOverlapGrid({ tracks }: TrackGridProps) {
  if (!tracks.length) return <EmptyState label="tracks" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {tracks.map((track) => (
        <div
          key={track.id}
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              overflow: 'hidden',
              flexShrink: 0,
              background: 'var(--surface-2)',
            }}
          >
            {track.album?.images?.[0] ? (
              <Image
                src={track.album.images[0].url}
                alt={track.name}
                width={48}
                height={48}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            ) : null}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#f0f0f0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {track.name}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.78rem',
                color: 'var(--muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: '2px',
              }}
            >
              {track.artists.map((a) => a.name).join(', ')}
            </p>
          </div>
          {/* Shared indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--green)',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.7rem',
                color: 'var(--green)',
                fontWeight: 500,
              }}
            >
              shared
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
