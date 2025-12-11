'use client';

import { Globe } from 'lucide-react';

interface HandleExplainerProps {
    username: string;
    server: string;
}

/**
 * Presentation component that explains what a Mastodon handle is.
 * Uses a details/summary element for progressive disclosure.
 */
export function HandleExplainer({ username, server }: HandleExplainerProps) {
    return (
        <div style={{
            fontSize: 'var(--font-size-1)',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <div style={{ color: 'var(--text-2)', marginBottom: 'var(--size-2)' }}>@{username}</div>
            <details style={{ background: 'none', padding: 0, margin: 0, border: 'none', boxShadow: 'none', outline: 'none' }}>
                <summary style={{
                    display: 'inline-flex',
                    cursor: 'pointer',
                    padding: 'var(--size-1) var(--size-2)',
                    margin: 0,
                    background: 'var(--blue-6)',
                    color: 'white',
                    borderRadius: 'var(--radius-1)',
                    fontSize: 'var(--font-size-0)',
                    fontWeight: 'var(--font-weight-5)',
                }}>
                    {server}
                </summary>
                <div style={{
                    marginTop: 'var(--size-3)',
                    padding: 'var(--size-4)',
                    background: 'var(--surface-2)',
                    borderRadius: 'var(--radius-2)',
                    fontSize: 'var(--font-size-1)',
                }}>
                    {/* Header */}
                    <div style={{
                        fontWeight: 'var(--font-weight-6)',
                        fontSize: 'var(--font-size-3)',
                        color: 'var(--text-1)',
                        marginBottom: 'var(--size-4)',
                    }}>
                        What&apos;s in a handle?
                    </div>

                    {/* Handle box */}
                    <div style={{
                        padding: 'var(--size-3)',
                        border: '2px dashed var(--surface-4)',
                        borderRadius: 'var(--radius-2)',
                        marginBottom: 'var(--size-4)',
                    }}>
                        <div style={{ color: 'var(--text-2)', marginBottom: 'var(--size-1)' }}>
                            Their handle:
                        </div>
                        <div style={{ color: 'var(--blue-6)', fontWeight: 'var(--font-weight-5)' }}>
                            @{username}@{server}
                        </div>
                    </div>

                    {/* Definitions */}
                    <dl style={{ margin: 0 }}>
                        <div style={{ display: 'flex', gap: 'var(--size-3)', marginBottom: 'var(--size-4)' }}>
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '36px',
                                height: '36px',
                                background: 'var(--surface-3)',
                                borderRadius: 'var(--radius-round)',
                                color: 'var(--text-1)',
                                flexShrink: 0,
                            }}>
                                @
                            </span>
                            <div>
                                <dt style={{
                                    fontWeight: 'var(--font-weight-6)',
                                    color: 'var(--text-1)',
                                    marginBottom: 'var(--size-1)',
                                }}>
                                    Username
                                </dt>
                                <dd style={{ margin: 0, color: 'var(--text-2)' }}>
                                    Their unique identifier on their server. It&apos;s possible to find users with the same username on different servers.
                                </dd>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--size-3)', marginBottom: 'var(--size-4)' }}>
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '36px',
                                height: '36px',
                                background: 'var(--surface-3)',
                                borderRadius: 'var(--radius-round)',
                                color: 'var(--text-1)',
                                flexShrink: 0,
                            }}>
                                <Globe size={18} />
                            </span>
                            <div>
                                <dt style={{
                                    fontWeight: 'var(--font-weight-6)',
                                    color: 'var(--text-1)',
                                    marginBottom: 'var(--size-1)',
                                }}>
                                    Server
                                </dt>
                                <dd style={{ margin: 0, color: 'var(--text-2)' }}>
                                    Their digital home, where all of their posts live.
                                </dd>
                            </div>
                        </div>
                    </dl>

                    {/* ActivityPub section */}
                    <div style={{ color: 'var(--text-2)' }}>
                        Since handles say who someone is and where they are, you can interact with people across the social web of{' '}
                        <details style={{ display: 'inline', background: 'none', padding: 0 }}>
                            <summary style={{
                                display: 'inline',
                                color: 'var(--blue-6)',
                                cursor: 'pointer',
                                listStyle: 'none',
                                background: 'none',
                            }}>
                                <dfn style={{ fontStyle: 'normal' }}>ActivityPub-powered platforms</dfn>.
                            </summary>
                            <div style={{ marginTop: 'var(--size-3)', color: 'var(--text-2)' }}>
                                <p style={{ marginBottom: 'var(--size-3)' }}>
                                    ActivityPub is like the language Mastodon speaks with other social networks.
                                </p>
                                <p style={{ margin: 0 }}>
                                    It lets you connect and interact with people not just on Mastodon, but across different social apps too.
                                </p>
                            </div>
                        </details>
                    </div>
                </div>
            </details>
        </div>
    );
}
