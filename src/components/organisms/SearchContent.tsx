'use client';

import { Activity } from 'react';
import { Hash } from 'lucide-react';
import { PostCard } from '@/components/organisms';
import { PostCardSkeleton, TrendingTagCardSkeleton, UserCard, UserCardSkeleton } from '@/components/molecules';
import { Spinner, Card, EmptyState } from '@/components/atoms';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import type { Account, Status, Tag, SearchResults } from '@/types';

type TabType = 'all' | 'accounts' | 'statuses' | 'hashtags';

interface SearchContentProps {
    /** Current active tab */
    activeTab: TabType;
    /** Search query for display */
    query: string;
    /** All search results (for 'all' tab) */
    allResults?: SearchResults;
    isLoadingAll: boolean;
    isErrorAll: boolean;
    /** Accounts data and pagination */
    accounts: Account[];
    isLoadingAccounts: boolean;
    isErrorAccounts: boolean;
    fetchNextAccounts: () => void;
    hasNextAccounts: boolean;
    isFetchingNextAccounts: boolean;
    /** Statuses data and pagination */
    statuses: Status[];
    isLoadingStatuses: boolean;
    isErrorStatuses: boolean;
    fetchNextStatuses: () => void;
    hasNextStatuses: boolean;
    isFetchingNextStatuses: boolean;
    /** Hashtags data and pagination */
    hashtags: Tag[];
    isLoadingHashtags: boolean;
    isErrorHashtags: boolean;
    fetchNextHashtags: () => void;
    hasNextHashtags: boolean;
    isFetchingNextHashtags: boolean;
}

const LoadingState = () => (
    <div style={{ display: 'grid', placeItems: 'center', marginTop: 'var(--size-8)' }}>
        <Spinner />
        <p style={{ marginTop: 'var(--size-4)', color: 'var(--text-2)' }}>Searching...</p>
    </div>
);

const ErrorState = () => (
    <div style={{ textAlign: 'center', marginTop: 'var(--size-8)', color: 'var(--red-6)' }}>
        <p>An error occurred while searching</p>
    </div>
);

const HashtagCard = ({ tag }: { tag: Tag }) => (
    <div style={{ marginBottom: 'var(--size-3)' }}>
        <Card hoverable>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--size-3)',
                padding: 'var(--size-2)',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 'var(--size-9)',
                    height: 'var(--size-9)',
                    borderRadius: '50%',
                    background: 'var(--surface-3)',
                }}>
                    <Hash size={20} style={{ color: 'var(--text-2)' }} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: 'var(--font-size-2)',
                        fontWeight: 'var(--font-weight-6)',
                        color: 'var(--text-1)',
                    }}>
                        #{tag.name}
                    </div>
                    {tag.history && tag.history.length > 0 && (
                        <div style={{
                            fontSize: 'var(--font-size-0)',
                            color: 'var(--text-2)',
                            marginTop: 'var(--size-1)',
                        }}>
                            {tag.history[0].uses} posts
                        </div>
                    )}
                </div>
            </div>
        </Card>
    </div>
);

/**
 * SearchContent - Search results content with tabs
 */
export function SearchContent({
    activeTab,
    query,
    allResults,
    isLoadingAll,
    isErrorAll,
    accounts,
    isLoadingAccounts,
    isErrorAccounts,
    fetchNextAccounts,
    hasNextAccounts,
    isFetchingNextAccounts,
    statuses,
    isLoadingStatuses,
    isErrorStatuses,
    fetchNextStatuses,
    hasNextStatuses,
    isFetchingNextStatuses,
    hashtags,
    isLoadingHashtags,
    isErrorHashtags,
    fetchNextHashtags,
    hasNextHashtags,
    isFetchingNextHashtags,
}: SearchContentProps) {
    return (
        <>
            {/* All Tab */}
            <Activity mode={activeTab === 'all' ? 'visible' : 'hidden'}>
                <div style={{ height: '100%', overflowY: 'auto', padding: '0 var(--size-2)' }}>
                    {isLoadingAll ? (
                        <LoadingState />
                    ) : isErrorAll ? (
                        <ErrorState />
                    ) : allResults && (
                        <>
                            {allResults.accounts.length === 0 && allResults.statuses.length === 0 && allResults.hashtags.length === 0 && (
                                <EmptyState title={`No results found for "${query}"`} />
                            )}

                            {allResults.accounts.length > 0 && (
                                <div style={{ marginBottom: 'var(--size-6)' }}>
                                    <h2 style={{ fontSize: 'var(--font-size-3)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-4)', color: 'var(--text-1)' }}>
                                        Accounts ({allResults.accounts.length})
                                    </h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-3)' }}>
                                        {allResults.accounts.map((account) => (
                                            <UserCard key={account.id} account={account} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {allResults.statuses.length > 0 && (
                                <div style={{ marginBottom: 'var(--size-6)' }}>
                                    <h2 style={{ fontSize: 'var(--font-size-3)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-4)', color: 'var(--text-1)' }}>
                                        Posts ({allResults.statuses.length})
                                    </h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-3)' }}>
                                        {allResults.statuses.map((status) => (
                                            <PostCard key={status.id} status={status} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {allResults.hashtags.length > 0 && (
                                <div style={{ marginBottom: 'var(--size-6)' }}>
                                    <h2 style={{ fontSize: 'var(--font-size-3)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-4)', color: 'var(--text-1)' }}>
                                        Hashtags ({allResults.hashtags.length})
                                    </h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-3)' }}>
                                        {allResults.hashtags.map((tag) => (
                                            <HashtagCard key={tag.name} tag={tag} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Activity>

            {/* Accounts Tab */}
            <Activity mode={activeTab === 'accounts' ? 'visible' : 'hidden'}>
                <div style={{ height: '100%' }}>
                    {isLoadingAccounts ? (
                        <LoadingState />
                    ) : isErrorAccounts ? (
                        <ErrorState />
                    ) : accounts.length === 0 ? (
                        <EmptyState title={`No accounts found for "${query}"`} />
                    ) : (
                        <VirtualizedList<Account>
                            items={accounts}
                            renderItem={(account) => (
                                <div style={{ marginBottom: 'var(--size-3)' }}>
                                    <UserCard account={account} />
                                </div>
                            )}
                            getItemKey={(account) => account.id}
                            estimateSize={80}
                            style={{ height: '100%' }}
                            scrollRestorationKey={`search-accounts-${query}`}
                            onLoadMore={fetchNextAccounts}
                            hasMore={hasNextAccounts}
                            isLoadingMore={isFetchingNextAccounts}
                            loadingIndicator={<UserCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
                        />
                    )}
                </div>
            </Activity>

            {/* Statuses Tab */}
            <Activity mode={activeTab === 'statuses' ? 'visible' : 'hidden'}>
                <div style={{ height: '100%' }}>
                    {isLoadingStatuses ? (
                        <LoadingState />
                    ) : isErrorStatuses ? (
                        <ErrorState />
                    ) : statuses.length === 0 ? (
                        <EmptyState title={`No posts found for "${query}"`} />
                    ) : (
                        <VirtualizedList<Status>
                            items={statuses}
                            renderItem={(status) => (
                                <div style={{ marginBottom: 'var(--size-3)' }}>
                                    <PostCard status={status} />
                                </div>
                            )}
                            getItemKey={(status) => status.id}
                            estimateSize={200}
                            style={{ height: '100%' }}
                            scrollRestorationKey={`search-statuses-${query}`}
                            onLoadMore={fetchNextStatuses}
                            hasMore={hasNextStatuses}
                            isLoadingMore={isFetchingNextStatuses}
                            loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
                        />
                    )}
                </div>
            </Activity>

            {/* Hashtags Tab */}
            <Activity mode={activeTab === 'hashtags' ? 'visible' : 'hidden'}>
                <div style={{ height: '100%' }}>
                    {isLoadingHashtags ? (
                        <LoadingState />
                    ) : isErrorHashtags ? (
                        <ErrorState />
                    ) : hashtags.length === 0 ? (
                        <EmptyState title={`No hashtags found for "${query}"`} />
                    ) : (
                        <VirtualizedList<Tag>
                            items={hashtags}
                            renderItem={(tag) => <HashtagCard tag={tag} />}
                            getItemKey={(tag) => tag.name}
                            estimateSize={80}
                            style={{ height: '100%' }}
                            scrollRestorationKey={`search-hashtags-${query}`}
                            onLoadMore={fetchNextHashtags}
                            hasMore={hasNextHashtags}
                            isLoadingMore={isFetchingNextHashtags}
                            loadingIndicator={<TrendingTagCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
                        />
                    )}
                </div>
            </Activity>
        </>
    );
}
