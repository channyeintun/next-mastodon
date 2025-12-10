'use client';

import { useState, Activity, type ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { useInfiniteTrendingStatuses, useInfiniteTrendingTags, useInfiniteTrendingLinks } from '@/api';
import { PostCard, PostCardSkeletonList, PostCardSkeleton, TrendingTagCard, TrendingTagCardSkeleton, TrendingLinkCard, TrendingLinkCardSkeleton } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { Button, Tabs } from '@/components/atoms';
import type { TabItem } from '@/components/atoms/Tabs';
import { Hash, Newspaper, FileText } from 'lucide-react';
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

    // Flatten and deduplicate statuses
    const allStatuses = statusData?.pages.flatMap((page) => page) ?? [];
    const uniqueStatuses = Array.from(
        new Map(allStatuses.map((status) => [status.id, status])).values()
    );

    // Flatten and deduplicate tags
    const allTags = tagsData?.pages.flatMap((page) => page) ?? [];
    const uniqueTags = Array.from(
        new Map(allTags.map((tag) => [tag.name, tag])).values()
    );

    // Flatten and deduplicate links
    const allLinks = linksData?.pages.flatMap((page) => page) ?? [];
    const uniqueLinks = Array.from(
        new Map(allLinks.map((link) => [link.url, link])).values()
    );

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
                        <div style={{ textAlign: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
                            No trending posts at the moment.
                        </div>
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
                        <div style={{ textAlign: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
                            Failed to load trending tags.
                        </div>
                    ) : uniqueTags.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
                            No trending tags at the moment.
                        </div>
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
                        <div style={{ textAlign: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
                            Failed to load trending news.
                        </div>
                    ) : uniqueLinks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
                            No trending news at the moment.
                        </div>
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
