import styled from '@emotion/styled';
import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  children: ReactNode;
  isLoading?: boolean;
}

interface StyledButtonProps {
  $variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  $size: 'small' | 'medium' | 'large';
  $isLoading: boolean;
}

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--size-2);
  border: none;
  /* Facebook: 8px radius, 600 weight, and labels that never wrap. */
  border-radius: var(--btn-radius);
  box-shadow: none;
  font-weight: var(--fw-semibold);
  white-space: nowrap;
  cursor: ${({ disabled, $isLoading }) => (disabled || $isLoading ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  opacity: ${({ disabled, $isLoading }) => (disabled || $isLoading ? 0.6 : 1)};

  /* Size styles */
  ${({ $size }) => {
    if ($size === 'small') {
      return `
        padding: var(--size-1) var(--size-3);
        font-size: var(--fs-secondary);
      `;
    }
    if ($size === 'large') {
      return `
        padding: var(--size-3) var(--size-5);
        font-size: var(--fs-body);
      `;
    }
    return `
      padding: var(--size-2) var(--size-4);
      font-size: var(--fs-secondary);
    `;
  }}

  /* Variant styles.
     Each variant declares its own hover/active surface rather than sharing a
     blanket opacity fade, which muddies text contrast as it dims. */
  ${({ $variant }) => {
    if ($variant === 'primary') {
      return `
        background: var(--accent);
        color: white;

        &:hover:not(:disabled) {
          background: var(--accent-hover);
        }
      `;
    }
    if ($variant === 'secondary') {
      return `
        background: var(--btn-secondary-bg);
        color: var(--text-1);

        &:hover:not(:disabled) {
          background: var(--btn-secondary-hover);
        }
      `;
    }
    if ($variant === 'danger') {
      return `
        background: var(--red-6);
        color: white;

        &:hover:not(:disabled) {
          background: var(--red-7);
        }
      `;
    }
    return `
      background: transparent;
      color: var(--secondary-text);

      &:hover:not(:disabled) {
        background: var(--hover-overlay);
        color: var(--text-1);
      }
    `;
  }}

  /* Press feedback. Scale is safe here because the transform does not
     participate in layout, so neighbouring buttons never shift. */
  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  /* Coarse pointers (touch) need a 44px target to hit reliably. Applied as a
     min-height so text-driven height still wins on larger buttons. */
  @media (pointer: coarse) {
    min-height: 44px;
  }

  @media (prefers-reduced-motion: reduce) {
    &:active:not(:disabled) {
      transform: none;
    }
  }
`;

const LoadingSpinner = styled.span`
  /* !important beats the global .spinner sizing, whose single-class specificity
     otherwise ties with Emotion's and resolves by stylesheet injection order. */
  width: 1em !important;
  height: 1em !important;
  flex-shrink: 0;
`;

export function Button({
  variant = 'primary',
  size = 'medium',
  children,
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <StyledButton
      {...props}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      $variant={variant}
      $size={size}
      $isLoading={isLoading}
    >
      {/* Decorative: aria-busy already announces the pending state, so the
          spinner would otherwise be read as a second, meaningless node. */}
      {isLoading && <LoadingSpinner className="spinner" aria-hidden="true" />}
      {children}
    </StyledButton>
  );
}
