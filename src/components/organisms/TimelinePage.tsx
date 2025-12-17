'use client';

import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { useWindowVirtualizer, type VirtualItem } from '@tanstack/react-virtual';
import { useInfiniteHomeTimeline, useCurrentAccount } from '@/api';
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
    | { type: 'suggestions' };

export const TimelinePage = observer(() => {
    const { data: statusPages, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteHomeTimeline();
    const { data: user, isLoading: isLoadingUser } = useCurrentAccount();

    const headerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const [scrollMargin, setScrollMargin] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const uniqueStatuses = flattenAndUniqById(statusPages?.pages);

    // Get cached state on initial render
    const [cachedState] = useState(() => scrollStateCache.get(SCROLL_CACHE_KEY));

    // Measure header height for scrollMargin
    useLayoutEffect(() => {
        if (headerRef.current) {
            setScrollMargin(headerRef.current.offsetHeight);
        }
    }, []);

    // Build mixed items array with suggestions inserted
    const mixedItems: ListItem[] = [];
    const insertIndex = Math.min(SUGGESTIONS_INSERT_INDEX, uniqueStatuses.length);

    for (let i = 0; i < uniqueStatuses.length; i++) {
        // Insert suggestions after N statuses
        if (i === insertIndex && uniqueStatuses.length > insertIndex) {
            mixedItems.push({ type: 'suggestions' });
        }
        mixedItems.push({ type: 'status', data: uniqueStatuses[i] });
    }
    // If we have fewer statuses than the insert index, add suggestions at the end
    if (uniqueStatuses.length > 0 && uniqueStatuses.length <= insertIndex) {
        mixedItems.push({ type: 'suggestions' });
    }

    const virtualizer = useWindowVirtualizer({
        count: mixedItems.length,
        estimateSize: (index) => {
            const item = mixedItems[index];
            // Suggestions section is typically taller
            return item?.type === 'suggestions' ? 300 : 200;
        },
        overscan: 5,
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

    // Track scroll position for scroll-to-top button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <Container>
            {/* Sticky Header */}
            <div ref={headerRef}>
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
            </div>

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
                                style={{
                                    transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                                }}
                            >
                                {item.type === 'suggestions' ? (
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

                {/* End of list indicator */}
                {!hasNextPage && uniqueStatuses.length > 0 && (
                    <EndIndicator>You've reached the end of your timeline</EndIndicator>
                )}
            </div>

            {/* Scroll to top button */}
            <ScrollToTopButton visible={showScrollTop} onClick={handleScrollToTop} />
        </Container>
    );
});

// Styled components
const Container = styled.div`
    max-width: 600px;
    margin: 0 auto;

    @media (max-width: 767px) {
        padding: 0 var(--size-2);
    }
`;

const Header = styled.div`
    background: var(--surface-1);
    padding: var(--size-4) var(--size-2);
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

const VirtualContent = styled.div`
    width: 100%;
    position: relative;
`;

const VirtualItemWrapper = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
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
