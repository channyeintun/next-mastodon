'use client';

import styled from '@emotion/styled';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback, createContext, useState, useRef } from 'react';
import { useGlobalModal } from '@/contexts/GlobalModalContext';

export const ComposeModalContext = createContext<{
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  registerOnCloseHandler: (handler: (() => void) | null) => void;
}>({
  isDirty: false,
  setIsDirty: () => { },
  registerOnCloseHandler: () => { },
});

interface ComposeModalProps {
  children: React.ReactNode;
}

/**
 * Modal wrapper for the compose feature when accessed via client-side navigation.
 * Supports closing via:
 * - Clicking the X button
 * - Clicking outside the modal
 * - Pressing Escape key
 */
export function ComposeModal({ children }: ComposeModalProps) {
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const [registeredOnCloseHandler, setRegisteredOnCloseHandler] = useState<(() => void) | null>(null);
  const { isOpen: isGlobalModalOpen } = useGlobalModal();
  const overlayRef = useRef<HTMLDivElement>(null);
  const mouseDownTarget = useRef<EventTarget | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClose = useCallback(() => {
    if (isDirty && registeredOnCloseHandler) {
      registeredOnCloseHandler();
    } else {
      router.back();
    }
  }, [router, isDirty, registeredOnCloseHandler]);

  const registerOnCloseHandler = useCallback((handler: (() => void) | null) => {
    setRegisteredOnCloseHandler(() => handler);
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isGlobalModalOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, isGlobalModalOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Handle click outside modal (only if mouse both started and ended on overlay)
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownTarget.current = e.target;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseDownTarget.current === e.currentTarget && e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <ComposeModalContext.Provider value={{ isDirty, setIsDirty, registerOnCloseHandler }}>
      <ModalOverlay
        ref={overlayRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <ModalContainer>
          <CloseButton onClick={handleClose} aria-label="Close">
            <X size={24} />
          </CloseButton>
          <ModalContent>
            {children}
          </ModalContent>
        </ModalContainer>
      </ModalOverlay>
    </ComposeModalContext.Provider>
  );
}


const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--size-4);

  @media (max-width: 600px) {
    padding: 0;
    align-items: stretch;
  }
`;

const ModalContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  max-height: 90dvh;
  background: var(--surface-1);
  border-radius: var(--radius-3);
  box-shadow: var(--shadow-6);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.2s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 600px) {
    max-width: 100%;
    max-height: 100dvh;
    border-radius: 0;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: var(--size-3);
  right: var(--size-3);
  z-index: 10;
  background: var(--surface-2);
  color: var(--text-1);
  border: none;
  border-radius: var(--radius-round);
  padding: var(--size-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: var(--surface-3);
  }
`;

const ModalContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: var(--size-4);
  padding-top: var(--size-6);
`;
