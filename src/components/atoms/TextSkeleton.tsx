import styled from '@emotion/styled';
import type { CSSProperties } from 'react';

interface TextSkeletonProps {
  /** Width of the skeleton (default: 100px) */
  width?: string | number;
  /** Height of the skeleton (default: 1em) */
  height?: string | number;
  /** Additional inline styles */
  style?: CSSProperties;
  /** Additional CSS class names */
  className?: string;
}

const Skeleton = styled.div<{ $width: string | number; $height: string | number }>`
  width: ${props => typeof props.$width === 'number' ? `${props.$width}px` : props.$width};
  height: ${props => typeof props.$height === 'number' ? `${props.$height}px` : props.$height};
  background: var(--surface-3);
  border-radius: var(--radius-1);
  animation: var(--animation-blink);
`;

/**
 * TextSkeleton - A rectangular skeleton loader for text content
 *
 * Used for loading states of text elements like headings, labels,
 * paragraphs, or any rectangular content placeholders.
 *
 * @example
 * ```tsx
 * <TextSkeleton width="150px" height="24px" />
 * <TextSkeleton width={100} height={14} />
 * ```
 */
export const TextSkeleton = ({
  width = '100px',
  height = '1em',
  style,
  className = '',
}: TextSkeletonProps) => {
  return (
    <Skeleton
      $width={width}
      $height={height}
      className={className}
      style={style}
      aria-label="Loading..."
      role="status"
    />
  );
};
