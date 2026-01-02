import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';

import { lookupAccountServer } from '@/lib/serverApi';
import { MainLayout } from '@/components/layouts/MainLayout';
import { IconButton, Tabs, CircleSkeleton, TextSkeleton } from '@/components/atoms';
import type { TabItem } from '@/components/atoms/Tabs';
import {
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
    useAccountWithCache,
} from '@/api';
import { queryKeys } from '@/api/queryKeys';
import { flattenAndUniqById } from '@/utils/fp';
import { PageContainer, FixedBackButton } from '@/components/account/styles';
import { ProfileTabContent, MediaTabContent, ContentSection } from '@/components/account/ProfileTabContent';
import { ProfileHeader, LimitedProfileHeader } from '@/components/account/ProfileHeader';
import { PinnedPostsSection } from '@/components/account/PinnedPostsSection';
import type { Account } from '@/types/mastodon';
import styled from '@emotion/styled';

type ProfileTab = 'posts' | 'posts_replies' | 'media';

const profileTabs: TabItem<ProfileTab>[] = [
    { value: 'posts', label: 'Posts' },
    { value: 'posts_replies', label: 'Posts & replies' },
    { value: 'media', label: 'Media' },
];

const POSTS_FILTERS = { exclude_replies: true } as const;
const POSTS_REPLIES_FILTERS = { exclude_replies: false, exclude_reblogs: true } as const;
const MEDIA_FILTERS = { only_media: true } as const;

interface AccountPageProps {
    // SSR data - null if client navigation (uses cache instead)
    account: Account | null;
    // The acct parameter for CSR fallback
    acct: string;
}

/**
 * Hybrid SSR/CSR approach:
 * - Direct visit: getServerSideProps fetches data, returns account
 * - Client navigation: getServerSideProps returns null, client uses TanStack Query cache
 * 
 * Detection: Client navigation sends x-nextjs-data header
 */
export const getServerSideProps: GetServerSideProps<AccountPageProps> = async ({ params, req }) => {
    const acctParam = params?.acct;

    if (typeof acctParam !== 'string') {
        return { notFound: true };
    }

    // Decode and validate the acct parameter
    const decodedAcct = decodeURIComponent(acctParam);

    // The route is [acct], so acctParam should start with @
    if (!decodedAcct.startsWith('@')) {
        return { notFound: true };
    }

    const acct = decodedAcct.slice(1); // Remove @ prefix

    // Detect client-side navigation via x-nextjs-data header
    // When using Link or router.push, Next.js fetches /_next/data/... and sets this header
    const isClientNavigation = !!req.headers['x-nextjs-data'];

    if (isClientNavigation) {
        // Client navigation: Skip server fetch, let client use TanStack Query cache
        return {
            props: {
                account: null,
                acct,
            },
        };
    }

    // Direct visit (SSR): Fetch data on server
    const cookies = req.headers.cookie || '';
    const instanceURLMatch = cookies.match(/instanceURL=([^;]+)/);
    const instanceURL = instanceURLMatch ? decodeURIComponent(instanceURLMatch[1]) : undefined;

    const account = await lookupAccountServer(acct, instanceURL);

    if (!account) {
        return { notFound: true };
    }

    return {
        props: {
            account,
            acct,
        },
    };
};

// Loading skeleton for profile page
function ProfileLoadingSkeleton() {
    return (
        <MainLayout>
            <Head><title>Loading... - Mastodon</title></Head>
            <PageContainer>
                <FixedBackButton>
                    <IconButton disabled>
                        <ArrowLeft size={20} />
                    </IconButton>
                </FixedBackButton>

                <LoadingContainer>
                    <HeaderSkeleton>
                        <BannerSkeleton />
                        <AvatarContainer>
                            <CircleSkeleton size="80px" />
                        </AvatarContainer>
                        <InfoContainer>
                            <TextSkeleton width={150} height={24} />
                            <TextSkeleton width={100} height={16} style={{ marginTop: 8 }} />
                        </InfoContainer>
                    </HeaderSkeleton>

                    <BioSkeleton>
                        <TextSkeleton width="100%" height={14} />
                        <TextSkeleton width="80%" height={14} style={{ marginTop: 8 }} />
                    </BioSkeleton>

                    <StatsSkeleton>
                        <TextSkeleton width={60} height={14} />
                        <TextSkeleton width={60} height={14} />
                        <TextSkeleton width={60} height={14} />
                    </StatsSkeleton>
                </LoadingContainer>
            </PageContainer>
        </MainLayout>
    );
}

// Not found state
function ProfileNotFound() {
    const router = useRouter();
    return (
        <MainLayout>
            <Head><title>Profile Not Found - Mastodon</title></Head>
            <PageContainer>
                <FixedBackButton>
                    <IconButton onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </IconButton>
                </FixedBackButton>
                <NotFoundContainer>
                    <h1>Profile not found</h1>
                    <p>The profile you&apos;re looking for doesn&apos;t exist or may have been removed.</p>
                </NotFoundContainer>
            </PageContainer>
        </MainLayout>
    );
}

export default function AccountPage({ account: ssrAccount, acct }: AccountPageProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    // If SSR provided account data, populate cache and use it directly
    // If client navigation (ssrAccount is null), use TanStack Query to get from cache
    const { data: csrAccount, isLoading: csrLoading, error: csrError } = useAccountWithCache(
        // Only fetch via CSR if SSR didn't provide data
        ssrAccount ? '' : acct
    );

    // Use SSR data if available, otherwise use CSR data
    const account = ssrAccount || csrAccount;
    const isLoading = !ssrAccount && csrLoading;
    const error = !ssrAccount && csrError;

    // Populate cache with SSR data on mount
    useEffect(() => {
        if (ssrAccount) {
            queryClient.setQueryData(queryKeys.accounts.detail(ssrAccount.id), ssrAccount);
            queryClient.setQueryData(queryKeys.accounts.lookup(ssrAccount.acct), ssrAccount);
        }
    }, [ssrAccount, queryClient]);

    // Tab state from URL query
    const tabFromQuery = router.query.tab as ProfileTab | undefined;
    const [activeTab, setActiveTab] = useState<ProfileTab>(
        tabFromQuery && ['posts', 'posts_replies', 'media'].includes(tabFromQuery)
            ? tabFromQuery
            : 'posts'
    );

    // Sync tab with URL on changes
    useEffect(() => {
        if (tabFromQuery && ['posts', 'posts_replies', 'media'].includes(tabFromQuery)) {
            setActiveTab(tabFromQuery);
        }
    }, [tabFromQuery]);

    const [showLimitedProfile, setShowLimitedProfile] = useState(false);

    // Update showLimitedProfile when account data loads
    useEffect(() => {
        if (account?.limited) {
            setShowLimitedProfile(true);
        }
    }, [account?.limited]);

    // Get accountId after account is loaded
    const accountId = account?.id || '';

    // Update URL when tab changes
    const handleTabChange = (tab: ProfileTab) => {
        setActiveTab(tab);
        router.push(
            { pathname: router.pathname, query: { ...router.query, tab } },
            undefined,
            { shallow: true }
        );
    };

    // Client-side data fetching (only runs when accountId is available)
    const { data: pinnedStatuses } = usePinnedStatuses(accountId);
    const { data: currentAccount } = useCurrentAccount();
    const isOwnProfile = currentAccount?.id === accountId;

    // Parallel queries for each tab
    const postsQuery = useInfiniteAccountStatusesWithFilters(accountId, POSTS_FILTERS);
    const postsRepliesQuery = useInfiniteAccountStatusesWithFilters(accountId, POSTS_REPLIES_FILTERS);
    const mediaQuery = useInfiniteAccountStatusesWithFilters(accountId, MEDIA_FILTERS);

    const { data: relationships } = useRelationships(accountId ? [accountId] : []);
    const relationship = relationships?.[0];

    const followMutation = useFollowAccount();
    const unfollowMutation = useUnfollowAccount();
    const blockMutation = useBlockAccount();
    const unblockMutation = useUnblockAccount();
    const muteMutation = useMuteAccount();
    const unmuteMutation = useUnmuteAccount();
    const notifyMutation = useUpdateAccountNotifications();

    const postsStatuses = flattenAndUniqById(postsQuery.data?.pages);
    const postsRepliesStatuses = flattenAndUniqById(postsRepliesQuery.data?.pages);
    const mediaStatuses = flattenAndUniqById(mediaQuery.data?.pages);

    const handleFollowToggle = () => {
        if (!accountId) return;
        relationship?.following || relationship?.requested
            ? unfollowMutation.mutate(accountId)
            : followMutation.mutate({ id: accountId });
    };

    const handleBlockToggle = () => {
        if (!accountId) return;
        relationship?.blocking ? unblockMutation.mutate(accountId) : blockMutation.mutate(accountId);
    };

    const handleMuteToggle = () => {
        if (!accountId) return;
        relationship?.muting ? unmuteMutation.mutate(accountId) : muteMutation.mutate({ id: accountId });
    };

    const handleNotifyToggle = () => {
        if (!accountId) return;
        notifyMutation.mutate({ id: accountId, notify: !relationship?.notifying });
    };

    // Handle loading state (only for CSR, SSR is already loaded)
    if (isLoading) {
        return <ProfileLoadingSkeleton />;
    }

    // Handle error or not found
    if (error || !account) {
        return <ProfileNotFound />;
    }

    const isFollowing = relationship?.following || false;
    const isFollowLoading = followMutation.isPending || unfollowMutation.isPending;

    const getAccountDomain = () => {
        if (!account.url) return 'this server';
        try {
            return new URL(account.url).hostname;
        } catch {
            return 'this server';
        }
    };

    // Generate meta description from bio
    const plainTextBio = account.note
        .replace(/<[^>]*>/g, '')
        .slice(0, 160);

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
        <MainLayout>
            <Head>
                <title>{`${account.display_name || account.username} (@${account.acct}) - Mastodon`}</title>
                <meta name="description" content={plainTextBio || `Profile of @${account.acct}`} />
                <meta property="og:title" content={`${account.display_name || account.username} (@${account.acct})`} />
                <meta property="og:description" content={plainTextBio || `Profile of @${account.acct}`} />
                {account.avatar && <meta property="og:image" content={account.avatar} />}
                <meta property="og:type" content="profile" />
                <meta name="twitter:card" content="summary" />
            </Head>

            <PageContainer>
                <FixedBackButton>
                    <IconButton onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </IconButton>
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
                            <Tabs tabs={profileTabs} activeTab={activeTab} onTabChange={handleTabChange} />
                            <ContentSection>
                                {(activeTab === 'posts' || activeTab === 'posts_replies') &&
                                    pinnedStatuses &&
                                    pinnedStatuses.length > 0 && (
                                        <PinnedPostsSection pinnedStatuses={pinnedStatuses} />
                                    )}
                                {activeTab === 'posts' && (
                                    <ProfileTabContent
                                        acct={account.acct}
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
                                        acct={account.acct}
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
        </MainLayout>
    );
}

// Styled components for loading skeleton
const LoadingContainer = styled.div`
    padding: var(--size-4);
`;

const HeaderSkeleton = styled.div`
    position: relative;
    margin-bottom: var(--size-6);
`;

const BannerSkeleton = styled.div`
    height: 150px;
    background: var(--surface-3);
    border-radius: var(--radius-3);
`;

const AvatarContainer = styled.div`
    position: absolute;
    bottom: -40px;
    left: var(--size-4);
`;

const InfoContainer = styled.div`
    padding-top: 50px;
    padding-left: var(--size-4);
`;

const BioSkeleton = styled.div`
    margin-bottom: var(--size-4);
`;

const StatsSkeleton = styled.div`
    display: flex;
    gap: var(--size-4);
`;

const NotFoundContainer = styled.div`
    padding: var(--size-8);
    text-align: center;
    
    h1 {
        font-size: var(--font-size-5);
        margin-bottom: var(--size-2);
    }
    
    p {
        color: var(--text-2);
    }
`;
