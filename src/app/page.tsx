'use client';

import { useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAuthStore } from '@/hooks/useStores';
import { useInfiniteHomeTimeline } from '@/api/queries';
import { PostCard } from '@/components/molecules/PostCard';
import { Spinner } from '@/components/atoms/Spinner';
import { Button } from '@/components/atoms/Button';
import { Plus } from 'lucide-react';

const HomePage = observer(() => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    return (
      <div className="container" style={{ maxWidth: '600px', marginTop: 'var(--size-8)', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'var(--font-size-7)', marginBottom: 'var(--size-4)' }}>
          Welcome to Mastodon Client
        </h1>
        <p style={{ color: 'var(--text-2)', marginBottom: 'var(--size-6)', fontSize: 'var(--font-size-3)' }}>
          A minimal, performant social media frontend for Mastodon
        </p>
        <p style={{ color: 'var(--text-2)', marginBottom: 'var(--size-8)' }}>
          Sign in to start browsing your timeline, composing posts, and connecting with your community.
        </p>
        <Link
          href="/auth/signin"
          style={{
            display: 'inline-block',
            padding: 'var(--size-3) var(--size-6)',
            fontSize: 'var(--font-size-3)',
            fontWeight: 'var(--font-weight-6)',
            border: 'none',
            borderRadius: 'var(--radius-2)',
            background: 'var(--blue-6)',
            color: 'white',
            textDecoration: 'none',
          }}
        >
          Get Started
        </Link>
      </div>
    );
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

  const parentRef = useRef<HTMLDivElement>(null);

  // Flatten all pages into a single array of statuses
  const allStatuses = data?.pages.flatMap((page) => page) ?? [];

  // Setup virtualizer
  const virtualizer = useVirtualizer({
    count: allStatuses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300, // Estimated height of each post card
    overscan: 5, // Render 5 items before/after visible area
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
          Loading your timeline...
        </p>
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

  if (allStatuses.length === 0) {
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

        {/* End of timeline message */}
        {!hasNextPage && allStatuses.length > 0 && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--size-6)',
            color: 'var(--text-2)',
            fontSize: 'var(--font-size-1)',
          }}>
            You've reached the end of your timeline
          </div>
        )}
      </div>
    </div>
  );
});

export default HomePage;
