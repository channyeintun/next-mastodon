'use client';

import { useRef, useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import type { Status } from '@/types';
import {
    ScrimbaPlayButton,
    ScrimbaOverlayWrapper as ScrimbaOverlay,
    ScrimbaIframeContainer,
    ScrimbaIframeWrapper,
    ScrimbaIframe,
} from './postCardStyles';

interface ScrimbaEmbedProps {
    displayStatus: Status;
    showScrimbaIframe: boolean;
    setShowScrimbaIframe: (show: boolean) => void;
    onScaledHeightChange?: (height: number) => void;
}

/**
 * Sub-component for rendering the Scrimba overlay and iframe
 */
// Fixed MacBook Pro viewport dimensions for the iframe
const IFRAME_WIDTH = 1440;
const IFRAME_HEIGHT = 900;

export function ScrimbaEmbed({
    displayStatus,
    showScrimbaIframe,
    setShowScrimbaIframe,
    onScaledHeightChange,
}: ScrimbaEmbedProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    const isScrimba = displayStatus.tags?.some((tag: any) => tag.name.toLowerCase() === 'scrimba') ||
        displayStatus.content.toLowerCase().includes('#scrimba');

    // Calculate scale based on container width
    useEffect(() => {
        if (!showScrimbaIframe || !containerRef.current) return;

        const calculateScale = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const newScale = containerWidth / IFRAME_WIDTH;
                setScale(newScale);
                onScaledHeightChange?.(IFRAME_HEIGHT * newScale);
            }
        };

        calculateScale();

        const resizeObserver = new ResizeObserver(calculateScale);
        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, [showScrimbaIframe, onScaledHeightChange]);

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
                <ScrimbaIframeContainer
                    ref={containerRef}
                    onClick={(e) => e.stopPropagation()}
                >
                    <ScrimbaIframeWrapper $scale={scale} $scaledHeight={IFRAME_HEIGHT * scale}>
                        {(() => {
                            const firstImage = displayStatus.media_attachments.find((m: any) => m.type === 'image');
                            const targetUrl = firstImage?.url || displayStatus.media_attachments[0]?.url || '';
                            return (
                                <ScrimbaIframe
                                    src={`https://scrim.mastodon.website/?readOnly=true&scrimUrl=${encodeURIComponent(targetUrl)}`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            );
                        })()}
                    </ScrimbaIframeWrapper>
                </ScrimbaIframeContainer>
            )}
        </>
    );
}
