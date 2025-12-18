/**
 * Root Store
 * Combines all MobX stores
 */

import { AuthStore, type AuthState } from './authStore'
import { UserStore } from './userStore'
import { AccountStore } from './accountStore'

export interface RootStoreInitialState {
  auth?: Partial<AuthState>
}

export class RootStore {
  authStore: AuthStore
  userStore: UserStore
  accountStore: AccountStore

  constructor(initialState?: RootStoreInitialState) {
    this.authStore = new AuthStore(initialState?.auth)
    this.userStore = new UserStore()
    this.accountStore = new AccountStore()
  }

  // Helper method to reset all stores (e.g., on logout)
  reset() {
    this.authStore.signOut()
    this.userStore.clearUser()
    this.accountStore.clear()
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
