'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { Check, X, Ban, VolumeX, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/atoms';
import {
    useFollowAccount,
    useUnfollowAccount,
    useAcceptFollowRequest,
    useRejectFollowRequest,
    useUnblockAccount,
    useUnmuteAccount,
    useRemoveFromFollowers
} from '@/api';
import type { Account, Relationship } from '@/types';
import {
    StyledIconButton,
    Menu,
    MenuItem,
    IconButton
} from './AccountCardStyles';

interface AccountCardActionsProps {
    account: Account;
    relationship?: Relationship;
    showFollowButton?: boolean;
    showFollowRequestActions?: boolean;
    showUnblockButton?: boolean;
    showUnmuteButton?: boolean;
    showRemoveFromFollowers?: boolean;
    isOwnProfile: boolean;
}

export function AccountCardActions({
    account,
    relationship,
    showFollowButton,
    showFollowRequestActions,
    showUnblockButton,
    showUnmuteButton,
    showRemoveFromFollowers,
    isOwnProfile,
}: AccountCardActionsProps) {
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
}
