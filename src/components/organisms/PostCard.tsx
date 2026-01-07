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
  FeedVideoPlayer,
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
  /** Whether the post content can be collapsed with "See more" */
  collapsible?: boolean;
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
  collapsible = true,
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
    handleBlockAccount, // Added this destructured action
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
  // No longer using JS-based color extraction due to CORS issues
  const singleMedia = displayStatus.media_attachments.length === 1 ? displayStatus.media_attachments[0] : null;

  return (
    <Card as="article" padding="medium" style={cardStyle} onClick={handleCardClick} id={id} className="post-card">
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
          onBookmark={!hideOptions ? handleBookmark : undefined}
          onShare={!hideOptions ? handleShare : undefined}
          onBlock={!hideOptions && !isOwnPost ? handleBlockAccount : undefined}
          bookmarked={displayStatus.bookmarked}
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
              mentions={displayStatus.mentions}
              collapsible={collapsible}
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
            <MediaContainer
              onClick={singleMedia ? handleMediaClick(0) : undefined}
              $clickable={!!singleMedia}
            >
              {/* Dynamic Blurred Background for single media */}
              {singleMedia && (
                <BlurredBackground
                  $url={singleMedia.type === 'video' || singleMedia.type === 'gifv'
                    ? (singleMedia.preview_url || '')
                    : (singleMedia.url || singleMedia.preview_url || '')
                  }
                />
              )}
              <MediaGrid
                $columns={displayStatus.media_attachments.length === 1 ? 1 : 2}
                $count={displayStatus.media_attachments.length}
                $blurred={!!(hasSensitiveMedia && !showCWMedia)}
              >
                {displayStatus.media_attachments.map((media, index) => {
                  const isSingleMedia = displayStatus.media_attachments.length === 1;
                  const isVideo = media.type === 'video';
                  const isGifv = media.type === 'gifv';
                  const aspectRatio = media.meta?.original?.aspect || (media.meta?.small?.aspect) || 1.777;

                  return (
                    <MediaItemWrapper
                      key={media.id}
                      $singleMedia={isSingleMedia}
                      $isVideo={isVideo}
                      $aspectRatio={aspectRatio}
                      $index={index}
                      $total={displayStatus.media_attachments.length}
                    >
                      {isVideo ? (
                        <div onClick={handleMediaClick(index)}>
                          <FeedVideoPlayer
                            src={media.url || ''}
                            poster={media.preview_url ?? undefined}
                            aspectRatio={aspectRatio}
                            autoPlay={false}
                          />
                        </div>
                      ) : (
                        <MediaItem
                          onClick={handleMediaClick(index)}
                          $clickable={!(hasSensitiveMedia && !showCWMedia)}
                          $singleMedia={isSingleMedia}
                          $isSpanned={displayStatus.media_attachments.length === 3 && index === 0}
                        >
                          <MediaItemInner $singleMedia={isSingleMedia}>
                            {media.type === 'image' && (media.url || media.preview_url) && (
                              <MediaImage
                                $singleMedia={isSingleMedia}
                                src={media.url || media.preview_url || ''}
                                alt={media.description || ''}
                                loading="eager"
                                width={media.meta?.original?.width}
                                height={media.meta?.original?.height}
                                style={isSingleMedia ? { aspectRatio: `${aspectRatio}` } : undefined}
                              />
                            )}
                            {isGifv && media.url && (
                              <FeedVideoPlayer
                                src={media.url}
                                poster={media.preview_url ?? undefined}
                                autoPlay={true}
                                loop={true}
                                muted={true}
                                showControls={false}
                              />
                            )}
                          </MediaItemInner>
                        </MediaItem>
                      )}
                    </MediaItemWrapper>
                  );
                })}
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
            onReply={handleReply}
            onReblog={handleReblog}
            onConfirmReblog={confirmReblog}
            onQuote={handleQuote}
            onFavourite={handleFavourite}
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

const MediaContainer = styled.div<{ $clickable?: boolean }>`
  margin-top: var(--size-3);
  margin-inline: calc(-1 * var(--size-4));
  position: relative;
  overflow: hidden;
  background: #252527;
  max-height: 550px;
  display: flex;
  justify-content: center;
  transition: background-color 0.3s ease;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};

  ${props => props.$clickable && `
    &:hover {
      & > div:first-of-type {
        filter: blur(60px) brightness(0.85) saturate(1.6);
      }
    }
  `}
`;

const MediaGrid = styled.div<{ $columns: number; $count: number; $blurred: boolean }>`
  display: grid;
  grid-template-columns: ${props => props.$columns === 1 ? '1fr' : 'repeat(2, 1fr)'};
  ${props => props.$columns === 1 && 'justify-items: center;'}
  ${props => props.$count === 3 && `
    grid-template-rows: repeat(2, 1fr);
  `}
  gap: 2px;
  width: 100%;
  filter: ${props => props.$blurred ? 'blur(32px)' : 'none'};
  transition: filter 0.2s ease;
`;

// Single media wrapper - controls the responsive width like Facebook
const MediaItemWrapper = styled.div<{ $singleMedia?: boolean; $isVideo?: boolean; $aspectRatio?: number; $index?: number; $total?: number }>`
  max-width: 100%;
  min-width: ${props => props.$singleMedia ? 'min(440px, 100%)' : 'auto'};
  width: ${props => props.$singleMedia ?
    (props.$isVideo ? '100%' : (props.$aspectRatio ? `min(100%, calc(${props.$aspectRatio} * 550px))` : '100%')) :
    'auto'};
  
  ${props => props.$total === 3 && props.$index === 0 && `
    grid-row: span 2;
  `}
`;

const MediaItem = styled.div<{ $clickable?: boolean; $singleMedia?: boolean; $isSpanned?: boolean }>`
  position: relative;
  width: 100%;
  ${props => !props.$singleMedia && !props.$isSpanned && 'aspect-ratio: 16/9;'}
  ${props => props.$isSpanned && 'height: 100%;'}
  background: ${props => props.$singleMedia ? 'transparent' : '#252527'};
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: opacity 0.2s;

  &:hover {
    opacity: ${props => props.$clickable ? '0.9' : '1'};
  }
`;

const MediaItemInner = styled.div<{ $singleMedia?: boolean }>`
  width: 100%;
  height: 100%;
`;

const MediaImage = styled.img<{ $singleMedia?: boolean }>`
  display: block;
  max-width: 100%;
  max-height: 550px;
  ${props => props.$singleMedia ? `
    width: 100%;
    height: auto;
    object-fit: contain;
  ` : `
    width: 100%;
    height: 100%;
    object-fit: cover;
  `}
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

const BlurredBackground = styled.div<{ $url: string }>`
  position: absolute;
  top: -20%;
  left: -20%;
  right: -20%;
  bottom: -20%;
  background-image: url(${props => props.$url});
  background-size: cover;
  background-position: center;
  filter: blur(60px) brightness(0.7) saturate(1.4);
  opacity: 0.6;
  z-index: 0;
  pointer-events: none;
`;

