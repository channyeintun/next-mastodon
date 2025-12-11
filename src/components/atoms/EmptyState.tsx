import styled from '@emotion/styled';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--size-8) var(--size-4);
  text-align: center;
  color: var(--text-2);
`;

const IconContainer = styled.div`
  font-size: var(--font-size-6);
  margin-bottom: var(--size-4);
  opacity: 0.5;
`;

const Title = styled.h3<{ $hasDescription: boolean }>`
  margin: 0;
  font-size: var(--font-size-3);
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: ${({ $hasDescription }) => ($hasDescription ? 'var(--size-2)' : 0)};
`;

const Description = styled.p`
  margin: 0;
  font-size: var(--font-size-1);
  max-width: 400px;
`;

const ActionContainer = styled.div`
  margin-top: var(--size-4);
`;

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Container>
      {icon && (
        <IconContainer>
          {icon}
        </IconContainer>
      )}

      <Title $hasDescription={!!description}>
        {title}
      </Title>

      {description && (
        <Description>
          {description}
        </Description>
      )}

      {action && (
        <ActionContainer>
          {action}
        </ActionContainer>
      )}
    </Container>
  );
}
