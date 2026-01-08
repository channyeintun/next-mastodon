'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquareQuote } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
    const t = useTranslations('statusDetail');

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
            <div className="full-height-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
                <PageHeaderSkeleton />
                <div style={{ padding: 'var(--size-2)' }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <PostCardSkeleton key={i} style={{ marginBottom: 'var(--size-2)' }} />
                    ))}
                </div>
            </div>
        );
    }

    if (statusError || !status) {
        return (
            <div style={{ textAlign: 'center', marginTop: 'var(--size-8)' }}>
                <h2 style={{ color: 'var(--red-6)', marginBottom: 'var(--size-3)' }}>
                    {t('postNotFound')}
                </h2>
                <Button onClick={() => router.back()}>{t('goBack')}</Button>
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
                            {t('quotesPage.title')}
                        </h1>
                        <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                            {t('quotesPage.count', { count: status.quotes_count || 0 })}
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
                style={{ flex: 1, minHeight: 0, paddingTop: 'var(--size-2)' }}
                scrollRestorationKey={`quotes-${id}`}
                loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-2)' }} />}
                endIndicator={t('quotesPage.noMoreQuotes')}
                emptyState={
                    <EmptyState title={t('quotesPage.noQuotesYet')} />
                }
            />
        </div>
    );
}
