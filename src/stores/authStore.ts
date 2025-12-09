/**
 * Authentication Store
 * Manages authentication state, tokens, and instance configuration
 * Uses cookies for persistence to enable SSR hydration
 */

import { makeAutoObservable } from 'mobx'
import { getCookie, setCookie, deleteCookie, type CookieOptions } from '../utils/cookies'

export interface AuthState {
  instanceURL: string | null
  accessToken: string | null
  clientId: string | null
  clientSecret: string | null
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
  clientSecret: string | null = null
  showAuthModal: boolean = false

  constructor(initialState?: Partial<AuthState>) {
    // Initialize with server-provided state if available
    if (initialState) {
      this.instanceURL = initialState.instanceURL ?? null
      this.accessToken = initialState.accessToken ?? null
      this.clientId = initialState.clientId ?? null
      this.clientSecret = initialState.clientSecret ?? null
    }
    // Note: Client-side cookie hydration is now done via hydrate() method
    // since CookieStore API is async

    makeAutoObservable(this)
  }

  /**
   * Hydrate auth state from cookies on client-side
   * Should be called once on app mount
   */
  async hydrate(): Promise<void> {
    if (typeof window === 'undefined') return

    const [instanceURL, accessToken, clientId, clientSecret] = await Promise.all([
      getCookie('instanceURL'),
      getCookie('accessToken'),
      getCookie('clientId'),
      getCookie('clientSecret'),
    ])

    this.instanceURL = instanceURL ?? null
    this.accessToken = accessToken ?? null
    this.clientId = clientId ?? null
    this.clientSecret = clientSecret ?? null
  }

  get isAuthenticated(): boolean {
    return !!this.accessToken && !!this.instanceURL
  }

  setInstance(url: string) {
    this.instanceURL = url.replace(/\/$/, '') // Remove trailing slash
    if (typeof window !== 'undefined') {
      // Fire-and-forget cookie operation
      setCookie('instanceURL', this.instanceURL, COOKIE_OPTIONS)
    }
  }

  setCredentials(
    accessToken: string,
    clientId: string,
    clientSecret: string,
  ) {
    this.accessToken = accessToken
    this.clientId = clientId
    this.clientSecret = clientSecret

    if (typeof window !== 'undefined') {
      // Fire-and-forget cookie operations
      setCookie('accessToken', accessToken, COOKIE_OPTIONS)
      setCookie('clientId', clientId, COOKIE_OPTIONS)
      setCookie('clientSecret', clientSecret, COOKIE_OPTIONS)
    }
  }

  setAccessToken(token: string) {
    this.accessToken = token
    if (typeof window !== 'undefined') {
      setCookie('accessToken', token, COOKIE_OPTIONS)
    }
  }

  setClientCredentials(clientId: string, clientSecret: string) {
    this.clientId = clientId
    this.clientSecret = clientSecret

    if (typeof window !== 'undefined') {
      setCookie('clientId', clientId, COOKIE_OPTIONS)
      setCookie('clientSecret', clientSecret, COOKIE_OPTIONS)
    }
  }

  signOut() {
    this.instanceURL = null
    this.accessToken = null
    this.clientId = null
    this.clientSecret = null

    if (typeof window !== 'undefined') {
      // Fire-and-forget cookie deletions
      deleteCookie('instanceURL')
      deleteCookie('accessToken')
      deleteCookie('clientId')
      deleteCookie('clientSecret')
    }
  }

  getState(): AuthState {
    return {
      instanceURL: this.instanceURL,
      accessToken: this.accessToken,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
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
