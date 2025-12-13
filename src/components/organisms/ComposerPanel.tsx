'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useCustomEmojis, useStatus, usePreferences, useScheduledStatus, useCreateStatus, useUpdateStatus, useDeleteScheduledStatus } from '@/api';
import { PostCard } from '@/components/organisms';
import { MediaUpload, PollComposer, VisibilitySettingsModal, ComposerToolbar, type MediaUploadHandle } from '@/components/molecules';
import type { PollData } from '@/components/molecules/PollComposer';
import type { Visibility, QuoteVisibility } from '@/components/molecules/VisibilitySettingsModal';
import { Avatar, EmojiText, TiptapEditor, ContentWarningInput, ScheduleInput } from '@/components/atoms';
import { EmojiPicker } from './EmojiPicker';
import { createMentionSuggestion } from '@/lib/tiptap/MentionSuggestion';
import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { Globe, Lock, Users, Mail, X } from 'lucide-react';
import type { CreateStatusParams } from '@/types';
import { Spinner } from '@/components/atoms/Spinner';
import {
  LoadingContainer,
  DisplayName,
  VisibilityButtonWrapper,
  VisibilityButton,
  VisibilityLabel,
  InputsContainer,
  QuotePreview,
  CompactMediaPreviewContainer,
  CompactMediaPreviewItem,
  CompactMediaPreviewImage,
  CompactMediaPreviewControls,
  CompactMediaPreviewButton,
  CompactUploadingIndicator
} from './ComposerPanelStyles';

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
  /** Account acct to prepend as a mention (used for replies) */
  mentionPrefix?: string;
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
  mentionPrefix,
}: ComposerPanelProps) {
  // Build initial content with mention prefix if provided
  const computedInitialContent = mentionPrefix
    ? `<span data-type="mention" class="mention" data-id="${mentionPrefix}" data-label="${mentionPrefix}">@${mentionPrefix}</span>&nbsp;${initialContent}`
    : initialContent;
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

  const [content, setContent] = useState(computedInitialContent);
  const [textContent, setTextContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [showScheduleInput, setShowScheduleInput] = useState(false);
  const [hasInitializedFromPreferences, setHasInitializedFromPreferences] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);
  const [quoteVisibility, setQuoteVisibility] = useState<QuoteVisibility>('public');
  const [hasInitializedQuotePolicy, setHasInitializedQuotePolicy] = useState(false);

  const { data: quotedStatus } = useStatus(quotedStatusId || '');

  const isQuotePolicyDisabled = visibility === 'private' || visibility === 'direct' || isReply;

  // Initialize from user preferences
  useEffect(() => {
    if (!editMode && !hasInitializedFromPreferences && preferences) {
      if (preferences['posting:default:visibility']) {
        setVisibility(preferences['posting:default:visibility']);
      }
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
      setQuoteVisibility(currentAccount.source.quote_policy);
      setHasInitializedQuotePolicy(true);
    }
  }, [visibility, isQuotePolicyDisabled, currentAccount, hasInitializedQuotePolicy]);

  const [contentWarning, setContentWarning] = useState(initialSpoilerText);
  const [showCWInput, setShowCWInput] = useState(!!initialSpoilerText);
  const [sensitive, setSensitive] = useState(initialSensitive);
  const [poll, setPoll] = useState<PollData | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const mediaUploadRef = useRef<MediaUploadHandle>(null);

  // Use media upload hook
  const {
    media,
    setMedia,
    isUploading: isUploadingMedia,
    handleMediaAdd,
    handleMediaRemove,
    handleAltTextChange,
    clearMedia,
  } = useMediaUpload();

  const charCount = textContent.length;
  const isOverLimit = charCount > MAX_CHAR_COUNT;
  const isPending = editMode ? updateStatusMutation.isPending : createStatusMutation.isPending;
  const canPost = charCount > 0 && !isOverLimit && !isPending && (media.length > 0 || poll !== null || textContent.trim().length > 0);

  const currentVisibility = visibilityOptions.find((v) => v.value === visibility);
  const VisibilityIcon = currentVisibility?.icon ?? Globe;

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

  const mentionSuggestion = createMentionSuggestion();

  const handleEmojiSelect = (emoji: string) => {
    if (editorRef.current) {
      editorRef.current.chain().focus().insertContent(emoji).run();
    }
  };

  // Handle files pasted or dropped into the editor
  const handleFilePaste = async (files: File[]) => {
    // Check if we can add more media
    const remainingSlots = 4 - media.length;
    if (remainingSlots <= 0 || poll !== null) return;

    // Process pasted files through MediaUpload's cropper
    mediaUploadRef.current?.processFiles(files);
  };

  // Handle URLs pasted into the editor (for potential link card creation)
  const handleUrlPaste = (url: URL) => {
    // Currently, link cards are created server-side when posting
    // This could be extended to show a preview before posting
    console.log('URL pasted:', url.href);
  };

  // Load scheduled status data
  useEffect(() => {
    if (scheduledStatusData) {
      if (scheduledStatusData.params.status) {
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
        const date = new Date(scheduledStatusData.scheduled_at);
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
      quote_approval_policy: quoteVisibility,
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

    if (showScheduleInput && scheduledAt) {
      params.scheduled_at = new Date(scheduledAt).toISOString();
    }

    try {
      if (editMode && statusId) {
        await updateStatusMutation.mutateAsync({ id: statusId, params });
        router.back();
      } else {
        await createStatusMutation.mutateAsync(params);

        if (scheduledStatusId) {
          await deleteScheduledStatusMutation.mutateAsync(scheduledStatusId);
        }

        setContent('');
        setContentWarning('');
        setShowCWInput(false);
        setSensitive(false);
        clearMedia();
        setPoll(null);
        setScheduledAt('');
        setShowScheduleInput(false);

        // Navigate after publishing
        if (scheduledStatusId) {
          router.push('/scheduled');
        } else if (quotedStatusId) {
          router.push('/');
        }
      }
    } catch (error) {
      console.error(`Failed to ${editMode ? 'update' : 'create'} post:`, error);
    }
  };

  // Compute submit button label
  const submitLabel = editMode
    ? 'Update'
    : (showScheduleInput && scheduledAt
      ? (scheduledStatusId ? 'Reschedule' : 'Schedule')
      : (isReply ? 'Reply' : 'Publish'));

  if (!currentAccount) {
    return <LoadingContainer>Loading...</LoadingContainer>;
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
              <DisplayName>
                <EmojiText
                  text={currentAccount.display_name || currentAccount.username}
                  emojis={currentAccount.emojis}
                />
              </DisplayName>

              {/* Visibility Settings Trigger Button */}
              <VisibilityButtonWrapper>
                <VisibilityButton
                  className="compose-visibility-selector"
                  onClick={handleOpenVisibilitySettings}
                  title="Adjust visibility and interaction"
                  type="button"
                >
                  <VisibilityIcon size={16} />
                  <VisibilityLabel>{currentVisibility?.label}</VisibilityLabel>
                </VisibilityButton>
              </VisibilityButtonWrapper>
            </div>
          </div>
        </div>
      )}

      {/* Content Warning and Schedule Inputs */}
      {(showCWInput || showScheduleInput) && (
        <InputsContainer>
          {showCWInput && (
            <ContentWarningInput
              value={contentWarning}
              onChange={setContentWarning}
              onRemove={() => {
                setShowCWInput(false);
                setContentWarning('');
              }}
            />
          )}
          {showScheduleInput && (
            <ScheduleInput
              value={scheduledAt}
              onChange={setScheduledAt}
              onRemove={() => {
                setShowScheduleInput(false);
                setScheduledAt('');
              }}
            />
          )}
        </InputsContainer>
      )}

      {/* Editor */}
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
          onFilePaste={handleFilePaste}
          onUrlPaste={handleUrlPaste}
          maxFiles={4 - media.length}
          ariaLabel="Compose post"
        />
      </div>

      {/* Media Upload - Compact preview for replies, full for compose */}
      {isReply ? (
        <>
          {/* Compact Media Preview for Reply Mode */}
          {(media.length > 0 || isUploadingMedia) && (
            <CompactMediaPreviewContainer>
              {media.map(m => (
                <CompactMediaPreviewItem key={m.id}>
                  <CompactMediaPreviewImage src={m.preview_url || m.url || ''} alt="" />
                  <CompactMediaPreviewControls className="compact-media-controls">
                    <CompactMediaPreviewButton onClick={() => handleMediaRemove(m.id)} title="Remove">
                      <X size={12} />
                    </CompactMediaPreviewButton>
                  </CompactMediaPreviewControls>
                </CompactMediaPreviewItem>
              ))}
              {isUploadingMedia && (
                <CompactUploadingIndicator><Spinner /></CompactUploadingIndicator>
              )}
            </CompactMediaPreviewContainer>
          )}
          {/* Hidden MediaUpload for cropper functionality */}
          <MediaUpload
            ref={mediaUploadRef}
            media={[]}
            onMediaAdd={handleMediaAdd}
            onMediaRemove={handleMediaRemove}
            onAltTextChange={handleAltTextChange}
            isUploading={false}
          />
        </>
      ) : (
        <MediaUpload
          ref={mediaUploadRef}
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

      {/* Toolbar */}
      <ComposerToolbar
        showEmojiPicker={showEmojiPicker}
        showCWInput={showCWInput}
        showScheduleInput={showScheduleInput}
        canAddMedia={poll === null && media.length < 4}
        canAddPoll={media.length === 0 && poll === null}
        canSchedule={!statusId && !isReply}
        isReply={isReply}
        VisibilityIcon={VisibilityIcon}
        visibilityLabel={currentVisibility?.label}
        charCount={charCount}
        maxCharCount={MAX_CHAR_COUNT}
        isOverLimit={isOverLimit}
        canPost={canPost}
        submitLabel={submitLabel}
        onEmojiToggle={() => setShowEmojiPicker(!showEmojiPicker)}
        onMediaClick={() => mediaUploadRef.current?.openFileInput()}
        onPollClick={() => setPoll({ options: ['', ''], expiresIn: 86400, multiple: false })}
        onCWToggle={() => setShowCWInput(!showCWInput)}
        onScheduleToggle={() => setShowScheduleInput(!showScheduleInput)}
        onVisibilityClick={handleOpenVisibilitySettings}
        onSubmit={handlePost}
        emojiPicker={
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        }
      />

      {/* Quote Preview */}
      {quotedStatus && (
        <QuotePreview>
          <PostCard status={quotedStatus} hideActions />
        </QuotePreview>
      )}
    </div>
  );
}