'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { getCookie, deleteCookie } from '@/utils/cookies';
import { useAuthStore } from '@/hooks/useStores';
import { getRedirectURI, retrievePKCEData } from '@/utils/oauth';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authStore = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code and state from URL
        const code = searchParams.get('code');
        const returnedState = searchParams.get('state');

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Retrieve and validate PKCE data
        const pkceData = retrievePKCEData();
        if (!pkceData) {
          throw new Error('Missing PKCE data. Please try signing in again.');
        }

        // Validate state parameter to prevent CSRF
        if (!returnedState || returnedState !== pkceData.state) {
          throw new Error('Invalid state parameter - possible CSRF attack. Please try signing in again.');
        }

        // Get stored auth data
        const { instanceURL, clientId, clientSecret } = authStore.getState();
        if (!instanceURL || !clientId || !clientSecret) {
          throw new Error('Missing authentication data. Please try signing in again.');
        }

        // Create axios client for token exchange
        const instanceClient = axios.create({
          baseURL: instanceURL.replace(/\/$/, ''),
        });

        // Exchange code for access token using PKCE + client_secret (Mastodon requires both)
        const formData = new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: getRedirectURI(),
          code_verifier: pkceData.verifier,
        });

        const { data: token } = await instanceClient.post('/oauth/token', formData.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        // Store access token
        authStore.setAccessToken(token.access_token);

        // Get redirect path from cookie (set by middleware when accessing protected route)
        const rawRedirectPath = await getCookie('authRedirect') || '/';
        // Clear the redirect cookie
        await deleteCookie('authRedirect');

        // Redirect to the intended page or home
        router.push(decodeURIComponent(rawRedirectPath));
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [searchParams, authStore, router]);

  return (
    <div style={{ maxWidth: '500px', marginTop: 'var(--size-8)', textAlign: 'center' }}>
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
      <div style={{ maxWidth: '500px', marginTop: 'var(--size-8)', textAlign: 'center' }}>
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
