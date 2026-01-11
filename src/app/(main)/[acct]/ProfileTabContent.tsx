'use client';

import styled from '@emotion/styled';
import { useEffect, useState, useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import { useWindowVirtualizer, type VirtualItem } from '@tanstack/react-virtual';
import { PostCard } from '@/components/organisms';
import { PostCardSkeleton, PostCardSkeletonList, MediaGrid, MediaGridSkeleton } from '@/components/molecules';
import { EmptyState } from '@/components/atoms';
import { ScrollToTopButton } from '@/components/atoms/ScrollToTopButton';
import type { Status } from '@/types';
import { useWindowScrollDirection } from '@/hooks/useScrollDirection';
import { useTranslations } from 'next-intl';

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
    statuses: Status[];
    isLoading: boolean;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
}

export function ProfileTabContent({
    acct,
    tabKey,
    statuses,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
}: ProfileTabContentProps) {
    const listRef = useRef<HTMLDivElement>(null);
    const [scrollMargin, setScrollMargin] = useState(0);

    // Scroll direction detection for scroll-to-top button
    const { showScrollTop, hideScrollTop } = useWindowScrollDirection();
    const t = useTranslations('account');

    // Per-tab scroll cache key - includes acct for isolation
    const scrollCacheKey = `profile-${acct}-${tabKey}`;

    // Get cached state - use useMemo to re-evaluate when acct/tabKey changes
    const cachedState = useMemo(() => scrollStateCache.get(scrollCacheKey), [scrollCacheKey]);

    // Measure scroll margin from list element's position
    useLayoutEffect(() => {
        if (listRef.current) {
            // Use a slight delay or RAF to ensure the layout has settled, especially when transitioning from skeleton
            const measure = () => {
                if (listRef.current) {
                    setScrollMargin(listRef.current.offsetTop);
                }
            };
            measure();
            const rafId = requestAnimationFrame(measure);
            return () => cancelAnimationFrame(rafId);
        }
    }, [acct, tabKey, isLoading]); // Re-measure when tab or loading state changes

    // Include an extra item for the "end indicator" when we've reached the end
    const showEndIndicator = !hasNextPage && statuses.length > 0 && !isFetchingNextPage;

    // Item types for mixed rendering
    type ProfileListItem =
        | { type: 'status'; data: Status }
        | { type: 'endIndicator' };

    // Build mixed items array - memoized to prevent recreation
    const mixedItems = useMemo(() => {
        const items: ProfileListItem[] = statuses.map((status) => ({
            type: 'status',
            data: status,
        }));

        if (showEndIndicator) {
            items.push({ type: 'endIndicator' });
        }

        return items;
    }, [statuses, showEndIndicator]);

    const estimateSize = useCallback((index: number) => {
        const item = mixedItems[index];
        if (item?.type === 'endIndicator') return 60;
        return 350;
    }, [mixedItems]);

    const getItemKey = useCallback((index: number) => {
        const item = mixedItems[index];
        if (item?.type === 'status') return item.data.id;
        if (item?.type === 'endIndicator') return 'end-indicator';
        return index;
    }, [mixedItems]);

    const virtualizer = useWindowVirtualizer({
        useFlushSync: false,
        count: mixedItems.length,
        estimateSize,
        getItemKey,
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
            lastItem.index >= mixedItems.length - 5 &&
            hasNextPage &&
            !isFetchingNextPage
        ) {
            fetchNextPage();
        }
    }, [virtualItems, mixedItems.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Cache scroll state on unmount
    useEffect(() => {
        return () => {
            scrollStateCache.set(scrollCacheKey, {
                offset: virtualizer.scrollOffset ?? 0,
                measurementsCache: virtualizer.measurementsCache,
            });
        };
    }, [virtualizer, scrollCacheKey]);

    const handleScrollToTop = () => {
        window.scrollTo(0, 0);
        hideScrollTop();
    };

    // Empty state - only show if not loading
    if (!isLoading && statuses.length === 0) {
        return <EmptyState title={t('empty.posts')} />;
    }

    return (
        <>
            <div ref={listRef} style={{ overflowAnchor: 'auto' }}>
                {isLoading && statuses.length === 0 ? (
                    <LoadingContainer>
                        <PostCardSkeletonList count={6} />
                    </LoadingContainer>
                ) : (
                    <VirtualContent style={{ height: `${virtualizer.getTotalSize()}px` }}>
                        {virtualItems.map((virtualRow) => {
                            const item = mixedItems[virtualRow.index];
                            if (!item) return null;

                            if (item.type === 'endIndicator') {
                                return (
                                    <VirtualItemWrapper
                                        key={virtualRow.key}
                                        data-index={virtualRow.index}
                                        ref={virtualizer.measureElement}
                                        className="window-virtual-item"
                                        style={{
                                            transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                                        }}
                                    >
                                        <EndIndicator>{t('empty.end')}</EndIndicator>
                                    </VirtualItemWrapper>
                                );
                            }

                            return (
                                <VirtualItemWrapper
                                    key={virtualRow.key}
                                    data-index={virtualRow.index}
                                    ref={virtualizer.measureElement}
                                    className="window-virtual-item"
                                    style={{
                                        transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                                    }}
                                >
                                    <PostCard status={item.data} style={{ marginBottom: 'var(--size-3)' }} />
                                </VirtualItemWrapper>
                            );
                        })}
                    </VirtualContent>
                )}

                {/* Loading indicator for pagination */}
                {isFetchingNextPage && (
                    <PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />
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
    const t = useTranslations('account');

    return (
        <MediaTabContainer>
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
                            {isFetchingNextPage ? t('loading') : t('loadMore')}
                        </LoadMoreButton>
                    )}
                </>
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
  /* Enable scroll anchoring to stabilize view when data replaces skeletons */
  overflow-anchor: auto;
  min-height: 50vh; /* Prevent layout collapse during transitions */
`;

const LoadingContainer = styled.div`
  flex: 1;
  overflow: auto;
  overflow-anchor: auto;
  min-height: 50vh;
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
  /* Prevent layout from affecting other elements (like bottom nav) */
  contain: layout style;
  /* Optimize transform rendering and create proper stacking context */
  will-change: transform;
`;


const EndIndicator = styled.div`
  text-align: center;
  padding: var(--size-4);
  color: var(--text-2);
`;

const MediaTabContainer = styled.div`
  flex: 1;
  min-height: 50vh;
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
