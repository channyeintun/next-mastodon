'use client';

import 'media-chrome';
import {
    MediaController,
    MediaControlBar,
    MediaTimeRange,
    MediaTimeDisplay,
    MediaVolumeRange,
    MediaPlayButton,
    MediaMuteButton,
    MediaFullscreenButton,
    MediaPosterImage,
} from 'media-chrome/react';
import styled from '@emotion/styled';

interface FeedVideoPlayerProps {
    src: string;
    aspectRatio?: number;
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
    showControls?: boolean;
    poster?: string;
}

const StyledController = styled(MediaController)`
  --media-primary-color: white;
  width: 100% !important;
  max-width: 100% !important;
  max-height: 550px !important;
  display: flex !important;
  flex-direction: column !important;
  background: transparent !important;
`;

const StyledVideo = styled.video`
  width: 100% !important;
  max-width: 100% !important;
  max-height: 550px !important;
  margin: 0 auto !important;
  display: block !important;
  object-fit: contain !important;
  background: #000;
  /* aspect-ratio will be handled via inline style from props */
`;

const StyledControlBar = styled(MediaControlBar)`
  width: 100% !important;
  background: rgba(0, 0, 0, 0.8) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
`;

export function FeedVideoPlayer({
    src,
    aspectRatio,
    autoPlay = false,
    muted = false,
    loop = false,
    showControls = true,
    poster,
}: FeedVideoPlayerProps) {
    // If no controls, we act as a fill-parent player (GIFV mode)
    if (!showControls) {
        return (
            <MediaController
                style={{ width: '100%', height: '100%', display: 'block' }}
            >
                {poster && <MediaPosterImage slot="poster" src={poster} />}
                <video
                    slot="media"
                    src={src}
                    playsInline
                    autoPlay={autoPlay}
                    preload="auto"
                    muted={muted}
                    loop={loop}
                    poster={poster}
                    crossOrigin=""
                    suppressHydrationWarning={true}
                    style={{ width: '100%', height: '100%', maxHeight: '550px', objectFit: 'contain', display: 'block', background: '#000' }}
                />
            </MediaController>
        );
    }

    return (
        <StyledController
            hotkeys="noarrowleft noarrowright"
            defaultSubtitles
        >
            {poster && <MediaPosterImage slot="poster" src={poster} />}
            <StyledVideo
                slot="media"
                src={src}
                playsInline
                autoPlay={autoPlay}
                preload="auto"
                muted={muted}
                loop={loop}
                poster={poster}
                crossOrigin=""
                suppressHydrationWarning={true}
                style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : undefined}
            />
            <StyledControlBar
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                <MediaPlayButton mediaPaused={!autoPlay}></MediaPlayButton>
                <MediaTimeRange></MediaTimeRange>
                <MediaTimeDisplay showDuration></MediaTimeDisplay>
                <MediaMuteButton mediaVolumeLevel={muted ? 'off' : 'high'}></MediaMuteButton>
                <MediaVolumeRange></MediaVolumeRange>
                <MediaFullscreenButton></MediaFullscreenButton>
            </StyledControlBar>
        </StyledController>
    );
}
