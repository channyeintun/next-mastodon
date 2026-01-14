'use server'

import { cookies, headers } from 'next/headers'

/**
 * Helper to get cookie domain from headers
 */
async function getServerCookieDomain() {
    const headerList = await headers()
    const host = headerList.get('host') || ''
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
        return undefined
    }
    return '.mastodon.website'
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
    const cookieStore = await cookies()
    const domain = await getServerCookieDomain()

    cookieStore.set('instanceURL', instanceURL, {
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
