import styled from '@emotion/styled';
import type { CSSProperties } from 'react';

interface ImageSkeletonProps {
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Aspect ratio (e.g., '16/9', '1', '4/3') */
  aspectRatio?: string;
  /** Border radius (default: var(--radius-2)) */
  borderRadius?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  /** Additional CSS class names */
  className?: string;
}

const Skeleton = styled.div<{
  $width?: string | number;
  $height?: string | number;
  $aspectRatio?: string;
  $borderRadius: string;
}>`
  width: ${props => props.$width ? (typeof props.$width === 'number' ? `${props.$width}px` : props.$width) : 'auto'};
  height: ${props => props.$height ? (typeof props.$height === 'number' ? `${props.$height}px` : props.$height) : 'auto'};
  aspect-ratio: ${props => props.$aspectRatio || 'auto'};
  background: var(--surface-3);
  border-radius: ${props => props.$borderRadius};
  animation: var(--animation-blink);
`;

/**
 * ImageSkeleton - A skeleton loader for images and media content
 *
 * Used for loading states of images, videos, or any media placeholders.
 * Supports aspect ratio for responsive layouts.
 *
 * @example
 * ```tsx
 * <ImageSkeleton aspectRatio="1" />
 * <ImageSkeleton width="100px" height="100px" />
 * <ImageSkeleton aspectRatio="16/9" borderRadius="var(--radius-3)" />
 * ```
 */
export const ImageSkeleton = ({
  width,
  height,
  aspectRatio,
  borderRadius = 'var(--radius-2)',
  style,
  className = '',
}: ImageSkeletonProps) => {
  return (
    <Skeleton
      $width={width}
      $height={height}
      $aspectRatio={aspectRatio}
      $borderRadius={borderRadius}
      className={className}
      style={style}
      aria-label="Loading image..."
      role="status"
    />
  );
};
