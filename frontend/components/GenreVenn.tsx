'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface Props {
  genres: string[];
}

const COLORS = [
  '#1DB954', '#21d45f', '#25e96a', '#18a349', '#15903f',
  '#2ecc71', '#27ae60', '#1abc9c', '#16a085', '#1D9D50',
];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number; name: string }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '8px 14px',
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '0.8rem',
        color: 'var(--subtle)',
      }}
    >
      {payload[0].name}
    </div>
  );
}

export function GenreVenn({ genres }: Props) {
  if (!genres.length) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '3rem',
          gap: '12px',
          border: '1px dashed rgba(255,255,255,0.08)',
          borderRadius: '12px',
        }}
      >
        <span style={{ fontSize: '2rem' }}>🎸</span>
        <p style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--muted)', fontSize: '0.9rem' }}>
          No shared genres found
        </p>
      </div>
    );
  }

  const top = genres.slice(0, 12);

  // Score: rank by position (first = highest combined frequency)
  const chartData = top.map((genre, i) => ({
    name: genre,
    score: Math.max(100 - i * 7, 20),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Bubble cloud — top genres as sized pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '20px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
        }}
      >
        {top.map((genre, i) => {
          const size = Math.max(0.72, 1.1 - i * 0.03);
          const opacity = Math.max(0.5, 1 - i * 0.04);
          return (
            <span
              key={genre}
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: `${size}rem`,
                fontWeight: i < 3 ? 600 : 500,
                color: i === 0 ? 'var(--green)' : i < 4 ? '#a0e8b8' : 'var(--subtle)',
                background:
                  i === 0
                    ? 'rgba(29,185,84,0.15)'
                    : i < 4
                    ? 'rgba(29,185,84,0.07)'
                    : 'rgba(255,255,255,0.04)',
                border: `1px solid ${i < 4 ? 'rgba(29,185,84,0.25)' : 'var(--border)'}`,
                borderRadius: '50px',
                padding: `${6 - i * 0.2}px ${14 - i * 0.5}px`,
                textTransform: 'capitalize',
                opacity,
                transition: 'opacity 0.2s',
              }}
            >
              {genre}
            </span>
          );
        })}
      </div>

      {/* Recharts horizontal bar */}
      <div>
        <p
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.78rem',
            color: 'var(--muted)',
            marginBottom: '12px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Genre Strength (combined rank)
        </p>
        <ResponsiveContainer width="100%" height={top.length * 32 + 20}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide domain={[0, 110]} />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{
                fill: 'var(--subtle)',
                fontSize: 11,
                fontFamily: 'var(--font-dm-sans)',
              }}
              axisLine={false}
              tickLine={false}
              style={{ textTransform: 'capitalize' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={14}>
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.85 - i * 0.04}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
