import { type CSSProperties, type ReactNode, forwardRef, type ElementType } from 'react';

interface CardProps {
  children: ReactNode;
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: CSSProperties;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  as?: ElementType;
  id?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, padding = 'medium', style, className, onClick, as: Component = 'div', id },
  ref
) {
  const paddingMap = {
    none: '0',
    small: 'var(--size-2)',
    medium: 'var(--size-4)',
    large: 'var(--size-6)',
  };

  const cardStyle: CSSProperties = {
    background: 'var(--surface-2)',
    borderRadius: 'var(--radius-3)',
    padding: paddingMap[padding],
    transition: 'all 0.2s ease',
    cursor: onClick ? 'pointer' : 'default',
    scrollMarginTop: 'calc(var(--size-4) * 2 + var(--size-9) + 1px)',
    ...style,
  };

  return (
    <Component
      ref={ref}
      id={id}
      style={cardStyle}
      className={className}
      onClick={onClick}
    >
      {children}
    </Component>
  );
});
