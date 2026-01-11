/**
 * Search API
 */

import { api, wrapPaginatedResponse, type PaginatedResponse } from './base'
import type { SearchParams, SearchResults } from '../../types/mastodon'

export async function search(params: SearchParams, signal?: AbortSignal): Promise<PaginatedResponse<SearchResults>> {
    // Filter out undefined values to avoid "type=undefined" in query string
    const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
    )
    const response = await api.get<SearchResults>('/api/v2/search', {
        params: filteredParams,
        signal,
    })
    return wrapPaginatedResponse(response.data, response.headers.link)
}
