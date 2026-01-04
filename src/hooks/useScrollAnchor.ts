'use client';

import { useRef, useLayoutEffect, useEffect, RefObject } from 'react';

export interface UseScrollAnchorOptions {
    /** Whether the target element is ready for initial scroll */
    isReady: boolean;
    /** Unique key to reset scroll state (e.g., statusId for route changes) */
    key?: string;
    /** Ref to the anchor element (optional, will create one if not provided) */
    anchorRef?: RefObject<HTMLDivElement | null>;
    /** Ref to the container of elements ABOVE the anchor (for Safari polyfill) */
    ancestorsRef?: RefObject<HTMLElement | null>;
    /** Additional dependencies to trigger polyfill initialization */
    deps?: unknown[];
}

/**
 * Ported from the local document-level scroll-anchoring library.
 * Scrolls the container and any scroll ancestors until the desired offset is reached.
 */
function cumulativeScrollBy(element: HTMLElement, x: number, y: number) {
    const doc = element.ownerDocument;
    const win = doc.defaultView;
    if (!win) return;

    function getScrollOffsets(el: any) {
        if (el.offsetParent) {
            return { top: el.scrollTop, left: el.scrollLeft };
        } else {
            return { top: win!.pageYOffset, left: win!.pageXOffset };
        }
    }

    function scrollBy(el: any, dx: number, dy: number) {
        if (dx === 0 && dy === 0) return [0, 0];
        const orig = getScrollOffsets(el);
        const top = orig.top + dy;
        const left = orig.left + dx;

        if (el === doc || el === win || el === doc.documentElement || el === doc.body) {
            win!.scrollTo(left, top);
        } else {
            el.scrollTop = top;
            el.scrollLeft = left;
        }

        const next = getScrollOffsets(el);
        return [next.left - orig.left, next.top - orig.top];
    }

    function overflowParent(el: HTMLElement): HTMLElement | undefined {
        let parent = el;
        if (!parent.offsetParent || parent === doc.body) return;

        while (parent !== doc.body) {
            if (parent.parentElement) {
                parent = parent.parentElement;
            } else {
                return;
            }
            const style = win!.getComputedStyle(parent);
            if (
                style.position === 'fixed' ||
                style.overflowY === 'auto' ||
                style.overflowX === 'auto' ||
                style.overflowY === 'scroll' ||
                style.overflowX === 'scroll'
            ) {
                break;
            }
        }
        return parent;
    }

    let container = overflowParent(element);
    let cumulativeX = 0;
    let cumulativeY = 0;

    while (container) {
        const scrolled = scrollBy(container, x - cumulativeX, y - cumulativeY);
        cumulativeX += scrolled[0];
        cumulativeY += scrolled[1];
        if (cumulativeX === x && cumulativeY === y) break;
        container = overflowParent(container);
    }
}

/**
 * Hook to scroll to an anchor element on initial load and on route changes.
 * 
 * Ported strategy from the project's scroll-anchoring library:
 * Instead of ResizeObserver on a container, we track the anchor's viewport 
 * position and restore it whenever mutations occur in the ancestor container.
 */
export function useScrollAnchor({ isReady, key, anchorRef: externalAnchorRef, ancestorsRef, deps = [] }: UseScrollAnchorOptions) {
    const internalAnchorRef = useRef<HTMLDivElement>(null);
    const anchorRef = externalAnchorRef || internalAnchorRef;

    const hasScrolledRef = useRef(false);
    const prevKeyRef = useRef(key);

    // Track the last known viewport position of the anchor
    const lastPosRef = useRef<{ top: number; left: number } | null>(null);

    // Reset scroll state when key changes
    useLayoutEffect(() => {
        if (key !== prevKeyRef.current) {
            hasScrolledRef.current = false;
            prevKeyRef.current = key;
            lastPosRef.current = null;
        }
    }, [key]);

    // Initial scroll to anchor
    useEffect(() => {
        if (isReady && !hasScrolledRef.current) {
            const anchor = anchorRef.current;
            if (anchor) {
                const rafId = requestAnimationFrame(() => {
                    // Manual scroll calculation to ensure 88px offset is respected consistently
                    // This avoids potential issues with Safari's scrollIntoView + scroll-margin-top
                    const rect = anchor.getBoundingClientRect();
                    const targetTop = window.scrollY + rect.top - 88;

                    window.scrollTo({ top: targetTop, behavior: 'instant' });
                    hasScrolledRef.current = true;

                    // Capture baseline position immediately after manual scroll
                    // The new top should theoretically be 88px
                    const newRect = anchor.getBoundingClientRect();
                    lastPosRef.current = { top: newRect.top, left: newRect.left };
                });
                return () => cancelAnimationFrame(rafId);
            }
        }
    }, [isReady, key, anchorRef]);

    // Safari Polyfill: Ported preservePosition logic using MutationObserver
    useEffect(() => {
        if (typeof window === 'undefined' || !ancestorsRef) return;
        // Skip if native is supported
        if (CSS.supports?.('overflow-anchor', 'auto')) return;

        const container = ancestorsRef.current;
        if (!container) return;

        const observer = new MutationObserver(() => {
            if (!hasScrolledRef.current || !anchorRef.current || !lastPosRef.current) return;

            const node = anchorRef.current;
            const { top, left } = node.getBoundingClientRect();
            const dx = left - lastPosRef.current.left;
            const dy = top - lastPosRef.current.top;

            if (dx !== 0 || dy !== 0) {
                // Restore the anchor to its previous viewport position
                cumulativeScrollBy(node, dx, dy);

                // Note: After cumulativeScrollBy, the getBoundingClientRect().top 
                // should be back to lastPosRef.current.top.
            }
        });

        observer.observe(container, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        });

        return () => observer.disconnect();
    }, [ancestorsRef, key, ...deps]);

    return anchorRef;
}
