'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquareQuote } from 'lucide-react';
import { useStatus, useInfiniteStatusQuotes } from '@/api';
import { PostCardSkeleton, PageHeaderSkeleton } from '@/components/molecules';
import { PostCard, VirtualizedList } from '@/components/organisms';
import { IconButton, Button, EmptyState } from '@/components/atoms';
import { flattenPages } from '@/utils/fp';
import type { Status } from '@/types';

export default function QuotesPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();

    const {
        data: status,
        isLoading: statusLoading,
        isError: statusError,
    } = useStatus(id);

    const {
        data: quotesPages,
        isLoading: quotesLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteStatusQuotes(id);

    const quotes = flattenPages(quotesPages?.pages);
    const isLoading = statusLoading || quotesLoading;

    if (isLoading) {
        return (
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                <PageHeaderSkeleton />
                {Array.from({ length: 3 }).map((_, i) => (
                    <PostCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (statusError || !status) {
        return (
            <div style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
                <h2 style={{ color: 'var(--red-6)', marginBottom: 'var(--size-3)' }}>
                    Post Not Found
                </h2>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="full-height-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--size-3)',
                padding: 'var(--size-4)',
                borderBottom: '1px solid var(--surface-3)',
                background: 'var(--surface-1)',
                zIndex: 10,
                flexShrink: 0,
            }}>
                <IconButton onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </IconButton>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                    <MessageSquareQuote size={20} style={{ color: 'var(--blue-6)' }} />
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-4)', marginBottom: 'var(--size-1)' }}>
                            Quotes
                        </h1>
                        <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                            {status.quotes_count || 0} {(status.quotes_count || 0) === 1 ? 'quote' : 'quotes'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quotes List */}
            <VirtualizedList<Status>
                items={quotes}
                renderItem={(quoteStatus) => (
                    <PostCard
                        status={quoteStatus}
                        style={{ marginBottom: 'var(--size-2)' }}
                    />
                )}
                getItemKey={(quoteStatus) => quoteStatus.id}
                estimateSize={250}
                overscan={3}
                onLoadMore={fetchNextPage}
                isLoadingMore={isFetchingNextPage}
                hasMore={hasNextPage}
                loadMoreThreshold={3}
                height="auto"
                style={{ flex: 1, minHeight: 0 }}
                scrollRestorationKey={`quotes-${id}`}
                loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-2)' }} />}
                endIndicator="No more quotes"
                emptyState={
                    <EmptyState title="No quotes yet" />
                }
            />
        </div>
    );
}
