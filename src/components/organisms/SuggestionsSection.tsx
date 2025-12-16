'use client';

import styled from '@emotion/styled';
import Link from 'next/link';
import { useRef, useCallback, useState } from 'react';
import { X, Info, Check } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useSuggestions, useDeleteSuggestion, useRelationships, useFollowAccount, useUnfollowAccount } from '@/api';
import { Avatar, Button, EmojiText } from '@/components/atoms';
import { useAuthStore } from '@/hooks/useStores';
import type { Field } from '@/types';

const SUGGESTIONS_DISMISSED_KEY = 'mastodon_suggestions_dismissed';

interface SuggestionsSectionProps {
    /** Maximum number of suggestions to display */
    limit?: number;
}

// Get localized source label based on suggestion source
const getSourceLabel = (sources: string[]): { label: string; hint: string } | null => {
    const source = sources[0];
    switch (source) {
        case 'friends_of_friends':
        case 'similar_to_recently_followed':
            return {
                label: 'Personalized',
                hint: 'Based on accounts you follow'
            };
        case 'featured':
            return {
                label: 'Staff pick',
                hint: 'Hand-picked by the team'
            };
        case 'most_followed':
        case 'most_interactions':
            return {
                label: 'Popular',
                hint: 'Popular on this instance'
            };
        default:
            return null;
    }
};

// Get first verified field from account fields
const getVerifiedField = (fields?: Field[]): Field | null => {
    if (!fields) return null;
    return fields.find(field => field.verified_at !== null) ?? null;
};

// Extract display URL from HTML value
const extractLinkText = (html: string): string => {
    // Remove HTML tags and decode entities
    const text = html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&');
    // Remove protocol prefix for cleaner display
    return text.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
};

export const SuggestionsSection = observer(({ limit = 10 }: SuggestionsSectionProps) => {
    const authStore = useAuthStore();
    const { data: suggestions, isLoading, isError } = useSuggestions({ limit });
    const deleteSuggestion = useDeleteSuggestion();
    const followMutation = useFollowAccount();
    const unfollowMutation = useUnfollowAccount();

    const scrollRef = useRef<HTMLDivElement>(null);

    // Dismissed state with localStorage persistence
    const [isDismissed, setIsDismissed] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(SUGGESTIONS_DISMISSED_KEY) === 'true';
    });

    const handleDismiss = useCallback(() => {
        localStorage.setItem(SUGGESTIONS_DISMISSED_KEY, 'true');
        setIsDismissed(true);
    }, []);

    // Get relationships for all suggested accounts
    const accountIds = suggestions?.map(s => s.account.id) ?? [];
    const { data: relationships } = useRelationships(accountIds);

    // Build a map of accountId -> relationship for quick lookup
    const relationshipMap = new Map(relationships?.map(r => [r.id, r]));

    const handleScrollLeft = useCallback(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }, []);

    const handleScrollRight = useCallback(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }, []);

    // Don't show if dismissed or not authenticated
    if (isDismissed || !authStore.isAuthenticated) {
        return null;
    }

    if (isLoading) {
        return (
            <Container>
                <Header>
                    <Title>Who to follow</Title>
                </Header>
                <ScrollContainer>
                    <ScrollContent>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <CardSkeleton key={i}>
                                <div /> {/* dismiss placeholder */}
                                <AvatarSkeleton className="skeleton" />
                                <NameSkeleton className="skeleton" />
                                <HandleSkeleton className="skeleton" />
                                <BadgeSkeleton className="skeleton" />
                                <ButtonSkeleton className="skeleton" />
                            </CardSkeleton>
                        ))}
                    </ScrollContent>
                </ScrollContainer>
            </Container>
        );
    }

    if (isError || !suggestions || suggestions.length === 0) {
        return null;
    }

    return (
        <Container>
            <Header>
                <Title>Who to follow</Title>
                <HeaderActions>
                    <ViewAllLink href="/explore/suggestions">View all</ViewAllLink>
                    <DismissSectionButton
                        onClick={handleDismiss}
                        title="Dismiss suggestions"
                        aria-label="Dismiss suggestions"
                    >
                        <X size={18} />
                    </DismissSectionButton>
                </HeaderActions>
            </Header>
            <BodyWrapper>
                <ScrollContainer ref={scrollRef} id="suggestions-scroller">
                    <NavButton className="previous" onClick={handleScrollLeft} aria-label="Previous item" title="Previous item">
                        <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none">
                            <path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </NavButton>
                    <ScrollContent>
                        {suggestions.map((suggestion) => {
                            const relationship = relationshipMap.get(suggestion.account.id);
                            const isFollowing = relationship?.following || relationship?.requested;
                            // Only show loading for the specific card being followed/unfollowed
                            const isLoading =
                                (followMutation.isPending && followMutation.variables === suggestion.account.id) ||
                                (unfollowMutation.isPending && unfollowMutation.variables === suggestion.account.id);
                            const verifiedField = getVerifiedField(suggestion.account.fields);
                            const sourceInfo = getSourceLabel(suggestion.sources);

                            return (
                                <Card key={suggestion.account.id}>
                                    <DismissButton
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            deleteSuggestion.mutate(suggestion.account.id);
                                        }}
                                        title="Don't show again"
                                        disabled={deleteSuggestion.isPending}
                                    >
                                        <X size={14} />
                                    </DismissButton>

                                    <CardLink href={`/@${suggestion.account.acct}`}>
                                        <Avatar
                                            src={suggestion.account.avatar}
                                            alt={suggestion.account.display_name || suggestion.account.username}
                                            size="large"
                                        />
                                    </CardLink>

                                    <CardLink href={`/@${suggestion.account.acct}`}>
                                        <CardName>
                                            <EmojiText
                                                text={suggestion.account.display_name || suggestion.account.username}
                                                emojis={suggestion.account.emojis}
                                            />
                                        </CardName>
                                    </CardLink>

                                    <CardLink href={`/@${suggestion.account.acct}`}>
                                        <CardHandle>@{suggestion.account.acct}</CardHandle>
                                    </CardLink>

                                    <BadgeWrapper>
                                        {verifiedField ? (
                                            <VerifiedBadge title={`Verified ${verifiedField.name}`}>
                                                <Check size={12} />
                                                <EllipsisText>{extractLinkText(verifiedField.value)}</EllipsisText>
                                            </VerifiedBadge>
                                        ) : sourceInfo ? (
                                            <SourceLabel title={sourceInfo.hint}>
                                                <Info size={12} />
                                                {sourceInfo.label}
                                            </SourceLabel>
                                        ) : null}
                                    </BadgeWrapper>

                                    <Button
                                        variant={isFollowing ? 'secondary' : 'primary'}
                                        size="small"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (isFollowing) {
                                                unfollowMutation.mutate(suggestion.account.id);
                                            } else {
                                                followMutation.mutate(suggestion.account.id);
                                            }
                                        }}
                                        disabled={isLoading}
                                        isLoading={isLoading}
                                    >
                                        {relationship?.requested ? 'Requested' : isFollowing ? 'Following' : 'Follow'}
                                    </Button>
                                </Card>
                            );
                        })}
                    </ScrollContent>
                    <NavButton className="next" onClick={handleScrollRight} aria-label="Next item" title="Next item">
                        <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none">
                            <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </NavButton>
                </ScrollContainer>
            </BodyWrapper>
        </Container>
    );
});

// Styled components with scroll state query support
const Container = styled.div`
    padding-bottom: var(--size-4);
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--size-4) var(--size-4) var(--size-2);
`;

const Title = styled.h3`
    font-size: var(--font-size-3);
    font-weight: 600;
    color: var(--text-1);
    margin: 0;
`;

const ViewAllLink = styled(Link)`
    font-size: var(--font-size-1);
    color: var(--blue-6);
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: var(--size-2);
`;

const DismissSectionButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--size-1);
    border: none;
    background: transparent;
    color: var(--text-3);
    cursor: pointer;
    border-radius: var(--radius-round);
    transition: all 0.2s ease;

    &:hover {
        background: var(--surface-3);
        color: var(--text-1);
    }
`;

const BodyWrapper = styled.div`
    position: relative;
    isolation: isolate;
`;

const ScrollContainer = styled.div`
    display: flex;
    align-items: center;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    /* Enable scroll state container queries */
    container-type: scroll-state;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const ScrollContent = styled.div`
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 200px;
    grid-template-rows: auto auto auto auto auto auto; /* dismiss, avatar, name, acct, badge, button */
    gap: var(--size-3);
`;

const Card = styled.div`
    position: relative;
    display: grid;
    grid-template-rows: subgrid;
    grid-row: span 6;
    justify-items: center;
    gap: var(--size-2);
    padding: var(--size-4);
    background: var(--surface-2);
    border-radius: var(--radius-3);
    scroll-snap-align: start;
`;

const CardLink = styled(Link)`
    display: contents;
    text-decoration: none;
    color: inherit;
`;

const CardName = styled.div`
    font-weight: 600;
    font-size: var(--font-size-2);
    color: var(--text-1);
    text-align: center;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const CardHandle = styled.div`
    font-size: var(--font-size-1);
    color: var(--text-3);
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const SourceLabel = styled.div`
    display: flex;
    align-items: center;
    gap: var(--size-1);
    font-size: var(--font-size-0);
    color: var(--blue-6);
    cursor: help;

    svg {
        flex-shrink: 0;
    }
`;

const VerifiedBadge = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--size-1);
    font-size: var(--font-size-0);
    color: var(--green-6);
    cursor: help;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    svg {
        flex-shrink: 0;
    }
`;

const BadgeWrapper = styled.div`
    min-height: 1em; /* Reserve space even when empty for grid alignment */
    display: flex;
    justify-content: center;
    width: 100%;
    min-width: 0;
    overflow: hidden;
`;

const EllipsisText = styled.span`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const DismissButton = styled.button`
    position: absolute;
    top: var(--size-2);
    right: var(--size-2);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--size-1);
    border: none;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    cursor: pointer;
    border-radius: var(--radius-round);
    transition: background 0.2s;
    z-index: 1;

    &:hover {
        background: rgba(0, 0, 0, 0.7);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const NavButton = styled.button`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    padding: 0.75rem;
    border: none;
    border-radius: var(--radius-round);
    background: var(--surface-2);
    color: var(--text-2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: scale 0.2s ease, background 0.2s ease, opacity 0.2s ease, visibility 0.2s ease;
    z-index: 2;

    svg {
        width: 100%;
        height: 100%;
    }

    &:hover {
        scale: 1.07;
        background: var(--surface-3);
    }

    &:active {
        scale: 1.03;
    }

    /* Previous button: positioned at left, hidden by default (at start position) */
    &.previous {
        left: var(--size-2);
        /* Default: hidden (at start, can't scroll left) */
        visibility: hidden;
        opacity: 0;
        pointer-events: none;
    }

    /* Next button: positioned at right, visible by default (can scroll right initially) */
    &.next {
        right: var(--size-2);
        /* Default: visible (can scroll right initially) */
        visibility: visible;
        opacity: 1;
    }

    /* Hide on mobile */
    @media (max-width: 768px) {
        display: none;
    }

    /* Fallback: show both buttons when scroll state queries are NOT supported */
    @supports not (container-type: scroll-state) {
        &.previous,
        &.next {
            visibility: visible;
            opacity: 1;
            pointer-events: auto;
        }
    }

    /* When scroll-state IS supported, use container queries */
    @supports (container-type: scroll-state) {
        /* Show previous when can scroll left (has scrolled past start) */
        @container scroll-state(scrollable: left) {
            &.previous {
                visibility: visible;
                opacity: 1;
                pointer-events: auto;
            }
        }

        /* Hide next when cannot scroll right (at end) */
        @container not scroll-state(scrollable: right) {
            &.next {
                visibility: hidden;
                opacity: 0;
                pointer-events: none;
            }
        }
    }
`;

const CardSkeleton = styled.div`
    display: grid;
    grid-template-rows: subgrid;
    grid-row: span 6;
    justify-items: center;
    gap: var(--size-2);
    padding: var(--size-4);
    background: var(--surface-2);
    border-radius: var(--radius-3);
`;

const AvatarSkeleton = styled.div`
    width: 64px;
    height: 64px;
    border-radius: 50%;
`;

const NameSkeleton = styled.div`
    width: 100px;
    height: 16px;
    border-radius: var(--radius-1);
`;

const HandleSkeleton = styled.div`
    width: 80px;
    height: 12px;
    border-radius: var(--radius-1);
`;

const ButtonSkeleton = styled.div`
    width: 72px;
    height: 32px;
    border-radius: var(--radius-2);
    margin-top: var(--size-2);
`;

const BadgeSkeleton = styled.div`
    width: 60px;
    height: 12px;
    border-radius: var(--radius-1);
`;
