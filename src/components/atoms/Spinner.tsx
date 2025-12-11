import styled from '@emotion/styled';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

interface StyledSpinnerProps {
  $size: 'small' | 'medium' | 'large';
  $color?: string;
}

const StyledSpinner = styled.div<StyledSpinnerProps>`
  ${({ $size }) => {
    const sizeMap = {
      small: 'var(--size-4)',
      medium: 'var(--size-6)',
      large: 'var(--size-8)',
    };
    const dimension = sizeMap[$size];
    return `
      width: ${dimension};
      height: ${dimension};
    `;
  }}
  border-top-color: ${({ $color }) => $color || 'var(--blue-6)'};
`;

export function Spinner({ size = 'medium', color }: SpinnerProps) {
  return (
    <StyledSpinner
      className="spinner"
      $size={size}
      $color={color}
    />
  );
}
