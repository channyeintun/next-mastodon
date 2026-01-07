'use client';

import styled from '@emotion/styled';
import Link from 'next/link';
import { Check, X, Ban, VolumeX, MoreHorizontal } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, Button, EmojiText } from '@/components/atoms';
import { useFollowAccount, useUnfollowAccount, useAcceptFollowRequest, useRejectFollowRequest, useUnblockAccount, useUnmuteAccount, useRemoveFromFollowers, useRelationships, useCurrentAccount, prefillAccountCache } from '@/api';
import type { Account, Relationship } from '@/types';

interface AccountCardProps {
    account: Account;
    relationship?: Relationship;
    showFollowButton?: boolean;
    showFollowRequestActions?: boolean;
    showUnblockButton?: boolean;
    showUnmuteButton?: boolean;
    showRemoveFromFollowers?: boolean;
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
    showRemoveFromFollowers = false,
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
    const queryClient = useQueryClient();

    const followMutation = useFollowAccount();
    const unfollowMutation = useUnfollowAccount();
    const acceptMutation = useAcceptFollowRequest();
    const rejectMutation = useRejectFollowRequest();
    const unblockMutation = useUnblockAccount();
    const unmuteMutation = useUnmuteAccount();
    const removeFollowerMutation = useRemoveFromFollowers();

    const [showMenu, setShowMenu] = React.useState(false);
    const [menuStyle, setMenuStyle] = React.useState<React.CSSProperties>({});
    const menuRef = React.useRef<HTMLDivElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

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
            followMutation.mutate({ id: account.id });
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

    const handleRemoveFollower = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        removeFollowerMutation.mutate(account.id);
        setShowMenu(false);
    };

    const handleMenuToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!showMenu && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuStyle({
                position: 'fixed',
                top: `${rect.bottom + 4}px`,
                right: `${window.innerWidth - rect.right}px`,
                zIndex: 9999,
            });
        }
        setShowMenu(!showMenu);
    };

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', () => setShowMenu(false), { once: true });
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Pre-populate account cache before navigation to avoid refetch
        prefillAccountCache(queryClient, account);
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
                <div style={{ display: 'flex', gap: 'var(--size-2)', alignItems: 'center' }}>
                    <Button
                        variant={isFollowing || relationship?.requested ? 'secondary' : 'primary'}
                        size="small"
                        onClick={handleFollowToggle}
                        disabled={isLoading}
                        isLoading={isLoading}
                    >
                        {getButtonText()}
                    </Button>

                    {showRemoveFromFollowers && (
                        <>
                            <div ref={buttonRef as any}>
                                <StyledIconButton
                                    size="small"
                                    variant="secondary"
                                    onClick={handleMenuToggle}
                                >
                                    <MoreHorizontal size={16} />
                                </StyledIconButton>
                            </div>

                            {showMenu && typeof document !== 'undefined' && createPortal(
                                <Menu ref={menuRef} style={menuStyle}>
                                    <MenuItem
                                        onClick={handleRemoveFollower}
                                        disabled={removeFollowerMutation.isPending}
                                        $isDestructive
                                    >
                                        <X size={14} />
                                        Remove from followers
                                    </MenuItem>
                                </Menu>,
                                document.body
                            )}
                        </>
                    )}
                </div>
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
                <div className="account-card-name text-truncate">
                    <EmojiText
                        text={account.display_name || account.username}
                        emojis={account.emojis}
                    />
                    {account.bot && (
                        <span className="account-card-badge">BOT</span>
                    )}
                </div>
                <div className="account-card-handle text-truncate">@{account.acct}</div>
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
const StyledIconButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-round);
`;

const Menu = styled.div`
  position: absolute;
  background: var(--surface-2);
  border-radius: var(--radius-2);
  box-shadow: var(--shadow-3);
  overflow: hidden;
  min-width: 180px;
  border: 1px solid var(--surface-3);
`;

const MenuItem = styled.button<{ $isDestructive?: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  width: 100%;
  padding: var(--size-2) var(--size-3);
  background: transparent;
  border: none;
  color: ${({ $isDestructive }) => ($isDestructive ? 'var(--red-6)' : 'var(--text-1)')};
  cursor: pointer;
  font-size: inherit;
  text-align: left;
  transition: color 0.2s ease;
  white-space: nowrap;
  box-shadow: none;

  &:hover {
    outline: 1px solid var(--surface-4);
    outline-offset: -1px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

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