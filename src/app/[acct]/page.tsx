'use client';

import { use, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, ExternalLink, MoreHorizontal, Ban, VolumeX, Volume2, Pin } from 'lucide-react';
import { useLookupAccount, useInfiniteAccountStatuses, useRelationships, useCurrentAccount, usePinnedStatuses } from '@/api/queries';
import { useFollowAccount, useUnfollowAccount, useBlockAccount, useUnblockAccount, useMuteAccount, useUnmuteAccount } from '@/api/mutations';
import { PostCard } from '@/components/molecules/PostCard';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { PostCardSkeletonList, PostCardSkeleton } from '@/components/molecules/PostCardSkeleton';
import { AccountProfileSkeleton } from '@/components/molecules/AccountProfileSkeleton';
import { Avatar } from '@/components/atoms/Avatar';
import { Button } from '@/components/atoms/Button';
import { IconButton } from '@/components/atoms/IconButton';
import { EmojiText } from '@/components/atoms/EmojiText';
import type { Status } from '@/types/mastodon';

export default function AccountPage({
  params,
}: {
  params: Promise<{ acct: string }>;
}) {
  const { acct: acctParam } = use(params);

  // Decode URL parameter (@ becomes %40 in URLs)
  const decodedAcct = decodeURIComponent(acctParam);

  // Check if acct starts with @, if not show 404
  if (!decodedAcct.startsWith('@')) {
    throw new Error('Not Found');
  }

  // Remove @ prefix to get the acct handle
  const acct = decodedAcct.slice(1);

  // Lookup account by handle (acct)
  const {
    data: account,
    isLoading: accountLoading,
    isError: accountError,
  } = useLookupAccount(acct);

  // Use account.id for other queries that require IDs
  const accountId = account?.id;

  const {
    data: statusPages,
    isLoading: statusesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteAccountStatuses(accountId || '');

  const { data: relationships } = useRelationships(accountId ? [accountId] : []);
  const relationship = relationships?.[0];

  const { data: pinnedStatuses } = usePinnedStatuses(accountId || '');

  const { data: currentAccount } = useCurrentAccount();
  const isOwnProfile = currentAccount?.id === accountId;

  const followMutation = useFollowAccount();
  const unfollowMutation = useUnfollowAccount();
  const blockMutation = useBlockAccount();
  const unblockMutation = useUnblockAccount();
  const muteMutation = useMuteAccount();
  const unmuteMutation = useUnmuteAccount();

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const allStatuses = statusPages?.pages.flatMap((page) => page) ?? [];

  // Deduplicate statuses by ID (handles pagination overlaps)
  const uniqueStatuses = Array.from(
    new Map(allStatuses.map((status) => [status.id, status])).values()
  );

  const handleFollowToggle = () => {
    if (!accountId) return;
    if (relationship?.following) {
      unfollowMutation.mutate(accountId);
    } else {
      followMutation.mutate(accountId);
    }
  };

  const handleBlock = () => {
    if (!accountId) return;
    blockMutation.mutate(accountId);
    setShowMenu(false);
  };

  const handleUnblock = () => {
    if (!accountId) return;
    unblockMutation.mutate(accountId);
    setShowMenu(false);
  };

  const handleMute = () => {
    if (!accountId) return;
    muteMutation.mutate({ id: accountId });
    setShowMenu(false);
  };

  const handleUnmute = () => {
    if (!accountId) return;
    unmuteMutation.mutate(accountId);
    setShowMenu(false);
  };

  const isBlocking = relationship?.blocking || false;
  const isMuting = relationship?.muting || false;

  if (accountLoading) {
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
            <div
              style={{
                width: '150px',
                height: '24px',
                background: 'var(--surface-3)',
                borderRadius: 'var(--radius-1)',
                marginBottom: 'var(--size-1)',
                animation: 'var(--animation-blink)',
              }}
            />
            <div
              style={{
                width: '100px',
                height: '16px',
                background: 'var(--surface-3)',
                borderRadius: 'var(--radius-1)',
                animation: 'var(--animation-blink)',
              }}
            />
          </div>
        </div>

        {/* Profile skeleton */}
        <AccountProfileSkeleton />

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
          <PostCardSkeletonList count={3} />
        </div>
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
    <div className="container full-height-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
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
        <Link href="/">
          <IconButton>
            <ArrowLeft size={20} />
          </IconButton>
        </Link>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-4)', marginBottom: 'var(--size-1)' }}>
            <EmojiText
              text={account.display_name || account.username}
              emojis={account.emojis}
            />
          </h1>
          <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
            {account.statuses_count.toLocaleString()} posts
          </p>
        </div>
      </div>

      {/* Profile Header Image */}
      <div style={{
        width: '100%',
        height: '200px',
        flexShrink: 0,
        background: account.header
          ? `url(${account.header}) center/cover`
          : 'linear-gradient(135deg, var(--surface-3) 0%, var(--surface-2) 100%)',
        borderRadius: 'var(--radius-3)',
        marginBottom: 'calc(-1 * var(--size-8))',
      }} />

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
            {isOwnProfile ? (
              <Link href="/profile/edit">
                <Button variant="secondary">
                  Edit Profile
                </Button>
              </Link>
            ) : (
              <>
                {!isBlocking && (
                  <Button
                    variant={isFollowing ? 'secondary' : 'primary'}
                    onClick={handleFollowToggle}
                    isLoading={isLoading}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}

                {/* More actions menu */}
                <div ref={menuRef} style={{ position: 'relative' }}>
                  <IconButton
                    onClick={() => setShowMenu(!showMenu)}
                    style={{
                      border: '1px solid var(--surface-3)',
                      borderRadius: 'var(--radius-round)',
                    }}
                  >
                    <MoreHorizontal size={20} />
                  </IconButton>

                  {showMenu && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 'var(--size-2)',
                      background: 'var(--surface-2)',
                      borderRadius: 'var(--radius-2)',
                      boxShadow: 'var(--shadow-3)',
                      overflow: 'hidden',
                      zIndex: 50,
                      minWidth: '180px',
                      border: '1px solid var(--surface-3)',
                    }}>
                      {/* Mute option */}
                      <button
                        onClick={isMuting ? handleUnmute : handleMute}
                        disabled={muteMutation.isPending || unmuteMutation.isPending}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--size-2)',
                          width: '100%',
                          padding: 'var(--size-3)',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-1)',
                          cursor: 'pointer',
                          fontSize: 'var(--font-size-1)',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-3)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {isMuting ? (
                          <>
                            <Volume2 size={18} />
                            Unmute @{account.acct}
                          </>
                        ) : (
                          <>
                            <VolumeX size={18} />
                            Mute @{account.acct}
                          </>
                        )}
                      </button>

                      {/* Block option */}
                      <button
                        onClick={isBlocking ? handleUnblock : handleBlock}
                        disabled={blockMutation.isPending || unblockMutation.isPending}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--size-2)',
                          width: '100%',
                          padding: 'var(--size-3)',
                          background: 'transparent',
                          border: 'none',
                          color: isBlocking ? 'var(--text-1)' : 'var(--red-6)',
                          cursor: 'pointer',
                          fontSize: 'var(--font-size-1)',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-3)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Ban size={18} />
                        {isBlocking ? `Unblock @${account.acct}` : `Block @${account.acct}`}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 'var(--size-3)' }}>
          <h2 style={{ fontSize: 'var(--font-size-4)', fontWeight: 'var(--font-weight-7)', marginBottom: 'var(--size-1)' }}>
            <EmojiText
              text={account.display_name || account.username}
              emojis={account.emojis}
            />
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
          <Link href={`/@${account.acct}/following`} style={{ textDecoration: 'none' }}>
            <strong style={{ color: 'var(--text-1)' }}>
              {account.following_count.toLocaleString()}
            </strong>{' '}
            <span style={{ color: 'var(--text-2)' }}>Following</span>
          </Link>
          <Link href={`/@${account.acct}/followers`} style={{ textDecoration: 'none' }}>
            <strong style={{ color: 'var(--text-1)' }}>
              {account.followers_count.toLocaleString()}
            </strong>{' '}
            <span style={{ color: 'var(--text-2)' }}>Followers</span>
          </Link>
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

      {/* Pinned Posts Section */}
      {pinnedStatuses && pinnedStatuses.length > 0 && (
        <div style={{
          borderTop: '1px solid var(--surface-3)',
          paddingTop: 'var(--size-4)',
          marginTop: 'var(--size-4)',
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-2)',
            fontWeight: 'var(--font-weight-6)',
            marginBottom: 'var(--size-3)',
            paddingLeft: 'var(--size-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-2)',
            color: 'var(--text-2)',
          }}>
            <Pin size={16} />
            Pinned Posts
          </h3>
          {pinnedStatuses.map(status => (
            <PostCard
              key={status.id}
              status={status}
              style={{ marginBottom: 'var(--size-3)' }}
            />
          ))}
        </div>
      )}

      {/* Posts Section */}
      <div style={{
        borderTop: '1px solid var(--surface-3)',
        paddingTop: 'var(--size-4)',
        marginTop: 'var(--size-4)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        <h3 style={{
          fontSize: 'var(--font-size-3)',
          fontWeight: 'var(--font-weight-6)',
          marginBottom: 'var(--size-4)',
          paddingLeft: 'var(--size-4)',
        }}>
          Posts
        </h3>

        {statusesLoading && uniqueStatuses.length === 0 ? (
          <PostCardSkeletonList count={3} />
        ) : (
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
            height="100dvh"
            scrollRestorationKey={`account-${acct}`}
            loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
            endIndicator="No more posts"
            emptyState={
              <div style={{ textAlign: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
                No posts yet
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
