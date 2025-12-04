'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowLeft, Bookmark as BookmarkIcon } from 'lucide-react';
import { useInfiniteBookmarks } from '@/api/queries';
import { PostCard } from '@/components/molecules/PostCard';
import { Spinner } from '@/components/atoms/Spinner';
import { Button } from '@/components/atoms/Button';
import { IconButton } from '@/components/atoms/IconButton';

export default function BookmarksPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteBookmarks();

  const parentRef = useRef<HTMLDivElement>(null);

  // Flatten all pages into a single array of statuses
  const allStatuses = data?.pages.flatMap((page) => page) ?? [];

  // Setup virtualizer
  const virtualizer = useVirtualizer({
    count: allStatuses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Load more when scrolling near the bottom
  useEffect(() => {
    const [lastItem] = [...virtualItems].reverse();

    if (!lastItem) return;

    if (
      lastItem.index >= allStatuses.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allStatuses.length,
    isFetchingNextPage,
    virtualItems,
  ]);

  if (isLoading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
        <Spinner />
        <p style={{ marginTop: 'var(--size-4)', color: 'var(--text-2)' }}>
          Loading your bookmarks...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
        <h2 style={{ color: 'var(--red-6)', marginBottom: 'var(--size-3)' }}>
          Error Loading Bookmarks
        </h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 'var(--size-4)' }}>
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (allStatuses.length === 0) {
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
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-3)',
        }}>
          <Link href="/">
            <IconButton>
              <ArrowLeft size={20} />
            </IconButton>
          </Link>
          <h1 style={{ fontSize: 'var(--font-size-4)' }}>
            Bookmarks
          </h1>
        </div>

        {/* Empty state */}
        <div style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
          <BookmarkIcon size={48} style={{ color: 'var(--text-3)', marginBottom: 'var(--size-4)' }} />
          <h2 style={{ marginBottom: 'var(--size-3)' }}>No Bookmarks Yet</h2>
          <p style={{ color: 'var(--text-2)', marginBottom: 'var(--size-4)' }}>
            Save posts for later by tapping the bookmark icon
          </p>
          <Link href="/">
            <Button>Browse Timeline</Button>
          </Link>
        </div>
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
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-3)',
      }}>
        <Link href="/">
          <IconButton>
            <ArrowLeft size={20} />
          </IconButton>
        </Link>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-4)', marginBottom: 'var(--size-1)' }}>
            Bookmarks
          </h1>
          <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
            {allStatuses.length} {allStatuses.length === 1 ? 'post' : 'posts'}
          </p>
        </div>
      </div>

      {/* Virtual scrolling container */}
      <div
        ref={parentRef}
        style={{
          height: 'calc(100vh - 200px)',
          overflow: 'auto',
          contain: 'strict',
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const status = allStatuses[virtualItem.index];
            return (
              <div
                key={status.id}
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

        {/* Loading more indicator */}
        {isFetchingNextPage && (
          <div style={{ textAlign: 'center', padding: 'var(--size-4)' }}>
            <Spinner />
          </div>
        )}

        {/* End of list message */}
        {!hasNextPage && allStatuses.length > 0 && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--size-6)',
            color: 'var(--text-2)',
            fontSize: 'var(--font-size-1)',
          }}>
            You've reached the end of your bookmarks
          </div>
        )}
      </div>
    </div>
  );
}
