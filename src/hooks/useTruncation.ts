import { useState, useEffect, useRef, RefObject } from 'react';

/**
 * Hook to detect if an element's content is truncated (e.g., by line-clamp)
 * Compares scrollHeight vs clientHeight to determine if content overflows
 * 
 * @param deps - Dependencies to trigger re-check (e.g., content changes)
 * @returns { ref, isTruncated, isExpanded, toggle }
 */
export function useTruncation<T extends HTMLElement>(deps: unknown[] = []) {
    const ref = useRef<T>(null);
    const [isTruncated, setIsTruncated] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const checkTruncation = () => {
            if (ref.current) {
                // When expanded, we can't check truncation directly
                // So we temporarily need to check in collapsed state
                if (!isExpanded) {
                    setIsTruncated(ref.current.scrollHeight > ref.current.clientHeight);
                }
            }
        };

        checkTruncation();

        // Also check on resize since layout might change
        window.addEventListener('resize', checkTruncation);
        return () => window.removeEventListener('resize', checkTruncation);
    }, [...deps, isExpanded]);

    const toggle = () => setIsExpanded(prev => !prev);

    return {
        ref,
        isTruncated,
        isExpanded,
        toggle,
    };
}
