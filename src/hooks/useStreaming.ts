/**
 * useStreaming Hook
 * Manages streaming connection lifecycle and integrates with React Query
 */

'use client'

import { useEffect, useEffectEvent } from 'react'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { getStreamingStore } from '../stores/streamingStore'
import { useInstance } from '../api/queries'
import { useAuthStore } from './useStores'
import { queryKeys } from '../api/queryKeys'
import type { Notification } from '../types/mastodon'

/**
 * Hook to manage notification streaming connection
 * Connects when authenticated and disconnects on unmount
 */
export function useNotificationStream() {
    const queryClient = useQueryClient()
    const authStore = useAuthStore()
    const { data: instance } = useInstance()
    const streamingStore = getStreamingStore()

    // Handle incoming notifications - using useEffectEvent to always access
    // the latest queryClient without making it a reactive dependency
    const handleNotification = useEffectEvent((notification: Notification) => {
        // Only update notifications cache if it already exists (user has visited the page)
        // If no cache exists, don't create one - let the page fetch fresh data with proper loading
        const existingData = queryClient.getQueryData<InfiniteData<Notification[]>>(
            queryKeys.notifications.list()
        )

        if (existingData?.pages) {
            // Check if notification already exists
            const exists = existingData.pages.some(page =>
                page.some(n => n.id === notification.id)
            )

            if (!exists) {
                // Prepend to first page
                queryClient.setQueryData<InfiniteData<Notification[]>>(
                    queryKeys.notifications.list(),
                    {
                        ...existingData,
                        pages: [
                            [notification, ...existingData.pages[0]],
                            ...existingData.pages.slice(1)
                        ],
                    }
                )
            }
        }

        // Optimistically increment unread count for immediate badge update
        queryClient.setQueryData<{ count: number }>(
            queryKeys.notifications.unreadCount(),
            (old) => {
                const currentCount = old?.count ?? 0
                return { count: currentCount + 1 }
            }
        )
    })

    // Set up notification handler
    useEffect(() => {
        streamingStore.setOnNotification(handleNotification)
        return () => streamingStore.setOnNotification(null)
    }, [streamingStore])

    // Connect/disconnect based on auth state
    useEffect(() => {
        if (authStore.isAuthenticated && instance) {
            // Read from authStore instead of cookies (in-memory, synced with cookies)
            const accessToken = authStore.accessToken
            const instanceURL = authStore.instanceURL || 'https://mastodon.social'

            // Use streaming URL from instance config, fallback to instance URL
            const streamingUrl = instance.configuration?.urls?.streaming || instanceURL

            if (accessToken && streamingStore.status === 'disconnected') {
                streamingStore.connect(streamingUrl, accessToken)
            }
        } else {
            streamingStore.disconnect()
        }

        return () => {
            // Note: We don't disconnect on unmount to maintain connection across navigation
            // The connection will be cleaned up when auth state changes
        }
    }, [authStore.isAuthenticated, instance, streamingStore])

    return { status: streamingStore.status }
}
