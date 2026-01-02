import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from '@emotion/styled';
import { ArrowLeft, Plus, Trash2, Edit } from 'lucide-react';
import { useFilters } from '@/api/queries';
import { useDeleteFilter } from '@/api/mutations';
import { IconButton, Button, Card, TextSkeleton } from '@/components/atoms';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layouts/MainLayout';
import type { Filter } from '@/types/mastodon';

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
    if (expiresDate < now) return 'Expired';
    const diffMs = expiresDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffDays > 0) return `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    else if (diffHours > 0) return `Expires in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    else return `Expires in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
}

function FilterCardItem({ filter }: { filter: Filter }) {
    const router = useRouter();
    const deleteFilter = useDeleteFilter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete the filter "${filter.title}"?`)) return;
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

    const keywordsPreview = filter.keywords.slice(0, 5).map((k) => k.keyword).join(', ');
    const hasMoreKeywords = filter.keywords.length > 5;
    const expirationText = formatExpiration(filter.expires_at);
    const isExpired = filter.expires_at && new Date(filter.expires_at) < new Date();

    return (
        <FilterCard style={isExpired ? { opacity: 0.6 } : undefined}>
            <FilterCardHeader>
                <div>
                    <FilterTitle as={Link} href={`/settings/filters/${filter.id}`}>{filter.title}</FilterTitle>
                    {expirationText && (
                        <ExpirationInfo style={isExpired ? { color: 'var(--red-7)' } : undefined}>{expirationText}</ExpirationInfo>
                    )}
                </div>
                <FilterBadge $action={filter.filter_action}>{ACTION_LABELS[filter.filter_action] || filter.filter_action}</FilterBadge>
            </FilterCardHeader>

            {filter.keywords.length > 0 && (
                <FilterKeywords>
                    <strong>{filter.keywords.length} keyword{filter.keywords.length !== 1 ? 's' : ''}:</strong> {keywordsPreview}{hasMoreKeywords && '…'}
                </FilterKeywords>
            )}

            <FilterContexts>
                {filter.context.map((ctx) => <ContextTag key={ctx}>{CONTEXT_LABELS[ctx] || ctx}</ContextTag>)}
            </FilterContexts>

            <FilterActions>
                <Button variant="secondary" size="small" onClick={() => router.push(`/settings/filters/${filter.id}`)}>
                    <Edit size={16} />Edit
                </Button>
                <Button variant="danger" size="small" onClick={handleDelete} disabled={isDeleting}>
                    <Trash2 size={16} />{isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
            </FilterActions>
        </FilterCard>
    );
}

export default function FiltersPage() {
    const router = useRouter();
    const { data: filters, isLoading, error } = useFilters();

    if (isLoading) {
        return (
            <MainLayout>
                <Head><title>Filters - Mastodon</title></Head>
                <FiltersContainer>
                    <FiltersHeader>
                        <IconButton onClick={() => router.back()}><ArrowLeft size={20} /></IconButton>
                        <FiltersTitle>Filters</FiltersTitle>
                    </FiltersHeader>
                    <Card padding="medium">
                        <TextSkeleton width="100%" height={80} style={{ marginBottom: 'var(--size-3)' }} />
                        <TextSkeleton width="100%" height={80} style={{ marginBottom: 'var(--size-3)' }} />
                        <TextSkeleton width="100%" height={80} />
                    </Card>
                </FiltersContainer>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <Head><title>Filters - Mastodon</title></Head>
                <FiltersContainer>
                    <FiltersHeader>
                        <IconButton onClick={() => router.back()}><ArrowLeft size={20} /></IconButton>
                        <FiltersTitle>Filters</FiltersTitle>
                    </FiltersHeader>
                    <Card padding="medium">
                        <EmptyState><p>Failed to load filters. Please try again.</p></EmptyState>
                    </Card>
                </FiltersContainer>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Head><title>Filters - Mastodon</title></Head>
            <FiltersContainer>
                <FiltersHeader>
                    <IconButton onClick={() => router.back()}><ArrowLeft size={20} /></IconButton>
                    <FiltersTitle>Filters</FiltersTitle>
                    <Link href="/settings/filters/new" style={{ marginLeft: 'auto' }}>
                        <Button size="small"><Plus size={16} />Add filter</Button>
                    </Link>
                </FiltersHeader>

                {!filters || filters.length === 0 ? (
                    <Card padding="medium">
                        <EmptyState>
                            <p>You haven&apos;t created any filters yet.</p>
                            <p>Filters allow you to hide or blur posts containing specific words or phrases.</p>
                            <Link href="/settings/filters/new">
                                <Button><Plus size={16} />Create your first filter</Button>
                            </Link>
                        </EmptyState>
                    </Card>
                ) : (
                    <FiltersList>
                        {filters.map((filter) => <FilterCardItem key={filter.id} filter={filter} />)}
                    </FiltersList>
                )}
            </FiltersContainer>
        </MainLayout>
    );
}

// Styled Components
const FiltersContainer = styled.div`max-width: 680px; margin: 0 auto; padding: var(--size-4) var(--size-2);`;
const FiltersHeader = styled.div`display: flex; align-items: center; gap: var(--size-3); margin-bottom: var(--size-4);`;
const FiltersTitle = styled.h1`font-size: var(--font-size-4); font-weight: var(--font-weight-6); color: var(--text-1); flex: 1;`;
const FiltersList = styled.div`display: flex; flex-direction: column; gap: var(--size-3);`;
const FilterCard = styled.div`background: var(--surface-2); border-radius: var(--radius-2); padding: var(--size-4); border: 1px solid var(--surface-3);`;
const FilterCardHeader = styled.div`display: flex; align-items: flex-start; justify-content: space-between; gap: var(--size-3); margin-bottom: var(--size-3);`;
const FilterTitle = styled.a`font-size: var(--font-size-2); font-weight: var(--font-weight-6); color: var(--text-1); text-decoration: none; cursor: pointer; &:hover { text-decoration: underline; color: var(--brand); }`;
const FilterBadge = styled.span<{ $action: 'warn' | 'hide' | 'blur' }>`display: inline-flex; align-items: center; padding: var(--size-1) var(--size-2); border-radius: var(--radius-1); font-size: var(--font-size-0); font-weight: var(--font-weight-5); text-transform: capitalize; background: ${({ $action }) => $action === 'warn' ? 'var(--yellow-3)' : $action === 'hide' ? 'var(--red-3)' : $action === 'blur' ? 'var(--blue-3)' : 'var(--surface-3)'}; color: ${({ $action }) => $action === 'warn' ? 'var(--yellow-9)' : $action === 'hide' ? 'var(--red-9)' : $action === 'blur' ? 'var(--blue-9)' : 'var(--text-2)'};`;
const FilterKeywords = styled.div`font-size: var(--font-size-1); color: var(--text-3); margin-bottom: var(--size-3); strong { color: var(--text-2); }`;
const FilterContexts = styled.div`display: flex; flex-wrap: wrap; gap: var(--size-1); margin-bottom: var(--size-3);`;
const ContextTag = styled.span`display: inline-flex; align-items: center; padding: var(--size-1) var(--size-2); background: var(--surface-3); border-radius: var(--radius-1); font-size: var(--font-size-0); color: var(--text-2);`;
const FilterActions = styled.div`display: flex; justify-content: flex-end; gap: var(--size-2); padding-top: var(--size-3); border-top: 1px solid var(--surface-3);`;
const EmptyState = styled.div`text-align: center; padding: var(--size-8) var(--size-4); color: var(--text-2); p { margin-bottom: var(--size-4); }`;
const ExpirationInfo = styled.span`font-size: var(--font-size-0); color: var(--text-3); margin-left: var(--size-2);`;
