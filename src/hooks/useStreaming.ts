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
        // Add to the beginning of the notifications list
        queryClient.setQueryData<InfiniteData<Notification[]>>(
            queryKeys.notifications.list(),
            (old) => {
                if (!old?.pages) {
                    return {
                        pages: [[notification]],
                        pageParams: [undefined],
                    }
                }

                // Check if notification already exists
                const exists = old.pages.some(page =>
                    page.some(n => n.id === notification.id)
                )
                if (exists) return old

                // Prepend to first page
                return {
                    ...old,
                    pages: [
                        [notification, ...old.pages[0]],
                        ...old.pages.slice(1)
                    ],
                }
            }
        )

        // Invalidate unread count to refetch
        queryClient.invalidateQueries({
            queryKey: queryKeys.notifications.unreadCount()
        })
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
