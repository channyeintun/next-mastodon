/**
 * OAuth utilities for Mastodon authentication
 * Implements PKCE (Proof Key for Code Exchange) for secure browser-based OAuth
 */

const APP_NAME = 'Mastodon'
const REDIRECT_URI = typeof window !== 'undefined'
  ? `${window.location.origin}/auth/callback`
  : 'http://localhost:9003/auth/callback'
const SCOPES = 'read write follow push'

// Storage keys for PKCE and state
const PKCE_VERIFIER_KEY = 'oauth_code_verifier'
const STATE_KEY = 'oauth_state'

/**
 * Generate a cryptographically random string for PKCE code_verifier
 * Must be between 43-128 characters, using unreserved URI characters
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  // Base64url encode (no padding, URL-safe characters)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Generate code_challenge from code_verifier using S256 method
 * SHA-256 hash of the verifier, base64url encoded
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = new Uint8Array(hashBuffer)
  // Base64url encode (no padding, URL-safe characters)
  return btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Generate a random state parameter for CSRF protection
 */
export function generateState(): string {
  return crypto.randomUUID()
}

/**
 * Store PKCE verifier and state in sessionStorage
 */
export function storePKCEData(verifier: string, state: string): void {
  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier)
  sessionStorage.setItem(STATE_KEY, state)
}

/**
 * Retrieve and clear PKCE data from sessionStorage
 * Returns null if data is missing (possible attack or expired session)
 */
export function retrievePKCEData(): { verifier: string; state: string } | null {
  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY)
  const state = sessionStorage.getItem(STATE_KEY)

  if (!verifier || !state) {
    return null
  }

  // Clear after retrieval (one-time use)
  sessionStorage.removeItem(PKCE_VERIFIER_KEY)
  sessionStorage.removeItem(STATE_KEY)

  return { verifier, state }
}

/**
 * Generate authorization URL for OAuth flow with PKCE
 */
export function generateAuthorizationURL(
  instanceURL: string,
  clientId: string,
  codeChallenge: string,
  state: string,
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
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
