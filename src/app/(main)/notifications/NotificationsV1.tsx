'use client';

import { useEffect, useRef } from 'react';
import { Bell, Trash2, Check } from 'lucide-react';
import { NotificationCard, NotificationSkeletonList } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { Button } from '@/components/atoms';
import { useInfiniteNotifications, useClearNotifications, useMarkNotificationsAsRead, useNotificationMarker } from '@/api';
import type { Notification } from '@/types';

interface NotificationsV1Props {
    streamingStatus: string;
}

export function NotificationsV1({ streamingStatus }: NotificationsV1Props) {
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

    const { data: markerData } = useNotificationMarker();

    const initialMarkerRef = useRef<string | null>(null);
    const hasAutoMarkedRef = useRef(false);

    useEffect(() => {
        if (markerData?.notifications?.last_read_id && initialMarkerRef.current === null) {
            initialMarkerRef.current = markerData.notifications.last_read_id;
        }
    }, [markerData]);

    const lastReadIdForHighlight = initialMarkerRef.current;

    const allNotifications = data?.pages.flatMap((page) => page) ?? [];

    useEffect(() => {
        if (allNotifications.length > 0 && !hasAutoMarkedRef.current) {
            const latestId = allNotifications[0].id;
            if (!lastReadIdForHighlight || latestId > lastReadIdForHighlight) {
                hasAutoMarkedRef.current = true;
                markAsReadMutation.mutate(latestId);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allNotifications.length, lastReadIdForHighlight]);

    const isNotificationNew = (notificationId: string): boolean => {
        if (!lastReadIdForHighlight) return false;
        return notificationId > lastReadIdForHighlight;
    };

    const handleMarkAsRead = () => {
        if (allNotifications.length > 0) {
            markAsReadMutation.mutate(allNotifications[0].id);
        }
    };

    const handleClearAll = () => {
        if (confirm('Are you sure you want to clear all notifications?')) {
            clearMutation.mutate();
        }
    };

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
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                    <Bell size={24} />
                    <h1 style={{ fontSize: 'var(--font-size-4)', fontWeight: 'var(--font-weight-7)', margin: 0 }}>
                        Notifications
                    </h1>
                    {streamingStatus === 'connected' && (
                        <span style={{ fontSize: 'var(--font-size-0)', color: 'var(--green-6)', display: 'flex', alignItems: 'center', gap: 'var(--size-1)' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green-6)' }} />
                            Live
                        </span>
                    )}
                </div>

                {allNotifications.length > 0 && (
                    <div style={{ display: 'flex', gap: 'var(--size-2)' }}>
                        <Button variant="ghost" size="small" onClick={handleMarkAsRead} aria-label="Mark as read">
                            <Check size={16} />
                            <span className="hide-on-mobile">Mark as read</span>
                        </Button>
                        <Button variant="ghost" size="small" onClick={handleClearAll} aria-label="Clear all">
                            <Trash2 size={16} />
                            <span className="hide-on-mobile">Clear all</span>
                        </Button>
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="virtualized-list-container" style={{ flex: 1, overflow: 'auto' }}>
                    <NotificationSkeletonList count={6} />
                </div>
            )}

            {isError && (
                <div style={{ padding: 'var(--size-4)', background: 'var(--red-2)', borderRadius: 'var(--radius-2)', color: 'var(--red-9)', textAlign: 'center' }}>
                    {error?.message || 'Failed to load notifications'}
                </div>
            )}

            {!isLoading && !isError && (
                <VirtualizedList<Notification>
                    items={allNotifications}
                    renderItem={(notification) => (
                        <NotificationCard
                            key={notification.id}
                            notification={notification}
                            style={{ marginBottom: 'var(--size-2)' }}
                            isNew={isNotificationNew(notification.id)}
                        />
                    )}
                    getItemKey={(notification) => notification.id}
                    estimateSize={100}
                    onLoadMore={fetchNextPage}
                    isLoadingMore={isFetchingNextPage}
                    hasMore={hasNextPage}
                    scrollRestorationKey="notifications-v1"
                    height="100%"
                    loadingIndicator={<div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--size-4)' }}><div className="spinner" /></div>}
                    endIndicator="You've reached the end of your notifications"
                    emptyState={
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--size-8)', textAlign: 'center' }}>
                            <Bell size={48} style={{ color: 'var(--text-3)', marginBottom: 'var(--size-4)' }} />
                            <h2 style={{ fontSize: 'var(--font-size-3)', fontWeight: 'var(--font-weight-6)', color: 'var(--text-2)', marginBottom: 'var(--size-2)' }}>No notifications yet</h2>
                            <p style={{ fontSize: 'var(--font-size-1)', color: 'var(--text-3)' }}>When someone interacts with your posts, you&apos;ll see it here.</p>
                        </div>
                    }
                />
            )}
        </div>
    );
}
