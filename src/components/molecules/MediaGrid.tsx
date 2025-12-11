'use client';

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
        <div
            style={{
                position: 'relative',
                maxWidth: '90vw',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--surface-1)',
                borderRadius: 'var(--radius-3)',
                overflow: 'hidden',
            }}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 'var(--size-2)',
                    right: 'var(--size-2)',
                    zIndex: 10,
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: 'none',
                    borderRadius: 'var(--radius-round)',
                    padding: 'var(--size-2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <X size={20} color="white" />
            </button>

            {/* Media content */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    maxHeight: '80vh',
                }}
            >
                {isVideo ? (
                    <video
                        src={attachment.url || undefined}
                        controls
                        autoPlay
                        style={{
                            minWidth: 'if(not media(width < 400px): 200px; else: 400px)',
                            width: '100%',
                            aspectRatio: 'var(--ratio-wide-screen)',
                        }}
                    />
                ) : (
                    <img
                        src={attachment.url || attachment.preview_url || undefined}
                        alt={attachment.description || 'Media'}
                        style={{
                            maxHeight: '80vh',
                            minWidth: 'min(600px, 90vw)',
                            minHeight: 'min(400px, 80vh)',
                            objectFit: 'contain',
                        }}
                    />
                )}
            </div>

            {/* Alt text / description */}
            {attachment.description && (
                <div
                    style={{
                        padding: 'var(--size-3)',
                        background: 'var(--surface-2)',
                        color: 'var(--text-2)',
                        fontSize: 'var(--font-size-1)',
                        borderTop: '1px solid var(--surface-3)',
                    }}
                >
                    {attachment.description}
                </div>
            )}

            {/* Link to original post */}
            <a
                href={`/status/${status.id}`}
                style={{
                    padding: 'var(--size-2) var(--size-3)',
                    background: 'var(--surface-2)',
                    color: 'var(--blue-6)',
                    fontSize: 'var(--font-size-0)',
                    textDecoration: 'none',
                    textAlign: 'center',
                }}
            >
                View original post
            </a>
        </div>
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
            <div
                style={{
                    textAlign: 'center',
                    padding: 'var(--size-8)',
                    color: 'var(--text-2)',
                }}
            >
                No media to display
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--size-1)',
                padding: 'var(--size-2)',
                minHeight: '50vh',
                ...style,
            }}
        >
            {mediaItems.map((item) => {
                const { attachment } = item;
                const isVideo = attachment.type === 'video' || attachment.type === 'gifv';

                return (
                    <button
                        key={`${item.originalStatusId}-${attachment.id}`}
                        onClick={() => handleMediaClick(item)}
                        style={{
                            position: 'relative',
                            aspectRatio: '1',
                            overflow: 'hidden',
                            background: 'var(--surface-3)',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-2)',
                        }}
                    >
                        <img
                            src={attachment.preview_url || attachment.url || undefined}
                            alt={attachment.description || 'Media'}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                            loading="lazy"
                        />

                        {/* Video indicator */}
                        {isVideo && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    background: 'rgba(0, 0, 0, 0.6)',
                                    borderRadius: 'var(--radius-round)',
                                    padding: 'var(--size-2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Play size={24} color="white" fill="white" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
