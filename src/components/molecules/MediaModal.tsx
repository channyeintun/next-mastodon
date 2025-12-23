'use client';

import styled from '@emotion/styled';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { MediaAttachment } from '@/types';

interface MediaModalProps {
  mediaAttachments: MediaAttachment[];
  initialIndex?: number;
  onClose: () => void;
}

/**
 * Modal for displaying media attachments with navigation
 */
export function MediaModal({
  mediaAttachments,
  initialIndex = 0,
  onClose,
}: MediaModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentMedia = mediaAttachments[currentIndex];
  const hasMultiple = mediaAttachments.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaAttachments.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === mediaAttachments.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasMultiple) {
        goToPrevious();
      } else if (e.key === 'ArrowRight' && hasMultiple) {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasMultiple]);

  return (
    <ModalContainer className="media-modal">
      {/* Close button */}
      <CloseButton onClick={onClose} aria-label="Close">
        <X size={24} />
      </CloseButton>

      {/* Navigation buttons */}
      {hasMultiple && (
        <>
          <NavButton
            onClick={goToPrevious}
            $position="left"
            aria-label="Previous media"
          >
            <ChevronLeft size={32} />
          </NavButton>
          <NavButton
            onClick={goToNext}
            $position="right"
            aria-label="Next media"
          >
            <ChevronRight size={32} />
          </NavButton>
        </>
      )}

      {/* Media content */}
      <MediaContent>
        {currentMedia.type === 'image' && (
          <MediaImage
            src={currentMedia.url || currentMedia.preview_url || ''}
            alt={currentMedia.description || 'Image'}
          />
        )}
        {currentMedia.type === 'video' && (
          <MediaVideo
            src={currentMedia.url || ''}
            controls
            autoPlay
            playsInline
          />
        )}
        {currentMedia.type === 'gifv' && (
          <MediaVideo
            src={currentMedia.url || ''}
            autoPlay
            loop
            muted
            playsInline
          />
        )}
      </MediaContent>

      {/* Media counter */}
      {hasMultiple && (
        <MediaCounter>
          {currentIndex + 1} / {mediaAttachments.length}
        </MediaCounter>
      )}

      {/* Alt text */}
      {currentMedia.description && (
        <AltText>{currentMedia.description}</AltText>
      )}
    </ModalContainer>
  );
}

// Styled components
const ModalContainer = styled.div`
  position: relative;
  width: 90vw;
  max-width: 1200px;
  max-height: 90dvh;
  display: flex;
  flex-direction: column;
  background: var(--surface-1);
  border-radius: var(--radius-3);
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: var(--size-3);
  right: var(--size-3);
  z-index: 10;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: var(--radius-round);
  padding: var(--size-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.85);
  }
`;

const NavButton = styled.button<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${(props) => props.$position}: var(--size-3);
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: var(--radius-round);
  padding: var(--size-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.85);
  }
`;

const MediaContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 80dvh;
  background: black;
`;

const MediaImage = styled.img`
  max-width: 90vw;
  max-height: 80dvh;
  object-fit: contain;
`;

const MediaVideo = styled.video`
  max-width: 90vw;
  max-height: 80dvh;
  object-fit: contain;
`;

const MediaCounter = styled.div`
  position: absolute;
  bottom: calc(var(--size-3) + (var(--size-3) * 3));
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: var(--size-2) var(--size-3);
  border-radius: var(--radius-2);
  font-size: var(--font-size-0);
  z-index: 10;
`;

const AltText = styled.div`
  padding: var(--size-3);
  background: var(--surface-2);
  color: var(--text-2);
  font-size: var(--font-size-1);
  border-top: 1px solid var(--surface-3);
  max-height: 20dvh;
  overflow-y: auto;
`;
