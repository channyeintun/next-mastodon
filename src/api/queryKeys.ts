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
    history: (id: string) => ['statuses', id, 'history'] as const,
    source: (id: string) => ['statuses', id, 'source'] as const,
  },

  // Scheduled Statuses
  scheduledStatuses: {
    all: () => ['scheduled_statuses'] as const,
    list: (params?: object) => ['scheduled_statuses', 'list', params] as const,
    detail: (id: string) => ['scheduled_statuses', id] as const,
  },

  // Accounts
  accounts: {
    all: ['accounts'] as const,
    detail: (id: string) => ['accounts', id] as const,
    lookup: (acct: string) => ['accounts', 'lookup', acct] as const,
    statuses: (id: string, params?: object) =>
      ['accounts', id, 'statuses', params] as const,
    pinnedStatuses: (id: string) => ['accounts', id, 'pinned_statuses'] as const,
    followers: (id: string) => ['accounts', id, 'followers'] as const,
    following: (id: string) => ['accounts', id, 'following'] as const,
    relationships: (ids: string[]) => ['accounts', 'relationships', ids] as const,
    current: () => ['accounts', 'current'] as const,
    followRequests: () => ['accounts', 'follow_requests'] as const,
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
    tags: (params?: object) => ['trends', 'tags', params] as const,
    links: (params?: object) => ['trends', 'links', params] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: (params?: object) => ['notifications', 'list', params] as const,
    detail: (id: string) => ['notifications', id] as const,
    unreadCount: () => ['notifications', 'unread_count'] as const,
  },

  // Instance
  instance: {
    default: ['instance'] as const,
  },

  // Blocks
  blocks: {
    all: () => ['blocks'] as const,
    list: (params?: object) => ['blocks', 'list', params] as const,
  },

  // Mutes
  mutes: {
    all: () => ['mutes'] as const,
    list: (params?: object) => ['mutes', 'list', params] as const,
  },

  // Preferences
  preferences: {
    all: () => ['preferences'] as const,
  },

  // Lists
  lists: {
    all: () => ['lists'] as const,
    detail: (id: string) => ['lists', id] as const,
    accounts: (id: string, params?: object) => ['lists', id, 'accounts', params] as const,
    timeline: (id: string, params?: object) => ['timelines', 'list', id, params] as const,
  },
}
