'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useInstance } from '@/api';
import { useNotificationStream } from '@/hooks/useStreaming';
import { useAuthStore } from '@/hooks/useStores';
import { NotificationsV1 } from './NotificationsV1';
import { NotificationsV2 } from './NotificationsV2';
import { NotificationSkeletonList } from '@/components/molecules';

// Helper to check if the Mastodon version supports grouped notifications (v2 API)
// Grouped notifications were added in Mastodon 4.3.0
function supportsGroupedNotifications(version: string | undefined): boolean {
    if (!version) return false;

    // Parse version string (e.g., "4.3.0", "4.3.0-alpha.1", "4.2.1+glitch")
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
    if (!match) return false;

    const major = parseInt(match[1], 10);
    const minor = parseInt(match[2], 10);

    // v2 grouped notifications require Mastodon 4.3.0+
    return major > 4 || (major === 4 && minor >= 3);
}

export default function NotificationsPage() {
    const router = useRouter();
    const authStore = useAuthStore();

    // Get instance info to check version
    const { data: instanceData, isLoading: isLoadingInstance } = useInstance();

    // Start streaming connection
    const { status: streamingStatus } = useNotificationStream();

    // Redirect if not authenticated
    useEffect(() => {
        if (!authStore.isAuthenticated) {
            router.push('/');
        }
    }, [authStore.isAuthenticated, router]);

    if (!authStore.isAuthenticated) {
        return null;
    }

    // Show skeleton while loading instance data (prevents notification queries from firing)
    if (isLoadingInstance) {
        return (
            <div className="full-height-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
                {/* Header skeleton */}
                <div style={{ padding: 'var(--size-3) var(--size-4)', display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                    <Bell size={24} />
                    <h1 style={{ fontSize: 'var(--font-size-4)', fontWeight: 'var(--font-weight-7)', margin: 0 }}>
                        Notifications
                    </h1>
                </div>

                {/* Tabs skeleton - matches Tabs component underline variant */}
                {/* Tabs skeleton - matches Tabs component underline variant */}
                <div style={{
                    padding: '0 var(--size-4)',
                    marginBottom: 'var(--size-3)',
                    display: 'flex',
                    // gap: 'var(--size-4)', // Removed gap to match typical flex:1 tab behavior if needed, or keep it. 
                    // Usually tabs with flex:1 don't strictly need gap if they fill space, but let's keep gap=0 for equal split
                    gap: 0,
                    borderBottom: '1px solid var(--surface-3)',
                    position: 'relative'
                }}>
                    <div style={{
                        flex: 1,
                        padding: 'var(--size-3) var(--size-4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div className="skeleton" style={{ height: '14px', width: '32px', borderRadius: '4px' }} />
                    </div>
                    <div style={{
                        flex: 1,
                        padding: 'var(--size-3) var(--size-4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div className="skeleton" style={{ height: '14px', width: '64px', borderRadius: '4px' }} />
                    </div>

                    {/* Active tab indicator simulation */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-1px',
                        left: 0,
                        width: '50%', // 50% width since there are 2 equal tabs
                        height: '3px',
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            background: 'var(--blue-6)',
                            borderRadius: '3px 3px 0 0'
                        }} />
                    </div>
                </div>

                {/* Skeleton list */}
                <div className="virtualized-list-container" style={{ flex: 1, overflow: 'auto' }}>
                    <NotificationSkeletonList />
                </div>
            </div>
        );
    }

    // Determine which version to use based on server capabilities
    const useV2 = supportsGroupedNotifications(instanceData?.version);

    // Render the appropriate notifications component
    if (useV2) {
        return <NotificationsV2 streamingStatus={streamingStatus} />;
    }

    return <NotificationsV1 streamingStatus={streamingStatus} />;
}
