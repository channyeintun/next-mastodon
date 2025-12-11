'use client';

import styled from '@emotion/styled';

const Container = styled.div`
  padding: var(--size-3);
  background: var(--surface-2);
  border-radius: var(--radius-3);
  display: flex;
  gap: var(--size-3);
`;

const IconPlaceholder = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
`;

const AvatarRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-2);
`;

const AvatarPlaceholder = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const NamePlaceholder = styled.div`
  height: 14px;
  width: 120px;
  border-radius: var(--radius-1);
`;

const TimePlaceholder = styled.div`
  height: 12px;
  width: 40px;
  border-radius: var(--radius-1);
  margin-left: auto;
`;

const ContentPlaceholder = styled.div`
  height: 40px;
  width: 100%;
  border-radius: var(--radius-2);
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
`;

/**
 * Skeleton loading placeholder for NotificationCard
 */
export function NotificationSkeleton() {
    return (
        <Container>
            {/* Icon placeholder */}
            <IconPlaceholder className="skeleton" />

            {/* Content */}
            <Content>
                {/* Avatar and name row */}
                <AvatarRow>
                    <AvatarPlaceholder className="skeleton" />
                    <NamePlaceholder className="skeleton" />
                    <TimePlaceholder className="skeleton" />
                </AvatarRow>

                {/* Content preview placeholder */}
                <ContentPlaceholder className="skeleton" />
            </Content>
        </Container>
    );
}

/**
 * Multiple skeleton items for loading state
 */
export function NotificationSkeletonList({ count = 5 }: { count?: number }) {
    return (
        <ListContainer>
            {Array.from({ length: count }).map((_, i) => (
                <NotificationSkeleton key={i} />
            ))}
        </ListContainer>
    );
}
