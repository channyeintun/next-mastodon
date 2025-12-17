'use client';

import styled from '@emotion/styled';
import { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react';
import { useWindowVirtualizer, type VirtualItem } from '@tanstack/react-virtual';
import { Pin } from 'lucide-react';
import { PostCard } from '@/components/organisms';
import { PostCardSkeleton, PostCardSkeletonList, MediaGrid, MediaGridSkeleton } from '@/components/molecules';
import { EmptyState } from '@/components/atoms';
import { ScrollToTopButton } from '@/components/atoms/ScrollToTopButton';
import type { Status } from '@/types';

/** Extended Status type with pinned flag */
interface StatusItem {
    status: Status;
    isPinned: boolean;
}

// Scroll restoration cache - per tab
interface ScrollState {
    offset: number;
    measurementsCache: VirtualItem[];
}
const scrollStateCache = new Map<string, ScrollState>();

// ============================================================================
// Profile Tab Content Component - Virtualized list for posts/posts_replies tabs
// ============================================================================

export interface ProfileTabContentProps {
    acct: string;
    tabKey: 'posts' | 'posts_replies';
    pinnedStatuses?: Status[];
    statuses: Status[];
    isLoading: boolean;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
}

export function ProfileTabContent({
    acct,
    tabKey,
    pinnedStatuses,
    statuses,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
}: ProfileTabContentProps) {
    const listRef = useRef<HTMLDivElement>(null);
    const [scrollMargin, setScrollMargin] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Per-tab scroll cache key
    const scrollCacheKey = `profile-${acct}-${tabKey}`;

    // Get cached state on initial render
    const [cachedState] = useState(() => scrollStateCache.get(scrollCacheKey));

    // Measure scroll margin from list element's position
    useLayoutEffect(() => {
        if (listRef.current) {
            setScrollMargin(listRef.current.offsetTop);
        }
    }, []);

    // Combine pinned and regular statuses
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

    // Loading state
    if (isLoading && statuses.length === 0) {
        return (
            <LoadingContainer>
                <PostCardSkeletonList count={5} />
            </LoadingContainer>
        );
    }

    // Empty state
    if (combinedItems.length === 0) {
        return <EmptyState title="No posts yet" />;
    }

    return (
        <>
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

            {/* Scroll to top button */}
            <ScrollToTopButton visible={showScrollTop} onClick={handleScrollToTop} />
        </>
    );
}

// ============================================================================
// Media Tab Content Component
// ============================================================================

export interface MediaTabContentProps {
    statuses: Status[];
    isLoading: boolean;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
}

export function MediaTabContent({
    statuses,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
}: MediaTabContentProps) {
    if (isLoading && statuses.length === 0) {
        return <MediaGridSkeleton />;
    }

    return (
        <MediaTabContainer>
            <MediaGrid statuses={statuses} />
            {hasNextPage && (
                <LoadMoreButton
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                >
                    {isFetchingNextPage ? 'Loading...' : 'Load more'}
                </LoadMoreButton>
            )}
        </MediaTabContainer>
    );
}

// ============================================================================
// Styled Components
// ============================================================================

export const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
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

const EndIndicator = styled.div`
  text-align: center;
  padding: var(--size-4);
  color: var(--text-2);
`;

const MediaTabContainer = styled.div`
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
