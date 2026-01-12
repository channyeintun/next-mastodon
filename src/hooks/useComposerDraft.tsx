'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { useDraftStore } from './useStores';
import { SaveDraftConfirmationModal, DiscardChangesModal } from '@/components/molecules';
import { useNavigationBlocker } from './useNavigationBlocker';
import type { Draft } from '@/stores/draftStore';

interface UseComposerDraftProps {
    editMode: boolean;
    isReply: boolean;
    quotedStatusId?: string;
    scheduledStatusId?: string;
    mentionPrefix?: string;
    initialContent: string;
    isDirty: boolean;
    draftData: Draft;
    onRestore: (draft: Draft) => void;
    modalContext: any;
}

export function useComposerDraft({
    editMode,
    isReply,
    quotedStatusId,
    scheduledStatusId,
    mentionPrefix,
    initialContent,
    isDirty,
    draftData,
    onRestore,
    modalContext,
}: UseComposerDraftProps) {
    const draftStore = useDraftStore();
    const { openModal, closeModal } = useGlobalModal();
    const router = useRouter();
    const [shouldSkipBlocker, setShouldSkipBlocker] = useState(false);
    const skipBlockerRef = useRef(false);
    const pendingNavigationRef = useRef<string | null>(null);

    const skipBlocker = useCallback(() => {
        skipBlockerRef.current = true;
        setShouldSkipBlocker(true);
    }, []);

    // Restore draft for NEW posts
    useEffect(() => {
        if (!editMode && draftStore.draft && !isReply && !quotedStatusId && !scheduledStatusId && !mentionPrefix && !initialContent) {
            onRestore(draftStore.draft);
        }
    }, [editMode, draftStore.draft, isReply, quotedStatusId, scheduledStatusId, mentionPrefix, initialContent, onRestore]);

    const handleSaveDraft = useCallback(() => {
        draftStore.setDraft(draftData);
    }, [draftStore, draftData]);

    const handleDiscardDraft = useCallback(() => {
        draftStore.clearDraft();
        skipBlocker();
    }, [draftStore, skipBlocker]);

    const handleBlockedNavigation = useCallback((url?: string) => {
        pendingNavigationRef.current = url || null;
        const isNewPost = !editMode && !isReply;

        openModal(
            isNewPost ? (
                <SaveDraftConfirmationModal
                    onSave={() => {
                        handleSaveDraft();
                        closeModal();
                        if (pendingNavigationRef.current) {
                            router.push(pendingNavigationRef.current);
                        } else {
                            router.back();
                        }
                    }}
                    onDiscard={() => {
                        handleDiscardDraft();
                        closeModal();
                        if (pendingNavigationRef.current) {
                            router.push(pendingNavigationRef.current);
                        } else {
                            router.back();
                        }
                    }}
                    onCancel={closeModal}
                />
            ) : (
                <DiscardChangesModal
                    onDiscard={() => {
                        skipBlocker();
                        closeModal();
                        if (pendingNavigationRef.current) {
                            router.push(pendingNavigationRef.current);
                        } else {
                            router.back();
                        }
                    }}
                    onCancel={closeModal}
                />
            )
        );
    }, [openModal, closeModal, router, handleSaveDraft, handleDiscardDraft]);

    useNavigationBlocker({
        isDirty: isDirty && !shouldSkipBlocker,
        shouldSkipRef: skipBlockerRef,
        onBlockedNavigation: handleBlockedNavigation,
    });

    const actualIsDirty = isDirty && !shouldSkipBlocker;

    const handleModalCloseRequest = useCallback(() => {
        handleBlockedNavigation();
    }, [handleBlockedNavigation]);

    useEffect(() => {
        if (!modalContext) return;

        modalContext.setIsDirty(actualIsDirty);
        modalContext.registerOnCloseHandler(actualIsDirty ? handleModalCloseRequest : null);

        return () => {
            modalContext.registerOnCloseHandler(null);
        };
    }, [actualIsDirty, modalContext, handleModalCloseRequest]);

    return {
        skipBlocker,
        handleDiscardDraft,
    };
}
