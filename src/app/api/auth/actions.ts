'use server'

import { cookies, headers } from 'next/headers'
import { sanitizeInstanceUrlForServer } from '@/utils/instanceUrl'

/**
 * Helper to get cookie domain from headers
 */
async function getServerCookieDomain() {
    const headerList = await headers()
    // Strip the port before matching (host header may be e.g. "localhost:9003")
    const hostname = (headerList.get('host') || '').split(':')[0]
    // Only set a Domain attribute on the production domain; browsers reject
    // cookies whose Domain doesn't match the current host (previews, forks)
    if (hostname === 'mastodon.website' || hostname.endsWith('.mastodon.website')) {
        return '.mastodon.website'
    }
    return undefined
}

/**
 * Store client_secret as an httpOnly cookie (not accessible to JavaScript)
 * This action is called from the signin page after app registration
 */
export async function storeClientSecret(clientSecret: string) {
    const cookieStore = await cookies()
    const domain = await getServerCookieDomain()

    cookieStore.set('clientSecret', clientSecret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        domain,
    })
}

/**
 * Store instance URL (readable by client, not httpOnly)
 */
export async function storeInstanceURL(instanceURL: string) {
    // Everything downstream (token exchange, revocation, server-side API calls)
    // turns this value into an outbound request, so reject anything that isn't
    // a public https host before it is persisted.
    const safeInstanceURL = sanitizeInstanceUrlForServer(instanceURL)
    if (!safeInstanceURL) {
        throw new Error('Invalid instance URL')
    }

    const cookieStore = await cookies()
    const domain = await getServerCookieDomain()

    cookieStore.set('instanceURL', safeInstanceURL, {
        httpOnly: false, // Client needs to read this
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        domain,
    })
}

/**
 * Store client ID (readable by client, not httpOnly)
 */
export async function storeClientId(clientId: string) {
    const cookieStore = await cookies()
    const domain = await getServerCookieDomain()

    cookieStore.set('clientId', clientId, {
        httpOnly: false, // Client needs to read this
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        domain,
    })
}

/**
 * Clear all auth cookies server-side.
 * This is needed because clientSecret is httpOnly and can't be cleared from the client.
 * Also ensures the correct domain is used when deleting cookies on production.
 */
export async function clearAuthCookies() {
    const cookieStore = await cookies()
    const domain = await getServerCookieDomain()

    const cookieNames = ['instanceURL', 'clientId', 'clientSecret', 'accessToken']
    for (const name of cookieNames) {
        cookieStore.set(name, '', {
            httpOnly: name === 'clientSecret',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 0,
            domain,
        })
    }
}
