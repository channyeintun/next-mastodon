'use client';

import styled from '@emotion/styled';

/**
 * Skeleton loading placeholder for GroupedNotificationCard
 * Matches the actual card structure: icon column, content column with header row, and status content
 */
export function NotificationSkeleton() {
  return (
    <Container>
      <ContentWrapper>
        {/* Icon column */}
        <IconColumn>
          <IconPlaceholder className="skeleton" />
        </IconColumn>

        {/* Content column */}
        <ContentColumn>
          {/* Header row with avatars, message, time */}
          <HeaderRow>
            {/* Stacked avatars */}
            <AvatarsWrapper>
              <AvatarPlaceholder className="skeleton" />
              <AvatarPlaceholder className="skeleton" style={{ marginLeft: '-8px' }} />
            </AvatarsWrapper>

            {/* Message and time */}
            <InfoWrapper>
              <MessagePlaceholder className="skeleton" />
              <TimePlaceholder className="skeleton" />
            </InfoWrapper>
          </HeaderRow>
        </ContentColumn>

        {/* Status content placeholder - spans grid */}
        <StatusContentPlaceholder className="skeleton" />
      </ContentWrapper>
    </Container>
  );
}

/**
 * Multiple skeleton items for loading state
 */
export function NotificationSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <ListContainer>
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </ListContainer>
  );
}

const Container = styled.div`
    padding: var(--size-3);
    background: var(--surface-2);
    border-radius: var(--radius-3);
`;

const ContentWrapper = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: var(--size-3);
`;

const IconColumn = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const IconPlaceholder = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
`;

const ContentColumn = styled.div`
    flex: 1;
    min-width: 0;
`;

const HeaderRow = styled.div`
    display: flex;
    align-items: flex-start;
    gap: var(--size-2);
    margin-bottom: var(--size-2);
`;

const AvatarsWrapper = styled.div`
    display: flex;
    align-items: center;
    margin-right: var(--size-2);
`;

const AvatarPlaceholder = styled.div`
    width: 28px;
    height: 28px;
    border-radius: 50%;
    flex-shrink: 0;
    border: 2px solid var(--surface-2);
`;

const InfoWrapper = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--size-1);
`;

const MessagePlaceholder = styled.div`
    height: 16px;
    width: 180px;
    border-radius: var(--radius-1);
`;

const TimePlaceholder = styled.div`
    height: 12px;
    width: 50px;
    border-radius: var(--radius-1);
`;

const StatusContentPlaceholder = styled.div`
    grid-column: 2;
    height: 80px;
    border-radius: var(--radius-2);
    margin-top: var(--size-2);

    @media (max-width: 767px) {
        grid-column: span 2;
    }
`;

const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--size-2);
`;