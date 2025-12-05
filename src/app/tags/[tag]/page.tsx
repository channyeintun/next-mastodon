'use client';

import { use, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowLeft, Hash } from 'lucide-react';
import { useInfiniteHashtagTimeline } from '@/api/queries';
import { PostCard } from '@/components/molecules/PostCard';
import { Spinner } from '@/components/atoms/Spinner';
import { IconButton } from '@/components/atoms/IconButton';

export default function HashtagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = use(params);

  // Decode URL parameter
  const decodedTag = decodeURIComponent(tag);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteHashtagTimeline(decodedTag);

  const parentRef = useRef<HTMLDivElement>(null);

  // Flatten all pages into a single array of statuses and deduplicate by ID
  const allStatuses = data?.pages.flatMap((page) => page) ?? [];

  // Deduplicate statuses by ID (handles pagination overlaps)
  const uniqueStatuses = Array.from(
    new Map(allStatuses.map((status) => [status.id, status])).values()
  );

  // Setup virtualizer
  const virtualizer = useVirtualizer({
    count: uniqueStatuses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 5,
    lanes: 1,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Remeasure when uniqueStatuses changes (items added/deleted)
  useEffect(() => {
    virtualizer.measure();
  }, [uniqueStatuses.length, virtualizer]);

  // Infinite scroll - fetch next page when near bottom
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (
      lastItem.index >= uniqueStatuses.length - 3 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, uniqueStatuses.length, isFetchingNextPage, virtualItems]);

  if (isLoading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
        <Spinner />
        <p style={{ marginTop: 'var(--size-4)', color: 'var(--text-2)' }}>
          Loading hashtag timeline...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
        <p style={{ color: 'var(--red-6)' }}>Failed to load hashtag timeline</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'var(--surface-1)',
        zIndex: 10,
        padding: 'var(--size-4) 0',
        marginBottom: 'var(--size-4)',
        borderBottom: '1px solid var(--surface-3)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-3)',
        }}>
          <Link href="/">
            <IconButton>
              <ArrowLeft size={20} />
            </IconButton>
          </Link>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-2)',
          }}>
            <Hash size={24} style={{ color: 'var(--indigo-6)' }} />
            <h1 style={{
              fontSize: 'var(--font-size-4)',
              fontWeight: 'var(--font-weight-6)',
              color: 'var(--text-1)',
            }}>
              {decodedTag}
            </h1>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div
        ref={parentRef}
        style={{
          height: 'calc(100vh - 140px)',
          overflow: 'auto',
        }}
      >
        {uniqueStatuses.length === 0 && !isLoading ? (
          <div style={{
            textAlign: 'center',
            marginTop: 'var(--size-8)',
            color: 'var(--text-2)',
          }}>
            <Hash size={48} style={{ marginBottom: 'var(--size-4)' }} />
            <p>No posts found for this hashtag</p>
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualItems.map((virtualItem) => {
              const status = uniqueStatuses[virtualItem.index];
              if (!status) return null;

              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <PostCard
                    status={status}
                    style={{ marginBottom: 'var(--size-3)' }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Loading indicator */}
        {isFetchingNextPage && (
          <div style={{ textAlign: 'center', padding: 'var(--size-4)' }}>
            <Spinner />
          </div>
        )}

        {/* End of timeline */}
        {!hasNextPage && uniqueStatuses.length > 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--size-4)',
              color: 'var(--text-2)',
            }}
          >
            You've reached the end
          </div>
        )}
      </div>
    </div>
  );
}
