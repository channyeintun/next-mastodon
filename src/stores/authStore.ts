/**
 * Authentication Store
 * Manages authentication state, tokens, and instance configuration
 * Uses cookies for persistence to enable SSR hydration
 */

import { makeAutoObservable } from 'mobx'
import Cookies from 'js-cookie'

export interface AuthState {
  instanceURL: string | null
  accessToken: string | null
  clientId: string | null
  clientSecret: string | null
  isAuthenticated: boolean
}

const COOKIE_OPTIONS = {
  expires: 365, // 1 year
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
}

export class AuthStore {
  instanceURL: string | null = null
  accessToken: string | null = null
  clientId: string | null = null
  clientSecret: string | null = null

  constructor(initialState?: Partial<AuthState>) {
    // Initialize with server-provided state if available
    if (initialState) {
      this.instanceURL = initialState.instanceURL ?? null
      this.accessToken = initialState.accessToken ?? null
      this.clientId = initialState.clientId ?? null
      this.clientSecret = initialState.clientSecret ?? null
    } else if (typeof window !== 'undefined') {
      // Client-side: read from cookies
      this.instanceURL = Cookies.get('instanceURL') ?? null
      this.accessToken = Cookies.get('accessToken') ?? null
      this.clientId = Cookies.get('clientId') ?? null
      this.clientSecret = Cookies.get('clientSecret') ?? null
    }

    makeAutoObservable(this)
  }

  get isAuthenticated(): boolean {
    return !!this.accessToken && !!this.instanceURL
  }

  setInstance(url: string) {
    this.instanceURL = url.replace(/\/$/, '') // Remove trailing slash
    if (typeof window !== 'undefined') {
      Cookies.set('instanceURL', this.instanceURL, COOKIE_OPTIONS)
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
      Cookies.set('accessToken', accessToken, COOKIE_OPTIONS)
      Cookies.set('clientId', clientId, COOKIE_OPTIONS)
      Cookies.set('clientSecret', clientSecret, COOKIE_OPTIONS)
    }
  }

  setAccessToken(token: string) {
    this.accessToken = token
    if (typeof window !== 'undefined') {
      Cookies.set('accessToken', token, COOKIE_OPTIONS)
    }
  }

  setClientCredentials(clientId: string, clientSecret: string) {
    this.clientId = clientId
    this.clientSecret = clientSecret

    if (typeof window !== 'undefined') {
      Cookies.set('clientId', clientId, COOKIE_OPTIONS)
      Cookies.set('clientSecret', clientSecret, COOKIE_OPTIONS)
    }
  }

  signOut() {
    this.instanceURL = null
    this.accessToken = null
    this.clientId = null
    this.clientSecret = null

    if (typeof window !== 'undefined') {
      Cookies.remove('instanceURL')
      Cookies.remove('accessToken')
      Cookies.remove('clientId')
      Cookies.remove('clientSecret')
    }
  }

  getState(): AuthState {
    return {
      instanceURL: this.instanceURL,
      accessToken: this.accessToken,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      isAuthenticated: this.isAuthenticated,
    }
  }
}
