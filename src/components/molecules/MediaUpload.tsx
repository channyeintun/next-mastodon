'use client';

import { useState, useRef } from 'react';
import { X, Edit2, Image as ImageIcon } from 'lucide-react';
import { Button } from '../atoms/Button';
import { IconButton } from '../atoms/IconButton';
import type { MediaAttachment } from '@/types/mastodon';

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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Alt Text Editor - Above Media Grid */}
      {editingAlt && (
        <div style={{
          marginBottom: 'var(--size-3)',
          padding: 'var(--size-3)',
          background: 'var(--surface-2)',
          borderRadius: 'var(--radius-2)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--size-2)',
          }}>
            <label style={{
              fontSize: 'var(--font-size-1)',
              fontWeight: 'var(--font-weight-6)',
              color: 'var(--text-1)',
            }}>
              Alt Text
            </label>
            <button
              onClick={() => {
                setEditingAlt(null);
                setAltText('');
              }}
              style={{
                padding: 'var(--size-1)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text-2)',
              }}
            >
              <X size={16} />
            </button>
          </div>
          <textarea
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Describe this media for visually impaired users..."
            maxLength={1500}
            rows={3}
            style={{
              width: '100%',
              padding: 'var(--size-2)',
              border: '1px solid var(--surface-4)',
              borderRadius: 'var(--radius-2)',
              background: 'var(--surface-1)',
              color: 'var(--text-1)',
              fontSize: 'var(--font-size-1)',
              resize: 'vertical',
              fontFamily: 'inherit',
              marginBottom: 'var(--size-2)',
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
              {altText.length} / 1500
            </span>
            <Button size="small" onClick={handleAltSave}>
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Media Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: media.length === 1 ? '1fr' : 'repeat(2, 1fr)',
        gap: 'var(--size-2)',
        marginBottom: 'var(--size-3)',
      }}>
        {media.map((attachment) => (
          <div
            key={attachment.id}
            style={{
              position: 'relative',
              aspectRatio: '16/9',
              background: 'var(--surface-3)',
              borderRadius: 'var(--radius-2)',
              overflow: 'hidden',
            }}
          >
            {/* Media Preview */}
            {attachment.type === 'image' && attachment.preview_url && (
              <img
                src={attachment.preview_url}
                alt={attachment.description || ''}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            )}
            {attachment.type === 'video' && attachment.url && (
              <video
                src={attachment.url}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            )}

            {/* Controls */}
            <div style={{
              position: 'absolute',
              top: 'var(--size-2)',
              right: 'var(--size-2)',
              display: 'flex',
              gap: 'var(--size-1)',
            }}>
              <IconButton
                size="small"
                onClick={() => handleAltEdit(attachment)}
                title="Edit alt text"
                style={{ background: 'rgba(0, 0, 0, 0.6)', color: 'white' }}
              >
                <Edit2 size={14} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onMediaRemove(attachment.id)}
                title="Remove"
                style={{ background: 'rgba(0, 0, 0, 0.6)', color: 'white' }}
              >
                <X size={14} />
              </IconButton>
            </div>

            {/* Alt text indicator */}
            {attachment.description && (
              <div style={{
                position: 'absolute',
                bottom: 'var(--size-2)',
                left: 'var(--size-2)',
                padding: '2px var(--size-2)',
                background: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                fontSize: 'var(--font-size-0)',
                borderRadius: 'var(--radius-1)',
              }}>
                ALT
              </div>
            )}
          </div>
        ))}

        {/* Add more button */}
        {media.length < maxMedia && !isUploading && (
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              aspectRatio: '16/9',
              border: '2px dashed var(--surface-4)',
              background: 'var(--surface-2)',
              borderRadius: 'var(--radius-2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-2)',
              fontSize: 'var(--font-size-1)',
            }}
          >
            <ImageIcon size={32} />
          </button>
        )}
      </div>

      {isUploading && (
        <div style={{
          padding: 'var(--size-2)',
          color: 'var(--text-2)',
          fontSize: 'var(--font-size-1)',
        }}>
          Uploading...
        </div>
      )}
    </div>
  );
}
