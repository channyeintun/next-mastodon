import styled from '@emotion/styled'
import type { CSSProperties } from 'react'
import { CircleSkeleton } from '../atoms/CircleSkeleton'
import { TextSkeleton } from '../atoms/TextSkeleton'

interface ConversationCardSkeletonProps {
  /** Additional inline styles */
  style?: CSSProperties
}

/**
 * ConversationCardSkeleton - Loading skeleton for ConversationCard component
 *
 * Displays a skeleton loader matching the ConversationCard layout with avatar,
 * name, timestamp, and message preview placeholders.
 *
 * @example
 * ```tsx
 * <ConversationCardSkeleton />
 * <ConversationCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />
 * ```
 */
export const ConversationCardSkeleton = ({ style }: ConversationCardSkeletonProps) => {
  return (
    <SkeletonListItem style={style}>
      <AvatarWrapper>
        <CircleSkeleton size="var(--size-10)" />
      </AvatarWrapper>

      <ContentWrapper>
        <TopRow>
          <NameSkeleton width="40%" height="var(--font-size-2)" />
          <TimestampSkeleton width="60px" height="var(--font-size-0)" />
        </TopRow>

        <PreviewSkeleton width="70%" height="var(--font-size-1)" />
      </ContentWrapper>
    </SkeletonListItem>
  )
}

// Styled components matching ConversationCard layout
const SkeletonListItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-3);
  padding: var(--size-3) var(--size-4);
  margin: var(--size-2) var(--size-3);
  background: var(--surface-2);
  border-radius: 8px;
  box-shadow: var(--shadow-1);
`

const AvatarWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`

const ContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--size-2);
`

const NameSkeleton = styled(TextSkeleton)``

const TimestampSkeleton = styled(TextSkeleton)``

const PreviewSkeleton = styled(TextSkeleton)`
  margin-top: 2px;
`
