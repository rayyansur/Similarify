'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

// Spotify may redirect here if the dashboard has the frontend URL registered.
// Forward the code+state straight to the backend callback so the auth flow completes.
function ForwardHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (error || !code || !state) {
      router.replace('/');
      return;
    }

    window.location.href = `${API_URL}/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
  }, [params, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '3px solid rgba(29,185,84,0.2)', borderTopColor: 'var(--green)', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--subtle)', fontSize: '0.95rem' }}>Connecting your Spotify...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <ForwardHandler />
    </Suspense>
  );
}
