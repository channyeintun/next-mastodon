'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Repeat2,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Share,
  Trash2,
  Edit2,
  Globe,
  Lock,
  Users,
  Mail,
  MessageSquareQuote,
  Pin,
  PinOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Avatar, Card, IconButton, Button, EmojiText } from '@/components/atoms';
import { StatusContent, LinkPreview, StatusEditHistory, DeletePostModal } from '@/components/molecules';
import type { Status } from '@/types';
import {
  useFavouriteStatus,
  useUnfavouriteStatus,
  useReblogStatus,
  useUnreblogStatus,
  useBookmarkStatus,
  useUnbookmarkStatus,
  useMuteConversation,
  useUnmuteConversation,
  usePinStatus,
  useUnpinStatus,
  useVotePoll,
  useCurrentAccount,
} from '@/api';
import { useAuthStore } from '@/hooks/useStores';
import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { CSSProperties, useState } from 'react';

interface PostCardProps {
  status: Status;
  showThread?: boolean;
  style?: CSSProperties;
  hideActions?: boolean;
  showThreadLine?: boolean;
  showEditHistory?: boolean;
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

const VISIBILITY_ICONS = {
  public: <Globe size={14} />,
  unlisted: <Lock size={14} />,
  private: <Users size={14} />,
  direct: <Mail size={14} />,
};

export function PostCard({ status, showThread = false, style, hideActions = false, showThreadLine = false, showEditHistory = false }: PostCardProps) {
  const router = useRouter();
  const authStore = useAuthStore();

  const [showCWContent, setShowCWContent] = useState(false);
  const [showCWMedia, setShowCWMedia] = useState(false);
  const [selectedPollChoices, setSelectedPollChoices] = useState<number[]>([]);

  const { data: currentAccount } = useCurrentAccount();
  const votePollMutation = useVotePoll();
  const favouriteMutation = useFavouriteStatus();
  const unfavouriteMutation = useUnfavouriteStatus();
  const reblogMutation = useReblogStatus();
  const unreblogMutation = useUnreblogStatus();
  const bookmarkMutation = useBookmarkStatus();
  const unbookmarkMutation = useUnbookmarkStatus();
  const muteConversationMutation = useMuteConversation();
  const unmuteConversationMutation = useUnmuteConversation();
  const pinStatusMutation = usePinStatus();
  const unpinStatusMutation = useUnpinStatus();
  const { openModal, closeModal } = useGlobalModal();

  // Handle reblog (boost) - show the original status
  const displayStatus = status.reblog || status;
  const isReblog = !!status.reblog;

  // Check if this is the current user's post
  const isOwnPost = currentAccount?.id === displayStatus.account.id;

  // Check if content warning is active (has actual text)
  const hasContentWarning = displayStatus.spoiler_text && displayStatus.spoiler_text.trim().length > 0;
  // Check if media should be blurred (sensitive flag OR content warning)
  const hasSensitiveMedia = displayStatus.sensitive || hasContentWarning;

  const handleFavourite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (displayStatus.favourited) {
      unfavouriteMutation.mutate(displayStatus.id);
    } else {
      favouriteMutation.mutate(displayStatus.id);
    }
  };

  const handleReblog = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Focus the button to trigger :focus-within and show the popover
    e.currentTarget.focus();
  };

  const confirmReblog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (displayStatus.reblogged) {
      unreblogMutation.mutate(displayStatus.id);
    } else {
      reblogMutation.mutate(displayStatus.id);
    }
  };

  const handleQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    router.push(`/compose?quoted_status_id=${displayStatus.id}`);
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

  const handleMuteConversation = () => {
    if (displayStatus.muted) {
      unmuteConversationMutation.mutate(displayStatus.id);
    } else {
      muteConversationMutation.mutate(displayStatus.id);
    }
  };

  const handlePin = () => {
    if (displayStatus.pinned) {
      unpinStatusMutation.mutate(displayStatus.id);
    } else {
      pinStatusMutation.mutate(displayStatus.id);
    }
  };



  const handleEdit = () => {
    router.push(`/status/${displayStatus.id}/edit`);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title: `Post by ${displayStatus.account.display_name || displayStatus.account.username}`,
      text: displayStatus.text || displayStatus.content.replace(/<[^>]*>/g, ''), // Strip HTML tags
      url: displayStatus.url || `${window.location.origin}/status/${displayStatus.id}`,
    };

    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled or share failed - ignore
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        // Could show a toast notification here
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;

    // Check if clicked element or its parent is a button, link, or input
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('video')
    ) {
      return;
    }

    // Don't navigate if we're already on the status detail page
    if (window.location.pathname === `/status/${displayStatus.id}`) {
      return;
    }

    // Navigate to status detail page
    router.push(`/status/${displayStatus.id}`);
  };

  const handlePollChoiceToggle = (index: number) => {
    if (!displayStatus.poll) return;

    if (displayStatus.poll.multiple) {
      // Multiple choice - toggle selection
      setSelectedPollChoices((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      // Single choice - replace selection
      setSelectedPollChoices([index]);
    }
  };

  const handlePollVote = async () => {
    if (!displayStatus.poll || selectedPollChoices.length === 0) return;

    try {
      await votePollMutation.mutateAsync({
        pollId: displayStatus.poll.id,
        choices: selectedPollChoices,
      });
      setSelectedPollChoices([]);
    } catch (error) {
      console.error('Failed to vote on poll:', error);
    }
  };

  const handleReply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Navigate to status detail page if not already there
    if (window.location.pathname !== `/status/${displayStatus.id}`) {
      router.push(`/status/${displayStatus.id}`);
    }
  };

  return (
    <Card as="article" padding="medium" style={style} onClick={handleCardClick}>
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
            <strong>
              <EmojiText
                text={status.account.display_name || status.account.username}
                emojis={status.account.emojis}
              />
            </strong> boosted
          </span>
        </div>
      )}

      {/* Post header */}
      <div style={{ marginBottom: 'var(--size-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
          <Link
            href={`/@${displayStatus.account.acct}`}
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
                  href={`/@${displayStatus.account.acct}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    fontWeight: 'var(--font-weight-6)',
                    color: 'var(--text-1)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    <EmojiText
                      text={displayStatus.account.display_name || displayStatus.account.username}
                      emojis={displayStatus.account.emojis}
                    />
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
                <div style={{ color: 'var(--text-3)', display: 'flex', alignItems: 'center' }} title={displayStatus.visibility}>
                  {VISIBILITY_ICONS[displayStatus.visibility as keyof typeof VISIBILITY_ICONS]}
                </div>
                {isOwnPost && (
                  <div className="options-menu-btn">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Focus the button to trigger :focus-within and show the popover
                        e.currentTarget.focus();
                      }}
                    >
                      <MoreHorizontal size={16} />
                    </IconButton>

                    <div className="options-menu-popover">
                      {/* Pin/Unpin - Only for own public/unlisted posts */}
                      {isOwnPost && (displayStatus.visibility === 'public' || displayStatus.visibility === 'unlisted') && (
                        <button
                          className="options-menu-item"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePin();
                          }}
                        >
                          {displayStatus.pinned ? <PinOff size={16} /> : <Pin size={16} />}
                          <span>{displayStatus.pinned ? 'Unpin from profile' : 'Pin on profile'}</span>
                        </button>
                      )}

                      {/* Mute/Unmute Conversation */}
                      <button
                        className="options-menu-item"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMuteConversation();
                        }}
                      >
                        {displayStatus.muted ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        <span>{displayStatus.muted ? 'Unmute conversation' : 'Mute conversation'}</span>
                      </button>

                      {isOwnPost && (
                        <>
                          <div style={{ height: '1px', background: 'var(--surface-3)', margin: '4px 0' }} />
                          <button
                            className="options-menu-item"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEdit();
                            }}
                          >
                            <Edit2 size={16} />
                            <span>Edit status</span>
                          </button>
                          <button
                            className="options-menu-item danger"
                            onMouseDown={(e) => {
                              // Use onMouseDown instead of onClick for iOS Safari compatibility.
                              // In :focus-within popovers, iOS Safari loses focus before onClick fires,
                              // but onMouseDown fires before focus is lost.
                              e.preventDefault();
                              e.stopPropagation();
                              openModal(
                                <DeletePostModal
                                  postId={displayStatus.id}
                                  onClose={closeModal}
                                />
                              );
                            }}
                          >
                            <Trash2 size={16} />
                            <span>Delete status</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Spoiler warning */}
        {hasContentWarning && (
          <div style={{
            marginTop: 'var(--size-2)',
            padding: 'var(--size-3)',
            background: 'var(--orange-2)',
            borderRadius: 'var(--radius-2)',
          }}>
            <div style={{
              fontSize: 'var(--font-size-1)',
              fontWeight: 'var(--font-weight-6)',
              color: 'var(--text-1)',
              marginBottom: 'var(--size-2)',
            }}>
              Content Warning: {displayStatus.spoiler_text}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowCWContent(!showCWContent);
              }}
              style={{
                padding: 'var(--size-2) var(--size-3)',
                background: 'var(--orange-6)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-2)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-1)',
                fontWeight: 'var(--font-weight-6)',
              }}
            >
              {showCWContent ? 'Hide content' : 'Show content'}
            </button>
          </div>
        )}

        {/* Post content - hidden if CW active and not revealed, also hidden if has quote */}
        {(!hasContentWarning || showCWContent) && displayStatus.content && !displayStatus.quote?.quoted_status && (
          <StatusContent
            html={displayStatus.content}
            emojis={displayStatus.emojis}
            style={{
              marginTop: 'var(--size-3)',
            }}
          />
        )}

        {/* Media attachments - hidden initially, then shown blurred, then unblurred */}
        {(!hasContentWarning || showCWContent) && displayStatus.media_attachments.length > 0 && (
          <div style={{
            marginTop: 'var(--size-3)',
            position: 'relative',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: displayStatus.media_attachments.length === 1
                ? '1fr'
                : 'repeat(2, 1fr)',
              gap: 'var(--size-2)',
              borderRadius: 'var(--radius-2)',
              overflow: 'hidden',
              filter: hasSensitiveMedia && !showCWMedia ? 'blur(32px)' : 'none',
              transition: 'filter 0.2s ease',
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

            {/* Sensitive content overlay - shown for sensitive media */}
            {hasSensitiveMedia && !showCWMedia && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 'var(--radius-2)',
                }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowCWMedia(true);
                  }}
                  style={{
                    padding: 'var(--size-3) var(--size-4)',
                    background: 'var(--surface-2)',
                    border: '2px solid var(--surface-4)',
                    borderRadius: 'var(--radius-2)',
                    color: 'var(--text-1)',
                    fontSize: 'var(--font-size-1)',
                    fontWeight: 'var(--font-weight-6)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--size-2)',
                    boxShadow: 'var(--shadow-3)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface-3)';
                    e.currentTarget.style.borderColor = 'var(--blue-6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--surface-2)';
                    e.currentTarget.style.borderColor = 'var(--surface-4)';
                  }}
                >
                  Click to view sensitive content
                </button>
              </div>
            )}
          </div>
        )}

        {/* Link preview - shown only if there's a card and no media attachments */}
        {(!hasContentWarning || showCWContent) &&
          displayStatus.card &&
          displayStatus.media_attachments.length === 0 && (
            <LinkPreview
              card={displayStatus.card}
              style={{ marginTop: 'var(--size-3)' }}
            />
          )}

        {/* Quoted status - shown if quote exists and is accepted */}
        {(!hasContentWarning || showCWContent) &&
          displayStatus.quote?.state === 'accepted' &&
          displayStatus.quote.quoted_status && (
            <div style={{ marginTop: 'var(--size-3)' }}>
              <PostCard
                status={displayStatus.quote.quoted_status}
                hideActions
              />
            </div>
          )}

        {/* Poll - hidden if CW active and not revealed */}
        {(!hasContentWarning || showCWContent) && displayStatus.poll && (() => {
          const poll = displayStatus.poll!;
          // Show voting interface only if authenticated, not expired, and not voted
          // Note: API returns voted:true for poll creators, so this handles that case
          const canVote = authStore.isAuthenticated && !poll.expired && !poll.voted;

          return (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                marginTop: 'var(--size-3)',
                padding: 'var(--size-3)',
                background: 'var(--surface-3)',
                borderRadius: 'var(--radius-2)',
              }}
            >
              {/* Show voting interface if authenticated, not voted and not expired */}
              {canVote ? (
                <>
                  {poll.options.map((option, index) => (
                    <label
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--size-2)',
                        padding: 'var(--size-2)',
                        marginBottom: 'var(--size-2)',
                        background: selectedPollChoices.includes(index)
                          ? 'var(--blue-2)'
                          : 'var(--surface-2)',
                        borderRadius: 'var(--radius-2)',
                        cursor: 'pointer',
                        border: selectedPollChoices.includes(index)
                          ? '2px solid var(--blue-6)'
                          : '2px solid transparent',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <input
                        type={poll.multiple ? 'checkbox' : 'radio'}
                        name={`poll-${poll.id}`}
                        checked={selectedPollChoices.includes(index)}
                        onChange={() => handlePollChoiceToggle(index)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                        }}
                      />
                      <span style={{
                        flex: 1,
                        color: 'var(--text-1)',
                        fontSize: 'var(--font-size-1)',
                      }}>
                        {option.title}
                      </span>
                    </label>
                  ))}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'var(--size-3)',
                  }}>
                    <div style={{
                      fontSize: 'var(--font-size-0)',
                      color: 'var(--text-2)',
                    }}>
                      {poll.votes_count} votes · {poll.multiple ? 'Multiple choice' : 'Single choice'}
                    </div>
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePollVote();
                      }}
                      disabled={selectedPollChoices.length === 0 || votePollMutation.isPending}
                      isLoading={votePollMutation.isPending}
                    >
                      Vote
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Show results if voted or expired */}
                  {poll.options.map((option, index) => {
                    const percentage = poll.votes_count > 0
                      ? ((option.votes_count || 0) / poll.votes_count) * 100
                      : 0;
                    const isOwnVote = poll.own_votes?.includes(index);

                    return (
                      <div
                        key={index}
                        style={{
                          marginBottom: 'var(--size-2)',
                          padding: 'var(--size-2)',
                          background: 'var(--surface-2)',
                          borderRadius: 'var(--radius-2)',
                          position: 'relative',
                          border: isOwnVote ? '2px solid var(--blue-6)' : '2px solid transparent',
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          background: isOwnVote ? 'var(--blue-4)' : 'var(--blue-3)',
                          borderRadius: 'var(--radius-2)',
                          width: `${percentage}%`,
                          transition: 'width 0.5s ease',
                        }} />
                        <div style={{
                          position: 'relative',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 'var(--size-2)',
                        }}>
                          <span style={{
                            flex: 1,
                            color: 'var(--text-1)',
                            fontWeight: isOwnVote ? 'var(--font-weight-6)' : 'normal',
                          }}>
                            {option.title}
                            {isOwnVote && (
                              <span style={{
                                marginLeft: 'var(--size-2)',
                                fontSize: 'var(--font-size-0)',
                                color: 'var(--blue-6)',
                              }}>
                                ✓
                              </span>
                            )}
                          </span>
                          <span style={{
                            color: 'var(--text-2)',
                            fontSize: 'var(--font-size-0)',
                            fontWeight: 'var(--font-weight-6)',
                          }}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{
                    marginTop: 'var(--size-2)',
                    fontSize: 'var(--font-size-0)',
                    color: 'var(--text-2)',
                  }}>
                    {poll.votes_count.toLocaleString()} votes
                    {poll.voters_count !== null &&
                      ` · ${poll.voters_count.toLocaleString()} voters`}
                    {' · '}
                    {poll.expired ? (
                      <span style={{ color: 'var(--red-6)' }}>Closed</span>
                    ) : (
                      `Closes ${new Date(poll.expires_at!).toLocaleString()}`
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {/* Action bar */}
        {!hideActions && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-1)',
            marginTop: 'var(--size-3)',
          }}>
            <IconButton
              size="small"
              onClick={handleReply}
              title="Reply"
            >
              <MessageCircle size={16} />
            </IconButton>
            <span style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
              {displayStatus.replies_count}
            </span>

            <div className="boost-btn" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
              <div
                className="boost-popover"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: 'var(--size-2)',
                  background: 'var(--surface-2)',
                  borderRadius: 'var(--radius-2)',
                  boxShadow: 'var(--shadow-4)',
                  padding: 'var(--size-2)',
                  minWidth: '150px',
                  zIndex: 50,
                  gap: 'var(--size-1)',
                }}
              >
                <button
                  onClick={confirmReblog}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--size-2)',
                    padding: 'var(--size-2)',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: 'var(--radius-2)',
                    cursor: 'pointer',
                    color: displayStatus.reblogged ? 'var(--green-6)' : 'var(--text-1)',
                    fontSize: 'var(--font-size-1)',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface-3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Repeat2 size={16} />
                  <span>{displayStatus.reblogged ? 'Undo Boost' : 'Boost'}</span>
                </button>
                <button
                  onClick={handleQuote}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--size-2)',
                    padding: 'var(--size-2)',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: 'var(--radius-2)',
                    cursor: 'pointer',
                    color: 'var(--text-1)',
                    fontSize: 'var(--font-size-1)',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface-3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <MessageSquareQuote size={16} />
                  <span>Quote</span>
                </button>
              </div>
            </div>
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
                onClick={handleShare}
                title="Share"
              >
                <Share size={16} />
              </IconButton>
            </div>
          </div>
        )}
      </div>

      {/* Edit History - shown only on detail page when prop is true */}
      {showEditHistory && displayStatus.edited_at && (
        <StatusEditHistory
          statusId={displayStatus.id}
          editedAt={displayStatus.edited_at}
        />
      )}


    </Card >
  );
}
