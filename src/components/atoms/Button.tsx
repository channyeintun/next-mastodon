import { type ButtonHTMLAttributes, type ReactNode, useRef } from 'react';
import { animate } from 'motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  children,
  isLoading = false,
  disabled,
  className,
  style,
  ...props
}: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handlePress = () => {
    if (buttonRef.current && !disabled && !isLoading) {
      animate(buttonRef.current, { scale: 0.95 }, { duration: 0.1 });
    }
  };

  const handleRelease = () => {
    if (buttonRef.current && !disabled && !isLoading) {
      animate(buttonRef.current, { scale: 1 }, { duration: 0.2, easing: [0.22, 1, 0.36, 1] });
    }
  };

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--size-2)',
    border: 'none',
    borderRadius: 'var(--radius-2)',
    fontWeight: 'var(--font-weight-6)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled || isLoading ? 0.6 : 1,
  };

  const sizeStyles = {
    small: {
      padding: 'var(--size-1) var(--size-3)',
      fontSize: 'var(--font-size-0)',
    },
    medium: {
      padding: 'var(--size-2) var(--size-4)',
      fontSize: 'var(--font-size-1)',
    },
    large: {
      padding: 'var(--size-3) var(--size-5)',
      fontSize: 'var(--font-size-2)',
    },
  };

  const variantStyles = {
    primary: {
      background: 'var(--blue-6)',
      color: 'white',
    },
    secondary: {
      background: 'var(--surface-3)',
      color: 'var(--text-1)',
      border: '1px solid var(--surface-4)',
    },
    danger: {
      background: 'var(--red-6)',
      color: 'white',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-2)',
    },
  };

  return (
    <button
      ref={buttonRef}
      {...props}
      disabled={disabled || isLoading}
      className={className}
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      onMouseDown={handlePress}
      onMouseUp={handleRelease}
      onMouseLeave={handleRelease}
    >
      {isLoading && <span className="spinner" style={{ width: '1em', height: '1em' }} />}
      {children}
    </button>
  );
}
