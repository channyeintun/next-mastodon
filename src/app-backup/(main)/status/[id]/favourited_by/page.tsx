'use client';

import { use } from 'react';
import { indexBy, prop } from 'ramda';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart } from 'lucide-react';
import { useStatus, useInfiniteFavouritedBy, useRelationships } from '@/api';
import { AccountCard, AccountCardSkeleton, PageHeaderSkeleton } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { IconButton, Button, EmptyState } from '@/components/atoms';
import { flattenPages } from '@/utils/fp';
import type { Account } from '@/types';

export default function FavouritedByPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();

    const {
        data: status,
        isLoading: statusLoading,
        isError: statusError,
    } = useStatus(id);

    const {
        data: favouritedByPages,
        isLoading: favouritedByLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteFavouritedBy(id);

    const accounts = flattenPages(favouritedByPages?.pages);

    // Batch fetch relationships for all loaded accounts
    const accountIds = accounts.map((a) => a.id);
    const { data: relationships } = useRelationships(accountIds);

    // Create a map for quick relationship lookup by account ID
    const relationshipMap = indexBy(prop('id'), relationships ?? []);

    const isLoading = statusLoading || favouritedByLoading;

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

    if (statusError || !status) {
        return (
            <div style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
                <h2 style={{ color: 'var(--red-6)', marginBottom: 'var(--size-3)' }}>
                    Post Not Found
                </h2>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="full-height-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--size-3)',
                padding: 'var(--size-4)',
                borderBottom: '1px solid var(--surface-3)',
                background: 'var(--surface-1)',
                zIndex: 10,
                flexShrink: 0,
            }}>
                <IconButton onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </IconButton>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                    <Heart size={20} style={{ color: 'var(--red-6)' }} />
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-4)', marginBottom: 'var(--size-1)' }}>
                            Favourited by
                        </h1>
                        <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                            {status.favourites_count} {status.favourites_count === 1 ? 'person' : 'people'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Accounts List */}
            <VirtualizedList<Account>
                items={accounts}
                renderItem={(account) => (
                    <AccountCard
                        account={account}
                        relationship={relationshipMap[account.id]}
                        showFollowButton
                        skipRelationshipFetch
                        style={{ marginBottom: 'var(--size-2)' }}
                    />
                )}
                getItemKey={(account) => account.id}
                estimateSize={72}
                overscan={5}
                onLoadMore={fetchNextPage}
                isLoadingMore={isFetchingNextPage}
                hasMore={hasNextPage}
                loadMoreThreshold={3}
                height="auto"
                style={{ flex: 1, minHeight: 0 }}
                scrollRestorationKey={`favourited-by-${id}`}
                loadingIndicator={<AccountCardSkeleton style={{ marginBottom: 'var(--size-2)' }} />}
                endIndicator="No more users"
                emptyState={
                    <EmptyState title="No favourites yet" />
                }
            />
        </div>
    );
}
