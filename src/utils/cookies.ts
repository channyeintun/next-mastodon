/**
 * Cookie Utilities using the native CookieStore API
 * https://developer.mozilla.org/en-US/docs/Web/API/CookieStore
 * 
 * CookieStore became baseline in June 2025 and provides an async API
 * for reading, writing, and deleting cookies.
 */

export interface CookieOptions {
    /** Cookie expiration - number of days or a Date object */
    expires?: number | Date;
    /** SameSite attribute */
    sameSite?: 'strict' | 'lax' | 'none';
    /** Cookie path */
    path?: string;
    // Note: CookieStore only works in secure contexts (HTTPS), so cookies are automatically secure
}

/**
 * Get a cookie value by name
 * @param name - Cookie name
 * @returns Cookie value or undefined if not found
 */
export async function getCookie(name: string): Promise<string | undefined> {
    if (typeof window === 'undefined' || !('cookieStore' in window)) {
        return undefined;
    }

    try {
        const cookie = await window.cookieStore.get(name);
        return cookie?.value;
    } catch (error) {
        console.error(`Error getting cookie "${name}":`, error);
        return undefined;
    }
}

/**
 * Set a cookie with the given name and value
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options (expires, sameSite, secure, path)
 */
export async function setCookie(
    name: string,
    value: string,
    options: CookieOptions = {}
): Promise<void> {
    if (typeof window === 'undefined' || !('cookieStore' in window)) {
        return;
    }

    try {
        // Calculate expires as a timestamp (milliseconds) if it's a number (days)
        let expires: number | undefined;
        if (typeof options.expires === 'number') {
            expires = Date.now() + options.expires * 24 * 60 * 60 * 1000;
        } else if (options.expires instanceof Date) {
            expires = options.expires.getTime();
        }

        await window.cookieStore.set({
            name,
            value,
            expires,
            sameSite: options.sameSite ?? 'lax',
            path: options.path ?? '/',
        });
    } catch (error) {
        console.error(`Error setting cookie "${name}":`, error);
    }
}

/**
 * Delete a cookie by name
 * @param name - Cookie name to delete
 */
export async function deleteCookie(name: string): Promise<void> {
    if (typeof window === 'undefined' || !('cookieStore' in window)) {
        return;
    }

    try {
        await window.cookieStore.delete(name);
    } catch (error) {
        console.error(`Error deleting cookie "${name}":`, error);
    }
}
