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
} from 'lucide-react';
import { Avatar, IconButton, EmojiText } from '@/components/atoms';
import { formatRelativeTime } from '@/utils/date';
import { useAccountStore } from '@/hooks/useStores';
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
}: PostHeaderProps) {
    const accountStore = useAccountStore();

    const handleProfileClick = () => {
        accountStore.cacheAccount(account);
    };

    return (
        <Container>
            <AvatarLink scroll={false} href={`/@${account.acct}`} onClick={handleProfileClick}>
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
                            <DisplayName>
                                <EmojiText
                                    text={account.display_name || account.username}
                                    emojis={account.emojis}
                                />
                            </DisplayName>
                            <Handle>
                                @{account.acct}
                            </Handle>
                        </ProfileLink>
                    </NameSection>

                    <MetaSection>
                        <TimeLink href={`/status/${statusId}`}>
                            {formatRelativeTime(createdAt)}
                        </TimeLink>
                        <VisibilityIcon title={visibility}>
                            {VISIBILITY_ICONS[visibility]}
                        </VisibilityIcon>
                        {isOwnPost && (
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
                                    {(visibility === 'public' || visibility === 'unlisted') && onPin && (
                                        <button
                                            className="options-menu-item"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onPin();
                                            }}
                                        >
                                            {pinned ? <PinOff size={16} /> : <Pin size={16} />}
                                            <span>{pinned ? 'Unpin from profile' : 'Pin on profile'}</span>
                                        </button>
                                    )}

                                    {/* Mute/Unmute Conversation */}
                                    {onMute && (
                                        <button
                                            className="options-menu-item"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onMute();
                                            }}
                                        >
                                            {muted ? <Volume2 size={16} /> : <VolumeX size={16} />}
                                            <span>{muted ? 'Unmute conversation' : 'Mute conversation'}</span>
                                        </button>
                                    )}

                                    <MenuDivider />

                                    {onEdit && (
                                        <button
                                            className="options-menu-item"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onEdit();
                                            }}
                                        >
                                            <Edit2 size={16} />
                                            <span>Edit status</span>
                                        </button>
                                    )}

                                    {onDelete && (
                                        <button
                                            className="options-menu-item danger"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onDelete();
                                            }}
                                        >
                                            <Trash2 size={16} />
                                            <span>Delete status</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Report option for other users' posts */}
                        {!isOwnPost && onReport && (
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
                                    <button
                                        className="options-menu-item danger"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onReport();
                                        }}
                                    >
                                        <Flag size={16} />
                                        <span>Report</span>
                                    </button>
                                </div>
                            </div>
                        )}
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

const DisplayName = styled.div`
  font-weight: var(--font-weight-6);
  color: var(--text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Handle = styled.div`
  font-size: var(--font-size-0);
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

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