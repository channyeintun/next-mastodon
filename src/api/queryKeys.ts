/**
 * TanStack Query key factory for Mastodon API
 * Provides consistent and type-safe query keys
 */

export const queryKeys = {
  // Timelines
  timelines: {
    all: ['timelines'] as const,
    home: (params?: object) => ['timelines', 'home', params] as const,
    public: (params?: object) => ['timelines', 'public', params] as const,
    hashtag: (tag: string, params?: object) =>
      ['timelines', 'hashtag', tag, params] as const,
  },

  // Statuses
  statuses: {
    all: ['statuses'] as const,
    detail: (id: string) => ['statuses', id] as const,
    context: (id: string) => ['statuses', id, 'context'] as const,
    favouritedBy: (id: string) => ['statuses', id, 'favourited_by'] as const,
    rebloggedBy: (id: string) => ['statuses', id, 'reblogged_by'] as const,
  },

  // Accounts
  accounts: {
    all: ['accounts'] as const,
    detail: (id: string) => ['accounts', id] as const,
    lookup: (acct: string) => ['accounts', 'lookup', acct] as const,
    statuses: (id: string, params?: object) =>
      ['accounts', id, 'statuses', params] as const,
    followers: (id: string) => ['accounts', id, 'followers'] as const,
    following: (id: string) => ['accounts', id, 'following'] as const,
    relationships: (ids: string[]) => ['accounts', 'relationships', ids] as const,
    current: () => ['accounts', 'current'] as const,
  },

  // Bookmarks
  bookmarks: {
    all: (params?: object) => ['bookmarks', params] as const,
  },

  // Search
  search: {
    all: (query: string, type?: string) => ['search', query, type] as const,
  },

  // Trends
  trends: {
    statuses: (params?: object) => ['trends', 'statuses', params] as const,
  },
}
