'use client';

import { formatJoinDate } from '@/utils/date';
import { Calendar, ExternalLink, Lock } from 'lucide-react';
import { ProfileStats, ProfileBio, ProfileFields, ProfileActionButtons, HandleExplainer } from '@/components/molecules';
import { Avatar, Button, EmojiText } from '@/components/atoms';
import type { Account, Relationship } from '@/types';
import {
    HeaderImage,
    ProfileSection,
    ProfileDetails,
    AvatarSection,
    NameSection,
    DisplayName,
    BotBadge,
    LockIcon,
    MetaSection,
    MetaItem,
    MetaLink,
    LimitedAccountWarning,
    LimitedAccountMessage,
} from './styles';

interface ProfileHeaderProps {
    account: Account;
    relationship?: Relationship;
    isOwnProfile: boolean;
    isFollowing: boolean;
    isFollowLoading: boolean;
    isMutePending: boolean;
    isBlockPending: boolean;
    onFollowToggle: () => void;
    onBlockToggle: () => void;
    onMuteToggle: () => void;
}

export function ProfileHeader({
    account,
    relationship,
    isOwnProfile,
    isFollowing,
    isFollowLoading,
    isMutePending,
    isBlockPending,
    onFollowToggle,
    onBlockToggle,
    onMuteToggle,
}: ProfileHeaderProps) {
    return (
        <ProfileSection>
            <HeaderImage $url={account.header} />
            <ProfileDetails>
                <AvatarSection>
                    <Avatar
                        src={account.avatar}
                        alt={account.display_name || account.username}
                        size="xlarge"
                        style={{ border: '4px solid var(--surface-1)' }}
                    />
                    <ProfileActionButtons
                        isOwnProfile={isOwnProfile}
                        isFollowing={isFollowing}
                        isRequested={relationship?.requested}
                        isBlocking={relationship?.blocking || false}
                        isMuting={relationship?.muting || false}
                        isLoading={isFollowLoading}
                        isMutePending={isMutePending}
                        isBlockPending={isBlockPending}
                        acct={account.acct}
                        onFollowToggle={onFollowToggle}
                        onBlockToggle={onBlockToggle}
                        onMuteToggle={onMuteToggle}
                    />
                </AvatarSection>
                <NameSection>
                    <DisplayName>
                        <EmojiText text={account.display_name || account.username} emojis={account.emojis} />
                        {account.bot && <BotBadge>BOT</BotBadge>}
                        {account.locked && <LockIcon><Lock size={14} /></LockIcon>}
                    </DisplayName>
                    <HandleExplainer username={account.username} server={new URL(account.url).hostname} />
                </NameSection>
                <ProfileBio note={account.note} />
                <ProfileStats acct={account.acct} postsCount={account.statuses_count} followingCount={account.following_count} followersCount={account.followers_count} />
                <MetaSection>
                    {account.created_at && (
                        <MetaItem>
                            <Calendar size={14} />
                            Joined {formatJoinDate(account.created_at)}
                        </MetaItem>
                    )}
                    <MetaLink href={account.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={14} />
                        View on instance
                    </MetaLink>
                </MetaSection>
                <ProfileFields fields={account.fields} />
            </ProfileDetails>
        </ProfileSection>
    );
}

interface LimitedProfileHeaderProps {
    account: Account;
    relationship?: Relationship;
    isOwnProfile: boolean;
    isFollowing: boolean;
    isFollowLoading: boolean;
    isMutePending: boolean;
    isBlockPending: boolean;
    onFollowToggle: () => void;
    onBlockToggle: () => void;
    onMuteToggle: () => void;
    onShowProfile: () => void;
    domain: string;
}

export function LimitedProfileHeader({
    account,
    relationship,
    isOwnProfile,
    isFollowing,
    isFollowLoading,
    isMutePending,
    isBlockPending,
    onFollowToggle,
    onBlockToggle,
    onMuteToggle,
    onShowProfile,
    domain,
}: LimitedProfileHeaderProps) {
    return (
        <>
            <ProfileSection>
                <HeaderImage $url={account.header} style={{ filter: 'blur(8px)', opacity: 0.5 }} />
                <ProfileDetails>
                    <AvatarSection>
                        <Avatar
                            src={account.avatar}
                            alt={account.display_name || account.username}
                            size="xlarge"
                            style={{ border: '4px solid var(--surface-1)', filter: 'blur(4px)', opacity: 0.5 }}
                        />
                        <ProfileActionButtons
                            isOwnProfile={isOwnProfile}
                            isFollowing={isFollowing}
                            isRequested={relationship?.requested}
                            isBlocking={relationship?.blocking || false}
                            isMuting={relationship?.muting || false}
                            isLoading={isFollowLoading}
                            isMutePending={isMutePending}
                            isBlockPending={isBlockPending}
                            acct={account.acct}
                            onFollowToggle={onFollowToggle}
                            onBlockToggle={onBlockToggle}
                            onMuteToggle={onMuteToggle}
                        />
                    </AvatarSection>
                </ProfileDetails>
            </ProfileSection>
            <LimitedAccountWarning>
                <LimitedAccountMessage>
                    This profile has been hidden by the moderators of {domain}.
                </LimitedAccountMessage>
                <Button variant="secondary" onClick={onShowProfile}>
                    Show profile anyway
                </Button>
            </LimitedAccountWarning>
        </>
    );
}
