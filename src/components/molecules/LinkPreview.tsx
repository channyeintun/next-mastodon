'use client';

import { Card as CardType } from '@/types/mastodon';
import { Card } from '../atoms/Card';
import { ExternalLink } from 'lucide-react';

interface LinkPreviewProps {
  card: CardType;
  style?: React.CSSProperties;
}

/**
 * Displays a rich link preview card with image, title, and description
 */
export function LinkPreview({ card, style }: LinkPreviewProps) {
  const handleClick = () => {
    window.open(card.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      hoverable
      style={{
        ...style,
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      onClick={handleClick}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Image */}
        {card.image && (
          <div style={{
            width: '100%',
            height: '200px',
            overflow: 'hidden',
            background: 'var(--surface-2)',
          }}>
            <img
              src={card.image}
              alt={card.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {/* Content */}
        <div style={{
          padding: 'var(--size-4)',
        }}>
          {/* URL domain */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-2)',
            marginBottom: 'var(--size-2)',
          }}>
            <ExternalLink size={14} style={{ color: 'var(--text-2)' }} />
            <span style={{
              fontSize: 'var(--font-size-0)',
              color: 'var(--text-2)',
            }}>
              {new URL(card.url).hostname}
            </span>
          </div>

          {/* Title */}
          <div style={{
            fontSize: 'var(--font-size-2)',
            fontWeight: 'var(--font-weight-6)',
            color: 'var(--text-1)',
            marginBottom: 'var(--size-2)',
            lineHeight: '1.3',
          }}>
            {card.title}
          </div>

          {/* Description */}
          {card.description && (
            <div style={{
              fontSize: 'var(--font-size-1)',
              color: 'var(--text-2)',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {card.description}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
