'use client';

import { useRef, useMemo } from 'react';
import { SCROLL_ANCHOR_OFFSET } from '@/constants/layout';

import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useStatus, useStatusContext } from '@/api';
import { useAuthStore } from '@/hooks/useStores';
import { useScrollAnchor } from '@/hooks/useScrollAnchor';
import { useDynamicBottomSpacer } from '@/hooks/useDynamicBottomSpacer';
import { PostCard } from '@/components/organisms';
import { PostCardSkeleton, StatusStats } from '@/components/molecules';
import { Button, IconButton } from '@/components/atoms';
import { ComposerPanel } from '@/components/organisms/ComposerPanel';
import { useTimelineHotkeys } from '@/hooks/useTimelineHotkeys';
import { useTranslations } from 'next-intl';

interface StatusPageClientProps {
  statusId: string;
}

/**
 * Client component for the status/post detail page.
 * 
 * - SSR hydration: Status renders immediately from cache, context loads separately
 * - Client navigation: Status from prepopulated cache, context fetches
 */
export function StatusPageClient({ statusId }: StatusPageClientProps) {
  const t = useTranslations('statusDetail');
  const commonT = useTranslations('common');
  const {
    data: status,
    isLoading: statusLoading,
    isError: statusError,
    error: statusErrorData,
  } = useStatus(statusId);

  const { data: context } = useStatusContext(statusId);
  const authStore = useAuthStore();
  const router = useRouter();

  const ancestors = context?.ancestors ?? [];
  const descendants = context?.descendants ?? [];

  // Ancestors ref for Safari scroll anchoring polyfill
  const ancestorsRef = useRef<HTMLDivElement>(null);

  // Scroll to main post on load; CSS overflow-anchor keeps it stable when ancestors load
  // NOTE: Native scroll anchoring via overflow-anchor is not supported in Safari.
  const mainPostRef = useScrollAnchor({
    isReady: !!status && !statusLoading,
    key: statusId,
    ancestorsRef,
    deps: [ancestors.length],
  });

  // Dynamic spacer ensures scroll anchoring works by providing scrollable space below
  const { headerRef, contentBelowRef, spacerRef } = useDynamicBottomSpacer({
    anchorRef: mainPostRef,
    deps: [status, descendants.length, authStore.isAuthenticated],
  });

  const handlePostDeleted = () => router.push('/');

  const navigableStatuses = useMemo(() => {
    if (!status) return [];
    return [...ancestors, status, ...descendants];
  }, [ancestors, status, descendants]);

  const { focusedIndex } = useTimelineHotkeys({
    itemsCount: navigableStatuses.length,
    onOpen: (index: number) => {
      const targetStatus = navigableStatuses[index];
      if (targetStatus && targetStatus.id !== statusId) {
        router.push(`/status/${targetStatus.id}`);
      }
    },
    autoScroll: true,
  });

  // Only show skeleton if status is loading (not hydrated/cached)
  if (statusLoading) {
    return (
      <Container className="mobile-bottom-padding">
        <Header>
          <IconButton onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </IconButton>
          <Title>{t('title')}</Title>
        </Header>
        <div className="virtualized-list-container">
          <HighlightedPost>
            <PostCardSkeleton />
          </HighlightedPost>
        </div>
      </Container>
    );
  }

  if (statusError || !status) {
    return (
      <ErrorContainer>
        <ErrorTitle>{t('errorLoading')}</ErrorTitle>
        <ErrorMessage>
          {statusErrorData instanceof Error
            ? statusErrorData.message
            : t('failedLoadDesc')}
        </ErrorMessage>
        <Button onClick={() => router.back()}>{commonT('back')}</Button>
      </ErrorContainer>
    );
  }

  // Status is available - render immediately
  // Context may still be loading - show its own loading indicators

  return (
    <Container className="mobile-bottom-padding">
      {/* Sticky header */}
      <Header ref={headerRef}>
        <IconButton onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </IconButton>
        <Title>{t('title')}</Title>
      </Header>

      {/* Thread container */}
      <div className="virtualized-list-container">
        {/* Ancestors (parent posts) - excluded from scroll anchoring */}
        <AncestorsContainer ref={ancestorsRef}>
          {ancestors.length > 0 && (
            <>
              {ancestors.map((ancestor, index) => (
                <div key={ancestor.id} data-index={index}>
                  <PostCard
                    status={ancestor}
                    isFocused={focusedIndex === index}
                  />
                  <ThreadLineContainer>
                    <ThreadLine />
                  </ThreadLineContainer>
                </div>
              ))}
            </>
          )}
        </AncestorsContainer>

        {/* Main status (highlighted) - renders immediately from SSR/cache */}
        <HighlightedPost ref={mainPostRef} data-index={ancestors.length}>
          <PostCard
            id="main-post"
            status={status}
            showEditHistory
            onDeleteSuccess={handlePostDeleted}
            isFocused={focusedIndex === ancestors.length}
          />
          <StatusStatsWrapper>
            <StatusStats
              statusId={status.id}
              favouritesCount={status.favourites_count}
              reblogsCount={status.reblogs_count}
              quotesCount={status.quotes_count}
            />
          </StatusStatsWrapper>
        </HighlightedPost>

        {/* Content below main post - tracked for dynamic spacer calculation */}
        <ContentBelowMain ref={contentBelowRef}>
          {/* Reply Composer */}
          {authStore.isAuthenticated && (
            <ReplyComposerContainer>
              <ComposerPanel
                key={`reply-${status.id}`}
                initialVisibility={status.visibility}
                mentionPrefix={status.account.acct}
                inReplyToId={status.id}
                isReply
              />
            </ReplyComposerContainer>
          )}

          {/* Descendants (replies) */}
          {descendants.length > 0 && (
            <div>
              <RepliesHeader>
                {t('replies', { count: descendants.length })}
              </RepliesHeader>
              {descendants.map((descendant, index) => {
                const globalIndex = ancestors.length + 1 + index;
                return (
                  <div key={descendant.id} data-index={globalIndex}>
                    {index > 0 && (
                      <ThreadLineContainer>
                        <ThreadLineShort />
                      </ThreadLineContainer>
                    )}
                    <PostCard
                      status={descendant}
                      isFocused={focusedIndex === globalIndex}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </ContentBelowMain>

        {/* Dynamic bottom spacer ensures scroll anchoring works properly */}
        {/* Height calculated to allow main post to be scrolled to just below header */}
        <BottomSpacer ref={spacerRef} />
      </div>
    </Container>
  );
}

// Styled components
const Container = styled.div`
  max-width: 680px;
  margin: 0 auto;
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--surface-1);
  padding: var(--size-4);
  margin-bottom: var(--size-4);
  border-bottom: 1px solid var(--surface-3);
  display: flex;
  align-items: center;
  gap: var(--size-3);
`;

const Title = styled.h1`
  font-size: var(--font-size-4);
`;

const HighlightedPost = styled.div`
  margin-bottom: var(--size-3);
  /* Account for sticky header height when scrolling; coordinate with SCROLL_ANCHOR_OFFSET */
  scroll-margin-top: ${SCROLL_ANCHOR_OFFSET}px;
  /* Make this the preferred anchor for native scroll anchoring */
  overflow-anchor: auto;
`;

/* Exclude ancestors from being scroll anchors - main post should be the anchor */
const AncestorsContainer = styled.div`
  overflow-anchor: none;
`;

const StatusStatsWrapper = styled.div`
  padding: 0 var(--size-3);
`;

const RepliesHeader = styled.h2`
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--size-4);
  color: var(--text-2);
`;

const ThreadLineContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  padding-left: var(--size-5);
`;

const ThreadLine = styled.div`
  width: 2px;
  height: 32px;
  background: var(--surface-4);
  margin-left: 18px;
`;

const ThreadLineShort = styled.div`
  width: 2px;
  height: 24px;
  background: var(--surface-4);
  margin-left: 18px;
`;

const ReplyComposerContainer = styled.div`
  margin-bottom: var(--size-4);
  border: 1px solid var(--surface-3);
  border-radius: var(--radius-3);
  background: var(--surface-2);
  padding: var(--size-3);
`;

const ErrorContainer = styled.div`
  text-align: center;
  margin-top: var(--size-8);
`;

const ErrorTitle = styled.h2`
  color: var(--red-6);
  margin-bottom: var(--size-3);
`;

const ErrorMessage = styled.p`
  color: var(--text-2);
  margin-bottom: var(--size-4);
`;

/**
 * Wrapper for content below the main post.
 * Used to measure height for dynamic bottom spacer calculation.
 */
const ContentBelowMain = styled.div``;

/**
 * Dynamic bottom spacer ensures scroll anchoring works correctly.
 * Height is calculated dynamically based on viewport and content.
 * This allows the main post to always be positionable at the top of the viewport.
 */
const BottomSpacer = styled.div``;
