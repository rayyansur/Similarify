'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { PlaylistArtist } from '@/lib/spotify-types';

// ── Physics bubble chart ────────────────────────────────────────────────────

interface Bubble {
  id: string;
  name: string;
  imageUrl: string | null;
  trackCount: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  img: HTMLImageElement | null;
  color: string;
}

const PALETTE = ['#1DB954', '#17a346', '#4ade80', '#22c55e', '#0d6b2e', '#a3e635', '#86efac'];

function deterministicColor(id: string): string {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h) ^ id.charCodeAt(i);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function buildBubbles(artists: PlaylistArtist[], W: number, H: number): Bubble[] {
  const cx = W / 2;
  const cy = H / 2;
  const containerR = Math.min(W, H) * 0.44;
  const maxCount = Math.max(...artists.map((a) => a.track_count), 1);
  const minR = 24;
  const maxR = Math.min(containerR * 0.38, 80);

  return artists.map((a, i) => {
    const ratio = Math.sqrt(a.track_count / maxCount);
    const r = minR + (maxR - minR) * ratio;
    const angle = (i / artists.length) * Math.PI * 2;
    const dist = (containerR - r) * 0.45;
    return {
      id: a.id,
      name: a.name,
      imageUrl: a.image_url,
      trackCount: a.track_count,
      x: cx + Math.cos(angle) * dist + (Math.random() - 0.5) * 10,
      y: cy + Math.sin(angle) * dist + (Math.random() - 0.5) * 10,
      vx: 0,
      vy: 0,
      r,
      img: null,
      color: deterministicColor(a.id),
    };
  });
}

function PhysicsCanvas({ artists }: { artists: PlaylistArtist[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const animRef = useRef<number>(0);
  const dragRef = useRef<{ idx: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || artists.length === 0) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const containerR = Math.min(W, H) * 0.44;

    const bubbles = buildBubbles(artists, W, H);
    bubblesRef.current = bubbles;

    bubbles.forEach((b) => {
      if (!b.imageUrl) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = b.imageUrl;
      img.onload = () => { b.img = img; };
    });

    const ctx = canvas.getContext('2d')!;

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Container ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, containerR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.025)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(29,185,84,0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Subtle glow at center
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, containerR * 0.6);
      grd.addColorStop(0, 'rgba(29,185,84,0.04)');
      grd.addColorStop(1, 'rgba(29,185,84,0)');
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, containerR, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = grd;
      ctx.fill();
      ctx.restore();

      for (const b of bubblesRef.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.clip();

        if (b.img) {
          try {
            ctx.drawImage(b.img, b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
          } catch {
            b.img = null;
            ctx.fillStyle = b.color;
            ctx.fill();
          }
        } else {
          ctx.fillStyle = b.color;
          ctx.fill();
        }
        ctx.restore();

        // Ring border
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(29,185,84,0.55)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Artist name
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const fontSize = Math.max(8, Math.min(12, b.r * 0.28));
        ctx.font = `600 ${fontSize}px "DM Sans", sans-serif`;
        const maxW = b.r * 1.7;
        const words = b.name.split(' ');
        let line = '';
        const lines: string[] = [];
        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > maxW && line) {
            lines.push(line);
            line = word;
          } else {
            line = test;
          }
        }
        lines.push(line);
        const lh = fontSize * 1.25;
        const totalH = lines.length * lh;
        lines.forEach((l, li) => {
          ctx.fillText(l, b.x, b.y - totalH / 2 + li * lh + lh / 2, maxW);
        });

        // Track count badge (small)
        if (b.r > 34) {
          const badgeY = b.y + b.r * 0.55;
          ctx.font = `500 ${Math.max(7, fontSize - 2)}px "DM Sans", sans-serif`;
          ctx.fillStyle = 'rgba(29,185,84,0.9)';
          ctx.fillText(`${b.trackCount}×`, b.x, badgeY, b.r * 1.4);
        }
        ctx.restore();
      }
    }

    function step() {
      const bs = bubblesRef.current;
      const DAMPING = 0.91;
      const GRAVITY = 0.12;

      for (let i = 0; i < bs.length; i++) {
        const b = bs[i];
        if (dragRef.current?.idx === i) continue;

        const dx = cx - b.x;
        const dy = cy - b.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        b.vx += (dx / d) * GRAVITY;
        b.vy += (dy / d) * GRAVITY;

        const nx2 = b.x + b.vx;
        const ny2 = b.y + b.vy;
        const dfc = Math.sqrt((nx2 - cx) ** 2 + (ny2 - cy) ** 2);
        if (dfc + b.r > containerR) {
          const nx = (nx2 - cx) / dfc;
          const ny = (ny2 - cy) / dfc;
          const dot = b.vx * nx + b.vy * ny;
          b.vx -= 2 * dot * nx * 0.55;
          b.vy -= 2 * dot * ny * 0.55;
          const safe = containerR - b.r - 1;
          b.x = cx + nx * safe;
          b.y = cy + ny * safe;
        } else {
          b.x = nx2;
          b.y = ny2;
        }

        b.vx *= DAMPING;
        b.vy *= DAMPING;
      }

      // Collision resolution
      for (let i = 0; i < bs.length; i++) {
        for (let j = i + 1; j < bs.length; j++) {
          const a = bs[i];
          const b = bs[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          const minD = a.r + b.r + 3;
          if (dist < minD) {
            const overlap = (minD - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            if (dragRef.current?.idx !== i) {
              a.x -= nx * overlap;
              a.y -= ny * overlap;
              a.vx -= nx * 0.4;
              a.vy -= ny * 0.4;
            }
            if (dragRef.current?.idx !== j) {
              b.x += nx * overlap;
              b.y += ny * overlap;
              b.vx += nx * 0.4;
              b.vy += ny * 0.4;
            }
          }
        }
      }

      draw();
      animRef.current = requestAnimationFrame(step);
    }

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [artists]);

  function getCanvasPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const t = (e as React.TouchEvent).touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    const m = e as React.MouseEvent;
    return { x: (m.clientX - rect.left) * scaleX, y: (m.clientY - rect.top) * scaleY };
  }

  function hitBubble(x: number, y: number) {
    const bs = bubblesRef.current;
    for (let i = bs.length - 1; i >= 0; i--) {
      const b = bs[i];
      if ((x - b.x) ** 2 + (y - b.y) ** 2 <= b.r ** 2) return i;
    }
    return -1;
  }

  function onDown(e: React.MouseEvent | React.TouchEvent) {
    const { x, y } = getCanvasPos(e);
    const idx = hitBubble(x, y);
    if (idx >= 0) {
      dragRef.current = { idx, ox: x - bubblesRef.current[idx].x, oy: y - bubblesRef.current[idx].y };
    }
  }

  function onMove(e: React.MouseEvent | React.TouchEvent) {
    if (!dragRef.current) return;
    const { x, y } = getCanvasPos(e);
    const b = bubblesRef.current[dragRef.current.idx];
    b.x = x - dragRef.current.ox;
    b.y = y - dragRef.current.oy;
    b.vx = 0;
    b.vy = 0;
  }

  function onUp() { dragRef.current = null; }

  return (
    <canvas
      ref={canvasRef}
      width={580}
      height={580}
      style={{ width: '100%', height: 'auto', cursor: 'grab', display: 'block', borderRadius: '50%' }}
      onMouseDown={onDown}
      onMouseMove={onMove}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchStart={onDown}
      onTouchMove={onMove}
      onTouchEnd={onUp}
    />
  );
}

// ── Modal shell ─────────────────────────────────────────────────────────────

interface Props {
  playlistId: string;
  playlistName: string;
  onClose: () => void;
}

export function PlaylistBubbleChart({ playlistId, playlistName, onClose }: Props) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['playlist-artists', playlistId],
    queryFn: () => api.me.playlistArtists(playlistId),
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0f0f0f',
          border: '1px solid rgba(29,185,84,0.2)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '640px',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.7rem', color: 'var(--green)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
              Artist breakdown
            </p>
            <h3 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              {playlistName}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: '#aaa',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          {isLoading && (
            <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid rgba(29,185,84,0.2)', borderTopColor: 'var(--green)', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--subtle)', fontSize: '0.88rem' }}>Analysing playlist…</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {isError && (
            <p style={{ fontFamily: 'var(--font-dm-sans)', color: '#ff6b6b', fontSize: '0.88rem', padding: '60px 0', textAlign: 'center' }}>
              {(error as (Error & { status?: number }) | null)?.status === 403
                ? "Spotify restricts access to this playlist.\nTry one of your own playlists."
                : 'Could not load playlist data.'}
            </p>
          )}

          {data && data.length === 0 && (
            <p style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--subtle)', fontSize: '0.88rem', padding: '60px 0' }}>
              No tracks found in this playlist.
            </p>
          )}

          {data && data.length > 0 && (
            <>
              <PhysicsCanvas artists={data} />
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.72rem', color: 'var(--muted)', textAlign: 'center' }}>
                Circle size = track share · Drag to rearrange · Top {data.length} artists
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
