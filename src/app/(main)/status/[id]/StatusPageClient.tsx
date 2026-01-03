'use client';

import styled from '@emotion/styled';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useStatus, useStatusContext } from '@/api';
import { useAuthStore } from '@/hooks/useStores';
import { PostCard } from '@/components/organisms';
import { PostCardSkeleton, StatusStats } from '@/components/molecules';
import { Button, IconButton } from '@/components/atoms';
import { ComposerPanel } from '@/components/organisms/ComposerPanel';

interface StatusPageClientProps {
  /** The status ID */
  statusId: string;
}

/**
 * Client component for the status/post detail page.
 * Uses TanStack Query for data fetching.
 * 
 * For SSR hydration: Status renders immediately (from cache), context loads separately.
 * For client navigation: Status from prepopulated cache, context fetches.
 * 
 * This ensures no flash of loading skeleton when status data is already available.
 */
export function StatusPageClient({ statusId }: StatusPageClientProps) {
  // Separate queries for status and context
  // This allows status to render immediately from cache while context loads
  const {
    data: status,
    isLoading: statusLoading,
    isError: statusError,
    error: statusErrorData,
  } = useStatus(statusId);

  const { data: context } = useStatusContext(statusId);

  const authStore = useAuthStore();
  const router = useRouter();

  // Handle deletion of the current post - redirect to home
  const handlePostDeleted = () => {
    router.push('/');
  };

  // Scroll to main post after status loads (don't wait for context)
  useEffect(() => {
    if (status && !statusLoading) {
      const mainPost = document.getElementById('main-post');
      if (mainPost) {
        setTimeout(() => {
          mainPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [status, statusLoading]);

  // Only show skeleton if status is loading (not hydrated/cached)
  if (statusLoading) {
    return (
      <Container>
        <Header>
          <IconButton onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </IconButton>
          <Title>Post</Title>
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
        <ErrorTitle>Error Loading Post</ErrorTitle>
        <ErrorMessage>
          {statusErrorData instanceof Error
            ? statusErrorData.message
            : 'This post could not be found or loaded.'}
        </ErrorMessage>
        <Button onClick={() => router.back()}>Go Back</Button>
      </ErrorContainer>
    );
  }

  // Status is available - render immediately
  // Context may still be loading - show its own loading indicators
  const ancestors = context?.ancestors ?? [];
  const descendants = context?.descendants ?? [];

  return (
    <Container>
      {/* Header */}
      <Header>
        <IconButton onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </IconButton>
        <Title>Post</Title>
      </Header>

      {/* Thread container */}
      <div className="virtualized-list-container">
        {/* Ancestors (parent posts) */}
        {ancestors.length > 0 && (
          <div>
            {ancestors.map((ancestor) => (
              <div key={ancestor.id}>
                <PostCard status={ancestor} />
                <ThreadLineContainer>
                  <ThreadLine />
                </ThreadLineContainer>
              </div>
            ))}
          </div>
        )}

        {/* Main status (highlighted) - renders immediately from SSR/cache */}
        <HighlightedPost>
          <PostCard
            id="main-post"
            status={status}
            showEditHistory
            onDeleteSuccess={handlePostDeleted}
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
              Replies ({descendants.length})
            </RepliesHeader>
            {descendants.map((descendant, index) => (
              <div key={descendant.id}>
                {index > 0 && (
                  <ThreadLineContainer>
                    <ThreadLineShort />
                  </ThreadLineContainer>
                )}
                <PostCard status={descendant} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state for no replies */}
        {descendants.length === 0 && (
          <EmptyState>
            <p>No replies yet.</p>
            <EmptySubtext>Be the first to reply!</EmptySubtext>
          </EmptyState>
        )}
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
  background: var(--surface-1);
  z-index: 10;
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

const EmptyState = styled.div`
  text-align: center;
  padding: var(--size-8) var(--size-4);
  color: var(--text-2);
  display: grid;
  justify-content: center;
`;

const EmptySubtext = styled.p`
  font-size: var(--font-size-0);
  margin-top: var(--size-2);
`;
