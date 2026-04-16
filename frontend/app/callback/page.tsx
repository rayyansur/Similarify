'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { setToken } from '@/lib/api';

export default function CallbackPage() {
  const router = useRouter();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    // Backend redirects here with the JWT in the URL fragment:
    // /callback#token=<jwt>
    // Fragments never leave the browser, so the token is never logged server-side.
    const fragment = window.location.hash.slice(1); // strip leading '#'
    const params = new URLSearchParams(fragment);
    const token = params.get('token');

    if (!token) {
      router.replace('/');
      return;
    }

    setToken(token);
    const dest = sessionStorage.getItem('similarify_redirect') ?? '/dashboard';
    sessionStorage.removeItem('similarify_redirect');
    router.replace(dest);
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: '3px solid rgba(29,185,84,0.2)',
          borderTopColor: 'var(--green)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--subtle)', fontSize: '0.95rem' }}>
        Connecting your Spotify...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
