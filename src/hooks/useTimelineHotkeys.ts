import { useEffect, useCallback } from 'react';
import { useHotkeys, useKeyboardShortcuts } from '@/components/providers/KeyboardShortcutsProvider';

interface TimelineHotkeysProps {
    itemsCount: number;
    onOpen?: (index: number) => void;
    virtualizer?: any; // TanStack Virtualizer instance
    autoScroll?: boolean;
    enabled?: boolean;
}

/**
 * Reusable hook for timeline-like navigation (j, k, 0, enter)
 */
export function useTimelineHotkeys({
    itemsCount,
    onOpen,
    virtualizer,
    autoScroll = true,
    enabled = true,
}: TimelineHotkeysProps) {
    const { focusedIndex, setFocusedIndex } = useKeyboardShortcuts();

    // Reset focus on mount to avoid carrying over focus from other pages
    useEffect(() => {
        setFocusedIndex(-1);
    }, [setFocusedIndex]);

    const handleMoveDown = useCallback(() => {
        setFocusedIndex(Math.min(itemsCount - 1, focusedIndex + 1));
    }, [focusedIndex, itemsCount, setFocusedIndex]);

    const handleMoveUp = useCallback(() => {
        setFocusedIndex(Math.max(0, focusedIndex - 1));
    }, [focusedIndex, setFocusedIndex]);

    const handleMoveToTop = useCallback(() => {
        setFocusedIndex(0);
        if (autoScroll) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [setFocusedIndex, autoScroll]);

    const handleOpen = useCallback(() => {
        if (focusedIndex >= 0 && onOpen) {
            onOpen(focusedIndex);
        }
    }, [focusedIndex, onOpen]);

    useHotkeys({
        moveDown: handleMoveDown,
        moveUp: handleMoveUp,
        moveToTop: handleMoveToTop,
        open: handleOpen,
    }, { global: true, enabled });

    // Scroll to focused item when it changes
    useEffect(() => {
        if (focusedIndex >= 0 && autoScroll) {
            if (virtualizer) {
                virtualizer.scrollToIndex(focusedIndex, { align: 'center', behavior: 'smooth' });
            } else {
                // Fallback for non-virtualized lists
                const element = document.querySelector(`[data-index="${focusedIndex}"]`);
                if (element) {
                    element.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }
            }
        }
    }, [focusedIndex, virtualizer, autoScroll]);

    return {
        focusedIndex,
        setFocusedIndex,
    };
}
