'use client';

import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/useStores';
import { useInfiniteHomeTimeline, useCurrentAccount } from '@/api';
import { PostCard, PostCardSkeletonList, PostCardSkeleton } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { TrendingContent } from '@/components/organisms/TrendingContent';
import { EmojiText, Button, IconButton } from '@/components/atoms';
import { Plus, TrendingUp, Search } from 'lucide-react';
import type { Status } from '@/types';

const HomePage = observer(() => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    return <TrendingPage />;
  }

  return <TimelinePage />;
});

const TimelinePage = observer(() => {
  const authStore = useAuthStore();
  const { data: user } = useCurrentAccount();
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
      <div className="container full-height-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'var(--surface-1)',
          zIndex: 10,
          padding: 'var(--size-4)',
          marginBottom: 'var(--size-4)',
          borderBottom: '1px solid var(--surface-3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-5)', marginBottom: 'var(--size-1)' }}>
              Home
            </h1>
            <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
              {authStore.instanceURL?.replace('https://', '')}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
            {/* Search icon skeleton */}
            <div
              style={{
                width: 'var(--size-7)',
                height: 'var(--size-7)',
                borderRadius: '50%',
                background: 'var(--surface-3)',
                animation: 'var(--animation-blink)',
              }}
            />
            {/* Profile pill skeleton */}
            <div className="profile-pill profile-pill-static skeleton-loading">
              <div className="profile-pill-avatar" style={{ background: 'var(--surface-3)' }} />
              <div className="profile-pill-name" style={{ width: '80px', height: '1em', background: 'var(--surface-3)', borderRadius: 'var(--radius-1)' }} />
            </div>
          </div>
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
    <div className="container full-height-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'var(--surface-1)',
        zIndex: 10,
        padding: 'var(--size-4)',
        marginBottom: 'var(--size-4)',
        borderBottom: '1px solid var(--surface-3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-5)', marginBottom: 'var(--size-1)' }}>
            Home
          </h1>
          <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
            {authStore.instanceURL?.replace('https://', '')}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
          <Link
            href="/search"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'var(--size-7)',
              height: 'var(--size-7)',
              borderRadius: '50%',
              color: 'var(--text-2)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <Search size={20} />
          </Link>
          <Link href={user ? `/@${user.acct}` : '#'} className={`profile-pill profile-pill-static ${!user ? 'skeleton-loading' : ''}`}>
            {user ? (
              <>
                <img
                  src={user.avatar}
                  alt={user.display_name}
                  className="profile-pill-avatar"
                />
                <span className="profile-pill-name">
                  <EmojiText text={user.display_name} emojis={user.emojis} />
                </span>
              </>
            ) : (
              <>
                <div className="profile-pill-avatar" style={{ background: 'var(--surface-3)' }} />
                <div className="profile-pill-name" style={{ width: '80px', height: '1em', background: 'var(--surface-3)', borderRadius: 'var(--radius-1)' }} />
              </>
            )}
          </Link>
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
        estimateSize={300}
        overscan={5}
        onLoadMore={fetchNextPage}
        isLoadingMore={isFetchingNextPage}
        hasMore={hasNextPage}
        loadMoreThreshold={1}

        height="auto"
        style={{ flex: 1, minHeight: 0 }}
        scrollRestorationKey="home-timeline"
        loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
        endIndicator="You've reached the end of your timeline"
      />
    </div>
  );
});

const TrendingPage = () => {
  return (
    <TrendingContent
      header={
        <div style={{
          background: 'var(--surface-1)',
          zIndex: 10,
          padding: 'var(--size-4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-5)', marginBottom: 'var(--size-1)', display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
              <TrendingUp size={24} />
              Explore
            </h1>
            <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
              Trending on mastodon.social
            </p>
          </div>
          <Link href="/auth/signin">
            <Button>
              Sign In
            </Button>
          </Link>
        </div>
      }
      scrollRestorationPrefix="home-trending"
    />
  );
};


export default HomePage;
