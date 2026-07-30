'use client';

import { use } from 'react';
// (lucide icons removed);
import { useFilter } from '@/api/queries';
import { BackButton, Card, TextSkeleton } from '@/components/atoms';
import { FilterForm } from '../FilterForm';
import { FiltersContainer, FiltersHeader, FiltersTitle, EmptyState } from '../FilterStyles';

interface EditFilterPageProps {
    params: Promise<{ id: string }>;
}

export default function EditFilterPage({ params }: EditFilterPageProps) {
    const { id } = use(params);
    const { data: filter, isLoading, error } = useFilter(id);

    if (isLoading) {
        return (
            <FiltersContainer>
                <FiltersHeader>
                    <BackButton />
                    <FiltersTitle>Edit filter</FiltersTitle>
                </FiltersHeader>
                <Card padding="medium">
                    <TextSkeleton width="100%" height={40} style={{ marginBottom: 'var(--size-4)' }} />
                    <TextSkeleton width="100%" height={40} style={{ marginBottom: 'var(--size-4)' }} />
                    <TextSkeleton width="100%" height={80} style={{ marginBottom: 'var(--size-4)' }} />
                    <TextSkeleton width="100%" height={120} />
                </Card>
            </FiltersContainer>
        );
    }

    if (error || !filter) {
        return (
            <FiltersContainer>
                <FiltersHeader>
                    <BackButton />
                    <FiltersTitle>Edit filter</FiltersTitle>
                </FiltersHeader>
                <Card padding="medium">
                    <EmptyState>
                        <p>Filter not found or failed to load.</p>
                    </EmptyState>
                </Card>
            </FiltersContainer>
        );
    }

    return <FilterForm filter={filter} isEdit />;
}
