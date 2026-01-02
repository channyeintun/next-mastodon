'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bookmark as BookmarkIcon } from 'lucide-react';
import { useInfiniteBookmarks } from '@/api';
import { PostCard } from '@/components/organisms';
import { PostCardSkeletonList, PostCardSkeleton } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { Button, IconButton } from '@/components/atoms';
import { flattenAndUniqById } from '@/utils/fp';
import type { Status } from '@/types';

export default function BookmarksPage() {
  const router = useRouter();
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteBookmarks();

  // Flatten and deduplicate statuses using FP utility
  const uniqueStatuses = flattenAndUniqById(data?.pages);

  if (isLoading) {
    return (
      <div className="full-height-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'var(--surface-1)',
          zIndex: 10,
          padding: 'var(--size-4)',
          marginBottom: 'var(--size-4)',
          borderBottom: '1px solid var(--surface-3)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-3)',
          flexShrink: 0,
        }}>
          <IconButton onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </IconButton>
          <h1 style={{ fontSize: 'var(--font-size-4)' }}>
            Bookmarks
          </h1>
        </div>

        {/* Skeleton loading */}
        <div className="virtualized-list-container" style={{ flex: 1, overflow: 'auto' }}>
          <PostCardSkeletonList count={5} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
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

  if (uniqueStatuses.length === 0) {
    return (
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
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
          <IconButton onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </IconButton>
          <h1 style={{ fontSize: 'var(--font-size-4)' }}>
            Bookmarks
          </h1>
        </div>

        {/* Empty state */}
        <div style={{ display: 'grid', placeItems: 'center', marginTop: 'var(--size-8)' }}>
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
    <div className="full-height-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'var(--surface-1)',
        zIndex: 10,
        padding: 'var(--size-4)',
        marginBottom: 'var(--size-4)',
        borderBottom: '1px solid var(--surface-3)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--size-3)',
        flexShrink: 0,
      }}>
        <IconButton onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </IconButton>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-4)', marginBottom: 'var(--size-1)' }}>
            Bookmarks
          </h1>
          <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
            {uniqueStatuses.length} {uniqueStatuses.length === 1 ? 'post' : 'posts'}
          </p>
        </div>
      </div>

      {/* Virtual scrolling container with scroll restoration */}
      <VirtualizedList<Status>
        items={uniqueStatuses}
        renderItem={(status) => (
          <PostCard
            status={status}
            style={{ marginBottom: 'var(--size-3)' }}
          />
        )}
        getItemKey={(status) => status.id}
        estimateSize={350}
        overscan={5}
        onLoadMore={fetchNextPage}
        isLoadingMore={isFetchingNextPage}
        hasMore={hasNextPage}
        loadMoreThreshold={1}

        height="auto"
        style={{ flex: 1, minHeight: 0 }}
        scrollRestorationKey="bookmarks"
        loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
        endIndicator="You've reached the end of your bookmarks"
      />
    </div>
  );
}
