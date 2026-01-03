import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

/**
 * Server-side QueryClient factory with request-level caching.
 * 
 * Uses React's cache() to ensure the same QueryClient instance
 * is used throughout a single request, but a new one is created
 * for each new request.
 * 
 * This is important for:
 * 1. Avoiding shared state between requests
 * 2. Allowing prefetchQuery to work correctly
 * 3. Enabling dehydration of the prefetched state
 */
export const getQueryClient = cache(() => new QueryClient({
    defaultOptions: {
        queries: {
            // Slightly longer stale time for server-prefetched data
            staleTime: 60 * 1000,
            // Don't retry on server - let client handle retries
            retry: false,
        },
    },
}));
