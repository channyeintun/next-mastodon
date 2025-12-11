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
  border-radius: var(--radius-2);
  font-weight: var(--font-weight-6);
  cursor: ${({ disabled, $isLoading }) => (disabled || $isLoading ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  opacity: ${({ disabled, $isLoading }) => (disabled || $isLoading ? 0.6 : 1)};

  /* Size styles */
  ${({ $size }) => {
    if ($size === 'small') {
      return `
        padding: var(--size-1) var(--size-3);
        font-size: var(--font-size-0);
      `;
    }
    if ($size === 'large') {
      return `
        padding: var(--size-3) var(--size-5);
        font-size: var(--font-size-2);
      `;
    }
    return `
      padding: var(--size-2) var(--size-4);
      font-size: var(--font-size-1);
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
    if ($variant === 'secondary') {
      return `
        background: var(--surface-3);
        color: var(--text-1);
        border: 1px solid var(--surface-4);
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
`;

const LoadingSpinner = styled.span`
  width: 1em;
  height: 1em;
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
      $variant={variant}
      $size={size}
      $isLoading={isLoading}
    >
      {isLoading && <LoadingSpinner className="spinner" />}
      {children}
    </StyledButton>
  );
}
