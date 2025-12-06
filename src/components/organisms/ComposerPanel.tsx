'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useCustomEmojis } from '@/api/queries';
import { useCreateStatus, useUpdateStatus } from '@/api/mutations';
import { Avatar } from '../atoms/Avatar';
import { EmojiText } from '../atoms/EmojiText';
import { MediaUpload } from '../molecules/MediaUpload';
import { PollComposer, type PollData } from '../molecules/PollComposer';
import { EmojiPicker } from './EmojiPicker';
import { TiptapEditor } from '../atoms/TiptapEditor';
import { createMentionSuggestion } from '@/lib/tiptap/MentionSuggestion';
import { uploadMedia, updateMedia } from '@/api/client';
import { Globe, Lock, Users, Mail, X, Smile, Image as ImageIcon, BarChart2 } from 'lucide-react';
import type { CreateStatusParams, MediaAttachment } from '@/types/mastodon';

const MAX_CHAR_COUNT = 500;

type Visibility = 'public' | 'unlisted' | 'private' | 'direct';

const visibilityOptions: Array<{ value: Visibility; label: string; icon: typeof Globe; description: string }> = [
  { value: 'public', label: 'Public', icon: Globe, description: 'Visible to everyone' },
  { value: 'unlisted', label: 'Unlisted', icon: Lock, description: 'Not shown in public timelines' },
  { value: 'private', label: 'Followers only', icon: Users, description: 'Only visible to followers' },
  { value: 'direct', label: 'Direct', icon: Mail, description: 'Only mentioned users' },
];

interface ComposerPanelProps {
  editMode?: boolean;
  statusId?: string;
  initialContent?: string;
  initialSpoilerText?: string;
  initialVisibility?: Visibility;
  initialSensitive?: boolean;
}

export function ComposerPanel({
  editMode = false,
  statusId,
  initialContent = '',
  initialSpoilerText = '',
  initialVisibility = 'public',
  initialSensitive = false,
}: ComposerPanelProps) {
  const router = useRouter();
  const { data: currentAccount } = useCurrentAccount();
  const { data: customEmojis } = useCustomEmojis();
  const createStatusMutation = useCreateStatus();
  const updateStatusMutation = useUpdateStatus();
  const editorRef = useRef<any>(null);

  const [content, setContent] = useState(initialContent);
  const [textContent, setTextContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [contentWarning, setContentWarning] = useState(initialSpoilerText);
  const [showCWInput, setShowCWInput] = useState(!!initialSpoilerText);
  const [sensitive, setSensitive] = useState(initialSensitive);
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const [poll, setPoll] = useState<PollData | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = textContent.length;
  const isOverLimit = charCount > MAX_CHAR_COUNT;
  const isPending = editMode ? updateStatusMutation.isPending : createStatusMutation.isPending;
  const canPost = charCount > 0 && !isOverLimit && !isPending && (media.length > 0 || poll !== null || textContent.trim().length > 0);

  const currentVisibility = visibilityOptions.find((v) => v.value === visibility);
  const VisibilityIcon = currentVisibility?.icon || Globe;

  // Create mention suggestion config for Tiptap
  const mentionSuggestion = createMentionSuggestion();

  const handleMediaAdd = async (file: File) => {
    setIsUploadingMedia(true);
    try {
      const attachment = await uploadMedia(file);
      setMedia((prev) => [...prev, attachment]);
    } catch (error) {
      console.error('Failed to upload media:', error);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const onFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      await handleMediaAdd(files[i]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMediaRemove = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAltTextChange = async (id: string, altText: string) => {
    try {
      const updated = await updateMedia(id, altText);
      setMedia((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (error) {
      console.error('Failed to update alt text:', error);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (editorRef.current) {
      // Insert emoji at cursor position using Tiptap commands
      editorRef.current.chain().focus().insertContent(emoji).run();
    }
  };

  const handlePost = async () => {
    if (!canPost) return;

    const params: CreateStatusParams = {
      status: textContent,
      visibility,
    };

    if (showCWInput && contentWarning.trim()) {
      params.spoiler_text = contentWarning;
      params.sensitive = true;
    } else if (sensitive) {
      params.sensitive = true;
    }

    if (media.length > 0) {
      params.media_ids = media.map((m) => m.id);
    }

    if (poll) {
      const validOptions = poll.options.filter((opt) => opt.trim().length > 0);
      if (validOptions.length >= 2) {
        params.poll = {
          options: validOptions,
          expires_in: poll.expiresIn,
          multiple: poll.multiple,
        };
      }
    }

    try {
      if (editMode && statusId) {
        await updateStatusMutation.mutateAsync({ id: statusId, params });
        router.back();
      } else {
        await createStatusMutation.mutateAsync(params);
        setContent('');
        setContentWarning('');
        setShowCWInput(false);
        setSensitive(false);
        setMedia([]);
        setPoll(null);
      }
    } catch (error) {
      console.error(`Failed to ${editMode ? 'update' : 'create'} post:`, error);
    }
  };

  if (!currentAccount) {
    return (
      <div style={{ padding: 'var(--size-4)', textAlign: 'center', color: 'var(--text-2)' }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      {/* Header with avatar and visibility */}
      <div className="compose-header">
        <Avatar
          src={currentAccount.avatar}
          alt={currentAccount.display_name || currentAccount.username}
          size="medium"
        />
        <div className="compose-user-info">
          <div className="compose-user-details">
            <div style={{ fontWeight: 'var(--font-weight-7)', fontSize: 'var(--font-size-2)' }}>
              <EmojiText
                text={currentAccount.display_name || currentAccount.username}
                emojis={currentAccount.emojis}
              />
            </div>

            {/* Visibility selector integrated into header */}
            <div style={{ position: 'relative' }}>
              <button
                className="compose-visibility-selector"
                onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                title="Post visibility"
                type="button"
                style={{
                  padding: 0,
                  background: 'transparent',
                  color: 'var(--text-2)',
                  fontSize: 'var(--font-size-1)',
                  marginTop: '2px',
                }}
              >
                <VisibilityIcon size={14} />
                <span>{currentVisibility?.label}</span>
              </button>

              {showVisibilityMenu && (
                <>
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 40,
                    }}
                    onClick={() => setShowVisibilityMenu(false)}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: 'var(--size-2)',
                      background: 'var(--surface-2)',
                      borderRadius: 'var(--radius-3)',
                      boxShadow: 'var(--shadow-4)',
                      padding: 'var(--size-2)',
                      minWidth: '220px',
                      zIndex: 50,
                      border: '1px solid var(--surface-3)',
                    }}
                  >
                    {visibilityOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setVisibility(option.value);
                            setShowVisibilityMenu(false);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--size-3)',
                            padding: 'var(--size-2) var(--size-3)',
                            border: 'none',
                            background: visibility === option.value ? 'var(--surface-3)' : 'transparent',
                            borderRadius: 'var(--radius-2)',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          <Icon size={18} style={{ color: visibility === option.value ? 'var(--blue-6)' : 'var(--text-2)' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)', fontSize: 'var(--font-size-1)' }}>
                              {option.label}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Warning */}
      {showCWInput && (
        <div style={{ marginBottom: 'var(--size-3)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--size-2)',
          }}>
            <label style={{ fontSize: 'var(--font-size-1)', fontWeight: 'var(--font-weight-6)', color: 'var(--text-2)' }}>
              Content Warning
            </label>
            <button
              onClick={() => {
                setShowCWInput(false);
                setContentWarning('');
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
          <input
            type="text"
            value={contentWarning}
            onChange={(e) => setContentWarning(e.target.value)}
            placeholder="Write your warning here..."
            style={{
              width: '100%',
              padding: 'var(--size-2) var(--size-3)',
              border: '1px solid var(--surface-3)',
              borderRadius: 'var(--radius-2)',
              background: 'var(--surface-1)',
              color: 'var(--text-1)',
              fontSize: 'var(--font-size-2)',
            }}
          />
        </div>
      )}

      {/* Editor - Minimalist */}
      <div className="compose-editor-area">
        <TiptapEditor
          content={content}
          placeholder="What's on your mind?"
          emojis={customEmojis || []}
          onUpdate={(html, text) => {
            setContent(html);
            setTextContent(text);
          }}
          onEditorReady={(editor) => {
            editorRef.current = editor;
          }}
          mentionSuggestion={mentionSuggestion}
        />
      </div>

      {/* Media Upload */}
      {(media.length > 0 || isUploadingMedia) && (
        <MediaUpload
          media={media}
          onMediaAdd={handleMediaAdd}
          onMediaRemove={handleMediaRemove}
          onAltTextChange={handleAltTextChange}
          isUploading={isUploadingMedia}
        />
      )}

      {/* Poll Composer */}
      {poll !== null && (
        <PollComposer poll={poll} onPollChange={setPoll} />
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={onFileInputChange}
        style={{ display: 'none' }}
      />

      {/* Bottom toolbar */}
      <div className="compose-toolbar-area">
        <div className="compose-toolbar-row">
          <div className="compose-tools">
            {/* Media Button */}
            <button
              className="compose-tool-btn"
              type="button" // Fix: explicit type
              onClick={() => fileInputRef.current?.click()}
              disabled={poll !== null || media.length >= 4}
              title="Add media"
            >
              <ImageIcon size={22} />
            </button>

            {/* Poll Button */}
            <button
              className="compose-tool-btn"
              type="button"
              onClick={() => setPoll({ options: ['', ''], expiresIn: 86400, multiple: false })}
              disabled={media.length > 0 || poll !== null}
              title="Add poll"
            >
              <BarChart2 size={22} />
            </button>

            {/* Emoji picker */}
            <div style={{ position: 'relative' }}>
              <button
                className="compose-tool-btn"
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Add emoji"
              >
                <Smile size={22} />
              </button>
              {showEmojiPicker && (
                <EmojiPicker
                  onEmojiSelect={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              )}
            </div>

            {/* Content Warning toggle */}
            <button
              className="compose-tool-btn"
              type="button"
              onClick={() => setShowCWInput(!showCWInput)}
              style={{
                color: showCWInput ? 'var(--blue-6)' : undefined,
                fontWeight: showCWInput ? 'bold' : 'normal',
              }}
              title="Add content warning"
            >
              <span style={{ fontSize: '14px' }}>CW</span>
            </button>
          </div>

          <div className="compose-action-row" style={{ gap: 'var(--size-3)' }}>
            {/* Character count */}
            <div
              className={`compose-char-count ${isOverLimit ? 'danger' : charCount > MAX_CHAR_COUNT - 50 ? 'warning' : ''
                }`}
            >
              {MAX_CHAR_COUNT - charCount}
            </div>

            {/* Post/Update button */}
            <button
              className="compose-submit-btn"
              onClick={handlePost}
              disabled={!canPost}
            >
              {editMode ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
