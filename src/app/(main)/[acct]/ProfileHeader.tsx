'use client';

import { formatJoinDate } from '@/utils/date';
import { Calendar, ExternalLink, Lock } from 'lucide-react';
import { ProfileStats, ProfileBio, ProfileFields, ProfileActionButtons, HandleExplainer, FamiliarFollowers } from '@/components/molecules';
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
import { useTranslations } from 'next-intl';

interface ProfileHeaderProps {
    account: Account;
    relationship?: Relationship;
    isOwnProfile: boolean;
    isFollowing: boolean;
    isFollowLoading: boolean;
    isMutePending: boolean;
    isBlockPending: boolean;
    isNotifyPending?: boolean;
    onFollowToggle: () => void;
    onBlockToggle: () => void;
    onMuteToggle: () => void;
    onNotifyToggle?: () => void;
}

export function ProfileHeader({
    account,
    relationship,
    isOwnProfile,
    isFollowing,
    isFollowLoading,
    isMutePending,
    isBlockPending,
    isNotifyPending,
    onFollowToggle,
    onBlockToggle,
    onMuteToggle,
    onNotifyToggle,
}: ProfileHeaderProps) {
    const t = useTranslations('account');
    return (
        <ProfileSection itemScope itemType="https://schema.org/Person">
            <HeaderImage $url={account.header} />
            <ProfileDetails>
                <AvatarSection>
                    <Avatar
                        src={account.avatar}
                        alt={account.display_name || account.username}
                        size="xlarge"
                        style={{ border: '4px solid var(--surface-1)' }}
                    />
                    <meta itemProp="image" content={account.avatar} />
                    <ProfileActionButtons
                        isOwnProfile={isOwnProfile}
                        isFollowing={isFollowing}
                        isRequested={relationship?.requested}
                        isBlocking={relationship?.blocking || false}
                        isMuting={relationship?.muting || false}
                        isNotifying={relationship?.notifying}
                        isLoading={isFollowLoading}
                        isMutePending={isMutePending}
                        isBlockPending={isBlockPending}
                        isNotifyPending={isNotifyPending}
                        acct={account.acct}
                        onFollowToggle={onFollowToggle}
                        onBlockToggle={onBlockToggle}
                        onMuteToggle={onMuteToggle}
                        onNotifyToggle={onNotifyToggle}
                    />
                </AvatarSection>
                <NameSection>
                    <DisplayName itemProp="name">
                        <EmojiText text={account.display_name || account.username} emojis={account.emojis} />
                        {account.bot && <BotBadge>{t('bot')}</BotBadge>}
                        {account.locked && <LockIcon><Lock size={14} /></LockIcon>}
                    </DisplayName>
                    <HandleExplainer username={account.username} server={new URL(account.url).hostname} />
                    <FamiliarFollowers accountId={account.id} isOwnProfile={isOwnProfile} />
                    <link itemProp="url" href={account.url} />
                </NameSection>
                <ProfileBio note={account.note} emojis={account.emojis} />
                <ProfileStats acct={account.acct} postsCount={account.statuses_count} followingCount={account.following_count} followersCount={account.followers_count} />
                <MetaSection>
                    {account.created_at && (
                        <MetaItem>
                            <Calendar size={14} />
                            {t('joined', { date: formatJoinDate(account.created_at) })}
                        </MetaItem>
                    )}
                    <MetaLink href={account.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={14} />
                        {t('viewOnInstance')}
                    </MetaLink>
                </MetaSection>
                <ProfileFields fields={account.fields} emojis={account.emojis} />
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
    isNotifyPending?: boolean;
    onFollowToggle: () => void;
    onBlockToggle: () => void;
    onMuteToggle: () => void;
    onNotifyToggle?: () => void;
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
    isNotifyPending,
    onFollowToggle,
    onBlockToggle,
    onMuteToggle,
    onNotifyToggle,
    onShowProfile,
    domain,
}: LimitedProfileHeaderProps) {
    const t = useTranslations('account');
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
                            isNotifying={relationship?.notifying}
                            isLoading={isFollowLoading}
                            isMutePending={isMutePending}
                            isBlockPending={isBlockPending}
                            isNotifyPending={isNotifyPending}
                            acct={account.acct}
                            onFollowToggle={onFollowToggle}
                            onBlockToggle={onBlockToggle}
                            onMuteToggle={onMuteToggle}
                            onNotifyToggle={onNotifyToggle}
                        />
                    </AvatarSection>
                </ProfileDetails>
            </ProfileSection>
            <LimitedAccountWarning>
                <LimitedAccountMessage>
                    {t('hiddenProfile', { domain })}
                </LimitedAccountMessage>
                <Button variant="secondary" onClick={onShowProfile}>
                    {t('showProfile')}
                </Button>
            </LimitedAccountWarning>
        </>
    );
}
