/**
 * OAuth utilities for Mastodon authentication
 */

const APP_NAME = 'Mastodon'
const REDIRECT_URI = typeof window !== 'undefined'
  ? `${window.location.origin}/auth/callback`
  : 'http://localhost:9003/auth/callback'
const SCOPES = 'read write follow push'

/**
 * Generate authorization URL for OAuth flow
 */
export function generateAuthorizationURL(
  instanceURL: string,
  clientId: string,
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
  })

  return `${instanceURL}/oauth/authorize?${params.toString()}`
}

/**
 * Get OAuth redirect URI
 */
export function getRedirectURI(): string {
  return REDIRECT_URI
}

/**
 * Get OAuth scopes
 */
export function getScopes(): string {
  return SCOPES
}

/**
 * Get app name
 */
export function getAppName(): string {
  return APP_NAME
}

/**
 * Normalize instance URL
 */
export function normalizeInstanceURL(url: string): string {
  let normalized = url.trim().toLowerCase()

  // Remove protocol if present
  normalized = normalized.replace(/^https?:\/\//, '')

  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '')

  // Add https protocol
  normalized = `https://${normalized}`

  return normalized
}

/**
 * Extract authorization code from URL
 */
export function extractAuthCode(url: string): string | null {
  const urlObj = new URL(url)
  return urlObj.searchParams.get('code')
}
