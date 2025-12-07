/**
 * useStreaming Hook
 * Manages streaming connection lifecycle and integrates with React Query
 */

'use client'

import { useEffect, useCallback } from 'react'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { observer } from 'mobx-react-lite'
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

    // Handle incoming notifications
    const handleNotification = useCallback((notification: Notification) => {
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
    }, [queryClient])

    // Set up notification handler
    useEffect(() => {
        streamingStore.setOnNotification(handleNotification)
        return () => streamingStore.setOnNotification(null)
    }, [handleNotification, streamingStore])

    // Connect/disconnect based on auth state
    useEffect(() => {
        if (authStore.isAuthenticated && instance) {
            const accessToken = Cookies.get('accessToken')
            const instanceURL = Cookies.get('instanceURL') || 'https://mastodon.social'

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
