import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { indexBy, prop } from 'ramda';
import { useAccountWithCache, useInfiniteFollowers, useRelationships } from '@/api';
import { AccountCard, AccountCardSkeleton, PageHeaderSkeleton } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { IconButton, EmojiText, Button, EmptyState } from '@/components/atoms';
import { flattenPages } from '@/utils/fp';
import { MainLayout } from '@/components/layouts/MainLayout';
import type { Account } from '@/types';

export default function FollowersPage() {
    const router = useRouter();
    const { acct: acctParam } = router.query;
    const decodedAcct = typeof acctParam === 'string' ? decodeURIComponent(acctParam) : '';
    const acct = decodedAcct.startsWith('@') ? decodedAcct.slice(1) : decodedAcct;

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

    const followers = flattenPages(followerPages?.pages);

    const accountIds = followers.map((a) => a.id);
    const { data: relationships } = useRelationships(accountIds);
    const relationshipMap = indexBy(prop('id'), relationships ?? []);

    if (accountLoading || followersLoading) {
        return (
            <MainLayout>
                <Head><title>Followers - Mastodon</title></Head>
                <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                    <PageHeaderSkeleton />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <AccountCardSkeleton key={i} />
                    ))}
                </div>
            </MainLayout>
        );
    }

    if (accountError || !account) {
        return (
            <MainLayout>
                <Head><title>Profile Not Found - Mastodon</title></Head>
                <div style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
                    <h2 style={{ color: 'var(--red-6)', marginBottom: 'var(--size-3)' }}>
                        Profile Not Found
                    </h2>
                    <Link href="/"><Button>Back to Timeline</Button></Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Head>
                <title>{`Followers - ${account.display_name || account.username} - Mastodon`}</title>
            </Head>
            <div className="full-height-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--size-3)',
                    padding: 'var(--size-4)', borderBottom: '1px solid var(--surface-3)',
                    background: 'var(--surface-1)', zIndex: 10, flexShrink: 0,
                }}>
                    <IconButton onClick={() => router.back()}><ArrowLeft size={20} /></IconButton>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-4)', marginBottom: 'var(--size-1)' }}>Followers</h1>
                        <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                            <EmojiText text={account.display_name || account.username} emojis={account.emojis} />
                        </p>
                    </div>
                </div>
                <VirtualizedList<Account>
                    items={followers}
                    renderItem={(follower) => (
                        <AccountCard account={follower} relationship={relationshipMap[follower.id]} showFollowButton skipRelationshipFetch style={{ marginBottom: 'var(--size-2)' }} />
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
                    endIndicator="No more followers"
                    emptyState={account.followers_count > 0 ? <EmptyState title="This user has chosen to not make this information available" /> : <EmptyState title="No followers yet" />}
                />
            </div>
        </MainLayout>
    );
}
