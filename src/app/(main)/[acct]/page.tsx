'use client';

import { Activity, use, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
import { AccountProfileSkeleton } from '@/components/molecules';
import { Button, IconButton, Tabs } from '@/components/atoms';
import type { TabItem } from '@/components/atoms/Tabs';
import { flattenAndUniqById } from '@/utils/fp';
import { PageContainer, FixedBackButton, ErrorContainer, ErrorTitle } from './styles';
import { ProfileTabContent, MediaTabContent, ContentSection } from './ProfileTabContent';
import { ProfileHeader, LimitedProfileHeader } from './ProfileHeader';

type ProfileTab = 'posts' | 'posts_replies' | 'media';
const VALID_TABS: ProfileTab[] = ['posts', 'posts_replies', 'media'];

const profileTabs: TabItem<ProfileTab>[] = [
  { value: 'posts', label: 'Posts' },
  { value: 'posts_replies', label: 'Posts & replies' },
  { value: 'media', label: 'Media' },
];

const POSTS_FILTERS = { exclude_replies: true } as const;
const POSTS_REPLIES_FILTERS = { exclude_replies: false, exclude_reblogs: true } as const;
const MEDIA_FILTERS = { only_media: true } as const;

export default function AccountPage({ params }: { params: Promise<{ acct: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { acct: acctParam } = use(params);

  const decodedAcct = decodeURIComponent(acctParam);
  if (!decodedAcct.startsWith('@')) notFound();
  const acct = decodedAcct.slice(1);

  const { data: account, isLoading: accountLoading, isError: accountError } = useLookupAccount(acct);
  const accountId = account?.id;

  const [showLimitedProfile, setShowLimitedProfile] = useState(false);
  useEffect(() => {
    if (account) setShowLimitedProfile(account.limited);
  }, [account]);

  // Read initial tab from URL or default to 'posts'
  const tabParam = searchParams.get('tab') as ProfileTab | null;
  const initialTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'posts';
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);

  // Sync tab changes to URL
  const handleTabChange = useCallback((tab: ProfileTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === 'posts') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', tab);
    }
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

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

  const postsStatuses = flattenAndUniqById(postsQuery.data?.pages);
  const postsRepliesStatuses = flattenAndUniqById(postsRepliesQuery.data?.pages);
  const mediaStatuses = flattenAndUniqById(mediaQuery.data?.pages);

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
    onFollowToggle: handleFollowToggle,
    onBlockToggle: handleBlockToggle,
    onMuteToggle: handleMuteToggle,
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
            <Tabs tabs={profileTabs} activeTab={activeTab} onTabChange={handleTabChange} sticky />
            <ContentSection>
              <Activity mode={activeTab === 'posts' ? 'visible' : 'hidden'}>
                <ProfileTabContent
                  acct={acct}
                  tabKey="posts"
                  pinnedStatuses={pinnedStatuses}
                  statuses={postsStatuses}
                  isLoading={postsQuery.isLoading}
                  fetchNextPage={postsQuery.fetchNextPage}
                  hasNextPage={postsQuery.hasNextPage ?? false}
                  isFetchingNextPage={postsQuery.isFetchingNextPage}
                />
              </Activity>
              <Activity mode={activeTab === 'posts_replies' ? 'visible' : 'hidden'}>
                <ProfileTabContent
                  acct={acct}
                  tabKey="posts_replies"
                  statuses={postsRepliesStatuses}
                  isLoading={postsRepliesQuery.isLoading}
                  fetchNextPage={postsRepliesQuery.fetchNextPage}
                  hasNextPage={postsRepliesQuery.hasNextPage ?? false}
                  isFetchingNextPage={postsRepliesQuery.isFetchingNextPage}
                />
              </Activity>
              <Activity mode={activeTab === 'media' ? 'visible' : 'hidden'}>
                <MediaTabContent
                  statuses={mediaStatuses}
                  isLoading={mediaQuery.isLoading}
                  fetchNextPage={mediaQuery.fetchNextPage}
                  hasNextPage={mediaQuery.hasNextPage ?? false}
                  isFetchingNextPage={mediaQuery.isFetchingNextPage}
                />
              </Activity>
            </ContentSection>
          </>
        )}
      </div>
    </PageContainer>
  );
}
