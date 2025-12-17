'use client';

import styled from '@emotion/styled';
import { Activity } from 'react';
import { useMemo, useRef, useState, useEffect, useLayoutEffect } from 'react';
import { Pin } from 'lucide-react';
import { useWindowVirtualizer, type VirtualItem } from '@tanstack/react-virtual';
import { PostCard } from '@/components/organisms';
import { PostCardSkeleton, PostCardSkeletonList, MediaGrid, MediaGridSkeleton } from '@/components/molecules';
import { Tabs, EmptyState } from '@/components/atoms';
import { ScrollToTopButton } from '@/components/atoms/ScrollToTopButton';
import type { TabItem } from '@/components/atoms/Tabs';
import type { Status } from '@/types';

type ProfileTab = 'posts' | 'posts_replies' | 'media';

const profileTabs: TabItem<ProfileTab>[] = [
    { value: 'posts', label: 'Posts' },
    { value: 'posts_replies', label: 'Posts & replies' },
    { value: 'media', label: 'Media' },
];

/** Extended Status type with pinned flag */
interface StatusItem {
    status: Status;
    isPinned: boolean;
}

// Scroll restoration cache
interface ScrollState {
    offset: number;
    measurementsCache: VirtualItem[];
}
const scrollStateCache = new Map<string, ScrollState>();

interface ProfileContentProps {
    /** Account handle for scroll restoration */
    acct: string;
    /** Currently active tab */
    activeTab: ProfileTab;
    /** Tab change handler */
    onTabChange: (tab: ProfileTab) => void;
    /** Pinned statuses */
    pinnedStatuses?: Status[];
    /** Account statuses */
    statuses: Status[];
    /** Loading state */
    isLoading: boolean;
    /** Fetch next page */
    fetchNextPage: () => void;
    /** Has more pages */
    hasNextPage: boolean;
    /** Is fetching next page */
    isFetchingNextPage: boolean;
}

/**
 * ProfileContent - Displays user's posts with tabs and infinite scroll
 */
export function ProfileContent({
    acct,
    activeTab,
    onTabChange,
    pinnedStatuses,
    statuses,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
}: ProfileContentProps) {
    const listRef = useRef<HTMLDivElement>(null);
    const [scrollMargin, setScrollMargin] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Generate cache key based on acct only (both tabs share same data)
    const scrollCacheKey = `profile-${acct}`;

    // Get cached state on initial render
    const [cachedState] = useState(() => scrollStateCache.get(scrollCacheKey));

    // Measure scroll margin from list element's position
    useLayoutEffect(() => {
        if (listRef.current) {
            setScrollMargin(listRef.current.offsetTop);
        }
    }, []);

    // Combine pinned and regular statuses for virtualization
    const combinedItems = useMemo<StatusItem[]>(() => {
        const pinned: StatusItem[] = (pinnedStatuses || []).map(status => ({
            status,
            isPinned: true,
        }));
        const regular: StatusItem[] = statuses.map(status => ({
            status,
            isPinned: false,
        }));
        return [...pinned, ...regular];
    }, [pinnedStatuses, statuses]);

    const virtualizer = useWindowVirtualizer({
        count: combinedItems.length,
        estimateSize: () => 300,
        overscan: 5,
        scrollMargin,
        initialOffset: cachedState?.offset,
        initialMeasurementsCache: cachedState?.measurementsCache,
    });

    const virtualItems = virtualizer.getVirtualItems();

    // Load more when reaching the end
    useEffect(() => {
        if (!virtualItems.length) return;

        const lastItem = virtualItems[virtualItems.length - 1];
        if (!lastItem) return;

        if (
            lastItem.index >= combinedItems.length - 5 &&
            hasNextPage &&
            !isFetchingNextPage
        ) {
            fetchNextPage();
        }
    }, [virtualItems, combinedItems.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Cache scroll state on unmount
    useEffect(() => {
        return () => {
            scrollStateCache.set(scrollCacheKey, {
                offset: virtualizer.scrollOffset ?? 0,
                measurementsCache: virtualizer.measurementsCache,
            });
        };
    }, [virtualizer, scrollCacheKey]);

    // Track scroll position for scroll-to-top button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Render loading state
    const renderLoading = () => (
        <LoadingContainer>
            <PostCardSkeletonList count={5} />
        </LoadingContainer>
    );

    // Render empty state
    const renderEmpty = () => <EmptyState title="No posts yet" />;

    // Render virtualized list content
    const renderVirtualizedList = () => (
        <div ref={listRef}>
            <VirtualContent style={{ height: `${virtualizer.getTotalSize()}px` }}>
                {virtualItems.map((virtualRow) => {
                    const item = combinedItems[virtualRow.index];
                    if (!item) return null;

                    const isFirstPinned = item.isPinned && (virtualRow.index === 0 || !combinedItems[virtualRow.index - 1]?.isPinned);
                    const isLastPinned = item.isPinned && (virtualRow.index === combinedItems.length - 1 || !combinedItems[virtualRow.index + 1]?.isPinned);

                    return (
                        <VirtualItemWrapper
                            key={`${item.isPinned ? 'pinned-' : ''}${item.status.id}`}
                            data-index={virtualRow.index}
                            ref={virtualizer.measureElement}
                            style={{
                                transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                            }}
                        >
                            <PinnedItemWrapper $isLastPinned={isLastPinned}>
                                {isFirstPinned && (
                                    <PinnedBadge>
                                        <Pin size={14} />
                                        Pinned
                                    </PinnedBadge>
                                )}
                                <PostCard status={item.status} style={{ marginBottom: 'var(--size-3)' }} />
                            </PinnedItemWrapper>
                        </VirtualItemWrapper>
                    );
                })}
            </VirtualContent>

            {/* Loading indicator */}
            {isFetchingNextPage && (
                <PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />
            )}

            {/* End of list indicator */}
            {!hasNextPage && combinedItems.length > 0 && (
                <EndIndicator>No more posts</EndIndicator>
            )}
        </div>
    );

    // Determine what to render for posts tabs
    const renderPostsContent = () => {
        if (isLoading && statuses.length === 0) {
            return renderLoading();
        }
        if (combinedItems.length === 0) {
            return renderEmpty();
        }
        return renderVirtualizedList();
    };

    return (
        <>
            <Tabs
                tabs={profileTabs}
                activeTab={activeTab}
                onTabChange={onTabChange}
                sticky
            />

            <ContentSection>
                {/* Posts Tab Content */}
                <Activity mode={activeTab === 'posts' ? 'visible' : 'hidden'}>
                    <TabContent>
                        {renderPostsContent()}
                    </TabContent>
                </Activity>

                {/* Posts & Replies Tab Content */}
                <Activity mode={activeTab === 'posts_replies' ? 'visible' : 'hidden'}>
                    <TabContent>
                        {renderPostsContent()}
                    </TabContent>
                </Activity>

                {/* Media Tab Content */}
                <Activity mode={activeTab === 'media' ? 'visible' : 'hidden'}>
                    <MediaTabContent>
                        {isLoading && statuses.length === 0 ? (
                            <MediaGridSkeleton />
                        ) : (
                            <>
                                <MediaGrid statuses={statuses} />
                                {hasNextPage && (
                                    <LoadMoreButton
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                    >
                                        {isFetchingNextPage ? 'Loading...' : 'Load more'}
                                    </LoadMoreButton>
                                )}
                            </>
                        )}
                    </MediaTabContent>
                </Activity>
            </ContentSection>

            {/* Scroll to top button */}
            <ScrollToTopButton visible={showScrollTop} onClick={handleScrollToTop} />
        </>
    );
}

// Styled components
const PinnedItemWrapper = styled.div<{ $isLastPinned: boolean }>`
  ${({ $isLastPinned }) =>
        $isLastPinned &&
        `
      border-bottom: 1px solid var(--surface-3);
      padding-bottom: var(--size-4);
      margin-bottom: var(--size-4);
    `}
`;

const PinnedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--size-1);
  padding: var(--size-1) var(--size-2);
  margin-bottom: var(--size-2);
  margin-left: var(--size-4);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-6);
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const TabContent = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const MediaTabContent = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const LoadMoreButton = styled.button<{ disabled?: boolean }>`
  margin: var(--size-4) auto;
  padding: var(--size-2) var(--size-4);
  background: var(--surface-2);
  border: 1px solid var(--surface-3);
  border-radius: var(--radius-2);
  color: var(--text-1);
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--surface-3);
  }
`;

const LoadingContainer = styled.div`
  flex: 1;
  overflow: auto;
`;

const VirtualContent = styled.div`
  width: 100%;
  position: relative;
`;

const VirtualItemWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;

const EndIndicator = styled.div`
  text-align: center;
  padding: var(--size-4);
  color: var(--text-2);
`;
