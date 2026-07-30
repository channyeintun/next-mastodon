'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Smile, Image as ImageIcon, SendHorizontal, X } from 'lucide-react';
import { useCreateStatus } from '@/api/mutations';
import { useCurrentAccount } from '@/api/queries';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useAuthStore } from '@/hooks/useStores';
import { Avatar } from '@/components/atoms';
import type { Status } from '@/types';
import {
  Row,
  CollapsedPill,
  CollapsedTools,
  Field,
  TextArea,
  PickerLayer,
  HiddenFileInput,
  Thumbs,
  Thumb,
  RemoveThumb,
  Toolbar,
  Tools,
  ToolButton,
  SendButton,
} from './InlineReplyBoxStyles';

// Loaded on demand: emoji-mart plus the custom-emoji data is far too heavy to
// pull into every post card that merely shows a collapsed pill.
const EmojiPicker = dynamic(
  () => import('@/components/organisms/EmojiPicker').then((m) => m.EmojiPicker),
  { ssr: false }
);

interface InlineReplyBoxProps {
  status: Status;
}

/**
 * Facebook's in-card comment box.
 *
 * Collapsed, this renders no input at all — just a button styled as the pill.
 * That matters because post lists here are virtualized: a real editor per card
 * would mount and tear down dozens of times while scrolling. The textarea only
 * appears once the user actually reaches for it, which is also how Facebook's
 * own collapsed box behaves.
 *
 * Expanding changes the card's height. TanStack Virtual re-measures rendered
 * elements via measureElement, so the list absorbs it; only the pre-computed
 * estimate in lib/pretext.ts is briefly stale, and only for the one card.
 */
export function InlineReplyBox({ status }: InlineReplyBoxProps) {
  const t = useTranslations('composer');
  const authStore = useAuthStore();
  const { data: me } = useCurrentAccount();
  const createStatus = useCreateStatus();
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number } | null>(null);
  // Caret to restore after an emoji insert, applied once React has committed
  const pendingCaret = useRef<number | null>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { media, handleMediaAdd, handleMediaRemove, clearMedia, isUploading } = useMediaUpload();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Signed-out visitors cannot reply, so the box would be a dead control.
  if (!authStore.isAuthenticated) return null;

  /**
   * Focus once the textarea has actually mounted.
   *
   * A requestAnimationFrame after setState is not enough: React may not have
   * committed the DOM by the next frame, so the ref is still null and focus is
   * silently dropped. Keystrokes then land on document, where the global
   * shortcut handler reads them as sequences — typing a reply containing "g"
   * then "s" navigated to search. An effect keyed on `expanded` runs after
   * commit, so the node always exists.
   */
  useEffect(() => {
    if (expanded) textareaRef.current?.focus();
  }, [expanded]);

  const expand = () => setExpanded(true);

  /**
   * Only collapse when focus actually leaves the box.
   *
   * Blurring on any focus change collapsed it whenever a tool button was
   * clicked, which read as the buttons "toggling the two modes" instead of
   * doing their job.
   */
  const handleBlur = (e: React.FocusEvent) => {
    const next = e.relatedTarget as Node | null;
    if (next && rootRef.current?.contains(next)) return;
    if (!text.trim() && !showEmoji) setExpanded(false);
  };

  /**
   * Position the picker from the button's viewport rect and portal it to body.
   *
   * It cannot live inside the card: virtualized rows are positioned with
   * `transform`, which creates a stacking context, so an in-flow picker is
   * painted underneath the following row no matter its z-index. Flips above the
   * button when there is not enough room below.
   */
  useLayoutEffect(() => {
    if (!showEmoji) { setPickerPos(null); return; }
    const r = emojiButtonRef.current?.getBoundingClientRect();
    if (!r) return;
    const H = 435;
    const below = window.innerHeight - r.bottom;
    setPickerPos({
      top: below > H ? r.bottom + 4 : Math.max(8, r.top - H - 4),
      left: Math.min(r.left, window.innerWidth - 360),
    });
  }, [showEmoji]);

  // Close on outside click or scroll, like any popover
  useEffect(() => {
    if (!showEmoji) return;
    const close = (e: Event) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if ((t as HTMLElement)?.closest?.('[data-emoji-popover]')) return;
      setShowEmoji(false);
    };
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', () => setShowEmoji(false), { once: true, capture: true });
    return () => document.removeEventListener('mousedown', close);
  }, [showEmoji]);

  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    const at = el?.selectionStart ?? text.length;
    setText(text.slice(0, at) + emoji + text.slice(el?.selectionEnd ?? at));
    setShowEmoji(false);
    // Same reason focus is deferred on expand: a frame callback can run before
    // React commits the new value, so setSelectionRange would target stale text.
    pendingCaret.current = at + emoji.length;
  };

  useEffect(() => {
    const pos = pendingCaret.current;
    if (pos == null) return;
    pendingCaret.current = null;
    const el = textareaRef.current;
    el?.focus();
    el?.setSelectionRange(pos, pos);
  }, [text]);

  /**
   * Uploads straight from the file picker.
   *
   * Deliberately not useMediaUpload's own handleFileChange: that routes images
   * through the cropper, which is right for a profile picture but wrong for a
   * comment attachment — and opening a modal from a button labelled "add media"
   * is not what the control promises.
   */
  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 4 - media.length);
    for (const file of files) await handleMediaAdd(file);
    e.target.value = '';
  };

  const submit = () => {
    const body = text.trim();
    // Mastodon accepts a media-only status, so text alone is not required
    if ((!body && media.length === 0) || createStatus.isPending || isUploading) return;
    createStatus.mutate(
      {
        status: body,
        media_ids: media.length ? media.map((m) => m.id) : undefined,
        in_reply_to_id: status.id,
        // Replies inherit the parent's audience so a private thread stays private
        visibility: status.visibility,
      },
      {
        onSuccess: () => {
          setText('');
          clearMedia();
          setExpanded(false);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter makes a newline — matching Facebook
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
    if (e.key === 'Escape') setExpanded(false);
  };

  const canSend = (!!text.trim() || media.length > 0) && !createStatus.isPending && !isUploading;

  return (
    <Row ref={rootRef} onClick={(e) => e.stopPropagation()}>
      <Avatar src={me?.avatar} alt={me?.display_name || ''} size="small" />

      {expanded ? (
        <Field>
          <TextArea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={t('replyPlaceholder')}
            rows={1}
            disabled={createStatus.isPending}
          />
          {media.length > 0 && (
            <Thumbs>
              {media.map((m) => (
                <Thumb key={m.id}>
                  <img src={m.preview_url ?? m.url ?? undefined} alt={m.description ?? ''} />
                  <RemoveThumb
                    type="button"
                    aria-label={t('removeMedia')}
                    onClick={() => handleMediaRemove(m.id)}
                  >
                    <X size={14} />
                  </RemoveThumb>
                </Thumb>
              ))}
            </Thumbs>
          )}

          {/* Focused layout: tools drop below the text and a send button appears */}
          <Toolbar>
            <Tools>
              <ToolButton
                type="button"
                aria-label={t('emoji')}
                ref={emojiButtonRef}
                aria-expanded={showEmoji}
                onClick={() => setShowEmoji((v) => !v)}
              >
                <Smile size={18} />
              </ToolButton>
              <ToolButton
                type="button"
                aria-label={t('media')}
                onClick={() => fileRef.current?.click()}
                disabled={media.length >= 4 || isUploading}
              >
                <ImageIcon size={18} />
              </ToolButton>
              <HiddenFileInput
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFiles}
                tabIndex={-1}
                aria-hidden="true"
              />
            </Tools>
            <SendButton
              type="button"
              onClick={submit}
              disabled={!canSend}
              aria-label={t('reply')}
              $active={canSend}
            >
              <SendHorizontal size={18} />
            </SendButton>
          </Toolbar>
          {showEmoji && pickerPos && createPortal(
            <PickerLayer data-emoji-popover style={{ top: pickerPos.top, left: pickerPos.left }}>
              <EmojiPicker onEmojiSelect={insertEmoji} onClose={() => setShowEmoji(false)} />
            </PickerLayer>,
            document.body
          )}
        </Field>
      ) : (
        <CollapsedPill type="button" onClick={expand}>
          <span>{t('replyPlaceholder')}</span>
          <CollapsedTools aria-hidden="true">
            <Smile size={18} />
            <ImageIcon size={18} />
          </CollapsedTools>
        </CollapsedPill>
      )}
    </Row>
  );
}
