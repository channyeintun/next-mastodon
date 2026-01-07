'use client';

import styled from '@emotion/styled';
import { useTranslations } from 'next-intl';
import {
  Heart,
  Repeat2,
  MessageCircle,
  MessageSquareQuote,
} from 'lucide-react';

interface PostActionsProps {
  repliesCount: number;
  reblogsCount: number;
  favouritesCount: number;
  reblogged?: boolean;
  favourited?: boolean;
  onReply: (e: React.MouseEvent) => void;
  onReblog: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onConfirmReblog: (e: React.MouseEvent) => void;
  onQuote: (e: React.MouseEvent) => void;
  onFavourite: (e: React.MouseEvent) => void;
}

const ICON_SIZE = 18;

/**
 * Presentation component for post action buttons
 * (reply, boost, favourite, bookmark, share).
 */
export function PostActions({
  repliesCount,
  reblogsCount,
  favouritesCount,
  reblogged = false,
  favourited = false,
  onReply,
  onReblog,
  onConfirmReblog,
  onQuote,
  onFavourite,
}: PostActionsProps) {
  const t = useTranslations('actions');
  return (
    <Container>
      {/* Reply */}
      <ActionGroup>
        <ActionButton onClick={onReply} title={t('reply')}>
          <MessageCircle size={ICON_SIZE} />
        </ActionButton>
        <Count>{repliesCount}</Count>
      </ActionGroup>

      {/* Boost with popover */}
      <ActionGroup>
        <BoostContainer className="boost-btn">
          <ActionButton
            onMouseDown={onReblog}
            $isActive={reblogged}
            $activeColor="var(--green-6)"
            title={reblogged ? 'Undo boost' : t('boost')}
          >
            <Repeat2 size={ICON_SIZE} />
          </ActionButton>
          <BoostPopover className="boost-popover">
            <PopoverButton onMouseDown={onConfirmReblog} $isActive={reblogged}>
              <Repeat2 size={ICON_SIZE} />
              <span>{reblogged ? 'Undo Boost' : t('boost')}</span>
            </PopoverButton>
            <PopoverButton onMouseDown={onQuote}>
              <MessageSquareQuote size={ICON_SIZE} />
              <span>{t('quote')}</span>
            </PopoverButton>
          </BoostPopover>
        </BoostContainer>
        <Count>{reblogsCount}</Count>
      </ActionGroup>

      {/* Favourite */}
      <ActionGroup>
        <ActionButton
          onClick={onFavourite}
          $isActive={favourited}
          $activeColor="var(--red-6)"
          title={favourited ? 'Unfavourite' : t('favourite')}
        >
          <Heart size={ICON_SIZE} fill={favourited ? 'currentColor' : 'none'} />
        </ActionButton>
        <Count>{favouritesCount}</Count>
      </ActionGroup>
    </Container>
  );
}


const Container = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-4);
  margin-top: var(--size-3);
  padding-top: var(--size-2);
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-1);
`;

const ActionButton = styled.button<{ $isActive?: boolean; $activeColor?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: ${({ $isActive, $activeColor }) => ($isActive && $activeColor ? $activeColor : 'var(--text-2)')};
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: var(--surface-3);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Count = styled.span`
  font-size: var(--font-size-1);
  color: var(--text-2);
  min-width: 16px;
`;

const BoostContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const BoostPopover = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: var(--size-2);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  border: 1px solid var(--surface-3);
  padding: var(--size-2);
  min-width: 150px;
  z-index: 50;
  gap: var(--size-1);
`;

const PopoverButton = styled.button<{ $isActive?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--size-2);
  padding: var(--size-2);
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${({ $isActive }) => ($isActive ? 'var(--green-6)' : 'var(--text-1)')};
  font-size: inherit;
  white-space: nowrap;
  transition: color 0.2s ease;
  box-shadow: none;

  &:hover {
    outline: 1px solid var(--surface-4);
    outline-offset: -1px;
  }
`;