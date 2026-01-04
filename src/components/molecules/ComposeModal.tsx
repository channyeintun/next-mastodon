'use client';

import styled from '@emotion/styled';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';

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

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <ModalOverlay onClick={handleBackdropClick}>
      <ModalContainer>
        <CloseButton onClick={handleClose} aria-label="Close">
          <X size={24} />
        </CloseButton>
        <ModalContent>{children}</ModalContent>
      </ModalContainer>
    </ModalOverlay>
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
  padding: var(--size-4);
  padding-top: var(--size-6);
`;
