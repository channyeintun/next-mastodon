import styled from '@emotion/styled';
import { StatusContent, LinkPreview } from '@/components/molecules';
import Link from 'next/link';

export const PostContent = styled.div`
  margin-bottom: var(--size-3);
`;

export const StyledStatusContent = styled(StatusContent)`
  margin-top: var(--size-3);
`;

export const MediaContainer = styled.div<{ $clickable?: boolean }>`
  margin-top: var(--size-3);
  margin-inline: calc(-1 * var(--size-4));
  position: relative;
  overflow: hidden;
  background: #252527;
  max-height: 550px;
  display: flex;
  justify-content: center;
  transition: background-color 0.3s ease;
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};

  ${props => props.$clickable && `
    &:hover {
      & > div:first-of-type {
        filter: blur(60px) brightness(0.85) saturate(1.6);
      }
    }
  `}
`;

export const MediaGrid = styled.div<{ $columns: number; $count: number; $blurred: boolean }>`
  display: grid;
  grid-template-columns: ${props => props.$columns === 1 ? '1fr' : 'repeat(2, 1fr)'};
  ${props => props.$columns === 1 && 'justify-items: center;'}
  ${props => props.$count === 3 && `
    grid-template-rows: repeat(2, 1fr);
  `}
  gap: 2px;
  width: 100%;
  filter: ${props => props.$blurred ? 'blur(32px)' : 'none'};
  transition: filter 0.2s ease;
`;

export const MediaItemWrapper = styled.div<{ $singleMedia?: boolean; $isVideo?: boolean; $aspectRatio?: number; $index?: number; $total?: number }>`
  max-width: 100%;
  min-width: ${props => props.$singleMedia ? 'min(440px, 100%)' : 'auto'};
  width: ${props => props.$singleMedia ?
        (props.$isVideo ? '100%' : (props.$aspectRatio ? `min(100%, calc(${props.$aspectRatio} * 550px))` : '100%')) :
        'auto'};
  
  ${props => props.$total === 3 && props.$index === 0 && `
    grid-row: span 2;
  `}
`;

export const MediaItem = styled.div<{ $clickable?: boolean; $singleMedia?: boolean; $isSpanned?: boolean }>`
  position: relative;
  width: 100%;
  ${props => !props.$singleMedia && !props.$isSpanned && 'aspect-ratio: 16/9;'}
  ${props => props.$isSpanned && 'height: 100%;'}
  background: ${props => props.$singleMedia ? 'transparent' : '#252527'};
  cursor: ${props => props.$clickable ? 'pointer' : 'default'};
  transition: opacity 0.2s;

  &:hover {
    opacity: ${props => props.$clickable ? '0.9' : '1'};
  }
`;

export const MediaItemInner = styled.div<{ $singleMedia?: boolean }>`
  width: 100%;
  height: 100%;
`;

export const MediaImage = styled.img<{ $singleMedia?: boolean }>`
  display: block;
  max-width: 100%;
  max-height: 550px;
  ${props => props.$singleMedia ? `
    width: 100%;
    height: auto;
    object-fit: contain;
  ` : `
    width: 100%;
    height: 100%;
    object-fit: cover;
  `}
`;

export const SensitiveOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-2);
`;

export const StyledLinkPreview = styled(LinkPreview)`
  margin-top: var(--size-3);
`;

export const QuotedPostWrapper = styled.div``;

export const NestedQuoteLink = styled(Link)`
  display: block;
  padding: var(--size-2) var(--size-3);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  color: var(--text-2);
  font-size: var(--font-size-1);
  text-decoration: none;
  
  &:hover {
    background: var(--surface-3);
    color: var(--text-1);
  }
`;

export const TranslationContainer = styled.div`
  margin-top: var(--size-2);
  padding-top: var(--size-2);
`;

export const BlurredBackground = styled.div<{ $url: string }>`
  position: absolute;
  top: -20%;
  left: -20%;
  right: -20%;
  bottom: -20%;
  background-image: url(${props => props.$url});
  background-size: cover;
  background-position: center;
  filter: blur(60px) brightness(0.7) saturate(1.4);
  opacity: 0.6;
  z-index: 0;
  pointer-events: none;
`;

export const QuoteUnavailable = styled.div`
  padding: var(--size-2) var(--size-3);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  color: var(--text-3);
  font-size: var(--font-size-1);
  font-style: italic;
  margin-top: var(--size-3);
`;

export const HiddenQuoteContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--size-2) var(--size-3);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  margin-top: var(--size-3);
`;

export const HiddenQuoteText = styled.span`
  color: var(--text-3);
  font-size: var(--font-size-1);
  font-style: italic;
`;

export const ShowAnywayButton = styled.button`
  background: none;
  border: none;
  color: var(--link);
  font-size: var(--font-size-0);
  cursor: pointer;
  padding: var(--size-1) var(--size-2);
  border-radius: var(--radius-1);
  
  &:hover {
    background: var(--surface-3);
    text-decoration: underline;
  }
`;
