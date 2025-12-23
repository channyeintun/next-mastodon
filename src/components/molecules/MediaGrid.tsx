'use client';

import styled from '@emotion/styled';
import { X, Play } from 'lucide-react';
import type { Status, MediaAttachment } from '@/types';
import { useGlobalModal } from '@/contexts/GlobalModalContext';

interface MediaGridProps {
    statuses: Status[];
    style?: React.CSSProperties;
}

interface MediaItem {
    attachment: MediaAttachment;
    status: Status;
    originalStatusId: string;
}

/**
 * MediaModal - Fullscreen media viewer component
 */
function MediaModal({
    media,
    onClose
}: {
    media: MediaItem;
    onClose: () => void;
}) {
    const { attachment, status } = media;
    const isVideo = attachment.type === 'video' || attachment.type === 'gifv';

    return (
        <ModalContainer>
            {/* Close button */}
            <CloseButton onClick={onClose}>
                <X size={20} color="white" />
            </CloseButton>

            {/* Media content */}
            <MediaContent>
                {isVideo ? (
                    <MediaVideo
                        src={attachment.url || undefined}
                        controls
                        autoPlay
                    />
                ) : (
                    <MediaImage
                        src={attachment.url || attachment.preview_url || undefined}
                        alt={attachment.description || 'Media'}
                    />
                )}
            </MediaContent>

            {/* Alt text / description */}
            {attachment.description && (
                <AltTextSection>
                    {attachment.description}
                </AltTextSection>
            )}

            {/* Link to original post */}
            <OriginalPostLink href={`/status/${status.id}`}>
                View original post
            </OriginalPostLink>
        </ModalContainer>
    );
}

/**
 * MediaGrid - Displays media attachments from statuses in a responsive grid
 */
export function MediaGrid({ statuses, style }: MediaGridProps) {
    const { openModal, closeModal } = useGlobalModal();

    // Extract all media items from statuses
    const mediaItems: MediaItem[] = statuses.flatMap((status) => {
        const displayStatus = status.reblog || status;
        return displayStatus.media_attachments.map((attachment) => ({
            attachment,
            status: displayStatus,
            originalStatusId: status.id,
        }));
    });

    const handleMediaClick = (item: MediaItem) => {
        openModal(<MediaModal media={item} onClose={closeModal} />);
    };

    if (mediaItems.length === 0) {
        return (
            <EmptyState>
                No media to display
            </EmptyState>
        );
    }

    return (
        <GridContainer style={style}>
            {mediaItems.map((item) => {
                const { attachment } = item;
                const isVideo = attachment.type === 'video' || attachment.type === 'gifv';

                return (
                    <MediaButton
                        key={`${item.originalStatusId}-${attachment.id}`}
                        onClick={() => handleMediaClick(item)}
                    >
                        <MediaThumbnail
                            src={attachment.preview_url || attachment.url || undefined}
                            alt={attachment.description || 'Media'}
                            loading="lazy"
                        />

                        {/* Video indicator */}
                        {isVideo && (
                            <VideoIndicator>
                                <Play size={24} color="white" fill="white" />
                            </VideoIndicator>
                        )}
                    </MediaButton>
                );
            })}
        </GridContainer>
    );
}

// Modal styled components
const ModalContainer = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90dvh;
  display: flex;
  flex-direction: column;
  background: var(--surface-1);
  border-radius: var(--radius-3);
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: var(--size-2);
  right: var(--size-2);
  z-index: 10;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: var(--radius-round);
  padding: var(--size-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MediaContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 80dvh;
`;

const MediaVideo = styled.video`
  min-width: if(not media(width < 400px): 200px; else: 400px);
  width: 100%;
  aspect-ratio: var(--ratio-wide-screen);
`;

const MediaImage = styled.img`
  max-height: 80dvh;
  min-width: min(600px, 90vw);
  min-height: min(400px, 80dvh);
  object-fit: contain;
`;

const AltTextSection = styled.div`
  padding: var(--size-3);
  background: var(--surface-2);
  color: var(--text-2);
  font-size: var(--font-size-1);
  border-top: 1px solid var(--surface-3);
`;

const OriginalPostLink = styled.a`
  padding: var(--size-2) var(--size-3);
  background: var(--surface-2);
  color: var(--blue-6);
  font-size: var(--font-size-0);
  text-decoration: none;
  text-align: center;
`;

// Grid styled components
const GridContainer = styled.div<{ $hasCustomStyle?: boolean }>`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--size-1);
  padding: var(--size-2);
  min-height: 50dvh;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--size-8);
  color: var(--text-2);
`;

const MediaButton = styled.button`
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--surface-3);
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: var(--radius-2);
`;

const MediaThumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const VideoIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.6);
  border-radius: var(--radius-round);
  padding: var(--size-2);
  display: flex;
  align-items: center;
  justify-content: center;
`;
