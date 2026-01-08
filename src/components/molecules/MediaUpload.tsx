'use client';

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { X, Edit2, Image as ImageIcon } from 'lucide-react';
import { Button } from '../atoms/Button';
import { ImageCropper } from './ImageCropper';
import { useCropper } from '@/hooks/useCropper';
import type { MediaAttachment } from '@/types/mastodon';
import { useTranslations } from 'next-intl';
import {
  HiddenInput,
  AltEditor,
  AltEditorHeader,
  AltLabel,
  CloseButton,
  AltTextarea,
  AltFooter,
  CharCount,
  MediaGrid,
  MediaItem,
  MediaPreview,
  VideoPreview,
  MediaControls,
  OverlayButton,
  AltBadge,
  AddButton,
  UploadingContainer,
  UploadingText,
  UploadingSpinner,
} from './MediaUploadStyles';

export interface MediaUploadHandle {
  openFileInput: () => void;
  processFiles: (files: File[]) => void;
}

interface MediaUploadProps {
  media: MediaAttachment[];
  onMediaAdd: (file: File) => Promise<void>;
  onMediaRemove: (id: string) => void;
  onAltTextChange: (id: string, altText: string) => void;
  isUploading: boolean;
  maxMedia?: number;
}

export const MediaUpload = forwardRef<MediaUploadHandle, MediaUploadProps>(function MediaUpload({
  media,
  onMediaAdd,
  onMediaRemove,
  onAltTextChange,
  isUploading,
  maxMedia = 4,
}, ref) {
  const t = useTranslations('composer');
  const tCommon = useTranslations('common');
  const [editingAlt, setEditingAlt] = useState<string | null>(null);
  const [altText, setAltText] = useState<string>('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { cropperImage, openCropper, closeCropper, handleCropComplete } = useCropper();

  // Process files through the cropper queue
  const startProcessingFiles = async (filesToProcess: File[]) => {
    if (filesToProcess.length === 0) return;

    // Take the first file and queue the rest
    const [firstFile, ...restFiles] = filesToProcess;
    setPendingFiles(restFiles);

    // Try to open cropper for the first image
    if (!openCropper(firstFile)) {
      // Non-image file, upload directly
      await onMediaAdd(firstFile);
      // Process next file if any
      processQueue(restFiles);
    }
  };

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    openFileInput: () => {
      fileInputRef.current?.click();
    },
    processFiles: (files: File[]) => {
      const remainingSlots = maxMedia - media.length;
      if (remainingSlots <= 0) return;

      const filesToProcess = files.slice(0, remainingSlots);
      startProcessingFiles(filesToProcess);
    },
  }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = maxMedia - media.length;
    const filesToProcess: File[] = [];

    for (let i = 0; i < files.length && i < remainingSlots; i++) {
      filesToProcess.push(files[i]);
    }

    if (filesToProcess.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    await startProcessingFiles(filesToProcess);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processQueue = async (queue: File[]) => {
    if (queue.length === 0) return;

    const [nextFile, ...rest] = queue;
    setPendingFiles(rest);

    if (!openCropper(nextFile)) {
      await onMediaAdd(nextFile);
      processQueue(rest);
    }
  };

  const onCropComplete = async (croppedBlob: Blob) => {
    handleCropComplete(croppedBlob, async (file) => {
      await onMediaAdd(file);
      // Process next file in queue after crop
      processQueue(pendingFiles);
    });
  };

  const handleCropCancel = () => {
    closeCropper();
    // Clear the queue when canceling
    setPendingFiles([]);
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

  const hasVisibleContent = media.length > 0 || isUploading;

  return (
    <>
      {/* Hidden file input - always rendered so ref works */}
      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
      />

      {/* Image Cropper Modal */}
      {cropperImage && (
        <ImageCropper
          image={cropperImage}
          onCropComplete={onCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* Visible content - only shown when there's media or uploading */}
      {hasVisibleContent && (
        <div>
          {/* Alt Text Editor - Above Media Grid */}
          {editingAlt && (
            <AltEditor>
              <AltEditorHeader>
                <AltLabel>{t('upload.altText')}</AltLabel>
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
                placeholder={t('upload.altTextDescription')}
                maxLength={1500}
                rows={3}
              />
              <AltFooter>
                <CharCount $isNearLimit={altText.length > 1400}>{altText.length} / 1500</CharCount>
                <Button size="small" onClick={handleAltSave}>
                  {tCommon('save')}
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
                    title={t('upload.editAlt')}
                  >
                    <Edit2 size={14} />
                  </OverlayButton>
                  <OverlayButton
                    size="small"
                    onClick={() => onMediaRemove(attachment.id)}
                    title={tCommon('remove')}
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
            <UploadingContainer>
              <UploadingSpinner />
              <UploadingText>{t('upload.status')}</UploadingText>
            </UploadingContainer>
          )}
        </div>
      )}
    </>
  );
});