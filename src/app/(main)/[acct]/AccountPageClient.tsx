'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  useAccountWithCache,
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
  useUpdateAccountNotifications,
} from '@/api';

import { AccountProfileSkeleton } from '@/components/molecules';
import { Button, IconButton, Tabs } from '@/components/atoms';
import type { TabItem } from '@/components/atoms/Tabs';
import { flattenAndUniqById } from '@/utils/fp';
import { PageContainer, FixedBackButton, ErrorContainer, ErrorTitle } from './styles';
import { ProfileTabContent, MediaTabContent, ContentSection } from './ProfileTabContent';
import { ProfileHeader, LimitedProfileHeader } from './ProfileHeader';
import { PinnedPostsSection } from './PinnedPostsSection';
import { useQueryState, parseAsStringLiteral } from '@/hooks/useQueryState';

type ProfileTab = 'posts' | 'posts_replies' | 'media';
const VALID_TABS = ['posts', 'posts_replies', 'media'] as const;

const profileTabs: TabItem<ProfileTab>[] = [
  { value: 'posts', label: 'Posts' },
  { value: 'posts_replies', label: 'Posts & replies' },
  { value: 'media', label: 'Media' },
];

const POSTS_FILTERS = { exclude_replies: true } as const;
const POSTS_REPLIES_FILTERS = { exclude_replies: false, exclude_reblogs: true } as const;
const MEDIA_FILTERS = { only_media: true } as const;

interface AccountPageClientProps {
  /** The acct without @ prefix (e.g., "user" or "user@domain.com") */
  acct: string;
}

/**
 * Client component for the account/profile page.
 * Uses TanStack Query for data fetching.
 * When hydrated from SSR, the query cache already has the data.
 * When navigating client-side, data is prepopulated via setQueryData.
 */
export function AccountPageClient({ acct }: AccountPageClientProps) {
  const router = useRouter();

  // TanStack Query - will use cache if hydrated or prepopulated
  const { data: account, isLoading: accountLoading, isError: accountError } = useAccountWithCache(acct);
  const accountId = account?.id;

  const [showLimitedProfile, setShowLimitedProfile] = useState(false);
  useEffect(() => {
    if (account) setShowLimitedProfile(account.limited);
  }, [account]);

  // Tab state synced with URL using useQueryState
  const [activeTab, setActiveTab] = useQueryState('tab', {
    defaultValue: 'posts' as ProfileTab,
    parser: parseAsStringLiteral(VALID_TABS, 'posts'),
  });

  const { data: pinnedStatuses } = usePinnedStatuses(accountId || '');
  const { data: currentAccount } = useCurrentAccount();
  const isOwnProfile = currentAccount?.id === accountId;

  // Parallel queries for each tab
  const postsQuery = useInfiniteAccountStatusesWithFilters(accountId || '', POSTS_FILTERS);
  const postsRepliesQuery = useInfiniteAccountStatusesWithFilters(accountId || '', POSTS_REPLIES_FILTERS);
  const mediaQuery = useInfiniteAccountStatusesWithFilters(accountId || '', MEDIA_FILTERS);

  const { data: relationships } = useRelationships(accountId ? [accountId] : []);
  const relationship = relationships?.[0];

  const followMutation = useFollowAccount();
  const unfollowMutation = useUnfollowAccount();
  const blockMutation = useBlockAccount();
  const unblockMutation = useUnblockAccount();
  const muteMutation = useMuteAccount();
  const unmuteMutation = useUnmuteAccount();

  const postsStatuses = useMemo(() => flattenAndUniqById(postsQuery.data?.pages), [postsQuery.data?.pages]);
  const postsRepliesStatuses = useMemo(() => flattenAndUniqById(postsRepliesQuery.data?.pages), [postsRepliesQuery.data?.pages]);
  const mediaStatuses = useMemo(() => flattenAndUniqById(mediaQuery.data?.pages), [mediaQuery.data?.pages]);

  const handleFollowToggle = () => {
    if (!accountId) return;
    relationship?.following || relationship?.requested ? unfollowMutation.mutate(accountId) : followMutation.mutate({ id: accountId });
  };

  const handleBlockToggle = () => {
    if (!accountId) return;
    relationship?.blocking ? unblockMutation.mutate(accountId) : blockMutation.mutate(accountId);
  };

  const handleMuteToggle = () => {
    if (!accountId) return;
    relationship?.muting ? unmuteMutation.mutate(accountId) : muteMutation.mutate({ id: accountId });
  };

  const notifyMutation = useUpdateAccountNotifications();

  const handleNotifyToggle = () => {
    if (!accountId) return;
    notifyMutation.mutate({ id: accountId, notify: !relationship?.notifying });
  };

  const isFollowing = relationship?.following || false;
  const isFollowLoading = followMutation.isPending || unfollowMutation.isPending;

  const getAccountDomain = () => {
    if (!account?.url) return 'this server';
    try { return new URL(account.url).hostname; } catch { return 'this server'; }
  };

  if (accountLoading) {
    return (
      <PageContainer>
        <FixedBackButton>
          <IconButton onClick={() => router.back()}><ArrowLeft size={20} /></IconButton>
        </FixedBackButton>
        <AccountProfileSkeleton />
      </PageContainer>
    );
  }

  if (accountError || !account) {
    return (
      <ErrorContainer>
        <ErrorTitle>Profile Not Found</ErrorTitle>
        <Link href="/"><Button>Back to Timeline</Button></Link>
      </ErrorContainer>
    );
  }

  const commonHeaderProps = {
    account,
    relationship,
    isOwnProfile,
    isFollowing,
    isFollowLoading,
    isMutePending: muteMutation.isPending || unmuteMutation.isPending,
    isBlockPending: blockMutation.isPending || unblockMutation.isPending,
    isNotifyPending: notifyMutation.isPending,
    onFollowToggle: handleFollowToggle,
    onBlockToggle: handleBlockToggle,
    onMuteToggle: handleMuteToggle,
    onNotifyToggle: handleNotifyToggle,
  };

  return (
    <PageContainer>
      <FixedBackButton>
        <IconButton onClick={() => router.back()}><ArrowLeft size={20} /></IconButton>
      </FixedBackButton>
      <div>
        {showLimitedProfile ? (
          <LimitedProfileHeader
            {...commonHeaderProps}
            onShowProfile={() => setShowLimitedProfile(false)}
            domain={getAccountDomain()}
          />
        ) : (
          <>
            <ProfileHeader {...commonHeaderProps} />
            <Tabs tabs={profileTabs} activeTab={activeTab} onTabChange={setActiveTab} />
            <ContentSection>
              {(activeTab === 'posts' || activeTab === 'posts_replies') && pinnedStatuses && pinnedStatuses.length > 0 && (
                <PinnedPostsSection pinnedStatuses={pinnedStatuses} />
              )}
              {activeTab === 'posts' && (
                <ProfileTabContent
                  acct={acct}
                  tabKey="posts"
                  statuses={postsStatuses}
                  isLoading={postsQuery.isLoading}
                  fetchNextPage={postsQuery.fetchNextPage}
                  hasNextPage={postsQuery.hasNextPage ?? false}
                  isFetchingNextPage={postsQuery.isFetchingNextPage}
                />
              )}
              {activeTab === 'posts_replies' && (
                <ProfileTabContent
                  acct={acct}
                  tabKey="posts_replies"
                  statuses={postsRepliesStatuses}
                  isLoading={postsRepliesQuery.isLoading}
                  fetchNextPage={postsRepliesQuery.fetchNextPage}
                  hasNextPage={postsRepliesQuery.hasNextPage ?? false}
                  isFetchingNextPage={postsRepliesQuery.isFetchingNextPage}
                />
              )}
              {activeTab === 'media' && (
                <MediaTabContent
                  statuses={mediaStatuses}
                  isLoading={mediaQuery.isLoading}
                  fetchNextPage={mediaQuery.fetchNextPage}
                  hasNextPage={mediaQuery.hasNextPage ?? false}
                  isFetchingNextPage={mediaQuery.isFetchingNextPage}
                />
              )}
            </ContentSection>
          </>
        )}
      </div>
    </PageContainer>
  );
}
