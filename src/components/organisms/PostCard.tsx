'use client';

import { useState } from 'react';
import { Card, SensitiveContentButton } from '@/components/atoms';
import {
  StatusEditHistory,
  ReblogIndicator,
  StatusThreadLabel,
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
import { usePostCardHotkeys } from '@/hooks/usePostCardHotkeys';
import { removeQuotePrefix } from '@/utils/fp';
import { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { QuotedStatusSection } from './QuotedStatusSection';
import {
  PostContent,
  StyledStatusContent,
  MediaContainer,
  MediaGrid,
  MediaItemWrapper,
  MediaItem,
  MediaItemInner,
  MediaImage,
  SensitiveOverlay,
  StyledLinkPreview,
  TranslationContainer,
  BlurredBackground,
} from './postCardStyles';

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
  isFocused?: boolean;
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
  isFocused = false,
}: PostCardProps) {
  const { openModal, closeModal } = useGlobalModal();
  const t = useTranslations('statusDetail');

  const handleDeleteClick = (postId: string) => {
    openModal(
      <DeletePostModal
        postId={postId}
        onClose={closeModal}
        onSuccess={onDeleteSuccess}
      />
    );
  };

  const handleMediaClick = (index: number) => (e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation(); // Prevent card click
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
    handleBlockAccount,
  } = actions;

  // Post-specific keyboard actions
  usePostCardHotkeys({
    isFocused,
    handleReply,
    handleFavourite,
    handleReblog,
    handleQuote,
    displayStatus,
    hasContentWarning: !!hasContentWarning,
    toggleCWContent,
    hasSensitiveMedia: !!hasSensitiveMedia,
    toggleCWMedia,
    handleMediaClick,
    confirmReblog,
  });

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
    : {
      border: depth > 0 ? '1px solid var(--surface-3)' : 'none',
      boxShadow: depth > 0 ? 'var(--shadow-1)' : 'none',
      ...(style || {}),
    };
  // No longer using JS-based color extraction due to CORS issues
  const singleMedia = displayStatus.media_attachments.length === 1 ? displayStatus.media_attachments[0] : null;

  return (
    <Card
      as="article"
      padding="medium"
      style={{
        ...cardStyle,
        outline: isFocused ? '2px solid var(--blue-6)' : 'none',
        outlineOffset: '-2px',
        transition: 'outline 0.2s ease',
      }}
      onClick={handleCardClick}
      id={id}
      className={`post-card ${isFocused ? 'is-focused' : ''}`}
      data-post-id={displayStatus.id}
    >
      {/* Reblog indicator */}
      {isReblog && <ReblogIndicator account={status.account} />}
      {!isReblog && <StatusThreadLabel status={displayStatus} />}

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
        <QuotedStatusSection
          displayStatus={displayStatus}
          depth={depth}
          t={t}
          showCWContent={showCWContent}
          hasContentWarning={!!hasContentWarning}
        />

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
