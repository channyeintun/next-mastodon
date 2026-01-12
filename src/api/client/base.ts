/**
 * Base API Client
 * Axios instance with authentication interceptor
 */

import axios, { type AxiosInstance } from 'axios'
import { getRootStore } from '../../stores/rootStore'
import { getNextMaxId, getPrevMinId } from '../parseLinkHeader'
import { LOCALE_COOKIE_NAME, defaultLocale } from '@/i18n/config'

/**
 * Response type for paginated endpoints that include Link header pagination
 */
export interface PaginatedResponse<T> {
    data: T
    nextMaxId?: string
    prevMinId?: string
}

// Create axios instance with default base URL
export const api: AxiosInstance = axios.create({
    baseURL: 'https://mastodon.social', // Default instance
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to attach auth token and set base URL
api.interceptors.request.use(
    (config) => {
        // Get auth state from MobX store (in-memory, synced with cookies)
        const { authStore } = getRootStore()

        // Set instance URL if available
        if (authStore.instanceURL) {
            config.baseURL = authStore.instanceURL
        }

        // Attach access token if available
        if (authStore.accessToken) {
            config.headers.Authorization = `Bearer ${authStore.accessToken}`
        }

        // Parse locale from cookie if running in browser
        let locale = defaultLocale as string;
        if (typeof document !== 'undefined') {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${LOCALE_COOKIE_NAME}=`);
            if (parts.length === 2) {
                locale = parts.pop()?.split(';').shift() || defaultLocale;
            }
        }

        config.headers['Accept-Language'] = locale;

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle 401 Unauthorized errors
            if (error.response.status === 401) {
                const requestUrl = error.config?.url || ''
                // Don't show modal for sign-in related endpoints
                const isSignInRequest = requestUrl.includes('/oauth/token') || requestUrl.includes('/api/v1/apps')

                if (!isSignInRequest) {
                    // Show auth modal via MobX store
                    if (typeof window !== 'undefined') {
                        getRootStore().authStore.openAuthModal()
                    }
                }
            }

            const errorMessage = error.response.data?.error || `HTTP ${error.response.status}`
            throw new Error(errorMessage)
        }
        throw error
    }
)

// Helper function to create a custom axios instance for a specific instance URL
// Used for trending statuses from mastodon.social
export function createCustomClient(instanceURL: string): AxiosInstance {
    return axios.create({
        baseURL: instanceURL.replace(/\/$/, ''),
        headers: {
            'Content-Type': 'application/json',
        },
    })
}

// Helper to wrap paginated responses
export function wrapPaginatedResponse<T>(data: T, linkHeader?: string): PaginatedResponse<T> {
    return {
        data,
        nextMaxId: getNextMaxId(linkHeader),
        prevMinId: getPrevMinId(linkHeader),
    }
}
