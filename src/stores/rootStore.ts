/**
 * Root Store
 * Combines all MobX stores
 */

import { AuthStore, type AuthState } from './authStore'
import { UserStore } from './userStore'
import { UIStore, type Theme } from './uiStore'

export interface RootStoreInitialState {
  auth?: Partial<AuthState>
  theme?: Theme
}

export class RootStore {
  authStore: AuthStore
  userStore: UserStore
  uiStore: UIStore

  constructor(initialState?: RootStoreInitialState) {
    this.authStore = new AuthStore(initialState?.auth)
    this.userStore = new UserStore()
    this.uiStore = new UIStore(initialState?.theme)
  }

  // Helper method to reset all stores (e.g., on logout)
  reset() {
    this.authStore.signOut()
    this.userStore.clearUser()
    // UI store preferences are preserved
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
