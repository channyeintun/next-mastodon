import type { CSSProperties } from 'react';

interface CircleSkeletonProps {
  /** Size of the circle skeleton (default: var(--size-7)) */
  size?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  /** Additional CSS class names */
  className?: string;
}

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
export const CircleSkeleton = ({ size = 'var(--size-7)', style, className = '' }: CircleSkeletonProps) => {
  return (
    <div
      className={`skeleton-circle ${className}`}
      style={{
        width: size,
        height: size,
        ...style
      }}
      aria-label="Loading..."
      role="status"
    />
  );
};
