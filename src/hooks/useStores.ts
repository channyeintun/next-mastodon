/**
 * React hook for accessing MobX stores
 */

import { createContext, useContext } from 'react'
import type { RootStore } from '../stores'
import { getConversationStore } from '../stores/conversationStore'

export const StoreContext = createContext<RootStore | null>(null)

export function useStores() {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error('useStores must be used within StoreProvider')
  }
  return store
}

export function useAuthStore() {
  const { authStore } = useStores()
  return authStore
}

export function useUserStore() {
  const { userStore } = useStores()
  return userStore
}

export function useDraftStore() {
  const { draftStore } = useStores()
  return draftStore
}

export function useConversationStore() {
  return getConversationStore()
}
