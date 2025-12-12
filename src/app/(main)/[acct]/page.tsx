'use client';

import { use, useState } from 'react';
import { useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, ExternalLink, Lock } from 'lucide-react';
import {
  useLookupAccount,
  useInfiniteAccountStatusesWithFilters,
  useRelationships,
  useCurrentAccount,
  usePinnedStatuses,
  useFollowAccount,
  useUnfollowAccount,
  useBlockAccount,
  useUnblockAccount,
  useMuteAccount,
  useUnmuteAccount,
} from '@/api';
import type { AccountStatusFilters } from '@/api/queries';
import {
  PostCardSkeletonList,
  AccountProfileSkeleton,
  ProfileStats,
  ProfileBio,
  ProfileFields,
  ProfileActionButtons,
  HandleExplainer,
} from '@/components/molecules';
import { ProfileContent } from '@/components/organisms';
import { Avatar, Button, IconButton, EmojiText } from '@/components/atoms';
import { flattenAndUniqById, getStatusFilters } from '@/utils/fp';
import {
  PageContainer,
  FixedBackButton,
  ScrollableContent,
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
  ErrorContainer,
  ErrorTitle,
  PostsHeader,
  LoadingBorder,
} from './styles';

type ProfileTab = 'posts' | 'posts_replies' | 'media';

export default function AccountPage({
  params,
}: {
  params: Promise<{ acct: string }>;
}) {
  const router = useRouter();
  const { acct: acctParam } = use(params);

  const decodedAcct = decodeURIComponent(acctParam);
  if (!decodedAcct.startsWith('@')) {
    notFound();
  }
  const acct = decodedAcct.slice(1);

  // Data fetching
  const { data: account, isLoading: accountLoading, isError: accountError } = useLookupAccount(acct);
  const accountId = account?.id;

  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');

  const statusFilters: AccountStatusFilters = getStatusFilters(activeTab);


  const {
    data: statusPages, isLoading: statusesLoading, fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useInfiniteAccountStatusesWithFilters(accountId || '', statusFilters);

  const { data: relationships } = useRelationships(accountId ? [accountId] : []);
  const relationship = relationships?.[0];

  const { data: pinnedStatuses } = usePinnedStatuses(accountId || '');
  const { data: currentAccount } = useCurrentAccount();
  const isOwnProfile = currentAccount?.id === accountId;

  const followMutation = useFollowAccount();
  const unfollowMutation = useUnfollowAccount();
  const blockMutation = useBlockAccount();
  const unblockMutation = useUnblockAccount();
  const muteMutation = useMuteAccount();
  const unmuteMutation = useUnmuteAccount();

  const uniqueStatuses = flattenAndUniqById(statusPages?.pages);

  // Event handlers
  const handleFollowToggle = () => {
    if (!accountId) return;
    relationship?.following || relationship?.requested ? unfollowMutation.mutate(accountId) : followMutation.mutate(accountId);
  };

  const handleBlockToggle = () => {
    if (!accountId) return;
    relationship?.blocking ? unblockMutation.mutate(accountId) : blockMutation.mutate(accountId);
  };

  const handleMuteToggle = () => {
    if (!accountId) return;
    relationship?.muting ? unmuteMutation.mutate(accountId) : muteMutation.mutate({ id: accountId });
  };

  const isBlocking = relationship?.blocking || false;
  const isMuting = relationship?.muting || false;
  const isFollowing = relationship?.following || false;
  const isFollowLoading = followMutation.isPending || unfollowMutation.isPending;

  // Loading state
  if (accountLoading) {
    return (
      <PageContainer className="full-height-container">
        <FixedBackButton>
          <IconButton onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </IconButton>
        </FixedBackButton>
        <AccountProfileSkeleton />
        <LoadingBorder>
          <PostsHeader>Posts</PostsHeader>
          <ScrollableContent className="virtualized-list-container">
            <PostCardSkeletonList count={3} />
          </ScrollableContent>
        </LoadingBorder>
      </PageContainer>
    );
  }

  // Error state
  if (accountError || !account) {
    return (
      <ErrorContainer>
        <ErrorTitle>Profile Not Found</ErrorTitle>
        <Link href="/"><Button>Back to Timeline</Button></Link>
      </ErrorContainer>
    );
  }

  return (
    <PageContainer className="full-height-container">
      {/* Fixed Back Button */}
      <FixedBackButton>
        <IconButton onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </IconButton>
      </FixedBackButton>

      {/* Scrollable Content */}
      <ScrollableContent className="virtualized-list-container">
        {/* Profile Section */}
        <ProfileSection>
          {/* Header Image */}
          {account.header && !account.header.includes('missing.png') && (
            <HeaderImage $url={account.header} />
          )}

          {/* Profile Details Container */}
          <ProfileDetails>
            {/* Avatar and Actions */}
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
                isBlocking={isBlocking}
                isMuting={isMuting}
                isLoading={isFollowLoading}
                isMutePending={muteMutation.isPending || unmuteMutation.isPending}
                isBlockPending={blockMutation.isPending || unblockMutation.isPending}
                acct={account.acct}
                onFollowToggle={handleFollowToggle}
                onBlockToggle={handleBlockToggle}
                onMuteToggle={handleMuteToggle}
              />
            </AvatarSection>

            {/* Name and Handle */}
            <NameSection>
              <DisplayName>
                <EmojiText text={account.display_name || account.username} emojis={account.emojis} />
                {account.bot && <BotBadge>BOT</BotBadge>}
                {account.locked && <LockIcon><Lock size={14} /></LockIcon>}
              </DisplayName>
              <HandleExplainer username={account.username} server={new URL(account.url).hostname} />
            </NameSection>

            {/* Bio */}
            <ProfileBio note={account.note} />

            {/* Stats */}
            <ProfileStats acct={account.acct} postsCount={account.statuses_count} followingCount={account.following_count} followersCount={account.followers_count} />

            {/* Joined Date & External Link */}
            <MetaSection>
              {account.created_at && (
                <MetaItem>
                  <Calendar size={14} />
                  Joined {new Date(account.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </MetaItem>
              )}
              <MetaLink href={account.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} />
                View on instance
              </MetaLink>
            </MetaSection>

            {/* Custom Fields */}
            <ProfileFields fields={account.fields} />
          </ProfileDetails>
        </ProfileSection>

        {/* Profile Content */}
        <ProfileContent
          acct={acct}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pinnedStatuses={pinnedStatuses}
          statuses={uniqueStatuses}
          isLoading={statusesLoading}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage ?? false}
          isFetchingNextPage={isFetchingNextPage}
        />
      </ScrollableContent>
    </PageContainer>
  );
}
