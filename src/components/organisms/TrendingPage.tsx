'use client';

import Link from 'next/link';
import { TrendingContent } from './TrendingContent';
import { Button } from '@/components/atoms';
import { TrendingUp } from 'lucide-react';

export const TrendingPage = () => {
    return (
        <TrendingContent
            header={
                <div style={{
                    background: 'var(--surface-1)',
                    zIndex: 10,
                    padding: 'var(--size-4)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0,
                }}>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-5)', marginBottom: 'var(--size-1)', display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                            <TrendingUp size={24} />
                            Trending
                        </h1>
                        <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                            Trending on mastodon.social
                        </p>
                    </div>
                    <Link href="/auth/signin">
                        <Button>
                            Sign In
                        </Button>
                    </Link>
                </div>
            }
            scrollRestorationPrefix="home-trending"
        />
    );
};
