'use client';

import styled from '@emotion/styled';
import Link from 'next/link';
import { Check, X, Ban, VolumeX } from 'lucide-react';
import { Avatar, Button, EmojiText } from '@/components/atoms';
import { useFollowAccount, useUnfollowAccount, useAcceptFollowRequest, useRejectFollowRequest, useUnblockAccount, useUnmuteAccount, useRelationships, useCurrentAccount } from '@/api';
import { useAccountStore } from '@/hooks/useStores';
import type { Account, Relationship } from '@/types';

interface AccountCardProps {
    account: Account;
    relationship?: Relationship;
    showFollowButton?: boolean;
    showFollowRequestActions?: boolean;
    showUnblockButton?: boolean;
    showUnmuteButton?: boolean;
    /** When true, skip fetching relationship (parent is handling batch fetching) */
    skipRelationshipFetch?: boolean;
    /** When provided, prevents navigation and calls this handler instead */
    onClick?: (account: Account) => void;
    style?: React.CSSProperties;
}

export function AccountCard({
    account,
    relationship: relationshipProp,
    showFollowButton = true,
    showFollowRequestActions = false,
    showUnblockButton = false,
    showUnmuteButton = false,
    skipRelationshipFetch = false,
    onClick,
    style,
}: AccountCardProps) {
    const { data: currentAccount } = useCurrentAccount();
    // Only fetch relationship if not provided as prop and not skipping (allows batching in parent)
    const shouldFetch = !relationshipProp && !skipRelationshipFetch;
    const { data: relationships } = useRelationships(
        shouldFetch ? [account.id] : []
    );
    const relationship = relationshipProp ?? relationships?.[0];
    const accountStore = useAccountStore();

    const followMutation = useFollowAccount();
    const unfollowMutation = useUnfollowAccount();
    const acceptMutation = useAcceptFollowRequest();
    const rejectMutation = useRejectFollowRequest();
    const unblockMutation = useUnblockAccount();
    const unmuteMutation = useUnmuteAccount();

    const isOwnProfile = currentAccount?.id === account.id;
    const isFollowing = relationship?.following || false;
    const isLoading = followMutation.isPending || unfollowMutation.isPending;
    const isRequestLoading = acceptMutation.isPending || rejectMutation.isPending;
    const isUnblockLoading = unblockMutation.isPending;
    const isUnmuteLoading = unmuteMutation.isPending;

    const handleFollowToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isFollowing || relationship?.requested) {
            unfollowMutation.mutate(account.id);
        } else {
            followMutation.mutate(account.id);
        }
    };

    const handleAccept = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        acceptMutation.mutate(account.id);
    };

    const handleReject = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        rejectMutation.mutate(account.id);
    };

    const handleUnblock = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        unblockMutation.mutate(account.id);
    };

    const handleUnmute = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        unmuteMutation.mutate(account.id);
    };

    const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Cache account data for faster loading on profile page
        accountStore.cacheAccount(account);
        if (onClick) {
            e.preventDefault();
            onClick(account);
        }
    };

    const renderActions = () => {
        if (showUnblockButton) {
            return (
                <IconButton
                    variant="secondary"
                    size="small"
                    onClick={handleUnblock}
                    disabled={isUnblockLoading}
                    isLoading={isUnblockLoading}
                >
                    <Ban size={16} />
                    Unblock
                </IconButton>
            );
        }

        if (showUnmuteButton) {
            return (
                <IconButton
                    variant="secondary"
                    size="small"
                    onClick={handleUnmute}
                    disabled={isUnmuteLoading}
                    isLoading={isUnmuteLoading}
                >
                    <VolumeX size={16} />
                    Unmute
                </IconButton>
            );
        }

        if (showFollowRequestActions) {
            return (
                <>
                    <IconButton
                        variant="primary"
                        size="small"
                        onClick={handleAccept}
                        disabled={isRequestLoading}
                        isLoading={acceptMutation.isPending}
                    >
                        <Check size={16} />
                        Accept
                    </IconButton>
                    <IconButton
                        variant="ghost"
                        size="small"
                        onClick={handleReject}
                        disabled={isRequestLoading}
                        isLoading={rejectMutation.isPending}
                    >
                        <X size={16} />
                        Reject
                    </IconButton>
                </>
            );
        }

        if (showFollowButton && !isOwnProfile) {
            // For limited accounts that are not followed, show "Request to follow"
            const isLimited = account.limited === true;
            const getButtonText = () => {
                if (relationship?.requested) return 'Requested';
                if (isFollowing) return 'Following';
                if (isLimited) return 'Request to follow';
                return 'Follow';
            };

            return (
                <Button
                    variant={isFollowing || relationship?.requested ? 'secondary' : 'primary'}
                    size="small"
                    onClick={handleFollowToggle}
                    disabled={isLoading}
                    isLoading={isLoading}
                >
                    {getButtonText()}
                </Button>
            );
        }

        return null;
    };

    return (
        <Link
            href={`/@${account.acct}`}
            className="account-card"
            onClick={handleCardClick}
            style={style}
        >
            <Avatar
                src={account.avatar}
                alt={account.display_name || account.username}
                size="medium"
            />

            <div className="account-card-info">
                <div className="account-card-name">
                    <EmojiText
                        text={account.display_name || account.username}
                        emojis={account.emojis}
                    />
                    {account.bot && (
                        <span className="account-card-badge">BOT</span>
                    )}
                </div>
                <div className="account-card-handle">@{account.acct}</div>
            </div>

            <div className="account-card-actions">
                {renderActions()}
            </div>
        </Link>
    );
}

export function AccountCardSkeleton({ style }: { style?: React.CSSProperties }) {
    return (
        <div className="account-card" style={style}>
            <AvatarSkeleton className="skeleton" />
            <div className="account-card-info">
                <NameSkeleton className="skeleton" />
                <HandleSkeleton className="skeleton" />
            </div>
            <div className="account-card-actions">
                <ButtonSkeleton className="skeleton" />
            </div>
        </div>
    );
}

// Styled components
const IconButton = styled(Button)`
    display: flex;
    align-items: center;
    gap: var(--size-1);
`;

const AvatarSkeleton = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    flex-shrink: 0;
`;

const NameSkeleton = styled.div`
    width: 120px;
    height: 16px;
    margin-bottom: 4px;
`;

const HandleSkeleton = styled.div`
    width: 80px;
    height: 14px;
`;

const ButtonSkeleton = styled.div`
    width: 72px;
    height: 32px;
    border-radius: var(--radius-2);
`;