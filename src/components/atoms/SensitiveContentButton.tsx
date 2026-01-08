import styled from '@emotion/styled';
import { useTranslations } from 'next-intl';

const Button = styled.button<{ $isHovered: boolean }>`
  padding: var(--size-3) var(--size-4);
  background: ${props => props.$isHovered ? 'var(--surface-3)' : 'var(--surface-2)'};
  border: 2px solid ${props => props.$isHovered ? 'var(--blue-6)' : 'var(--surface-4)'};
  border-radius: var(--radius-2);
  color: var(--text-1);
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--size-2);
  box-shadow: var(--shadow-3);
  transition: all 0.2s ease;

  &:hover {
    background: var(--surface-3);
    border-color: var(--blue-6);
  }
`;

interface SensitiveContentButtonProps {
  onClick: (e: React.MouseEvent) => void;
  label?: string;
}

export function SensitiveContentButton({
  onClick,
  label,
}: SensitiveContentButtonProps) {
  const t = useTranslations('media');
  return (
    <Button
      $isHovered={false}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(e);
      }}
    >
      {label || t('sensitive')}
    </Button>
  );
}
