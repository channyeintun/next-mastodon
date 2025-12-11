'use client';

import styled from '@emotion/styled';
import { Activity } from 'react';
import { Pin } from 'lucide-react';
import { PostCard, VirtualizedList } from '@/components/organisms';
import { PostCardSkeleton, PostCardSkeletonList, MediaGrid, MediaGridSkeleton } from '@/components/molecules';
import { Tabs, EmptyState } from '@/components/atoms';
import type { TabItem } from '@/components/atoms/Tabs';
import type { Status } from '@/types';

type ProfileTab = 'posts' | 'posts_replies' | 'media';

const profileTabs: TabItem<ProfileTab>[] = [
    { value: 'posts', label: 'Posts' },
    { value: 'posts_replies', label: 'Posts & Replies' },
    { value: 'media', label: 'Media' },
];

const TabsContainer = styled.div`
  padding: 0;
`;

const PinnedSection = styled.div`
  padding-top: var(--size-4);
  padding-bottom: var(--size-4);
  border-bottom: 1px solid var(--surface-3);
`;

const PinnedHeader = styled.h3`
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--size-3);
  padding-left: var(--size-4);
  display: flex;
  align-items: center;
  gap: var(--size-2);
  color: var(--text-2);
`;

const ContentSection = styled.div`
  padding-top: var(--size-4);
  display: flex;
  flex-direction: column;
`;

const TabContent = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const MediaTabContent = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const LoadMoreButton = styled.button<{ disabled?: boolean }>`
  margin: var(--size-4) auto;
  padding: var(--size-2) var(--size-4);
  background: var(--surface-2);
  border: 1px solid var(--surface-3);
  border-radius: var(--radius-2);
  color: var(--text-1);
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--surface-3);
  }
`;

const LoadingContainer = styled.div`
  flex: 1;
  overflow: auto;
`;

const StyledPostCard = styled(PostCard)`
  margin-bottom: var(--size-3);
`;

const StyledPostCardSkeleton = styled(PostCardSkeleton)`
  margin-bottom: var(--size-3);
`;

interface ProfileContentProps {
    /** Account handle for scroll restoration */
    acct: string;
    /** Currently active tab */
    activeTab: ProfileTab;
    /** Tab change handler */
    onTabChange: (tab: ProfileTab) => void;
    /** Pinned statuses */
    pinnedStatuses?: Status[];
    /** Account statuses */
    statuses: Status[];
    /** Whether statuses are loading */
    isLoading: boolean;
    /** Pagination callbacks */
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
}

/**
 * ProfileContent - Profile page tab content with posts, replies, and media
 */
export function ProfileContent({
    acct,
    activeTab,
    onTabChange,
    pinnedStatuses,
    statuses,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
}: ProfileContentProps) {
    return (
        <>
            {/* Tabs */}
            <TabsContainer>
                <Tabs
                    tabs={profileTabs}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    variant="underline"
                    fullWidth
                />
            </TabsContainer>

            {/* Pinned Posts Section */}
            {activeTab !== 'media' && pinnedStatuses && pinnedStatuses.length > 0 && (
                <PinnedSection>
                    <PinnedHeader>
                        <Pin size={16} />
                        Pinned Posts
                    </PinnedHeader>
                    {pinnedStatuses.map(status => (
                        <StyledPostCard
                            key={status.id}
                            status={status}
                        />
                    ))}
                </PinnedSection>
            )}

            {/* Content Section */}
            <ContentSection>
                {/* Posts Tab Content */}
                <Activity mode={activeTab === 'posts' ? 'visible' : 'hidden'}>
                    <TabContent>
                        {isLoading && statuses.length === 0 ? (
                            <LoadingContainer className="virtualized-list-container">
                                <PostCardSkeletonList count={3} />
                            </LoadingContainer>
                        ) : (
                            <VirtualizedList<Status>
                                style={{ padding: 0 }}
                                items={statuses}
                                renderItem={(status) => (
                                    <StyledPostCard status={status} />
                                )}
                                getItemKey={(status) => status.id}
                                estimateSize={300}
                                overscan={5}
                                onLoadMore={fetchNextPage}
                                isLoadingMore={isFetchingNextPage}
                                hasMore={hasNextPage}
                                loadMoreThreshold={1}
                                height="100dvh"
                                scrollRestorationKey={`account-${acct}-posts`}
                                loadingIndicator={<StyledPostCardSkeleton />}
                                endIndicator="No more posts"
                                emptyState={<EmptyState title="No posts yet" />}
                            />
                        )}
                    </TabContent>
                </Activity>

                {/* Posts & Replies Tab Content */}
                <Activity mode={activeTab === 'posts_replies' ? 'visible' : 'hidden'}>
                    <TabContent>
                        {isLoading && statuses.length === 0 ? (
                            <LoadingContainer className="virtualized-list-container">
                                <PostCardSkeletonList count={3} />
                            </LoadingContainer>
                        ) : (
                            <VirtualizedList<Status>
                                style={{ padding: 0 }}
                                items={statuses}
                                renderItem={(status) => (
                                    <StyledPostCard status={status} />
                                )}
                                getItemKey={(status) => status.id}
                                estimateSize={300}
                                overscan={5}
                                onLoadMore={fetchNextPage}
                                isLoadingMore={isFetchingNextPage}
                                hasMore={hasNextPage}
                                loadMoreThreshold={1}
                                height="100dvh"
                                scrollRestorationKey={`account-${acct}-posts_replies`}
                                loadingIndicator={<StyledPostCardSkeleton />}
                                endIndicator="No more posts"
                                emptyState={<EmptyState title="No posts yet" />}
                            />
                        )}
                    </TabContent>
                </Activity>

                {/* Media Tab Content */}
                <Activity mode={activeTab === 'media' ? 'visible' : 'hidden'}>
                    <MediaTabContent>
                        {isLoading && statuses.length === 0 ? (
                            <MediaGridSkeleton />
                        ) : (
                            <>
                                <MediaGrid statuses={statuses} />
                                {hasNextPage && (
                                    <LoadMoreButton
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                    >
                                        {isFetchingNextPage ? 'Loading...' : 'Load more'}
                                    </LoadMoreButton>
                                )}
                            </>
                        )}
                    </MediaTabContent>
                </Activity>
            </ContentSection>
        </>
    );
}
