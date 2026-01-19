'use client';

import styled from '@emotion/styled';
import Link from 'next/link';
import {
    Globe,
    Lock,
    Users,
    Mail,
    MoreHorizontal,
    Trash2,
    Edit2,
    Pin,
    PinOff,
    Volume2,
    VolumeX,
    Flag,
    Bookmark,
    Share,
    UserX,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Avatar, IconButton, EmojiText } from '@/components/atoms';
import { formatRelativeTime } from '@/utils/date';
import { prefillAccountCache } from '@/api';
import type { Account } from '@/types';

type Visibility = 'public' | 'unlisted' | 'private' | 'direct';

interface PostHeaderProps {
    account: Account;
    createdAt: string;
    visibility: Visibility;
    statusId: string;
    isOwnPost: boolean;
    pinned?: boolean;
    muted?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onPin?: () => void;
    onMute?: () => void;
    onReport?: () => void;
    onBookmark?: (e: React.MouseEvent) => void;
    onShare?: (e: React.MouseEvent) => void;
    onBlock?: () => void;
    bookmarked?: boolean;
}

const VISIBILITY_ICONS = {
    public: <Globe size={14} />,
    unlisted: <Lock size={14} />,
    private: <Users size={14} />,
    direct: <Mail size={14} />,
};

/**
 * Presentation component for post author header with avatar,
 * display name, handle, timestamp, visibility, and options menu.
 */
export function PostHeader({
    account,
    createdAt,
    visibility,
    statusId,
    isOwnPost,
    pinned = false,
    muted = false,
    onEdit,
    onDelete,
    onPin,
    onMute,
    onReport,
    onBookmark,
    onShare,
    onBlock,
    bookmarked = false,
}: PostHeaderProps) {
    const queryClient = useQueryClient();
    const tActions = useTranslations('actions');
    const tCommon = useTranslations('common');


    const handleProfileClick = () => {
        // Pre-populate account cache before navigation to avoid refetch
        prefillAccountCache(queryClient, account);
    };

    return (
        <Container>
            <AvatarLink href={`/@${account.acct}`} onClick={handleProfileClick}>
                <Avatar
                    src={account.avatar}
                    alt={account.display_name || account.username}
                    size="medium"
                />
            </AvatarLink>

            <ContentSection>
                <HeaderRow>
                    <NameSection>
                        <ProfileLink href={`/@${account.acct}`} onClick={handleProfileClick}>
                            <div className="post-header-display-name text-truncate">
                                <EmojiText
                                    text={account.display_name || account.username}
                                    emojis={account.emojis}
                                />
                            </div>
                            <div className="post-header-handle text-truncate">
                                @{account.acct}
                            </div>
                        </ProfileLink>
                    </NameSection>

                    <MetaSection>
                        <TimeLink href={`/status/${statusId}`}>
                            {formatRelativeTime(createdAt)}
                        </TimeLink>
                        <VisibilityIcon title={visibility}>
                            {VISIBILITY_ICONS[visibility]}
                        </VisibilityIcon>
                        <div className="options-menu-btn">
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.currentTarget.focus();
                                }}
                            >
                                <MoreHorizontal size={16} />
                            </IconButton>

                            <div className="options-menu-popover">
                                {/* Pin/Unpin - Only for own public/unlisted posts */}
                                {isOwnPost && (visibility === 'public' || visibility === 'unlisted') && onPin && (
                                    <button
                                        className="options-menu-item"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onPin();
                                        }}
                                    >
                                        {pinned ? <PinOff size={16} /> : <Pin size={16} />}
                                        <span>{pinned ? tActions('unpin') : tActions('pin')}</span>
                                    </button>
                                )}

                                {/* Mute/Unmute Conversation - Visible for all posts */}
                                {onMute && (
                                    <button
                                        className="options-menu-item"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onMute();
                                        }}
                                    >
                                        {muted ? <Volume2 size={16} /> : <VolumeX size={16} />}
                                        <span>{muted ? tActions('unmuteConversation') : tActions('muteConversation')}</span>
                                    </button>
                                )}

                                {onBookmark && (
                                    <button
                                        className="options-menu-item"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onBookmark(e);
                                        }}
                                    >
                                        <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
                                        <span>{bookmarked ? tActions('removeBookmark') : tActions('bookmark')}</span>
                                    </button>
                                )}

                                {onShare && (
                                    <button
                                        className="options-menu-item"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onShare(e);
                                        }}
                                    >
                                        <Share size={16} />
                                        <span>{tCommon('share')}</span>
                                    </button>
                                )}


                                {isOwnPost && (onEdit || onDelete) && <MenuDivider />}

                                {isOwnPost && onEdit && (
                                    <button
                                        className="options-menu-item"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onEdit();
                                        }}
                                    >
                                        <Edit2 size={16} />
                                        <span>{tActions('editStatus')}</span>
                                    </button>
                                )}

                                {isOwnPost && onDelete && (
                                    <button
                                        className="options-menu-item danger"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onDelete();
                                        }}
                                    >
                                        <Trash2 size={16} />
                                        <span>{tActions('deleteStatus')}</span>
                                    </button>
                                )}

                                {!isOwnPost && (onBlock || onReport) && <MenuDivider />}

                                {!isOwnPost && onBlock && (
                                    <button
                                        className="options-menu-item danger"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onBlock();
                                        }}
                                    >
                                        <UserX size={16} />
                                        <span>{tActions('blockAccount', { acct: account.acct })}</span>
                                    </button>
                                )}

                                {!isOwnPost && onReport && (
                                    <button
                                        className="options-menu-item danger"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onReport();
                                        }}
                                    >
                                        <Flag size={16} />
                                        <span>{tCommon('report')}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </MetaSection>
                </HeaderRow>
            </ContentSection>
        </Container>
    );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-2);
`;

const AvatarLink = styled(Link)`
  text-decoration: none;
  flex-shrink: 0;
`;

const ContentSection = styled.div`
  flex: 1;
  min-width: 0;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
`;

const NameSection = styled.div`
  min-width: 0;
`;

const ProfileLink = styled(Link)`
  text-decoration: none;
`;

/* DisplayName and Handle moved to globals.css as .post-header-display-name and .post-header-handle */

const MetaSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  flex-shrink: 0;
`;

const TimeLink = styled(Link)`
  text-decoration: none;
  font-size: var(--font-size-0);
  color: var(--text-2);
`;

const VisibilityIcon = styled.div`
  color: var(--text-3);
  display: flex;
  align-items: center;
`;

const MenuDivider = styled.div`
  height: 1px;
  background: var(--surface-3);
  margin: 4px 0;
`;