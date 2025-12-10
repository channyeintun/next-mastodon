'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useFollowRequests } from '@/api';
import { AccountCard, AccountCardSkeleton } from '@/components/molecules';
import { IconButton, Button } from '@/components/atoms';
import type { Account } from '@/types';

export default function FollowRequestsPage() {
    const router = useRouter();
    const {
        data: requestPages,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useFollowRequests();

    const requests = requestPages?.pages.flatMap((page) => page) ?? [];

    if (isLoading) {
        return (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--size-3)',
                    padding: 'var(--size-4)',
                    borderBottom: '1px solid var(--surface-3)',
                    position: 'sticky',
                    top: 0,
                    background: 'var(--surface-1)',
                    zIndex: 10,
                }}>
                    <IconButton onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </IconButton>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-4)', marginBottom: 'var(--size-1)', display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                            <UserPlus size={20} />
                            Follow Requests
                        </h1>
                        <div className="skeleton" style={{ width: 100, height: 14, borderRadius: 'var(--radius-1)' }} />
                    </div>
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                    <AccountCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--size-3)',
                padding: 'var(--size-4)',
                borderBottom: '1px solid var(--surface-3)',
                position: 'sticky',
                top: 0,
                background: 'var(--surface-1)',
                zIndex: 10,
            }}>
                <IconButton onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </IconButton>
                <div>
                    <h1 style={{ fontSize: 'var(--font-size-4)', marginBottom: 'var(--size-1)', display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                        <UserPlus size={20} />
                        Follow Requests
                    </h1>
                    <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                        {requests.length} pending request{requests.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Requests List */}
            <div>
                {requests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
                        <UserPlus size={48} style={{ opacity: 0.3, marginBottom: 'var(--size-4)' }} />
                        <p>No pending follow requests</p>
                    </div>
                ) : (
                    requests.map((account: Account) => (
                        <AccountCard
                            key={account.id}
                            account={account}
                            showFollowButton={false}
                            showFollowRequestActions={true}
                        />
                    ))
                )}

                {hasNextPage && (
                    <div style={{ padding: 'var(--size-4)', textAlign: 'center' }}>
                        <Button
                            variant="secondary"
                            onClick={() => fetchNextPage()}
                            isLoading={isFetchingNextPage}
                        >
                            Load More
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
