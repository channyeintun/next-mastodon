'use client';

import styled from '@emotion/styled';
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'motion/react';
import type { MediaAttachment } from '@/types';
import { ModalVideoPlayer } from './ModalVideoPlayer';

interface MediaModalProps {
  mediaAttachments: MediaAttachment[];
  initialIndex?: number;
  onClose: () => void;
}

// Swipe threshold in pixels to trigger close
const SWIPE_CLOSE_THRESHOLD = 100;

/**
 * Modal for displaying media attachments with navigation
 */
export function MediaModal({
  mediaAttachments,
  initialIndex = 0,
  onClose,
}: MediaModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showAlt, setShowAlt] = useState(false);
  const currentMedia = mediaAttachments[currentIndex];
  const hasMultiple = mediaAttachments.length > 1;

  // Motion values for drag gesture
  const y = useMotionValue(0);
  const opacity = useTransform(y, [-300, 0, 300], [0, 1, 0]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > SWIPE_CLOSE_THRESHOLD) {
      // Animate out (down) and close
      animate(y, window.innerHeight, {
        type: 'tween',
        duration: 0.2,
        ease: 'easeOut',
        onComplete: onClose,
      });
    } else if (info.offset.y < -SWIPE_CLOSE_THRESHOLD) {
      // Animate out (up) and close
      animate(y, -window.innerHeight, {
        type: 'tween',
        duration: 0.2,
        ease: 'easeOut',
        onComplete: onClose,
      });
    } else {
      // Snap back
      animate(y, 0, {
        type: 'spring',
        stiffness: 500,
        damping: 30,
      });
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaAttachments.length - 1 : prev - 1));
    setShowAlt(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === mediaAttachments.length - 1 ? 0 : prev + 1));
    setShowAlt(false);
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

  const isVideo = currentMedia.type === 'video' || currentMedia.type === 'gifv';
  const isGifv = currentMedia.type === 'gifv';

  return (
    <ModalContainer
      className="media-modal"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.5, bottom: 0.5 }}
      onDragEnd={handleDragEnd}
      style={{ y, opacity }}
    >
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
        {isVideo && !isGifv && (
          <VideoPlayerWrapper>
            <ModalVideoPlayer src={currentMedia.url || ''} />
          </VideoPlayerWrapper>
        )}
        {isGifv && (
          <VideoPlayerWrapper>
            <ModalVideoPlayer
              src={currentMedia.url || ''}
              autoPlay
              loop
              muted
              showControls={false}
            />
          </VideoPlayerWrapper>
        )}

        {/* Alt text toggle button and popover - inside MediaContent */}
        {currentMedia.description && (
          <AltContainer>
            <AltButton
              onClick={() => setShowAlt(!showAlt)}
              aria-label="Toggle alt text"
              $active={showAlt}
            >
              <Info size={16} />
              ALT
            </AltButton>
            {showAlt && (
              <AltPopover>
                {currentMedia.description}
              </AltPopover>
            )}
          </AltContainer>
        )}
      </MediaContent>

      {/* Media counter */}
      {hasMultiple && (
        <MediaCounter>
          {currentIndex + 1} / {mediaAttachments.length}
        </MediaCounter>
      )}
    </ModalContainer>
  );
}

// Styled components - use motion.div for the container
const ModalContainer = styled(motion.div)`
  position: relative;
  width: 100vw;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #252527;
  border-radius: 0;
  overflow: hidden;
  touch-action: none;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #252527;
  flex: 1;
  min-height: 0; /* Allow flex item to shrink below content size */
`;

const MediaImage = styled.img`
  max-width: 100%;
  max-height: 100dvh;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
`;

const VideoPlayerWrapper = styled.div`
  width: 100%;
  height: 100%;
  max-height: calc(100dvh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Ensure ReactPlayer fills the container properly */
  & > div {
    width: 100% !important;
    height: 100% !important;
  }
  
  /* Style the video inside ReactPlayer */
  video {
    object-fit: contain;
    max-height: calc(100dvh - 80px);
  }
`;

const MediaCounter = styled.div`
  position: absolute;
  top: var(--size-3);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: var(--size-2) var(--size-3);
  border-radius: var(--radius-2);
  font-size: var(--font-size-0);
  z-index: 10;
`;

const AltContainer = styled.div`
  position: absolute;
  bottom: var(--size-3);
  right: var(--size-3);
  z-index: 10;
  max-width: calc(100% - var(--size-6));
  display: flex;
  justify-content: flex-end;
`;

const AltButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--size-1);
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)'};
  color: ${props => props.$active ? '#000' : 'white'};
  border: none;
  border-radius: var(--radius-2);
  padding: var(--size-1) var(--size-2);
  cursor: pointer;
  font-size: var(--font-size-0);
  font-weight: 600;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: ${props => props.$active ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 0.85)'};
  }
`;

const AltPopover = styled.div`
  position: absolute;
  bottom: calc(100% + var(--size-2));
  right: 0;
  width: max-content;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: var(--size-3);
  border-radius: var(--radius-2);
  font-size: var(--font-size-1);
  max-width: min(800px, 90vw);
  max-height: 40vh;
  overflow-y: auto;
  white-space: pre-wrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;
