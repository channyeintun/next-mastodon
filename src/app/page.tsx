'use client';

import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/useStores';
import { useInfiniteHomeTimeline, useInfiniteTrendingStatuses } from '@/api/queries';
import { PostCard } from '@/components/molecules/PostCard';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { PostCardSkeletonList, PostCardSkeleton } from '@/components/molecules/PostCardSkeleton';
import { Button } from '@/components/atoms/Button';
import { Plus, TrendingUp } from 'lucide-react';
import type { Status } from '@/types/mastodon';

const HomePage = observer(() => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    return <TrendingPage />;
  }

  return <TimelinePage />;
});

const TimelinePage = observer(() => {
  const authStore = useAuthStore();
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteHomeTimeline();

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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-5)', marginBottom: 'var(--size-1)' }}>
              Home
            </h1>
            <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
              {authStore.instanceURL?.replace('https://', '')}
            </p>
          </div>
          <Link href="/compose">
            <Button>
              <Plus size={18} />
              New Post
            </Button>
          </Link>
        </div>

        {/* Skeleton loading */}
        <PostCardSkeletonList count={5} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
        <h2 style={{ color: 'var(--red-6)', marginBottom: 'var(--size-3)' }}>
          Error Loading Timeline
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
      <div className="container" style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
        <h2 style={{ marginBottom: 'var(--size-3)' }}>Your Timeline is Empty</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 'var(--size-4)' }}>
          Follow some accounts to see their posts here!
        </p>
        <Link href="/compose">
          <Button>
            <Plus size={18} />
            Create Your First Post
          </Button>
        </Link>
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
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-5)', marginBottom: 'var(--size-1)' }}>
            Home
          </h1>
          <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
            {authStore.instanceURL?.replace('https://', '')}
          </p>
        </div>
        <Link href="/compose">
          <Button>
            <Plus size={18} />
            New Post
          </Button>
        </Link>
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
        estimateSize={300}
        overscan={5}
        onLoadMore={fetchNextPage}
        isLoadingMore={isFetchingNextPage}
        hasMore={hasNextPage}
        loadMoreThreshold={1}
        height="calc(100vh - 200px)"
        scrollRestorationKey="home-timeline"
        loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
        endIndicator="You've reached the end of your timeline"
      />
    </div>
  );
});

const TrendingPage = observer(() => {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTrendingStatuses();

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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-5)', marginBottom: 'var(--size-1)', display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
              <TrendingUp size={24} />
              Trending on Mastodon
            </h1>
            <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
              Popular posts from mastodon.social
            </p>
          </div>
          <Link href="/auth/signin">
            <Button>
              Sign In
            </Button>
          </Link>
        </div>

        {/* Skeleton loading */}
        <PostCardSkeletonList count={5} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
        <h2 style={{ color: 'var(--red-6)', marginBottom: 'var(--size-3)' }}>
          Error Loading Trending Posts
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
      <div className="container" style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
        <h2 style={{ marginBottom: 'var(--size-3)' }}>No Trending Posts</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 'var(--size-4)' }}>
          Check back later for trending content!
        </p>
        <Link href="/auth/signin">
          <Button>
            Sign In to See Your Timeline
          </Button>
        </Link>
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
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-5)', marginBottom: 'var(--size-1)', display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
            <TrendingUp size={24} />
            Trending on Mastodon
          </h1>
          <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
            Popular posts from mastodon.social
          </p>
        </div>
        <Link href="/auth/signin">
          <Button>
            Sign In
          </Button>
        </Link>
      </div>

      {/* Virtual scrolling container */}
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
        loadMoreThreshold={1}
        height="calc(100vh - 200px)"
        scrollRestorationKey="trending-timeline"
        loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
        endIndicator="You've reached the end of trending posts"
      />
    </div>
  );
});

export default HomePage;
