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
import { Avatar, Card, EmojiText, IconButton } from '@/components/atoms';
import { PostCard } from '@/components/organisms';
import { formatRelativeTime } from '@/utils/date';
import type { NotificationGroup, Account, PartialAccountWithAvatar, Status, NotificationType } from '@/types';
import { useDismissNotificationGroup } from '@/api';

interface GroupedNotificationCardProps {
    group: NotificationGroup;
    accounts: Map<string, Account | PartialAccountWithAvatar>;
    statuses: Map<string, Status>;
    isNew?: boolean;
    style?: React.CSSProperties;
}

// Notification type configuration
const NOTIFICATION_CONFIG: Record<NotificationType, {
    icon: React.ReactNode;
    color: string;
    getMessage: (count: number, firstName: string) => string;
}> = {
    mention: {
        icon: <MessageCircle size={16} />,
        color: 'var(--blue-6)',
        getMessage: (_count, name) => `${name} mentioned you`,
    },
    status: {
        icon: <Bell size={16} />,
        color: 'var(--purple-6)',
        getMessage: (_count, name) => `${name} posted`,
    },
    reblog: {
        icon: <Repeat2 size={16} />,
        color: 'var(--green-6)',
        getMessage: (count, name) => count > 1
            ? `${name} and ${count - 1} other${count > 2 ? 's' : ''} boosted your post`
            : `${name} boosted your post`,
    },
    follow: {
        icon: <UserPlus size={16} />,
        color: 'var(--indigo-6)',
        getMessage: (count, name) => count > 1
            ? `${name} and ${count - 1} other${count > 2 ? 's' : ''} followed you`
            : `${name} followed you`,
    },
    follow_request: {
        icon: <UserPlus size={16} />,
        color: 'var(--orange-6)',
        getMessage: (count, name) => count > 1
            ? `${name} and ${count - 1} other${count > 2 ? 's' : ''} requested to follow you`
            : `${name} requested to follow you`,
    },
    favourite: {
        icon: <Heart size={16} />,
        color: 'var(--red-6)',
        getMessage: (count, name) => count > 1
            ? `${name} and ${count - 1} other${count > 2 ? 's' : ''} favourited your post`
            : `${name} favourited your post`,
    },
    poll: {
        icon: <BarChart2 size={16} />,
        color: 'var(--teal-6)',
        getMessage: () => `A poll you voted in has ended`,
    },
    update: {
        icon: <Edit2 size={16} />,
        color: 'var(--yellow-6)',
        getMessage: () => `A post you boosted was edited`,
    },
    'admin.sign_up': {
        icon: <UserPlus size={16} />,
        color: 'var(--cyan-6)',
        getMessage: (count, name) => count > 1
            ? `${name} and ${count - 1} other${count > 2 ? 's' : ''} signed up`
            : `${name} signed up`,
    },
    'admin.report': {
        icon: <Bell size={16} />,
        color: 'var(--red-6)',
        getMessage: (_count, name) => `${name} filed a report`,
    },
    'severed_relationships': {
        icon: <Bell size={16} />,
        color: 'var(--orange-6)',
        getMessage: () => 'Some of your follow relationships have been severed',
    },
    'moderation_warning': {
        icon: <Bell size={16} />,
        color: 'var(--red-6)',
        getMessage: () => 'A moderator has taken action against your account',
    },
};

// Check if an account is a full account (has display_name)
function isFullAccount(account: Account | PartialAccountWithAvatar): account is Account {
    return 'display_name' in account;
}

export function GroupedNotificationCard({
    group,
    accounts,
    statuses,
    isNew,
    style
}: GroupedNotificationCardProps) {
    const router = useRouter();
    const dismissMutation = useDismissNotificationGroup();

    const config = NOTIFICATION_CONFIG[group.type];

    // Get sample accounts for this group
    const sampleAccounts = group.sample_account_ids
        .map(id => accounts.get(id))
        .filter((acc): acc is Account | PartialAccountWithAvatar => acc !== undefined);

    const primaryAccount = sampleAccounts[0];
    const primaryDisplayName = primaryAccount
        ? (isFullAccount(primaryAccount) ? primaryAccount.display_name || primaryAccount.acct : primaryAccount.acct)
        : 'Someone';

    // Get status if applicable
    const relatedStatus = group.status_id ? statuses.get(group.status_id) : undefined;

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if clicking on interactive elements
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a')) {
            return;
        }

        // Navigate based on notification type
        if (relatedStatus) {
            router.push(`/status/${relatedStatus.id}`);
        } else if (primaryAccount) {
            router.push(`/@${primaryAccount.acct}`);
        }
    };

    const handleDismiss = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dismissMutation.mutate(group.group_key);
    };

    // Render stacked avatars for grouped notifications
    const renderAvatars = () => {
        const maxAvatars = 3;
        const visibleAccounts = sampleAccounts.slice(0, maxAvatars);
        const remainingCount = group.notifications_count - visibleAccounts.length;

        return (
            <AvatarsWrapper>
                {visibleAccounts.map((account, index) => (
                    <StackedAvatarWrapper
                        key={account.id}
                        $index={index}
                        $total={visibleAccounts.length}
                    >
                        <StackedAvatarLink href={`/@${account.acct}`}>
                            <AvatarWithBorder
                                src={account.avatar}
                                alt={isFullAccount(account) ? account.display_name || account.acct : account.acct}
                                size="small"
                            />
                        </StackedAvatarLink>
                    </StackedAvatarWrapper>
                ))}
                {remainingCount > 0 && (
                    <RemainingCount>+{remainingCount}</RemainingCount>
                )}
            </AvatarsWrapper>
        );
    };

    const CardComponent = isNew ? NewCard : Card;

    return (
        <div style={style}>
            <CardComponent padding="medium" onClick={handleCardClick}>
                <ContentWrapper>
                    {/* Notification type icon */}
                    <IconColumn>
                        <IconCircle $color={config.color}>
                            {config.icon}
                        </IconCircle>
                    </IconColumn>

                    {/* Content */}
                    <ContentColumn>
                        {/* Header with avatars, message, and time */}
                        <HeaderRow>
                            {renderAvatars()}

                            <InfoWrapper>
                                <MessageText>
                                    {primaryAccount && isFullAccount(primaryAccount) ? (
                                        <>
                                            <AccountLink href={`/@${primaryAccount.acct}`}>
                                                <EmojiText text={primaryDisplayName} emojis={primaryAccount.emojis} />
                                            </AccountLink>
                                            {' '}
                                        </>
                                    ) : null}
                                    <ActionText>
                                        {config.getMessage(group.notifications_count, primaryDisplayName).replace(primaryDisplayName, '').trim()}
                                    </ActionText>
                                </MessageText>
                                {group.latest_page_notification_at && (
                                    <TimeText>
                                        {formatRelativeTime(group.latest_page_notification_at)}
                                    </TimeText>
                                )}
                            </InfoWrapper>

                            {/* Dismiss button */}
                            <DismissButton size="small" onClick={handleDismiss}>
                                <X size={14} />
                            </DismissButton>
                        </HeaderRow>

                        {/* Status content rendered using PostCard */}
                        {relatedStatus && (
                            <PostCard
                                status={relatedStatus}
                                hideActions
                                hideMedia
                                depth={1}
                            />
                        )}
                    </ContentColumn>
                </ContentWrapper>
            </CardComponent>
        </div>
    );
}

// Styled components
const ContentWrapper = styled.div`
    display: flex;
    gap: var(--size-3);
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

const HeaderRow = styled.div`
    display: flex;
    align-items: flex-start;
    gap: var(--size-2);
    margin-bottom: var(--size-2);
`;

const AvatarsWrapper = styled.div`
    display: flex;
    align-items: center;
    margin-right: var(--size-2);
`;

const StackedAvatarWrapper = styled.div<{ $index: number; $total: number }>`
    margin-left: ${props => props.$index > 0 ? '-8px' : '0'};
    position: relative;
    z-index: ${props => props.$total - props.$index};
`;

const StackedAvatarLink = styled(Link)`
    display: block;
`;

const AvatarWithBorder = styled(Avatar)`
    border: 2px solid var(--surface-1);
    box-sizing: content-box;
`;

const RemainingCount = styled.span`
    margin-left: var(--size-1);
    font-size: var(--font-size-0);
    color: var(--text-3);
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

const ActionText = styled.span`
    color: var(--text-2);
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
