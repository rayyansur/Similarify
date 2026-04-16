import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#080808',
        surface: '#111111',
        'surface-2': '#1a1a1a',
        green: '#1DB954',
        'green-dim': '#158a3e',
        'green-glow': 'rgba(29,185,84,0.15)',
        border: 'rgba(255,255,255,0.08)',
        'border-hover': 'rgba(255,255,255,0.16)',
        muted: '#666666',
        subtle: '#999999',
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
      },
      animation: {
        'bar-1': 'soundBar 1.2s ease-in-out infinite',
        'bar-2': 'soundBar 1.0s ease-in-out infinite 0.2s',
        'bar-3': 'soundBar 1.4s ease-in-out infinite 0.1s',
        'bar-4': 'soundBar 0.9s ease-in-out infinite 0.3s',
        'bar-5': 'soundBar 1.3s ease-in-out infinite 0.05s',
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
        'score-fill': 'scoreFill 1.5s ease-out forwards',
      },
      keyframes: {
        soundBar: {
          '0%, 100%': { transform: 'scaleY(0.15)' },
          '50%': { transform: 'scaleY(1)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(29,185,84,0.3)' },
          '50%': { boxShadow: '0 0 0 20px rgba(29,185,84,0)' },
        },
        scoreFill: {
          from: { strokeDashoffset: '565' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
