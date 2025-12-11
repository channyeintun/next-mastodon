'use client';

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
import { StatusContent } from '@/components/molecules';
import type { NotificationGroup, Account, PartialAccountWithAvatar, Status, NotificationType } from '@/types';
import { useDismissNotificationGroup } from '@/api';

interface GroupedNotificationCardProps {
    group: NotificationGroup;
    accounts: Map<string, Account | PartialAccountWithAvatar>;
    statuses: Map<string, Status>;
    isNew?: boolean;
    style?: React.CSSProperties;
}

// Format relative time
function formatRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginRight: 'var(--size-2)',
            }}>
                {visibleAccounts.map((account, index) => (
                    <Link
                        key={account.id}
                        href={`/@${account.acct}`}
                        style={{
                            marginLeft: index > 0 ? '-8px' : 0,
                            position: 'relative',
                            zIndex: visibleAccounts.length - index,
                        }}
                    >
                        <Avatar
                            src={account.avatar}
                            alt={isFullAccount(account) ? account.display_name || account.acct : account.acct}
                            size="small"
                            style={{
                                border: '2px solid var(--surface-1)',
                                boxSizing: 'content-box',
                            }}
                        />
                    </Link>
                ))}
                {remainingCount > 0 && (
                    <span style={{
                        marginLeft: 'var(--size-1)',
                        fontSize: 'var(--font-size-0)',
                        color: 'var(--text-3)',
                    }}>
                        +{remainingCount}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div style={style}>
            <Card
                padding="medium"
                onClick={handleCardClick}
                style={isNew ? {
                    borderLeft: '3px solid var(--blue-6)',
                    background: 'color-mix(in srgb, var(--blue-6) 5%, var(--surface-2))',
                } : undefined}
            >
                <div style={{
                    display: 'flex',
                    gap: 'var(--size-3)',
                }}>
                    {/* Notification type icon */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 'var(--size-2)',
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: `color-mix(in srgb, ${config.color} 20%, transparent)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: config.color,
                        }}>
                            {config.icon}
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Header with avatars, message, and time */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 'var(--size-2)',
                            marginBottom: 'var(--size-2)',
                        }}>
                            {renderAvatars()}

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: 'var(--font-size-1)',
                                    color: 'var(--text-1)',
                                    lineHeight: 1.4,
                                }}>
                                    {primaryAccount && isFullAccount(primaryAccount) ? (
                                        <>
                                            <Link
                                                href={`/@${primaryAccount.acct}`}
                                                style={{
                                                    textDecoration: 'none',
                                                    color: 'var(--text-1)',
                                                    fontWeight: 'var(--font-weight-6)',
                                                }}
                                            >
                                                <EmojiText text={primaryDisplayName} emojis={primaryAccount.emojis} />
                                            </Link>
                                            {' '}
                                        </>
                                    ) : null}
                                    <span style={{ color: 'var(--text-2)' }}>
                                        {config.getMessage(group.notifications_count, primaryDisplayName).replace(primaryDisplayName, '').trim()}
                                    </span>
                                </div>
                                {group.latest_page_notification_at && (
                                    <div style={{
                                        fontSize: 'var(--font-size-0)',
                                        color: 'var(--text-3)',
                                        marginTop: 'var(--size-1)',
                                    }}>
                                        {formatRelativeTime(group.latest_page_notification_at)}
                                    </div>
                                )}
                            </div>

                            {/* Dismiss button */}
                            <IconButton
                                size="small"
                                onClick={handleDismiss}
                                style={{ opacity: 0.6 }}
                            >
                                <X size={14} />
                            </IconButton>
                        </div>

                        {/* Status preview (for mention, status, reblog, favourite, poll, update) */}
                        {relatedStatus && (
                            <div style={{
                                padding: 'var(--size-2)',
                                background: 'var(--surface-2)',
                                borderRadius: 'var(--radius-2)',
                                marginTop: 'var(--size-2)',
                            }}>
                                {group.type === 'mention' ? (
                                    // Full content for mentions
                                    <StatusContent
                                        html={relatedStatus.content}
                                        emojis={relatedStatus.emojis}
                                        style={{ fontSize: 'var(--font-size-1)' }}
                                    />
                                ) : (
                                    // Preview for other types
                                    <div style={{
                                        fontSize: 'var(--font-size-0)',
                                        color: 'var(--text-2)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                    }}>
                                        <StatusContent
                                            html={relatedStatus.content}
                                            emojis={relatedStatus.emojis}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
