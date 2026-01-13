'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import { Bell, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { BiExpandVertical, BiCollapseVertical } from 'react-icons/bi';
import { IoCheckmarkDoneSharp } from 'react-icons/io5';
import { TiDelete } from 'react-icons/ti';
import { GroupedNotificationCard, NotificationSkeletonList } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { Button, Tabs } from '@/components/atoms';
import { useInfiniteGroupedNotifications, useClearNotifications, useMarkNotificationsAsRead, useNotificationMarker, useNotificationPolicy, useUpdateNotificationPolicy } from '@/api';
import type { NotificationGroup, Account, PartialAccountWithAvatar, Status, NotificationPolicyValue } from '@/types';
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
    NotificationFilterSelect,
    NotificationPendingLink,
} from './NotificationStyles';

type NotificationTab = 'all' | 'mentions';

interface PolicyCategory {
    key: 'for_not_following' | 'for_not_followers' | 'for_new_accounts' | 'for_private_mentions' | 'for_limited_accounts';
    label: string;
}

interface NotificationsV2Props {
    streamingStatus: string;
}

export function NotificationsV2({ streamingStatus }: NotificationsV2Props) {
    const t = useTranslations('notifications');
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
    } = useInfiniteGroupedNotifications(activeTab === 'mentions' ? ['mention'] : undefined);

    const clearMutation = useClearNotifications();
    const markAsReadMutation = useMarkNotificationsAsRead();

    // Notification policy for filters
    const { data: policyData } = useNotificationPolicy();
    const updatePolicyMutation = useUpdateNotificationPolicy();
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

    const handleFilterChange = (key: PolicyCategory['key'], value: NotificationPolicyValue) => {
        // Save immediately on change
        updatePolicyMutation.mutate({ [key]: value });
    };

    return (
        <div className="full-height-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
            {/* Header */}
            <NotificationHeaderContainer>
                <NotificationTitleRow>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                        <Bell size={24} />
                        <h1 style={{ fontSize: 'var(--font-size-4)', fontWeight: 'var(--font-weight-7)', margin: 0, whiteSpace: 'nowrap' }}>
                            {t('title')}
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

            {/* Collapsible Settings Area - using CSS interpolate-size animation */}
            <NotificationSettingsPanelWrapper $isOpen={isSettingsOpen}>
                <NotificationSettingsPanel>
                    <NotificationSettingsPanelContent>
                        {/* Actions */}
                        <NotificationSettingsSectionTitle>{t('actions.title')}</NotificationSettingsSectionTitle>
                        <NotificationActionsRow>
                            <Button variant="ghost" size="small" onClick={handleMarkAsRead} disabled={allGroups.length === 0}>
                                <IoCheckmarkDoneSharp size={16} />
                                {t('actions.markAllRead')}
                            </Button>
                            <Button variant="ghost" size="small" onClick={handleClearAll} disabled={allGroups.length === 0}>
                                <TiDelete size={16} />
                                {t('actions.clearAll')}
                            </Button>
                        </NotificationActionsRow>

                        {/* Filters */}
                        <NotificationSettingsSectionTitle style={{ marginTop: 'var(--size-3)' }}>{t('filters.title')}</NotificationSettingsSectionTitle>
                        {[
                            { key: 'for_not_following' as const, label: t('filters.categories.for_not_following') },
                            { key: 'for_not_followers' as const, label: t('filters.categories.for_not_followers') },
                            { key: 'for_new_accounts' as const, label: t('filters.categories.for_new_accounts') },
                            { key: 'for_private_mentions' as const, label: t('filters.categories.for_private_mentions') },
                            { key: 'for_limited_accounts' as const, label: t('filters.categories.for_limited_accounts') },
                        ].map((category) => (
                            <NotificationFilterRow key={category.key}>
                                <NotificationFilterLabel>{category.label}</NotificationFilterLabel>
                                <NotificationFilterSelect
                                    value={policyData?.[category.key] ?? 'accept'}
                                    onChange={(e) => handleFilterChange(category.key, e.target.value as NotificationPolicyValue)}
                                    disabled={updatePolicyMutation.isPending}
                                >
                                    {[
                                        { value: 'accept', label: t('filters.options.accept') },
                                        { value: 'filter', label: t('filters.options.filter') },
                                        { value: 'drop', label: t('filters.options.drop') },
                                    ].map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </NotificationFilterSelect>
                            </NotificationFilterRow>
                        ))}

                        {/* Pending requests link */}
                        {pendingRequestsCount > 0 && (
                            <NotificationPendingLink href="/notifications/requests">
                                <Filter size={16} />
                                <span>
                                    {t('filtered', { count: pendingRequestsCount })}
                                </span>
                            </NotificationPendingLink>
                        )}
                    </NotificationSettingsPanelContent>
                </NotificationSettingsPanel>
            </NotificationSettingsPanelWrapper>

            {/* Tabs */}
            <Tabs
                tabs={[
                    { value: 'all', label: t('all') },
                    { value: 'mentions', label: t('mentions') },
                ]}
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
                    {error?.message || t('loadError')}
                </div>
            )}

            {!isLoading && !isError && (
                <VirtualizedList<NotificationGroup>
                    items={allGroups}
                    renderItem={(group, _, isFocused) => (
                        <GroupedNotificationCard
                            group={group}
                            accounts={accountsMap}
                            statuses={statusesMap}
                            style={{ marginBottom: 'var(--size-2)' }}
                            isNew={isGroupNew(group)}
                            isFocused={isFocused}
                        />
                    )}
                    onItemOpen={(group) => {
                        const relatedStatus = group.status_id ? statusesMap.get(group.status_id) : undefined;
                        const primaryAccount = group.sample_account_ids[0] ? accountsMap.get(group.sample_account_ids[0]) : undefined;

                        if (relatedStatus) {
                            router.push(`/status/${relatedStatus.id}`);
                        } else if (primaryAccount) {
                            router.push(`/@${primaryAccount.acct}`);
                        }
                    }}
                    getItemKey={(group) => group.most_recent_notification_id}
                    estimateSize={100}
                    onLoadMore={fetchNextPage}
                    isLoadingMore={isFetchingNextPage}
                    hasMore={hasNextPage}
                    scrollRestorationKey={`notifications-v2-${activeTab}`}
                    height="100%"
                    loadingIndicator={<div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--size-4)' }}><div className="spinner" /></div>}
                    endIndicator={t('endOfList')}
                    emptyState={
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--size-8)', textAlign: 'center' }}>
                            <Bell size={48} style={{ color: 'var(--text-3)', marginBottom: 'var(--size-4)' }} />
                            <h2 style={{ fontSize: 'var(--font-size-3)', fontWeight: 'var(--font-weight-6)', color: 'var(--text-2)', marginBottom: 'var(--size-2)' }}>
                                {activeTab === 'mentions' ? t('empty.mentionsTitle') : t('empty.allTitle')}
                            </h2>
                            <p style={{ fontSize: 'var(--font-size-1)', color: 'var(--text-3)' }}>
                                {activeTab === 'mentions'
                                    ? t('empty.mentionsDesc')
                                    : t('empty.allDesc')
                                }
                            </p>
                        </div>
                    }
                />
            )}
        </div>
    );
}
