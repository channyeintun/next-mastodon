'use client';

import { useEffect, useRef } from 'react';

interface UseNavigationBlockerProps {
    isDirty: boolean;
    onBlockedNavigation: (url?: string) => void;
    shouldSkipRef?: React.RefObject<boolean>;
}

/**
 * Hook to block navigation when there are unsaved changes.
 * Handles:
 * 1. Browser refresh/close (beforeunload)
 * 2. Back/Forward buttons (popstate)
 * 3. Clicking internal links (click interception)
 */
export function useNavigationBlocker({ isDirty, onBlockedNavigation, shouldSkipRef }: UseNavigationBlockerProps) {
    const isDirtyRef = useRef(isDirty);

    useEffect(() => {
        isDirtyRef.current = isDirty;
    }, [isDirty]);

    // 1. Handle browser refresh/close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirtyRef.current && !shouldSkipRef?.current) {
                e.preventDefault();
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // 2. Handle internal link clicks
    useEffect(() => {
        const handleAnchorClick = (e: MouseEvent) => {
            if (!isDirtyRef.current || shouldSkipRef?.current) return;

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
    }, [onBlockedNavigation]);

    // 3. Handle back/forward buttons
    useEffect(() => {
        const handlePopState = (_e: PopStateEvent) => {
            if (!isDirtyRef.current || shouldSkipRef?.current) return;

            // If dirty, push the state back so the user stays on the page
            // and show the confirmation modal
            window.history.pushState(null, '', window.location.href);
            onBlockedNavigation();
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [onBlockedNavigation]);
}
