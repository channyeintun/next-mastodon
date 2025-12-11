'use client';

import { Card, SensitiveContentButton } from '@/components/atoms';
import {
  StatusContent,
  LinkPreview,
  StatusEditHistory,
  ReblogIndicator,
  PostHeader,
  PostActions,
  PostPoll,
  ContentWarningSection,
  DeletePostModal,
} from '@/components/molecules';
import type { Status } from '@/types';
import { usePostActions } from '@/hooks/usePostActions';
import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { CSSProperties } from 'react';

interface PostCardProps {
  status: Status;
  showThread?: boolean;
  style?: CSSProperties;
  hideActions?: boolean;
  showThreadLine?: boolean;
  showEditHistory?: boolean;
}

/**
 * Organism component for displaying a Mastodon status/post.
 * Orchestrates molecules and uses usePostActions hook for logic.
 */
export function PostCard({
  status,
  showThread = false,
  style,
  hideActions = false,
  showThreadLine = false,
  showEditHistory = false,
}: PostCardProps) {
  const { openModal, closeModal } = useGlobalModal();

  const handleDeleteClick = (postId: string) => {
    openModal(
      <DeletePostModal postId={postId} onClose={closeModal} />
    );
  };

  const actions = usePostActions(status, handleDeleteClick);

  const {
    displayStatus,
    isReblog,
    isOwnPost,
    hasContentWarning,
    hasSensitiveMedia,
    canVotePoll,
    showCWContent,
    showCWMedia,
    selectedPollChoices,
    handleFavourite,
    handleReblog,
    confirmReblog,
    handleQuote,
    handleBookmark,
    handleMuteConversation,
    handlePin,
    handleEdit,
    handleDelete,
    handleShare,
    handleCardClick,
    handlePollChoiceToggle,
    handlePollVote,
    handleReply,
    toggleCWContent,
    toggleCWMedia,
  } = actions;

  // Remove "RE: [link]" from content when displaying quotes
  // Mastodon automatically adds "RE: [url]" to quote posts, we remove it since we show the quoted status
  const contentToDisplay = displayStatus.quote?.quoted_status
    ? displayStatus.content
        // Remove <p class="quote-inline">RE: <a>...</a></p> (with nested spans)
        .replace(/<p\s+class="quote-inline">RE:\s*<a[^>]*>.*?<\/a><\/p>\s*/gi, '')
        // Remove RE: with link wrapped in regular <p> tag: <p>RE: <a>...</a></p>
        .replace(/^<p>\s*RE:\s*<a[^>]*>.*?<\/a>\s*<\/p>\s*/i, '')
        // Remove RE: with plain URL in <p>: <p>RE: https://...</p>
        .replace(/^<p>\s*RE:\s*https?:\/\/[^\s<]+\s*<\/p>\s*/i, '')
        // Remove RE: with link not in <p>: RE: <a>...</a>
        .replace(/^RE:\s*<a[^>]*>.*?<\/a>\s*/i, '')
        // Remove RE: with plain URL not in <p>: RE: https://...
        .replace(/^RE:\s*https?:\/\/\S+\s*/i, '')
        // Remove leftover empty paragraphs
        .replace(/^<p>\s*<\/p>\s*/, '')
        .trim()
    : displayStatus.content;

  return (
    <Card as="article" padding="medium" style={style} onClick={handleCardClick}>
      {/* Reblog indicator */}
      {isReblog && <ReblogIndicator account={status.account} />}

      {/* Post header and content */}
      <div style={{ marginBottom: 'var(--size-3)' }}>
        <PostHeader
          account={displayStatus.account}
          createdAt={displayStatus.created_at}
          visibility={
            displayStatus.visibility as
              | 'public'
              | 'unlisted'
              | 'private'
              | 'direct'
          }
          statusId={displayStatus.id}
          isOwnPost={isOwnPost}
          pinned={displayStatus.pinned}
          muted={displayStatus.muted}
          onEdit={isOwnPost ? handleEdit : undefined}
          onDelete={isOwnPost ? handleDelete : undefined}
          onPin={
            isOwnPost &&
            (displayStatus.visibility === 'public' ||
              displayStatus.visibility === 'unlisted')
              ? handlePin
              : undefined
          }
          onMute={handleMuteConversation}
        />

        {/* Content Warning */}
        {hasContentWarning && (
          <ContentWarningSection
            spoilerText={displayStatus.spoiler_text}
            isExpanded={showCWContent}
            onToggle={toggleCWContent}
          />
        )}

        {/* Post content */}
        {(!hasContentWarning || showCWContent) &&
          contentToDisplay && (
            <StatusContent
              html={contentToDisplay}
              emojis={displayStatus.emojis}
              style={{ marginTop: 'var(--size-3)' }}
            />
          )}

        {/* Media attachments */}
        {(!hasContentWarning || showCWContent) &&
          displayStatus.media_attachments.length > 0 && (
            <div style={{ marginTop: 'var(--size-3)', position: 'relative' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    displayStatus.media_attachments.length === 1
                      ? '1fr'
                      : 'repeat(2, 1fr)',
                  gap: 'var(--size-2)',
                  borderRadius: 'var(--radius-2)',
                  overflow: 'hidden',
                  filter:
                    hasSensitiveMedia && !showCWMedia ? 'blur(32px)' : 'none',
                  transition: 'filter 0.2s ease',
                }}
              >
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

              {/* Sensitive content overlay */}
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
                  <SensitiveContentButton onClick={toggleCWMedia} />
                </div>
              )}
            </div>
          )}

        {/* Link preview */}
        {(!hasContentWarning || showCWContent) &&
          displayStatus.card &&
          displayStatus.media_attachments.length === 0 && (
            <LinkPreview
              card={displayStatus.card}
              style={{ marginTop: 'var(--size-3)' }}
            />
          )}

        {/* Quoted status */}
        {(!hasContentWarning || showCWContent) &&
          displayStatus.quote?.state === 'accepted' &&
          displayStatus.quote.quoted_status && (
            <div style={{ marginTop: 'var(--size-3)' }}>
              <PostCard status={displayStatus.quote.quoted_status} hideActions />
            </div>
          )}

        {/* Poll */}
        {(!hasContentWarning || showCWContent) && displayStatus.poll && (
          <PostPoll
            poll={displayStatus.poll}
            selectedChoices={selectedPollChoices}
            isVoting={false}
            canVote={canVotePoll}
            onChoiceToggle={handlePollChoiceToggle}
            onVote={handlePollVote}
          />
        )}

        {/* Action bar */}
        {!hideActions && (
          <PostActions
            repliesCount={displayStatus.replies_count}
            reblogsCount={displayStatus.reblogs_count}
            favouritesCount={displayStatus.favourites_count}
            reblogged={displayStatus.reblogged}
            favourited={displayStatus.favourited}
            bookmarked={displayStatus.bookmarked}
            onReply={handleReply}
            onReblog={handleReblog}
            onConfirmReblog={confirmReblog}
            onQuote={handleQuote}
            onFavourite={handleFavourite}
            onBookmark={handleBookmark}
            onShare={handleShare}
          />
        )}
      </div>

      {/* Edit History */}
      {showEditHistory && displayStatus.edited_at && (
        <StatusEditHistory
          statusId={displayStatus.id}
          editedAt={displayStatus.edited_at}
        />
      )}
    </Card>
  );
}
