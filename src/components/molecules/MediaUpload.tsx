'use client';

import styled from '@emotion/styled';
import { useState, useRef } from 'react';
import { X, Edit2, Image as ImageIcon } from 'lucide-react';
import { Button } from '../atoms/Button';
import { IconButton } from '../atoms/IconButton';
import type { MediaAttachment } from '@/types/mastodon';

// Styled components
const HiddenInput = styled.input`
    display: none;
`;

const AltEditor = styled.div`
    margin-bottom: var(--size-3);
    padding: var(--size-3);
    background: var(--surface-2);
    border-radius: var(--radius-2);
`;

const AltEditorHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--size-2);
`;

const AltLabel = styled.label`
    font-size: var(--font-size-1);
    font-weight: var(--font-weight-6);
    color: var(--text-1);
`;

const CloseButton = styled.button`
    padding: var(--size-1);
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--text-2);
`;

const AltTextarea = styled.textarea`
    width: 100%;
    padding: var(--size-2);
    border: 1px solid var(--surface-4);
    border-radius: var(--radius-2);
    background: var(--surface-1);
    color: var(--text-1);
    font-size: var(--font-size-1);
    resize: vertical;
    font-family: inherit;
    margin-bottom: var(--size-2);
`;

const AltFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CharCount = styled.span`
    font-size: var(--font-size-0);
    color: var(--text-2);
`;

const MediaGrid = styled.div<{ $columns: number }>`
    display: grid;
    grid-template-columns: ${props => props.$columns === 1 ? '1fr' : 'repeat(2, 1fr)'};
    gap: var(--size-2);
    margin-bottom: var(--size-3);
`;

const MediaItem = styled.div`
    position: relative;
    aspect-ratio: 16/9;
    background: var(--surface-3);
    border-radius: var(--radius-2);
    overflow: hidden;
`;

const MediaPreview = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const VideoPreview = styled.video`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const MediaControls = styled.div`
    position: absolute;
    top: var(--size-2);
    right: var(--size-2);
    display: flex;
    gap: var(--size-1);
`;

const OverlayButton = styled(IconButton)`
    background: rgba(0, 0, 0, 0.6);
    color: white;
`;

const AltBadge = styled.div`
    position: absolute;
    bottom: var(--size-2);
    left: var(--size-2);
    padding: 2px var(--size-2);
    background: rgba(0, 0, 0, 0.6);
    color: white;
    font-size: var(--font-size-0);
    border-radius: var(--radius-1);
`;

const AddButton = styled.button`
    aspect-ratio: 16/9;
    border: 2px dashed var(--surface-4);
    background: var(--surface-2);
    border-radius: var(--radius-2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-2);
    font-size: var(--font-size-1);

    &:hover {
        background: var(--surface-3);
        border-color: var(--surface-5);
    }
`;

const UploadingText = styled.div`
    padding: var(--size-2);
    color: var(--text-2);
    font-size: var(--font-size-1);
`;

interface MediaUploadProps {
  media: MediaAttachment[];
  onMediaAdd: (file: File) => Promise<void>;
  onMediaRemove: (id: string) => void;
  onAltTextChange: (id: string, altText: string) => void;
  isUploading: boolean;
  maxMedia?: number;
}

export function MediaUpload({
  media,
  onMediaAdd,
  onMediaRemove,
  onAltTextChange,
  isUploading,
  maxMedia = 4,
}: MediaUploadProps) {
  const [editingAlt, setEditingAlt] = useState<string | null>(null);
  const [altText, setAltText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length && media.length + i < maxMedia; i++) {
      await onMediaAdd(files[i]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAltEdit = (attachment: MediaAttachment) => {
    setEditingAlt(attachment.id);
    setAltText(attachment.description || '');
  };

  const handleAltSave = () => {
    if (editingAlt) {
      onAltTextChange(editingAlt, altText);
      setEditingAlt(null);
      setAltText('');
    }
  };

  if (media.length === 0 && !isUploading) {
    return null;
  }

  return (
    <div>
      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
      />

      {/* Alt Text Editor - Above Media Grid */}
      {editingAlt && (
        <AltEditor>
          <AltEditorHeader>
            <AltLabel>Alt Text</AltLabel>
            <CloseButton
              onClick={() => {
                setEditingAlt(null);
                setAltText('');
              }}
            >
              <X size={16} />
            </CloseButton>
          </AltEditorHeader>
          <AltTextarea
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Describe this media for visually impaired users..."
            maxLength={1500}
            rows={3}
          />
          <AltFooter>
            <CharCount>{altText.length} / 1500</CharCount>
            <Button size="small" onClick={handleAltSave}>
              Save
            </Button>
          </AltFooter>
        </AltEditor>
      )}

      {/* Media Grid */}
      <MediaGrid $columns={media.length === 1 ? 1 : 2}>
        {media.map((attachment) => (
          <MediaItem key={attachment.id}>
            {/* Media Preview */}
            {attachment.type === 'image' && attachment.preview_url && (
              <MediaPreview
                src={attachment.preview_url}
                alt={attachment.description || ''}
              />
            )}
            {attachment.type === 'video' && attachment.url && (
              <VideoPreview src={attachment.url} />
            )}

            {/* Controls */}
            <MediaControls>
              <OverlayButton
                size="small"
                onClick={() => handleAltEdit(attachment)}
                title="Edit alt text"
              >
                <Edit2 size={14} />
              </OverlayButton>
              <OverlayButton
                size="small"
                onClick={() => onMediaRemove(attachment.id)}
                title="Remove"
              >
                <X size={14} />
              </OverlayButton>
            </MediaControls>

            {/* Alt text indicator */}
            {attachment.description && (
              <AltBadge>ALT</AltBadge>
            )}
          </MediaItem>
        ))}

        {/* Add more button */}
        {media.length < maxMedia && !isUploading && (
          <AddButton onClick={() => fileInputRef.current?.click()}>
            <ImageIcon size={32} />
          </AddButton>
        )}
      </MediaGrid>

      {isUploading && (
        <UploadingText>Uploading...</UploadingText>
      )}
    </div>
  );
}
