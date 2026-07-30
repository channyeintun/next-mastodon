'use client';

import styled from '@emotion/styled';
import { IconButton } from '../atoms/IconButton';

export const HiddenInput = styled.input`
  display: none;
`;

export const AltEditor = styled.div`
  margin-bottom: var(--size-4);
  padding: var(--size-4);
  background: linear-gradient(135deg, var(--surface-2) 0%, var(--surface-3) 100%);
  border-radius: var(--radius-3);
  border: 1px solid var(--surface-4);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  animation: slideDown 0.25s var(--ease-out-3);
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const AltEditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--size-3);
`;

export const AltLabel = styled.label`
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-7);
  color: var(--text-1);
  display: flex;
  align-items: center;
  gap: var(--size-2);
  
  &::before {
    content: '';
    width: 3px;
    height: 14px;
    background: var(--blue-6);
    border-radius: 2px;
  }
`;

export const CloseButton = styled.button`
  width: 28px;
  height: 28px;
  border: none;
  background: var(--surface-4);
  border-radius: var(--radius-round);
  cursor: pointer;
  color: var(--text-2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--red-9);
    color: white;
    transform: scale(1.05);
  }
`;

export const AltTextarea = styled.textarea`
  width: 100%;
  padding: var(--size-3);
  border: 1px solid var(--surface-4);
  border-radius: var(--radius-2);
  background: var(--surface-1);
  color: var(--text-1);
  font-size: var(--font-size-1);
  resize: vertical;
  font-family: inherit;
  margin-bottom: var(--size-3);
  min-height: 80px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  outline: none;

  /* Was already a visible ring, but hardcoded — routed through the shared
     tokens so it tracks the theme like the Input and TextArea atoms. */
  &:focus-visible {
    border-color: var(--brand);
    box-shadow: 0 0 0 3px var(--brand-subtle);
  }

  &:focus:not(:focus-visible) {
    border-color: var(--brand);
  }

  &::placeholder {
    color: var(--text-3);
  }
`;

export const AltFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const CharCount = styled.span<{ $isNearLimit?: boolean }>`
  font-size: var(--font-size-0);
  color: ${props => props.$isNearLimit ? 'var(--orange-7)' : 'var(--text-3)'};
  font-variant-numeric: tabular-nums;
  transition: color 0.2s ease;
`;

export const MediaGrid = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: ${props => props.$columns === 1 ? '1fr' : 'repeat(2, 1fr)'};
  gap: var(--size-3);
  margin-bottom: var(--size-4);
`;

export const MediaItem = styled.div`
  position: relative;
  aspect-ratio: 16/9;
  background: var(--surface-3);
  border-radius: var(--radius-3);
  overflow: hidden;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s var(--ease-out-3), box-shadow 0.3s var(--ease-out-3);
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.15),
      0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:hover > div:last-of-type {
    opacity: 1;
    transform: translateY(0);
  }
  
  &:hover img {
    transform: scale(1.03);
  }
`;

export const MediaPreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
`;

export const VideoPreview = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const MediaControls = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: var(--size-2);
  display: flex;
  justify-content: flex-end;
  gap: var(--size-2);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, transparent 100%);
  opacity: 0;
  transform: translateY(-4px);
  transition: 
    opacity 0.25s ease,
    transform 0.25s ease;
`;

export const OverlayButton = styled(IconButton)`
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  color: white;
  border-radius: var(--radius-round);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.85);
    transform: scale(1.1);
  }
  
  &:last-child:hover {
    background: var(--red-9);
  }
`;

export const AltBadge = styled.div`
  position: absolute;
  bottom: var(--size-2);
  left: var(--size-2);
  padding: 3px var(--size-2);
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  color: white;
  font-size: 10px;
  font-weight: var(--font-weight-7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: var(--radius-2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

export const AddButton = styled.button`
  aspect-ratio: 16/9;
  border: 2px dashed var(--surface-4);
  background: linear-gradient(135deg, var(--surface-2) 0%, var(--surface-3) 100%);
  border-radius: var(--radius-3);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--size-2);
  color: var(--text-2);
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-5);
  transition: all 0.25s ease;
  
  &:hover {
    background: linear-gradient(135deg, var(--surface-3) 0%, var(--surface-4) 100%);
    border-color: var(--blue-5);
    color: var(--blue-6);
    transform: scale(1.02);
  }
  
  svg {
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }
  
  &:hover svg {
    opacity: 1;
  }
`;

export const UploadingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-3);
  padding: var(--size-3) var(--size-4);
  background: linear-gradient(135deg, var(--blue-1) 0%, var(--indigo-1) 100%);
  border-radius: var(--radius-3);
  border: 1px solid var(--blue-3);
  animation: pulse 2s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.85; }
  }
`;

export const UploadingText = styled.div`
  color: var(--blue-7);
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-5);
`;

export const UploadingSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid var(--blue-3);
  border-top-color: var(--blue-7);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
