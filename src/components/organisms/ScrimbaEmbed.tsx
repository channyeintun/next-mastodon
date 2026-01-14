'use client';

import { Play, X } from 'lucide-react';
import type { Status } from '@/types';
import {
    ScrimbaPlayButton,
    ScrimbaOverlayWrapper as ScrimbaOverlay,
    ScrimbaIframeContainer,
    ScrimbaIframe,
    CloseScrimbaButton,
} from './postCardStyles';

interface ScrimbaEmbedProps {
    displayStatus: Status;
    showScrimbaIframe: boolean;
    setShowScrimbaIframe: (show: boolean) => void;
}

/**
 * Sub-component for rendering the Scrimba overlay and iframe
 */
export function ScrimbaEmbed({
    displayStatus,
    showScrimbaIframe,
    setShowScrimbaIframe,
}: ScrimbaEmbedProps) {
    const isScrimba = displayStatus.tags?.some((tag: any) => tag.name.toLowerCase() === 'scrimba') ||
        displayStatus.content.toLowerCase().includes('#scrimba');

    if (!isScrimba) return null;

    return (
        <>
            {!showScrimbaIframe && (
                <ScrimbaOverlay
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowScrimbaIframe(true);
                    }}
                >
                    <ScrimbaPlayButton aria-label="Play Scrimba Tutorial">
                        <Play size={24} fill="currentColor" strokeWidth={2} />
                    </ScrimbaPlayButton>
                </ScrimbaOverlay>
            )}

            {showScrimbaIframe && (
                <ScrimbaIframeContainer onClick={(e) => e.stopPropagation()}>
                    <CloseScrimbaButton
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowScrimbaIframe(false);
                        }}
                        aria-label="Close Scrimba Tutorial"
                    >
                        <X size={20} />
                    </CloseScrimbaButton>
                    {(() => {
                        const firstImage = displayStatus.media_attachments.find((m: any) => m.type === 'image');
                        const targetUrl = firstImage?.url || displayStatus.media_attachments[0]?.url || '';
                        return (
                            <ScrimbaIframe
                                src={`https://scrim.mastodon.website/?scrimUrl=${encodeURIComponent(targetUrl)}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        );
                    })()}
                </ScrimbaIframeContainer>
            )}
        </>
    );
}
