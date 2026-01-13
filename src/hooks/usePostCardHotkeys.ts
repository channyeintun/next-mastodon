import { useMemo } from 'react';
import { useHotkeys } from '@/components/providers/KeyboardShortcutsProvider';

interface PostCardHotkeysProps {
    isFocused: boolean;
    handleReply: () => void;
    handleFavourite: () => void;
    handleReblog: () => void;
    handleQuote: () => void;
    displayStatus: { id: string; account: { acct: string }; media_attachments: any[] };
    hasContentWarning: boolean;
    toggleCWContent: () => void;
    hasSensitiveMedia: boolean;
    toggleCWMedia: () => void;
    handleMediaClick: (index: number) => (e?: any) => void;
    confirmReblog: () => void;
}

export function usePostCardHotkeys({
    isFocused,
    handleReply,
    handleFavourite,
    handleReblog,
    handleQuote,
    displayStatus,
    hasContentWarning,
    toggleCWContent,
    hasSensitiveMedia,
    toggleCWMedia,
    handleMediaClick,
    confirmReblog,
}: PostCardHotkeysProps) {
    const handlers = useMemo(() => {
        if (!isFocused) return {};

        return {
            reply: (e: KeyboardEvent) => {
                e.preventDefault();
                handleReply();
            },
            favourite: (e: KeyboardEvent) => {
                e.preventDefault();
                handleFavourite();
            },
            boost: (e: KeyboardEvent) => {
                e.preventDefault();
                confirmReblog();
            },
            quote: (e: KeyboardEvent) => {
                e.preventDefault();
                handleQuote();
            },
            mention: (e: KeyboardEvent) => {
                e.preventDefault();
                const composer = document.querySelector('.composer-textarea') as HTMLTextAreaElement;
                if (composer) {
                    composer.value = `@${displayStatus.account.acct} ` + composer.value;
                    composer.focus();
                }
            },
            toggleHidden: (e: KeyboardEvent) => {
                if (hasContentWarning) {
                    e.preventDefault();
                    toggleCWContent();
                }
            },
            toggleSensitive: (e: KeyboardEvent) => {
                if (hasSensitiveMedia) {
                    e.preventDefault();
                    toggleCWMedia();
                }
            },
            openMedia: (e: KeyboardEvent) => {
                if (displayStatus.media_attachments.length > 0) {
                    e.preventDefault();
                    handleMediaClick(0)(e);
                }
            },
            onTranslate: (e: KeyboardEvent) => {
                e.preventDefault();
                const translateBtn = document.querySelector('.post-card.is-focused .translate-button') as HTMLButtonElement;
                if (translateBtn) translateBtn.click();
            }
        };
    }, [
        isFocused,
        handleReply,
        handleFavourite,
        handleReblog,
        handleQuote,
        displayStatus,
        hasContentWarning,
        toggleCWContent,
        hasSensitiveMedia,
        toggleCWMedia,
        handleMediaClick,
        confirmReblog
    ]);

    useHotkeys(handlers, { global: true });
}
