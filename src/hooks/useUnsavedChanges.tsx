'use client';

import { useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface UseUnsavedChangesOptions {
    hasUnsavedChanges: boolean;
    onSaveDraft?: () => Promise<void> | void;
    openModal?: (content: ReactNode, onClose?: () => void) => void;
    closeModal?: () => void;
    SaveModalComponent?: React.ComponentType<{
        onSave: () => void;
        onDiscard: () => void;
        onCancel: () => void;
    }>;
}

export function useUnsavedChanges({
    hasUnsavedChanges,
    onSaveDraft,
    openModal,
    closeModal,
    SaveModalComponent,
}: UseUnsavedChangesOptions) {
    const router = useRouter();
    const pathname = usePathname();
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
    const hasUnsavedRef = useRef(hasUnsavedChanges);
    const isNavigatingRef = useRef(false);
    const pathnameRef = useRef(pathname);
    const isDecisionMadeRef = useRef(false);
    const trapEstablishedRef = useRef(false);
    const pendingNavigationRef = useRef<string | null>(null);

    // Sync props with refs to avoid re-running effects when callbacks change
    const propsRef = useRef({
        onSaveDraft,
        openModal,
        closeModal,
        SaveModalComponent,
    });

    useEffect(() => {
        hasUnsavedRef.current = hasUnsavedChanges;
    }, [hasUnsavedChanges]);

    useEffect(() => {
        pathnameRef.current = pathname;
    }, [pathname]);

    useEffect(() => {
        pendingNavigationRef.current = pendingNavigation;
    }, [pendingNavigation]);

    useEffect(() => {
        propsRef.current = {
            onSaveDraft,
            openModal,
            closeModal,
            SaveModalComponent,
        };
    }, [onSaveDraft, openModal, closeModal, SaveModalComponent]);

    const handleCancel = useCallback(() => {
        if (isDecisionMadeRef.current) return;
        setPendingNavigation(null);
        propsRef.current.closeModal?.();
    }, []);

    const executeNavigation = useCallback((target: string) => {
        isNavigatingRef.current = true;
        if (target === 'back') {
            // When using a history trap, we go back once to clear the trap 
            // and once more to reach the true previous page.
            if (trapEstablishedRef.current) {
                window.history.go(-2);
            } else {
                window.history.back();
            }
        } else {
            router.push(target);
        }
    }, [router]);

    const handleSaveAndLeave = useCallback(async () => {
        isDecisionMadeRef.current = true;
        await propsRef.current.onSaveDraft?.();
        propsRef.current.closeModal?.();

        if (pendingNavigationRef.current) {
            executeNavigation(pendingNavigationRef.current);
        }
    }, [executeNavigation]);

    const handleLeaveWithoutSaving = useCallback(() => {
        isDecisionMadeRef.current = true;
        propsRef.current.closeModal?.();

        if (pendingNavigationRef.current) {
            executeNavigation(pendingNavigationRef.current);
        }
    }, [executeNavigation]);

    // Handle browser back/forward
    useEffect(() => {
        if (!hasUnsavedChanges) {
            trapEstablishedRef.current = false;
            return;
        }

        // Establish trap only once
        if (!trapEstablishedRef.current) {
            window.history.pushState({ trap: true }, '', window.location.href);
            trapEstablishedRef.current = true;
        }

        const handlePopState = (_e: PopStateEvent) => {
            if (isNavigatingRef.current) return;

            if (hasUnsavedRef.current) {
                // Re-establish trap to stay on current page
                window.history.pushState({ trap: true }, '', window.location.href);
                setPendingNavigation('back');
                isDecisionMadeRef.current = false;

                const SaveModal = propsRef.current.SaveModalComponent;
                if (propsRef.current.openModal && SaveModal) {
                    propsRef.current.openModal(
                        <SaveModal
                            onSave={handleSaveAndLeave}
                            onDiscard={handleLeaveWithoutSaving}
                            onCancel={handleCancel}
                        />,
                        handleCancel
                    );
                }
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [hasUnsavedChanges, handleSaveAndLeave, handleLeaveWithoutSaving, handleCancel]);

    // Handle Next.js Link clicks
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (!hasUnsavedRef.current || isNavigatingRef.current) return;

            const target = (e.target as HTMLElement).closest('a');
            if (!target) return;

            const href = target.getAttribute('href');
            if (
                !href ||
                href.startsWith('#') ||
                href.startsWith('http') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                target.target === '_blank' ||
                e.ctrlKey ||
                e.metaKey ||
                e.shiftKey ||
                e.altKey ||
                href === pathnameRef.current
            ) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            setPendingNavigation(href);
            isDecisionMadeRef.current = false;

            const SaveModal = propsRef.current.SaveModalComponent;
            if (propsRef.current.openModal && SaveModal) {
                propsRef.current.openModal(
                    <SaveModal
                        onSave={handleSaveAndLeave}
                        onDiscard={handleLeaveWithoutSaving}
                        onCancel={handleCancel}
                    />,
                    handleCancel
                );
            }
        };

        document.addEventListener('click', handleClick, true);
        return () => document.removeEventListener('click', handleClick, true);
    }, [handleSaveAndLeave, handleLeaveWithoutSaving, handleCancel]);

    // Handle page refresh/close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedRef.current) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    return {
        isNavigating: isNavigatingRef.current,
    };
}
