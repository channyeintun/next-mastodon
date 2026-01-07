import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { locales, defaultLocale, LOCALE_COOKIE_NAME, type Locale } from './config';

export default getRequestConfig(async () => {
    // Read locale from cookie
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

    // Validate locale
    const locale: Locale = locales.includes(localeCookie as Locale)
        ? (localeCookie as Locale)
        : defaultLocale;

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
