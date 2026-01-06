'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import axios from 'axios';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { useAuthStore } from '@/hooks/useStores';
import {
  normalizeInstanceURL,
  generateAuthorizationURL,
  getRedirectURI,
  getScopes,
  getAppName,
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  storePKCEData,
} from '@/utils/oauth';
import { storeClientSecret, storeInstanceURL, storeClientId } from '@/app/api/auth/actions';

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      style={{
        width: '100%',
        padding: 'var(--size-3)',
        fontSize: 'var(--font-size-2)',
        fontWeight: 'var(--font-weight-6)',
        border: 'none',
        borderRadius: 'var(--radius-2)',
        background: isDisabled ? 'var(--surface-3)' : 'var(--blue-6)',
        color: 'white',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
    >
      {pending ? 'Connecting...' : 'Continue with Mastodon'}
    </button>
  );
}

export default function SignInPage() {
  const authStore = useAuthStore();
  const [instanceURL, setInstanceURL] = useState('');

  const handleSubmit = async (_prevState: string | null, formData: FormData) => {
    const instance = formData.get('instance') as string;

    try {
      // Normalize instance URL
      const normalizedURL = normalizeInstanceURL(instance);
      // Create axios client for this specific instance
      const instanceClient = axios.create({
        baseURL: normalizedURL.replace(/\/$/, ''),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Create OAuth app
      const { data: app } = await instanceClient.post('/api/v1/apps', {
        client_name: getAppName(),
        redirect_uris: getRedirectURI(),
        scopes: getScopes(),
        website: typeof window !== 'undefined' ? window.location.origin : undefined,
      });

      // Store credentials as httpOnly cookies via server actions
      await Promise.all([
        storeInstanceURL(normalizedURL),
        storeClientId(app.client_id),
        storeClientSecret(app.client_secret),
      ]);

      // Also update in-memory state for immediate use (cookies are set by server actions)
      authStore.setInstanceInMemory(normalizedURL);
      authStore.setClientIdInMemory(app.client_id);

      // Generate PKCE and state parameters
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateState();

      // Store PKCE data for callback
      storePKCEData(codeVerifier, state);

      // Generate authorization URL with PKCE and redirect
      const authURL = generateAuthorizationURL(normalizedURL, app.client_id, codeChallenge, state);
      window.location.href = authURL;

      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Failed to sign in';
    }
  };

  const [error, formAction] = useActionState(handleSubmit, null);

  return (
    <div style={{ maxWidth: '500px', marginTop: 'var(--size-8)' }}>
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--size-2)',
          color: 'var(--text-2)',
          textDecoration: 'none',
          marginBottom: 'var(--size-4)',
        }}
      >
        <Home size={16} />
        Home
      </Link>
      <h1 style={{ fontSize: 'var(--font-size-6)', marginBottom: 'var(--size-4)', textAlign: 'start' }}>
        Sign in to Mastodon
      </h1>
      <p style={{ color: 'var(--text-2)', marginBottom: 'var(--size-6)', textAlign: 'start' }}>
        Enter your Mastodon instance URL to get started
      </p>

      <form action={formAction}>
        <div style={{ marginBottom: 'var(--size-4)' }}>
          <label
            htmlFor="instance"
            style={{
              display: 'block',
              marginBottom: 'var(--size-2)',
              fontWeight: 'var(--font-weight-6)',
            }}
          >
            Instance URL
          </label>
          <input
            id="instance"
            name="instance"
            type="text"
            value={instanceURL}
            onChange={(e) => setInstanceURL(e.target.value)}
            placeholder="mastodon.social"
            required
            style={{
              width: '100%',
              padding: 'var(--size-3)',
              fontSize: 'var(--font-size-2)',
              border: '1px solid var(--surface-3)',
              borderRadius: 'var(--radius-2)',
              background: 'var(--surface-2)',
              color: 'var(--text-1)',
            }}
          />
          <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)', marginTop: 'var(--size-2)' }}>
            Examples: mastodon.social, mastodon.online, fosstodon.org
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: 'var(--size-3)',
              background: 'var(--red-2)',
              color: 'var(--red-9)',
              borderRadius: 'var(--radius-2)',
              marginBottom: 'var(--size-4)',
            }}
          >
            {error}
          </div>
        )}

        <SubmitButton disabled={!instanceURL.trim()} />
      </form>
    </div>
  );
}
