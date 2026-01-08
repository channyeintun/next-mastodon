'use client';

import { useTranslations } from 'next-intl';

/**
 * Skip to main content link for keyboard accessibility
 * Allows users to bypass navigation and jump directly to main content
 */
export default function SkipToMain() {
    const t = useTranslations('common');
    return (
        <a href="#main-content" className="skip-to-main">
            {t('skipToMain')}
        </a>
    );
}
