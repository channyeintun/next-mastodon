'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useFilter } from '@/api/queries';
import { IconButton, Card, TextSkeleton } from '@/components/atoms';
import { FilterForm } from '../FilterForm';
import { FiltersContainer, FiltersHeader, FiltersTitle, EmptyState } from '../FilterStyles';

interface EditFilterPageProps {
    params: Promise<{ id: string }>;
}

export default function EditFilterPage({ params }: EditFilterPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { data: filter, isLoading, error } = useFilter(id);

    if (isLoading) {
        return (
            <FiltersContainer>
                <FiltersHeader>
                    <IconButton onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </IconButton>
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
                    <IconButton onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </IconButton>
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
