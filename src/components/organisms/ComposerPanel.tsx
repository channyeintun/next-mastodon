'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, useCustomEmojis, useStatus, usePreferences, useScheduledStatus, useCreateStatus, useUpdateStatus, useDeleteScheduledStatus } from '@/api';
import { PostCard } from '@/components/organisms';
import { MediaUpload, PollComposer, VisibilitySettingsModal, ComposerToolbar, type MediaUploadHandle } from '@/components/molecules';
import type { PollData } from '@/components/molecules/PollComposer';
import type { Visibility, QuoteVisibility } from '@/components/molecules/VisibilitySettingsModal';
import { ContentWarningInput, ScheduleInput } from '@/components/atoms';
import { TiptapEditor } from '@/components/atoms/TiptapEditor';
import { EmojiPicker } from './EmojiPicker';
import { createMentionSuggestion } from '@/lib/tiptap/MentionSuggestion';
import { length as unicodeLength } from 'stringz';
import { countableText } from '@/utils/counter';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { observer } from 'mobx-react-lite';
import { Globe, X } from 'lucide-react';
import { toLocalISOString, parseDate } from '@/utils/date';
import type { CreateStatusParams } from '@/types';
import { Spinner } from '@/components/atoms/Spinner';
import { useTranslations } from 'next-intl';
import { useGlobalModal } from '@/contexts/GlobalModalContext';
import {
  InputsContainer,
  QuotePreview,
  CompactMediaPreviewContainer,
  CompactMediaPreviewItem,
  CompactMediaPreviewImage,
  CompactMediaPreviewControls,
  CompactMediaPreviewButton,
  CompactUploadingIndicator
} from './ComposerPanelStyles';
import { MAX_CHAR_COUNT, getVisibilityOptions } from './ComposerConstants';
import { ComposerHeader } from './ComposerHeader';

interface ComposerPanelProps {
  editMode?: boolean;
  statusId?: string;
  initialContent?: string;
  initialSpoilerText?: string;
  initialVisibility?: Visibility;
  initialSensitive?: boolean;
  initialMedia?: any[];
  inReplyToId?: string;
  isReply?: boolean;
  quotedStatusId?: string;
  scheduledStatusId?: string;
  mentionPrefix?: string;
  disableUnsavedChanges?: boolean;
}

export const ComposerPanel = observer(({
  editMode = false,
  statusId,
  initialContent = '',
  initialSpoilerText = '',
  initialVisibility = 'public',
  initialSensitive = false,
  initialMedia = [],
  inReplyToId,
  isReply = false,
  quotedStatusId,
  scheduledStatusId,
  mentionPrefix,
}: ComposerPanelProps) => {
  const t = useTranslations('composer');
  const tCommon = useTranslations('common');
  const visibilityOptions = getVisibilityOptions(t);

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
  const hasInitializedMedia = useRef(false);

  const [content, setContent] = useState(computedInitialContent);
  const [textContent, setTextContent] = useState(() =>
    computedInitialContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  );
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [showScheduleInput, setShowScheduleInput] = useState(false);
  const [hasInitializedFromPreferences, setHasInitializedFromPreferences] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);
  const [quoteVisibility, setQuoteVisibility] = useState<QuoteVisibility>('public');
  const [hasInitializedQuotePolicy, setHasInitializedQuotePolicy] = useState(false);
  const [language, setLanguage] = useState<string>('en');

  const { data: quotedStatus } = useStatus(quotedStatusId || '');
  const isQuotePolicyDisabled = visibility === 'private' || visibility === 'direct' || isReply;

  // Initialize from user preferences
  useEffect(() => {
    if (!editMode && !hasInitializedFromPreferences && preferences) {
      if (preferences['posting:default:visibility']) setVisibility(preferences['posting:default:visibility']);
      if (preferences['posting:default:sensitive']) setSensitive(preferences['posting:default:sensitive']);
      if (preferences['posting:default:language']) setLanguage(preferences['posting:default:language']);
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

  const {
    media, setMedia, isUploading: isUploadingMedia,
    handleMediaAdd, handleMediaRemove, handleAltTextChange, clearMedia,
  } = useMediaUpload();

  useEffect(() => {
    if (!hasInitializedMedia.current) {
      if (initialMedia.length > 0) {
        setMedia(initialMedia);
      }
      hasInitializedMedia.current = true;
    }
  }, [initialMedia, setMedia]);


  const charCount = unicodeLength(countableText(textContent));

  const isOverLimit = charCount > MAX_CHAR_COUNT;
  const isPending = editMode ? updateStatusMutation.isPending : createStatusMutation.isPending;
  const canPost = charCount > 0 && !isOverLimit && !isPending && (media.length > 0 || poll !== null || textContent.trim().length > 0);

  const currentVisibility = visibilityOptions.find((v) => v.value === visibility);
  const VisibilityIcon = currentVisibility?.icon ?? Globe;

  const isDirty = (
    (textContent.trim() !== computedInitialContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()) ||
    (hasInitializedMedia.current && media.length !== initialMedia.length) ||
    poll !== null ||
    (contentWarning.trim() !== initialSpoilerText.trim())
  );

  useUnsavedChanges(isDirty);

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

  const handleEmojiSelect = (emoji: string) => {
    if (editorRef.current) editorRef.current.chain().focus().insertContent(emoji).run();
  };

  const handleFilePaste = async (files: File[]) => {
    const remainingSlots = 4 - media.length;
    if (remainingSlots <= 0 || poll !== null) return;
    mediaUploadRef.current?.processFiles(files);
  };

  useEffect(() => {
    if (scheduledStatusData) {
      if (scheduledStatusData.params.status) setContent(scheduledStatusData.params.status?.replace(/\n/g, '<br>') || '');
      if (scheduledStatusData.params.spoiler_text) {
        setContentWarning(scheduledStatusData.params.spoiler_text);
        setShowCWInput(true);
      }
      if (scheduledStatusData.params.sensitive) setSensitive(true);
      if (scheduledStatusData.params.visibility) setVisibility(scheduledStatusData.params.visibility);
      if (scheduledStatusData.media_attachments.length > 0) setMedia(scheduledStatusData.media_attachments);
      if (scheduledStatusData.scheduled_at) {
        setScheduledAt(toLocalISOString(parseDate(scheduledStatusData.scheduled_at)));
        setShowScheduleInput(true);
      }
    }
  }, [scheduledStatusData, setMedia]);

  const handlePost = async () => {
    if (!canPost) return;
    const params: CreateStatusParams = {
      status: textContent, visibility, language,
      quote_approval_policy: quoteVisibility,
      in_reply_to_id: inReplyToId, quoted_status_id: quotedStatusId,
    };
    if (showCWInput && contentWarning.trim()) {
      params.spoiler_text = contentWarning;
      params.sensitive = true;
    } else if (sensitive) {
      params.sensitive = true;
    }
    if (media.length > 0) params.media_ids = media.map((m) => m.id);
    if (poll) {
      const validOptions = poll.options.filter((opt) => opt.trim().length > 0);
      if (validOptions.length >= 2) {
        params.poll = { options: validOptions, expires_in: poll.expiresIn, multiple: poll.multiple };
      }
    }
    if (showScheduleInput && scheduledAt) params.scheduled_at = new Date(scheduledAt).toISOString();

    try {
      if (editMode && statusId) {
        await updateStatusMutation.mutateAsync({ id: statusId, params });
        router.back();
      } else {
        await createStatusMutation.mutateAsync(params);
        if (scheduledStatusId) await deleteScheduledStatusMutation.mutateAsync(scheduledStatusId);
        setContent(''); setContentWarning(''); setShowCWInput(false); setSensitive(false);
        clearMedia(); setPoll(null); setScheduledAt(''); setShowScheduleInput(false);
        router.back();
      }
    } catch (error) { console.error(`Failed to ${editMode ? 'update' : 'create'} post:`, error); }
  };


  const submitLabel = editMode ? t('update') : (showScheduleInput && scheduledAt ? (scheduledStatusId ? t('reschedule') : t('schedule')) : (isReply ? t('reply') : t('publish')));

  return (
    <div>
      {!isReply && (
        <ComposerHeader
          currentAccount={currentAccount}
          editMode={editMode}
          visibility={visibility}
          language={language}
          setLanguage={setLanguage}
          VisibilityIcon={VisibilityIcon}
          currentVisibilityLabel={currentVisibility?.label}
          handleOpenVisibilitySettings={handleOpenVisibilitySettings}
        />
      )}

      {(showCWInput || showScheduleInput) && (
        <InputsContainer>
          {showCWInput && <ContentWarningInput value={contentWarning} onChange={setContentWarning} onRemove={() => { setShowCWInput(false); setContentWarning(''); }} />}
          {showScheduleInput && <ScheduleInput value={scheduledAt} onChange={setScheduledAt} onRemove={() => { setShowScheduleInput(false); setScheduledAt(''); }} />}
        </InputsContainer>
      )}

      <div className={`compose-editor-area ${isReply ? "tiptap-editor-compact" : ""}`}>
        <TiptapEditor
          className={isReply ? "tiptap-editor-compact" : ""}
          content={content}
          placeholder={isReply ? t('replyPlaceholder') : t('placeholder')}
          emojis={customEmojis || []}
          onUpdate={(html, text) => { setContent(html); setTextContent(text); }}
          onEditorReady={(editor) => { editorRef.current = editor; }}
          mentionSuggestion={createMentionSuggestion()}
          onFilePaste={handleFilePaste}
          maxFiles={4 - media.length}
          ariaLabel={t('publish')}
        />
      </div>

      {isReply ? (
        <>
          {(media.length > 0 || isUploadingMedia) && (
            <CompactMediaPreviewContainer>
              {media.map(m => (
                <CompactMediaPreviewItem key={m.id}>
                  <CompactMediaPreviewImage src={m.preview_url || m.url || ''} alt="" />
                  <CompactMediaPreviewControls className="compact-media-controls">
                    <CompactMediaPreviewButton onClick={() => handleMediaRemove(m.id)} title={tCommon('remove')}>
                      <X size={12} />
                    </CompactMediaPreviewButton>
                  </CompactMediaPreviewControls>
                </CompactMediaPreviewItem>
              ))}
              {isUploadingMedia && <CompactUploadingIndicator><Spinner /></CompactUploadingIndicator>}
            </CompactMediaPreviewContainer>
          )}
          <MediaUpload ref={mediaUploadRef} media={media} onMediaAdd={handleMediaAdd} onMediaRemove={handleMediaRemove} onAltTextChange={handleAltTextChange} isUploading={isUploadingMedia} />
        </>
      ) : (
        <MediaUpload ref={mediaUploadRef} media={media} onMediaAdd={handleMediaAdd} onMediaRemove={handleMediaRemove} onAltTextChange={handleAltTextChange} isUploading={isUploadingMedia} />
      )}

      {poll !== null && <PollComposer poll={poll} onPollChange={setPoll} />}

      <ComposerToolbar
        showEmojiPicker={showEmojiPicker} showCWInput={showCWInput} showScheduleInput={showScheduleInput}
        canAddMedia={poll === null && media.length < 4} canAddPoll={media.length === 0 && poll === null}
        canSchedule={!statusId && !isReply} isReply={isReply} VisibilityIcon={VisibilityIcon}
        visibilityLabel={currentVisibility?.label} charCount={charCount} maxCharCount={MAX_CHAR_COUNT}
        isOverLimit={isOverLimit} canPost={canPost} submitLabel={submitLabel}
        onEmojiToggle={() => setShowEmojiPicker(!showEmojiPicker)} onMediaClick={() => mediaUploadRef.current?.openFileInput()}
        onPollClick={() => setPoll({ options: ['', ''], expiresIn: 86400, multiple: false })}
        onCWToggle={() => setShowCWInput(!showCWInput)} onScheduleToggle={() => setShowScheduleInput(!showScheduleInput)}
        onVisibilityClick={handleOpenVisibilitySettings} onSubmit={handlePost}
        emojiPicker={<EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />}
      />

      {quotedStatus && <QuotePreview><PostCard status={quotedStatus} hideActions /></QuotePreview>}
    </div>
  );
});