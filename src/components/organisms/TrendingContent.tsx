'use client';

import styled from '@emotion/styled';
import Link from 'next/link';
import { Activity, type ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { Check, Info, X, Hash, Newspaper, FileText, LogIn, UserPlus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useInfiniteTrendingStatuses, useInfiniteTrendingTags, useInfiniteTrendingLinks, useSuggestions, useDeleteSuggestion, useRelationships, useFollowAccount, useUnfollowAccount, prefillAccountCache } from '@/api';
import { PostCard } from '@/components/organisms';
import { PostCardSkeletonList, PostCardSkeleton, TrendingTagCard, TrendingTagCardSkeleton, TrendingLinkCard, TrendingLinkCardSkeleton, AccountCardSkeleton } from '@/components/molecules';
import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import { Tabs, EmptyState, Button, Avatar, EmojiText } from '@/components/atoms';
import type { TabItem } from '@/components/atoms/Tabs';
import { flattenAndUniqById, flattenAndUniqByKey } from '@/utils/fp';
import type { Status, Tag, TrendingLink, Field } from '@/types';
import { useAuthStore } from '@/hooks/useStores';
import { useQueryState, parseAsStringLiteral } from '@/hooks/useQueryState';

type TrendingTab = 'posts' | 'tags' | 'links' | 'people';

const VALID_TABS = ['posts', 'tags', 'links', 'people'] as const;

import { useTranslations } from 'next-intl';

// Get localized source label based on suggestion source
const getSourceLabel = (sources: string[], t: any): { label: string; hint: string } | null => {
    const source = sources[0];
    switch (source) {
        case 'friends_of_friends':
        case 'similar_to_recently_followed':
            return {
                label: t('personalizedLabel'),
                hint: t('personalizedHint')
            };
        case 'featured':
            return {
                label: t('staffPickLabel'),
                hint: t('staffPickHint')
            };
        case 'most_followed':
        case 'most_interactions':
            return {
                label: t('popularLabel'),
                hint: t('popularHint')
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
    const text = html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&');
    return text.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
};


interface TrendingContentProps {
    header?: ReactNode;
    scrollRestorationPrefix?: string;
}

export const TrendingContent = observer(({ header, scrollRestorationPrefix = 'trending' }: TrendingContentProps) => {
    const t = useTranslations('explore');
    const commonT = useTranslations('common');
    const accountT = useTranslations('account');
    const [activeTab, setActiveTab] = useQueryState('tab', {
        defaultValue: 'posts' as TrendingTab,
        parser: parseAsStringLiteral(VALID_TABS, 'posts'),
    });

    const trendingTabs: TabItem<TrendingTab>[] = [
        { value: 'posts', label: t('tabs.posts'), icon: <FileText size={18} /> },
        { value: 'tags', label: t('tabs.tags'), icon: <Hash size={18} /> },
        { value: 'people', label: t('tabs.people'), icon: <UserPlus size={18} /> },
        { value: 'links', label: t('tabs.links'), icon: <Newspaper size={18} /> },
    ];

    const authStore = useAuthStore();
    const queryClient = useQueryClient();

    // Fetch data for all tabs
    const {
        data: statusData,
        isLoading: statusesLoading,
        isError: statusesError,
        error: statusesErrorMsg,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteTrendingStatuses();

    const {
        data: tagsData,
        isLoading: tagsLoading,
        isError: tagsError,
        fetchNextPage: fetchNextTags,
        hasNextPage: hasMoreTags,
        isFetchingNextPage: isFetchingNextTags,
    } = useInfiniteTrendingTags();

    const {
        data: linksData,
        isLoading: linksLoading,
        isError: linksError,
        fetchNextPage: fetchNextLinks,
        hasNextPage: hasMoreLinks,
        isFetchingNextPage: isFetchingNextLinks,
    } = useInfiniteTrendingLinks();

    // Suggestions data fetching
    const { data: suggestions, isLoading: suggestionsLoading, isError: suggestionsError } = useSuggestions({ limit: 40 });
    const deleteSuggestion = useDeleteSuggestion();
    const followMutation = useFollowAccount();
    const unfollowMutation = useUnfollowAccount();

    // Get relationships for all suggested accounts
    const accountIds = suggestions?.map(s => s.account.id) ?? [];
    const { data: relationships } = useRelationships(accountIds);

    // Build a map of accountId -> relationship for quick lookup
    const relationshipMap = new Map(relationships?.map(r => [r.id, r]));

    // Flatten and deduplicate using FP utilities
    const uniqueStatuses = flattenAndUniqById(statusData?.pages);
    const uniqueTags = flattenAndUniqByKey<Tag>('name')(tagsData?.pages);
    const uniqueLinks = flattenAndUniqByKey<TrendingLink>('url')(linksData?.pages);

    return (
        <Container className={`full-height-container${authStore.isAuthenticated ? '' : ' guest'}`}>
            {/* Header */}
            {header && header}

            {/* Tab Navigation */}
            <Tabs
                tabs={trendingTabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                variant="underline"
                sticky
                style={{ padding: '0 var(--size-4)' }}
            />

            {/* Tab Content - using Activity for toggling */}
            <Activity mode={activeTab === 'posts' ? 'visible' : 'hidden'}>
                <TabContent>
                    {statusesLoading ? (
                        <ListContainer>
                            <PostCardSkeletonList count={5} />
                        </ListContainer>
                    ) : statusesError ? (
                        <ErrorContainer>
                            <ErrorText>
                                {statusesErrorMsg instanceof Error ? statusesErrorMsg.message : t('failedTrending')}
                            </ErrorText>
                            <Button onClick={() => window.location.reload()}>{commonT('retry')}</Button>
                        </ErrorContainer>
                    ) : uniqueStatuses.length === 0 ? (
                        <EmptyState title={t('noTrendingPosts')} />
                    ) : (
                        <VirtualizedList<Status>
                            items={uniqueStatuses}
                            renderItem={(status) => (
                                <PostCard status={status} style={{ marginBottom: 'var(--size-3)' }} />
                            )}
                            getItemKey={(status) => status.id}
                            estimateSize={350}
                            overscan={5}
                            onLoadMore={fetchNextPage}
                            isLoadingMore={isFetchingNextPage}
                            hasMore={hasNextPage}
                            loadMoreThreshold={1}
                            height="auto"
                            style={{ flex: 1, minHeight: 0 }}
                            className={authStore.isAuthenticated ? undefined : 'guest-list'}
                            scrollRestorationKey={`${scrollRestorationPrefix}-posts`}
                            loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
                            endIndicator={t('reachedEndPosts')}
                        />

                    )}
                </TabContent>
            </Activity>

            <Activity mode={activeTab === 'tags' ? 'visible' : 'hidden'}>
                <TabContent>
                    {tagsLoading ? (
                        <ListContainer className="virtualized-list-container">
                            <SkeletonList>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <TrendingTagCardSkeleton key={i} />
                                ))}
                            </SkeletonList>
                        </ListContainer>
                    ) : tagsError ? (
                        <EmptyState title={t('failedTags')} />
                    ) : uniqueTags.length === 0 ? (
                        <EmptyState title={t('noTrendingTags')} />
                    ) : (
                        <VirtualizedList<Tag>
                            items={uniqueTags}
                            renderItem={(tag) => (
                                <TrendingTagCard tag={tag} style={{ marginBottom: 'var(--size-2)' }} />
                            )}
                            getItemKey={(tag) => tag.name}
                            estimateSize={80}
                            overscan={5}
                            onLoadMore={fetchNextTags}
                            isLoadingMore={isFetchingNextTags}
                            hasMore={hasMoreTags}
                            loadMoreThreshold={1}
                            height="auto"
                            style={{ flex: 1, minHeight: 0 }}
                            className={authStore.isAuthenticated ? undefined : 'guest-list'}
                            scrollRestorationKey={`${scrollRestorationPrefix}-tags`}
                            loadingIndicator={<TrendingTagCardSkeleton style={{ marginBottom: 'var(--size-2)' }} />}
                            endIndicator={t('reachedEndTags')}
                        />

                    )}
                </TabContent>
            </Activity>

            <Activity mode={activeTab === 'links' ? 'visible' : 'hidden'}>
                <TabContent>
                    {linksLoading ? (
                        <ListContainer className="virtualized-list-container">
                            <SkeletonList>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <TrendingLinkCardSkeleton key={i} />
                                ))}
                            </SkeletonList>
                        </ListContainer>
                    ) : linksError ? (
                        <EmptyState title={t('failedNews')} />
                    ) : uniqueLinks.length === 0 ? (
                        <EmptyState title={t('noTrendingNews')} />
                    ) : (
                        <VirtualizedList<TrendingLink>
                            items={uniqueLinks}
                            renderItem={(link) => (
                                <TrendingLinkCard link={link} style={{ marginBottom: 'var(--size-2)' }} />
                            )}
                            getItemKey={(link) => link.url}
                            estimateSize={120}
                            overscan={5}
                            onLoadMore={fetchNextLinks}
                            isLoadingMore={isFetchingNextLinks}
                            hasMore={hasMoreLinks}
                            loadMoreThreshold={1}
                            height="auto"
                            style={{ flex: 1, minHeight: 0 }}
                            className={authStore.isAuthenticated ? undefined : 'guest-list'}
                            scrollRestorationKey={`${scrollRestorationPrefix}-links`}
                            loadingIndicator={<TrendingLinkCardSkeleton style={{ marginBottom: 'var(--size-2)' }} />}
                            endIndicator={t('reachedEndNews')}
                        />

                    )}
                </TabContent>
            </Activity>

            <Activity mode={activeTab === 'people' ? 'visible' : 'hidden'}>
                <TabContent>
                    {!authStore.isAuthenticated ? (
                        <EmptyState title={t('signInToSeeSuggestions', { defaultValue: 'Sign in to see suggestions' })} />
                    ) : suggestionsLoading ? (
                        <ListContainer className="virtualized-list-container">
                            <SuggestionsList>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <AccountCardSkeleton key={i} />
                                ))}
                            </SuggestionsList>
                        </ListContainer>
                    ) : suggestionsError ? (
                        <EmptyState title={t('failedSuggestions', { defaultValue: 'Failed to load suggestions' })} />
                    ) : !suggestions || suggestions.length === 0 ? (
                        <EmptyState title={t('noSuggestions', { defaultValue: 'No suggestions available' })} />
                    ) : (
                        <SuggestionsList>
                            {suggestions.map((suggestion) => {
                                const relationship = relationshipMap.get(suggestion.account.id);
                                const isFollowing = relationship?.following || relationship?.requested;
                                const isMutating =
                                    (followMutation.isPending && followMutation.variables?.id === suggestion.account.id) ||
                                    (unfollowMutation.isPending && unfollowMutation.variables === suggestion.account.id);
                                const sourceInfo = getSourceLabel(suggestion.sources, t);

                                return (
                                    <SuggestionCard key={suggestion.account.id}>
                                        <CardContent
                                            href={`/@${suggestion.account.acct}`}
                                            onClick={() => prefillAccountCache(queryClient, suggestion.account)}
                                        >
                                            <Avatar
                                                src={suggestion.account.avatar}
                                                alt={suggestion.account.display_name || suggestion.account.username}
                                                size="large"
                                            />
                                            <AccountInfo>
                                                <div className="trending-account-name text-truncate">
                                                    <EmojiText
                                                        text={suggestion.account.display_name || suggestion.account.username}
                                                        emojis={suggestion.account.emojis}
                                                    />
                                                </div>
                                                <div className="trending-account-handle text-truncate">@{suggestion.account.acct}</div>
                                                {(() => {
                                                    const verifiedField = getVerifiedField(suggestion.account.fields);
                                                    return verifiedField ? (
                                                        <VerifiedBadge title={`Verified ${verifiedField.name}`}>
                                                            <Check size={12} />
                                                            {extractLinkText(verifiedField.value)}
                                                        </VerifiedBadge>
                                                    ) : sourceInfo ? (
                                                        <SourceLabel title={sourceInfo.hint}>
                                                            <Info size={12} />
                                                            {sourceInfo.label}
                                                        </SourceLabel>
                                                    ) : null;
                                                })()}
                                            </AccountInfo>
                                        </CardContent>

                                        <CardActions>
                                            <DismissButton
                                                onClick={() => deleteSuggestion.mutate(suggestion.account.id)}
                                                title={commonT('dontShowAgain')}
                                                disabled={deleteSuggestion.isPending}
                                            >
                                                <X size={16} />
                                            </DismissButton>
                                            <Button
                                                variant={isFollowing ? 'secondary' : 'primary'}
                                                size="small"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (isFollowing) {
                                                        unfollowMutation.mutate(suggestion.account.id);
                                                    } else {
                                                        followMutation.mutate({ id: suggestion.account.id });
                                                    }
                                                }}
                                                disabled={isMutating}
                                                isLoading={isMutating}
                                            >
                                                {relationship?.requested ? accountT('requested') : isFollowing ? accountT('following') : accountT('follow')}
                                            </Button>
                                        </CardActions>
                                    </SuggestionCard>
                                );
                            })}
                        </SuggestionsList>
                    )}
                </TabContent>
            </Activity>

            {/* Floating Login Button for guests */}
            {!authStore.isAuthenticated && (
                <FloatingLoginButton href="/auth/signin">
                    <LogIn size={24} />
                </FloatingLoginButton>
            )}
        </Container>
    );
});


// Styled components
const Container = styled.div`
    max-width: 680px;
    margin: 0 auto;
    position: relative;

    @media (max-width: 767px) {
        padding: 0 var(--size-2);
    }
`;

const FloatingLoginButton = styled(Link)`
    position: fixed;
    bottom: var(--size-5);
    right: var(--size-4);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--blue-6);
    color: white;
    box-shadow: var(--shadow-4);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        transform: scale(1.05);
        box-shadow: var(--shadow-5);
    }

    &:active {
        transform: scale(0.95);
    }

    /* Hide on desktop - sidebar has sign-in button */
    @media (min-width: 768px) {
        display: none;
    }
`;

const TabContent = styled.div`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const ListContainer = styled.div`
    flex: 1;
    overflow: auto;
`;

const SkeletonList = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--size-2);
`;

const ErrorContainer = styled.div`
    text-align: center;
    padding: var(--size-8);
`;

const ErrorText = styled.p`
    color: var(--red-6);
    margin-bottom: var(--size-3);
`;

// Suggestion card styled components
const SuggestionsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--size-3);
    padding-inline: var(--size-2);
`;

const SuggestionCard = styled.div`
    display: flex;
    align-items: center;
    gap: var(--size-3);
    padding: var(--size-3);
    background: var(--surface-2);
    border-radius: var(--radius-3);
`;

const CardContent = styled(Link)`
    display: flex;
    align-items: center;
    gap: var(--size-3);
    flex: 1;
    text-decoration: none;
    color: inherit;
    min-width: 0;
`;

const AccountInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

/* AccountName and AccountHandle moved to globals.css as .trending-account-name and .trending-account-handle */

const SourceLabel = styled.div`
    display: flex;
    align-items: center;
    gap: var(--size-1);
    font-size: var(--font-size-0);
    color: var(--blue-6);
    margin-top: var(--size-1);
    cursor: help;

    svg {
        flex-shrink: 0;
    }
`;

const VerifiedBadge = styled.div`
    display: flex;
    align-items: center;
    gap: var(--size-1);
    font-size: var(--font-size-0);
    color: var(--green-6);
    margin-top: var(--size-1);
    cursor: help;

    svg {
        flex-shrink: 0;
    }
`;

const CardActions = styled.div`
    display: flex;
    align-items: center;
    gap: var(--size-2);
    flex-shrink: 0;
`;

const DismissButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    padding: var(--size-1) var(--size-3);
    border: 1px solid var(--surface-4);
    background: var(--surface-3);
    color: var(--text-1);
    font-size: inherit;
    font-weight: var(--font-weight-6);
    cursor: pointer;
    border-radius: var(--radius-2);
    box-shadow: none;
    transition: all 0.2s ease;

    &:hover {
        background: var(--surface-4);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;