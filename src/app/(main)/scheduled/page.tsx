'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useScheduledStatuses, useDeleteScheduledStatus } from '@/api';
import { useAuthStore } from '@/hooks/useStores';
import { Card, Button, IconButton } from '@/components/atoms';
import { ArrowLeft, Calendar, Trash2, Edit2, Clock } from 'lucide-react';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { ScheduledCardSkeletonList } from '@/components/molecules';
import { flattenPages } from '@/utils/fp';
import { formatScheduledDate } from '@/utils/date';
import type { ScheduledStatus } from '@/types';

export default function ScheduledStatusesPage() {
    const router = useRouter();
    const t = useTranslations('scheduled');
    const authStore = useAuthStore();
    const {
        data: scheduledStatuses,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isError,
        error
    } = useScheduledStatuses();
    const deleteMutation = useDeleteScheduledStatus();

    // Redirect if not authenticated
    if (!authStore.isAuthenticated) {
        router.push('/auth/signin');
        return null;
    }

    const handleDelete = async (id: string) => {
        if (confirm(t('confirmCancel'))) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleEdit = (id: string) => {
        // Navigate to compose page with scheduled_status_id
        router.push(`/compose?scheduled_status_id=${id}`);
    };

    const allScheduledStatuses = flattenPages(scheduledStatuses?.pages);

    const renderItem = (status: ScheduledStatus) => (
        <Card padding="medium" style={{ marginBottom: 'var(--size-3)' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--size-2)',
                color: 'var(--text-2)',
                fontSize: 'var(--font-size-1)',
                marginBottom: 'var(--size-3)',
                paddingBottom: 'var(--size-2)',
                borderBottom: '1px solid var(--surface-3)'
            }}>
                <Clock size={16} />
                <span>{t('scheduledFor', { date: formatScheduledDate(status.scheduled_at) })}</span>
            </div>

            <div style={{ marginBottom: 'var(--size-3)' }}>
                {status.params.status && (
                    <div className="status-content">
                        {status.params.status}
                    </div>
                )}

                {/* Media attachments preview */}
                {status.media_attachments.length > 0 && (
                    <div style={{
                        display: 'flex',
                        gap: 'var(--size-2)',
                        marginTop: 'var(--size-2)',
                        overflow: 'auto'
                    }}>
                        {status.media_attachments.map((media) => (
                            <div key={media.id} style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: 'var(--radius-2)',
                                overflow: 'hidden',
                                backgroundColor: 'var(--surface-3)',
                                flexShrink: 0
                            }}>
                                {media.type === 'image' && (
                                    <img
                                        src={media.preview_url || media.url || ''}
                                        alt={media.description || ''}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--size-2)', justifyContent: 'flex-end' }}>
                <Button
                    variant="secondary"
                    onClick={() => handleEdit(status.id)}
                    size="small"
                >
                    <Edit2 size={16} />
                    <span>{t('edit')}</span>
                </Button>
                <Button
                    variant="danger"
                    onClick={() => handleDelete(status.id)}
                    size="small"
                    disabled={deleteMutation.isPending}
                >
                    <Trash2 size={16} />
                    <span>{t('cancel')}</span>
                </Button>
            </div>
        </Card>
    );

    return (
        <div className="full-height-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                background: 'var(--surface-1)',
                zIndex: 10,
                padding: 'var(--size-4)',
                marginBottom: 'var(--size-4)',
                borderBottom: '1px solid var(--surface-3)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--size-3)',
                flexShrink: 0
            }}>
                <IconButton onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </IconButton>
                <div>
                    <h1 style={{ fontSize: 'var(--font-size-4)', marginBottom: 'var(--size-1)' }}>
                        {t('title')}
                    </h1>
                    <p style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                        {t('count', { count: allScheduledStatuses.length })}
                    </p>
                </div>
            </div>

            {isLoading ? (
                <ScheduledCardSkeletonList count={5} />
            ) : isError ? (
                <div style={{
                    padding: 'var(--size-4)',
                    background: 'var(--red-2)',
                    borderRadius: 'var(--radius-2)',
                    color: 'var(--red-9)',
                    textAlign: 'center'
                }}>
                    {error?.message || t('failedToLoad')}
                </div>
            ) : (
                <VirtualizedList<ScheduledStatus>
                    items={allScheduledStatuses}
                    renderItem={renderItem}
                    getItemKey={(status) => status.id}
                    estimateSize={250}
                    onLoadMore={fetchNextPage}
                    isLoadingMore={isFetchingNextPage}
                    hasMore={hasNextPage}
                    scrollRestorationKey="scheduled-statuses"
                    height="auto"
                    style={{ flex: 1, minHeight: 0 }}
                    loadingIndicator={
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            padding: 'var(--size-4)'
                        }}>
                            <div className="spinner" />
                        </div>
                    }
                    endIndicator={
                        <div style={{ padding: 'var(--size-4)', textAlign: 'center', color: 'var(--text-3)' }}>
                            {t('endOfPosts')}
                        </div>
                    }
                    emptyState={
                        <div style={{
                            textAlign: 'center',
                            padding: 'var(--size-8) var(--size-4)',
                            color: 'var(--text-2)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 'var(--size-4)'
                        }}>
                            <Calendar size={48} strokeWidth={1.5} />
                            <div>
                                <h2 style={{ fontSize: 'var(--font-size-3)', marginBottom: 'var(--size-2)' }}>{t('empty.title')}</h2>
                                <p>{t('empty.description')}</p>
                            </div>
                            <Button onClick={() => router.push('/compose')}>{t('empty.createPost')}</Button>
                        </div>
                    }
                />
            )}
        </div>
    );
}
