import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Home } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/hooks/useStores';
import {
    normalizeInstanceURL,
    generateAuthorizationURL,
    getRedirectURI,
    getScopes,
    getAppName,
} from '@/utils/oauth';

export default function SignInPage() {
    const authStore = useAuthStore();
    const [instanceURL, setInstanceURL] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPending(true);
        setError(null);

        try {
            // Normalize instance URL
            const normalizedURL = normalizeInstanceURL(instanceURL);
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

            // Store instance URL and client credentials only after success
            authStore.setInstance(normalizedURL);
            authStore.setClientCredentials(app.client_id, app.client_secret);

            // Generate authorization URL and redirect
            const authURL = generateAuthorizationURL(normalizedURL, app.client_id);
            window.location.href = authURL;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign in');
            setPending(false);
        }
    };

    const isDisabled = pending || !instanceURL.trim();

    return (
        <>
            <Head>
                <title>Sign In - Mastodon</title>
                <meta name="description" content="Sign in to your Mastodon account" />
            </Head>
            <div style={{ maxWidth: '500px', margin: '0 auto', padding: 'var(--size-4)', marginTop: 'var(--size-8)' }}>
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

                <form onSubmit={handleSubmit}>
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
                </form>
            </div>
        </>
    );
}
