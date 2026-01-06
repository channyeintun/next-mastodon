/**
 * Authentication Store
 * Manages authentication state, tokens, and instance configuration
 * Uses cookies for persistence to enable SSR hydration
 * 
 * Note: client_secret is stored as httpOnly cookie and handled server-side
 */

import { makeAutoObservable } from 'mobx'
import { getCookie, setCookie, clearAllCookies, type CookieOptions } from '../utils/cookies'
import { clearIdb } from '../lib/idbPersister'

export interface AuthState {
  instanceURL: string | null
  accessToken: string | null
  clientId: string | null
  isAuthenticated: boolean
  showAuthModal: boolean
}

const COOKIE_OPTIONS: CookieOptions = {
  expires: 365, // 1 year (in days)
  sameSite: 'lax',
}

export class AuthStore {
  instanceURL: string | null = null
  accessToken: string | null = null
  clientId: string | null = null
  showAuthModal: boolean = false

  constructor(initialState?: Partial<AuthState>) {
    // Initialize with server-provided state if available
    if (initialState) {
      this.instanceURL = initialState.instanceURL ?? null
      this.accessToken = initialState.accessToken ?? null
      this.clientId = initialState.clientId ?? null
    }
    // Note: Client-side cookie hydration is now done via hydrate() method
    // since CookieStore API is async

    makeAutoObservable(this)
  }

  /**
   * Hydrate auth state from cookies on client-side
   * Should be called once on app mount
   * Note: clientSecret is httpOnly and not accessible from client
   */
  async hydrate(): Promise<void> {
    if (typeof window === 'undefined') return

    const [instanceURL, accessToken, clientId] = await Promise.all([
      getCookie('instanceURL'),
      getCookie('accessToken'),
      getCookie('clientId'),
    ])

    this.instanceURL = instanceURL ?? null
    this.accessToken = accessToken ?? null
    this.clientId = clientId ?? null
  }

  get isAuthenticated(): boolean {
    return !!this.accessToken && !!this.instanceURL
  }

  /**
   * Set instance URL in memory only (cookies handled by server action)
   */
  setInstanceInMemory(url: string) {
    this.instanceURL = url.replace(/\/$/, '')
  }

  /**
   * Set client ID in memory only (cookies handled by server action)
   */
  setClientIdInMemory(clientId: string) {
    this.clientId = clientId
  }

  setAccessToken(token: string) {
    this.accessToken = token
    if (typeof window !== 'undefined') {
      setCookie('accessToken', token, COOKIE_OPTIONS)
    }
  }

  async signOut() {
    // Revoke token via server-side API (has access to httpOnly clientSecret)
    if (this.accessToken) {
      fetch('/api/auth/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: this.accessToken }),
      }).catch((error) => {
        console.error('Failed to revoke token during sign out:', error)
      })
    }

    this.instanceURL = null
    this.accessToken = null
    this.clientId = null

    if (typeof window !== 'undefined') {
      // Clear all browser storage
      localStorage.clear()
      sessionStorage.clear()
      clearIdb()
      // Fire-and-forget: clear all cookies
      clearAllCookies()
    }
  }

  getState(): AuthState {
    return {
      instanceURL: this.instanceURL,
      accessToken: this.accessToken,
      clientId: this.clientId,
      isAuthenticated: this.isAuthenticated,
      showAuthModal: this.showAuthModal,
    }
  }

  setShowAuthModal(show: boolean) {
    this.showAuthModal = show
  }

  openAuthModal() {
    this.showAuthModal = true
  }

  closeAuthModal() {
    this.showAuthModal = false
  }
}
