'use client';

import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useRef, useEffect, useLayoutEffect, useState, useMemo, useCallback } from 'react';
import { useWindowVirtualizer, type VirtualItem } from '@tanstack/react-virtual';
import { useQueryClient } from '@tanstack/react-query';
import { useInfiniteHomeTimeline, useCurrentAccount, prefillAccountCache } from '@/api';
import { PostCard } from './PostCard';
import { SuggestionsSection } from './SuggestionsSection';
import { PostCardSkeletonList, PostCardSkeleton, ProfilePillSkeleton } from '@/components/molecules';
import {
    EmojiText,
    Button,
    StickyHeaderContainer,
    StickyHeaderContent,
    StickyHeaderTitle,
    StickyHeaderSubtitle,
    StickyHeaderActions,
} from '@/components/atoms';
import { ScrollToTopButton } from '@/components/atoms/ScrollToTopButton';
import { Search } from 'lucide-react';
import { flattenAndUniqById } from '@/utils/fp';
import type { Status } from '@/types';
import { useWindowScrollDirection } from '@/hooks/useScrollDirection';

// Scroll restoration cache
interface ScrollState {
    offset: number;
    measurementsCache: VirtualItem[];
}
const scrollStateCache = new Map<string, ScrollState>();

// Cache key for home timeline
const SCROLL_CACHE_KEY = 'home-timeline';

// Index where suggestions should appear
const SUGGESTIONS_INSERT_INDEX = 5;

// Item types for mixed rendering
type ListItem =
    | { type: 'status'; data: Status }
    | { type: 'suggestions' }
    | { type: 'endIndicator' };

export const TimelinePage = observer(() => {
    const { data: statusPages, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteHomeTimeline();
    const { data: user, isLoading: isLoadingUser } = useCurrentAccount();
    const queryClient = useQueryClient();

    const listRef = useRef<HTMLDivElement>(null);
    const [scrollMargin, setScrollMargin] = useState(0);

    // Scroll direction detection for scroll-to-top button
    const { showScrollTop, hideScrollTop } = useWindowScrollDirection();

    const uniqueStatuses = useMemo(() => flattenAndUniqById(statusPages?.pages), [statusPages?.pages]);

    // Get cached state on initial render
    const [cachedState] = useState(() => scrollStateCache.get(SCROLL_CACHE_KEY));

    // Measure scroll margin from list element's position
    useLayoutEffect(() => {
        if (listRef.current) {
            setScrollMargin(listRef.current.offsetTop);
        }
    }, []);

    // Build mixed items array with suggestions inserted - memoized to prevent recreation
    const mixedItems = useMemo(() => {
        const items: ListItem[] = [];
        const insertIndex = Math.min(SUGGESTIONS_INSERT_INDEX, uniqueStatuses.length);

        for (let i = 0; i < uniqueStatuses.length; i++) {
            // Insert suggestions after N statuses
            if (i === insertIndex && uniqueStatuses.length > insertIndex) {
                items.push({ type: 'suggestions' });
            }
            items.push({ type: 'status', data: uniqueStatuses[i] });
        }
        // If we have fewer statuses than the insert index, add suggestions at the end
        if (uniqueStatuses.length > 0 && uniqueStatuses.length <= insertIndex) {
            items.push({ type: 'suggestions' });
        }

        // Include an extra item for the "end indicator" when we've reached the end
        const showEndIndicator = !hasNextPage && uniqueStatuses.length > 0 && !isFetchingNextPage;
        if (showEndIndicator) {
            items.push({ type: 'endIndicator' });
        }

        return items;
    }, [uniqueStatuses, hasNextPage, isFetchingNextPage]);

    const estimateSize = useCallback((index: number) => {
        const item = mixedItems[index];
        if (item?.type === 'endIndicator') return 60;
        if (item?.type === 'suggestions') return 300;
        return 250;
    }, [mixedItems]);

    const getItemKey = useCallback((index: number) => {
        const item = mixedItems[index];
        if (item?.type === 'status') return item.data.id;
        if (item?.type === 'suggestions') return 'suggestions-section';
        if (item?.type === 'endIndicator') return 'end-indicator';
        return index;
    }, [mixedItems]);

    const virtualizer = useWindowVirtualizer({
        count: mixedItems.length,
        estimateSize,
        getItemKey,
        overscan: 8,
        scrollMargin,
        initialOffset: cachedState?.offset,
        initialMeasurementsCache: cachedState?.measurementsCache,
    });

    const virtualItems = virtualizer.getVirtualItems();

    // Load more when reaching the end
    useEffect(() => {
        if (!virtualItems.length) return;

        const lastItem = virtualItems[virtualItems.length - 1];
        if (!lastItem) return;

        if (
            lastItem.index >= mixedItems.length - 5 &&
            hasNextPage &&
            !isFetchingNextPage
        ) {
            fetchNextPage();
        }
    }, [virtualItems, mixedItems.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Cache scroll state on unmount
    useEffect(() => {
        return () => {
            scrollStateCache.set(SCROLL_CACHE_KEY, {
                offset: virtualizer.scrollOffset ?? 0,
                measurementsCache: virtualizer.measurementsCache,
            });
        };
    }, [virtualizer]);

    const handleScrollToTop = () => {
        window.scrollTo(0, 0);
        hideScrollTop();
    };

    // Pre-populate account cache before navigation
    const handleProfileClick = () => {
        if (user) {
            prefillAccountCache(queryClient, user);
        }
    };

    // Loading state - only show if no cached data
    if (isLoading && uniqueStatuses.length === 0) {
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
                <ListContainer>
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
                        <Button>Trending</Button>
                    </Link>
                </EmptyContainer>
            </Container>
        );
    }

    return (
        <Container>
            {/* Sticky Header */}
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
                            <Link
                                href={`/@${user.acct}`}
                                className="profile-pill profile-pill-static"
                                onClick={handleProfileClick}
                            >
                                <img
                                    src={user.avatar}
                                    alt={user.display_name}
                                    className="profile-pill-avatar"
                                />
                                <span className="profile-pill-name text-truncate">
                                    <EmojiText text={user.display_name} emojis={user.emojis} />
                                </span>
                            </Link>
                        ) : (
                            <ProfilePillSkeleton />
                        )}
                    </StickyHeaderActions>
                </StickyHeaderContent>
            </StickyHeaderContainer>

            {/* Virtualized List */}
            <div ref={listRef}>
                <VirtualContent style={{ height: `${virtualizer.getTotalSize()}px` }}>
                    {virtualItems.map((virtualRow) => {
                        const item = mixedItems[virtualRow.index];
                        if (!item) return null;

                        return (
                            <VirtualItemWrapper
                                key={virtualRow.key}
                                data-index={virtualRow.index}
                                ref={virtualizer.measureElement}
                                className="window-virtual-item"
                                style={{
                                    transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                                }}
                            >
                                {item.type === 'endIndicator' ? (
                                    <EndIndicator>You've reached the end of your timeline</EndIndicator>
                                ) : item.type === 'suggestions' ? (
                                    <SuggestionsSection />
                                ) : (
                                    <PostCard status={item.data} style={{ marginBottom: 'var(--size-3)' }} />
                                )}
                            </VirtualItemWrapper>
                        );
                    })}
                </VirtualContent>

                {/* Loading indicator */}
                {isFetchingNextPage && (
                    <PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />
                )}
            </div>

            {/* Scroll to top button */}
            <ScrollToTopButton visible={showScrollTop} onClick={handleScrollToTop} />
        </Container>
    );
});

// Styled components
const Container = styled.div`
    max-width: 680px;
    margin: 0 auto;

    @media (max-width: 767px) {
        padding: 0 var(--size-2);
    }
`;

const Header = styled.div`
    background: var(--surface-1);
    padding: var(--size-4);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
`;

const Title = styled.h1`
    font-size: var(--font-size-fluid-2);
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

const VirtualContent = styled.div`
    width: 100%;
    position: relative;
`;

const VirtualItemWrapper = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    /* Prevent layout from affecting other elements (like bottom nav) */
    contain: layout style;
    /* Optimize transform rendering and create proper stacking context */
    will-change: transform;
`;

const EndIndicator = styled.div`
    text-align: center;
    padding: var(--size-4);
    color: var(--text-2);
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
