'use client';

import { useEffect } from 'react';

/**
 * Locks body scroll when the condition is true.
 * Useful for preventing scroll during initial data fetching
 * to avoid virtualized list measurement issues.
 *
 * @param locked - Whether to lock scrolling (true = locked, false = unlocked)
 */
export function useLockBodyScroll(locked: boolean): void {
    useEffect(() => {
        if (locked) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [locked]);
}
