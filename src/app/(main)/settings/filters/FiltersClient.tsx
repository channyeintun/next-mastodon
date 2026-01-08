'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react';
import { useFilters } from '@/api/queries';
import { useDeleteFilter } from '@/api/mutations';
import { IconButton, Button, Card, TextSkeleton } from '@/components/atoms';
import { toast } from 'sonner';
import type { Filter } from '@/types/mastodon';
import { useTranslations } from 'next-intl';
import {
    FiltersContainer,
    FiltersHeader,
    FiltersTitle,
    FiltersList,
    FilterCard,
    FilterCardHeader,
    FilterTitle,
    FilterBadge,
    FilterKeywords,
    FilterContexts,
    ContextTag,
    FilterActions,
    EmptyState,
    ExpirationInfo,
} from './FilterStyles';

// Labels maps removed, will use translations directly



// Helper component to translate expiration
function ExpirationText({ expiresAt }: { expiresAt: string | null }) {
    const t = useTranslations('settings.filtersPage');
    if (!expiresAt) return null;

    const expiresDate = new Date(expiresAt);
    const now = new Date();

    if (expiresDate < now) return <>{t('expired')}</>;

    const diffMs = expiresDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return <>{t('expiresIn', { count: diffDays, unit: diffDays > 1 ? 'days' : 'day' })}</>;
    if (diffHours > 0) return <>{t('expiresIn', { count: diffHours, unit: diffHours > 1 ? 'hours' : 'hour' })}</>;
    return <>{t('expiresIn', { count: diffMinutes, unit: diffMinutes > 1 ? 'minutes' : 'minute' })}</>;
}

function FilterCardItem({ filter }: { filter: Filter }) {
    const router = useRouter();
    const deleteFilter = useDeleteFilter();
    const [isDeleting, setIsDeleting] = useState(false);
    const t = useTranslations('settings.filtersPage');

    const handleDelete = async () => {
        if (!window.confirm(t('confirmDelete', { title: filter.title }))) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteFilter.mutateAsync(filter.id);
            toast.success(t('filterDeleted'));
        } catch {
            toast.error(t('failedToDeleteFilter'));
        } finally {
            setIsDeleting(false);
        }
    };

    const keywordsPreview = filter.keywords
        .slice(0, 5)
        .map((k) => k.keyword)
        .join(', ');
    const hasMoreKeywords = filter.keywords.length > 5;
    const isExpired = filter.expires_at && new Date(filter.expires_at) < new Date();

    return (
        <FilterCard style={isExpired ? { opacity: 0.6 } : undefined}>
            <FilterCardHeader>
                <div>
                    <FilterTitle as={Link} href={`/settings/filters/${filter.id}`}>
                        {filter.title}
                    </FilterTitle>
                    {filter.expires_at && (
                        <ExpirationInfo style={isExpired ? { color: 'var(--red-7)' } : undefined}>
                            <ExpirationText expiresAt={filter.expires_at} />
                        </ExpirationInfo>
                    )}
                </div>
                <FilterBadge $action={filter.filter_action}>
                    {t(filter.filter_action as any)}
                </FilterBadge>
            </FilterCardHeader>

            {filter.keywords.length > 0 && (
                <FilterKeywords>
                    <strong>{filter.keywords.length} keyword{filter.keywords.length !== 1 ? 's' : ''}:</strong>{' '}
                    {keywordsPreview}
                    {hasMoreKeywords && '…'}
                </FilterKeywords>
            )}

            <FilterContexts>
                {filter.context.map((ctx) => (
                    <ContextTag key={ctx}>{t(`context.${ctx}` as any)}</ContextTag>
                ))}
            </FilterContexts>

            <FilterActions>
                <Button
                    variant="secondary"
                    size="small"
                    onClick={() => router.push(`/settings/filters/${filter.id}`)}
                >
                    <Edit size={16} />
                    {t('edit')}
                </Button>
                <Button
                    variant="danger"
                    size="small"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    <Trash2 size={16} />
                    {isDeleting ? t('deleting') : t('delete')}
                </Button>
            </FilterActions>
        </FilterCard>
    );
}

export function FiltersClient() {
    const router = useRouter();
    const { data: filters, isLoading, error } = useFilters();
    const t = useTranslations('settings.filtersPage');

    if (isLoading) {
        return (
            <FiltersContainer>
                <FiltersHeader>
                    <IconButton onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </IconButton>
                    <FiltersTitle>{t('title')}</FiltersTitle>
                </FiltersHeader>
                <Card padding="medium">
                    <TextSkeleton width="100%" height={80} style={{ marginBottom: 'var(--size-3)' }} />
                    <TextSkeleton width="100%" height={80} style={{ marginBottom: 'var(--size-3)' }} />
                    <TextSkeleton width="100%" height={80} />
                </Card>
            </FiltersContainer>
        );
    }

    if (error) {
        return (
            <FiltersContainer>
                <FiltersHeader>
                    <IconButton onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </IconButton>
                    <FiltersTitle>{t('title')}</FiltersTitle>
                </FiltersHeader>
                <Card padding="medium">
                    <EmptyState>
                        <p>{t('failedLoad')}</p>
                    </EmptyState>
                </Card>
            </FiltersContainer>
        );
    }

    return (
        <FiltersContainer>
            <FiltersHeader>
                <IconButton onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </IconButton>
                <FiltersTitle>{t('title')}</FiltersTitle>
                <Link href="/settings/filters/new" style={{ marginLeft: 'auto' }}>
                    <Button size="small">
                        <Plus size={16} />
                        {t('addFilter')}
                    </Button>
                </Link>
            </FiltersHeader>

            {!filters || filters.length === 0 ? (
                <Card padding="medium">
                    <EmptyState>
                        <p>{t('empty')}</p>
                        <p>
                            {t('emptyDesc')}
                        </p>
                        <Link href="/settings/filters/new">
                            <Button>
                                <Plus size={16} />
                                {t('createFirst')}
                            </Button>
                        </Link>
                    </EmptyState>
                </Card>
            ) : (
                <FiltersList>
                    {filters.map((filter) => (
                        <FilterCardItem key={filter.id} filter={filter} />
                    ))}
                </FiltersList>
            )}
        </FiltersContainer>
    );
}
