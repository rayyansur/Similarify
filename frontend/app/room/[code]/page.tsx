'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api, isAuthenticated } from '@/lib/api';
import { CompatibilityScore } from '@/components/CompatibilityScore';
import { ArtistOverlapGrid, TrackOverlapGrid } from '@/components/OverlapGrid';

type OverlapTab = 'artists' | 'tracks';

function WaitingRoom({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState('');
  useEffect(() => { setShareLink(`${window.location.origin}/room/${code}`); }, [code]);

  function copy() {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '28px',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      {/* Pulsing rings */}
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid rgba(29,185,84,0.4)',
              animation: `pulse 2s ease-out infinite`,
              animationDelay: `${i * 0.65}s`,
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            inset: '20px',
            borderRadius: '50%',
            background: 'rgba(29,185,84,0.15)',
            border: '1px solid rgba(29,185,84,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
          }}
        >
          🎵
        </div>
      </div>

      <div>
        <h2
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '8px',
          }}
        >
          Waiting for your friend…
        </h2>
        <p style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--muted)', fontSize: '0.9rem' }}>
          Share the link below. As soon as they join, your comparison will appear.
        </p>
      </div>

      {/* Share box */}
      <div
        style={{
          background: 'rgba(29,185,84,0.06)',
          border: '1px solid rgba(29,185,84,0.2)',
          borderRadius: '12px',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center',
          maxWidth: '480px',
          width: '100%',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.8rem',
            color: 'var(--subtle)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Your invite link
        </p>
        <code
          style={{
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            color: 'var(--green)',
            wordBreak: 'break-all',
            textAlign: 'center',
          }}
        >
          {shareLink}
        </code>
        <button
          onClick={copy}
          className="btn-green"
          style={{ padding: '10px 28px', borderRadius: '50px', fontSize: '0.88rem' }}
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = params.code;
  const [activeTab, setActiveTab] = useState<OverlapTab>('artists');

  useEffect(() => {
    if (!isAuthenticated()) {
      sessionStorage.setItem('similarify_redirect', `/room/${code}`);
      router.replace('/');
    }
  }, [code, router]);

  // Auto-join the room when the page loads
  const join = useMutation({ mutationFn: () => api.rooms.join(code) });
  useEffect(() => {
    if (isAuthenticated()) join.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Poll compare endpoint — 403 = still waiting, 200 = both in
  const compare = useQuery({
    queryKey: ['compare', code],
    queryFn: () => api.rooms.compare(code),
    retry: (count, err: unknown) => {
      const status = (err as { status?: number })?.status;
      if (status === 403) return true; // keep polling
      return count < 2;
    },
    retryDelay: 5000,
    refetchInterval: (query) => (query.state.data ? false : 5000),
  });

  const isWaiting = !compare.data && !compare.isError;
  const is403 = (compare.error as { status?: number } | null)?.status === 403;

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
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            fontFamily: 'var(--font-syne)',
            fontWeight: 800,
            fontSize: '1.25rem',
            letterSpacing: '-0.01em',
            color: '#fff',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          SIMILAR<span style={{ color: 'var(--green)' }}>IFY</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--muted)' }}>
            Room
          </span>
          <code
            style={{
              fontFamily: 'monospace',
              fontSize: '0.82rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border)',
              padding: '5px 12px',
              borderRadius: '8px',
              color: 'var(--subtle)',
            }}
          >
            {code}
          </code>
        </div>
      </nav>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Waiting state */}
        {(isWaiting || is403) && <WaitingRoom code={code} />}

        {/* Comparison data */}
        {compare.data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#fff',
                  marginBottom: '8px',
                }}
              >
                Your Compatibility
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  color: 'var(--muted)',
                  fontSize: '0.9rem',
                }}
              >
                Based on your Spotify listening history
              </p>
            </div>

            {/* Score */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CompatibilityScore score={compare.data.compatibility_score} />
            </div>

            {/* Divider */}
            <div
              style={{
                height: '1px',
                background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
              }}
            />

            {/* Stat chips */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              {[
                { label: 'Shared Artists', count: compare.data.common_artists.length },
                { label: 'Shared Tracks', count: compare.data.common_tracks.length },
              ].map(({ label, count }) => (
                <div
                  key={label}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px 28px',
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-syne)',
                      fontSize: '2rem',
                      fontWeight: 800,
                      color: 'var(--green)',
                      lineHeight: 1,
                    }}
                  >
                    {count}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '0.78rem',
                      color: 'var(--muted)',
                      marginTop: '6px',
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Overlap tabs */}
            <div>
              <div className="tab-bar" style={{ marginBottom: '20px', width: 'fit-content' }}>
                {(['artists', 'tracks'] as OverlapTab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`tab-btn${activeTab === t ? ' active' : ''}`}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {activeTab === 'artists' && (
                <ArtistOverlapGrid artists={compare.data.common_artists} />
              )}
              {activeTab === 'tracks' && (
                <TrackOverlapGrid tracks={compare.data.common_tracks} />
              )}

            </div>
          </div>
        )}

        {/* Error (non-403) */}
        {compare.isError && !is403 && (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--muted)',
              fontFamily: 'var(--font-dm-sans)',
            }}
          >
            <p>Something went wrong loading the comparison.</p>
            <button
              onClick={() => compare.refetch()}
              className="btn-ghost"
              style={{ marginTop: '16px', padding: '8px 20px', borderRadius: '8px' }}
            >
              Try again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
