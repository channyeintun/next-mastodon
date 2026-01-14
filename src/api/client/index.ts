/**
 * Client API - Central Export
 * Re-exports all domain modules for backwards compatibility
 */

// Base client and types
export { api, createCustomClient, wrapPaginatedResponse, type PaginatedResponse } from './base'

// Auth
export { createApp, getToken } from './auth'

// Timelines
export { getHomeTimeline, getPublicTimeline, getHashtagTimeline, getListTimeline } from './timelines'

// Statuses
export {
    getStatus,
    createStatus,
    deleteStatus,
    updateStatus,
    getStatusContext,
    favouriteStatus,
    unfavouriteStatus,
    reblogStatus,
    unreblogStatus,
    bookmarkStatus,
    unbookmarkStatus,
    muteConversation,
    unmuteConversation,
    pinStatus,
    unpinStatus,
    getStatusHistory,
    getStatusSource,
    getFavouritedBy,
    getRebloggedBy,
    getStatusQuotes,
    translateStatus,
    getBookmarks
} from './statuses'

// Accounts
export {
    getAccount,
    lookupAccount,
    verifyCredentials,
    updateCredentials,
    getAccountStatuses,
    getPinnedStatuses,
    getFollowers,
    getFollowing,
    followAccount,
    unfollowAccount,
    getRelationships,
    getFollowRequests,
    acceptFollowRequest,
    rejectFollowRequest,
    blockAccount,
    unblockAccount,
    getBlockedAccounts,
    muteAccount,
    unmuteAccount,
    getMutedAccounts,
    getAccountLists,
    getFamiliarFollowers,
    removeFromFollowers,
    type FollowAccountParams,
    type FamiliarFollowersResult
} from './accounts'

// Notifications
export {
    getNotifications,
    getNotification,
    dismissNotification,
    clearNotifications,
    getUnreadNotificationCount,
    getGroupedNotifications,
    dismissNotificationGroup,
    getMarkers,
    updateMarkers,
    getNotificationRequests,
    getNotificationRequest,
    acceptNotificationRequest,
    dismissNotificationRequest,
    acceptNotificationRequests,
    dismissNotificationRequests,
    getNotificationPolicyV1,
    updateNotificationPolicyV1,
    getNotificationPolicy,
    updateNotificationPolicy,
    type Marker,
    type MarkersResponse
} from './notifications'

// Conversations
export { getConversations, deleteConversation, markConversationAsRead } from './conversations'

// Lists
export {
    getLists,
    getList,
    createList,
    updateList,
    deleteList,
    getListAccounts,
    addAccountsToList,
    removeAccountsFromList
} from './lists'

// Search
export { search } from './search'

// Trends
export { getTrendingStatuses, getTrendingTags, getTrendingLinks } from './trends'

// Media
export { uploadMedia, updateMedia, getMediaAttachment } from './media'

// Polls
export { getPoll, votePoll } from './polls'

// Instance
export {
    getInstance,
    getPreferences,
    getInstanceLanguages,
    getInstanceRules,
    getPrivacyPolicy,
    getTermsOfService,
    getExtendedDescription,
    getTranslationLanguages,
    type TranslationLanguagesMap
} from './instance'

// Emojis
export { getCustomEmojis, NotModifiedError } from './emojis'

// Push
export { getPushSubscription, createPushSubscription, updatePushSubscription, deletePushSubscription } from './push'

// Filters
export { getFilters, getFilter, createFilter, updateFilter, deleteFilter } from './filters'

// Scheduled
export { getScheduledStatuses, getScheduledStatus, updateScheduledStatus, deleteScheduledStatus } from './scheduled'

// Suggestions
export { getSuggestions, deleteSuggestion } from './suggestions'

// Annual Reports
export { getAnnualReportState, generateAnnualReport, getAnnualReport } from './annual-reports'

// Reports
export { createReport } from './reports'
