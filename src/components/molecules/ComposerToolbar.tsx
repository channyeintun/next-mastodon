'use client';

import styled from '@emotion/styled';
import { type ReactNode, Activity } from 'react';
import { Smile, Image as ImageIcon, BarChart2, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
                            title="Add emoji"
                            aria-label="Add emoji"
                        >
                            <Smile size={22} />
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
                        title="Add media"
                        aria-label="Add media"
                    >
                        <ImageIcon size={22} />
                    </button>

                    {/* Poll Button */}
                    <button
                        className="compose-tool-btn"
                        type="button"
                        onClick={onPollClick}
                        disabled={!canAddPoll}
                        title="Add poll"
                        aria-label="Add poll"
                    >
                        <BarChart2 size={22} />
                    </button>

                    {/* Content Warning toggle */}
                    <CWButton
                        className="compose-tool-btn"
                        type="button"
                        onClick={onCWToggle}
                        $isActive={showCWInput}
                        title="Add content warning"
                        aria-label="Add content warning"
                    >
                        <CWText>CW</CWText>
                    </CWButton>

                    {/* Schedule Button */}
                    <ScheduleButton
                        className="compose-tool-btn"
                        type="button"
                        onClick={onScheduleToggle}
                        $isActive={showScheduleInput}
                        title="Schedule post"
                        aria-label="Schedule post"
                        disabled={!canSchedule}
                    >
                        <Clock size={22} />
                    </ScheduleButton>

                    {/* Visibility Button (Only shown in toolbar if it's a reply) */}
                    {isReply && onVisibilityClick && (
                        <button
                            className="compose-tool-btn"
                            type="button"
                            onClick={onVisibilityClick}
                            title={`Visibility: ${visibilityLabel}`}
                        >
                            <VisibilityIcon size={22} />
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
  font-size: 14px;
`;

const ScheduleButton = styled.button<{ $isActive: boolean }>`
  color: ${({ $isActive }) => ($isActive ? 'var(--blue-6)' : 'inherit')};
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-3);
`;