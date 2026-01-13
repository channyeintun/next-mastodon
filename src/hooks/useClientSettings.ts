'use client';

import { useState, useEffect } from 'react';
import { getCookie, setCookie, type CookieOptions } from '../utils/cookies';

const COOKIE_NAME = 'settings_scroll_to_top';
const COOKIE_OPTIONS: CookieOptions = {
    expires: 365, // 1 year
    sameSite: 'lax',
    domain: '.mastodon.website',
};

/**
 * Hook to manage client-side settings
 */
export function useClientSettings() {
    // Default to true (show button)
    const [showScrollToTop, setShowScrollToTop] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            const value = await getCookie(COOKIE_NAME);
            if (value !== undefined) {
                setShowScrollToTop(value === 'true');
            }
            setIsLoaded(true);
        };
        loadSettings();
    }, []);

    const updateShowScrollToTop = async (value: boolean) => {
        setShowScrollToTop(value);
        await setCookie(COOKIE_NAME, String(value), COOKIE_OPTIONS);
    };

    return {
        showScrollToTop,
        setShowScrollToTop: updateShowScrollToTop,
        isLoaded
    };
}
