'use client';

import { useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Bell, Trash2, Check, Filter } from 'lucide-react';
import { GroupedNotificationCard, NotificationSkeletonList } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { Button } from '@/components/atoms';
import { useInfiniteGroupedNotifications, useClearNotifications, useMarkNotificationsAsRead, useNotificationMarker, useNotificationPolicy } from '@/api';
import type { NotificationGroup, Account, PartialAccountWithAvatar, Status } from '@/types';

interface NotificationsV2Props {
    streamingStatus: string;
}

export function NotificationsV2({ streamingStatus }: NotificationsV2Props) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useInfiniteGroupedNotifications();

    const clearMutation = useClearNotifications();
    const markAsReadMutation = useMarkNotificationsAsRead();

    // Fetch notification policy to show pending requests banner
    const { data: policyData } = useNotificationPolicy();
    const pendingRequestsCount = policyData?.summary?.pending_requests_count ?? 0;

    // Fetch the notification marker to determine which notifications are "new"
    const { data: markerData } = useNotificationMarker();

    // Store the initial marker value when we first load the page
    const initialMarkerRef = useRef<string | null>(null);
    const hasAutoMarkedRef = useRef(false);

    // Capture the initial marker value on first load
    useEffect(() => {
        if (markerData?.notifications?.last_read_id && initialMarkerRef.current === null) {
            initialMarkerRef.current = markerData.notifications.last_read_id;
        }
    }, [markerData]);

    const lastReadIdForHighlight = initialMarkerRef.current;

    // Build lookup maps for accounts and statuses from all pages
    const { accountsMap, statusesMap, allGroups } = useMemo(() => {
        const accountsMap = new Map<string, Account | PartialAccountWithAvatar>();
        const statusesMap = new Map<string, Status>();
        const allGroups: NotificationGroup[] = [];

        if (data?.pages) {
            for (const page of data.pages) {
                // Access data from PaginatedResponse
                const pageData = page.data;
                for (const account of pageData.accounts) {
                    accountsMap.set(account.id, account);
                }
                if (pageData.partial_accounts) {
                    for (const account of pageData.partial_accounts) {
                        if (!accountsMap.has(account.id)) {
                            accountsMap.set(account.id, account);
                        }
                    }
                }
                for (const status of pageData.statuses) {
                    statusesMap.set(status.id, status);
                }
                allGroups.push(...pageData.notification_groups);
            }
        }

        return { accountsMap, statusesMap, allGroups };
    }, [data?.pages]);

    // Auto-update marker when visiting the page
    useEffect(() => {
        if (allGroups.length > 0 && !hasAutoMarkedRef.current) {
            const latestId = allGroups[0].most_recent_notification_id;
            if (!lastReadIdForHighlight || latestId > lastReadIdForHighlight) {
                hasAutoMarkedRef.current = true;
                markAsReadMutation.mutate(latestId);
            }
        }
    }, [allGroups.length, lastReadIdForHighlight]);

    const isGroupNew = (group: NotificationGroup): boolean => {
        if (!lastReadIdForHighlight) return false;
        return group.most_recent_notification_id > lastReadIdForHighlight;
    };

    const handleMarkAsRead = () => {
        if (allGroups.length > 0) {
            markAsReadMutation.mutate(allGroups[0].most_recent_notification_id);
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

                {allGroups.length > 0 && (
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

            {/* Pending notification requests banner */}
            {pendingRequestsCount > 0 && (
                <Link
                    href="/notifications/requests"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--size-2)',
                        padding: 'var(--size-3) var(--size-4)',
                        margin: '0 var(--size-4) var(--size-4)',
                        background: 'var(--blue-2)',
                        borderRadius: 'var(--radius-2)',
                        color: 'var(--blue-9)',
                        textDecoration: 'none',
                        fontSize: 'var(--font-size-1)',
                        fontWeight: 'var(--font-weight-5)',
                    }}
                >
                    <Filter size={16} />
                    <span>
                        {pendingRequestsCount} filtered {pendingRequestsCount === 1 ? 'notification' : 'notifications'} from accounts you don&apos;t follow
                    </span>
                </Link>
            )}

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
                <VirtualizedList<NotificationGroup>
                    items={allGroups}
                    renderItem={(group) => (
                        <GroupedNotificationCard
                            group={group}
                            accounts={accountsMap}
                            statuses={statusesMap}
                            style={{ marginBottom: 'var(--size-2)' }}
                            isNew={isGroupNew(group)}
                        />
                    )}
                    getItemKey={(group) => group.most_recent_notification_id}
                    estimateSize={100}
                    onLoadMore={fetchNextPage}
                    isLoadingMore={isFetchingNextPage}
                    hasMore={hasNextPage}
                    scrollRestorationKey="notifications-v2"
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
