import styled from '@emotion/styled';
import type { CSSProperties } from 'react';

interface CircleSkeletonProps {
  /** Size of the circle skeleton (default: var(--size-7)) */
  size?: string;
  /** Additional inline styles */
  style?: CSSProperties;
}

const Skeleton = styled.div<{ $size: string }>`
  width: ${props => props.$size};
  height: ${props => props.$size};
  border-radius: 50%;
  background: var(--surface-3);
  animation: var(--animation-blink);
`;

/**
 * CircleSkeleton - A circular skeleton loader
 *
 * Used for loading states of circular UI elements like icon buttons,
 * avatars, or other round components.
 *
 * @example
 * ```tsx
 * <CircleSkeleton size="var(--size-7)" />
 * <CircleSkeleton size="48px" />
 * ```
 */
export const CircleSkeleton = ({ size = 'var(--size-7)', style }: CircleSkeletonProps) => {
  return (
    <Skeleton
      $size={size}
      style={style}
      aria-label="Loading..."
      role="status"
    />
  );
};
