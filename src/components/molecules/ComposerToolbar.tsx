'use client';

import styled from '@emotion/styled';
import { type ReactNode, Activity } from 'react';
import { Smile, Image as ImageIcon, BarChart2, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ComposerToolbarProps {
    // Toolbar button states
    showEmojiPicker: boolean;
    showCWInput: boolean;
    showScheduleInput: boolean;
    canAddMedia: boolean;
    canAddPoll: boolean;
    canSchedule: boolean;
    isReply: boolean;
    // Visibility
    VisibilityIcon: LucideIcon;
    visibilityLabel?: string;
    // Character count
    charCount: number;
    maxCharCount: number;
    isOverLimit: boolean;
    // Submit button
    canPost: boolean;
    submitLabel: string;
    // Callbacks
    onEmojiToggle: () => void;
    onMediaClick: () => void;
    onPollClick: () => void;
    onCWToggle: () => void;
    onScheduleToggle: () => void;
    onVisibilityClick?: () => void;
    onSubmit: () => void;
    // Emoji picker slot
    emojiPicker: ReactNode;
}

/**
 * Presentational component for the composer toolbar with action buttons.
 */
export function ComposerToolbar({
    showEmojiPicker,
    showCWInput,
    showScheduleInput,
    canAddMedia,
    canAddPoll,
    canSchedule,
    isReply,
    VisibilityIcon,
    visibilityLabel,
    charCount,
    maxCharCount,
    isOverLimit,
    canPost,
    submitLabel,
    onEmojiToggle,
    onMediaClick,
    onPollClick,
    onCWToggle,
    onScheduleToggle,
    onVisibilityClick,
    onSubmit,
    emojiPicker,
}: ComposerToolbarProps) {
    const remainingChars = maxCharCount - charCount;
    const t = useTranslations('composer');

    return (
        <div className="compose-toolbar-area">
            <div className="compose-toolbar-row">
                <div className="compose-tools">
                    {/* Emoji picker */}
                    <EmojiContainer>
                        <EmojiButton
                            className="compose-tool-btn"
                            type="button"
                            onClick={onEmojiToggle}
                            title={t('addEmoji')}
                            aria-label={t('addEmoji')}
                        >
                            <Smile size={18} />
                        </EmojiButton>
                        <Activity mode={showEmojiPicker ? 'visible' : 'hidden'}>
                            {emojiPicker}
                        </Activity>
                    </EmojiContainer>

                    {/* Media Button */}
                    <button
                        className="compose-tool-btn"
                        type="button"
                        onClick={onMediaClick}
                        disabled={!canAddMedia}
                        title={t('addMedia')}
                        aria-label={t('addMedia')}
                    >
                        <ImageIcon size={18} />
                    </button>

                    {/* Poll Button */}
                    <button
                        className="compose-tool-btn"
                        type="button"
                        onClick={onPollClick}
                        disabled={!canAddPoll}
                        title={t('addPoll')}
                        aria-label={t('addPoll')}
                    >
                        <BarChart2 size={18} />
                    </button>

                    {/* Content Warning toggle */}
                    <CWButton
                        className="compose-tool-btn"
                        type="button"
                        onClick={onCWToggle}
                        $isActive={showCWInput}
                        title={t('addContentWarning')}
                        aria-label={t('addContentWarning')}
                    >
                        <CWText>CW</CWText>
                    </CWButton>

                    {/* Schedule Button */}
                    <ScheduleButton
                        className="compose-tool-btn"
                        type="button"
                        onClick={onScheduleToggle}
                        $isActive={showScheduleInput}
                        title={t('schedulePost')}
                        aria-label={t('schedulePost')}
                        disabled={!canSchedule}
                    >
                        <Clock size={18} />
                    </ScheduleButton>

                    {/* Visibility Button (Only shown in toolbar if it's a reply) */}
                    {isReply && onVisibilityClick && (
                        <button
                            className="compose-tool-btn"
                            type="button"
                            onClick={onVisibilityClick}
                            title={`Visibility: ${visibilityLabel}`}
                        >
                            <VisibilityIcon size={18} />
                        </button>
                    )}
                </div>

                <ActionRow className="compose-action-row">
                    {/* Character count */}
                    <div
                        className={`compose-char-count ${isOverLimit ? 'danger' : charCount > maxCharCount - 50 ? 'warning' : ''}`}
                        aria-live="polite"
                        aria-label={`${remainingChars} characters remaining`}
                    >
                        {remainingChars}
                    </div>

                    {/* Submit button */}
                    <button
                        className="compose-submit-btn"
                        onClick={onSubmit}
                        disabled={!canPost}
                    >
                        {submitLabel}
                    </button>
                </ActionRow>
            </div>
        </div>
    );
}

const EmojiContainer = styled.div`
  position: relative;
`;

const EmojiButton = styled.button`
  anchor-name: --emoji-anchor;
`;

const CWButton = styled.button<{ $isActive: boolean }>`
  color: ${({ $isActive }) => ($isActive ? 'var(--blue-6)' : 'inherit')};
  font-weight: ${({ $isActive }) => ($isActive ? 'bold' : 'normal')};
`;

const CWText = styled.span`
  font-size: 0.9375rem;
`;

const ScheduleButton = styled.button<{ $isActive: boolean }>`
  color: ${({ $isActive }) => ($isActive ? 'var(--blue-6)' : 'inherit')};
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-3);
`;