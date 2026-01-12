import styled from '@emotion/styled';
import { Button } from '@/components/atoms';

export const StyledIconButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-round);
`;

export const Menu = styled.div`
  position: absolute;
  background: var(--surface-2);
  border-radius: var(--radius-2);
  box-shadow: var(--shadow-3);
  overflow: hidden;
  min-width: 180px;
  border: 1px solid var(--surface-3);
`;

export const MenuItem = styled.button<{ $isDestructive?: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  width: 100%;
  padding: var(--size-2) var(--size-3);
  background: transparent;
  border: none;
  color: ${({ $isDestructive }) => ($isDestructive ? 'var(--red-6)' : 'var(--text-1)')};
  cursor: pointer;
  font-size: inherit;
  text-align: left;
  transition: color 0.2s ease;
  white-space: nowrap;
  box-shadow: none;

  &:hover {
    outline: 1px solid var(--surface-4);
    outline-offset: -1px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const IconButton = styled(Button)`
    display: flex;
    align-items: center;
    gap: var(--size-1);
`;

export const AvatarSkeleton = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    flex-shrink: 0;
`;

export const NameSkeleton = styled.div`
    width: 120px;
    height: 16px;
    margin-bottom: 4px;
`;

export const HandleSkeleton = styled.div`
    width: 80px;
    height: 14px;
`;

export const ButtonSkeleton = styled.div`
    width: 72px;
    height: 32px;
    border-radius: var(--radius-2);
`;
