'use client';

import { useState, useEffect, Activity } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Search as SearchIcon, Hash, X, Clock } from 'lucide-react';
import { useSearch, useInfiniteSearch } from '@/api';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { PostCard, PostCardSkeleton, TrendingTagCardSkeleton, UserCard } from '@/components/molecules';
import { Input, Spinner, IconButton, Card } from '@/components/atoms';

type TabType = 'all' | 'accounts' | 'statuses' | 'hashtags';

// Inline skeleton for UserCard since we don't have a dedicated one yet
export function UserCardSkeleton({ style }: { style?: React.CSSProperties }) {
  return (
    <Card padding="medium" style={style}>
      <div style={{ display: 'flex', gap: 'var(--size-3)', alignItems: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'var(--surface-3)',
          animation: 'var(--animation-blink)'
        }} />
        <div style={{ flex: 1 }}>
          <div style={{
            width: '40%',
            height: '16px',
            background: 'var(--surface-3)',
            borderRadius: 'var(--radius-1)',
            marginBottom: 'var(--size-2)',
            animation: 'var(--animation-blink)'
          }} />
          <div style={{
            width: '25%',
            height: '14px',
            background: 'var(--surface-3)',
            borderRadius: 'var(--radius-1)',
            animation: 'var(--animation-blink)'
          }} />
        </div>
        <div style={{
          width: '80px',
          height: '32px',
          background: 'var(--surface-3)',
          borderRadius: 'var(--radius-2)',
          animation: 'var(--animation-blink)'
        }} />
      </div>
    </Card>
  );
}

import { VirtualizedList } from '@/components/organisms/VirtualizedList';
import type { Account, Status, Tag } from '@/types';

// ... (existing imports)

export default function SearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const urlType = searchParams.get('type') as TabType;

  const [query, setQuery] = useState(urlQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(urlQuery);
  const [activeTab, setActiveTab] = useState<TabType>(
    urlType || (urlQuery.startsWith('#') ? 'hashtags' : 'all')
  );

  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  // Sync State -> URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let hasChanges = false;

    // Sync Query
    if (debouncedQuery) {
      if (params.get('q') !== debouncedQuery) {
        params.set('q', debouncedQuery);
        hasChanges = true;
      }
    } else {
      if (params.has('q')) {
        params.delete('q');
        hasChanges = true;
      }
    }

    // Sync Tab
    if (activeTab && activeTab !== 'all') {
      if (params.get('type') !== activeTab) {
        params.set('type', activeTab);
        hasChanges = true;
      }
    } else {
      if (params.has('type')) {
        params.delete('type');
        hasChanges = true;
      }
    }

    if (hasChanges) {
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [debouncedQuery, activeTab, pathname, router, searchParams]);

  // Sync URL -> State (Handle Back/Forward/External)
  useEffect(() => {
    // Sync Query if different (e.g. Back button)
    if (urlQuery !== debouncedQuery) {
      setQuery(urlQuery);
      setDebouncedQuery(urlQuery);
      if (urlQuery) addToHistory(urlQuery);

      // Handle auto-switching to hashtags tab for # queries if no type specified
      if (!urlType && urlQuery.startsWith('#')) {
        setActiveTab('hashtags');
      }
    }

    // Sync Tab if different
    if (urlType && urlType !== activeTab) {
      setActiveTab(urlType);
    } else if (!urlType && activeTab !== 'all' && !urlQuery.startsWith('#')) {
      setActiveTab('all');
    }
  }, [urlQuery, urlType]);

  // Debounce search query
  useEffect(() => {
    if (query !== debouncedQuery) {
      const timer = setTimeout(() => {
        setDebouncedQuery(query);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [query, debouncedQuery]);

  // --- Data Fetching ---

  // 1. All Tab (Standard Search)
  const {
    data: allSearchResults,
    isLoading: isLoadingAll,
    isError: isErrorAll,
  } = useSearch({
    q: debouncedQuery,
    type: undefined,
  }, { enabled: activeTab === 'all' });

  // 2. Accounts Tab (Infinite Search)
  const {
    data: accountsData,
    fetchNextPage: fetchNextAccounts,
    hasNextPage: hasNextAccounts,
    isFetchingNextPage: isFetchingNextAccounts,
    isLoading: isLoadingAccounts,
    isError: isErrorAccounts,
  } = useInfiniteSearch({
    q: debouncedQuery,
    type: 'accounts',
  }, { enabled: activeTab === 'accounts' }); // Enable when active, keeping data in cache otherwise

  // 3. Statuses Tab (Infinite Search)
  const {
    data: statusesData,
    fetchNextPage: fetchNextStatuses,
    hasNextPage: hasNextStatuses,
    isFetchingNextPage: isFetchingNextStatuses,
    isLoading: isLoadingStatuses,
    isError: isErrorStatuses,
  } = useInfiniteSearch({
    q: debouncedQuery,
    type: 'statuses',
  }, { enabled: activeTab === 'statuses' });

  // 4. Hashtags Tab (Infinite Search)
  const {
    data: hashtagsData,
    fetchNextPage: fetchNextHashtags,
    hasNextPage: hasNextHashtags,
    isFetchingNextPage: isFetchingNextHashtags,
    isLoading: isLoadingHashtags,
    isError: isErrorHashtags,
  } = useInfiniteSearch({
    q: debouncedQuery,
    type: 'hashtags',
  }, { enabled: activeTab === 'hashtags' });

  // Flatten Data
  const flattenedAccounts = accountsData?.pages.flatMap(page => page.accounts) || [];
  const flattenedStatuses = statusesData?.pages.flatMap(page => page.statuses) || []
  const flattenedHashtags = hashtagsData?.pages.flatMap(page => page.hashtags) || [];

  const hasQuery = debouncedQuery.trim().length > 0;

  // Aggregate Loading/Error/Results states based on Active Tab for initial feedback
  // (Though with Activity, we handle rendering per tab)
  const isLoading =
    activeTab === 'all' ? isLoadingAll :
      activeTab === 'accounts' ? isLoadingAccounts :
        activeTab === 'statuses' ? isLoadingStatuses :
          isLoadingHashtags;

  // Note: With Activity, we render all 'active' slots, but we only show one.
  // We can show a common loading indicator if the *current* tab is loading and has no data.

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0,
        background: 'var(--surface-1)',
        zIndex: 10,
        padding: 'var(--size-4) var(--size-2)',
        marginBottom: 'var(--size-4)',
        borderBottom: '1px solid var(--surface-3)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--size-3)',
          marginBottom: 'var(--size-4)',
        }}>
          <IconButton onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </IconButton>
          <h1 style={{ fontSize: 'var(--font-size-4)' }}>
            Search
          </h1>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <SearchIcon
            size={18}
            style={{
              position: 'absolute',
              left: 'var(--size-3)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-2)',
              pointerEvents: 'none',
            }}
          />
          <Input
            type="text"
            placeholder="Search for people, posts, or hashtags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addToHistory(query);
              }
            }}
            style={{
              paddingLeft: 'var(--size-8)',
              width: '100%',
            }}
          />
        </div>

        {/* Tabs */}
        {hasQuery && (
          <div style={{
            display: 'flex',
            gap: 'var(--size-2)',
            marginTop: 'var(--size-4)',
            overflowX: 'auto',
          }}>
            {(['all', 'accounts', 'statuses', 'hashtags'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: 'var(--size-2) var(--size-3)',
                  border: 'none',
                  borderRadius: 'var(--radius-2)',
                  background: activeTab === tab ? 'var(--blue-6)' : 'var(--surface-3)',
                  color: activeTab === tab ? 'white' : 'var(--text-1)',
                  fontSize: 'var(--font-size-1)',
                  fontWeight: 'var(--font-weight-6)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {!hasQuery ? (
          <div>
            {history.length > 0 ? (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--size-3)',
                  padding: '0 var(--size-2)'
                }}>
                  <h3 style={{
                    fontSize: 'var(--font-size-2)',
                    fontWeight: 'var(--font-weight-6)',
                    color: 'var(--text-2)'
                  }}>Recent</h3>
                  <button
                    onClick={clearHistory}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--blue-6)',
                      fontSize: 'var(--font-size-1)',
                      fontWeight: 'var(--font-weight-6)',
                      cursor: 'pointer'
                    }}
                  >
                    Clear all
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
                  {history.map((term, index) => (
                    <div
                      key={term + index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--size-3)',
                        borderRadius: 'var(--radius-2)',
                        background: 'var(--surface-2)',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                      className="recent-search-item"
                      onClick={() => setQuery(term)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)' }}>
                        <Clock size={16} style={{ color: 'var(--text-3)' }} />
                        <span style={{ color: 'var(--text-1)' }}>{term}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromHistory(term);
                        }}
                        style={{
                          border: 'none',
                          background: 'none',
                          color: 'var(--text-3)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 'var(--size-1)',
                          borderRadius: '50%'
                        }}
                        className="recent-search-remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', placeItems: 'center', marginTop: 'var(--size-8)', color: 'var(--text-2)' }}>
                <SearchIcon size={48} style={{ marginBottom: 'var(--size-4)' }} />
                <p>Search for people, posts, or hashtags</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* All Tab */}
            <Activity mode={activeTab === 'all' ? 'visible' : 'hidden'}>
              <div style={{ height: '100%', overflowY: 'auto', padding: '0 var(--size-2)' }}>
                {isLoadingAll ? (
                  <div style={{ display: 'grid', placeItems: 'center', marginTop: 'var(--size-8)' }}>
                    <Spinner />
                    <p style={{ marginTop: 'var(--size-4)', color: 'var(--text-2)' }}>Searching...</p>
                  </div>
                ) : isErrorAll ? (
                  <div style={{ textAlign: 'center', marginTop: 'var(--size-8)', color: 'var(--red-6)' }}>
                    <p>An error occurred while searching</p>
                  </div>
                ) : allSearchResults && (
                  <>
                    {allSearchResults.accounts.length === 0 && allSearchResults.statuses.length === 0 && allSearchResults.hashtags.length === 0 && (
                      <div style={{ textAlign: 'center', marginTop: 'var(--size-8)', color: 'var(--text-2)' }}>
                        <p>No results found for "{debouncedQuery}"</p>
                      </div>
                    )}

                    {allSearchResults.accounts.length > 0 && (
                      <div style={{ marginBottom: 'var(--size-6)' }}>
                        <h2 style={{ fontSize: 'var(--font-size-3)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-4)', color: 'var(--text-1)' }}>
                          Accounts ({allSearchResults.accounts.length})
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-3)' }}>
                          {allSearchResults.accounts.map((account) => (
                            <UserCard key={account.id} account={account} />
                          ))}
                        </div>
                      </div>
                    )}

                    {allSearchResults.statuses.length > 0 && (
                      <div style={{ marginBottom: 'var(--size-6)' }}>
                        <h2 style={{ fontSize: 'var(--font-size-3)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-4)', color: 'var(--text-1)' }}>
                          Posts ({allSearchResults.statuses.length})
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-3)' }}>
                          {allSearchResults.statuses.map((status) => (
                            <PostCard key={status.id} status={status} />
                          ))}
                        </div>
                      </div>
                    )}

                    {allSearchResults.hashtags.length > 0 && (
                      <div style={{ marginBottom: 'var(--size-6)' }}>
                        <h2 style={{ fontSize: 'var(--font-size-3)', fontWeight: 'var(--font-weight-6)', marginBottom: 'var(--size-4)', color: 'var(--text-1)' }}>
                          Hashtags ({allSearchResults.hashtags.length})
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-3)' }}>
                          {allSearchResults.hashtags.map((tag) => (
                            <Card key={tag.name} hoverable>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)', padding: 'var(--size-2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'var(--size-9)', height: 'var(--size-9)', borderRadius: '50%', background: 'var(--surface-3)' }}>
                                  <Hash size={20} style={{ color: 'var(--text-2)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 'var(--font-size-2)', fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>#{tag.name}</div>
                                  {tag.history && tag.history.length > 0 && (
                                    <div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)', marginTop: 'var(--size-1)' }}>{tag.history[0].uses} posts</div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Activity>

            {/* Accounts Tab */}
            <Activity mode={activeTab === 'accounts' ? 'visible' : 'hidden'}>
              <div style={{ height: '100%' }}>
                {isLoadingAccounts ? (
                  <div style={{ display: 'grid', placeItems: 'center', marginTop: 'var(--size-8)' }}>
                    <Spinner />
                    <p style={{ marginTop: 'var(--size-4)', color: 'var(--text-2)' }}>Searching...</p>
                  </div>
                ) : isErrorAccounts ? (
                  <div style={{ textAlign: 'center', marginTop: 'var(--size-8)', color: 'var(--red-6)' }}>
                    <p>An error occurred while searching</p>
                  </div>
                ) : flattenedAccounts.length === 0 ? (
                  <div style={{ textAlign: 'center', marginTop: 'var(--size-8)', color: 'var(--text-2)' }}>
                    <p>No accounts found for "{debouncedQuery}"</p>
                  </div>
                ) : (
                  <VirtualizedList<Account>
                    items={flattenedAccounts}
                    renderItem={(account) => (
                      <div style={{ marginBottom: 'var(--size-3)' }}>
                        <UserCard account={account} />
                      </div>
                    )}
                    getItemKey={(account) => account.id}
                    estimateSize={80}
                    style={{ height: '100%' }}
                    scrollRestorationKey={`search-accounts-${debouncedQuery}`}
                    onLoadMore={fetchNextAccounts}
                    hasMore={hasNextAccounts}
                    isLoadingMore={isFetchingNextAccounts}
                    loadingIndicator={<UserCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
                  />
                )}
              </div>
            </Activity>

            {/* Statuses Tab */}
            <Activity mode={activeTab === 'statuses' ? 'visible' : 'hidden'}>
              <div style={{ height: '100%' }}>
                {isLoadingStatuses ? (
                  <div style={{ display: 'grid', placeItems: 'center', marginTop: 'var(--size-8)' }}>
                    <Spinner />
                    <p style={{ marginTop: 'var(--size-4)', color: 'var(--text-2)' }}>Searching...</p>
                  </div>
                ) : isErrorStatuses ? (
                  <div style={{ textAlign: 'center', marginTop: 'var(--size-8)', color: 'var(--red-6)' }}>
                    <p>An error occurred while searching</p>
                  </div>
                ) : flattenedStatuses.length === 0 ? (
                  <div style={{ textAlign: 'center', marginTop: 'var(--size-8)', color: 'var(--text-2)' }}>
                    <p>No posts found for "{debouncedQuery}"</p>
                  </div>
                ) : (
                  <VirtualizedList<Status>
                    items={flattenedStatuses}
                    renderItem={(status) => (
                      <div style={{ marginBottom: 'var(--size-3)' }}>
                        <PostCard status={status} />
                      </div>
                    )}
                    getItemKey={(status) => status.id}
                    estimateSize={200}
                    style={{ height: '100%' }}
                    scrollRestorationKey={`search-statuses-${debouncedQuery}`}
                    onLoadMore={fetchNextStatuses}
                    hasMore={hasNextStatuses}
                    isLoadingMore={isFetchingNextStatuses}
                    loadingIndicator={<PostCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
                  />
                )}
              </div>
            </Activity>

            {/* Hashtags Tab */}
            <Activity mode={activeTab === 'hashtags' ? 'visible' : 'hidden'}>
              <div style={{ height: '100%' }}>
                {isLoadingHashtags ? (
                  <div style={{ display: 'grid', placeItems: 'center', marginTop: 'var(--size-8)' }}>
                    <Spinner />
                    <p style={{ marginTop: 'var(--size-4)', color: 'var(--text-2)' }}>Searching...</p>
                  </div>
                ) : isErrorHashtags ? (
                  <div style={{ textAlign: 'center', marginTop: 'var(--size-8)', color: 'var(--red-6)' }}>
                    <p>An error occurred while searching</p>
                  </div>
                ) : flattenedHashtags.length === 0 ? (
                  <div style={{ textAlign: 'center', marginTop: 'var(--size-8)', color: 'var(--text-2)' }}>
                    <p>No hashtags found for "{debouncedQuery}"</p>
                  </div>
                ) : (
                  <VirtualizedList<Tag>
                    items={flattenedHashtags}
                    renderItem={(tag) => (
                      <div key={tag.name} style={{ marginBottom: 'var(--size-3)' }}>
                        <Card hoverable>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--size-3)',
                            padding: 'var(--size-2)',
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 'var(--size-9)',
                              height: 'var(--size-9)',
                              borderRadius: '50%',
                              background: 'var(--surface-3)',
                            }}>
                              <Hash size={20} style={{ color: 'var(--text-2)' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: 'var(--font-size-2)',
                                fontWeight: 'var(--font-weight-6)',
                                color: 'var(--text-1)',
                              }}>
                                #{tag.name}
                              </div>
                              {tag.history && tag.history.length > 0 && (
                                <div style={{
                                  fontSize: 'var(--font-size-0)',
                                  color: 'var(--text-2)',
                                  marginTop: 'var(--size-1)',
                                }}>
                                  {tag.history[0].uses} posts
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}
                    getItemKey={(tag) => tag.name}
                    estimateSize={80}
                    style={{ height: '100%' }}
                    scrollRestorationKey={`search-hashtags-${debouncedQuery}`}
                    onLoadMore={fetchNextHashtags}
                    hasMore={hasNextHashtags}
                    isLoadingMore={isFetchingNextHashtags}
                    loadingIndicator={<TrendingTagCardSkeleton style={{ marginBottom: 'var(--size-3)' }} />}
                  />
                )}
              </div>
            </Activity>
          </>
        )}
      </div>
    </div>
  );
}
