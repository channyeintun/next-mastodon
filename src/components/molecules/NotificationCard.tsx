'use client';

import styled from '@emotion/styled';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Heart,
    Repeat2,
    MessageCircle,
    UserPlus,
    BarChart2,
    Edit2,
    Bell,
    X,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Avatar, Card, EmojiText, IconButton } from '@/components/atoms';
import { PostCard } from '@/components/organisms';
import { formatRelativeTime } from '@/utils/date';
import type { Notification, NotificationType } from '@/types';
import { useDismissNotification, queryKeys, prefillAccountCache } from '@/api';

interface NotificationCardProps {
    notification: Notification;
    onDismiss?: (id: string) => void;
    style?: React.CSSProperties;
    isNew?: boolean;
    isFocused?: boolean;
}

// Notification type configuration
const NOTIFICATION_CONFIG: Record<NotificationType, {
    icon: React.ReactNode;
    color: string;
    translationKey: string;
}> = {
    mention: {
        icon: <MessageCircle size={16} />,
        color: 'var(--blue-6)',
        translationKey: 'mention',
    },
    status: {
        icon: <Bell size={16} />,
        color: 'var(--purple-6)',
        translationKey: 'status',
    },
    reblog: {
        icon: <Repeat2 size={16} />,
        color: 'var(--green-6)',
        translationKey: 'reblog',
    },
    follow: {
        icon: <UserPlus size={16} />,
        color: 'var(--indigo-6)',
        translationKey: 'follow',
    },
    follow_request: {
        icon: <UserPlus size={16} />,
        color: 'var(--orange-6)',
        translationKey: 'follow_request',
    },
    favourite: {
        icon: <Heart size={16} />,
        color: 'var(--red-6)',
        translationKey: 'favourite',
    },
    poll: {
        icon: <BarChart2 size={16} />,
        color: 'var(--teal-6)',
        translationKey: 'poll',
    },
    update: {
        icon: <Edit2 size={16} />,
        color: 'var(--yellow-6)',
        translationKey: 'update',
    },
    quote: {
        icon: <MessageCircle size={16} />,
        color: 'var(--cyan-6)',
        translationKey: 'quote',
    },
    quoted_update: {
        icon: <Edit2 size={16} />,
        color: 'var(--yellow-6)',
        translationKey: 'quoted_update',
    },
    'admin.sign_up': {
        icon: <UserPlus size={16} />,
        color: 'var(--cyan-6)',
        translationKey: 'admin_sign_up',
    },
    'admin.report': {
        icon: <Bell size={16} />,
        color: 'var(--red-6)',
        translationKey: 'admin_report',
    },
    'severed_relationships': {
        icon: <Bell size={16} />,
        color: 'var(--orange-6)',
        translationKey: 'severed_relationships',
    },
    'moderation_warning': {
        icon: <Bell size={16} />,
        color: 'var(--red-6)',
        translationKey: 'moderation_warning',
    },
    'annual_report': {
        icon: <BarChart2 size={16} />,
        color: 'var(--purple-6)',
        translationKey: 'annual_report',
    },
};

export function NotificationCard({ notification, onDismiss, style, isNew, isFocused }: NotificationCardProps) {
    const router = useRouter();
    const dismissMutation = useDismissNotification();
    const queryClient = useQueryClient();
    const t = useTranslations('notifications.types');

    const config = NOTIFICATION_CONFIG[notification.type];
    const account = notification.account;
    const displayName = account.display_name || account.username;

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if clicking on interactive elements
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a')) {
            return;
        }

        // Navigate based on notification type
        if (notification.status) {
            // Pre-populate status cache before navigation
            queryClient.setQueryData(queryKeys.statuses.detail(notification.status.id), notification.status);
            router.push(`/status/${notification.status.id}`);
        } else {
            // Pre-populate account cache before navigation
            prefillAccountCache(queryClient, account);
            router.push(`/@${account.acct}`);
        }
    };

    const handleAccountClick = () => {
        // Pre-populate account cache before navigation
        prefillAccountCache(queryClient, account);
    };

    const handleDismiss = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dismissMutation.mutate(notification.id);
        onDismiss?.(notification.id);
    };

    const CardComponent = isNew ? NewCard : Card;

    return (
        <div style={style}>
            <CardComponent
                padding="medium"
                onClick={handleCardClick}
                className={isFocused ? 'is-focused' : ''}
            >
                <ContentWrapper>
                    {/* Notification type icon */}
                    <IconColumn>
                        <IconCircle $color={config.color}>
                            {config.icon}
                        </IconCircle>
                    </IconColumn>

                    {/* Content */}
                    <ContentColumn>
                        {/* Header with avatar, message, and time */}
                        <HeaderRow>
                            <AvatarLink
                                href={`/@${account.acct}`}
                                onClick={handleAccountClick}
                            >
                                <Avatar
                                    src={account.avatar}
                                    alt={displayName}
                                    size="small"
                                />
                            </AvatarLink>

                            <InfoWrapper>
                                <MessageText>
                                    {t.rich(config.translationKey, {
                                        count: 1,
                                        remainingCount: 0,
                                        name: () => (
                                            <AccountLink
                                                href={`/@${account.acct}`}
                                                onClick={handleAccountClick}
                                            >
                                                <EmojiText text={displayName} emojis={account.emojis} />
                                            </AccountLink>
                                        ),
                                        link: (chunks) => (
                                            <AccountLink
                                                href={`/@${account.acct}`}
                                                onClick={handleAccountClick}
                                            >
                                                {chunks}
                                            </AccountLink>
                                        )
                                    })}
                                </MessageText>
                                <TimeText>
                                    {formatRelativeTime(notification.created_at)}
                                </TimeText>
                            </InfoWrapper>

                            {/* Dismiss button */}
                            <DismissButton size="small" onClick={handleDismiss}>
                                <X size={14} />
                            </DismissButton>
                        </HeaderRow>
                    </ContentColumn>

                    {/* Status content rendered using PostCard - spans 2 columns on mobile */}
                    {notification.status && (
                        <StatusContent>
                            <PostCard
                                status={notification.status}
                                hideActions
                                hideMedia
                                hideOptions
                                depth={1}
                            />
                        </StatusContent>
                    )}
                </ContentWrapper>
            </CardComponent>
        </div>
    );
}

// Styled components
const ContentWrapper = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: var(--size-3);
`;

const IconColumn = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--size-2);
`;

const IconCircle = styled.div<{ $color: string }>`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: color-mix(in srgb, ${props => props.$color} 20%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
`;

const ContentColumn = styled.div`
    flex: 1;
    min-width: 0;
`;

const StatusContent = styled.div`
    grid-column: 2;
    margin-top: var(--size-2);

    @media (max-width: 767px) {
        grid-column: span 2;
    }
`;

const HeaderRow = styled.div`
    display: flex;
    align-items: flex-start;
    gap: var(--size-2);
    margin-bottom: var(--size-2);
`;

const AvatarLink = styled(Link)`
    flex-shrink: 0;
`;

const InfoWrapper = styled.div`
    flex: 1;
    min-width: 0;
`;

const MessageText = styled.div`
    font-size: var(--font-size-1);
    color: var(--text-1);
    line-height: 1.4;
`;

const AccountLink = styled(Link)`
    text-decoration: none;
    color: var(--text-1);
    font-weight: var(--font-weight-6);
`;


const TimeText = styled.div`
    font-size: var(--font-size-0);
    color: var(--text-3);
    margin-top: var(--size-1);
`;

const DismissButton = styled(IconButton)`
    opacity: 0.6;
`;

const NewCard = styled(Card)`
    border-left: 3px solid var(--blue-6);
    background: color-mix(in srgb, var(--blue-6) 5%, var(--surface-2));
`;
