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
    <div
      className={`skeleton-text ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style
      }}
      aria-label="Loading..."
      role="status"
    />
  );
};
