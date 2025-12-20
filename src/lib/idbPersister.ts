/**
 * IndexedDB Persister for TanStack Query
 * Uses idb-keyval for simple key-value storage in IndexedDB
 * This allows specific queries (like custom emojis) to be persisted across sessions
 */

import { get, set, del, clear, createStore } from 'idb-keyval'
import { experimental_createQueryPersister } from '@tanstack/query-persist-client-core'

// Create a dedicated IndexedDB store for query cache
// Database: 'mastodon-cache', Store: 'query-store'
const queryStore = createStore('mastodon-cache', 'query-store')

/**
 * Custom async storage adapter for IndexedDB using idb-keyval
 * Implements the AsyncStorage interface expected by TanStack Query
 */
const idbStorage = {
    getItem: async (key: string) => {
        try {
            const value = await get(key, queryStore)
            return value ?? null
        } catch {
            return null
        }
    },
    setItem: async (key: string, value: string) => {
        try {
            await set(key, value, queryStore)
        } catch {
            // Silently fail - storage errors shouldn't break the app
        }
    },
    removeItem: async (key: string) => {
        try {
            await del(key, queryStore)
        } catch {
            // Silently fail
        }
    },
}

/**
 * Query persister for IndexedDB
 * Used with individual query options via the `persister` option
 * 
 * @example
 * queryOptions({
 *   queryKey: ['customEmojis'],
 *   queryFn: () => getCustomEmojis(),
 *   persister: idbQueryPersister,
 * })
 */
const persister = experimental_createQueryPersister({
    storage: idbStorage,
    // Max age of 24 hours for persisted data (ETag validation ensures freshness)
    maxAge: 1000 * 60 * 60 * 24,
})

// Export the persisterFn which is what useQuery expects
export const idbQueryPersister = persister.persisterFn

/**
 * Clear all data from the IndexedDB query store
 */
export async function clearIdb(): Promise<void> {
    if (typeof window === 'undefined') return
    try {
        await clear(queryStore)
    } catch (error) {
        console.error('Error clearing IndexedDB:', error)
    }
}
