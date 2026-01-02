'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, List, Users, Settings } from 'lucide-react';
import { useList, useInfiniteListTimeline } from '@/api';
import { IconButton } from '@/components/atoms';
import { PostCard } from '@/components/organisms';
import { PostCardSkeleton, PostCardSkeletonList, PageHeaderSkeleton } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { flattenPages } from '@/utils/fp';
import type { Status } from '@/types';

export default function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const listId = resolvedParams.id;

    const { data: list, isLoading: isLoadingList } = useList(listId);
    const {
        data: timelinePages,
        isLoading: isLoadingTimeline,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteListTimeline(listId);

    const statuses = flattenPages(timelinePages?.pages);

    if (isLoadingList) {
        return (
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                <PageHeaderSkeleton
                    titleWidth={150}
                    subtitleWidth={100}
                    style={{ marginBottom: 'var(--size-4)' }}
                />
                <div className="virtualized-list-container" style={{ flex: 1, overflow: 'auto' }}>
                    <PostCardSkeletonList count={5} />
                </div>
            </div>
        );
    }

    if (!list) {
        return (
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--size-3)',
                        padding: 'var(--size-4)',
                        borderBottom: '1px solid var(--surface-3)',
                    }}
                >
                    <IconButton onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </IconButton>
                    <h1 style={{ fontSize: 'var(--font-size-4)' }}>List not found</h1>
                </div>
                <div style={{ display: 'grid', placeItems: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
                    <p>This list doesn&apos;t exist or you don&apos;t have access to it.</p>
                    <Link
                        href="/lists"
                        style={{
                            marginTop: 'var(--size-4)',
                            color: 'var(--brand)',
                        }}
                    >
                        Back to Lists
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            {/* ... Header ... */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--size-4)',
                    borderBottom: '1px solid var(--surface-3)',
                    position: 'sticky',
                    top: 0,
                    background: 'var(--surface-1)',
                    zIndex: 10,
                    marginBottom: 'var(--size-4)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)' }}>
                    <IconButton onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </IconButton>
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--radius-2)',
                            background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-hover) 100%)',
                            display: 'grid',
                            placeItems: 'center',
                        }}
                    >
                        <List size={20} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-4)' }}>{list.title}</h1>
                        <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                            {list.exclusive ? 'Exclusive list' : 'List timeline'}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--size-2)' }}>
                    <Link href={`/lists/${listId}/members`}>
                        <IconButton aria-label="Manage members">
                            <Users size={18} />
                        </IconButton>
                    </Link>
                    <Link href={`/lists`}>
                        <IconButton aria-label="List settings">
                            <Settings size={18} />
                        </IconButton>
                    </Link>
                </div>
            </div>

            {/* Timeline */}
            {isLoadingTimeline ? (
                <div className="virtualized-list-container" style={{ flex: 1, overflow: 'auto' }}>
                    <PostCardSkeletonList count={5} />
                </div>
            ) : statuses.length > 0 ? (
                <VirtualizedList<Status>
                    items={statuses}
                    renderItem={(status) => (
                        <PostCard
                            key={status.id}
                            status={status}
                            style={{ marginBottom: 'var(--size-3)' }}
                        />
                    )}
                    getItemKey={(status) => status.id}
                    estimateSize={250}
                    overscan={3}
                    onLoadMore={() => fetchNextPage()}
                    isLoadingMore={isFetchingNextPage}
                    hasMore={!!hasNextPage}
                    height="calc(100dvh - 120px)"
                    loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
                    emptyState={null}
                />
            ) : (
                <div style={{ display: 'grid', placeItems: 'center', padding: 'var(--size-8)', color: 'var(--text-2)' }}>
                    <List size={48} style={{ opacity: 0.3, marginBottom: 'var(--size-4)' }} />
                    <p>This list is empty</p>
                    <p style={{ fontSize: 'var(--font-size-0)', marginTop: 'var(--size-2)', textAlign: 'center' }}>
                        Add some accounts to this list to see their posts here.
                    </p>
                    <Link
                        href={`/lists/${listId}/members`}
                        style={{
                            marginTop: 'var(--size-4)',
                            padding: 'var(--size-2) var(--size-4)',
                            background: 'var(--blue-6)',
                            border: 'none',
                            borderRadius: 'var(--radius-2)',
                            color: 'white',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--size-2)',
                        }}
                    >
                        <Users size={16} />
                        Add members
                    </Link>
                </div>
            )}
        </div>
    );
}
