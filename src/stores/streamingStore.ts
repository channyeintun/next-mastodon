/**
 * Streaming Store
 * Manages WebSocket connection for real-time Mastodon events
 * Uses a single WebSocket with multiplexing for notifications and conversations
 */

import { makeAutoObservable, runInAction } from 'mobx'
import type { Notification, Conversation, Status } from '../types/mastodon'

export type StreamingStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

// Exponential backoff for reconnection
function getReconnectDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 30000) // Max 30 seconds
}

export class StreamingStore {
    socket: WebSocket | null = null
    status: StreamingStatus = 'disconnected'
    error: string | null = null
    reconnectAttempts: number = 0
    maxReconnectAttempts: number = 10

    // Event callbacks (set by useStreaming hooks)
    onNotification: ((notification: Notification) => void) | null = null
    onConversation: ((conversation: Conversation) => void) | null = null
    onTimelineUpdate: ((status: Status) => void) | null = null

    // Track which streams are subscribed
    private subscribedStreams: Set<string> = new Set()
    private streamingUrl: string | null = null
    private accessToken: string | null = null
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null

    constructor() {
        makeAutoObservable(this, {
            socket: false, // Don't make WebSocket observable
        })
    }

    setOnNotification(callback: ((notification: Notification) => void) | null) {
        this.onNotification = callback
        // Auto-subscribe to notification stream when callback is set
        if (callback && this.status === 'connected' && !this.subscribedStreams.has('user:notification')) {
            this.subscribe('user:notification')
        }
    }

    setOnConversation(callback: ((conversation: Conversation) => void) | null) {
        this.onConversation = callback
        // Auto-subscribe to direct stream when callback is set
        if (callback && this.status === 'connected' && !this.subscribedStreams.has('direct')) {
            this.subscribe('direct')
        }
    }

    setOnTimelineUpdate(callback: ((status: Status) => void) | null) {
        this.onTimelineUpdate = callback
        // Auto-subscribe to user stream when callback is set
        if (callback && this.status === 'connected' && !this.subscribedStreams.has('user')) {
            this.subscribe('user')
        }
    }

    private subscribe(stream: string) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({ type: 'subscribe', stream })
            this.socket.send(message)
            this.subscribedStreams.add(stream)
            console.log(`[Streaming] Subscribed to ${stream}`)
        }
    }

    private unsubscribe(stream: string) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({ type: 'unsubscribe', stream })
            this.socket.send(message)
            this.subscribedStreams.delete(stream)
            console.log(`[Streaming] Unsubscribed from ${stream}`)
        }
    }

    connect(streamingUrl: string, accessToken: string) {
        // Don't connect if already connecting or connected
        if (this.status === 'connecting' || this.status === 'connected') {
            return
        }

        // Store for reconnection
        this.streamingUrl = streamingUrl
        this.accessToken = accessToken

        // Clean up existing socket if any — detach handlers first so its
        // onclose/onerror can't clobber the new connection's state
        if (this.socket) {
            this.socket.onopen = null
            this.socket.onmessage = null
            this.socket.onerror = null
            this.socket.onclose = null
            this.socket.close()
        }

        // Clear any pending reconnect
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout)
            this.reconnectTimeout = null
        }

        runInAction(() => {
            this.status = 'connecting'
            this.error = null
        })

        try {
            // Construct WebSocket URL with auth (no stream param - we'll subscribe dynamically)
            const wsUrl = new URL('/api/v1/streaming', streamingUrl)
            wsUrl.protocol = wsUrl.protocol.replace('http', 'ws')
            wsUrl.searchParams.set('access_token', accessToken)

            const socket = new WebSocket(wsUrl.toString())

            socket.onopen = () => {
                console.log('[Streaming] Connected to Mastodon streaming API')
                runInAction(() => {
                    this.status = 'connected'
                    this.reconnectAttempts = 0
                    this.error = null
                })

                // Subscribe to active streams
                if (this.onNotification) {
                    this.subscribe('user:notification')
                }
                if (this.onConversation) {
                    this.subscribe('direct')
                }
                if (this.onTimelineUpdate) {
                    this.subscribe('user')
                }
            }

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)

                    // Handle different event types
                    if (data.event === 'notification') {
                        const notification: Notification = JSON.parse(data.payload)
                        if (this.onNotification) {
                            this.onNotification(notification)
                        }
                    } else if (data.event === 'conversation') {
                        const conversation: Conversation = JSON.parse(data.payload)
                        if (this.onConversation) {
                            this.onConversation(conversation)
                        }
                    } else if (data.event === 'update') {
                        const status: Status = JSON.parse(data.payload)
                        if (this.onTimelineUpdate) {
                            this.onTimelineUpdate(status)
                        }
                    }
                } catch {
                    // Ignore parse errors (heartbeat messages, etc.)
                }
            }

            socket.onerror = (error) => {
                if (this.socket !== socket) return
                console.error('[Streaming] WebSocket error:', error)
                runInAction(() => {
                    this.status = 'error'
                    this.error = 'WebSocket connection error'
                })
            }

            socket.onclose = (event) => {
                if (this.socket !== socket) return
                console.log('[Streaming] Connection closed:', event.code, event.reason)

                const currentAttempts = this.reconnectAttempts
                const maxAttempts = this.maxReconnectAttempts

                runInAction(() => {
                    this.socket = null
                    this.status = 'disconnected'
                })

                // Attempt to reconnect if not intentionally closed
                if (event.code !== 1000 && currentAttempts < maxAttempts && this.streamingUrl && this.accessToken) {
                    const delay = getReconnectDelay(currentAttempts)
                    console.log(`[Streaming] Reconnecting in ${delay}ms (attempt ${currentAttempts + 1})`)

                    runInAction(() => {
                        this.reconnectAttempts = currentAttempts + 1
                    })

                    this.reconnectTimeout = setTimeout(() => {
                        if (this.status === 'disconnected' && this.streamingUrl && this.accessToken) {
                            this.connect(this.streamingUrl, this.accessToken)
                        }
                    }, delay)
                }
            }

            this.socket = socket
        } catch (error) {
            console.error('[Streaming] Failed to connect:', error)
            runInAction(() => {
                this.status = 'error'
                this.error = 'Failed to establish connection'
            })
        }
    }

    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout)
            this.reconnectTimeout = null
        }

        if (this.socket) {
            this.socket.close(1000, 'User disconnected')
        }

        runInAction(() => {
            this.socket = null
            this.status = 'disconnected'
            this.reconnectAttempts = 0
            this.error = null
            this.streamingUrl = null
            this.accessToken = null
            this.subscribedStreams.clear()
        })
    }
}

// Singleton instance
let streamingStore: StreamingStore | null = null

export function getStreamingStore(): StreamingStore {
    if (typeof window === 'undefined') {
        // SSR: return new instance (won't be used)
        return new StreamingStore()
    }

    if (!streamingStore) {
        streamingStore = new StreamingStore()
    }
    return streamingStore
}
