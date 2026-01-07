'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, VolumeX } from 'lucide-react';
import { useMutedAccounts } from '@/api';
import { AccountCard, AccountCardSkeleton, PageHeaderSkeleton } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { IconButton, Spinner } from '@/components/atoms';
import { flattenPages } from '@/utils/fp';
import type { Account } from '@/types';
import { useTranslations } from 'next-intl';

export default function MutedAccountsPage() {
    const router = useRouter();
    const t = useTranslations('settings.mutesPage');
    const {
        data: mutedPages,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useMutedAccounts();

    const mutedAccounts = flattenPages(mutedPages?.pages);

    if (isLoading) {
        return (
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                <PageHeaderSkeleton />
                {Array.from({ length: 5 }).map((_, i) => (
                    <AccountCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
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
                        <VolumeX size={20} />
                        {t('title')}
                    </h1>
                    <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                        {t('count', { count: mutedAccounts.length })}
                    </p>
                </div>
            </div>

            {/* Muted Accounts List */}
            <VirtualizedList
                items={mutedAccounts}
                renderItem={(account: Account) => (
                    <AccountCard
                        key={account.id}
                        account={account}
                        showFollowButton={false}
                        showUnmuteButton
                        style={{ marginBottom: 'var(--size-2)' }}
                    />
                )}
                getItemKey={(account) => account.id}
                estimateSize={72}
                overscan={3}
                onLoadMore={() => fetchNextPage()}
                isLoadingMore={isFetchingNextPage}
                hasMore={!!hasNextPage}
                height="calc(100dvh - 120px)"
                loadingIndicator={
                    <div style={{ display: 'grid', placeItems: 'center', padding: 'var(--size-4)' }}>
                        <Spinner />
                    </div>
                }
                emptyState={
                    <div style={{ display: 'grid', placeItems: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
                        <VolumeX size={48} style={{ opacity: 0.3, marginBottom: 'var(--size-4)' }} />
                        <p>{t('emptyTitle')}</p>
                        <p style={{ fontSize: 'var(--font-size-0)', marginTop: 'var(--size-2)' }}>
                            {t('emptyDesc')}
                        </p>
                    </div>
                }
            />
        </div>
    );
}
