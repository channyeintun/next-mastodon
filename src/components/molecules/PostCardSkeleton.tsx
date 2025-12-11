'use client';

import styled from '@emotion/styled';
import { Card } from '../atoms/Card';

interface PostCardSkeletonProps {
  style?: React.CSSProperties;
}

const Container = styled.div`
  display: flex;
  gap: var(--size-3);
`;

const AvatarSkeleton = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--surface-3);
  flex-shrink: 0;
  animation: var(--animation-blink);
`;

const ContentContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

const HeaderSection = styled.div`
  margin-bottom: var(--size-3);
`;

const DisplayNameSkeleton = styled.div`
  width: 40%;
  height: 20px;
  background: var(--surface-3);
  border-radius: var(--radius-1);
  margin-bottom: var(--size-1);
  animation: var(--animation-blink);
`;

const UsernameSkeleton = styled.div`
  width: 30%;
  height: 16px;
  background: var(--surface-3);
  border-radius: var(--radius-1);
  animation: var(--animation-blink);
`;

const TextSection = styled.div`
  margin-bottom: var(--size-3);
`;

const TextLine = styled.div<{ $width: string; $hasMargin?: boolean }>`
  width: ${({ $width }) => $width};
  height: 16px;
  background: var(--surface-3);
  border-radius: var(--radius-1);
  animation: var(--animation-blink);
  margin-bottom: ${({ $hasMargin }) => ($hasMargin ? 'var(--size-2)' : 0)};
`;

const ActionBar = styled.div`
  display: flex;
  gap: var(--size-4);
  margin-top: var(--size-3);
`;

const ActionItem = styled.div`
  width: 32px;
  height: 24px;
  background: var(--surface-3);
  border-radius: var(--radius-1);
  animation: var(--animation-blink);
`;

/**
 * Skeleton loading placeholder for PostCard
 */
export function PostCardSkeleton({ style }: PostCardSkeletonProps) {
  return (
    <Card padding="medium" style={style}>
      <Container>
        {/* Avatar skeleton */}
        <AvatarSkeleton />

        <ContentContainer>
          {/* Header skeleton */}
          <HeaderSection>
            <DisplayNameSkeleton />
            <UsernameSkeleton />
          </HeaderSection>

          {/* Content skeleton */}
          <TextSection>
            <TextLine $width="100%" $hasMargin />
            <TextLine $width="90%" $hasMargin />
            <TextLine $width="70%" />
          </TextSection>

          {/* Action bar skeleton */}
          <ActionBar>
            {[1, 2, 3, 4].map((i) => (
              <ActionItem key={i} />
            ))}
          </ActionBar>
        </ContentContainer>
      </Container>
    </Card>
  );
}

/**
 * Multiple skeleton cards for initial loading
 */
export function PostCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} style={{ marginBottom: 'var(--size-3)' }} />
      ))}
    </>
  );
}
