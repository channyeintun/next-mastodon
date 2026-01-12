'use client';

import Link from 'next/link';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, EmojiText } from '@/components/atoms';
import { useRelationships, useCurrentAccount, prefillAccountCache } from '@/api';
import { useTranslations } from 'next-intl';
import type { Account, Relationship } from '@/types';
import { AccountCardActions } from './AccountCardActions';
import {
    AvatarSkeleton,
    NameSkeleton,
    HandleSkeleton,
    ButtonSkeleton
} from './AccountCardStyles';

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
    const t = useTranslations('account');

    const isOwnProfile = currentAccount?.id === account.id;

    const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Pre-populate account cache before navigation to avoid refetch
        prefillAccountCache(queryClient, account);
        if (onClick) {
            e.preventDefault();
            onClick(account);
        }
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
                <div className="account-card-handle text-truncate">
                    @{account.acct}
                    {relationship && (relationship.followed_by || (relationship.following && relationship.followed_by)) && (
                        <>
                            {' '}
                            &middot;{' '}
                            <span style={{ color: 'var(--text-3)', fontSize: '0.85em' }}>
                                {relationship.following && relationship.followed_by ? (
                                    t('mutual')
                                ) : (
                                    t('follows_you')
                                )}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div className="account-card-actions">
                <AccountCardActions
                    account={account}
                    relationship={relationship}
                    showFollowButton={showFollowButton}
                    showFollowRequestActions={showFollowRequestActions}
                    showUnblockButton={showUnblockButton}
                    showUnmuteButton={showUnmuteButton}
                    showRemoveFromFollowers={showRemoveFromFollowers}
                    isOwnProfile={isOwnProfile}
                />
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