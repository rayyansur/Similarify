'use client';

import Image from 'next/image';
import type { SpotifyArtist, SpotifyTrack } from '@/lib/spotify-types';

type Item = SpotifyArtist | SpotifyTrack;

function isTrack(item: Item): item is SpotifyTrack {
  return 'album' in item;
}

interface Props {
  items: Item[];
  loading?: boolean;
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 16px',
          }}
        >
          <div className="skeleton" style={{ width: '20px', height: '16px', flexShrink: 0 }} />
          <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '6px', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div className="skeleton" style={{ width: '60%', height: '14px' }} />
            <div className="skeleton" style={{ width: '40%', height: '12px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TopList({ items, loading }: Props) {
  if (loading) return <Skeleton />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {items.map((item, idx) => {
        const imageUrl = isTrack(item)
          ? item.album.images?.[0]?.url
          : (item as SpotifyArtist).images?.[0]?.url;

        const subtitle = isTrack(item)
          ? item.artists.map((a) => a.name).join(', ')
          : (item as SpotifyArtist).genres?.slice(0, 2).join(', ') || 'Artist';

        const href = item.external_urls?.spotify;

        return (
          <a
            key={item.id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '10px 14px',
              borderRadius: '10px',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = 'transparent')
            }
          >
            {/* Rank */}
            <span
              style={{
                fontFamily: 'var(--font-syne)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: idx < 3 ? 'var(--green)' : 'var(--muted)',
                width: '20px',
                flexShrink: 0,
                textAlign: 'right',
              }}
            >
              {idx + 1}
            </span>

            {/* Image */}
            {imageUrl ? (
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: isTrack(item) ? '6px' : '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'var(--surface-2)',
                }}
              >
                <Image
                  src={imageUrl}
                  alt={item.name}
                  width={44}
                  height={44}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: isTrack(item) ? '6px' : '50%',
                  background: 'var(--surface-2)',
                  flexShrink: 0,
                }}
              />
            )}

            {/* Info */}
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
                {item.name}
              </p>
              {subtitle && (
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '0.78rem',
                    color: 'var(--muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginTop: '2px',
                    textTransform: 'capitalize',
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {/* Popularity bar */}
            {'popularity' in item && (
              <div
                style={{
                  width: '40px',
                  height: '3px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${item.popularity}%`,
                    background: 'var(--green)',
                    borderRadius: '2px',
                    opacity: 0.7,
                  }}
                />
              </div>
            )}
          </a>
        );
      })}
    </div>
  );
}
