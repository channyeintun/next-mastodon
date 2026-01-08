'use client';

import { use } from 'react';
import { indexBy, prop } from 'ramda';
import { useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAccountWithCache, useInfiniteFollowers, useRelationships, useCurrentAccount } from '@/api';
import { AccountCard, AccountCardSkeleton, PageHeaderSkeleton } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { IconButton, EmojiText, Button, EmptyState } from '@/components/atoms';
import { flattenPages } from '@/utils/fp';
import type { Account } from '@/types';

export default function FollowersPage({
    params,
}: {
    params: Promise<{ acct: string }>;
}) {
    const { acct: acctParam } = use(params);
    const decodedAcct = decodeURIComponent(acctParam);
    const router = useRouter();

    if (!decodedAcct.startsWith('@')) {
        notFound();
    }

    const acct = decodedAcct.slice(1);
    const t = useTranslations('account');

    const {
        data: account,
        isLoading: accountLoading,
        isError: accountError,
    } = useAccountWithCache(acct);

    const {
        data: followerPages,
        isLoading: followersLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteFollowers(account?.id || '');
    const { data: currentAccount } = useCurrentAccount();

    const isOwnFollowers = currentAccount?.id === account?.id;
    const followers = flattenPages(followerPages?.pages);

    // Batch fetch relationships for all loaded accounts
    const accountIds = followers.map((a) => a.id);
    const { data: relationships } = useRelationships(accountIds);

    // Create a map for quick relationship lookup by account ID
    const relationshipMap = indexBy(prop('id'), relationships ?? []);

    if (accountLoading || followersLoading) {
        return (
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                <PageHeaderSkeleton />
                {Array.from({ length: 5 }).map((_, i) => (
                    <AccountCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (accountError || !account) {
        return (
            <div style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
                <h2 style={{ color: 'var(--red-6)', marginBottom: 'var(--size-3)' }}>
                    {t('notFound')}
                </h2>
                <Link href="/">
                    <Button>{t('backToTimeline')}</Button>
                </Link>
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
                <div>
                    <h1 style={{ fontSize: 'var(--font-size-4)', marginBottom: 'var(--size-1)' }}>
                        {t('followersPage.title')}
                    </h1>
                    <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                        <EmojiText text={account.display_name || account.username} emojis={account.emojis} />
                    </p>
                </div>
            </div>

            {/* Followers List with VirtualizedList */}
            <VirtualizedList<Account>
                items={followers}
                renderItem={(follower) => (
                    <AccountCard
                        account={follower}
                        relationship={relationshipMap[follower.id]}
                        showFollowButton
                        showRemoveFromFollowers={isOwnFollowers}
                        skipRelationshipFetch
                        style={{ marginBottom: 'var(--size-2)' }}
                    />
                )}
                getItemKey={(follower) => follower.id}
                estimateSize={72}
                overscan={5}
                onLoadMore={fetchNextPage}
                isLoadingMore={isFetchingNextPage}
                hasMore={hasNextPage}
                loadMoreThreshold={3}
                height="auto"
                style={{ flex: 1, minHeight: 0 }}
                scrollRestorationKey={`followers-${acct}`}
                loadingIndicator={<AccountCardSkeleton style={{ marginBottom: 'var(--size-2)' }} />}
                endIndicator={t('followersPage.noMoreFollowers')}
                emptyState={
                    account.followers_count > 0 ? (
                        <EmptyState title={t('followersPage.hiddenInfo')} />
                    ) : (
                        <EmptyState title={t('followersPage.noFollowersYet')} />
                    )
                }
            />
        </div>
    );
}
