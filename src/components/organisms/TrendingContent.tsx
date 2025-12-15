'use client';

import styled from '@emotion/styled';
import Link from 'next/link';
import { useState, Activity, type ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { useInfiniteTrendingStatuses, useInfiniteTrendingTags, useInfiniteTrendingLinks } from '@/api';
import { PostCard } from '@/components/organisms';
import { PostCardSkeletonList, PostCardSkeleton, TrendingTagCard, TrendingTagCardSkeleton, TrendingLinkCard, TrendingLinkCardSkeleton } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { Tabs, EmptyState, Button } from '@/components/atoms';
import type { TabItem } from '@/components/atoms/Tabs';
import { Hash, Newspaper, FileText, LogIn } from 'lucide-react';
import { flattenAndUniqById, flattenAndUniqByKey } from '@/utils/fp';
import type { Status, Tag, TrendingLink } from '@/types';
import { useAuthStore } from '@/hooks/useStores';

type TrendingTab = 'posts' | 'tags' | 'links';

const trendingTabs: TabItem<TrendingTab>[] = [
    { value: 'posts', label: 'Posts', icon: <FileText size={18} /> },
    { value: 'tags', label: 'Tags', icon: <Hash size={18} /> },
    { value: 'links', label: 'News', icon: <Newspaper size={18} /> },
];

interface TrendingContentProps {
    header?: ReactNode;
    scrollRestorationPrefix?: string;
}

export const TrendingContent = observer(({ header, scrollRestorationPrefix = 'trending' }: TrendingContentProps) => {
    const [activeTab, setActiveTab] = useState<TrendingTab>('posts');
    const authStore = useAuthStore();

    // Fetch data for all tabs
    const {
        data: statusData,
        isLoading: statusesLoading,
        isError: statusesError,
        error: statusesErrorMsg,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteTrendingStatuses();

    const {
        data: tagsData,
        isLoading: tagsLoading,
        isError: tagsError,
        fetchNextPage: fetchNextTags,
        hasNextPage: hasMoreTags,
        isFetchingNextPage: isFetchingNextTags,
    } = useInfiniteTrendingTags();

    const {
        data: linksData,
        isLoading: linksLoading,
        isError: linksError,
        fetchNextPage: fetchNextLinks,
        hasNextPage: hasMoreLinks,
        isFetchingNextPage: isFetchingNextLinks,
    } = useInfiniteTrendingLinks();

    // Flatten and deduplicate using FP utilities
    const uniqueStatuses = flattenAndUniqById(statusData?.pages);
    const uniqueTags = flattenAndUniqByKey<Tag>('name')(tagsData?.pages);
    const uniqueLinks = flattenAndUniqByKey<TrendingLink>('url')(linksData?.pages);

    const containerClasses = `full-height-container${authStore.isAuthenticated ? '' : ' guest'}`;

    return (
        <Container className={containerClasses}>
            {/* Header */}
            {header && header}

            {/* Tab Navigation */}
            <StyledTabs
                tabs={trendingTabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                variant="underline"
            />

            {/* Tab Content - using Activity for toggling */}
            <Activity mode={activeTab === 'posts' ? 'visible' : 'hidden'}>
                <TabContent>
                    {statusesLoading ? (
                        <ListContainer className="virtualized-list-container">
                            <PostCardSkeletonList count={5} />
                        </ListContainer>
                    ) : statusesError ? (
                        <ErrorContainer>
                            <ErrorText>
                                {statusesErrorMsg instanceof Error ? statusesErrorMsg.message : 'Failed to load posts'}
                            </ErrorText>
                            <Button onClick={() => window.location.reload()}>Retry</Button>
                        </ErrorContainer>
                    ) : uniqueStatuses.length === 0 ? (
                        <EmptyState title="No trending posts at the moment" />
                    ) : (
                        <VirtualizedList<Status>
                            items={uniqueStatuses}
                            renderItem={(status) => (
                                <PostCard status={status} style={{ marginBottom: 'var(--size-3)' }} />
                            )}
                            getItemKey={(status) => status.id}
                            estimateSize={300}
                            overscan={5}
                            onLoadMore={fetchNextPage}
                            isLoadingMore={isFetchingNextPage}
                            hasMore={hasNextPage}
                            loadMoreThreshold={1}
                            height="100%"
                            style={{ height: '100%' }}
                            className={authStore.isAuthenticated ? undefined : 'guest-list'}
                            scrollRestorationKey={`${scrollRestorationPrefix}-posts`}
                            loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
                            endIndicator="You've reached the end of trending posts"
                        />
                    )}
                </TabContent>
            </Activity>

            <Activity mode={activeTab === 'tags' ? 'visible' : 'hidden'}>
                <TabContentWithPadding>
                    {tagsLoading ? (
                        <ListContainer className="virtualized-list-container">
                            <SkeletonList>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <TrendingTagCardSkeleton key={i} />
                                ))}
                            </SkeletonList>
                        </ListContainer>
                    ) : tagsError ? (
                        <EmptyState title="Failed to load trending tags" />
                    ) : uniqueTags.length === 0 ? (
                        <EmptyState title="No trending tags at the moment" />
                    ) : (
                        <VirtualizedList<Tag>
                            items={uniqueTags}
                            renderItem={(tag) => (
                                <TrendingTagCard tag={tag} style={{ marginBottom: 'var(--size-2)' }} />
                            )}
                            getItemKey={(tag) => tag.name}
                            estimateSize={80}
                            overscan={5}
                            onLoadMore={fetchNextTags}
                            isLoadingMore={isFetchingNextTags}
                            hasMore={hasMoreTags}
                            loadMoreThreshold={1}
                            height="100%"
                            style={{ height: '100%' }}
                            className={authStore.isAuthenticated ? undefined : 'guest-list'}
                            scrollRestorationKey={`${scrollRestorationPrefix}-tags`}
                            loadingIndicator={<TrendingTagCardSkeleton style={{ marginBottom: 'var(--size-2)' }} />}
                            endIndicator="You've reached the end of trending tags"
                        />
                    )}
                </TabContentWithPadding>
            </Activity>

            <Activity mode={activeTab === 'links' ? 'visible' : 'hidden'}>
                <TabContentWithPadding>
                    {linksLoading ? (
                        <ListContainer className="virtualized-list-container">
                            <SkeletonList>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <TrendingLinkCardSkeleton key={i} />
                                ))}
                            </SkeletonList>
                        </ListContainer>
                    ) : linksError ? (
                        <EmptyState title="Failed to load trending news" />
                    ) : uniqueLinks.length === 0 ? (
                        <EmptyState title="No trending news at the moment" />
                    ) : (
                        <VirtualizedList<TrendingLink>
                            items={uniqueLinks}
                            renderItem={(link) => (
                                <TrendingLinkCard link={link} style={{ marginBottom: 'var(--size-2)' }} />
                            )}
                            getItemKey={(link) => link.url}
                            estimateSize={120}
                            overscan={5}
                            onLoadMore={fetchNextLinks}
                            isLoadingMore={isFetchingNextLinks}
                            hasMore={hasMoreLinks}
                            loadMoreThreshold={1}
                            height="100%"
                            style={{ height: '100%' }}
                            className={authStore.isAuthenticated ? undefined : 'guest-list'}
                            scrollRestorationKey={`${scrollRestorationPrefix}-links`}
                            loadingIndicator={<TrendingLinkCardSkeleton style={{ marginBottom: 'var(--size-2)' }} />}
                            endIndicator="You've reached the end of trending news"
                        />
                    )}
                </TabContentWithPadding>
            </Activity>

            {/* Floating Login Button for guests */}
            {!authStore.isAuthenticated && (
                <FloatingLoginButton href="/auth/signin">
                    <LogIn size={24} />
                </FloatingLoginButton>
            )}
        </Container>
    );
});


// Styled components
const Container = styled.div`
    max-width: 600px;
    margin: 0 auto;
    position: relative;
`;

const FloatingLoginButton = styled(Link)`
    position: fixed;
    bottom: var(--size-5);
    right: var(--size-4);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--blue-6);
    color: white;
    box-shadow: var(--shadow-4);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        transform: scale(1.05);
        box-shadow: var(--shadow-5);
    }

    &:active {
        transform: scale(0.95);
    }

    /* Hide on desktop - sidebar has sign-in button */
    @media (min-width: 768px) {
        display: none;
    }
`;

const TabContent = styled.div`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const TabContentWithPadding = styled(TabContent)`
    padding: 0 var(--size-4);
`;

const ListContainer = styled.div`
    flex: 1;
    overflow: auto;
`;

const SkeletonList = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--size-2);
`;

const ErrorContainer = styled.div`
    text-align: center;
    padding: var(--size-8);
`;

const ErrorText = styled.p`
    color: var(--red-6);
    margin-bottom: var(--size-3);
`;



const StyledTabs = styled(Tabs)`
    padding: 0 var(--size-4);
` as typeof Tabs;