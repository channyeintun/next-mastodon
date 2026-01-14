/**
 * Media API
 */

import { api } from './base'
import type { MediaAttachment } from '../../types/mastodon'

export async function uploadMedia(file: File, description?: string): Promise<MediaAttachment> {
    const formData = new FormData()
    formData.append('file', file)
    if (description) {
        formData.append('description', description)
    }

    const { data } = await api.post<MediaAttachment>('/api/v2/media', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return data
}

export async function updateMedia(id: string, description: string): Promise<MediaAttachment> {
    const formData = new FormData()
    formData.append('description', description)

    const { data } = await api.put<MediaAttachment>(`/api/v1/media/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return data
}

export async function getMediaAttachment(id: string): Promise<MediaAttachment> {
    const { data } = await api.get<MediaAttachment>(`/api/v1/media/${id}`)
    return data
}
