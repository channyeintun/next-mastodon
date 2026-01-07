'use client';

import { useCallback } from 'react';
import { useLocale as useNextIntlLocale } from 'next-intl';
import { locales, LOCALE_COOKIE_NAME, type Locale } from '@/i18n/config';

/**
 * Hook to get and set the current locale.
 * Setting the locale updates the cookie and reloads the page.
 */
export function useLocale() {
    const locale = useNextIntlLocale() as Locale;

    const setLocale = useCallback((newLocale: Locale) => {
        if (!locales.includes(newLocale)) {
            console.warn(`Invalid locale: ${newLocale}`);
            return;
        }

        // Set cookie (expires in 1 year)
        document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;

        // Reload to apply new locale (server needs to re-read cookie)
        window.location.reload();
    }, []);

    return { locale, setLocale, locales };
}
