'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ModalContent {
    content: ReactNode;
}

interface GlobalModalContextType {
    isOpen: boolean;
    openModal: (content: ReactNode) => void;
    closeModal: () => void;
    modalContent: ReactNode | null;
}

const GlobalModalContext = createContext<GlobalModalContextType | undefined>(undefined);

export function GlobalModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState<ReactNode | null>(null);

    const openModal = useCallback((content: ReactNode) => {
        setModalContent(content);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setTimeout(() => setModalContent(null), 300); // Clear content after animation
    }, []);

    return (
        <GlobalModalContext.Provider value={{ isOpen, openModal, closeModal, modalContent }}>
            {children}
        </GlobalModalContext.Provider>
    );
}

export function useGlobalModal() {
    const context = useContext(GlobalModalContext);
    if (context === undefined) {
        throw new Error('useGlobalModal must be used within a GlobalModalProvider');
    }
    return context;
}
