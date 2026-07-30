'use client';

import styled from '@emotion/styled';
import { Card as CardType } from '@/types/mastodon';
import { FileText } from 'lucide-react';
import { openExternalUrl } from '@/utils/externalLink';
import { safeHostname } from '@/utils/url';

interface LinkPreviewProps {
  card: CardType;
  style?: React.CSSProperties;
  className?: string;
  wrapstodon?: boolean;
}

export function LinkPreview({ card, style, className, wrapstodon = false }: LinkPreviewProps) {
  return (
    <Card
      onClick={() => openExternalUrl(card.url)}
      className={className}
      style={style}
      $wrapstodon={wrapstodon}
    >
      <ImageBox $wrapstodon={wrapstodon}>
        {card.image ? (
          <img src={card.image} alt={card.title} />
        ) : (
          <PlaceholderWrapper>
            <FileText size={48} />
          </PlaceholderWrapper>
        )}
      </ImageBox>
      <ContentBox $wrapstodon={wrapstodon}>
        <Domain $wrapstodon={wrapstodon}>{safeHostname(card.url)}</Domain>
        <Title $wrapstodon={wrapstodon}>{card.title}</Title>
        {card.description && <Desc $wrapstodon={wrapstodon}>{card.description}</Desc>}
      </ContentBox>
    </Card>
  );
}

/**
 * Facebook's link attachment: the image sits full-bleed on top and the metadata
 * runs underneath as a grey band — domain first in caps, then the headline.
 * Previously this was a bordered, rounded, side-by-side card with the domain
 * last, which read as a widget dropped into the post rather than part of it.
 */
const Card = styled.div<{ $wrapstodon?: boolean }>`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  background: transparent;
  /* Full-bleed to the card edges, matching the media above it. */
  margin-inline: calc(-1 * var(--size-4));
  border-block: 1px solid ${p => p.$wrapstodon ? 'rgba(255,255,255,0.2)' : 'var(--media-inner-border)'};
`;

const ImageBox = styled.div<{ $wrapstodon?: boolean }>`
  aspect-ratio: 1.91;
  flex-shrink: 0;
  align-self: stretch;
  max-height: 280px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => p.$wrapstodon ? 'rgba(0,0,0,0.4)' : 'var(--surface-3)'};
  color: ${p => p.$wrapstodon ? 'rgba(255,255,255,0.5)' : 'var(--text-3)'};
  padding: 0;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const PlaceholderWrapper = styled.div`
  flex-shrink: 0;
  height: 100%;
  aspect-ratio: 1;
  max-height: 150px;
  min-width: 150px;
  display: grid;
  place-items: center;
`;

const ContentBox = styled.div<{ $wrapstodon?: boolean }>`
  padding: var(--size-2) var(--size-4);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${p => p.$wrapstodon ? 'rgba(0,0,0,0.5)' : 'var(--comment-bg)'};
`;

const Title = styled.div<{ $wrapstodon?: boolean }>`
  font-size: var(--fs-heading);
  line-height: var(--lh-body);
  font-weight: var(--fw-semibold);
  color: ${p => p.$wrapstodon ? '#fff' : 'var(--text-1)'};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Desc = styled.div<{ $wrapstodon?: boolean }>`
  font-size: var(--fs-secondary);
  line-height: var(--lh-tight);
  color: ${p => p.$wrapstodon ? 'rgba(255,255,255,0.7)' : 'var(--secondary-text)'};
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Domain = styled.div<{ $wrapstodon?: boolean }>`
  font-size: var(--fs-secondary);
  line-height: var(--lh-tight);
  text-transform: uppercase;
  color: ${p => p.$wrapstodon ? 'rgba(255,255,255,0.6)' : 'var(--secondary-text)'};
  display: flex;
  align-items: center;
  gap: 4px;
`;