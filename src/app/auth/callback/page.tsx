'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MastodonClient } from '@/api/client';
import { useAuthStore } from '@/hooks/useStores';
import { getRedirectURI } from '@/utils/oauth';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authStore = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL
        const code = searchParams.get('code');
        if (!code) {
          throw new Error('No authorization code received');
        }

        // Get stored auth data
        const { instanceURL, clientId, clientSecret } = authStore.getState();
        if (!instanceURL || !clientId || !clientSecret) {
          throw new Error('Missing authentication data. Please try signing in again.');
        }

        // Create API client
        const client = new MastodonClient(instanceURL);

        // Exchange code for access token
        const token = await client.getToken(
          clientId,
          clientSecret,
          code,
          getRedirectURI()
        );

        // Store access token
        authStore.setAccessToken(token.access_token);

        // Set token in client
        client.setAccessToken(token.access_token);

        // Redirect to home page
        router.push('/');
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [searchParams, authStore, router]);

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: 'var(--size-8)', textAlign: 'center' }}>
      {error ? (
        <>
          <h1 style={{ fontSize: 'var(--font-size-5)', marginBottom: 'var(--size-4)', color: 'var(--red-9)' }}>
            Authentication Failed
          </h1>
          <p style={{ color: 'var(--text-2)', marginBottom: 'var(--size-6)' }}>{error}</p>
          <a
            href="/auth/signin"
            style={{
              display: 'inline-block',
              padding: 'var(--size-3) var(--size-5)',
              background: 'var(--blue-6)',
              color: 'white',
              borderRadius: 'var(--radius-2)',
              textDecoration: 'none',
              fontWeight: 'var(--font-weight-6)',
            }}
          >
            Try Again
          </a>
        </>
      ) : (
        <>
          <div
            className="spinner"
            style={{
              margin: '0 auto var(--size-6)',
              width: 'var(--size-8)',
              height: 'var(--size-8)',
            }}
          />
          <h1 style={{ fontSize: 'var(--font-size-5)', marginBottom: 'var(--size-4)' }}>
            Authenticating...
          </h1>
          <p style={{ color: 'var(--text-2)' }}>
            Please wait while we complete your sign in.
          </p>
        </>
      )}
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ maxWidth: '500px', marginTop: 'var(--size-8)', textAlign: 'center' }}>
        <div
          className="spinner"
          style={{
            margin: '0 auto var(--size-6)',
            width: 'var(--size-8)',
            height: 'var(--size-8)',
          }}
        />
        <h1 style={{ fontSize: 'var(--font-size-5)', marginBottom: 'var(--size-4)' }}>
          Loading...
        </h1>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
