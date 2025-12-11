'use client';

import styled from '@emotion/styled';
import { use, useState } from 'react';
import { useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
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
import { Avatar, Button, IconButton, EmojiText, TextSkeleton } from '@/components/atoms';
import { flattenAndUniqById, getStatusFilters } from '@/utils/fp';

type ProfileTab = 'posts' | 'posts_replies' | 'media';

const PageContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  background: var(--surface-1);
  z-index: 10;
  padding: var(--size-4);
  margin-bottom: var(--size-4);
  border-bottom: 1px solid var(--surface-3);
  display: flex;
  align-items: center;
  gap: var(--size-3);
  flex-shrink: 0;
`;

const HeaderTitle = styled.h1`
  font-size: var(--font-size-4);
  margin-bottom: var(--size-1);
`;

const HeaderSubtitle = styled.p`
  font-size: var(--font-size-0);
  color: var(--text-2);
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow: auto;
`;

const HeaderImage = styled.div<{ $url: string }>`
  width: 100%;
  height: 200px;
  border-radius: var(--radius-3);
  background-image: url(${({ $url }) => $url});
  background-size: cover;
  background-position: center;
  margin-bottom: calc(-1 * var(--size-8));
`;

const ProfileSection = styled.div`
  padding: 0;
`;

const ProfileDetails = styled.div`
  padding: var(--size-2);
  padding-top: var(--size-2);
`;

const AvatarSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--size-4);
`;

const NameSection = styled.div`
  margin-bottom: var(--size-4);
`;

const DisplayName = styled.h2`
  font-size: var(--font-size-5);
  font-weight: var(--font-weight-7);
  margin-bottom: var(--size-1);
  display: flex;
  align-items: center;
  gap: var(--size-2);
  flex-wrap: wrap;
`;

const BotBadge = styled.span`
  font-size: var(--font-size-0);
  background: var(--surface-3);
  padding: 2px var(--size-2);
  border-radius: var(--radius-1);
`;

const LockIcon = styled.span`
  font-size: var(--font-size-1);
`;

const MetaSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-4);
  font-size: var(--font-size-0);
  color: var(--text-2);
  margin-bottom: var(--size-4);
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: var(--size-2);
`;

const MetaLink = styled.a`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  color: var(--blue-6);
  text-decoration: none;
`;

const ErrorContainer = styled.div`
  text-align: center;
  margin-top: var(--size-8);
`;

const ErrorTitle = styled.h2`
  color: var(--red-6);
  margin-bottom: var(--size-3);
`;

const PostsHeader = styled.h3`
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--size-4);
  padding-left: var(--size-4);
`;

const LoadingBorder = styled.div`
  border-top: 1px solid var(--surface-3);
  padding-top: var(--size-4);
  margin-top: var(--size-4);
`;

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
    relationship?.following ? unfollowMutation.mutate(accountId) : followMutation.mutate(accountId);
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
        <Header>
          <IconButton onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </IconButton>
          <div>
            <TextSkeleton width="150px" height="24px" style={{ marginBottom: 'var(--size-1)' }} />
            <TextSkeleton width="100px" height="16px" />
          </div>
        </Header>
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
      {/* Header */}
      <Header>
        <IconButton onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </IconButton>
        <div>
          <HeaderTitle>
            <EmojiText text={account.display_name || account.username} emojis={account.emojis} />
          </HeaderTitle>
          <HeaderSubtitle>
            {account.statuses_count.toLocaleString()} posts
          </HeaderSubtitle>
        </div>
      </Header>

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
                {account.locked && <LockIcon>🔒</LockIcon>}
              </DisplayName>
              <HandleExplainer username={account.username} server={new URL(account.url).hostname} />
            </NameSection>

            {/* Bio */}
            <ProfileBio note={account.note} />

            {/* Stats */}
            <ProfileStats acct={account.acct} followingCount={account.following_count} followersCount={account.followers_count} />

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
