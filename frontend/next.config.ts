import fs from 'fs';
import path from 'path';
import type { NextConfig } from 'next';

// Load shared root .env so Next.js picks up NEXT_PUBLIC_* vars at build time
const rootEnvPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(rootEnvPath)) {
  for (const line of fs.readFileSync(rootEnvPath, 'utf-8').split('\n')) {
    const m = line.match(/^\s*([^#\s][^=]*?)\s*=\s*(.*?)\s*$/);
    if (m) {
      const [, key, val] = m;
      if (!(key in process.env)) {
        process.env[key] = val.replace(/^(['"])(.*)\1$/, '$2');
      }
    }
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: 'mosaic.scdn.co' },
      { protocol: 'https', hostname: 'image-cdn-ak.spotifycdn.com' },
      { protocol: 'https', hostname: 'image-cdn-fa.spotifycdn.com' },
      { protocol: 'https', hostname: 'lineup-images.scdn.co' },
    ],
  },
};

export default nextConfig;
