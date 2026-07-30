/**
 * Server-side API utilities for App Router
 * 
 * These functions can make API calls from Server Components
 * using cookies for authentication instead of MobX store.
 */

import axios from 'axios';
import { cookies } from 'next/headers';
import type { Account, Status } from '@/types/mastodon';
import { sanitizeInstanceUrlForServer } from '@/utils/instanceUrl';

const DEFAULT_INSTANCE_URL = 'https://mastodon.social';

/**
 * Create an axios instance for server-side API calls.
 * Reads instanceURL and accessToken from cookies.
 *
 * The instanceURL cookie is client-writable, so it is validated before it
 * becomes a request target — an unvalidated value would let a crafted cookie
 * aim these server-side fetches at internal addresses.
 */
async function getServerClient() {
    const cookieStore = await cookies();
    const instanceURL =
        sanitizeInstanceUrlForServer(cookieStore.get('instanceURL')?.value) ?? DEFAULT_INSTANCE_URL;
    const accessToken = cookieStore.get('accessToken')?.value;

    const client = axios.create({
        baseURL: instanceURL,
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
    });

    return client;
}

/**
 * Lookup account by acct (e.g., "user" or "user@domain.com")
 * Server-side version for prefetching
 */
export async function lookupAccountServer(acct: string): Promise<Account | null> {
    try {
        const client = await getServerClient();
        const { data } = await client.get<Account>('/api/v1/accounts/lookup', {
            params: { acct },
        });
        return data;
    } catch (error) {
        console.error('Server lookupAccount error:', error);
        return null;
    }
}

/**
 * Get status by ID
 * Server-side version for prefetching
 */
export async function getStatusServer(id: string): Promise<Status | null> {
    try {
        const client = await getServerClient();
        const { data } = await client.get<Status>(`/api/v1/statuses/${id}`);
        return data;
    } catch (error) {
        console.error('Server getStatus error:', error);
        return null;
    }
}
