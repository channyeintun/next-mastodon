'use client';

import styled from '@emotion/styled';
import { Card as CardType } from '@/types/mastodon';
import { ExternalLink } from 'lucide-react';
import { RiPagesLine } from 'react-icons/ri';

interface LinkPreviewProps {
  card: CardType;
  style?: React.CSSProperties;
  className?: string;
  wrapstodon?: boolean;
}

export function LinkPreview({ card, style, className, wrapstodon = false }: LinkPreviewProps) {
  return (
    <Card
      onClick={() => window.open(card.url, '_blank', 'noopener,noreferrer')}
      className={className}
      style={style}
      $wrapstodon={wrapstodon}
    >
      <ImageBox $wrapstodon={wrapstodon}>
        {card.image ? (
          <img src={card.image} alt={card.title} />
        ) : (
          <PlaceholderWrapper>
            <RiPagesLine size={48} />
          </PlaceholderWrapper>
        )}
      </ImageBox>
      <ContentBox>
        <Title $wrapstodon={wrapstodon}>{card.title}</Title>
        {card.description && <Desc $wrapstodon={wrapstodon}>{card.description}</Desc>}
        <Domain $wrapstodon={wrapstodon}>
          <ExternalLink size={12} />
          {new URL(card.url).hostname}
        </Domain>
      </ContentBox>
    </Card>
  );
}

const Card = styled.div<{ $wrapstodon?: boolean }>`
  display: flex;
  justify-content: flex-start;
  gap: var(--size-3);
  border-radius: var(--radius-2);
  overflow: hidden;
  cursor: pointer;
  background: ${p => p.$wrapstodon ? 'rgba(0,0,0,0.5)' : 'var(--surface-2)'};
  border: 1px solid ${p => p.$wrapstodon ? 'rgba(255,255,255,0.2)' : 'var(--surface-3)'};
  &:hover { opacity: 0.9; }
`;

const ImageBox = styled.div<{ $wrapstodon?: boolean }>`
  aspect-ratio: 1;
  flex-shrink: 0;
  align-self: stretch;
  max-height: 150px;
  min-width: 150px;
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
  padding-block: var(--size-3);
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Title = styled.div<{ $wrapstodon?: boolean }>`
  font-weight: 600;
  color: ${p => p.$wrapstodon ? '#fff' : 'var(--text-1)'};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Desc = styled.div<{ $wrapstodon?: boolean }>`
  font-size: 13px;
  color: ${p => p.$wrapstodon ? 'rgba(255,255,255,0.7)' : 'var(--text-2)'};
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Domain = styled.div<{ $wrapstodon?: boolean }>`
  font-size: 12px;
  color: ${p => p.$wrapstodon ? 'rgba(255,255,255,0.6)' : 'var(--text-3)'};
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;