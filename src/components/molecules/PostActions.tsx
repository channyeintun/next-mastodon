'use client';

import styled from '@emotion/styled';
import {
    Heart,
    Repeat2,
    MessageCircle,
    Bookmark,
    Share,
    MessageSquareQuote,
} from 'lucide-react';
import { IconButton } from '@/components/atoms';

interface PostActionsProps {
    repliesCount: number;
    reblogsCount: number;
    favouritesCount: number;
    reblogged?: boolean;
    favourited?: boolean;
    bookmarked?: boolean;
    onReply: (e: React.MouseEvent) => void;
    onReblog: (e: React.MouseEvent<HTMLButtonElement>) => void;
    onConfirmReblog: (e: React.MouseEvent) => void;
    onQuote: (e: React.MouseEvent) => void;
    onFavourite: (e: React.MouseEvent) => void;
    onBookmark: (e: React.MouseEvent) => void;
    onShare: (e: React.MouseEvent) => void;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-1);
  margin-top: var(--size-3);
`;

const Count = styled.span`
  font-size: var(--font-size-0);
  color: var(--text-2);
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
  box-shadow: var(--shadow-4);
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
  border-radius: var(--radius-2);
  cursor: pointer;
  color: ${({ $isActive }) => ($isActive ? 'var(--green-6)' : 'var(--text-1)')};
  font-size: var(--font-size-1);
  white-space: nowrap;
  transition: background 0.2s ease;

  &:hover {
    background: var(--surface-3);
  }
`;

const RightActions = styled.div`
  margin-left: auto;
  display: flex;
  gap: var(--size-1);
`;

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
    bookmarked = false,
    onReply,
    onReblog,
    onConfirmReblog,
    onQuote,
    onFavourite,
    onBookmark,
    onShare,
}: PostActionsProps) {
    return (
        <Container>
            {/* Reply */}
            <IconButton
                size="small"
                onClick={onReply}
                title="Reply"
            >
                <MessageCircle size={16} />
            </IconButton>
            <Count>{repliesCount}</Count>

            {/* Boost with popover */}
            <BoostContainer className="boost-btn">
                <IconButton
                    size="small"
                    onClick={onReblog}
                    style={{
                        color: reblogged ? 'var(--green-6)' : undefined
                    }}
                    title={reblogged ? 'Undo boost' : 'Boost'}
                >
                    <Repeat2 size={16} />
                </IconButton>
                <BoostPopover className="boost-popover">
                    <PopoverButton onClick={onConfirmReblog} $isActive={reblogged}>
                        <Repeat2 size={16} />
                        <span>{reblogged ? 'Undo Boost' : 'Boost'}</span>
                    </PopoverButton>
                    <PopoverButton onClick={onQuote}>
                        <MessageSquareQuote size={16} />
                        <span>Quote</span>
                    </PopoverButton>
                </BoostPopover>
            </BoostContainer>
            <Count>{reblogsCount}</Count>

            {/* Favourite */}
            <IconButton
                size="small"
                onClick={onFavourite}
                style={{
                    color: favourited ? 'var(--red-6)' : undefined
                }}
                title={favourited ? 'Unfavourite' : 'Favourite'}
            >
                <Heart size={16} fill={favourited ? 'currentColor' : 'none'} />
            </IconButton>
            <Count>{favouritesCount}</Count>

            {/* Right side actions */}
            <RightActions>
                <IconButton
                    size="small"
                    onClick={onBookmark}
                    style={{
                        color: bookmarked ? 'var(--blue-6)' : undefined
                    }}
                    title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                >
                    <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
                </IconButton>

                <IconButton
                    size="small"
                    onClick={onShare}
                    title="Share"
                >
                    <Share size={16} />
                </IconButton>
            </RightActions>
        </Container>
    );
}
