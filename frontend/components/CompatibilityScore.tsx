'use client';

import { useEffect, useRef } from 'react';

interface Props {
  score: number; // 0–100
}

function getLabel(score: number): { text: string; color: string } {
  if (score >= 80) return { text: 'Musical Soulmates', color: '#1DB954' };
  if (score >= 60) return { text: 'Great Match', color: '#4ade80' };
  if (score >= 40) return { text: 'Solid Overlap', color: '#a3e635' };
  if (score >= 20) return { text: 'Different Vibes', color: '#facc15' };
  return { text: 'Opposites Attract', color: '#f87171' };
}

export function CompatibilityScore({ score }: Props) {
  const circleRef = useRef<SVGCircleElement>(null);

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const { text, color } = getLabel(score);

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    el.style.strokeDashoffset = String(circumference);
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.4, 0, 0.2, 1)';
      el.style.strokeDashoffset = String(offset);
    });
    return () => cancelAnimationFrame(raf);
  }, [score, circumference, offset]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
      }}
    >
      {/* Circle gauge */}
      <div style={{ position: 'relative', width: '220px', height: '220px' }}>
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background track */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
          />
          {/* Score arc */}
          <circle
            ref={circleRef}
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{
              filter: `drop-shadow(0 0 8px ${color}60)`,
            }}
          />
        </svg>

        {/* Center content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: '3.5rem',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1,
            }}
          >
            {Math.round(score)}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '0.75rem',
              color: 'var(--muted)',
              marginTop: '4px',
            }}
          >
            out of 100
          </span>
        </div>
      </div>

      {/* Label */}
      <div style={{ textAlign: 'center' }}>
        <span
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: '1.25rem',
            fontWeight: 700,
            color,
          }}
        >
          {text}
        </span>
        <p
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.82rem',
            color: 'var(--muted)',
            marginTop: '6px',
          }}
        >
          Based on your listening history
        </p>
      </div>
    </div>
  );
}
