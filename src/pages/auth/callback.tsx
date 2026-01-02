import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import { getCookie, deleteCookie } from '@/utils/cookies';
import { useAuthStore } from '@/hooks/useStores';
import { getRedirectURI } from '@/utils/oauth';

export default function CallbackPage() {
    const router = useRouter();
    const authStore = useAuthStore();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get authorization code from URL
                const code = router.query.code as string;
                if (!code) {
                    // Wait for router to be ready
                    if (!router.isReady) return;
                    throw new Error('No authorization code received');
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

                // Exchange code for access token
                const formData = new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: getRedirectURI(),
                });

                const { data: token } = await instanceClient.post('/oauth/token', formData.toString(), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });

                // Store access token
                authStore.setAccessToken(token.access_token);

                // Get redirect path from cookie (set by middleware when accessing protected route)
                const redirectPath = await getCookie('authRedirect') || '/';
                // Clear the redirect cookie
                await deleteCookie('authRedirect');

                // Redirect to the intended page or home
                router.push(redirectPath);
            } catch (err) {
                console.error('OAuth callback error:', err);
                setError(err instanceof Error ? err.message : 'Authentication failed');
            }
        };

        handleCallback();
    }, [router.query.code, router.isReady, authStore, router]);

    return (
        <>
            <Head>
                <title>Authenticating... - Mastodon</title>
            </Head>
            <div style={{ maxWidth: '500px', margin: '0 auto', marginTop: 'var(--size-8)', textAlign: 'center', padding: 'var(--size-4)' }}>
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
        </>
    );
}
