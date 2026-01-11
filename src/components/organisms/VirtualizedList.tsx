'use client';

import styled from '@emotion/styled';
import { useRef, useEffect, useCallback, useMemo, type CSSProperties, type ReactNode } from 'react';
import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual';
import { ScrollToTopButton } from '@/components/atoms/ScrollToTopButton';

interface VirtualizedListProps<T> {
  /**
   * Array of items to render
   */
  items: T[];

  /**
   * Function to render each item
   */
  renderItem: (item: T, index: number) => ReactNode;

  /**
   * Function to extract unique key from item
   */
  getItemKey: (item: T, index: number) => string | number;

  /**
   * Estimated size of each item in pixels
   * @default 350
   */
  estimateSize?: number;

  /**
   * Number of items to render outside visible area
   * @default 12 (desktop) / 1 (mobile)
   */
  overscan?: number;

  /**
   * Callback when user scrolls near the end
   */
  onLoadMore?: () => void;

  /**
   * Whether more items are being loaded
   */
  isLoadingMore?: boolean;

  /**
   * Whether there are more items to load
   */
  hasMore?: boolean;

  /**
   * Number of items from end to trigger load more
   * @default 3
   */
  loadMoreThreshold?: number;

  /**
   * Loading indicator component
   */
  loadingIndicator?: ReactNode;

  /**
   * End of list indicator component
   */
  endIndicator?: ReactNode;

  /**
   * Empty state component
   */
  emptyState?: ReactNode;

  /**
   * Container height
   * @default 'calc(100dvh - 140px)'
   */
  height?: string;

  /**
   * Container style
   */
  style?: CSSProperties;

  /**
   * Unique key for scroll restoration
   * If provided, scroll position will be saved and restored
   */
  scrollRestorationKey?: string;

  /**
   * Optional sticky header element to render inside the scroll container
   * The header will collapse when user scrolls using CSS scroll-state queries
   * Header should contain: .header-title, .header-subtitle, .header-actions
   */
  header?: ReactNode;

  /**
   * Function to get media URLs from an item for preloading
   */
  getMediaUrls?: (item: T) => string[];

  /**
   * Additional class name for the container
   */
  className?: string;
}

// Global cache for scroll restoration
const scrollStateCache = new Map<string, {
  offset: number;
  measurements: VirtualItem[];
}>();

/**
 * Reusable virtualized list component with infinite scroll and scroll restoration
 */
export function VirtualizedList<T>({
  items,
  renderItem,
  getItemKey,
  estimateSize = 350,
  overscan: overscanProp,
  onLoadMore,
  isLoadingMore = false,
  hasMore = false,
  loadMoreThreshold = 3,
  loadingIndicator,
  endIndicator,
  emptyState,
  height = 'calc(100dvh - 140px)',
  style,
  scrollRestorationKey,
  header,
  getMediaUrls,
  className,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Determine overscan: use prop if provided, otherwise conditional default
  const overscan = overscanProp ?? 5;

  // Get saved scroll state if available
  const savedState = scrollRestorationKey
    ? scrollStateCache.get(scrollRestorationKey)
    : undefined;

  // Memoize properties passed to component to avoid virtualizer re-initialization
  const estimateSizeCallback = useCallback(() => estimateSize, [estimateSize]);

  // Use a ref to access items in getItemKey without creating a new function reference
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Use a ref to access getItemKey prop without creating a new function reference
  const getItemKeyRef = useRef(getItemKey);
  getItemKeyRef.current = getItemKey;

  // Memoize the getItemKey function with stable reference (no dependencies that change)
  const memoizedGetItemKey = useCallback(
    (index: number) => {
      const item = itemsRef.current[index];
      if (!item) return index; // Fallback for safely handling out-of-bounds
      return getItemKeyRef.current(item, index);
    },
    []
  );

  // Setup virtualizer with scroll restoration
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: estimateSizeCallback,
    overscan,
    lanes: 1,
    // Provide memoized getItemKey to generate stable keys
    getItemKey: memoizedGetItemKey,
    // Scroll restoration: restore initial offset and measurements
    initialOffset: savedState?.offset,
    initialMeasurementsCache: savedState?.measurements,
    // Save scroll state when scrolling stops
    onChange: (instance) => {
      if (scrollRestorationKey && !instance.isScrolling) {
        scrollStateCache.set(scrollRestorationKey, {
          offset: instance.scrollOffset || 0,
          measurements: instance.measurementsCache,
        });
      }
    },
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Media Preloading Logic
  const preloadUrls = useMemo(() => {
    if (!getMediaUrls || virtualItems.length === 0) return [];

    const startIndex = virtualItems[0].index;
    const endIndex = virtualItems[virtualItems.length - 1].index;

    // Prefetch items a bit ahead/behind the current visible range
    const preloadOverscan = 5;
    const start = Math.max(0, startIndex - preloadOverscan);
    const end = Math.min(items.length - 1, endIndex + preloadOverscan);

    const urls = new Set<string>();
    const visibleIndices = new Set(virtualItems.map(vi => vi.index));

    for (let i = start; i <= end; i++) {
      // Only preload items that are NOT currently visible
      if (!visibleIndices.has(i)) {
        const item = items[i];
        if (item) {
          const itemUrls = getMediaUrls(item);
          itemUrls.forEach(url => {
            if (url) urls.add(url);
          });
        }
      }
    }
    return Array.from(urls);
  }, [items, virtualItems, getMediaUrls]);

  // Handle scroll to top
  const handleScrollToTop = () => {
    parentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Infinite scroll - fetch next page when near bottom
  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoadingMore) return;

    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (lastItem.index >= items.length - loadMoreThreshold) {
      onLoadMore();
    }
  }, [
    hasMore,
    onLoadMore,
    items.length,
    isLoadingMore,
    virtualItems,
    loadMoreThreshold,
  ]);

  return (
    <Container
      ref={parentRef}
      className={`virtualized-list-container${className ? ` ${className}` : ''}`}
      $height={height}
      style={style}
    >
      {/* Optional header - consumer handles sticky behavior if needed */}
      {header}

      {items.length === 0 && emptyState && emptyState}

      {items.length > 0 && (
        <VirtualContent $height={virtualizer.getTotalSize()}>
          {virtualItems.map((virtualItem) => {
            const item = items[virtualItem.index];
            if (!item) return null;

            return (
              <VirtualItemWrapper
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                className='virtualized-list-item'
                $translateY={virtualItem.start}
              >
                {renderItem(item, virtualItem.index)}
              </VirtualItemWrapper>
            );
          })}
        </VirtualContent>
      )}

      {/* Loading indicator */}
      {isLoadingMore && loadingIndicator}

      {/* End of list indicator */}
      {!hasMore && items.length > 0 && endIndicator && (
        <EndIndicator>{endIndicator}</EndIndicator>
      )}

      {/* Hidden Preload Layer */}
      {preloadUrls.length > 0 && (
        <div style={{ display: 'none' }} aria-hidden="true">
          {preloadUrls.map((url: string) => (
            <link key={url} rel="prefetch" href={url} />
          ))}
        </div>
      )}

      {/* Scroll to top button */}
      <ScrollToTopButton scrollRef={parentRef} onClick={handleScrollToTop} />
    </Container>
  );
}

// Styled components
const Container = styled.div<{ $height: string }>`
  height: ${props => props.$height};
  overflow: auto;
  contain: paint;
  position: relative;
`;

const VirtualContent = styled.div<{ $height: number }>`
  height: ${props => props.$height}px;
  width: 100%;
  position: relative;
`;

const VirtualItemWrapper = styled.div<{ $translateY: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  transform: translateY(${props => props.$translateY}px);
  will-change: transform;
`;

const EndIndicator = styled.div`
  text-align: center;
  padding: var(--size-4);
  color: var(--text-2);
`;
