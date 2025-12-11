'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Search as SearchIcon } from 'lucide-react';
import { useSearch, useInfiniteSearch } from '@/api';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { SearchHistory } from '@/components/molecules';
import { SearchContent } from '@/components/organisms';
import { Input, IconButton } from '@/components/atoms';

type TabType = 'all' | 'accounts' | 'statuses' | 'hashtags';

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
    if (urlQuery !== debouncedQuery) {
      setQuery(urlQuery);
      setDebouncedQuery(urlQuery);
      if (urlQuery) addToHistory(urlQuery);

      if (!urlType && urlQuery.startsWith('#')) {
        setActiveTab('hashtags');
      }
    }

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
  const { data: allSearchResults, isLoading: isLoadingAll, isError: isErrorAll } = useSearch({
    q: debouncedQuery,
    type: undefined,
  }, { enabled: activeTab === 'all' });

  const {
    data: accountsData, fetchNextPage: fetchNextAccounts, hasNextPage: hasNextAccounts,
    isFetchingNextPage: isFetchingNextAccounts, isLoading: isLoadingAccounts, isError: isErrorAccounts,
  } = useInfiniteSearch({ q: debouncedQuery, type: 'accounts' }, { enabled: activeTab === 'accounts' });

  const {
    data: statusesData, fetchNextPage: fetchNextStatuses, hasNextPage: hasNextStatuses,
    isFetchingNextPage: isFetchingNextStatuses, isLoading: isLoadingStatuses, isError: isErrorStatuses,
  } = useInfiniteSearch({ q: debouncedQuery, type: 'statuses' }, { enabled: activeTab === 'statuses' });

  const {
    data: hashtagsData, fetchNextPage: fetchNextHashtags, hasNextPage: hasNextHashtags,
    isFetchingNextPage: isFetchingNextHashtags, isLoading: isLoadingHashtags, isError: isErrorHashtags,
  } = useInfiniteSearch({ q: debouncedQuery, type: 'hashtags' }, { enabled: activeTab === 'hashtags' });

  const flattenedAccounts = accountsData?.pages.flatMap(page => page.accounts) || [];
  const flattenedStatuses = statusesData?.pages.flatMap(page => page.statuses) || [];
  const flattenedHashtags = hashtagsData?.pages.flatMap(page => page.hashtags) || [];

  const hasQuery = debouncedQuery.trim().length > 0;
  const tabs: TabType[] = ['all', 'accounts', 'statuses', 'hashtags'];

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)', marginBottom: 'var(--size-4)' }}>
          <IconButton onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </IconButton>
          <h1 style={{ fontSize: 'var(--font-size-4)' }}>Search</h1>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <SearchIcon size={18} style={{ position: 'absolute', left: 'var(--size-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <Input
            type="text"
            placeholder="Search for people, posts, or hashtags"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: 'var(--size-8)' }}
          />
        </div>

        {/* Tab Navigation */}
        {hasQuery && (
          <div style={{ display: 'flex', gap: 'var(--size-2)', marginTop: 'var(--size-4)', overflowX: 'auto' }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: 'var(--size-2) var(--size-4)',
                  borderRadius: 'var(--radius-round)',
                  border: 'none',
                  background: activeTab === tab ? 'var(--text-1)' : 'var(--surface-3)',
                  color: activeTab === tab ? 'var(--surface-1)' : 'var(--text-2)',
                  fontWeight: 'var(--font-weight-6)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  textTransform: 'capitalize',
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
          <SearchHistory
            history={history}
            onSelect={setQuery}
            onRemove={removeFromHistory}
            onClear={clearHistory}
          />
        ) : (
          <SearchContent
            activeTab={activeTab}
            query={debouncedQuery}
            allResults={allSearchResults}
            isLoadingAll={isLoadingAll}
            isErrorAll={isErrorAll}
            accounts={flattenedAccounts}
            isLoadingAccounts={isLoadingAccounts}
            isErrorAccounts={isErrorAccounts}
            fetchNextAccounts={fetchNextAccounts}
            hasNextAccounts={hasNextAccounts ?? false}
            isFetchingNextAccounts={isFetchingNextAccounts}
            statuses={flattenedStatuses}
            isLoadingStatuses={isLoadingStatuses}
            isErrorStatuses={isErrorStatuses}
            fetchNextStatuses={fetchNextStatuses}
            hasNextStatuses={hasNextStatuses ?? false}
            isFetchingNextStatuses={isFetchingNextStatuses}
            hashtags={flattenedHashtags}
            isLoadingHashtags={isLoadingHashtags}
            isErrorHashtags={isErrorHashtags}
            fetchNextHashtags={fetchNextHashtags}
            hasNextHashtags={hasNextHashtags ?? false}
            isFetchingNextHashtags={isFetchingNextHashtags}
          />
        )}
      </div>
    </div>
  );
}
