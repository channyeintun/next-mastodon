/**
 * Server-side API utilities for getServerSideProps
 * 
 * These functions make direct HTTP requests to the Mastodon API
 * and are designed to run only on the server.
 */

import type { Status, Account } from '@/types/mastodon';

// Default to mastodon.social for public API calls
// In production, this could be configured via environment variable
const DEFAULT_INSTANCE = process.env.NEXT_PUBLIC_MASTODON_INSTANCE || 'https://mastodon.social';

/**
 * Fetch a status by ID from the Mastodon API (server-side)
 * Returns null if the status is not found or an error occurs
 */
export async function getStatusServer(
    id: string,
    instanceUrl: string = DEFAULT_INSTANCE
): Promise<Status | null> {
    try {
        const response = await fetch(`${instanceUrl}/api/v1/statuses/${id}`, {
            headers: {
                'Accept': 'application/json',
            },
            // Note: Caching is handled differently in Pages Router
            // For SSR with getServerSideProps, each request is fresh
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            console.error(`Failed to fetch status ${id}: ${response.status}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching status ${id}:`, error);
        return null;
    }
}

/**
 * Lookup an account by acct (username@domain) from the Mastodon API (server-side)
 * Returns null if the account is not found or an error occurs
 */
export async function lookupAccountServer(
    acct: string,
    instanceUrl: string = DEFAULT_INSTANCE
): Promise<Account | null> {
    try {
        const params = new URLSearchParams({ acct });
        const response = await fetch(`${instanceUrl}/api/v1/accounts/lookup?${params}`, {
            headers: {
                'Accept': 'application/json',
            },
            // Note: Caching is handled differently in Pages Router
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            console.error(`Failed to lookup account ${acct}: ${response.status}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error(`Error looking up account ${acct}:`, error);
        return null;
    }
}

/**
 * Get an account by ID from the Mastodon API (server-side)
 * Returns null if the account is not found or an error occurs
 */
export async function getAccountServer(
    id: string,
    instanceUrl: string = DEFAULT_INSTANCE
): Promise<Account | null> {
    try {
        const response = await fetch(`${instanceUrl}/api/v1/accounts/${id}`, {
            headers: {
                'Accept': 'application/json',
            },
            // Note: Caching is handled differently in Pages Router
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            console.error(`Failed to fetch account ${id}: ${response.status}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching account ${id}:`, error);
        return null;
    }
}
