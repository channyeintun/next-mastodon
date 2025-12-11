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
import type { Notification, NotificationType } from '@/types';
import { useDismissNotification } from '@/api';

interface NotificationCardProps {
    notification: Notification;
    onDismiss?: (id: string) => void;
    style?: React.CSSProperties;
    isNew?: boolean;
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
    getMessage: (displayName: string) => string;
}> = {
    mention: {
        icon: <MessageCircle size={16} />,
        color: 'var(--blue-6)',
        getMessage: (name) => `${name} mentioned you`,
    },
    status: {
        icon: <Bell size={16} />,
        color: 'var(--purple-6)',
        getMessage: (name) => `${name} posted`,
    },
    reblog: {
        icon: <Repeat2 size={16} />,
        color: 'var(--green-6)',
        getMessage: (name) => `${name} boosted your post`,
    },
    follow: {
        icon: <UserPlus size={16} />,
        color: 'var(--indigo-6)',
        getMessage: (name) => `${name} followed you`,
    },
    follow_request: {
        icon: <UserPlus size={16} />,
        color: 'var(--orange-6)',
        getMessage: (name) => `${name} requested to follow you`,
    },
    favourite: {
        icon: <Heart size={16} />,
        color: 'var(--red-6)',
        getMessage: (name) => `${name} favourited your post`,
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
        getMessage: (name) => `${name} signed up`,
    },
    'admin.report': {
        icon: <Bell size={16} />,
        color: 'var(--red-6)',
        getMessage: (name) => `${name} filed a report`,
    },
};

export function NotificationCard({ notification, onDismiss, style, isNew }: NotificationCardProps) {
    const router = useRouter();
    const dismissMutation = useDismissNotification();

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
            router.push(`/status/${notification.status.id}`);
        } else {
            router.push(`/@${account.acct}`);
        }
    };

    const handleDismiss = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dismissMutation.mutate(notification.id);
        onDismiss?.(notification.id);
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
                        {/* Header with avatar, message, and time */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 'var(--size-2)',
                            marginBottom: 'var(--size-2)',
                        }}>
                            <Link href={`/@${account.acct}`} style={{ flexShrink: 0 }}>
                                <Avatar
                                    src={account.avatar}
                                    alt={displayName}
                                    size="small"
                                />
                            </Link>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: 'var(--font-size-1)',
                                    color: 'var(--text-1)',
                                    lineHeight: 1.4,
                                }}>
                                    <Link
                                        href={`/@${account.acct}`}
                                        style={{
                                            textDecoration: 'none',
                                            color: 'var(--text-1)',
                                            fontWeight: 'var(--font-weight-6)',
                                        }}
                                    >
                                        <EmojiText text={displayName} emojis={account.emojis} />
                                    </Link>
                                    {' '}
                                    <span style={{ color: 'var(--text-2)' }}>
                                        {config.getMessage(displayName).replace(displayName, '').trim()}
                                    </span>
                                </div>
                                <div style={{
                                    fontSize: 'var(--font-size-0)',
                                    color: 'var(--text-3)',
                                    marginTop: 'var(--size-1)',
                                }}>
                                    {formatRelativeTime(notification.created_at)}
                                </div>
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
                        {notification.status && (
                            <div style={{
                                padding: 'var(--size-2)',
                                background: 'var(--surface-2)',
                                borderRadius: 'var(--radius-2)',
                                marginTop: 'var(--size-2)',
                            }}>
                                {notification.type === 'mention' ? (
                                    // Full content for mentions
                                    <StatusContent
                                        html={notification.status.content}
                                        emojis={notification.status.emojis}
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
                                            html={notification.status.content}
                                            emojis={notification.status.emojis}
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
