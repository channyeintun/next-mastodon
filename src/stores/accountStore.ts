/**
 * Account Store
 * Caches account data and persists acct-to-id mappings for faster API lookups
 */

import { makeAutoObservable, runInAction } from 'mobx'
import type { Account } from '../types/mastodon'

const ACCT_TO_ID_STORAGE_KEY = 'mastodon_acct_to_id'

export class AccountStore {
    // In-memory cache of account data, keyed by acct
    accountCache: Map<string, Account> = new Map()

    // Persisted mapping of acct to account ID
    private acctToIdMap: Map<string, string> = new Map()

    constructor() {
        makeAutoObservable(this)
        this.loadPersistedMappings()
    }

    /**
     * Load persisted acct-to-id mappings from sessionStorage
     */
    private loadPersistedMappings() {
        if (typeof window === 'undefined') return

        try {
            const stored = sessionStorage.getItem(ACCT_TO_ID_STORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored) as Record<string, string>
                this.acctToIdMap = new Map(Object.entries(parsed))
            }
        } catch (error) {
            console.warn('Failed to load account ID mappings from sessionStorage:', error)
        }
    }

    /**
     * Persist acct-to-id mappings to sessionStorage
     */
    private persistMappings() {
        if (typeof window === 'undefined') return

        try {
            const obj = Object.fromEntries(this.acctToIdMap)
            sessionStorage.setItem(ACCT_TO_ID_STORAGE_KEY, JSON.stringify(obj))
        } catch (error) {
            console.warn('Failed to persist account ID mappings to sessionStorage:', error)
        }
    }

    /**
     * Cache an account and persist its acct-to-id mapping
     */
    cacheAccount(account: Account) {
        runInAction(() => {
            this.accountCache.set(account.acct, account)
            this.acctToIdMap.set(account.acct, account.id)
        })
        this.persistMappings()
    }

    /**
     * Get cached account data by acct
     */
    getAccountByAcct(acct: string): Account | undefined {
        return this.accountCache.get(acct)
    }

    /**
     * Get persisted account ID by acct
     */
    getAccountIdByAcct(acct: string): string | undefined {
        return this.acctToIdMap.get(acct)
    }

    /**
     * Check if we have a cached account or ID for this acct
     */
    hasAccountInfo(acct: string): boolean {
        return this.accountCache.has(acct) || this.acctToIdMap.has(acct)
    }

    /**
     * Clear all cached data (e.g., on logout)
     */
    clear() {
        this.accountCache.clear()
        this.acctToIdMap.clear()
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(ACCT_TO_ID_STORAGE_KEY)
        }
    }
}

