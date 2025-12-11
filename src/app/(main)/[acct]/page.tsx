'use client';

import { use, useState, useMemo } from 'react';
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
import { flattenAndUniqById } from '@/utils/fp';

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

  const statusFilters: AccountStatusFilters = useMemo(() => {
    switch (activeTab) {
      case 'posts': return { exclude_replies: true };
      case 'posts_replies': return { exclude_replies: false, exclude_reblogs: true };
      case 'media': return { only_media: true };
      default: return { exclude_replies: true };
    }
  }, [activeTab]);

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
      <div className="full-height-container" style={{ maxWidth: '600px', margin: '0 auto', padding: 0 }}>
        <div style={{
          position: 'sticky', top: 0, background: 'var(--surface-1)', zIndex: 10,
          padding: 'var(--size-4)', marginBottom: 'var(--size-4)', borderBottom: '1px solid var(--surface-3)',
          display: 'flex', alignItems: 'center', gap: 'var(--size-3)', flexShrink: 0,
        }}>
          <IconButton onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </IconButton>
          <div>
            <TextSkeleton width="150px" height="24px" style={{ marginBottom: 'var(--size-1)' }} />
            <TextSkeleton width="100px" height="16px" />
          </div>
        </div>
        <AccountProfileSkeleton />
        <div style={{ borderTop: '1px solid var(--surface-3)', paddingTop: 'var(--size-4)', marginTop: 'var(--size-4)' }}>
          <h3 style={{ fontSize: 'var(--font-size-3)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-4)', paddingLeft: 'var(--size-4)' }}>Posts</h3>
          <div className="virtualized-list-container" style={{ flex: 1, overflow: 'auto' }}>
            <PostCardSkeletonList count={3} />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (accountError || !account) {
    return (
      <div style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
        <h2 style={{ color: 'var(--red-6)', marginBottom: 'var(--size-3)' }}>Profile Not Found</h2>
        <Link href="/"><Button>Back to Timeline</Button></Link>
      </div>
    );
  }

  return (
    <div className="full-height-container" style={{ maxWidth: '600px', margin: '0 auto', padding: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, background: 'var(--surface-1)', zIndex: 10,
        padding: 'var(--size-4)', borderBottom: '1px solid var(--surface-3)',
        display: 'flex', alignItems: 'center', gap: 'var(--size-3)', flexShrink: 0,
      }}>
        <IconButton onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </IconButton>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-4)', marginBottom: 'var(--size-1)' }}>
            <EmojiText text={account.display_name || account.username} emojis={account.emojis} />
          </h1>
          <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
            {account.statuses_count.toLocaleString()} posts
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="virtualized-list-container" style={{ flex: 1, overflow: 'auto' }}>
        {/* Profile Section */}
        <div style={{ padding: 'var(--size-4)' }}>
          {/* Header Image */}
          {account.header && !account.header.includes('missing.png') && (
            <div style={{
              width: '100%', height: '150px', borderRadius: 'var(--radius-3)',
              backgroundImage: `url(${account.header})`, backgroundSize: 'cover', backgroundPosition: 'center',
              marginBottom: 'var(--size-4)',
            }} />
          )}

          {/* Avatar and Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--size-4)' }}>
            <Avatar src={account.avatar} alt={account.display_name || account.username} size="xlarge" />
            {!isOwnProfile && (
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
            )}
          </div>

          {/* Name and Handle */}
          <div style={{ marginBottom: 'var(--size-4)' }}>
            <h2 style={{ fontSize: 'var(--font-size-5)', fontWeight: 'var(--font-weight-7)', marginBottom: 'var(--size-1)', display: 'flex', alignItems: 'center', gap: 'var(--size-2)', flexWrap: 'wrap' }}>
              <EmojiText text={account.display_name || account.username} emojis={account.emojis} />
              {account.bot && <span style={{ fontSize: 'var(--font-size-0)', background: 'var(--surface-3)', padding: '2px var(--size-2)', borderRadius: 'var(--radius-1)' }}>BOT</span>}
              {account.locked && <span style={{ fontSize: 'var(--font-size-1)' }}>🔒</span>}
            </h2>
            <HandleExplainer username={account.username} server={account.acct.includes('@') ? account.acct.split('@')[1] : 'local'} />
          </div>

          {/* Bio */}
          <ProfileBio note={account.note} />

          {/* Stats */}
          <ProfileStats acct={account.acct} followingCount={account.following_count} followersCount={account.followers_count} />

          {/* Joined Date & External Link */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--size-4)', fontSize: 'var(--font-size-0)', color: 'var(--text-2)', marginBottom: 'var(--size-4)' }}>
            {account.created_at && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                <Calendar size={14} />
                Joined {new Date(account.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            )}
            <a href={account.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)', color: 'var(--blue-6)', textDecoration: 'none' }}>
              <ExternalLink size={14} />
              View on instance
            </a>
          </div>

          {/* Custom Fields */}
          <ProfileFields fields={account.fields} />
        </div>

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
      </div>
    </div>
  );
}
