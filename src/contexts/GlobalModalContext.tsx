'use client';

import React, { createContext, use, useState, ReactNode, useCallback, useRef } from 'react';

interface GlobalModalContextType {
    isOpen: boolean;
    openModal: (content: ReactNode, onClose?: () => void) => void;
    closeModal: () => void;
    modalContent: ReactNode | null;
    dialogRef: React.RefObject<HTMLDialogElement | null>;
}

const GlobalModalContext = createContext<GlobalModalContextType | undefined>(undefined);

export function GlobalModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState<ReactNode | null>(null);
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const onCloseCallbackRef = useRef<(() => void) | undefined>(undefined);

    const openModal = useCallback((content: ReactNode, onClose?: () => void) => {
        onCloseCallbackRef.current = onClose;
        setModalContent(content);
        setIsOpen(true);
        // Use requestAnimationFrame to ensure content is rendered before showing
        requestAnimationFrame(() => {
            dialogRef.current?.showModal();
        });
    }, []);

    const closeModal = useCallback(() => {
        dialogRef.current?.close();
    }, []);

    // Handle dialog close event (from ESC key or .close() call)
    const handleDialogClose = useCallback(() => {
        setIsOpen(false);
        setModalContent(null);
        // Call the onClose callback if provided
        onCloseCallbackRef.current?.();
        onCloseCallbackRef.current = undefined;
    }, []);

    return (
        <GlobalModalContext.Provider value={{ isOpen, openModal, closeModal, modalContent, dialogRef }}>
            {children}
            {/* Render the dialog element here for global access */}
            <dialog
                ref={dialogRef}
                onClose={handleDialogClose}
                onClick={(e) => {
                    // Close on backdrop click (click on dialog element itself, not its content)
                    if (e.target === dialogRef.current) {
                        closeModal();
                    }
                }}
                style={{
                    padding: 0,
                    border: 'none',
                }}
            >
                {/* Wrapper div to prevent backdrop click from closing when clicking content */}
                <div onClick={(e) => e.stopPropagation()}>
                    {modalContent}
                </div>
            </dialog>
        </GlobalModalContext.Provider>
    );
}

export function useGlobalModal() {
    const context = use(GlobalModalContext);
    if (context === undefined) {
        throw new Error('useGlobalModal must be used within a GlobalModalProvider');
    }
    return context;
}
