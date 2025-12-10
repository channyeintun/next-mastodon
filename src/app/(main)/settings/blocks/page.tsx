'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Ban } from 'lucide-react';
import { useBlockedAccounts } from '@/api';
import { AccountCard, AccountCardSkeleton } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { IconButton, Spinner } from '@/components/atoms';
import type { Account } from '@/types';

export default function BlockedAccountsPage() {
    const router = useRouter();
    const {
        data: blockedPages,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useBlockedAccounts();

    const blockedAccounts = blockedPages?.pages.flatMap((page) => page) ?? [];

    if (isLoading) {
        return (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--size-3)',
                    padding: 'var(--size-4)',
                    borderBottom: '1px solid var(--surface-3)',
                }}>
                    <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                    <div>
                        <div className="skeleton" style={{ width: 150, height: 20, marginBottom: 4 }} />
                        <div className="skeleton" style={{ width: 100, height: 14 }} />
                    </div>
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
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
                        <Ban size={20} />
                        Blocked Accounts
                    </h1>
                    <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                        {blockedAccounts.length} blocked account{blockedAccounts.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Blocked Accounts List */}
            <VirtualizedList
                items={blockedAccounts}
                renderItem={(account: Account) => (
                    <AccountCard
                        key={account.id}
                        account={account}
                        showFollowButton={false}
                        showUnblockButton={true}
                    />
                )}
                getItemKey={(account) => account.id}
                estimateSize={72}
                overscan={3}
                onLoadMore={() => fetchNextPage()}
                isLoadingMore={isFetchingNextPage}
                hasMore={!!hasNextPage}
                height="calc(100vh - 120px)"
                loadingIndicator={
                    <div style={{ display: 'grid', placeItems: 'center', padding: 'var(--size-4)' }}>
                        <Spinner />
                    </div>
                }
                emptyState={
                    <div style={{ display: 'grid', placeItems: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
                        <Ban size={48} style={{ opacity: 0.3, marginBottom: 'var(--size-4)' }} />
                        <p>No blocked accounts</p>
                        <p style={{ fontSize: 'var(--font-size-0)', marginTop: 'var(--size-2)' }}>
                            When you block someone, they won&apos;t be able to see your posts or interact with you.
                        </p>
                    </div>
                }
            />
        </div>
    );
}
