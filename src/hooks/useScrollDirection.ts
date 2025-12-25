import { useEffect, useRef, useState, type RefObject } from 'react';

export type ScrollDirection = 'up' | 'down' | null;

interface UseScrollDirectionOptions {
    /**
     * Minimum scroll distance from top before showing scroll-to-top button
     * @default 200
     */
    threshold?: number;

    /**
     * Distance from top where button should hide regardless of scroll direction
     * @default 100
     */
    hideNearTopDistance?: number;
}

interface UseScrollDirectionResult {
    /**
     * Current scroll direction
     */
    scrollDirection: ScrollDirection;

    /**
     * Whether the scroll-to-top button should be visible
     */
    showScrollTop: boolean;

    /**
     * Manually hide the scroll-to-top button
     */
    hideScrollTop: () => void;
}

/**
 * Hook to detect scroll direction and manage scroll-to-top button visibility
 * Shows button when scrolling up (after scrolling past threshold), hides when scrolling down
 */
export function useScrollDirection(
    scrollRef: RefObject<HTMLElement | null>,
    options: UseScrollDirectionOptions = {}
): UseScrollDirectionResult {
    const { threshold = 200, hideNearTopDistance = 100 } = options;

    const lastScrollOffset = useRef(0);
    const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (!scrollElement) return;

        const handleScroll = () => {
            const currentOffset = scrollElement.scrollTop;
            const isScrollingUp = currentOffset < lastScrollOffset.current;
            const isScrollingDown = currentOffset > lastScrollOffset.current;
            const hasScrolledEnough = currentOffset > threshold;

            // Update scroll direction
            if (isScrollingUp) {
                setScrollDirection('up');
            } else if (isScrollingDown) {
                setScrollDirection('down');
            }

            // Show when scrolling up and scrolled enough, hide when scrolling down
            if (isScrollingUp && hasScrolledEnough) {
                setShowScrollTop(true);
            } else if (isScrollingDown) {
                setShowScrollTop(false);
            }

            // Hide when near top
            if (currentOffset < hideNearTopDistance) {
                setShowScrollTop(false);
            }

            lastScrollOffset.current = currentOffset;
        };

        scrollElement.addEventListener('scroll', handleScroll, { passive: true });
        return () => scrollElement.removeEventListener('scroll', handleScroll);
    }, [threshold, hideNearTopDistance, scrollRef]);

    const hideScrollTop = () => setShowScrollTop(false);

    return {
        scrollDirection,
        showScrollTop,
        hideScrollTop,
    };
}

/**
 * Hook to detect window scroll direction and manage scroll-to-top button visibility
 * Use this variant when using useWindowVirtualizer or window-based scrolling
 */
export function useWindowScrollDirection(
    options: UseScrollDirectionOptions = {}
): UseScrollDirectionResult {
    const { threshold = 200, hideNearTopDistance = 100 } = options;

    const lastScrollOffset = useRef(0);
    const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentOffset = window.scrollY;
            const isScrollingUp = currentOffset < lastScrollOffset.current;
            const isScrollingDown = currentOffset > lastScrollOffset.current;
            const hasScrolledEnough = currentOffset > threshold;

            // Update scroll direction
            if (isScrollingUp) {
                setScrollDirection('up');
            } else if (isScrollingDown) {
                setScrollDirection('down');
            }

            // Show when scrolling up and scrolled enough, hide when scrolling down
            if (isScrollingUp && hasScrolledEnough) {
                setShowScrollTop(true);
            } else if (isScrollingDown) {
                setShowScrollTop(false);
            }

            // Hide when near top
            if (currentOffset < hideNearTopDistance) {
                setShowScrollTop(false);
            }

            lastScrollOffset.current = currentOffset;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold, hideNearTopDistance]);

    const hideScrollTop = () => setShowScrollTop(false);

    return {
        scrollDirection,
        showScrollTop,
        hideScrollTop,
    };
}
