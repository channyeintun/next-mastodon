'use client';

import { observer } from 'mobx-react-lite';
import { useNotificationStream } from '@/hooks/useStreaming';

/**
 * Global streaming provider that maintains WebSocket connection
 * for real-time notifications across all pages
 * 
 * Note: Wrapped with observer to react to auth state changes
 */
export const StreamingProvider = observer(function StreamingProvider({ children }: { children: React.ReactNode }) {
    // Initialize streaming connection globally
    // This runs as soon as the user is authenticated
    useNotificationStream();

    return <>{children}</>;
});
