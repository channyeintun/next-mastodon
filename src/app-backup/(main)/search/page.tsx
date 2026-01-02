'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search as SearchIcon, X } from 'lucide-react';
import { useSearch, useInfiniteSearch } from '@/api';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { SearchHistory } from '@/components/molecules';
import { SearchContent } from '@/components/organisms';
import { Input, IconButton } from '@/components/atoms';
import { useQueryState, parseAsStringLiteral } from '@/hooks/useQueryState';

type TabType = 'all' | 'accounts' | 'statuses' | 'hashtags';
const VALID_TABS = ['all', 'accounts', 'statuses', 'hashtags'] as const;

export default function SearchPage() {
  const router = useRouter();
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  // URL state for query and tab
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [activeTab, setActiveTab] = useQueryState('type', {
    defaultValue: (query.startsWith('#') ? 'hashtags' : 'all') as TabType,
    parser: parseAsStringLiteral(VALID_TABS, 'all'),
  });

  // Local input state (synced from URL query)
  const [inputValue, setInputValue] = useState(query);

  // Sync input value when URL query changes (e.g., back/forward navigation)
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const handleSearch = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      setQuery(trimmed);
      addToHistory(trimmed);
    }
  }, [inputValue, setQuery, addToHistory]);

  const handleClear = useCallback(() => {
    setInputValue('');
    setQuery('');
  }, [setQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
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
    <div style={{ maxWidth: '680px', margin: '0 auto', height: '100dvh', display: 'flex', flexDirection: 'column' }}>
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
              setQuery(selectedQuery);
              addToHistory(selectedQuery);
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
