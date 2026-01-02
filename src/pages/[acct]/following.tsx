import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { indexBy, prop } from 'ramda';
import { useAccountWithCache, useInfiniteFollowing, useRelationships } from '@/api';
import { AccountCard, AccountCardSkeleton, PageHeaderSkeleton } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { IconButton, EmojiText, Button, EmptyState } from '@/components/atoms';
import { flattenPages } from '@/utils/fp';
import { MainLayout } from '@/components/layouts/MainLayout';
import type { Account } from '@/types';

export default function FollowingPage() {
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
        data: followingPages,
        isLoading: followingLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteFollowing(account?.id || '');

    const following = flattenPages(followingPages?.pages);

    const accountIds = following.map((a) => a.id);
    const { data: relationships } = useRelationships(accountIds);
    const relationshipMap = indexBy(prop('id'), relationships ?? []);

    if (accountLoading || followingLoading) {
        return (
            <MainLayout>
                <Head><title>Following - Mastodon</title></Head>
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
                    <h2 style={{ color: 'var(--red-6)', marginBottom: 'var(--size-3)' }}>Profile Not Found</h2>
                    <Link href="/"><Button>Back to Timeline</Button></Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Head>
                <title>{`Following - ${account.display_name || account.username} - Mastodon`}</title>
            </Head>
            <div className="full-height-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--size-3)',
                    padding: 'var(--size-4)', borderBottom: '1px solid var(--surface-3)',
                    background: 'var(--surface-1)', zIndex: 10, flexShrink: 0,
                }}>
                    <IconButton onClick={() => router.back()}><ArrowLeft size={20} /></IconButton>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-4)', marginBottom: 'var(--size-1)' }}>Following</h1>
                        <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                            <EmojiText text={account.display_name || account.username} emojis={account.emojis} />
                        </p>
                    </div>
                </div>
                <VirtualizedList<Account>
                    items={following}
                    renderItem={(followedAccount) => (
                        <AccountCard account={followedAccount} relationship={relationshipMap[followedAccount.id]} showFollowButton skipRelationshipFetch style={{ marginBottom: 'var(--size-2)' }} />
                    )}
                    getItemKey={(followedAccount) => followedAccount.id}
                    estimateSize={72}
                    overscan={5}
                    onLoadMore={fetchNextPage}
                    isLoadingMore={isFetchingNextPage}
                    hasMore={hasNextPage}
                    loadMoreThreshold={3}
                    height="auto"
                    style={{ flex: 1, minHeight: 0 }}
                    scrollRestorationKey={`following-${acct}`}
                    loadingIndicator={<AccountCardSkeleton style={{ marginBottom: 'var(--size-2)' }} />}
                    endIndicator="No more accounts"
                    emptyState={account.following_count > 0 ? <EmptyState title="This user has chosen to not make this information available" /> : <EmptyState title="Not following anyone yet" />}
                />
            </div>
        </MainLayout>
    );
}
