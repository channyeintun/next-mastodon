import styled from '@emotion/styled';
import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'primary' | 'danger';
}

interface StyledIconButtonProps {
  $size: 'small' | 'medium' | 'large';
  $variant: 'default' | 'primary' | 'danger';
}

const StyledIconButton = styled.button<StyledIconButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  /* Size styles */
  ${({ $size }) => {
    const sizeMap = {
      small: 'var(--size-5)',
      medium: 'var(--size-7)',
      large: 'var(--size-9)',
    };
    const dimension = sizeMap[$size];
    return `
      width: ${dimension};
      height: ${dimension};
    `;
  }}

  /* Variant styles.
     Hover shifts the surface instead of fading opacity — dimming a filled
     button lowers icon contrast against the page exactly when the user is
     aiming at it. */
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
      color: var(--secondary-icon);

      &:hover:not(:disabled) {
        background: var(--hover-overlay);
        color: var(--primary-icon);
      }
    `;
  }}

  &:active:not(:disabled) {
    transform: scale(0.92);
  }

  &:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  @media (prefers-reduced-motion: reduce) {
    &:active:not(:disabled) {
      transform: none;
    }
  }
`;

export function IconButton({
  children,
  size = 'medium',
  variant = 'default',
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <StyledIconButton
      {...props}
      disabled={disabled}
      $size={size}
      $variant={variant}
    >
      {children}
    </StyledIconButton>
  );
}
