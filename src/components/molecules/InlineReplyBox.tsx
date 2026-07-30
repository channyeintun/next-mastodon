'use client';

import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useTranslations } from 'next-intl';
import { Smile, Image as ImageIcon, SendHorizontal } from 'lucide-react';
import { useCreateStatus } from '@/api/mutations';
import { useCurrentAccount } from '@/api/queries';
import { useAuthStore } from '@/hooks/useStores';
import { Avatar } from '@/components/atoms';
import type { Status } from '@/types';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const collapseIfEmpty = () => {
    if (!text.trim()) setExpanded(false);
  };

  const submit = () => {
    const body = text.trim();
    if (!body || createStatus.isPending) return;
    createStatus.mutate(
      {
        status: body,
        in_reply_to_id: status.id,
        // Replies inherit the parent's audience so a private thread stays private
        visibility: status.visibility,
      },
      {
        onSuccess: () => {
          setText('');
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
    if (e.key === 'Escape') collapseIfEmpty();
  };

  const canSend = !!text.trim() && !createStatus.isPending;

  return (
    <Row onClick={(e) => e.stopPropagation()}>
      <Avatar src={me?.avatar} alt={me?.display_name || ''} size="small" />

      {expanded ? (
        <Field>
          <TextArea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={collapseIfEmpty}
            placeholder={t('replyPlaceholder')}
            rows={1}
            disabled={createStatus.isPending}
          />
          {/* Focused layout: tools drop below the text and a send button appears */}
          <Toolbar>
            <Tools>
              <ToolButton type="button" aria-label={t('emoji')}>
                <Smile size={18} />
              </ToolButton>
              <ToolButton type="button" aria-label={t('media')}>
                <ImageIcon size={18} />
              </ToolButton>
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

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--size-2);
  padding-top: var(--size-2);
`;

const CollapsedPill = styled.button`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--size-2);
  height: 36px;
  padding: 0 var(--size-3);
  border: none;
  box-shadow: none;
  border-radius: var(--radius-round);
  background: var(--comment-bg);
  color: var(--secondary-text);
  font-size: var(--fs-body);
  text-align: start;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: var(--hover-overlay);
  }

  &:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
`;

const CollapsedTools = styled.span`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  color: var(--secondary-icon);
  flex-shrink: 0;
`;

const Field = styled.div`
  flex: 1;
  min-width: 0;
  background: var(--comment-bg);
  border-radius: var(--radius-3);
  padding: var(--size-2) var(--size-3);
`;

const TextArea = styled.textarea`
  width: 100%;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  color: var(--text-1);
  font-family: inherit;
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  /* Grows with content instead of scrolling in a one-line box */
  field-sizing: content;
  max-height: 40vh;

  &::placeholder {
    color: var(--secondary-text);
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--size-1);
`;

const Tools = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-1);
`;

const ToolButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  box-shadow: none;
  border-radius: var(--radius-round);
  background: transparent;
  color: var(--secondary-icon);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: var(--hover-overlay);
    color: var(--primary-icon);
  }

  &:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
`;

const SendButton = styled(ToolButton) <{ $active: boolean }>`
  color: ${({ $active }) => ($active ? 'var(--accent)' : 'var(--secondary-icon)')};
  opacity: ${({ $active }) => ($active ? 1 : 0.5)};
  cursor: ${({ $active }) => ($active ? 'pointer' : 'not-allowed')};
`;
