'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { useCurrentAccount } from '@/api/queries';
import { useCreateStatus, useUpdateStatus } from '@/api/mutations';
import { Avatar } from '../atoms/Avatar';
import { EmojiText } from '../atoms/EmojiText';
import { MediaUpload } from '../molecules/MediaUpload';
import { PollComposer, type PollData } from '../molecules/PollComposer';
import { EmojiPicker } from './EmojiPicker';
import { TiptapEditor } from '../atoms/TiptapEditor';
import { createMentionSuggestion } from '@/lib/tiptap/MentionSuggestion';
import { getMastodonClient } from '@/api/client';
import { Globe, Lock, Users, Mail, X, Smile } from 'lucide-react';
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
  const createStatusMutation = useCreateStatus();
  const updateStatusMutation = useUpdateStatus();

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
      const attachment = await getMastodonClient().uploadMedia(file);
      setMedia((prev) => [...prev, attachment]);
    } catch (error) {
      console.error('Failed to upload media:', error);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleMediaRemove = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAltTextChange = async (id: string, altText: string) => {
    try {
      const updated = await getMastodonClient().updateMedia(id, altText);
      setMedia((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (error) {
      console.error('Failed to update alt text:', error);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    // Emoji will be inserted at cursor position in Tiptap editor
    // For now, just append to content - Tiptap will handle cursor position
    setContent((prev) => prev + emoji);
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
      <Card>
        <div style={{ padding: 'var(--size-4)', textAlign: 'center', color: 'var(--text-2)' }}>
          Loading...
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ padding: 'var(--size-4)', position: 'relative' }}>
        {/* Header with avatar */}
        <div style={{ display: 'flex', gap: 'var(--size-3)', marginBottom: 'var(--size-3)' }}>
          <Avatar
            src={currentAccount.avatar}
            alt={currentAccount.display_name || currentAccount.username}
            size="medium"
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'var(--font-weight-6)', fontSize: 'var(--font-size-2)' }}>
              <EmojiText
                text={currentAccount.display_name || currentAccount.username}
                emojis={currentAccount.emojis}
              />
            </div>
            <div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
              @{currentAccount.acct}
            </div>
          </div>

          {/* Visibility selector */}
          <div style={{ position: 'relative' }}>
            <Button
              variant="ghost"
              size="small"
              onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
              title="Post visibility"
            >
              <VisibilityIcon size={18} />
              <span style={{ fontSize: 'var(--font-size-0)' }}>
                {currentVisibility?.label}
              </span>
            </Button>

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
                    right: 0,
                    marginTop: 'var(--size-2)',
                    background: 'var(--surface-2)',
                    borderRadius: 'var(--radius-2)',
                    boxShadow: 'var(--shadow-4)',
                    padding: 'var(--size-2)',
                    minWidth: '250px',
                    zIndex: 50,
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
                          alignItems: 'start',
                          gap: 'var(--size-2)',
                          padding: 'var(--size-2)',
                          border: 'none',
                          background: visibility === option.value ? 'var(--surface-3)' : 'transparent',
                          borderRadius: 'var(--radius-2)',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <Icon size={20} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>
                            {option.label}
                          </div>
                          <div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                            {option.description}
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

        {/* Content Warning */}
        {showCWInput && (
          <div style={{ marginBottom: 'var(--size-3)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--size-2)',
            }}>
              <label style={{ fontSize: 'var(--font-size-1)', fontWeight: 'var(--font-weight-6)' }}>
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
              placeholder="Write your warning here"
              style={{
                width: '100%',
                padding: 'var(--size-2)',
                border: '1px solid var(--surface-4)',
                borderRadius: 'var(--radius-2)',
                background: 'var(--surface-1)',
                color: 'var(--text-1)',
                fontSize: 'var(--font-size-1)',
              }}
            />
          </div>
        )}

        {/* Editor - Tiptap with Mention Autocomplete */}
        <div
          style={{
            border: '1px solid var(--surface-4)',
            borderRadius: 'var(--radius-2)',
            background: 'var(--surface-1)',
            marginBottom: 'var(--size-3)',
          }}
        >
          <TiptapEditor
            content={content}
            editable={true}
            placeholder="What's on your mind?"
            emojis={currentAccount?.emojis || []}
            onUpdate={(html, text) => {
              setContent(html);
              setTextContent(text);
            }}
            mentionSuggestion={mentionSuggestion}
          />
        </div>

        {/* Media Upload */}
        {poll === null && (
          <MediaUpload
            media={media}
            onMediaAdd={handleMediaAdd}
            onMediaRemove={handleMediaRemove}
            onAltTextChange={handleAltTextChange}
            isUploading={isUploadingMedia}
          />
        )}

        {/* Poll Composer */}
        {media.length === 0 && (
          <PollComposer poll={poll} onPollChange={setPoll} />
        )}

        {/* Bottom toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 'var(--size-2)', position: 'relative' }}>
            {/* Emoji picker */}
            <Button
              type="button"
              variant="ghost"
              size="small"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Add emoji"
            >
              <Smile size={18} />
            </Button>
            {showEmojiPicker && (
              <EmojiPicker
                onEmojiSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}

            {/* Content Warning toggle */}
            <Button
              type="button"
              variant="ghost"
              size="small"
              onClick={() => setShowCWInput(!showCWInput)}
              style={{
                background: showCWInput ? 'var(--surface-3)' : undefined,
              }}
              title="Add content warning"
            >
              CW
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)' }}>
            {/* Character count */}
            <div
              style={{
                fontSize: 'var(--font-size-0)',
                color: isOverLimit ? 'var(--red-6)' : 'var(--text-2)',
                fontWeight: isOverLimit ? 'var(--font-weight-6)' : 'normal',
              }}
            >
              {charCount} / {MAX_CHAR_COUNT}
            </div>

            {/* Post/Update button */}
            <Button
              onClick={handlePost}
              disabled={!canPost}
              isLoading={isPending}
            >
              {editMode ? 'Update' : 'Post'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
