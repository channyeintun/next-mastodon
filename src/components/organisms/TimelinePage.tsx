'use client';

import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useInfiniteHomeTimeline, useCurrentAccount } from '@/api';
import { PostCard } from './PostCard';
import { PostCardSkeletonList, PostCardSkeleton, ProfilePillSkeleton } from '@/components/molecules';
import { VirtualizedList } from './VirtualizedList';
import {
    EmojiText,
    Button,
    EmptyState,
    StickyHeaderContainer,
    StickyHeaderContent,
    StickyHeaderTitle,
    StickyHeaderSubtitle,
    StickyHeaderActions,
} from '@/components/atoms';
import { Search } from 'lucide-react';
import { flattenAndUniqById } from '@/utils/fp';
import type { Status } from '@/types';

export const TimelinePage = observer(() => {
    const { data: statusPages, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteHomeTimeline();
    const { data: user, isLoading: isLoadingUser } = useCurrentAccount();

    const uniqueStatuses = flattenAndUniqById(statusPages?.pages);

    // Loading state
    if (isLoading) {
        return (
            <Container>
                <Header>
                    <div>
                        <Title>Home</Title>
                        <Subtitle>Your personal timeline</Subtitle>
                    </div>
                    <HeaderActions>
                        <SearchLink href="/search">
                            <Search size={20} />
                        </SearchLink>
                        <ProfilePillSkeleton />
                    </HeaderActions>
                </Header>
                <ListContainer className="virtualized-list-container">
                    <PostCardSkeletonList count={3} />
                </ListContainer>
            </Container>
        );
    }

    // Error state
    if (isError) {
        return (
            <Container>
                <Header>
                    <div>
                        <Title>Home</Title>
                        <Subtitle>Your personal timeline</Subtitle>
                    </div>
                </Header>
                <ErrorContainer>
                    <ErrorTitle>Error loading timeline</ErrorTitle>
                    <ErrorMessage>Please check your connection and try again.</ErrorMessage>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </ErrorContainer>
            </Container>
        );
    }

    // Empty state
    if (!isLoading && uniqueStatuses.length === 0) {
        return (
            <Container>
                <Header>
                    <div>
                        <Title>Home</Title>
                        <Subtitle>Your personal timeline</Subtitle>
                    </div>
                </Header>
                <EmptyContainer>
                    <EmptyTitle>Your timeline is empty</EmptyTitle>
                    <EmptyMessage>
                        Follow some people to see their posts here.
                    </EmptyMessage>
                    <Link href="/explore">
                        <Button>Explore</Button>
                    </Link>
                </EmptyContainer>
            </Container>
        );
    }

    return (
        <Container className="full-height-container">
            {/* Virtual scrolling container with scroll restoration */}
            <VirtualizedList<Status>
                items={uniqueStatuses}
                renderItem={(status) => (
                    <PostCard status={status} style={{ marginBottom: 'var(--size-3)' }} />
                )}
                getItemKey={(status) => status.id}
                estimateSize={300}
                overscan={5}
                onLoadMore={fetchNextPage}
                isLoadingMore={isFetchingNextPage}
                hasMore={hasNextPage}
                loadMoreThreshold={1}
                height="auto"
                style={{ flex: 1, minHeight: 0 }}
                scrollRestorationKey="home-timeline"
                loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
                endIndicator="You've reached the end of your timeline"
                emptyState={<EmptyState title="No posts yet" description="Follow some people to see their posts here." />}
                header={
                    <StickyHeaderContainer>
                        <StickyHeaderContent>
                            <StickyHeaderTitle>
                                <h1>Home</h1>
                                <StickyHeaderSubtitle>Your personal timeline</StickyHeaderSubtitle>
                            </StickyHeaderTitle>
                            <StickyHeaderActions>
                                <SearchLink href="/search">
                                    <Search size={20} />
                                </SearchLink>
                                {!isLoadingUser && user ? (
                                    <Link href={`/@${user.acct}`} className="profile-pill profile-pill-static">
                                        <img
                                            src={user.avatar}
                                            alt={user.display_name}
                                            className="profile-pill-avatar"
                                        />
                                        <span className="profile-pill-name">
                                            <EmojiText text={user.display_name} emojis={user.emojis} />
                                        </span>
                                    </Link>
                                ) : (
                                    <ProfilePillSkeleton />
                                )}
                            </StickyHeaderActions>
                        </StickyHeaderContent>
                    </StickyHeaderContainer>
                }
            />
        </Container>
    );
});

// Styled components
const Container = styled.div`
    max-width: 600px;
    margin: 0 auto;
`;

const Header = styled.div`
    background: var(--surface-1);
    z-index: 10;
    padding: var(--size-4) 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
`;

const Title = styled.h1`
    font-size: var(--font-size-5);
    margin-bottom: var(--size-1);
`;

const Subtitle = styled.p`
    font-size: var(--font-size-0);
    color: var(--text-2);
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: var(--size-2);
`;

const SearchLink = styled(Link)`
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--size-7);
    height: var(--size-7);
    border-radius: 50%;
    color: var(--text-2);
    transition: all 0.2s ease;

    &:hover {
        opacity: 0.8;
    }
`;

const ListContainer = styled.div`
    flex: 1;
    overflow: auto;
`;

const ErrorContainer = styled.div`
    text-align: center;
    margin-top: var(--size-8);
`;

const ErrorTitle = styled.h2`
    color: var(--red-6);
    margin-bottom: var(--size-3);
`;

const ErrorMessage = styled.p`
    color: var(--text-2);
    margin-bottom: var(--size-4);
`;

const EmptyContainer = styled.div`
    text-align: center;
    margin-top: var(--size-8);
`;

const EmptyTitle = styled.h2`
    margin-bottom: var(--size-3);
`;

const EmptyMessage = styled.p`
    color: var(--text-2);
    margin-bottom: var(--size-4);
`;
