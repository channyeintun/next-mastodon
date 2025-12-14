'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { ArrowLeft, Bell } from 'lucide-react';
import { NotificationRequestCard } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { IconButton } from '@/components/atoms';
import { useNotificationRequests } from '@/api';
import { useAuthStore } from '@/hooks/useStores';
import type { NotificationRequest } from '@/types';

export default function NotificationRequestsPage() {
    const router = useRouter();
    const authStore = useAuthStore();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useNotificationRequests();

    // Redirect if not authenticated
    useEffect(() => {
        if (!authStore.isAuthenticated) {
            router.push('/');
        }
    }, [authStore.isAuthenticated, router]);

    if (!authStore.isAuthenticated) {
        return null;
    }

    // Flatten pages into single array
    const allRequests: NotificationRequest[] = data?.pages.flatMap(page => page.data) ?? [];

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return (
        <div className="full-height-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Header>
                <IconButton onClick={() => router.back()} aria-label="Go back">
                    <ArrowLeft size={20} />
                </IconButton>
                <HeaderTitle>Filtered notifications</HeaderTitle>
            </Header>

            {isLoading && (
                <EmptyState>
                    <LoadingText>Loading...</LoadingText>
                </EmptyState>
            )}

            {isError && (
                <EmptyState>
                    <ErrorText>Error: {error?.message}</ErrorText>
                </EmptyState>
            )}

            {!isLoading && !isError && allRequests.length === 0 && (
                <EmptyState>
                    <Bell size={48} strokeWidth={1.5} />
                    <EmptyTitle>All caught up!</EmptyTitle>
                    <EmptyDescription>
                        No filtered notifications to review.
                    </EmptyDescription>
                </EmptyState>
            )}

            {!isLoading && !isError && allRequests.length > 0 && (
                <VirtualizedList<NotificationRequest>
                    items={allRequests}
                    renderItem={(request) => (
                        <NotificationRequestCard
                            request={request}
                            style={{ marginBottom: 'var(--size-2)' }}
                        />
                    )}
                    getItemKey={(request) => request.id}
                    hasMore={hasNextPage}
                    isLoadingMore={isFetchingNextPage}
                    onLoadMore={handleLoadMore}
                    loadingIndicator={<div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--size-4)' }}><div className="spinner" /></div>}
                    endIndicator="No more filtered notifications"
                />
            )}
        </div>
    );
}

// Styled components
const Header = styled.header`
    display: flex;
    align-items: center;
    gap: var(--size-3);
    padding: var(--size-3) var(--size-4);
    margin-bottom: var(--size-4);
    border-bottom: 1px solid var(--surface-3);
    background: var(--surface-1);
    position: sticky;
    top: 0;
    z-index: 10;
`;

const HeaderTitle = styled.h1`
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-6);
    margin: 0;
`;

const EmptyState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: var(--size-8);
    color: var(--text-2);
    text-align: center;
    gap: var(--size-3);
`;

const EmptyTitle = styled.h2`
    font-size: var(--font-size-4);
    font-weight: var(--font-weight-6);
    margin: 0;
    color: var(--text-1);
`;

const EmptyDescription = styled.p`
    font-size: var(--font-size-1);
    margin: 0;
    max-width: 300px;
`;

const LoadingText = styled.p`
    font-size: var(--font-size-1);
`;

const ErrorText = styled.p`
    font-size: var(--font-size-1);
    color: var(--red-6);
`;
