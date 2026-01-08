// Supported locales and default locale configuration
export const locales = ['en', 'de', 'fr', 'es', 'ja', 'zh-CN', 'ko', 'my', 'th', 'vi'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// Cookie name for storing locale preference
export const LOCALE_COOKIE_NAME = 'locale';
