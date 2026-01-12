'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { useDraftStore } from './useStores';
import { SaveDraftConfirmationModal } from '@/components/molecules';
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
    const skipBlockerRef = useRef(false);
    const pendingNavigationRef = useRef<string | null>(null);

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
        skipBlockerRef.current = true;
    }, [draftStore]);

    const handleBlockedNavigation = useCallback((url?: string) => {
        pendingNavigationRef.current = url || null;
        openModal(
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
        );
    }, [openModal, closeModal, router, handleSaveDraft, handleDiscardDraft]);

    useNavigationBlocker({
        isDirty: isDirty && !skipBlockerRef.current,
        onBlockedNavigation: handleBlockedNavigation,
    });

    const handleModalCloseRequest = useCallback(() => {
        handleBlockedNavigation();
    }, [handleBlockedNavigation]);

    useEffect(() => {
        if (modalContext) {
            modalContext.setIsDirty(isDirty && !skipBlockerRef.current);
            modalContext.registerOnCloseHandler((isDirty && !skipBlockerRef.current) ? handleModalCloseRequest : null);
        }
        return () => {
            if (modalContext) {
                modalContext.registerOnCloseHandler(null);
            }
        };
    }, [isDirty, modalContext, handleModalCloseRequest]);

    return {
        skipBlocker: () => { skipBlockerRef.current = true; },
        handleDiscardDraft,
    };
}
