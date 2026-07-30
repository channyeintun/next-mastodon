'use client';

import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
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

// Facebook's action-bar glyphs are 20px.
const ICON_SIZE = 20;

/**
 * Returns a counter that increments whenever `active` flips false -> true,
 * used as an animation `key` to replay the celebration effect.
 *
 * Deliberately ignores the value present on mount. Timelines here are
 * virtualized, so cards mount and unmount as they scroll through the viewport;
 * animating the incoming value would make every already-favourited post in the
 * feed burst as it scrolled into view.
 */
function useActivationCount(active: boolean): number {
  const [count, setCount] = useState(0);
  const previous = useRef(active);

  useEffect(() => {
    if (active && !previous.current) {
      setCount((current) => current + 1);
    }
    previous.current = active;
  }, [active]);

  return count;
}

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
  const favouriteBursts = useActivationCount(favourited);
  const reblogBursts = useActivationCount(reblogged);

  return (
    <Container>
      {/* Reply */}
      <ActionGroup>
        <ActionButton
          onClick={onReply}
          title={t('reply')}
          aria-label={t('reply')}
          $accent="var(--blue-6)"
        >
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
            $accent="var(--green-6)"
            aria-pressed={reblogged}
            title={reblogged ? t('undoBoost') : t('boost')}
            aria-label={reblogged ? t('undoBoost') : t('boost')}
          >
            <SpinIcon key={reblogBursts} $animate={reblogBursts > 0}>
              <Repeat2 size={ICON_SIZE} />
            </SpinIcon>
          </ActionButton>
          <BoostPopover className="boost-popover">
            <PopoverButton onMouseDown={onConfirmReblog} $isActive={reblogged}>
              <Repeat2 size={ICON_SIZE} />
              <span>{reblogged ? t('undoBoost') : t('boost')}</span>
            </PopoverButton>
            <PopoverButton onMouseDown={onQuote}>
              <MessageSquareQuote size={ICON_SIZE} />
              <span>{t('quote')}</span>
            </PopoverButton>
          </BoostPopover>
        </BoostContainer>
        <Count $isActive={reblogged} $accent="var(--green-6)">
          {reblogsCount}
        </Count>
      </ActionGroup>

      {/* Favourite */}
      <ActionGroup>
        <ActionButton
          onClick={onFavourite}
          $isActive={favourited}
          $accent="var(--red-6)"
          aria-pressed={favourited}
          title={favourited ? t('unfavourite') : t('favourite')}
          aria-label={favourited ? t('unfavourite') : t('favourite')}
        >
          {/* Remounted via key so the CSS animation replays on every re-favourite */}
          <PopIcon key={favouriteBursts} $animate={favouriteBursts > 0}>
            <Heart size={ICON_SIZE} fill={favourited ? 'currentColor' : 'none'} />
          </PopIcon>
          {favouriteBursts > 0 && (
            <Burst key={`burst-${favouriteBursts}`} aria-hidden="true" />
          )}
        </ActionButton>
        <Count $isActive={favourited} $accent="var(--red-6)">
          {favouritesCount}
        </Count>
      </ActionGroup>
    </Container>
  );
}


/**
 * Facebook's action row: 44px tall, padded 0 4px. No rule above it — their feed
 * posts run the actions straight under the text.
 */
const Container = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  min-height: 44px;
  margin-top: var(--size-2);
  padding-inline: 4px;
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-1);
`;

const ActionButton = styled.button<{ $isActive?: boolean; $accent?: string }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* 44x32, matching Facebook — wider than tall, so the hover surface reads as
     a control rather than a dot. */
  width: 44px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: var(--btn-radius);
  /* Open Props' buttons.min.css puts a drop shadow on every <button>. It was
     invisible on the old 50% circle but outlines a rounded rect at this radius,
     and Facebook's action buttons carry no shadow at all. */
  box-shadow: none;
  background: transparent;
  color: ${({ $isActive, $accent }) => ($isActive && $accent ? $accent : 'var(--secondary-icon)')};
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  /* Each action carries its own hue on hover — reply blue, boost green,
     favourite red — so the row reads as three distinct verbs rather than three
     identical grey circles, and intent is legible before the click. */
  &:hover {
    background: ${({ $accent }) =>
    ($accent
      ? `color-mix(in oklab, ${$accent} 14%, transparent)`
      : 'var(--surface-3)')};
    color: ${({ $accent }) => $accent ?? 'var(--text-1)'};
  }

  &:focus-visible {
    outline: var(--focus-ring-width) solid
      ${({ $accent }) => $accent ?? 'var(--focus-ring-color)'};
    outline-offset: 1px;
  }

  &:active {
    transform: scale(0.95);
  }

  /* 32px is under the 44px touch minimum, so grow the box on coarse pointers.
     The row is already 44px tall, so this changes nothing structurally. */
  @media (pointer: coarse) {
    height: 44px;
  }

  @media (prefers-reduced-motion: reduce) {
    &:active {
      transform: none;
    }
  }
`;

/* Squash before the pop: anticipation is what makes the tap feel physical
   rather than like a plain scale-up. */
const pop = keyframes`
  0% { scale: 1; }
  22% { scale: 0.82; }
  52% { scale: 1.28; }
  76% { scale: 0.96; }
  100% { scale: 1; }
`;

const spin = keyframes`
  0% { rotate: 0deg; scale: 1; }
  45% { rotate: 200deg; scale: 1.16; }
  100% { rotate: 360deg; scale: 1; }
`;

const burst = keyframes`
  0% { scale: 0.45; opacity: 0.7; }
  100% { scale: 1.9; opacity: 0; }
`;

const PopIcon = styled.span<{ $animate: boolean }>`
  display: inline-flex;
  animation: ${({ $animate }) => ($animate ? pop : 'none')} 420ms var(--ease-3);
`;

const SpinIcon = styled.span<{ $animate: boolean }>`
  display: inline-flex;
  animation: ${({ $animate }) => ($animate ? spin : 'none')} 480ms var(--ease-3);
`;

/* Ring that radiates out of the heart on activation. pointer-events: none so it
   can never intercept a rapid second click (un-favourite). */
const Burst = styled.span`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--red-6);
  pointer-events: none;
  animation: ${burst} 520ms var(--ease-3) forwards;

  /* Decorative only — the state change is conveyed by colour, fill and
     aria-pressed, so suppressing it costs no information. */
  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
`;

const Count = styled.span<{ $isActive?: boolean; $accent?: string }>`
  font-size: var(--fs-secondary);
  color: ${({ $isActive, $accent }) => ($isActive && $accent ? $accent : 'var(--secondary-text)')};
  font-variant-numeric: tabular-nums;
  transition: color 0.2s ease;
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
