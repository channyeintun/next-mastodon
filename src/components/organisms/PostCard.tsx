'use client';

import styled from '@emotion/styled';
import { useState } from 'react';
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
  MediaModal,
  TranslateButton,
  ReportModal,
} from '@/components/molecules';
import type { Status, Translation } from '@/types';
import { usePostActions } from '@/hooks/usePostActions';
import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { removeQuotePrefix } from '@/utils/fp';
import { CSSProperties } from 'react';
import Link from 'next/link';

// Max nesting level for quoted posts (matching Mastodon's behavior)
const MAX_QUOTE_NESTING_LEVEL = 1;

interface PostCardProps {
  status: Status;
  style?: CSSProperties;
  hideActions?: boolean;
  /** Hide media attachments and link previews */
  hideMedia?: boolean;
  /** Hide the options menu (three dots) in the header */
  hideOptions?: boolean;
  showEditHistory?: boolean;
  onDeleteSuccess?: () => void;
  id?: string;
  /** Current nesting depth for quote posts (internal use) */
  depth?: number;
  /** Wrapstodon mode: transparent bg with light text colors for dark gradient */
  wrapstodon?: boolean;
}

/**
 * Organism component for displaying a Mastodon status/post.
 * Orchestrates molecules and uses usePostActions hook for logic.
 */
export function PostCard({
  status,
  style,
  hideActions = false,
  hideMedia = false,
  hideOptions = false,
  showEditHistory = false,
  onDeleteSuccess,
  id,
  depth = 0,
  wrapstodon = false,
}: PostCardProps) {
  const { openModal, closeModal } = useGlobalModal();

  const handleDeleteClick = (postId: string) => {
    openModal(
      <DeletePostModal
        postId={postId}
        onClose={closeModal}
        onSuccess={onDeleteSuccess}
      />
    );
  };

  const handleMediaClick = (index: number) => (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    openModal(
      <MediaModal
        mediaAttachments={displayStatus.media_attachments}
        initialIndex={index}
        onClose={closeModal}
      />
    );
  };

  const handleReportClick = () => {
    openModal(
      <ReportModal
        account={displayStatus.account}
        status={displayStatus}
        onClose={closeModal}
      />
    );
  };

  const actions = usePostActions(status, handleDeleteClick);

  // Translation state - content to display when translated
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);

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
  const contentToDisplay = displayStatus.quote?.quoted_status
    ? removeQuotePrefix(displayStatus.content)
    : displayStatus.content;

  // Use translated content if available
  const displayContent = translatedContent ?? contentToDisplay;

  const handleTranslated = (translation: Translation) => {
    setTranslatedContent(translation.content);
  };

  const handleShowOriginal = () => {
    setTranslatedContent(null);
  };

  const cardStyle: CSSProperties = wrapstodon
    ? {
      ...(style || {}),
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      color: '#fff',
      '--text-1': '#fff',
      '--text-2': 'rgba(255, 255, 255, 0.8)',
      '--text-3': 'rgba(255, 255, 255, 0.6)',
      '--link': '#a78bfa',
    } as CSSProperties
    : (style || {});

  return (
    <Card as="article" padding="medium" style={cardStyle} onClick={handleCardClick} id={id}>
      {/* Reblog indicator */}
      {isReblog && <ReblogIndicator account={status.account} />}

      {/* Post header and content */}
      <PostContent>
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
          isOwnPost={hideOptions ? false : isOwnPost}
          pinned={displayStatus.pinned}
          muted={displayStatus.muted}
          onEdit={!hideOptions && isOwnPost ? handleEdit : undefined}
          onDelete={!hideOptions && isOwnPost ? handleDelete : undefined}
          onPin={
            !hideOptions &&
              isOwnPost &&
              (displayStatus.visibility === 'public' ||
                displayStatus.visibility === 'unlisted')
              ? handlePin
              : undefined
          }
          onMute={hideOptions ? undefined : handleMuteConversation}
          onReport={!hideOptions && !isOwnPost ? handleReportClick : undefined}
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
          displayContent && (
            <StyledStatusContent
              html={displayContent}
              emojis={displayStatus.emojis}
            />
          )}

        {/* Translation button */}
        {(!hasContentWarning || showCWContent) && (
          <TranslationContainer>
            <TranslateButton
              status={displayStatus}
              onTranslated={handleTranslated}
              onShowOriginal={handleShowOriginal}
            />
          </TranslationContainer>
        )}

        {/* Media attachments */}
        {!hideMedia &&
          (!hasContentWarning || showCWContent) &&
          displayStatus.media_attachments.length > 0 && (
            <MediaContainer>
              <MediaGrid
                $columns={displayStatus.media_attachments.length === 1 ? 1 : 2}
                $blurred={!!(hasSensitiveMedia && !showCWMedia)}
              >
                {displayStatus.media_attachments.map((media, index) => (
                  <MediaItem
                    key={media.id}
                    onClick={handleMediaClick(index)}
                    $clickable={!(hasSensitiveMedia && !showCWMedia)}
                  >
                    {media.type === 'image' && media.preview_url && (
                      <MediaImage
                        src={media.preview_url}
                        alt={media.description || ''}
                      />
                    )}
                    {media.type === 'video' && media.url && (
                      <MediaVideo src={media.url} controls playsInline />
                    )}
                    {media.type === 'gifv' && media.url && (
                      <MediaVideo src={media.url} autoPlay loop muted playsInline />
                    )}
                  </MediaItem>
                ))}
              </MediaGrid>

              {/* Sensitive content overlay */}
              {hasSensitiveMedia && !showCWMedia && (
                <SensitiveOverlay>
                  <SensitiveContentButton onClick={toggleCWMedia} />
                </SensitiveOverlay>
              )}
            </MediaContainer>
          )}

        {/* Link preview */}
        {!hideMedia &&
          (!hasContentWarning || showCWContent) &&
          displayStatus.card &&
          displayStatus.media_attachments.length === 0 && (
            <StyledLinkPreview card={displayStatus.card} wrapstodon={wrapstodon} />
          )}

        {/* Quoted status */}
        {(!hasContentWarning || showCWContent) &&
          displayStatus.quote?.state === 'accepted' &&
          displayStatus.quote.quoted_status && (
            <QuotedPostWrapper>
              {depth < MAX_QUOTE_NESTING_LEVEL ? (
                <PostCard
                  status={displayStatus.quote.quoted_status}
                  hideActions
                  depth={depth + 1}
                  style={{ boxShadow: 'inset 0 4px 8px -4px rgba(0, 0, 0, 0.15)' }}
                />
              ) : (
                <NestedQuoteLink href={`/status/${displayStatus.quote.quoted_status.id}`}>
                  Quoted a post by @{displayStatus.quote.quoted_status.account.acct}
                </NestedQuoteLink>
              )}
            </QuotedPostWrapper>
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
      </PostContent>

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

// Styled components
const PostContent = styled.div`
  margin-bottom: var(--size-3);
`;

const StyledStatusContent = styled(StatusContent)`
  margin-top: var(--size-3);
`;

const MediaContainer = styled.div`
  margin-top: var(--size-3);
  position: relative;
`;

const MediaGrid = styled.div<{ $columns: number; $blurred: boolean }>`
  display: grid;
  grid-template-columns: ${props => props.$columns === 1 ? '1fr' : 'repeat(2, 1fr)'};
  gap: var(--size-2);
  border-radius: var(--radius-2);
  overflow: hidden;
  filter: ${props => props.$blurred ? 'blur(32px)' : 'none'};
  transition: filter 0.2s ease;
`;

const MediaItem = styled.div<{ $clickable?: boolean }>`
  position: relative;
  aspect-ratio: 16/9;
  background: var(--surface-3);
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: opacity 0.2s;

  &:hover {
    opacity: ${props => props.$clickable ? '0.9' : '1'};
  }
`;

const MediaImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const MediaVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const SensitiveOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-2);
`;

const StyledLinkPreview = styled(LinkPreview)`
  margin-top: var(--size-3);
`;

const QuotedPostWrapper = styled.div``;

const NestedQuoteLink = styled(Link)`
  display: block;
  padding: var(--size-2) var(--size-3);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  color: var(--text-2);
  font-size: var(--font-size-1);
  text-decoration: none;
  
  &:hover {
    background: var(--surface-3);
    color: var(--text-1);
  }
`;

const TranslationContainer = styled.div`
  margin-top: var(--size-2);
  padding-top: var(--size-2);
`;
