import styled from '@emotion/styled';
import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

interface StyledBadgeProps {
  $variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

const StyledBadge = styled.span<StyledBadgeProps>`
  display: inline-flex;
  align-items: center;
  padding: var(--size-1) var(--size-2);
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-6);
  border-radius: var(--radius-2);

  ${({ $variant }) => {
    if ($variant === 'primary') {
      return `
        background: var(--blue-2);
        color: var(--blue-9);
      `;
    }
    if ($variant === 'secondary') {
      return `
        background: var(--gray-2);
        color: var(--gray-9);
      `;
    }
    if ($variant === 'success') {
      return `
        background: var(--green-2);
        color: var(--green-9);
      `;
    }
    if ($variant === 'warning') {
      return `
        background: var(--orange-2);
        color: var(--orange-9);
      `;
    }
    return `
      background: var(--red-2);
      color: var(--red-9);
    `;
  }}
`;

export function Badge({ children, variant = 'primary' }: BadgeProps) {
  return (
    <StyledBadge $variant={variant}>
      {children}
    </StyledBadge>
  );
}
