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
    /** Cookie domain for subdomain sharing */
    domain?: string;
    // Note: CookieStore only works in secure contexts (HTTPS), so cookies are automatically secure
}

/**
 * Helper to get the correct cookie domain based on the current environment.
 * For local development on localhost, we return undefined to allow port-based sharing.
 * For production, we return '.mastodon.website' to allow subdomain sharing.
 */
export function getCookieDomain(): string | undefined {
    if (typeof window === 'undefined') return undefined;

    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return undefined;
    }

    return '.mastodon.website';
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
    if (typeof window === 'undefined') {
        return;
    }

    const isSecureContext = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // Try CookieStore API first, but only in secure contexts or localhost if supported
    // Note: CookieStore always sets 'Secure' flag which might fail on plain HTTP localhost in some browsers
    if ('cookieStore' in window && (isSecureContext || isLocalhost)) {
        try {
            // Calculate expires as a timestamp (milliseconds) if it's a number (days)
            let expires: number | undefined;
            if (typeof options.expires === 'number') {
                expires = Date.now() + options.expires * 24 * 60 * 60 * 1000;
            } else if (options.expires instanceof Date) {
                expires = options.expires.getTime();
            }

            const setOptions: any = {
                name,
                value,
                expires,
                sameSite: options.sameSite ?? 'lax',
                path: options.path ?? '/',
            };

            // Only include domain if explicitly provided and not empty
            if (options.domain) {
                setOptions.domain = options.domain;
            }

            await (window as any).cookieStore.set(setOptions);
            return;
        } catch (error) {
            console.error(`Error setting cookie "${name}" with CookieStore:`, error);
            // Fall through to document.cookie if CookieStore fails
        }
    }

    // Fallback to traditional document.cookie
    try {
        let cookieString = `${name}=${encodeURIComponent(value)}`;

        if (options.expires) {
            let expiresDate: Date;
            if (typeof options.expires === 'number') {
                expiresDate = new Date();
                expiresDate.setDate(expiresDate.getDate() + options.expires);
            } else {
                expiresDate = options.expires;
            }
            cookieString += `; expires=${expiresDate.toUTCString()}`;
        }

        cookieString += `; path=${options.path ?? '/'}`;

        if (options.domain) {
            cookieString += `; domain=${options.domain}`;
        }

        const sameSite = options.sameSite ?? 'lax';
        cookieString += `; samesite=${sameSite}`;

        // Only add secure flag if on HTTPS or explicitly requested
        if (options.sameSite === 'none' || isSecureContext) {
            cookieString += '; secure';
        }

        document.cookie = cookieString;
    } catch (error) {
        console.error(`Error setting cookie "${name}" with document.cookie:`, error);
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

/**
 * Clear all cookies
 */
export async function clearAllCookies(): Promise<void> {
    if (typeof window === 'undefined' || !('cookieStore' in window)) {
        return;
    }

    try {
        const cookies = await window.cookieStore.getAll();
        await Promise.all(
            cookies
                .filter((c): c is typeof c & { name: string } => !!c.name)
                .map(c => window.cookieStore.delete(c.name))
        );
    } catch (error) {
        console.error('Error clearing cookies:', error);
    }
}
