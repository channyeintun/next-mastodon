'use client';

import styled from '@emotion/styled';
import Link from 'next/link';
import { Check, X, MessageCircle } from 'lucide-react';
import { Avatar, Card, EmojiText, Button } from '@/components/atoms';
import { StatusContent } from '@/components/molecules';
import { formatRelativeTime } from '@/utils/date';
import type { NotificationRequest } from '@/types';
import { useAcceptNotificationRequest, useDismissNotificationRequest } from '@/api';

interface NotificationRequestCardProps {
    request: NotificationRequest;
    style?: React.CSSProperties;
}

export function NotificationRequestCard({ request, style }: NotificationRequestCardProps) {
    const acceptMutation = useAcceptNotificationRequest();
    const dismissMutation = useDismissNotificationRequest();

    const account = request.account;
    const displayName = account.display_name || account.username;

    const handleAccept = () => {
        acceptMutation.mutate(request.id);
    };

    const handleDismiss = () => {
        dismissMutation.mutate(request.id);
    };

    const isLoading = acceptMutation.isPending || dismissMutation.isPending;

    return (
        <div style={style}>
            <StyledCard padding="medium">
                <ContentWrapper>
                    {/* Avatar with notification count badge */}
                    <AvatarWrapper>
                        <Link href={`/@${account.acct}`}>
                            <Avatar
                                src={account.avatar}
                                alt={displayName}
                                size="medium"
                            />
                        </Link>
                        {request.notifications_count > 0 && (
                            <CountBadge>
                                {request.notifications_count > 99 ? '99+' : request.notifications_count}
                            </CountBadge>
                        )}
                    </AvatarWrapper>

                    {/* Content */}
                    <ContentColumn>
                        {/* Header with name and time */}
                        <HeaderRow>
                            <InfoWrapper>
                                <Link href={`/@${account.acct}`} className="notification-request-name text-truncate">
                                    <EmojiText text={displayName} emojis={account.emojis} />
                                </Link>
                                <div className="notification-request-username text-truncate">@{account.acct}</div>
                            </InfoWrapper>
                            <TimeText>
                                {formatRelativeTime(request.updated_at)}
                            </TimeText>
                        </HeaderRow>

                        {/* Status preview (if available) */}
                        {request.last_status && (
                            <StatusPreview>
                                <MessageCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                                <PreviewContent>
                                    <StatusContent
                                        html={request.last_status.content}
                                        emojis={request.last_status.emojis}
                                        mentions={request.last_status.mentions}
                                    />
                                </PreviewContent>
                            </StatusPreview>
                        )}

                        {/* Action buttons */}
                        <ActionsRow>
                            <Button
                                variant="primary"
                                size="small"
                                onClick={handleAccept}
                                disabled={isLoading}
                            >
                                <Check size={16} />
                                Accept
                            </Button>
                            <Button
                                variant="ghost"
                                size="small"
                                onClick={handleDismiss}
                                disabled={isLoading}
                            >
                                <X size={16} />
                                Dismiss
                            </Button>
                        </ActionsRow>
                    </ContentColumn>
                </ContentWrapper>
            </StyledCard>
        </div>
    );
}

// Styled components
const StyledCard = styled(Card)``;

const ContentWrapper = styled.div`
    display: flex;
    gap: var(--size-3);
`;

const AvatarWrapper = styled.div`
    position: relative;
    flex-shrink: 0;
`;

const CountBadge = styled.div`
    position: absolute;
    bottom: -2px;
    right: -2px;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    background: var(--blue-6);
    color: white;
    font-size: var(--font-size-00);
    font-weight: var(--font-weight-6);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--surface-2);
`;

const ContentColumn = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--size-2);
`;

const HeaderRow = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--size-2);
`;

const InfoWrapper = styled.div`
    min-width: 0;
`;

/* NameLink and Username moved to globals.css as .notification-request-name and .notification-request-username */

const TimeText = styled.div`
    font-size: var(--font-size-0);
    color: var(--text-3);
    flex-shrink: 0;
`;

const StatusPreview = styled.div`
    display: flex;
    gap: var(--size-2);
    padding: var(--size-2);
    background: var(--surface-2);
    border-radius: var(--radius-2);
    color: var(--text-2);
`;

const PreviewContent = styled.div`
    font-size: var(--font-size-0);
    color: var(--text-2);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
`;

const ActionsRow = styled.div`
    display: flex;
    gap: var(--size-2);
    margin-top: var(--size-1);
`;
