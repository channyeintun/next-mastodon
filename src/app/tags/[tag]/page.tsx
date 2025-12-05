'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Hash } from 'lucide-react';
import { useInfiniteHashtagTimeline } from '@/api/queries';
import { PostCard } from '@/components/molecules/PostCard';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { PostCardSkeletonList, PostCardSkeleton } from '@/components/molecules/PostCardSkeleton';
import { IconButton } from '@/components/atoms/IconButton';
import type { Status } from '@/types/mastodon';

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

  // Flatten all pages into a single array of statuses and deduplicate by ID
  const allStatuses = data?.pages.flatMap((page) => page) ?? [];

  // Deduplicate statuses by ID (handles pagination overlaps)
  const uniqueStatuses = Array.from(
    new Map(allStatuses.map((status) => [status.id, status])).values()
  );

  if (isLoading) {
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

        {/* Skeleton loading */}
        <PostCardSkeletonList count={5} />
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

      {/* Timeline with scroll restoration */}
      <VirtualizedList<Status>
        items={uniqueStatuses}
        renderItem={(status) => (
          <PostCard
            status={status}
            style={{ marginBottom: 'var(--size-3)' }}
          />
        )}
        getItemKey={(status) => status.id}
        estimateSize={300}
        overscan={5}
        onLoadMore={fetchNextPage}
        isLoadingMore={isFetchingNextPage}
        hasMore={hasNextPage}
        loadMoreThreshold={3}
        height="calc(100vh - 140px)"
        scrollRestorationKey={`hashtag-${decodedTag}`}
        loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
        endIndicator="You've reached the end"
        emptyState={
          <div style={{
            textAlign: 'center',
            marginTop: 'var(--size-8)',
            color: 'var(--text-2)',
          }}>
            <Hash size={48} style={{ marginBottom: 'var(--size-4)' }} />
            <p>No posts found for this hashtag</p>
          </div>
        }
      />
    </div>
  );
}
