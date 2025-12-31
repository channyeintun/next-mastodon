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

const CONTEXT_LABELS: Record<string, string> = {
    home: 'Home',
    notifications: 'Notifications',
    public: 'Public',
    thread: 'Conversations',
    account: 'Profiles',
};

const ACTION_LABELS: Record<string, string> = {
    warn: 'Warn',
    hide: 'Hide',
    blur: 'Blur',
};

function formatExpiration(expiresAt: string | null): string | null {
    if (!expiresAt) return null;

    const expiresDate = new Date(expiresAt);
    const now = new Date();

    if (expiresDate < now) {
        return 'Expired';
    }

    const diffMs = expiresDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
        return `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
        return `Expires in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
        return `Expires in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
}

function FilterCardItem({ filter }: { filter: Filter }) {
    const router = useRouter();
    const deleteFilter = useDeleteFilter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete the filter "${filter.title}"?`)) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteFilter.mutateAsync(filter.id);
            toast.success('Filter deleted');
        } catch {
            toast.error('Failed to delete filter');
        } finally {
            setIsDeleting(false);
        }
    };

    const keywordsPreview = filter.keywords
        .slice(0, 5)
        .map((k) => k.keyword)
        .join(', ');
    const hasMoreKeywords = filter.keywords.length > 5;
    const expirationText = formatExpiration(filter.expires_at);
    const isExpired = filter.expires_at && new Date(filter.expires_at) < new Date();

    return (
        <FilterCard style={isExpired ? { opacity: 0.6 } : undefined}>
            <FilterCardHeader>
                <div>
                    <FilterTitle as={Link} href={`/settings/filters/${filter.id}`}>
                        {filter.title}
                    </FilterTitle>
                    {expirationText && (
                        <ExpirationInfo style={isExpired ? { color: 'var(--red-7)' } : undefined}>
                            {expirationText}
                        </ExpirationInfo>
                    )}
                </div>
                <FilterBadge $action={filter.filter_action}>
                    {ACTION_LABELS[filter.filter_action] || filter.filter_action}
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
                    <ContextTag key={ctx}>{CONTEXT_LABELS[ctx] || ctx}</ContextTag>
                ))}
            </FilterContexts>

            <FilterActions>
                <Button
                    variant="secondary"
                    size="small"
                    onClick={() => router.push(`/settings/filters/${filter.id}`)}
                >
                    <Edit size={16} />
                    Edit
                </Button>
                <Button
                    variant="danger"
                    size="small"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    <Trash2 size={16} />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
            </FilterActions>
        </FilterCard>
    );
}

export function FiltersClient() {
    const router = useRouter();
    const { data: filters, isLoading, error } = useFilters();

    if (isLoading) {
        return (
            <FiltersContainer>
                <FiltersHeader>
                    <IconButton onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </IconButton>
                    <FiltersTitle>Filters</FiltersTitle>
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
                    <FiltersTitle>Filters</FiltersTitle>
                </FiltersHeader>
                <Card padding="medium">
                    <EmptyState>
                        <p>Failed to load filters. Please try again.</p>
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
                <FiltersTitle>Filters</FiltersTitle>
                <Link href="/settings/filters/new" style={{ marginLeft: 'auto' }}>
                    <Button size="small">
                        <Plus size={16} />
                        Add filter
                    </Button>
                </Link>
            </FiltersHeader>

            {!filters || filters.length === 0 ? (
                <Card padding="medium">
                    <EmptyState>
                        <p>You haven&apos;t created any filters yet.</p>
                        <p>
                            Filters allow you to hide or blur posts containing specific words or phrases.
                        </p>
                        <Link href="/settings/filters/new">
                            <Button>
                                <Plus size={16} />
                                Create your first filter
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
