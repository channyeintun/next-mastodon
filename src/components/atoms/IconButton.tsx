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

  /* Variant styles */
  ${({ $variant }) => {
    if ($variant === 'primary') {
      return `
        background: var(--blue-6);
        color: white;
      `;
    }
    if ($variant === 'danger') {
      return `
        background: var(--red-6);
        color: white;
      `;
    }
    return `
      background: transparent;
      color: var(--text-2);
    `;
  }}

  &:hover:not(:disabled) {
    opacity: 0.8;
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
