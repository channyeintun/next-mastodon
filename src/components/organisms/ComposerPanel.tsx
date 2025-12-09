'use client';

import { useState, useRef, useEffect, Activity } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useCustomEmojis, useStatus, usePreferences, useScheduledStatus } from '@/api/queries';
import { useCreateStatus, useUpdateStatus, useDeleteScheduledStatus } from '@/api/mutations';
import { PostCard } from '../molecules/PostCard';
import { Avatar } from '../atoms/Avatar';
import { EmojiText } from '../atoms/EmojiText';
import { MediaUpload } from '../molecules/MediaUpload';
import { PollComposer, type PollData } from '../molecules/PollComposer';
import { EmojiPicker } from './EmojiPicker';
import { VisibilitySettingsModal, type Visibility, type QuoteVisibility } from '../molecules/VisibilitySettingsModal';
import { TiptapEditor } from '../atoms/TiptapEditor';
import { createMentionSuggestion } from '@/lib/tiptap/MentionSuggestion';
import { uploadMedia, updateMedia } from '@/api/client';
import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { Globe, Lock, Users, Mail, X, Smile, Image as ImageIcon, BarChart2, MessageSquareQuote, Clock } from 'lucide-react';
import type { CreateStatusParams, MediaAttachment } from '@/types/mastodon';

const MAX_CHAR_COUNT = 500;

export const visibilityOptions: Array<{ value: Visibility; label: string; icon: typeof Globe; description: string }> = [
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
  inReplyToId?: string;
  isReply?: boolean;
  quotedStatusId?: string;
  scheduledStatusId?: string;
}

export function ComposerPanel({
  editMode = false,
  statusId,
  initialContent = '',
  initialSpoilerText = '',
  initialVisibility = 'public',
  initialSensitive = false,
  inReplyToId,
  isReply = false,
  quotedStatusId,
  scheduledStatusId,
}: ComposerPanelProps) {
  const router = useRouter();
  const { data: currentAccount } = useCurrentAccount();
  const { data: customEmojis } = useCustomEmojis();
  const { data: preferences } = usePreferences();
  const { data: scheduledStatusData } = useScheduledStatus(scheduledStatusId || '');
  const createStatusMutation = useCreateStatus();
  const updateStatusMutation = useUpdateStatus();
  const deleteScheduledStatusMutation = useDeleteScheduledStatus();
  const { openModal, closeModal } = useGlobalModal();
  const editorRef = useRef<any>(null);

  const [content, setContent] = useState(initialContent);
  const [textContent, setTextContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [showScheduleInput, setShowScheduleInput] = useState(false);

  // Track whether we've initialized from preferences
  const [hasInitializedFromPreferences, setHasInitializedFromPreferences] = useState(false);

  // Initialize visibility - use props if in edit mode, otherwise start with initial and update from preferences
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);

  // Initialize from props, or default to public. We'll update from account preferences below.
  const [quoteVisibility, setQuoteVisibility] = useState<QuoteVisibility>('public');
  const [hasInitializedQuotePolicy, setHasInitializedQuotePolicy] = useState(false);

  const { data: quotedStatus } = useStatus(quotedStatusId || '');

  // Quote policy is forced to 'nobody' if visibility is private or direct, OR if this is a reply (per user request)
  const isQuotePolicyDisabled = visibility === 'private' || visibility === 'direct' || isReply;

  // Initialize visibility and sensitive from user preferences (only when not in edit mode)
  useEffect(() => {
    if (!editMode && !hasInitializedFromPreferences && preferences) {
      // Set default visibility from preferences
      if (preferences['posting:default:visibility']) {
        setVisibility(preferences['posting:default:visibility']);
      }
      // Set default sensitive from preferences
      if (preferences['posting:default:sensitive']) {
        setSensitive(preferences['posting:default:sensitive']);
      }
      setHasInitializedFromPreferences(true);
    }
  }, [editMode, hasInitializedFromPreferences, preferences]);

  useEffect(() => {
    if (isQuotePolicyDisabled) {
      setQuoteVisibility('nobody');
    } else if (!hasInitializedQuotePolicy && currentAccount?.source?.quote_policy) {
      // Initialize from account settings if not disabled and not yet initialized
      setQuoteVisibility(currentAccount.source.quote_policy);
      setHasInitializedQuotePolicy(true);
    }
  }, [visibility, isQuotePolicyDisabled, currentAccount, hasInitializedQuotePolicy]);
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
  const VisibilityIcon = currentVisibility?.icon ?? Globe;

  // Helper to open visibility settings modal
  const handleOpenVisibilitySettings = () => {
    openModal(
      <VisibilitySettingsModal
        initialVisibility={visibility}
        initialQuoteVisibility={quoteVisibility}
        isReply={isReply}
        onClose={closeModal}
        onSave={(newVisibility, newQuoteVisibility) => {
          setVisibility(newVisibility);
          setQuoteVisibility(newQuoteVisibility);
          closeModal();
        }}
      />
    );
  };

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

  // Effect to load scheduled status data
  useEffect(() => {
    if (scheduledStatusData) {
      if (scheduledStatusData.params.status) {
        // We set text content directly, HTML might not be available or needs conversion
        // For simplicity, we assume text is plain or basic HTML 
        // Note: Tiptap might need HTML. Status params 'text' is usually plain text.
        // But for editing, we might want to just set it.
        // If we have 'content' from status, we use it. But scheduled status stores "params" which has "status" (text).
        // Use textContent directly if possible or wrapped in p tags.
        setContent(scheduledStatusData.params.status?.replace(/\n/g, '<br>') || '');
      }
      if (scheduledStatusData.params.spoiler_text) {
        setContentWarning(scheduledStatusData.params.spoiler_text);
        setShowCWInput(true);
      }
      if (scheduledStatusData.params.sensitive) {
        setSensitive(true);
      }
      if (scheduledStatusData.params.visibility) {
        setVisibility(scheduledStatusData.params.visibility);
      }
      if (scheduledStatusData.media_attachments.length > 0) {
        setMedia(scheduledStatusData.media_attachments);
      }
      if (scheduledStatusData.scheduled_at) {
        // Format for datetime-local input: YYYY-MM-DDThh:mm
        const date = new Date(scheduledStatusData.scheduled_at);
        // Adjust to local time string
        const localIso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setScheduledAt(localIso);
        setShowScheduleInput(true);
      }
    }
  }, [scheduledStatusData]);

  const handlePost = async () => {
    if (!canPost) return;

    const params: CreateStatusParams = {
      status: textContent,
      visibility,
      quote_approval_policy: quoteVisibility, // Pass valid API value
      in_reply_to_id: inReplyToId,
      quoted_status_id: quotedStatusId,
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

    // Add scheduled_at if provided
    if (showScheduleInput && scheduledAt) {
      params.scheduled_at = new Date(scheduledAt).toISOString();
    }

    try {
      if (editMode && statusId) {
        await updateStatusMutation.mutateAsync({ id: statusId, params });
        router.back();
      } else {
        // Create new status (scheduled or immediate)
        await createStatusMutation.mutateAsync(params);

        // If we were editing a scheduled status (by creating a new one), we should delete the old one
        if (scheduledStatusId) {
          await deleteScheduledStatusMutation.mutateAsync(scheduledStatusId);
        }

        setContent('');
        setContentWarning('');
        setShowCWInput(false);
        setSensitive(false);
        setMedia([]);
        setPoll(null);
        setScheduledAt('');
        setShowScheduleInput(false);

        if (scheduledStatusId) {
          router.push('/scheduled');
        }
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
      {/* Header with avatar and visibility - Only show if not a reply */}
      {!isReply && (
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

              {/* Visibility Settings Trigger Button */}
              <div style={{ marginTop: '4px' }}>
                <button
                  className="compose-visibility-selector"
                  onClick={handleOpenVisibilitySettings}
                  title="Adjust visibility and interaction"
                  type="button"
                  style={{
                    padding: 0,
                    background: 'transparent',
                    color: 'var(--text-2)',
                    fontSize: 'var(--font-size-1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  <VisibilityIcon size={16} />
                  <span style={{ fontWeight: 500 }}>{currentVisibility?.label}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Content Warning */}
      {(showCWInput || showScheduleInput) && (
        <div style={{ marginBottom: 'var(--size-3)', display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
          {showCWInput && (
            <div style={{ marginBottom: 'var(--size-2)' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--size-2)',
              }}>
                <label htmlFor="cw-input" style={{ fontSize: 'var(--font-size-1)', fontWeight: 'var(--font-weight-6)', color: 'var(--text-2)' }}>
                  Content Warning
                </label>
                <button
                  aria-label="Remove content warning"
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
                id="cw-input"
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

          {/* Schedule Input */}
          {showScheduleInput && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--size-2)',
              }}>
                <label htmlFor="schedule-input" style={{ fontSize: 'var(--font-size-1)', fontWeight: 'var(--font-weight-6)', color: 'var(--text-2)' }}>
                  Schedule Post
                </label>
                <button
                  aria-label="Remove schedule"
                  onClick={() => {
                    setShowScheduleInput(false);
                    setScheduledAt('');
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
                id="schedule-input"
                type="datetime-local"
                value={scheduledAt}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => setScheduledAt(e.target.value)}
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
              <div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-3)', marginTop: '4px' }}>
                Post will be published automatically at this time.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Editor - Minimalist */}
      <div className="compose-editor-area">
        <TiptapEditor
          className={isReply ? "tiptap-editor-compact" : ""}
          content={content}
          placeholder={isReply ? "Post your reply" : "What's on your mind?"}
          emojis={customEmojis || []}
          onUpdate={(html, text) => {
            setContent(html);
            setTextContent(text);
          }}
          onEditorReady={(editor) => {
            editorRef.current = editor;
          }}
          mentionSuggestion={mentionSuggestion}
          ariaLabel="Compose post"
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
            {/* Emoji picker */}
            <div style={{ position: 'relative' }}>
              <button
                className="compose-tool-btn"
                style={{
                  anchorName: '--emoji-anchor'
                }}
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Add emoji"
                aria-label="Add emoji"
              >
                <Smile size={22} />
              </button>
              {<Activity mode={showEmojiPicker ? 'visible' : 'hidden'} >
                <EmojiPicker
                  onEmojiSelect={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </Activity>}
            </div>

            {/* Media Button */}
            <button
              className="compose-tool-btn"
              type="button" // Fix: explicit type
              onClick={() => fileInputRef.current?.click()}
              disabled={poll !== null || media.length >= 4}
              title="Add media"
              aria-label="Add media"
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
              aria-label="Add poll"
            >
              <BarChart2 size={22} />
            </button>

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
              aria-label="Add content warning"
            >
              <span style={{ fontSize: '14px' }}>CW</span>
            </button>

            {/* Schedule Button */}
            <button
              className="compose-tool-btn"
              type="button"
              onClick={() => setShowScheduleInput(!showScheduleInput)}
              style={{
                color: showScheduleInput ? 'var(--blue-6)' : undefined,
              }}
              title="Schedule post"
              aria-label="Schedule post"
              disabled={!!statusId} // Cannot schedule explicitly when editing a published post (though Mastodon API might not support it anyway)
            >
              <Clock size={22} />
            </button>

            {/* Visibility Button (Only shown in toolbar if it's a reply) */}
            {isReply && (
              <button
                className="compose-tool-btn"
                type="button"
                onClick={handleOpenVisibilitySettings}
                title={`Visibility: ${currentVisibility?.label}`}
              >
                <VisibilityIcon size={22} />
              </button>
            )}
          </div>

          <div className="compose-action-row" style={{ gap: 'var(--size-3)' }}>
            {/* Character count */}
            <div
              className={`compose-char-count ${isOverLimit ? 'danger' : charCount > MAX_CHAR_COUNT - 50 ? 'warning' : ''
                }`}
              aria-live="polite"
              aria-label={`${MAX_CHAR_COUNT - charCount} characters remaining`}
            >
              {MAX_CHAR_COUNT - charCount}
            </div>

            {/* Post/Update button */}
            <button
              className="compose-submit-btn"
              onClick={handlePost}
              disabled={!canPost}
            >
              {editMode ? 'Update' : (showScheduleInput && scheduledAt ? (scheduledStatusId ? 'Reschedule' : 'Schedule') : (isReply ? 'Reply' : 'Publish'))}
            </button>
          </div>
        </div>
      </div>

      {/* Quote Preview - Below Compose Panel */}
      {quotedStatus && (
        <div style={{
          marginTop: 'var(--size-4)',
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: 0.8
        }}>
          <PostCard status={quotedStatus} hideActions />
        </div>
      )}
    </div>
  );
}
