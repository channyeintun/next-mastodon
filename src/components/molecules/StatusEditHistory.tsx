'use client';

import styled from '@emotion/styled';
import { useState } from 'react';
import { History, ChevronDown, ChevronUp } from 'lucide-react';
import { useStatusHistory } from '@/api';
import { StatusContent } from '@/components/molecules';
import type { StatusEdit } from '@/types';

// Styled components
const SkeletonContainer = styled.div`
    display: flex;
    align-items: center;
    gap: var(--size-2);
`;

const IconSkeleton = styled.div`
    width: 14px;
    height: 14px;
    border-radius: 50%;
`;

const TextSkeleton = styled.div`
    width: 100px;
    height: 14px;
    border-radius: var(--radius-2);
`;

interface StatusEditHistoryProps {
    statusId: string;
    editedAt: string;
}

function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function StatusEditHistory({ statusId, editedAt }: StatusEditHistoryProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { data: history, isLoading, error } = useStatusHistory(statusId);

    // Show skeleton while loading to prevent flickering
    if (isLoading) {
        return (
            <SkeletonContainer className="edit-history-skeleton">
                <IconSkeleton className="skeleton" />
                <TextSkeleton className="skeleton" />
            </SkeletonContainer>
        );
    }

    // Only show if there's edit history (more than 1 version)
    if (!history || history.length <= 1) {
        // Still show "Edited" indicator if editedAt is set
        if (editedAt) {
            return (
                <div className="edit-history-indicator">
                    <History size={12} />
                    <span>Edited {formatDateTime(editedAt)}</span>
                </div>
            );
        }
        return null;
    }

    const toggleExpanded = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="edit-history">
            <button
                className="edit-history-toggle"
                onClick={toggleExpanded}
                disabled={isLoading}
            >
                <History size={14} />
                <span>
                    Edited {history.length - 1} {history.length - 1 === 1 ? 'time' : 'times'}
                </span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {isExpanded && (
                <div className="edit-history-list">
                    {error && (
                        <div className="edit-history-error">
                            Failed to load edit history
                        </div>
                    )}
                    {history.map((edit: StatusEdit, index: number) => (
                        <div key={index} className="edit-history-item">
                            <div className="edit-history-item-header">
                                <span className="edit-history-version">
                                    {index === 0 ? 'Original' : `Revision ${index}`}
                                </span>
                                <span className="edit-history-date">
                                    {formatDateTime(edit.created_at)}
                                </span>
                            </div>
                            <div className="edit-history-content">
                                <StatusContent
                                    html={edit.content}
                                    emojis={edit.emojis}
                                />
                                {edit.spoiler_text && (
                                    <div className="edit-history-spoiler">
                                        CW: {edit.spoiler_text}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
