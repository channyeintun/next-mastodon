'use client';

import { useEffect } from 'react';
import { Bell, Trash2, Check } from 'lucide-react';
import { NotificationCard, NotificationSkeletonList } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { Button } from '@/components/atoms';
import { useInfiniteNotifications, useClearNotifications, useMarkNotificationsAsRead } from '@/api';
import { useNotificationStream } from '@/hooks/useStreaming';
import { useAuthStore } from '@/hooks/useStores';
import { useRouter } from 'next/navigation';
import type { Notification } from '@/types';

export default function NotificationsPage() {
    const router = useRouter();
    const authStore = useAuthStore();

    // Start streaming connection
    const { status: streamingStatus } = useNotificationStream();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useInfiniteNotifications();

    const clearMutation = useClearNotifications();
    const markAsReadMutation = useMarkNotificationsAsRead();

    // Redirect if not authenticated
    useEffect(() => {
        if (!authStore.isAuthenticated) {
            router.push('/');
        }
    }, [authStore.isAuthenticated, router]);

    const allNotifications = data?.pages.flatMap((page) => page) ?? [];

    const handleMarkAsRead = () => {
        // Get the most recent notification ID to mark as the last read
        if (allNotifications.length > 0) {
            const latestId = allNotifications[0].id;
            markAsReadMutation.mutate(latestId);
        }
    };

    const handleClearAll = () => {
        if (confirm('Are you sure you want to clear all notifications?')) {
            clearMutation.mutate();
        }
    };

    if (!authStore.isAuthenticated) {
        return null;
    }

    return (
        <div className="full-height-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                background: 'var(--surface-1)',
                zIndex: 10,
                padding: 'var(--size-4)',
                marginBottom: 'var(--size-4)',
                borderBottom: '1px solid var(--surface-3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
                flexWrap: 'wrap',
                gap: 'var(--size-3)',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--size-2)',
                }}>
                    <Bell size={24} />
                    <h1 style={{
                        fontSize: 'var(--font-size-4)',
                        fontWeight: 'var(--font-weight-7)',
                        margin: 0,
                    }}>
                        Notifications
                    </h1>
                    {streamingStatus === 'connected' && (
                        <span style={{
                            fontSize: 'var(--font-size-0)',
                            color: 'var(--green-6)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--size-1)',
                        }}>
                            <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'var(--green-6)',
                            }} />
                            Live
                        </span>
                    )}
                </div>

                {allNotifications.length > 0 && (
                    <div style={{
                        display: 'flex',
                        gap: 'var(--size-2)',
                    }}>
                        <Button
                            variant="ghost"
                            size="small"
                            onClick={handleMarkAsRead}
                            disabled={markAsReadMutation.isPending}
                            aria-label="Mark as read"
                        >
                            <Check size={16} />
                            <span className="hide-on-mobile">Mark as read</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="small"
                            onClick={handleClearAll}
                            disabled={clearMutation.isPending}
                            aria-label="Clear all"
                        >
                            <Trash2 size={16} />
                            <span className="hide-on-mobile">Clear all</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="virtualized-list-container" style={{ flex: 1, overflow: 'auto' }}>
                    <NotificationSkeletonList count={6} />
                </div>
            )}

            {/* Error state */}
            {isError && (
                <div style={{
                    padding: 'var(--size-4)',
                    background: 'var(--red-2)',
                    borderRadius: 'var(--radius-2)',
                    color: 'var(--red-9)',
                    textAlign: 'center',
                }}>
                    {error?.message || 'Failed to load notifications'}
                </div>
            )}

            {/* Virtualized Notifications list */}
            {!isLoading && !isError && (
                <VirtualizedList<Notification>
                    items={allNotifications}
                    renderItem={(notification) => (
                        <NotificationCard
                            key={notification.id}
                            notification={notification}
                            style={{ marginBottom: 'var(--size-2)' }}
                        />
                    )}
                    getItemKey={(notification) => notification.id}
                    estimateSize={100}
                    onLoadMore={fetchNextPage}
                    isLoadingMore={isFetchingNextPage}
                    hasMore={hasNextPage}
                    scrollRestorationKey="notifications"
                    height="100%"
                    loadingIndicator={
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            padding: 'var(--size-4)',
                        }}>
                            <div className="spinner" />
                        </div>
                    }
                    endIndicator="You've reached the end of your notifications"
                    emptyState={
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 'var(--size-8)',
                            textAlign: 'center',
                        }}>
                            <Bell size={48} style={{ color: 'var(--text-3)', marginBottom: 'var(--size-4)' }} />
                            <h2 style={{
                                fontSize: 'var(--font-size-3)',
                                fontWeight: 'var(--font-weight-6)',
                                color: 'var(--text-2)',
                                marginBottom: 'var(--size-2)',
                            }}>
                                No notifications yet
                            </h2>
                            <p style={{
                                fontSize: 'var(--font-size-1)',
                                color: 'var(--text-3)',
                            }}>
                                When someone interacts with your posts, you&apos;ll see it here.
                            </p>
                        </div>
                    }
                />
            )}
        </div>
    );
}
