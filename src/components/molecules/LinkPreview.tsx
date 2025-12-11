'use client';

import styled from '@emotion/styled';
import { Card as CardType } from '@/types/mastodon';
import { Card } from '../atoms/Card';
import { ExternalLink } from 'lucide-react';

interface LinkPreviewProps {
  card: CardType;
  style?: React.CSSProperties;
}

const StyledCard = styled(Card)`
  cursor: pointer;
  overflow: hidden;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: var(--surface-2);
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Content = styled.div`
  padding: var(--size-4);
`;

const UrlSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  margin-bottom: var(--size-2);
`;

const Icon = styled(ExternalLink)`
  color: var(--text-2);
`;

const Domain = styled.span`
  font-size: var(--font-size-0);
  color: var(--text-2);
`;

const Title = styled.div`
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-6);
  color: var(--text-1);
  margin-bottom: var(--size-2);
  line-height: 1.3;
`;

const Description = styled.div`
  font-size: var(--font-size-1);
  color: var(--text-2);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

/**
 * Displays a rich link preview card with image, title, and description
 */
export function LinkPreview({ card, style }: LinkPreviewProps) {
  const handleClick = () => {
    window.open(card.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <StyledCard
      hoverable
      style={style}
      onClick={handleClick}
    >
      <Container>
        {/* Image */}
        {card.image && (
          <ImageContainer>
            <Image
              src={card.image}
              alt={card.title}
            />
          </ImageContainer>
        )}

        {/* Content */}
        <Content>
          {/* URL domain */}
          <UrlSection>
            <Icon size={14} />
            <Domain>
              {new URL(card.url).hostname}
            </Domain>
          </UrlSection>

          {/* Title */}
          <Title>
            {card.title}
          </Title>

          {/* Description */}
          {card.description && (
            <Description>
              {card.description}
            </Description>
          )}
        </Content>
      </Container>
    </StyledCard>
  );
}
