'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BiExpandVertical, BiCollapseVertical } from 'react-icons/bi';
import { IoCheckmarkDoneSharp } from 'react-icons/io5';
import { TiDelete } from 'react-icons/ti';
import { NotificationCard, NotificationSkeletonList } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { Button, Tabs, type TabItem } from '@/components/atoms';
import { useInfiniteNotifications, useClearNotifications, useMarkNotificationsAsRead, useNotificationMarker, useNotificationPolicyV1, useUpdateNotificationPolicyV1 } from '@/api';
import { flattenPages } from '@/utils/fp';
import type { Notification } from '@/types';
import {
    NotificationHeaderContainer,
    NotificationTitleRow,
    NotificationSettingsToggle,
    NotificationSettingsPanelWrapper,
    NotificationSettingsPanel,
    NotificationSettingsPanelContent,
    NotificationSettingsSectionTitle,
    NotificationActionsRow,
    NotificationFilterRow,
    NotificationFilterLabel,
    NotificationFilterToggle,
    NotificationPendingLink,
} from './NotificationStyles';

type NotificationTab = 'all' | 'mentions';

const NOTIFICATION_TABS: TabItem<NotificationTab>[] = [
    { value: 'all', label: 'All' },
    { value: 'mentions', label: 'Mentions' },
];

// V1 policy uses boolean filters
interface PolicyCategoryV1 {
    key: 'filter_not_following' | 'filter_not_followers' | 'filter_new_accounts' | 'filter_private_mentions';
    label: string;
}

const policyCategoriesV1: PolicyCategoryV1[] = [
    { key: 'filter_not_following', label: 'People you don\'t follow' },
    { key: 'filter_not_followers', label: 'People not following you' },
    { key: 'filter_new_accounts', label: 'New accounts' },
    { key: 'filter_private_mentions', label: 'Unsolicited private mentions' },
];

interface NotificationsV1Props {
    streamingStatus: string;
}

export function NotificationsV1({ streamingStatus }: NotificationsV1Props) {
    const [activeTab, setActiveTab] = useState<NotificationTab>('all');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const router = useRouter();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useInfiniteNotifications(activeTab === 'mentions' ? ['mention'] : undefined);

    const clearMutation = useClearNotifications();
    const markAsReadMutation = useMarkNotificationsAsRead();

    // V1 Notification policy for filters (boolean-based)
    const { data: policyData } = useNotificationPolicyV1();
    const updatePolicyMutation = useUpdateNotificationPolicyV1();
    const pendingRequestsCount = policyData?.summary?.pending_requests_count ?? 0;

    const { data: markerData } = useNotificationMarker();

    const initialMarkerRef = useRef<string | null>(null);
    const hasAutoMarkedRef = useRef(false);

    useEffect(() => {
        if (markerData?.notifications?.last_read_id && initialMarkerRef.current === null) {
            initialMarkerRef.current = markerData.notifications.last_read_id;
        }
    }, [markerData]);

    const lastReadIdForHighlight = initialMarkerRef.current;

    const allNotifications = flattenPages(data?.pages);

    useEffect(() => {
        if (allNotifications.length > 0 && !hasAutoMarkedRef.current) {
            const latestId = allNotifications[0].id;
            if (!lastReadIdForHighlight || latestId > lastReadIdForHighlight) {
                hasAutoMarkedRef.current = true;
                markAsReadMutation.mutate(latestId);
            }
        }
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

    // V1 uses boolean toggle for filters
    const handleFilterToggle = (key: PolicyCategoryV1['key']) => {
        const currentValue = policyData?.[key] ?? false;
        updatePolicyMutation.mutate({ [key]: !currentValue });
    };

    return (
        <div className="full-height-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
            {/* Header */}
            <NotificationHeaderContainer>
                <NotificationTitleRow>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                        <Bell size={24} />
                        <h1 style={{ fontSize: 'var(--font-size-4)', fontWeight: 'var(--font-weight-7)', margin: 0 }}>
                            Notifications
                        </h1>
                        {streamingStatus === 'connected' && (
                            <span style={{ fontSize: 'var(--font-size-0)', color: 'var(--green-6)', display: 'flex', alignItems: 'center', gap: 'var(--size-1)' }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green-6)' }} />
                            </span>
                        )}
                    </div>

                    <NotificationSettingsToggle
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        aria-label="Toggle settings"
                    >
                        {isSettingsOpen ? <BiCollapseVertical size={20} /> : <BiExpandVertical size={20} />}
                    </NotificationSettingsToggle>
                </NotificationTitleRow>
            </NotificationHeaderContainer>

            {/* Collapsible Settings Area */}
            <NotificationSettingsPanelWrapper $isOpen={isSettingsOpen}>
                <NotificationSettingsPanel>
                    <NotificationSettingsPanelContent>
                        {/* Actions */}
                        <NotificationSettingsSectionTitle>Actions</NotificationSettingsSectionTitle>
                        <NotificationActionsRow>
                            <Button variant="ghost" size="small" onClick={handleMarkAsRead} disabled={allNotifications.length === 0}>
                                <IoCheckmarkDoneSharp size={16} />
                                Mark all as read
                            </Button>
                            <Button variant="ghost" size="small" onClick={handleClearAll} disabled={allNotifications.length === 0}>
                                <TiDelete size={16} />
                                Clear all
                            </Button>
                        </NotificationActionsRow>

                        {/* Filters - V1 uses boolean toggles */}
                        <NotificationSettingsSectionTitle style={{ marginTop: 'var(--size-3)' }}>Filters</NotificationSettingsSectionTitle>
                        {policyCategoriesV1.map((category) => (
                            <NotificationFilterRow key={category.key}>
                                <NotificationFilterLabel>{category.label}</NotificationFilterLabel>
                                <NotificationFilterToggle
                                    type="checkbox"
                                    checked={policyData?.[category.key] ?? false}
                                    onChange={() => handleFilterToggle(category.key)}
                                    disabled={updatePolicyMutation.isPending}
                                />
                            </NotificationFilterRow>
                        ))}

                        {/* Pending requests link */}
                        {pendingRequestsCount > 0 && (
                            <NotificationPendingLink href="/notifications/requests">
                                <Filter size={16} />
                                <span>
                                    {pendingRequestsCount} filtered {pendingRequestsCount === 1 ? 'notification' : 'notifications'}
                                </span>
                            </NotificationPendingLink>
                        )}
                    </NotificationSettingsPanelContent>
                </NotificationSettingsPanel>
            </NotificationSettingsPanelWrapper>

            {/* Tabs */}
            <Tabs
                tabs={NOTIFICATION_TABS}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                style={{ padding: '0 var(--size-1)' }}
            />

            {isLoading && (
                <div className="virtualized-list-container" style={{ flex: 1, overflow: 'auto' }}>
                    <NotificationSkeletonList count={3} />
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
                    renderItem={(notification, _, isFocused) => (
                        <NotificationCard
                            notification={notification}
                            style={{ marginBottom: 'var(--size-2)' }}
                            isNew={isNotificationNew(notification.id)}
                            isFocused={isFocused}
                        />
                    )}
                    onItemOpen={(notification) => {
                        if (notification.status) {
                            router.push(`/status/${notification.status.id}`);
                        } else {
                            router.push(`/@${notification.account.acct}`);
                        }
                    }}
                    getItemKey={(notification) => notification.id}
                    estimateSize={100}
                    onLoadMore={fetchNextPage}
                    isLoadingMore={isFetchingNextPage}
                    hasMore={hasNextPage}
                    scrollRestorationKey={`notifications-v1-${activeTab}`}
                    height="100%"
                    loadingIndicator={<div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--size-4)' }}><div className="spinner" /></div>}
                    endIndicator="You've reached the end of your notifications"
                    emptyState={
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--size-8)', textAlign: 'center' }}>
                            <Bell size={48} style={{ color: 'var(--text-3)', marginBottom: 'var(--size-4)' }} />
                            <h2 style={{ fontSize: 'var(--font-size-3)', fontWeight: 'var(--font-weight-6)', color: 'var(--text-2)', marginBottom: 'var(--size-2)' }}>
                                {activeTab === 'mentions' ? 'No mentions yet' : 'No notifications yet'}
                            </h2>
                            <p style={{ fontSize: 'var(--font-size-1)', color: 'var(--text-3)' }}>
                                {activeTab === 'mentions'
                                    ? 'When someone mentions you, you\'ll see it here.'
                                    : 'When someone interacts with your posts, you\'ll see it here.'
                                }
                            </p>
                        </div>
                    }
                />
            )}
        </div>
    );
}
