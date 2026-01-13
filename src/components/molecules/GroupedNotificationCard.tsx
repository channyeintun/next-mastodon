'use client';

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
import { Card, EmojiText } from '@/components/atoms';
import { PostCard } from '@/components/organisms';
import { formatRelativeTime } from '@/utils/date';
import type { NotificationGroup, Account, PartialAccountWithAvatar, Status, NotificationType } from '@/types';
import { useDismissNotificationGroup, queryKeys, prefillAccountCache } from '@/api';
import {
    ContentWrapper,
    IconColumn,
    IconCircle,
    ContentColumn,
    StatusContent,
    HeaderRow,
    AvatarsWrapper,
    StackedAvatarWrapper,
    StackedAvatarLink,
    AvatarWithBorder,
    RemainingCount,
    InfoWrapper,
    MessageText,
    AccountLink,
    TopRightActions,
    TimeText,
    DismissButton,
    NewCard,
} from './groupedNotificationCardStyles';

interface GroupedNotificationCardProps {
    group: NotificationGroup;
    accounts: Map<string, Account | PartialAccountWithAvatar>;
    statuses: Map<string, Status>;
    isNew?: boolean;
    style?: React.CSSProperties;
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

// Check if an account is a full account (has display_name)
function isFullAccount(account: Account | PartialAccountWithAvatar): account is Account {
    return 'display_name' in account;
}

export function GroupedNotificationCard({
    group,
    accounts,
    statuses,
    isNew,
    style,
    isFocused
}: GroupedNotificationCardProps) {
    const router = useRouter();
    const dismissMutation = useDismissNotificationGroup();
    const queryClient = useQueryClient();
    const t = useTranslations('notifications.types');

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

    // Pre-populate account cache before navigation
    const handleAccountClick = (account: Account | PartialAccountWithAvatar) => () => {
        if (isFullAccount(account)) {
            prefillAccountCache(queryClient, account);
        }
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if clicking on interactive elements
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a')) {
            return;
        }

        // Navigate based on notification type
        if (relatedStatus) {
            // Pre-populate status cache before navigation
            queryClient.setQueryData(queryKeys.statuses.detail(relatedStatus.id), relatedStatus);
            router.push(`/status/${relatedStatus.id}`);
        } else if (primaryAccount) {
            // Pre-populate account cache before navigation
            if (isFullAccount(primaryAccount)) {
                prefillAccountCache(queryClient, primaryAccount);
            }
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
                        <StackedAvatarLink
                            href={`/@${account.acct}`}
                            onClick={handleAccountClick(account)}
                        >
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
                        {/* Header with avatars, message, and time */}
                        <HeaderRow>
                            {renderAvatars()}

                            <InfoWrapper>
                                <MessageText>
                                    {t.rich(config.translationKey, {
                                        count: group.notifications_count,
                                        remainingCount: group.notifications_count - 1,
                                        name: primaryDisplayName,
                                        link: (chunks) => {
                                            if (!primaryAccount) return chunks;
                                            return (
                                                <AccountLink
                                                    href={`/@${primaryAccount.acct}`}
                                                    onClick={handleAccountClick(primaryAccount)}
                                                >
                                                    {isFullAccount(primaryAccount) ? (
                                                        <EmojiText text={primaryDisplayName} emojis={primaryAccount.emojis} />
                                                    ) : chunks}
                                                </AccountLink>
                                            );
                                        }
                                    })}
                                </MessageText>
                            </InfoWrapper>

                            {/* Dismiss button and time */}
                            <TopRightActions>
                                <DismissButton size="small" onClick={handleDismiss}>
                                    <X size={14} />
                                </DismissButton>
                                {group.latest_page_notification_at && (
                                    <TimeText>
                                        {formatRelativeTime(group.latest_page_notification_at)}
                                    </TimeText>
                                )}
                            </TopRightActions>
                        </HeaderRow>
                    </ContentColumn>

                    {/* Status content rendered using PostCard - spans 2 columns on mobile */}
                    {relatedStatus && (
                        <StatusContent>
                            <PostCard
                                status={relatedStatus}
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
