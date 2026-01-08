'use client';

import { useLayoutEffect, useRef, RefObject } from 'react';
import { SCROLL_ANCHOR_OFFSET } from '@/constants/layout';

interface UseDynamicBottomSpacerOptions {
    /** Ref to the anchor element (e.g., main post) */
    anchorRef: RefObject<HTMLElement | null>;
    /** Dependencies that trigger recalculation */
    deps?: unknown[];
}

/**
 * Calculates dynamic bottom spacer height for scroll anchoring.
 * 
 * When content loads above the anchor element (e.g., ancestors in a thread),
 * the browser's native scroll anchoring needs scrollable space below to
 * adjust the scroll position. This hook calculates the minimum height needed
 * to allow the anchor to be positioned at the top of the viewport.
 * 
 * Formula: spacerHeight = viewportHeight - headerHeight - contentBelowAnchorHeight
 * 
 * This optimized version uses direct DOM manipulation for the spacer height
 * to avoid re-rendering the entire parent component.
 * 
 * @returns { headerRef, contentBelowRef, spacerRef }
 */
export function useDynamicBottomSpacer({ anchorRef, deps = [] }: UseDynamicBottomSpacerOptions) {
    const headerRef = useRef<HTMLDivElement>(null);
    const contentBelowRef = useRef<HTMLDivElement>(null);
    const spacerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const calculate = () => {
            const anchor = anchorRef.current;
            const contentBelow = contentBelowRef.current;
            const spacer = spacerRef.current;

            if (!anchor || !spacer) return;

            const viewportHeight = window.innerHeight;
            const anchorHeight = anchor.getBoundingClientRect().height;
            const contentBelowHeight = contentBelow?.getBoundingClientRect().height ?? 0;

            // Ensure anchor can be scrolled to exactly the offset below the top of the viewport.
            // Formula: Space needed below anchor's TOP to fill viewport is (viewportHeight - SCROLL_ANCHOR_OFFSET).
            // This space is filled by the anchor itself and the content below it.
            const requiredSpace = (viewportHeight - SCROLL_ANCHOR_OFFSET) - (anchorHeight + contentBelowHeight);
            const height = Math.max(0, requiredSpace);

            // Direct DOM manipulation to avoid re-renders
            spacer.style.height = `${height}px`;
        };

        calculate();

        // Recalculate on resize
        window.addEventListener('resize', calculate);

        // Recalculate when content below changes size (e.g. images loading)
        const resizeObserver = new ResizeObserver(calculate);
        if (contentBelowRef.current) {
            resizeObserver.observe(contentBelowRef.current);
        }

        return () => {
            window.removeEventListener('resize', calculate);
            resizeObserver.disconnect();
        };
    }, [anchorRef, ...deps]);

    return { headerRef, contentBelowRef, spacerRef };
}
