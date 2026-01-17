'use client';

import { useEffect } from 'react';

/**
 * Custom hook to warn users about unsaved changes when they try to leave the page.
 * 
 * This handles browser-level navigation (close tab, refresh, external links).
 * Note: For Next.js client-side navigation (router.push, router.back, <Link>),
 * you need to handle navigation interception separately at the component level.
 * 
 * @param isDirty - Whether there are unsaved changes
 */
export function useUnsavedChanges(isDirty: boolean): void {
    useEffect(() => {
        if (!isDirty) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            // Legacy support - some browsers still require returnValue
            e.returnValue = true;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);
}
