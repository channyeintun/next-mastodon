/**
 * Streaming Store
 * Manages WebSocket connection for real-time Mastodon events
 */

import { makeAutoObservable, runInAction } from 'mobx'
import type { Notification } from '../types/mastodon'

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

    // Event callback (set by useStreaming hook)
    onNotification: ((notification: Notification) => void) | null = null

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
    }

    connect(streamingUrl: string, accessToken: string) {
        // Don't connect if already connecting or connected
        if (this.status === 'connecting' || this.status === 'connected') {
            return
        }

        // Store for reconnection
        this.streamingUrl = streamingUrl
        this.accessToken = accessToken

        // Clean up existing socket if any
        if (this.socket) {
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
            // Construct WebSocket URL with auth
            const wsUrl = new URL('/api/v1/streaming', streamingUrl)
            wsUrl.protocol = wsUrl.protocol.replace('http', 'ws')
            wsUrl.searchParams.set('access_token', accessToken)
            wsUrl.searchParams.set('stream', 'user:notification')

            const socket = new WebSocket(wsUrl.toString())

            socket.onopen = () => {
                console.log('[Streaming] Connected to notification stream')
                runInAction(() => {
                    this.status = 'connected'
                    this.reconnectAttempts = 0
                    this.error = null
                })
            }

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)

                    if (data.event === 'notification') {
                        const notification: Notification = JSON.parse(data.payload)
                        if (this.onNotification) {
                            this.onNotification(notification)
                        }
                    }
                } catch {
                    // Ignore parse errors (heartbeat messages, etc.)
                }
            }

            socket.onerror = (error) => {
                console.error('[Streaming] WebSocket error:', error)
                runInAction(() => {
                    this.status = 'error'
                    this.error = 'WebSocket connection error'
                })
            }

            socket.onclose = (event) => {
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
