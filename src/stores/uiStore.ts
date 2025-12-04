/**
 * UI Store
 * Manages UI state like modals, sidebars, theme, etc.
 */

import { makeAutoObservable } from 'mobx'
import Cookies from 'js-cookie'

export type Theme = 'light' | 'dark' | 'auto'

const COOKIE_OPTIONS = {
  expires: 365, // 1 year
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
}

export class UIStore {
  theme: Theme = 'auto'
  isSidebarOpen = false
  isComposeModalOpen = false
  currentModal: string | null = null

  constructor(initialTheme?: Theme) {
    // Initialize theme from server-provided value or cookies
    if (initialTheme) {
      this.theme = initialTheme
    } else if (typeof window !== 'undefined') {
      this.theme = (Cookies.get('theme') as Theme) ?? 'auto'
    }

    makeAutoObservable(this)
  }

  setTheme(theme: Theme) {
    this.theme = theme
    if (typeof window !== 'undefined') {
      Cookies.set('theme', theme, COOKIE_OPTIONS)
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen
  }

  openSidebar() {
    this.isSidebarOpen = true
  }

  closeSidebar() {
    this.isSidebarOpen = false
  }

  openComposeModal() {
    this.isComposeModalOpen = true
  }

  closeComposeModal() {
    this.isComposeModalOpen = false
  }

  openModal(modalName: string) {
    this.currentModal = modalName
  }

  closeModal() {
    this.currentModal = null
  }

  get activeTheme(): 'light' | 'dark' {
    if (this.theme === 'auto') {
      // Check system preference
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      }
      return 'light'
    }
    return this.theme
  }
}
