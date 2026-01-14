'use client';

import { useRef, useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import type { Status } from '@/types';
import {
    NextEditorPlayButton,
    NextEditorOverlayWrapper as NextEditorOverlay,
    NextEditorIframeContainer,
    NextEditorIframeWrapper,
    NextEditorIframe,
} from './postCardStyles';

interface NextEditorEmbedProps {
    displayStatus: Status;
    showNextEditorIframe: boolean;
    setShowNextEditorIframe: (show: boolean) => void;
    onScaledHeightChange?: (height: number) => void;
}

/**
 * Sub-component for rendering the Next Editor overlay and iframe
 */
// Fixed MacBook Pro viewport dimensions for the iframe
const IFRAME_WIDTH = 1440;
const IFRAME_HEIGHT = 900;

export function NextEditorEmbed({
    displayStatus,
    showNextEditorIframe,
    setShowNextEditorIframe,
    onScaledHeightChange,
}: NextEditorEmbedProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    const isNextEditor = displayStatus.tags?.some((tag: any) => tag.name.toLowerCase() === 'nexteditor') ||
        displayStatus.content.toLowerCase().includes('#nexteditor');

    // Calculate scale based on container width
    useEffect(() => {
        if (!showNextEditorIframe || !containerRef.current) return;

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
    }, [showNextEditorIframe, onScaledHeightChange]);

    if (!isNextEditor) return null;

    return (
        <>
            {!showNextEditorIframe && (
                <NextEditorOverlay
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowNextEditorIframe(true);
                    }}
                >
                    <NextEditorPlayButton aria-label="Play Next Editor Tutorial">
                        <Play size={24} fill="currentColor" strokeWidth={2} />
                    </NextEditorPlayButton>
                </NextEditorOverlay>
            )}

            {showNextEditorIframe && (
                <NextEditorIframeContainer
                    ref={containerRef}
                    onClick={(e) => e.stopPropagation()}
                >
                    <NextEditorIframeWrapper $scale={scale} $scaledHeight={IFRAME_HEIGHT * scale}>
                        {(() => {
                            const firstImage = displayStatus.media_attachments.find((m: any) => m.type === 'image');
                            const targetUrl = firstImage?.url || displayStatus.media_attachments[0]?.url || '';
                            return (
                                <NextEditorIframe
                                    src={`https://code.mastodon.website/?readOnly=true&url=${encodeURIComponent(targetUrl)}`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            );
                        })()}
                    </NextEditorIframeWrapper>
                </NextEditorIframeContainer>
            )}
        </>
    );
}
