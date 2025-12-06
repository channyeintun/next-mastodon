'use client';

import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { useEffect } from 'react';

export function GlobalModalRenderer() {
    const { isOpen, closeModal, modalContent } = useGlobalModal();

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                closeModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeModal]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999, // Very high z-index to be on top of everything
                animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={closeModal}
        >
            <div
                style={{
                    position: 'relative',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    animation: 'scaleIn 0.2s ease-out',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {modalContent}
            </div>

            <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
}
