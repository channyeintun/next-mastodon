/**
 * Trends API
 */

import type { AxiosInstance } from 'axios'
import { api, wrapPaginatedResponse, type PaginatedResponse } from './base'
import type { Status, Tag, TrendingLink } from '../../types/mastodon'

export async function getTrendingStatuses(params?: { limit?: number; offset?: number }, signal?: AbortSignal, customClient?: AxiosInstance): Promise<PaginatedResponse<Status[]>> {
    const client = customClient || api
    const response = await client.get<Status[]>('/api/v1/trends/statuses', { params, signal })
    return wrapPaginatedResponse(response.data, response.headers.link)
}

export async function getTrendingTags(params?: { limit?: number; offset?: number }, signal?: AbortSignal, customClient?: AxiosInstance): Promise<PaginatedResponse<Tag[]>> {
    const client = customClient || api
    const response = await client.get<Tag[]>('/api/v1/trends/tags', { params, signal })
    return wrapPaginatedResponse(response.data, response.headers.link)
}

export async function getTrendingLinks(params?: { limit?: number; offset?: number }, signal?: AbortSignal, customClient?: AxiosInstance): Promise<PaginatedResponse<TrendingLink[]>> {
    const client = customClient || api
    const response = await client.get<TrendingLink[]>('/api/v1/trends/links', { params, signal })
    return wrapPaginatedResponse(response.data, response.headers.link)
}
