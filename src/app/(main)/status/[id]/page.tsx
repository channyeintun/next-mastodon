'use client';

import styled from '@emotion/styled';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useStatus, useStatusContext } from '@/api';
import { useAuthStore } from '@/hooks/useStores';
import { PostCard } from '@/components/organisms';
import { PostCardSkeleton } from '@/components/molecules';
import { Button, IconButton, TextSkeleton } from '@/components/atoms';
import { ComposerPanel } from '@/components/organisms/ComposerPanel';

export default function StatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
    data: status,
    isLoading: statusLoading,
    isError: statusError,
    error: statusErrorData,
  } = useStatus(id);

  const {
    data: context,
    isLoading: contextLoading,
    isError: contextError,
  } = useStatusContext(id);

  const authStore = useAuthStore();
  const router = useRouter();

  const isLoading = statusLoading || contextLoading;
  const isError = statusError || contextError;

  if (isLoading) {
    return (
      <Container>
        {/* Header */}
        <Header>
          <IconButton onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </IconButton>
          <Title>Post</Title>
        </Header>

        {/* Skeleton loading */}
        <div>
          {/* Main post skeleton with highlight border */}
          <HighlightedPost>
            <PostCardSkeleton />
          </HighlightedPost>

          {/* Replies section skeleton */}
          <RepliesHeader>
            <TextSkeleton width="120px" height="20px" />
          </RepliesHeader>
          <SkeletonWrapper>
            <PostCardSkeleton />
          </SkeletonWrapper>
          <SkeletonWrapper>
            <PostCardSkeleton />
          </SkeletonWrapper>
        </div>
      </Container>
    );
  }

  if (isError || !status) {
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
      <div>
        {/* Ancestors (parent posts) */}
        {ancestors.length > 0 && (
          <div>
            {ancestors.map((ancestor) => (
              <div key={ancestor.id}>
                <PostCard status={ancestor} />
                {/* Thread line connector */}
                <ThreadLineContainer>
                  <ThreadLine />
                </ThreadLineContainer>
              </div>
            ))}
          </div>
        )}

        {/* Main status (highlighted) */}
        <HighlightedPost>
          <PostCard status={status} showEditHistory={true} />
        </HighlightedPost>

        {/* Reply Composer - Comment Box Style */}
        {authStore.isAuthenticated && (
          <ReplyComposerContainer>
            <ComposerPanel
              key={`reply-${status.id}`}
              initialVisibility={status.visibility}
              initialContent={`<span data-type="mention" class="mention" data-id="${status.account.acct}" data-label="${status.account.acct}">@${status.account.acct}</span> `}
              inReplyToId={status.id}
              isReply={true}
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
                {/* Thread line connector */}
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
  max-width: 600px;
  margin: 0 auto;
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  background: var(--surface-1);
  z-index: 10;
  padding: var(--size-4) 0;
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
  border: 2px solid var(--blue-6);
  border-radius: var(--radius-3);
  overflow: hidden;
  margin-bottom: var(--size-3);
`;

const RepliesHeader = styled.h2`
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--size-4);
  color: var(--text-2);
`;

const SkeletonWrapper = styled.div`
  margin-bottom: var(--size-3);
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
