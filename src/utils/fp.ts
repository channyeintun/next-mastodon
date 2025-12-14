/**
 * Functional Programming utilities using Ramda
 * Reusable combinators for common data transformation patterns
 */

import {
  pipe,
  map,
  flatten,
  uniqBy,
  prop,
  filter,
  reject,
  isNil,
  defaultTo,
  cond,
  T,
  identity,
  find,
  complement,
  equals,
  always
} from 'ramda'
import type { Status } from '@/types'
import type { AccountStatusFilters } from '@/api/queries'

// ============================================================================
// DEDUPLICATION HELPERS
// ============================================================================

/**
 * Deduplicate items by their 'id' property
 */
export const uniqById = <T extends { id: string }>(items: T[]): T[] =>
  uniqBy((item: T) => item.id, items)

/**
 * Deduplicate items by a specific key
 */
export const uniqByKey = <T>(key: keyof T) =>
  (items: T[]): T[] => uniqBy((item: T) => item[key], items)

/**
 * Flatten paginated data and deduplicate by ID
 * Handles both array pages and PaginatedResponse pages (with data property)
 * Common pattern for infinite query results
 */
export const flattenAndUniqById = <T extends { id: string }>(pages: (T[] | { data: T[] })[] | undefined): T[] => {
  if (!pages) return []

  // Extract data from PaginatedResponse objects if present
  // Use Array.isArray to reliably distinguish arrays from objects
  const extractedPages: T[][] = pages.map(page => {
    if (Array.isArray(page)) {
      return page
    }
    // Must be PaginatedResponse with data property
    return page.data
  })

  // Use native flat() for proper typing
  const flattened = extractedPages.flat()
  return uniqBy((item: T) => item.id, flattened)
}

/**
 * Flatten paginated data and deduplicate by a specific key
 */
export const flattenAndUniqByKey = <T>(key: keyof T) =>
  (pages: T[][] | undefined): T[] => {
    const flattened = pages ? flatten(pages) : []
    return uniqBy((item: T) => item[key], flattened)
  }

/**
 * Flatten paginated data without deduplication
 * Handles both array pages and PaginatedResponse pages (with data property)
 * Use when data doesn't need deduplication (e.g., accounts, notifications)
 */
export const flattenPages = <T>(pages: (T[] | { data: T[] })[] | undefined): T[] => {
  if (!pages) return []

  // Extract data from PaginatedResponse objects if present
  // Use Array.isArray to reliably distinguish arrays from objects
  const extractedPages: T[][] = pages.map(page => {
    if (Array.isArray(page)) {
      return page
    }
    // Must be PaginatedResponse with data property
    return page.data
  })

  // Use native flat() instead of Ramda's flatten for proper typing
  return extractedPages.flat()
}

// ============================================================================
// NESTED MAP HELPERS (for cache updates)
// ============================================================================

/**
 * Map over nested pages structure (InfiniteData pattern)
 * Useful for updating statuses in paginated caches
 */
export const mapPages = <T>(fn: (item: T) => T) =>
  (pages: T[][]): T[][] => map(map(fn), pages)

/**
 * Map over pages with early return optimization
 * Only creates new arrays if the item changes
 */
export const mapPagesOptimized = <T>(fn: (item: T) => T) =>
  (pages: T[][]): T[][] =>
    pages.map(page => {
      let changed = false
      const newPage = page.map(item => {
        const result = fn(item)
        if (result !== item) changed = true
        return result
      })
      return changed ? newPage : page
    })

// ============================================================================
// FILTER HELPERS
// ============================================================================

/**
 * Filter out null/undefined values
 */
export const compact = <T>(items: (T | null | undefined)[]): T[] =>
  reject(isNil, items) as T[]

/**
 * Remove items matching a predicate
 */
export { reject }

// ============================================================================
// PROP ACCESS HELPERS
// ============================================================================

export { prop, map, filter, pipe, flatten, uniqBy, defaultTo }

// ============================================================================
// STATUS HELPERS (for mutations and cache updates)
// ============================================================================

/**
 * Check if a status matches by ID (either the status itself or its reblog)
 */
export const statusMatchesId = (statusId: string) => (status: Status): boolean =>
  status.id === statusId || status.reblog?.id === statusId

/**
 * Get the matching status (either the status itself or its reblog)
 */
export const getMatchingStatus = (statusId: string) => (status: Status): Status | undefined =>
  cond([
    [(s: Status) => s.id === statusId, identity],
    [(s: Status) => s.reblog?.id === statusId, (s: Status) => s.reblog!],
    [T, () => undefined]
  ])(status)

/**
 * Find status in a flat array of statuses
 * Returns the actual status (unwrapping reblog if needed)
 */
export const findStatusInArray = (statusId: string) => (statuses: Status[]): Status | undefined => {
  const found = find(statusMatchesId(statusId), statuses)
  return found ? getMatchingStatus(statusId)(found) : undefined
}

/**
 * Find status in paginated data (InfiniteData pattern)
 * Returns the actual status (unwrapping reblog if needed)
 */
export const findStatusInPages = (statusId: string) => (pages?: Status[][]): Status | undefined => {
  if (!pages) return undefined
  const flattened = flatten(pages)
  return findStatusInArray(statusId)(flattened)
}

/**
 * Update a status using cond for cleaner conditional logic
 * Handles both direct status and reblog status updates
 */
export const updateStatusById = (statusId: string, updateFn: (status: Status) => Status) =>
  (status: Status): Status =>
    cond([
      // If this status matches, update it
      [(s: Status) => s.id === statusId, updateFn],
      // If this is a reblog and the reblogged status matches, update the reblog
      [
        (s: Status) => Boolean(s.reblog && s.reblog.id === statusId),
        (s: Status) => ({ ...s, reblog: updateFn(s.reblog!) })
      ],
      // No match, return unchanged
      [T, identity]
    ])(status)

// ============================================================================
// NIL/UNDEFINED HELPERS
// ============================================================================

export const isNotNil = complement(isNil)

/**
 * Find the first non-nil value in an array of values
 */
export const findFirstNonNil = <T>(values: (T | null | undefined)[]): T | undefined =>
  find(isNotNil, values) as T | undefined

// ============================================================================
// ACCOUNT FILTERS HELPERS
// ============================================================================

/**
 * Get account status filters based on the selected tab
 */
export const getStatusFilters = cond<[string], AccountStatusFilters>([
  [equals('posts'), always({ exclude_replies: true })],
  [equals('posts_replies'), always({ exclude_replies: false, exclude_reblogs: true })],
  [equals('media'), always({ only_media: true })],
  [T, always({ exclude_replies: true })],
])

// ============================================================================
// CONTENT HELPERS
// ============================================================================

/**
 * Remove "RE: [link]" quote prefix patterns from post content.
 * Mastodon automatically adds "RE: [url]" to quote posts.
 * We remove it since we display the quoted status separately.
 */
export const removeQuotePrefix: (content: string) => string = pipe(
  // Remove <p class="quote-inline">RE: <a>...</a></p> (with nested spans)
  (s: string) => s.replace(/<p\s+class="quote-inline">RE:\s*<a[^>]*>.*?<\/a><\/p>\s*/gi, ''),
  // Remove RE: with link wrapped in regular <p> tag: <p>RE: <a>...</a></p>
  (s: string) => s.replace(/^<p>\s*RE:\s*<a[^>]*>.*?<\/a>\s*<\/p>\s*/i, ''),
  // Remove RE: with plain URL in <p>: <p>RE: https://...</p>
  (s: string) => s.replace(/^<p>\s*RE:\s*https?:\/\/[^\s<]+\s*<\/p>\s*/i, ''),
  // Remove RE: with link not in <p>: RE: <a>...</a>
  (s: string) => s.replace(/^RE:\s*<a[^>]*>.*?<\/a>\s*/i, ''),
  // Remove RE: with plain URL not in <p>: RE: https://...
  (s: string) => s.replace(/^RE:\s*https?:\/\/\S+\s*/i, ''),
  // Remove leftover empty paragraphs
  (s: string) => s.replace(/^<p>\s*<\/p>\s*/, ''),
  // Trim whitespace
  (s: string) => s.trim()
)

