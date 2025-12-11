'use client';

import { useState, Activity, type ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { useInfiniteTrendingStatuses, useInfiniteTrendingTags, useInfiniteTrendingLinks } from '@/api';
import { PostCard } from '@/components/organisms';
import { PostCardSkeletonList, PostCardSkeleton, TrendingTagCard, TrendingTagCardSkeleton, TrendingLinkCard, TrendingLinkCardSkeleton } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { Button, Tabs, EmptyState } from '@/components/atoms';
import type { TabItem } from '@/components/atoms/Tabs';
import { Hash, Newspaper, FileText } from 'lucide-react';
import { flattenAndUniqById, flattenAndUniqByKey } from '@/utils/fp';
import type { Status, Tag, TrendingLink } from '@/types';

type TrendingTab = 'posts' | 'tags' | 'links';

const trendingTabs: TabItem<TrendingTab>[] = [
    { value: 'posts', label: 'Posts', icon: <FileText size={18} /> },
    { value: 'tags', label: 'Tags', icon: <Hash size={18} /> },
    { value: 'links', label: 'News', icon: <Newspaper size={18} /> },
];

interface TrendingContentProps {
    header: ReactNode;
    scrollRestorationPrefix?: string;
}

export const TrendingContent = observer(({ header, scrollRestorationPrefix = 'trending' }: TrendingContentProps) => {
    const [activeTab, setActiveTab] = useState<TrendingTab>('posts');

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

    return (
        <div className="full-height-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Header */}
            {header}

            {/* Tab Navigation */}
            <Tabs
                tabs={trendingTabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                variant="underline"
                style={{ padding: '0 var(--size-4)' }}
            />

            {/* Tab Content - using Activity for toggling */}
            <Activity mode={activeTab === 'posts' ? 'visible' : 'hidden'}>
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {statusesLoading ? (
                        <div className="virtualized-list-container" style={{ flex: 1, overflow: 'auto' }}>
                            <PostCardSkeletonList count={5} />
                        </div>
                    ) : statusesError ? (
                        <div style={{ textAlign: 'center', padding: 'var(--size-8)' }}>
                            <p style={{ color: 'var(--red-6)', marginBottom: 'var(--size-3)' }}>
                                {statusesErrorMsg instanceof Error ? statusesErrorMsg.message : 'Failed to load posts'}
                            </p>
                            <Button onClick={() => window.location.reload()}>Retry</Button>
                        </div>
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
                            scrollRestorationKey={`${scrollRestorationPrefix}-posts`}
                            loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
                            endIndicator="You've reached the end of trending posts"
                        />
                    )}
                </div>
            </Activity>

            <Activity mode={activeTab === 'tags' ? 'visible' : 'hidden'}>
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%', padding: '0 var(--size-4)' }}>
                    {tagsLoading ? (
                        <div className="virtualized-list-container" style={{ flex: 1, overflow: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <TrendingTagCardSkeleton key={i} />
                                ))}
                            </div>
                        </div>
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
                            scrollRestorationKey={`${scrollRestorationPrefix}-tags`}
                            loadingIndicator={<TrendingTagCardSkeleton style={{ marginBottom: 'var(--size-2)' }} />}
                            endIndicator="You've reached the end of trending tags"
                        />
                    )}
                </div>
            </Activity>

            <Activity mode={activeTab === 'links' ? 'visible' : 'hidden'}>
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%', padding: '0 var(--size-4)' }}>
                    {linksLoading ? (
                        <div className="virtualized-list-container" style={{ flex: 1, overflow: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <TrendingLinkCardSkeleton key={i} />
                                ))}
                            </div>
                        </div>
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
                            scrollRestorationKey={`${scrollRestorationPrefix}-links`}
                            loadingIndicator={<TrendingLinkCardSkeleton style={{ marginBottom: 'var(--size-2)' }} />}
                            endIndicator="You've reached the end of trending news"
                        />
                    )}
                </div>
            </Activity>
        </div>
    );
});
