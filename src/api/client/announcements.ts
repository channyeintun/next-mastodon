/**
 * Announcements API
 *
 * Instance-wide notices posted by admins (outages, rule changes, downtime).
 * Anonymous callers can read them; dismissing and reacting require a token.
 */

import type { AxiosInstance } from 'axios'
import { api } from './base'
import type { Announcement } from '../../types/mastodon'

/**
 * @param withDismissed when true, includes announcements the user already
 *   dismissed. Defaults to false, which is what the UI wants.
 */
export async function getAnnouncements(
    params?: { with_dismissed?: boolean },
    signal?: AbortSignal,
    customClient?: AxiosInstance
): Promise<Announcement[]> {
    const client = customClient || api
    const response = await client.get<Announcement[]>('/api/v1/announcements', { params, signal })
    return response.data
}

/** Mark an announcement as read. It will not be returned again by default. */
export async function dismissAnnouncement(id: string, customClient?: AxiosInstance): Promise<void> {
    const client = customClient || api
    await client.post(`/api/v1/announcements/${id}/dismiss`)
}

export async function addAnnouncementReaction(id: string, name: string, customClient?: AxiosInstance): Promise<void> {
    const client = customClient || api
    await client.put(`/api/v1/announcements/${id}/reactions/${encodeURIComponent(name)}`)
}

export async function removeAnnouncementReaction(id: string, name: string, customClient?: AxiosInstance): Promise<void> {
    const client = customClient || api
    await client.delete(`/api/v1/announcements/${id}/reactions/${encodeURIComponent(name)}`)
}
