/**
 * useStreaming Hook
 * Manages streaming connection lifecycle and integrates with React Query
 */

'use client'

import { useEffect, useEffectEvent, useState, useCallback } from 'react'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { getStreamingStore } from '../stores/streamingStore'
import { getConversationStore } from '../stores/conversationStore'
import { useInstance } from '../api/queries'
import { markConversationAsRead, type PaginatedResponse } from '../api/client'
import { useAuthStore } from './useStores'
import { useNotificationSound } from './useNotificationSound'
import { queryKeys } from '../api/queryKeys'
import type { Notification, Conversation, Context, Status } from '../types/mastodon'

/**
 * Hook to manage notification streaming connection
 * Connects when authenticated and disconnects on unmount
 */
export function useNotificationStream() {
    const queryClient = useQueryClient()
    const authStore = useAuthStore()
    const { data: instance } = useInstance()
    const streamingStore = getStreamingStore()
    const { play: playNotificationSound } = useNotificationSound()

    // Handle incoming notifications - using useEffectEvent to always access
    // the latest queryClient without making it a reactive dependency
    const handleNotification = useEffectEvent((notification: Notification) => {
        // Play boop sound if document is hidden (user is on another tab)
        if (document.hidden) {
            playNotificationSound();
        }

        // Only update notifications cache if it already exists (user has visited the page)
        // If no cache exists, don't create one - let the page fetch fresh data with proper loading
        const existingData = queryClient.getQueryData<InfiniteData<PaginatedResponse<Notification[]>>>(
            queryKeys.notifications.list()
        )

        if (existingData?.pages) {
            // Check if notification already exists
            const exists = existingData.pages.some(page =>
                page.data.some(n => n.id === notification.id)
            )

            if (!exists) {
                // Prepend to first page
                queryClient.setQueryData<InfiniteData<PaginatedResponse<Notification[]>>>(
                    queryKeys.notifications.list(),
                    {
                        ...existingData,
                        pages: [
                            { ...existingData.pages[0], data: [notification, ...existingData.pages[0].data] },
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

/**
 * Hook to manage conversation (direct message) streaming
 * Uses the same WebSocket connection as notifications (multiplexed)
 */
export function useConversationStream() {
    const queryClient = useQueryClient()
    const streamingStore = getStreamingStore()
    const { play: playNotificationSound } = useNotificationSound()
    const conversationStore = getConversationStore()

    // Handle incoming conversations
    const handleConversation = useEffectEvent((conversation: Conversation) => {
        // Play boop sound
        playNotificationSound();

        // Only update conversations cache if it already exists
        const existingData = queryClient.getQueryData<InfiniteData<PaginatedResponse<Conversation[]>>>(
            queryKeys.conversations.list()
        )

        if (existingData?.pages) {
            // Check if conversation already exists
            const pageIndex = existingData.pages.findIndex(page =>
                page.data.some(c => c.id === conversation.id)
            )

            if (pageIndex >= 0) {
                // Update existing conversation
                queryClient.setQueryData<InfiniteData<PaginatedResponse<Conversation[]>>>(
                    queryKeys.conversations.list(),
                    {
                        ...existingData,
                        pages: existingData.pages.map((page, idx) =>
                            idx === pageIndex
                                ? { ...page, data: page.data.map(c => c.id === conversation.id ? conversation : c) }
                                : page
                        ),
                    }
                )
            } else {
                // Prepend new conversation to first page
                queryClient.setQueryData<InfiniteData<PaginatedResponse<Conversation[]>>>(
                    queryKeys.conversations.list(),
                    {
                        ...existingData,
                        pages: [
                            { ...existingData.pages[0], data: [conversation, ...existingData.pages[0].data] },
                            ...existingData.pages.slice(1)
                        ],
                    }
                )
            }
        }

        // Update the cached conversation in sessionStorage if this is the active conversation
        const activeConversationId = conversationStore.activeConversationId
        if (activeConversationId && activeConversationId === conversation.id) {
            // Update the conversation in the store (this also updates sessionStorage)
            // Mark as read since user is viewing this conversation
            const updatedConversation = { ...conversation, unread: false }
            conversationStore.setConversation(updatedConversation)

            // Only call API if the conversation was actually unread (prevents infinite loop)
            if (conversation.unread) {
                markConversationAsRead(conversation.id).catch(console.debug)
            }

            // Update the conversation in the list cache to show as read
            if (existingData?.pages) {
                queryClient.setQueryData<InfiniteData<PaginatedResponse<Conversation[]>>>(
                    queryKeys.conversations.list(),
                    {
                        ...existingData,
                        pages: existingData.pages.map(page => ({
                            ...page,
                            data: page.data.map(c => c.id === conversation.id ? updatedConversation : c)
                        })),
                    }
                )
            }
        }

        // Update context cache if we have a new message for the active conversation
        // This ensures real-time messages appear in the chat detail page
        if (conversation.last_status) {
            const newStatus = conversation.last_status
            // Try to find any existing context cache that might contain this status
            // We look for context caches where this status should be appended
            const contextQueries = queryClient.getQueriesData<Context>({
                queryKey: ['statuses'],
                predicate: (query) => {
                    // Match context queries: ['statuses', '<id>', 'context']
                    return query.queryKey.length === 3 && query.queryKey[2] === 'context'
                }
            })

            for (const [queryKey, contextData] of contextQueries) {
                if (contextData) {
                    // Check if this status already exists in ancestors or descendants
                    const existsInAncestors = contextData.ancestors.some(s => s.id === newStatus.id)
                    const existsInDescendants = contextData.descendants.some(s => s.id === newStatus.id)

                    // If the new status is a reply in this thread, add it to descendants
                    if (!existsInAncestors && !existsInDescendants) {
                        // Check if this status belongs to this context by checking reply chain
                        const contextStatusId = queryKey[1] as string
                        const isReplyToContext = newStatus.in_reply_to_id === contextStatusId ||
                            contextData.descendants.some(s => s.id === newStatus.in_reply_to_id) ||
                            contextData.ancestors.some(s => s.id === newStatus.in_reply_to_id)

                        if (isReplyToContext) {
                            queryClient.setQueryData<Context>(queryKey, {
                                ...contextData,
                                descendants: [...contextData.descendants, newStatus]
                            })
                        }
                    }
                }
            }
        }

        // Invalidate unread count
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations.unreadCount() })
    })

    // Set up conversation handler (will auto-subscribe to 'direct' stream)
    useEffect(() => {
        streamingStore.setOnConversation(handleConversation)
        return () => streamingStore.setOnConversation(null)
    }, [streamingStore])

    return { status: streamingStore.status }
}

/**
 * Hook to manage home timeline streaming
 * Queues new statuses and provides a way to merge them into the feed
 */
export function useTimelineStream() {
    const queryClient = useQueryClient()
    const streamingStore = getStreamingStore()
    const [pendingStatuses, setPendingStatuses] = useState<Status[]>([])

    // Handle incoming statuses
    const handleTimelineUpdate = useEffectEvent((status: Status) => {
        // Check if status is already in the main cache
        const queryKey = queryKeys.timelines.home()
        const existingData = queryClient.getQueryData<InfiniteData<PaginatedResponse<Status[]>>>(queryKey)

        // Check if status exists in current cache
        const existsInCache = existingData?.pages.some(page =>
            page.data.some(s => s.id === status.id)
        )

        // Check if status is already in pending
        const existsInPending = pendingStatuses.some(s => s.id === status.id)

        if (!existsInCache && !existsInPending) {
            setPendingStatuses(prev => [status, ...prev])
        }
    })

    // Set up timeline handler
    useEffect(() => {
        streamingStore.setOnTimelineUpdate(handleTimelineUpdate)
        return () => streamingStore.setOnTimelineUpdate(null)
    }, [streamingStore])

    const showNewPosts = useCallback(() => {
        if (pendingStatuses.length === 0) return

        const queryKey = queryKeys.timelines.home()

        queryClient.setQueryData<InfiniteData<PaginatedResponse<Status[]>>>(
            queryKey,
            (oldData) => {
                if (!oldData?.pages) return oldData

                // Create a new first page with pending statuses prepended
                const firstPage = oldData.pages[0]
                const newFirstPage = {
                    ...firstPage,
                    data: [...pendingStatuses, ...firstPage.data]
                }

                return {
                    ...oldData,
                    pages: [newFirstPage, ...oldData.pages.slice(1)]
                }
            }
        )

        // Clear pending statuses
        setPendingStatuses([])

        // Scroll to top
        window.scrollTo(0, 0)

    }, [pendingStatuses, queryClient])

    return {
        status: streamingStore.status,
        newPostsCount: pendingStatuses.length,
        showNewPosts
    }
}
