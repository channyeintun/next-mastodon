'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { normalizeKey, isKeyboardEvent } from '@/utils/keyboardUtils';
import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { KeyboardShortcutsLegend } from '@/components/molecules/KeyboardShortcutsLegend';
import { useRouter } from 'next/navigation';
import { useCurrentAccount } from '@/api';

// Define the priority for different types of hotkeys
const hotkeyPriority = { singleKey: 0, combo: 1, sequence: 2 } as const;

type KeyMatcher = (
    event: KeyboardEvent,
    bufferedKeys?: string[],
) => {
    isMatch: boolean;
    priority: (typeof hotkeyPriority)[keyof typeof hotkeyPriority];
};

const just = (keyName: string): KeyMatcher => (event) => ({
    isMatch:
        normalizeKey(event.key) === keyName &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey,
    priority: hotkeyPriority.singleKey,
});

const any = (...keys: string[]): KeyMatcher => (event) => ({
    isMatch: keys.some((keyName) => just(keyName)(event).isMatch),
    priority: hotkeyPriority.singleKey,
});

const optionPlus = (key: string): KeyMatcher => (event) => ({
    isMatch: event.altKey && event.code === `Key${key.toUpperCase()}`,
    priority: hotkeyPriority.combo,
});

const sequence = (...seq: string[]): KeyMatcher => (event, bufferedKeys) => {
    const lastKeyInSequence = seq.at(-1);
    const startOfSequence = seq.slice(0, -1);
    const relevantBufferedKeys = bufferedKeys?.slice(-startOfSequence.length);

    const bufferMatchesStartOfSequence =
        !!relevantBufferedKeys &&
        startOfSequence.join('') === relevantBufferedKeys.join('');

    return {
        isMatch:
            bufferMatchesStartOfSequence &&
            normalizeKey(event.key) === lastKeyInSequence,
        priority: hotkeyPriority.sequence,
    };
};

export const hotkeyMatcherMap = {
    help: just('?'),
    search: any('s', '/'),
    back: any('backspace', 'esc'),
    new: just('n'),
    forceNew: optionPlus('n'),
    reply: just('r'),
    favourite: just('f'),
    boost: just('b'),
    quote: just('q'),
    mention: just('m'),
    open: any('enter', 'o'),
    openProfile: just('p'),
    moveDown: just('j'),
    moveUp: just('k'),
    moveToTop: just('0'),
    toggleHidden: just('x'),
    toggleSensitive: just('h'),
    toggleComposeSpoilers: optionPlus('x'),
    openMedia: just('e'),
    onTranslate: just('t'),
    goToHome: sequence('g', 'h'),
    goToNotifications: sequence('g', 'n'),
    goToLocal: sequence('g', 'l'),
    goToDirect: sequence('g', 'd'),
    goToFavourites: sequence('g', 'f'),
    goToPinned: sequence('g', 'p'),
    goToProfile: sequence('g', 'u'),
    goToBlocked: sequence('g', 'b'),
    goToMuted: sequence('g', 'm'),
    goToRequests: sequence('g', 'r'),
} as const;

export type HotkeyName = keyof typeof hotkeyMatcherMap;

export type HandlerMap = Partial<
    Record<HotkeyName, (event: KeyboardEvent) => void>
>;

interface KeyboardShortcutsContextType {
    focusedIndex: number;
    setFocusedIndex: (index: number) => void;
    isLegendOpen: boolean;
    setIsLegendOpen: (open: boolean) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export const KeyboardShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);
    const { openModal, closeModal, isOpen: isModalOpen } = useGlobalModal();
    const router = useRouter();
    const { data: currentAccount } = useCurrentAccount();

    useEffect(() => {
        if (isLegendOpen) {
            openModal(<KeyboardShortcutsLegend />, () => setIsLegendOpen(false));
        }
    }, [isLegendOpen, openModal]);

    const handleBack = useCallback(() => {
        if (isLegendOpen || isModalOpen) {
            closeModal();
        } else {
            router.back();
        }
    }, [isLegendOpen, isModalOpen, closeModal, router]);

    const handleFocusSearch = useCallback((e: KeyboardEvent) => {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
            searchInput.focus();
        } else {
            router.push('/search');
        }
    }, [router]);

    const handleCompose = useCallback((e: KeyboardEvent) => {
        e.preventDefault();
        router.push('/compose');
    }, [router]);

    const navigateToProfile = useCallback(() => {
        if (currentAccount) {
            router.push(`/@${currentAccount.acct}`);
        } else {
            router.push('/profile');
        }
    }, [currentAccount, router]);

    useHotkeys({
        help: () => setIsLegendOpen(true),
        back: handleBack,
        new: handleCompose,
        search: handleFocusSearch,
        goToHome: () => router.push('/'),
        goToNotifications: () => router.push('/notifications'),
        goToLocal: () => router.push('/explore'),
        goToDirect: () => router.push('/conversations'),
        goToFavourites: () => router.push('/bookmarks'),
        goToPinned: navigateToProfile,
        goToProfile: navigateToProfile,
        goToBlocked: () => router.push('/settings/blocks'),
        goToMuted: () => router.push('/settings/mutes'),
        goToRequests: () => router.push('/follow-requests'),
    }, { global: true });

    const value = React.useMemo(() => ({
        focusedIndex,
        setFocusedIndex,
        isLegendOpen,
        setIsLegendOpen,
    }), [focusedIndex, isLegendOpen]);

    return (
        <KeyboardShortcutsContext.Provider value={value}>
            {children}
        </KeyboardShortcutsContext.Provider>
    );
};

export const useKeyboardShortcuts = () => {
    const context = useContext(KeyboardShortcutsContext);
    if (context === undefined) {
        throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
    }
    return context;
};

export function useHotkeys(handlers: HandlerMap, options: { global?: boolean; enabled?: boolean } = {}) {
    const { global, enabled = true } = options;
    const bufferedKeys = useRef<string[]>([]);
    const sequenceTimer = useRef<NodeJS.Timeout | null>(null);
    const handlersRef = useRef(handlers);

    useEffect(() => {
        handlersRef.current = handlers;
    }, [handlers]);

    useEffect(() => {
        if (!enabled) return;
        const listener = (event: Event) => {
            const target = event.target as HTMLElement;
            const tagName = target.tagName.toLowerCase();
            const isEditable = target.isContentEditable ||
                ['input', 'textarea', 'select'].includes(tagName);

            const shouldHandleEvent =
                isKeyboardEvent(event) &&
                !event.defaultPrevented &&
                !isEditable &&
                !(
                    ['a', 'button'].includes(tagName) &&
                    normalizeKey(event.key) === 'enter'
                );

            if (shouldHandleEvent) {
                const matchCandidates: {
                    handler: ((event: KeyboardEvent) => void) | undefined;
                    priority: number;
                }[] = [];

                (Object.keys(hotkeyMatcherMap) as HotkeyName[]).forEach((handlerName) => {
                    const handler = handlersRef.current[handlerName];
                    const hotkeyMatcher = hotkeyMatcherMap[handlerName];

                    const { isMatch, priority } = hotkeyMatcher(
                        event,
                        bufferedKeys.current,
                    );

                    if (isMatch && handler) {
                        matchCandidates.push({ handler, priority });
                    }
                });

                matchCandidates.sort((a, b) => b.priority - a.priority);

                const bestMatchingHandler = matchCandidates.at(0)?.handler;
                if (bestMatchingHandler) {
                    bestMatchingHandler(event);
                    event.stopPropagation();
                    event.preventDefault();
                }

                bufferedKeys.current.push(normalizeKey(event.key));

                if (sequenceTimer.current) {
                    clearTimeout(sequenceTimer.current);
                }
                sequenceTimer.current = setTimeout(() => {
                    bufferedKeys.current = [];
                }, 1000);
            }
        };

        const element = global ? document : null;
        if (element) {
            element.addEventListener('keydown', listener);
            return () => {
                element.removeEventListener('keydown', listener);
                if (sequenceTimer.current) clearTimeout(sequenceTimer.current);
            };
        }
    }, [global, enabled]);
}
