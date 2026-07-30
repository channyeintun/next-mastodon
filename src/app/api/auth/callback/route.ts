import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sanitizeInstanceUrlForServer } from '@/utils/instanceUrl'

/**
 * POST /api/auth/callback
 * Server-side token exchange endpoint
 * 
 * Receives: code, code_verifier, redirect_uri
 * Reads: instanceURL, clientId, clientSecret from cookies
 * Returns: access_token
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { code, code_verifier, redirect_uri } = body

        if (!code || !code_verifier || !redirect_uri) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            )
        }

        // Read auth data from cookies. The instance URL is client-writable, so
        // it is validated before it becomes an outbound request target.
        const cookieStore = await cookies()
        const instanceURL = sanitizeInstanceUrlForServer(cookieStore.get('instanceURL')?.value)
        const clientId = cookieStore.get('clientId')?.value
        const clientSecret = cookieStore.get('clientSecret')?.value

        if (!instanceURL || !clientId || !clientSecret) {
            return NextResponse.json(
                { error: 'Missing authentication data. Please try signing in again.' },
                { status: 400 }
            )
        }

        // Exchange code for access token
        const tokenResponse = await fetch(`${instanceURL}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri,
                code_verifier,
            }),
        })

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json().catch(() => ({}))
            console.error('Token exchange failed:', errorData)
            return NextResponse.json(
                { error: errorData.error_description || 'Token exchange failed' },
                { status: tokenResponse.status }
            )
        }

        const tokenData = await tokenResponse.json()

        return NextResponse.json({
            access_token: tokenData.access_token,
            token_type: tokenData.token_type,
            scope: tokenData.scope,
            created_at: tokenData.created_at,
        })
    } catch (error) {
        console.error('Callback API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
