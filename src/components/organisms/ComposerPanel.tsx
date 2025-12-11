'use client';

import styled from '@emotion/styled';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useCustomEmojis, useStatus, usePreferences, useScheduledStatus, useCreateStatus, useUpdateStatus, useDeleteScheduledStatus } from '@/api';
import { PostCard } from '@/components/organisms';
import { MediaUpload, PollComposer, VisibilitySettingsModal, ImageCropper, ComposerToolbar } from '@/components/molecules';
import type { PollData } from '@/components/molecules/PollComposer';
import type { Visibility, QuoteVisibility } from '@/components/molecules/VisibilitySettingsModal';
import { Avatar, EmojiText, TiptapEditor, ContentWarningInput, ScheduleInput } from '@/components/atoms';
import { EmojiPicker } from './EmojiPicker';
import { createMentionSuggestion } from '@/lib/tiptap/MentionSuggestion';
import { uploadMedia, updateMedia } from '@/api/client';
import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { useCropper } from '@/hooks/useCropper';
import { Globe, Lock, Users, Mail } from 'lucide-react';
import type { CreateStatusParams, MediaAttachment } from '@/types';

const MAX_CHAR_COUNT = 500;

// Styled components
const LoadingContainer = styled.div`
  padding: var(--size-4);
  text-align: center;
  color: var(--text-2);
`;

const DisplayName = styled.div`
  font-weight: var(--font-weight-7);
  font-size: var(--font-size-2);
`;

const VisibilityButtonWrapper = styled.div`
  margin-top: 4px;
`;

const VisibilityButton = styled.button`
  padding: 0;
  background: transparent;
  color: var(--text-2);
  font-size: var(--font-size-1);
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  border: none;

  &:hover {
    color: var(--text-1);
  }
`;

const VisibilityLabel = styled.span`
  font-weight: 500;
`;

const InputsContainer = styled.div`
  margin-bottom: var(--size-3);
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
`;

const HiddenInput = styled.input`
  display: none;
`;

const QuotePreview = styled.div`
  margin-top: var(--size-4);
  pointer-events: none;
  user-select: none;
  opacity: 0.8;
`;

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
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const [poll, setPoll] = useState<PollData | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { cropperImage, openCropper, closeCropper, handleCropComplete } = useCropper();

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
      const file = files[i];
      if (openCropper(file)) {
        break;
      } else {
        await handleMediaAdd(file);
      }
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
      editorRef.current.chain().focus().insertContent(emoji).run();
    }
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
        setMedia([]);
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
      {/* Image Cropper Modal */}
      {cropperImage && (
        <ImageCropper
          image={cropperImage}
          onCropComplete={(blob) => handleCropComplete(blob, handleMediaAdd)}
          onCancel={closeCropper}
          aspectRatio={16 / 9}
        />
      )}

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
      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={onFileInputChange}
      />

      {/* Toolbar */}
      <ComposerToolbar
        showEmojiPicker={showEmojiPicker}
        showCWInput={showCWInput}
        showScheduleInput={showScheduleInput}
        canAddMedia={poll === null && media.length < 4}
        canAddPoll={media.length === 0 && poll === null}
        canSchedule={!statusId}
        isReply={isReply}
        VisibilityIcon={VisibilityIcon}
        visibilityLabel={currentVisibility?.label}
        charCount={charCount}
        maxCharCount={MAX_CHAR_COUNT}
        isOverLimit={isOverLimit}
        canPost={canPost}
        submitLabel={submitLabel}
        onEmojiToggle={() => setShowEmojiPicker(!showEmojiPicker)}
        onMediaClick={() => fileInputRef.current?.click()}
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
