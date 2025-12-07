'use client';

import { useNotificationStream } from '@/hooks/useStreaming';

/**
 * Global streaming provider that maintains WebSocket connection
 * for real-time notifications across all pages
 */
export function StreamingProvider({ children }: { children: React.ReactNode }) {
    // Initialize streaming connection globally
    // This runs as soon as the user is authenticated
    useNotificationStream();

    return <>{children}</>;
}
