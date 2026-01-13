'use client';

import styled from '@emotion/styled';
import { Activity } from 'react';
import { Hash } from 'lucide-react';
import { PostCard } from '@/components/organisms';
import { PostCardSkeleton, TrendingTagCardSkeleton, UserCard, UserCardSkeleton } from '@/components/molecules';
import { Spinner, Card, EmptyState } from '@/components/atoms';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { useTimelineHotkeys } from '@/hooks/useTimelineHotkeys';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
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
    <LoadingContainer>
        <Spinner />
        <LoadingText>Searching...</LoadingText>
    </LoadingContainer>
);

const ErrorState = () => (
    <ErrorContainer>
        <p>An error occurred while searching</p>
    </ErrorContainer>
);

const HashtagCard = ({ tag, isFocused }: { tag: Tag; isFocused?: boolean }) => (
    <HashtagCardWrapper className={isFocused ? 'is-focused' : ''}>
        <Card
            style={{
                outline: isFocused ? '2px solid var(--blue-6)' : 'none',
                outlineOffset: '-2px',
                transition: 'outline 0.2s ease',
            }}
        >
            <HashtagContent>
                <HashtagIcon>
                    <HashIcon size={20} />
                </HashtagIcon>
                <HashtagInfo>
                    <HashtagName>#{tag.name}</HashtagName>
                    {tag.history && tag.history.length > 0 && (
                        <HashtagStats>{tag.history[0].uses} posts</HashtagStats>
                    )}
                </HashtagInfo>
            </HashtagContent>
        </Card>
    </HashtagCardWrapper>
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
    const router = useRouter();

    // Flatten all results for the 'all' tab into a single navigable list
    const allItems = useMemo(() => {
        if (!allResults) return [];
        return [
            ...allResults.accounts.map(a => ({ type: 'account' as const, data: a })),
            ...allResults.statuses.map(s => ({ type: 'status' as const, data: s })),
            ...allResults.hashtags.map(h => ({ type: 'hashtag' as const, data: h })),
        ];
    }, [allResults]);

    const handleOpenItem = (item: { type: 'status' | 'account' | 'hashtag'; data: any }) => {
        if (item.type === 'status') {
            router.push(`/status/${item.data.id}`);
        } else if (item.type === 'account') {
            router.push(`/@${item.data.acct}`);
        } else if (item.type === 'hashtag') {
            router.push(`/tags/${item.data.name}`);
        }
    };

    const { focusedIndex } = useTimelineHotkeys({
        itemsCount: allItems.length,
        onOpen: (index) => handleOpenItem(allItems[index]),
        autoScroll: true,
        enabled: activeTab === 'all' && allItems.length > 0,
    });

    return (
        <>
            {/* All Tab */}
            <Activity mode={activeTab === 'all' ? 'visible' : 'hidden'}>
                <AllTabContainer>
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
                                <ResultSection>
                                    <SectionTitle>
                                        Accounts ({allResults.accounts.length})
                                    </SectionTitle>
                                    <ResultList>
                                        {allResults.accounts.map((account, index) => (
                                            <div key={account.id} data-index={index}>
                                                <UserCard
                                                    account={account}
                                                    isFocused={focusedIndex === index}
                                                />
                                            </div>
                                        ))}
                                    </ResultList>
                                </ResultSection>
                            )}

                            {allResults.statuses.length > 0 && (
                                <ResultSection>
                                    <SectionTitle>
                                        Posts ({allResults.statuses.length})
                                    </SectionTitle>
                                    <ResultList>
                                        {allResults.statuses.map((status, index) => {
                                            const globalIndex = allResults.accounts.length + index;
                                            return (
                                                <div key={status.id} data-index={globalIndex}>
                                                    <PostCard
                                                        status={status}
                                                        isFocused={focusedIndex === globalIndex}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </ResultList>
                                </ResultSection>
                            )}

                            {allResults.hashtags.length > 0 && (
                                <ResultSection>
                                    <SectionTitle>
                                        Hashtags ({allResults.hashtags.length})
                                    </SectionTitle>
                                    <ResultList>
                                        {allResults.hashtags.map((tag, index) => {
                                            const globalIndex = allResults.accounts.length + allResults.statuses.length + index;
                                            return (
                                                <div key={tag.name} data-index={globalIndex}>
                                                    <HashtagCard
                                                        tag={tag}
                                                        isFocused={focusedIndex === globalIndex}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </ResultList>
                                </ResultSection>
                            )}
                        </>
                    )}
                </AllTabContainer>
            </Activity>

            {/* Accounts Tab */}
            <Activity mode={activeTab === 'accounts' ? 'visible' : 'hidden'}>
                <TabContainer>
                    {isLoadingAccounts ? (
                        <LoadingState />
                    ) : isErrorAccounts ? (
                        <ErrorState />
                    ) : accounts.length === 0 ? (
                        <EmptyState title={`No accounts found for "${query}"`} />
                    ) : (
                        <VirtualizedList<Account>
                            items={accounts}
                            renderItem={(account, _, isFocused) => (
                                <UserCard account={account} isFocused={isFocused} style={{ marginBottom: 'var(--size-3)' }} />
                            )}
                            onItemOpen={(account) => router.push(`/@${account.acct}`)}
                            getItemKey={(account) => account.id}
                            estimateSize={80}
                            style={{ height: '100%' }}
                            scrollRestorationKey={`search-accounts-${query}`}
                            onLoadMore={fetchNextAccounts}
                            hasMore={hasNextAccounts}
                            isLoadingMore={isFetchingNextAccounts}
                            loadingIndicator={<UserCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
                            enabled={activeTab === 'accounts'}
                        />
                    )}
                </TabContainer>
            </Activity>

            {/* Statuses Tab */}
            <Activity mode={activeTab === 'statuses' ? 'visible' : 'hidden'}>
                <TabContainer>
                    {isLoadingStatuses ? (
                        <LoadingState />
                    ) : isErrorStatuses ? (
                        <ErrorState />
                    ) : statuses.length === 0 ? (
                        <EmptyState title={`No posts found for "${query}"`} />
                    ) : (
                        <VirtualizedList<Status>
                            items={statuses}
                            renderItem={(status, _, isFocused) => (
                                <PostCard status={status} isFocused={isFocused} style={{ marginBottom: 'var(--size-3)' }} />
                            )}
                            onItemOpen={(status) => router.push(`/status/${status.id}`)}
                            getItemKey={(status) => status.id}
                            getMediaUrls={(status) => status.media_attachments?.map(a => a.preview_url || a.url).filter(Boolean) as string[] || []}
                            estimateSize={250}
                            style={{ height: '100%' }}
                            scrollRestorationKey={`search-statuses-${query}`}
                            onLoadMore={fetchNextStatuses}
                            hasMore={hasNextStatuses}
                            isLoadingMore={isFetchingNextStatuses}
                            loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
                            enabled={activeTab === 'statuses'}
                        />
                    )}
                </TabContainer>
            </Activity>

            {/* Hashtags Tab */}
            <Activity mode={activeTab === 'hashtags' ? 'visible' : 'hidden'}>
                <TabContainer>
                    {isLoadingHashtags ? (
                        <LoadingState />
                    ) : isErrorHashtags ? (
                        <ErrorState />
                    ) : hashtags.length === 0 ? (
                        <EmptyState title={`No hashtags found for "${query}"`} />
                    ) : (
                        <VirtualizedList<Tag>
                            items={hashtags}
                            renderItem={(tag, _, isFocused) => <HashtagCard tag={tag} isFocused={isFocused} />}
                            onItemOpen={(tag) => router.push(`/tags/${tag.name}`)}
                            getItemKey={(tag) => tag.name}
                            estimateSize={80}
                            style={{ height: '100%' }}
                            scrollRestorationKey={`search-hashtags-${query}`}
                            onLoadMore={fetchNextHashtags}
                            hasMore={hasNextHashtags}
                            isLoadingMore={isFetchingNextHashtags}
                            loadingIndicator={<TrendingTagCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
                            enabled={activeTab === 'hashtags'}
                        />
                    )}
                </TabContainer>
            </Activity>
        </>
    );
}

// Styled components
const LoadingContainer = styled.div`
    display: grid;
    place-items: center;
    margin-top: var(--size-8);
`;

const LoadingText = styled.p`
    margin-top: var(--size-4);
    color: var(--text-2);
`;

const ErrorContainer = styled.div`
    text-align: center;
    margin-top: var(--size-8);
    color: var(--red-6);
`;

const AllTabContainer = styled.div`
    height: 100%;
    overflow-y: auto;
    padding: 0 var(--size-2);
`;

const TabContainer = styled.div`
    height: 100%;
`;

const ResultSection = styled.div`
    margin-bottom: var(--size-6);
`;

const SectionTitle = styled.h2`
    font-size: var(--font-size-fluid-1);
    font-weight: var(--font-weight-6);
    margin-bottom: var(--size-4);
    color: var(--text-1);
`;

const ResultList = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--size-3);
`;

const HashtagCardWrapper = styled.div`
    margin-bottom: var(--size-3);
`;

const HashtagContent = styled.div`
    display: flex;
    align-items: center;
    gap: var(--size-3);
    padding: var(--size-2);
`;

const HashtagIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--size-9);
    height: var(--size-9);
    border-radius: 50%;
    background: var(--surface-3);
`;

const HashIcon = styled(Hash)`
    color: var(--text-2);
`;

const HashtagInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const HashtagName = styled.div`
    font-size: var(--font-size-2);
    font-weight: var(--font-weight-6);
    color: var(--text-1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const HashtagStats = styled.div`
    font-size: var(--font-size-0);
    color: var(--text-2);
    margin-top: var(--size-1);
`;



