'use client';

import { use, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
import { useAccount, useInfiniteAccountStatuses, useRelationships } from '@/api/queries';
import { useFollowAccount, useUnfollowAccount } from '@/api/mutations';
import { PostCard } from '@/components/molecules/PostCard';
import { Avatar } from '@/components/atoms/Avatar';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { IconButton } from '@/components/atoms/IconButton';

export default function AccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
    data: account,
    isLoading: accountLoading,
    isError: accountError,
  } = useAccount(id);

  const {
    data: statusPages,
    isLoading: statusesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteAccountStatuses(id);

  const { data: relationships } = useRelationships([id]);
  const relationship = relationships?.[0];

  const followMutation = useFollowAccount();
  const unfollowMutation = useUnfollowAccount();

  const parentRef = useRef<HTMLDivElement>(null);

  const allStatuses = statusPages?.pages.flatMap((page) => page) ?? [];

  const virtualizer = useVirtualizer({
    count: allStatuses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

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
  }, [hasNextPage, fetchNextPage, allStatuses.length, isFetchingNextPage, virtualItems]);

  const handleFollowToggle = () => {
    if (relationship?.following) {
      unfollowMutation.mutate(id);
    } else {
      followMutation.mutate(id);
    }
  };

  if (accountLoading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
        <Spinner />
        <p style={{ marginTop: 'var(--size-4)', color: 'var(--text-2)' }}>
          Loading profile...
        </p>
      </div>
    );
  }

  if (accountError || !account) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
        <h2 style={{ color: 'var(--red-6)', marginBottom: 'var(--size-3)' }}>
          Profile Not Found
        </h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 'var(--size-4)' }}>
          This account could not be found or loaded.
        </p>
        <Link href="/">
          <Button>Back to Timeline</Button>
        </Link>
      </div>
    );
  }

  const isFollowing = relationship?.following || false;
  const isLoading = followMutation.isPending || unfollowMutation.isPending;

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
            {account.display_name || account.username}
          </h1>
          <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
            {account.statuses_count.toLocaleString()} posts
          </p>
        </div>
      </div>

      {/* Profile Header Image */}
      {account.header && (
        <div style={{
          width: '100%',
          height: '200px',
          background: `url(${account.header}) center/cover`,
          borderRadius: 'var(--radius-3)',
          marginBottom: 'calc(-1 * var(--size-8))',
        }} />
      )}

      {/* Profile Info */}
      <div style={{ padding: 'var(--size-4)', paddingTop: 'var(--size-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--size-3)' }}>
          <Avatar
            src={account.avatar}
            alt={account.display_name || account.username}
            size="xlarge"
            style={{
              border: '4px solid var(--surface-1)',
              background: 'var(--surface-1)',
            }}
          />
          <Button
            variant={isFollowing ? 'secondary' : 'primary'}
            onClick={handleFollowToggle}
            isLoading={isLoading}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        </div>

        <div style={{ marginBottom: 'var(--size-3)' }}>
          <h2 style={{ fontSize: 'var(--font-size-4)', fontWeight: 'var(--font-weight-7)', marginBottom: 'var(--size-1)' }}>
            {account.display_name || account.username}
            {account.bot && (
              <span style={{
                marginLeft: 'var(--size-2)',
                fontSize: 'var(--font-size-0)',
                padding: '2px var(--size-2)',
                background: 'var(--surface-3)',
                borderRadius: 'var(--radius-1)',
                fontWeight: 'var(--font-weight-5)',
              }}>
                BOT
              </span>
            )}
            {account.locked && <span style={{ marginLeft: 'var(--size-2)' }}>🔒</span>}
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 'var(--font-size-1)' }}>
            @{account.acct}
          </p>
        </div>

        {/* Bio */}
        {account.note && (
          <div
            style={{
              marginBottom: 'var(--size-3)',
              lineHeight: '1.5',
              color: 'var(--text-1)',
            }}
            dangerouslySetInnerHTML={{ __html: account.note }}
          />
        )}

        {/* Fields (metadata) */}
        {account.fields.length > 0 && (
          <div style={{ marginBottom: 'var(--size-3)' }}>
            {account.fields.map((field, index) => (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: 'var(--size-2)',
                  padding: 'var(--size-2) 0',
                  borderBottom: index < account.fields.length - 1 ? '1px solid var(--surface-3)' : 'none',
                  fontSize: 'var(--font-size-1)',
                }}
              >
                <div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-2)' }}>
                  {field.name}
                </div>
                <div dangerouslySetInnerHTML={{ __html: field.value }} />
              </div>
            ))}
          </div>
        )}

        {/* Joined date */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-2)',
          color: 'var(--text-2)',
          fontSize: 'var(--font-size-1)',
          marginBottom: 'var(--size-3)',
        }}>
          <Calendar size={16} />
          <span>
            Joined {new Date(account.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: 'var(--size-4)',
          fontSize: 'var(--font-size-1)',
          marginBottom: 'var(--size-4)',
        }}>
          <div>
            <strong style={{ color: 'var(--text-1)' }}>
              {account.following_count.toLocaleString()}
            </strong>{' '}
            <span style={{ color: 'var(--text-2)' }}>Following</span>
          </div>
          <div>
            <strong style={{ color: 'var(--text-1)' }}>
              {account.followers_count.toLocaleString()}
            </strong>{' '}
            <span style={{ color: 'var(--text-2)' }}>Followers</span>
          </div>
        </div>

        {/* External link */}
        {account.url && (
          <a
            href={account.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--size-1)',
              color: 'var(--blue-6)',
              fontSize: 'var(--font-size-1)',
              textDecoration: 'none',
            }}
          >
            View on Mastodon <ExternalLink size={14} />
          </a>
        )}
      </div>

      {/* Posts Section */}
      <div style={{
        borderTop: '1px solid var(--surface-3)',
        paddingTop: 'var(--size-4)',
        marginTop: 'var(--size-4)',
      }}>
        <h3 style={{
          fontSize: 'var(--font-size-3)',
          fontWeight: 'var(--font-weight-6)',
          marginBottom: 'var(--size-4)',
          paddingLeft: 'var(--size-4)',
        }}>
          Posts
        </h3>

        {statusesLoading && allStatuses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--size-8)' }}>
            <Spinner />
          </div>
        ) : allStatuses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
            No posts yet
          </div>
        ) : (
          <div
            ref={parentRef}
            style={{
              height: 'calc(100vh - 600px)',
              minHeight: '400px',
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
                    <PostCard status={status} style={{ marginBottom: 'var(--size-3)' }} />
                  </div>
                );
              })}
            </div>

            {isFetchingNextPage && (
              <div style={{ textAlign: 'center', padding: 'var(--size-4)' }}>
                <Spinner />
              </div>
            )}

            {!hasNextPage && allStatuses.length > 0 && (
              <div style={{
                textAlign: 'center',
                padding: 'var(--size-6)',
                color: 'var(--text-2)',
                fontSize: 'var(--font-size-1)',
              }}>
                No more posts
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
