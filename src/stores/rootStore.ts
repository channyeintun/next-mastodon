/**
 * Root Store
 * Combines all MobX stores
 */

import { AuthStore, type AuthState } from './authStore'
import { UserStore } from './userStore'
import { DraftStore } from './draftStore'
import type { AnnualReportState } from '@/types/mastodon'

export interface RootStoreInitialState {
  auth?: Partial<AuthState>
  annualReportState?: AnnualReportState
  wrapstodonYear?: number
}

export class RootStore {
  authStore: AuthStore
  userStore: UserStore
  draftStore: DraftStore
  initialAnnualReportState?: AnnualReportState
  initialWrapstodonYear?: number

  constructor(initialState?: RootStoreInitialState) {
    this.authStore = new AuthStore(initialState?.auth)
    this.userStore = new UserStore()
    this.draftStore = new DraftStore()
    this.initialAnnualReportState = initialState?.annualReportState
    this.initialWrapstodonYear = initialState?.wrapstodonYear
  }

  // Helper method to reset all stores (e.g., on logout)
  reset() {
    this.authStore.signOut()
    this.userStore.clearUser()
  }
}


// Singleton instance - only for client
let rootStore: RootStore | null = null

export function getRootStore(initialState?: RootStoreInitialState): RootStore {
  // Server-side: always create new instance for each request
  if (typeof window === 'undefined') {
    return new RootStore(initialState)
  }

  // Client-side: use singleton, initialize on first call
  if (!rootStore) {
    rootStore = new RootStore(initialState)
  }
  return rootStore
}

export function initRootStore(initialState?: RootStoreInitialState): RootStore {
  rootStore = new RootStore(initialState)
  return rootStore
}
