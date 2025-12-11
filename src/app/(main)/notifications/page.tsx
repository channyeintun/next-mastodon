'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

    // Show loading state while checking instance version
    if (isLoadingInstance) {
        return (
            <div className="full-height-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="virtualized-list-container" style={{ flex: 1, overflow: 'auto', padding: 'var(--size-4)' }}>
                    <NotificationSkeletonList count={6} />
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
