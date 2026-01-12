'use client';

import { useEffect } from 'react';

interface UseNavigationBlockerProps {
    isDirty: boolean;
    onBlockedNavigation: (url?: string) => void;
}

/**
 * Hook to block navigation when there are unsaved changes.
 * Handles:
 * 1. Browser refresh/close (beforeunload)
 * 2. Back/Forward buttons (popstate)
 * 3. Clicking internal links (click interception)
 */
export function useNavigationBlocker({ isDirty, onBlockedNavigation }: UseNavigationBlockerProps) {

    // 1. Handle browser refresh/close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = ''; // Standard way to show browser confirmation
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // 2. Handle internal link clicks
    useEffect(() => {
        if (!isDirty) return;

        const handleAnchorClick = (e: MouseEvent) => {
            // Don't block if it's not a left click
            if (e.button !== 0) return;

            // Don't block if the user is selecting text
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) return;

            const target = (e.target as HTMLElement).closest('a');

            // Check if it's an internal link
            if (target && target.href && !target.target && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
                const url = new URL(target.href);
                if (url.origin === window.location.origin) {
                    // It's an internal navigation
                    e.preventDefault();
                    e.stopPropagation();
                    onBlockedNavigation(target.href);
                }
            }
        };

        // Use capture to intercept before Next.js Link component handles it
        document.addEventListener('click', handleAnchorClick, true);
        return () => document.removeEventListener('click', handleAnchorClick, true);
    }, [isDirty, onBlockedNavigation]);

    // 3. Handle back/forward buttons
    useEffect(() => {
        if (!isDirty) return;

        const handlePopState = (_e: PopStateEvent) => {
            // If dirty, push the state back so the user stays on the page
            // and show the confirmation modal
            window.history.pushState(null, '', window.location.href);
            onBlockedNavigation();
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isDirty, onBlockedNavigation]);
}
