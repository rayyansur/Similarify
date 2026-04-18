'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, isAuthenticated } from '@/lib/api';

const BAR_DURATIONS = [1.5, 1.0, 1.4, 0.9, 1.3, 0.85, 1.25, 1.2, 0.88, 1.45, 0.97, 1.1];

function SoundBars() {
  return (
    <div className="sound-bars">
      {[1.0, 0.4, 0.85, 0.55, 0.95, 0.3, 0.7, 0.9, 0.45, 0.8, 0.35, 0.65].map((h, i) => (
        <div
          key={i}
          className="sound-bar animate-[soundBar_ease-in-out_infinite]"
          style={{
            animationDuration: `${BAR_DURATIONS[i]}s`,
            animationDelay: `${i * 0.08}s`,
            opacity: 0.4 + h * 0.6,
          }}
        />
      ))}
    </div>
  );
}

function SpotifyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '2rem',
      }}
    >
      {/* Radial glow background */}
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(29,185,84,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '-5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(29,185,84,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '-8%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(29,185,84,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          maxWidth: '640px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Sound bars decoration */}
        <div style={{ opacity: 0.7 }}>
          <SoundBars />
        </div>

        {/* Brand */}
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: 'clamp(3.5rem, 10vw, 7rem)',
              fontWeight: 800,
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              color: '#fff',
              marginBottom: '1.25rem',
            }}
          >
            SIMILAR
            <span style={{ color: 'var(--green)' }}>IFY</span>
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '1.125rem',
              color: 'var(--subtle)',
              lineHeight: 1.6,
              maxWidth: '420px',
              margin: '0 auto',
            }}
          >
            Compare your taste. Discover your musical compatibility with friends.
          </p>
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center',
          }}
        >
          {['Top Artists', 'Top Tracks', 'Genre Overlap', 'Compatibility Score'].map((f) => (
            <span
              key={f}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '0.8rem',
                fontWeight: 500,
                color: 'var(--subtle)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                borderRadius: '50px',
                padding: '6px 16px',
                letterSpacing: '0.02em',
              }}
            >
              {f}
            </span>
          ))}
        </div>

        {/* CTA */}
        <a href={api.auth.loginUrl()} className="spotify-btn">
          <SpotifyIcon />
          Continue with Spotify
        </a>

        <p
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.75rem',
            color: 'var(--muted)',
          }}
        >
          We only read your listening history. Nothing is ever posted.
        </p>
      </div>

      {/* Bottom decorative rings */}
      <div
        style={{
          position: 'absolute',
          bottom: '-120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          border: '1px solid rgba(29,185,84,0.06)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-180px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          border: '1px solid rgba(29,185,84,0.04)',
          pointerEvents: 'none',
        }}
      />
    </main>
  );
}
