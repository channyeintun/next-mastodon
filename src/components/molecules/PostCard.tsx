'use client';

import { type CSSProperties } from 'react';
import Link from 'next/link';
import {
  Heart,
  Repeat2,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Share
} from 'lucide-react';
import { Avatar } from '../atoms/Avatar';
import { Card } from '../atoms/Card';
import { IconButton } from '../atoms/IconButton';
import type { Status } from '@/types/mastodon';
import {
  useFavouriteStatus,
  useUnfavouriteStatus,
  useReblogStatus,
  useUnreblogStatus,
  useBookmarkStatus,
  useUnbookmarkStatus,
} from '@/api/mutations';

interface PostCardProps {
  status: Status;
  showThread?: boolean;
  style?: CSSProperties;
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function PostCard({ status, showThread = false, style }: PostCardProps) {
  const favouriteMutation = useFavouriteStatus();
  const unfavouriteMutation = useUnfavouriteStatus();
  const reblogMutation = useReblogStatus();
  const unreblogMutation = useUnreblogStatus();
  const bookmarkMutation = useBookmarkStatus();
  const unbookmarkMutation = useUnbookmarkStatus();

  // Handle reblog (boost) - show the original status
  const displayStatus = status.reblog || status;
  const isReblog = !!status.reblog;

  const handleFavourite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (displayStatus.favourited) {
      unfavouriteMutation.mutate(displayStatus.id);
    } else {
      favouriteMutation.mutate(displayStatus.id);
    }
  };

  const handleReblog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (displayStatus.reblogged) {
      unreblogMutation.mutate(displayStatus.id);
    } else {
      reblogMutation.mutate(displayStatus.id);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (displayStatus.bookmarked) {
      unbookmarkMutation.mutate(displayStatus.id);
    } else {
      bookmarkMutation.mutate(displayStatus.id);
    }
  };

  return (
    <Card padding="medium" style={style}>
      {/* Reblog indicator */}
      {isReblog && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-2)',
          marginBottom: 'var(--size-2)',
          fontSize: 'var(--font-size-0)',
          color: 'var(--text-2)',
        }}>
          <Repeat2 size={14} style={{ marginLeft: 'var(--size-6)' }} />
          <span>
            <strong>{status.account.display_name || status.account.username}</strong> boosted
          </span>
        </div>
      )}

      {/* Post header */}
      <div style={{ display: 'flex', gap: 'var(--size-3)', marginBottom: 'var(--size-3)' }}>
        <Link
          href={`/accounts/${displayStatus.account.id}`}
          style={{ textDecoration: 'none', flexShrink: 0 }}
        >
          <Avatar
            src={displayStatus.account.avatar}
            alt={displayStatus.account.display_name || displayStatus.account.username}
            size="medium"
          />
        </Link>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ minWidth: 0 }}>
              <Link
                href={`/accounts/${displayStatus.account.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  fontWeight: 'var(--font-weight-6)',
                  color: 'var(--text-1)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {displayStatus.account.display_name || displayStatus.account.username}
                </div>
                <div style={{
                  fontSize: 'var(--font-size-0)',
                  color: 'var(--text-2)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  @{displayStatus.account.acct}
                </div>
              </Link>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-2)',
              flexShrink: 0,
            }}>
              <Link
                href={`/status/${displayStatus.id}`}
                style={{
                  textDecoration: 'none',
                  fontSize: 'var(--font-size-0)',
                  color: 'var(--text-2)',
                }}
              >
                {formatRelativeTime(displayStatus.created_at)}
              </Link>
              <IconButton size="small">
                <MoreHorizontal size={16} />
              </IconButton>
            </div>
          </div>

          {/* Spoiler warning */}
          {displayStatus.spoiler_text && (
            <div style={{
              marginTop: 'var(--size-2)',
              padding: 'var(--size-2)',
              background: 'var(--orange-2)',
              borderRadius: 'var(--radius-2)',
              fontSize: 'var(--font-size-1)',
              fontWeight: 'var(--font-weight-6)',
            }}>
              CW: {displayStatus.spoiler_text}
            </div>
          )}

          {/* Post content */}
          <div
            style={{
              marginTop: 'var(--size-3)',
              color: 'var(--text-1)',
              lineHeight: '1.5',
              wordBreak: 'break-word',
            }}
            dangerouslySetInnerHTML={{ __html: displayStatus.content }}
          />

          {/* Media attachments */}
          {displayStatus.media_attachments.length > 0 && (
            <div style={{
              marginTop: 'var(--size-3)',
              display: 'grid',
              gridTemplateColumns: displayStatus.media_attachments.length === 1
                ? '1fr'
                : 'repeat(2, 1fr)',
              gap: 'var(--size-2)',
              borderRadius: 'var(--radius-2)',
              overflow: 'hidden',
            }}>
              {displayStatus.media_attachments.map((media) => (
                <div
                  key={media.id}
                  style={{
                    position: 'relative',
                    aspectRatio: '16/9',
                    background: 'var(--surface-3)',
                  }}
                >
                  {media.type === 'image' && media.preview_url && (
                    <img
                      src={media.preview_url}
                      alt={media.description || ''}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  {media.type === 'video' && media.url && (
                    <video
                      src={media.url}
                      controls
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  {media.type === 'gifv' && media.url && (
                    <video
                      src={media.url}
                      autoPlay
                      loop
                      muted
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Poll (if exists) */}
          {displayStatus.poll && (
            <div style={{
              marginTop: 'var(--size-3)',
              padding: 'var(--size-3)',
              background: 'var(--surface-3)',
              borderRadius: 'var(--radius-2)',
            }}>
              {displayStatus.poll.options.map((option, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: 'var(--size-2)',
                    padding: 'var(--size-2)',
                    background: 'var(--surface-2)',
                    borderRadius: 'var(--radius-2)',
                    position: 'relative',
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    background: 'var(--blue-3)',
                    borderRadius: 'var(--radius-2)',
                    width: displayStatus.poll.votes_count > 0
                      ? `${((option.votes_count || 0) / displayStatus.poll.votes_count) * 100}%`
                      : '0%',
                    transition: 'width 0.3s ease',
                  }} />
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    <span>{option.title}</span>
                    <span style={{ color: 'var(--text-2)' }}>
                      {option.votes_count || 0} votes
                    </span>
                  </div>
                </div>
              ))}
              <div style={{
                marginTop: 'var(--size-2)',
                fontSize: 'var(--font-size-0)',
                color: 'var(--text-2)',
              }}>
                {displayStatus.poll.votes_count} votes · {displayStatus.poll.expired ? 'Closed' : 'Active'}
              </div>
            </div>
          )}

          {/* Action bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-1)',
            marginTop: 'var(--size-3)',
          }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // TODO: Open reply modal
              }}
              title="Reply"
            >
              <MessageCircle size={16} />
            </IconButton>
            <span style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
              {displayStatus.replies_count}
            </span>

            <IconButton
              size="small"
              onClick={handleReblog}
              style={{
                color: displayStatus.reblogged ? 'var(--green-6)' : undefined
              }}
              title={displayStatus.reblogged ? 'Undo boost' : 'Boost'}
            >
              <Repeat2 size={16} />
            </IconButton>
            <span style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
              {displayStatus.reblogs_count}
            </span>

            <IconButton
              size="small"
              onClick={handleFavourite}
              style={{
                color: displayStatus.favourited ? 'var(--red-6)' : undefined
              }}
              title={displayStatus.favourited ? 'Unfavourite' : 'Favourite'}
            >
              <Heart size={16} fill={displayStatus.favourited ? 'currentColor' : 'none'} />
            </IconButton>
            <span style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
              {displayStatus.favourites_count}
            </span>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--size-1)' }}>
              <IconButton
                size="small"
                onClick={handleBookmark}
                style={{
                  color: displayStatus.bookmarked ? 'var(--blue-6)' : undefined
                }}
                title={displayStatus.bookmarked ? 'Remove bookmark' : 'Bookmark'}
              >
                <Bookmark size={16} fill={displayStatus.bookmarked ? 'currentColor' : 'none'} />
              </IconButton>

              <IconButton
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // TODO: Open share menu
                }}
                title="Share"
              >
                <Share size={16} />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
