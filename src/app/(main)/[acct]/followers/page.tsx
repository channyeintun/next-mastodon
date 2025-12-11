'use client';

import { use } from 'react';
import { useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLookupAccount, useInfiniteFollowers } from '@/api';
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

    const {
        data: account,
        isLoading: accountLoading,
        isError: accountError,
    } = useLookupAccount(acct);

    const {
        data: followerPages,
        isLoading: followersLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteFollowers(account?.id || '');

    const followers = flattenPages(followerPages?.pages);

    if (accountLoading || followersLoading) {
        return (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
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
                    Profile Not Found
                </h2>
                <Link href="/">
                    <Button>Back to Timeline</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="full-height-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
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
                        Followers
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
                        showFollowButton={true}
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
                loadingIndicator={<AccountCardSkeleton />}
                endIndicator="No more followers"
                emptyState={
                    account.followers_count > 0 ? (
                        <EmptyState title="This user has chosen to not make this information available" />
                    ) : (
                        <EmptyState title="No followers yet" />
                    )
                }
            />
        </div>
    );
}
