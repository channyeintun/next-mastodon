'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Search as SearchIcon, X } from 'lucide-react';
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
  const query = searchParams.get('q') || '';
  const activeTab = (searchParams.get('type') as TabType) || (query.startsWith('#') ? 'hashtags' : 'all');

  const [inputValue, setInputValue] = useState(query);
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  // Sync input value when URL query changes (e.g., back/forward navigation)
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const updateURL = (newQuery: string, newTab?: TabType, shouldAddToHistory = false) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newQuery) {
      params.set('q', newQuery);
      // Add to history only when explicitly requested (user typing or selecting from history)
      if (shouldAddToHistory) {
        addToHistory(newQuery);
      }
    } else {
      params.delete('q');
    }

    const tabToUse = newTab || activeTab;
    if (tabToUse && tabToUse !== 'all') {
      params.set('type', tabToUse);
    } else {
      params.delete('type');
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSearch = () => {
    if (inputValue.trim()) {
      updateURL(inputValue.trim(), undefined, true);
    }
  };

  const handleClear = () => {
    setInputValue('');
    updateURL('', undefined, false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTabChange = (tab: TabType) => {
    updateURL(query, tab);
  };

  // --- Data Fetching ---
  const { data: allSearchResults, isLoading: isLoadingAll, isError: isErrorAll } = useSearch({
    q: query,
    type: undefined,
    resolve: true,
  }, { enabled: activeTab === 'all' && query.trim().length > 0 });

  const {
    data: accountsData, fetchNextPage: fetchNextAccounts, hasNextPage: hasNextAccounts,
    isFetchingNextPage: isFetchingNextAccounts, isLoading: isLoadingAccounts, isError: isErrorAccounts,
  } = useInfiniteSearch({ q: query, type: 'accounts', resolve: true }, { enabled: activeTab === 'accounts' && query.trim().length > 0 });

  const {
    data: statusesData, fetchNextPage: fetchNextStatuses, hasNextPage: hasNextStatuses,
    isFetchingNextPage: isFetchingNextStatuses, isLoading: isLoadingStatuses, isError: isErrorStatuses,
  } = useInfiniteSearch({ q: query, type: 'statuses', resolve: true }, { enabled: activeTab === 'statuses' && query.trim().length > 0 });

  const {
    data: hashtagsData, fetchNextPage: fetchNextHashtags, hasNextPage: hasNextHashtags,
    isFetchingNextPage: isFetchingNextHashtags, isLoading: isLoadingHashtags, isError: isErrorHashtags,
  } = useInfiniteSearch({ q: query, type: 'hashtags', resolve: true }, { enabled: activeTab === 'hashtags' && query.trim().length > 0 });

  const flattenedAccounts = accountsData?.pages.flatMap(page => page.accounts) || [];
  const flattenedStatuses = statusesData?.pages.flatMap(page => page.statuses) || [];
  const flattenedHashtags = hashtagsData?.pages.flatMap(page => page.hashtags) || [];

  const hasQuery = query.trim().length > 0;
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
            placeholder="Search for people, posts, or hashtags (press Enter to search)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ width: '100%', paddingLeft: 'var(--size-8)', paddingRight: inputValue ? 'var(--size-8)' : 'var(--size-3)' }}
          />
          {inputValue && (
            <IconButton
              onClick={handleClear}
              style={{
                position: 'absolute',
                right: 'var(--size-2)',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: 'var(--size-1)',
                minWidth: 'auto',
                width: 'auto',
                height: 'auto'
              }}
            >
              <X size={12} style={{ width: '12px', height: '12px' }} />
            </IconButton>
          )}
        </div>

        {/* Tab Navigation */}
        {hasQuery && (
          <div style={{ display: 'flex', gap: 'var(--size-2)', marginTop: 'var(--size-4)', overflowX: 'auto' }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
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
            onSelect={(selectedQuery) => {
              setInputValue(selectedQuery);
              updateURL(selectedQuery, undefined, true);
            }}
            onRemove={removeFromHistory}
            onClear={clearHistory}
          />
        ) : (
          <SearchContent
            activeTab={activeTab}
            query={query}
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
