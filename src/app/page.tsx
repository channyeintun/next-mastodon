'use client';

import { useState, Activity } from 'react';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/useStores';
import { useInfiniteHomeTimeline, useInfiniteTrendingStatuses, useCurrentAccount, useInfiniteTrendingTags, useInfiniteTrendingLinks } from '@/api/queries';
import { PostCard } from '@/components/molecules/PostCard';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { PostCardSkeletonList, PostCardSkeleton } from '@/components/molecules/PostCardSkeleton';
import { TrendingTagCard, TrendingTagCardSkeleton } from '@/components/molecules/TrendingTagCard';
import { TrendingLinkCard, TrendingLinkCardSkeleton } from '@/components/molecules/TrendingLinkCard';
import { EmojiText } from '@/components/atoms/EmojiText';
import { Button } from '@/components/atoms/Button';
import { IconButton } from '@/components/atoms/IconButton';
import { Plus, TrendingUp, Search, Hash, Newspaper, FileText } from 'lucide-react';
import type { Status, Tag, TrendingLink } from '@/types/mastodon';

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
          <Link href="/search">
            <IconButton>
              <Search size={20} />
            </IconButton>
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

type TrendingTab = 'posts' | 'tags' | 'links';

const TrendingPage = observer(() => {
  const [activeTab, setActiveTab] = useState<TrendingTab>('posts');

  // Fetch data for all tabs
  const {
    data: statusData,
    isLoading: statusesLoading,
    isError: statusesError,
    error: statusesErrorMsg,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTrendingStatuses();

  const {
    data: tagsData,
    isLoading: tagsLoading,
    isError: tagsError,
    fetchNextPage: fetchNextTags,
    hasNextPage: hasMoreTags,
    isFetchingNextPage: isFetchingNextTags,
  } = useInfiniteTrendingTags();

  const {
    data: linksData,
    isLoading: linksLoading,
    isError: linksError,
    fetchNextPage: fetchNextLinks,
    hasNextPage: hasMoreLinks,
    isFetchingNextPage: isFetchingNextLinks,
  } = useInfiniteTrendingLinks();

  // Flatten and deduplicate statuses
  const allStatuses = statusData?.pages.flatMap((page) => page) ?? [];
  const uniqueStatuses = Array.from(
    new Map(allStatuses.map((status) => [status.id, status])).values()
  );

  // Flatten and deduplicate tags
  const allTags = tagsData?.pages.flatMap((page) => page) ?? [];
  const uniqueTags = Array.from(
    new Map(allTags.map((tag) => [tag.name, tag])).values()
  );

  // Flatten and deduplicate links
  const allLinks = linksData?.pages.flatMap((page) => page) ?? [];
  const uniqueLinks = Array.from(
    new Map(allLinks.map((link) => [link.url, link])).values()
  );



  return (
    <div className="container full-height-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
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

      {/* Tab Navigation */}
      <div className="trending-tabs" style={{ padding: '0 var(--size-4)' }}>
        <button
          className={`trending-tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          <FileText size={18} />
          Posts
        </button>
        <button
          className={`trending-tab ${activeTab === 'tags' ? 'active' : ''}`}
          onClick={() => setActiveTab('tags')}
        >
          <Hash size={18} />
          Tags
        </button>
        <button
          className={`trending-tab ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => setActiveTab('links')}
        >
          <Newspaper size={18} />
          News
        </button>
      </div>

      {/* Tab Content - using Activity for toggling */}
      <Activity mode={activeTab === 'posts' ? 'visible' : 'hidden'}>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {statusesLoading ? (
            <PostCardSkeletonList count={5} />
          ) : statusesError ? (
            <div style={{ textAlign: 'center', padding: 'var(--size-8)' }}>
              <p style={{ color: 'var(--red-6)', marginBottom: 'var(--size-3)' }}>
                {statusesErrorMsg instanceof Error ? statusesErrorMsg.message : 'Failed to load posts'}
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : uniqueStatuses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
              No trending posts at the moment.
            </div>
          ) : (
            <VirtualizedList<Status>
              items={uniqueStatuses}
              renderItem={(status) => (
                <PostCard status={status} style={{ marginBottom: 'var(--size-3)' }} />
              )}
              getItemKey={(status) => status.id}
              estimateSize={300}
              overscan={5}
              onLoadMore={fetchNextPage}
              isLoadingMore={isFetchingNextPage}
              hasMore={hasNextPage}
              loadMoreThreshold={1}
              height="100%"
              style={{ height: '100%' }}
              scrollRestorationKey="trending-posts"
              loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
              endIndicator="You've reached the end of trending posts"
            />
          )}
        </div>
      </Activity>

      <Activity mode={activeTab === 'tags' ? 'visible' : 'hidden'}>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%', padding: '0 var(--size-4)' }}>
          {tagsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <TrendingTagCardSkeleton key={i} />
              ))}
            </div>
          ) : tagsError ? (
            <div style={{ textAlign: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
              Failed to load trending tags.
            </div>
          ) : uniqueTags.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
              No trending tags at the moment.
            </div>
          ) : (
            <VirtualizedList<Tag>
              items={uniqueTags}
              renderItem={(tag) => (
                <TrendingTagCard tag={tag} style={{ marginBottom: 'var(--size-2)' }} />
              )}
              getItemKey={(tag) => tag.name}
              estimateSize={80}
              overscan={5}
              onLoadMore={fetchNextTags}
              isLoadingMore={isFetchingNextTags}
              hasMore={hasMoreTags}
              loadMoreThreshold={1}
              height="100%"
              style={{ height: '100%' }}
              scrollRestorationKey="home-trending-tags"
              loadingIndicator={<TrendingTagCardSkeleton style={{ marginBottom: 'var(--size-2)' }} />}
              endIndicator="You've reached the end of trending tags"
            />
          )}
        </div>
      </Activity>

      <Activity mode={activeTab === 'links' ? 'visible' : 'hidden'}>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%', padding: '0 var(--size-4)' }}>
          {linksLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <TrendingLinkCardSkeleton key={i} />
              ))}
            </div>
          ) : linksError ? (
            <div style={{ textAlign: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
              Failed to load trending news.
            </div>
          ) : uniqueLinks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
              No trending news at the moment.
            </div>
          ) : (
            <VirtualizedList<TrendingLink>
              items={uniqueLinks}
              renderItem={(link) => (
                <TrendingLinkCard link={link} style={{ marginBottom: 'var(--size-2)' }} />
              )}
              getItemKey={(link) => link.url}
              estimateSize={120}
              overscan={5}
              onLoadMore={fetchNextLinks}
              isLoadingMore={isFetchingNextLinks}
              hasMore={hasMoreLinks}
              loadMoreThreshold={1}
              height="100%"
              style={{ height: '100%' }}
              scrollRestorationKey="home-trending-links"
              loadingIndicator={<TrendingLinkCardSkeleton style={{ marginBottom: 'var(--size-2)' }} />}
              endIndicator="You've reached the end of trending news"
            />
          )}
        </div>
      </Activity>
    </div>
  );
});


export default HomePage;
