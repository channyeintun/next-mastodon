'use server'

import { cookies } from 'next/headers'

/**
 * Store client_secret as an httpOnly cookie (not accessible to JavaScript)
 * This action is called from the signin page after app registration
 */
export async function storeClientSecret(clientSecret: string) {
    const cookieStore = await cookies()

    cookieStore.set('clientSecret', clientSecret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
    })
}

/**
 * Store instance URL (readable by client, not httpOnly)
 */
export async function storeInstanceURL(instanceURL: string) {
    const cookieStore = await cookies()

    cookieStore.set('instanceURL', instanceURL, {
        httpOnly: false, // Client needs to read this
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
    })
}

/**
 * Store client ID (readable by client, not httpOnly)
 */
export async function storeClientId(clientId: string) {
    const cookieStore = await cookies()

    cookieStore.set('clientId', clientId, {
        httpOnly: false, // Client needs to read this
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
    })
}
