'use client';

import { useRef, useLayoutEffect } from 'react';

interface UseScrollAnchorOptions {
    /** Whether the target element is ready for initial scroll */
    isReady: boolean;
    /** Unique key to reset scroll state (e.g., statusId for route changes) */
    key?: string;
}

/**
 * Hook to scroll to an anchor element on initial load and on route changes.
 * 
 * Native CSS scroll anchoring (via overflow-anchor) handles keeping the anchor
 * in place when content above it changes. 
 * 
 * NOTE: Native scroll anchoring is NOT supported in Safari.
 * 
 * This hook handles:
 * 1. Initial scroll to the anchor when ready
 * 2. Reset scroll state when key changes (e.g., navigating to a different status)
 * 
 * @returns ref to attach to the anchor element
 */
export function useScrollAnchor({ isReady, key }: UseScrollAnchorOptions) {
    const anchorRef = useRef<HTMLDivElement>(null);
    const hasScrolledRef = useRef(false);
    const prevKeyRef = useRef(key);

    // Reset scroll state when key changes (e.g., navigating to a different status)
    useLayoutEffect(() => {
        if (key !== prevKeyRef.current) {
            hasScrolledRef.current = false;
            prevKeyRef.current = key;
        }
    }, [key]);

    // Initial scroll to anchor when ready
    useLayoutEffect(() => {
        if (isReady && !hasScrolledRef.current) {
            const anchor = anchorRef.current;
            if (anchor) {
                // Use requestAnimationFrame to ensure layout is complete
                requestAnimationFrame(() => {
                    anchor.scrollIntoView({ behavior: 'instant', block: 'start' });
                    hasScrolledRef.current = true;
                });
            }
        }
    }, [isReady, key]);

    return anchorRef;
}
