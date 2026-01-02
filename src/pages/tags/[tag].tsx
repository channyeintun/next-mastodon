import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Hash } from 'lucide-react';
import { useInfiniteHashtagTimeline } from '@/api';
import { PostCard } from '@/components/organisms';
import { PostCardSkeletonList, PostCardSkeleton } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { IconButton } from '@/components/atoms';
import { flattenAndUniqById } from '@/utils/fp';
import { MainLayout } from '@/components/layouts/MainLayout';
import type { Status } from '@/types';

export default function HashtagPage() {
    const router = useRouter();
    const { tag } = router.query;

    // Decode URL parameter
    const decodedTag = typeof tag === 'string' ? decodeURIComponent(tag) : '';

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteHashtagTimeline(decodedTag);

    // Flatten and deduplicate statuses using FP utility
    const uniqueStatuses = flattenAndUniqById(data?.pages);

    if (isLoading) {
        return (
            <MainLayout>
                <Head><title>{`#${decodedTag} - Mastodon`}</title></Head>
                <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{
                        position: 'sticky',
                        top: 0,
                        background: 'var(--surface-1)',
                        zIndex: 10,
                        padding: 'var(--size-4)',
                        marginBottom: 'var(--size-4)',
                        borderBottom: '1px solid var(--surface-3)',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--size-3)',
                        }}>
                            <IconButton onClick={() => router.back()}>
                                <ArrowLeft size={20} />
                            </IconButton>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--size-2)',
                            }}>
                                <Hash size={24} style={{ color: 'var(--indigo-6)' }} />
                                <h1 style={{
                                    fontSize: 'var(--font-size-4)',
                                    fontWeight: 'var(--font-weight-6)',
                                    color: 'var(--text-1)',
                                }}>
                                    {decodedTag}
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Skeleton loading */}
                    <div className="virtualized-list-container">
                        <PostCardSkeletonList count={5} />
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (isError) {
        return (
            <MainLayout>
                <Head><title>{`#${decodedTag} - Mastodon`}</title></Head>
                <div style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
                    <p style={{ color: 'var(--red-6)' }}>Failed to load hashtag timeline</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Head>
                <title>{`#${decodedTag} - Mastodon`}</title>
                <meta name="description" content={`Posts tagged with #${decodedTag}`} />
            </Head>
            <div className="full-height-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    background: 'var(--surface-1)',
                    zIndex: 10,
                    padding: 'var(--size-4)',
                    marginBottom: 'var(--size-4)',
                    borderBottom: '1px solid var(--surface-3)',
                    flexShrink: 0,
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--size-3)',
                    }}>
                        <IconButton onClick={() => router.back()}>
                            <ArrowLeft size={20} />
                        </IconButton>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--size-2)',
                        }}>
                            <Hash size={24} style={{ color: 'var(--indigo-6)' }} />
                            <h1 style={{
                                fontSize: 'var(--font-size-4)',
                                fontWeight: 'var(--font-weight-6)',
                                color: 'var(--text-1)',
                            }}>
                                {decodedTag}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Timeline with scroll restoration */}
                <VirtualizedList<Status>
                    items={uniqueStatuses}
                    renderItem={(status) => (
                        <PostCard
                            status={status}
                            style={{ marginBottom: 'var(--size-3)' }}
                        />
                    )}
                    getItemKey={(status) => status.id}
                    estimateSize={350}
                    overscan={5}
                    onLoadMore={fetchNextPage}
                    isLoadingMore={isFetchingNextPage}
                    hasMore={hasNextPage}
                    loadMoreThreshold={3}
                    height="auto"
                    style={{ flex: 1, minHeight: 0 }}
                    scrollRestorationKey={`hashtag-${decodedTag}`}
                    loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
                    endIndicator="You've reached the end"
                    emptyState={
                        <div style={{
                            textAlign: 'center',
                            marginTop: 'var(--size-8)',
                            color: 'var(--text-2)',
                        }}>
                            <Hash size={48} style={{ marginBottom: 'var(--size-4)' }} />
                            <p>No posts found for this hashtag</p>
                        </div>
                    }
                />
            </div>
        </MainLayout>
    );
}
