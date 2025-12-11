'use client';

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
            <div style={{ padding: '0 var(--size-4)' }}>
                <Tabs
                    tabs={profileTabs}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    variant="underline"
                    fullWidth
                />
            </div>

            {/* Pinned Posts Section */}
            {activeTab !== 'media' && pinnedStatuses && pinnedStatuses.length > 0 && (
                <div style={{
                    paddingTop: 'var(--size-4)',
                    paddingBottom: 'var(--size-4)',
                    borderBottom: '1px solid var(--surface-3)',
                }}>
                    <h3 style={{
                        fontSize: 'var(--font-size-2)',
                        fontWeight: 'var(--font-weight-6)',
                        marginBottom: 'var(--size-3)',
                        paddingLeft: 'var(--size-4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--size-2)',
                        color: 'var(--text-2)',
                    }}>
                        <Pin size={16} />
                        Pinned Posts
                    </h3>
                    {pinnedStatuses.map(status => (
                        <PostCard
                            key={status.id}
                            status={status}
                            style={{ marginBottom: 'var(--size-3)' }}
                        />
                    ))}
                </div>
            )}

            {/* Content Section */}
            <div style={{ paddingTop: 'var(--size-4)', display: 'flex', flexDirection: 'column' }}>
                {/* Posts Tab Content */}
                <Activity mode={activeTab === 'posts' ? 'visible' : 'hidden'}>
                    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {isLoading && statuses.length === 0 ? (
                            <div className="virtualized-list-container" style={{ flex: 1, overflow: 'auto' }}>
                                <PostCardSkeletonList count={3} />
                            </div>
                        ) : (
                            <VirtualizedList<Status>
                                items={statuses}
                                renderItem={(status) => (
                                    <PostCard status={status} style={{ marginBottom: 'var(--size-3)' }} />
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
                                loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
                                endIndicator="No more posts"
                                emptyState={<EmptyState title="No posts yet" />}
                            />
                        )}
                    </div>
                </Activity>

                {/* Posts & Replies Tab Content */}
                <Activity mode={activeTab === 'posts_replies' ? 'visible' : 'hidden'}>
                    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {isLoading && statuses.length === 0 ? (
                            <div className="virtualized-list-container" style={{ flex: 1, overflow: 'auto' }}>
                                <PostCardSkeletonList count={3} />
                            </div>
                        ) : (
                            <VirtualizedList<Status>
                                items={statuses}
                                renderItem={(status) => (
                                    <PostCard status={status} style={{ marginBottom: 'var(--size-3)' }} />
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
                                loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
                                endIndicator="No more posts"
                                emptyState={<EmptyState title="No posts yet" />}
                            />
                        )}
                    </div>
                </Activity>

                {/* Media Tab Content */}
                <Activity mode={activeTab === 'media' ? 'visible' : 'hidden'}>
                    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                        {isLoading && statuses.length === 0 ? (
                            <MediaGridSkeleton />
                        ) : (
                            <>
                                <MediaGrid statuses={statuses} />
                                {hasNextPage && (
                                    <button
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                        style={{
                                            margin: 'var(--size-4) auto',
                                            padding: 'var(--size-2) var(--size-4)',
                                            background: 'var(--surface-2)',
                                            border: '1px solid var(--surface-3)',
                                            borderRadius: 'var(--radius-2)',
                                            color: 'var(--text-1)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {isFetchingNextPage ? 'Loading...' : 'Load more'}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </Activity>
            </div>
        </>
    );
}
