/**
 * HTML sanitization for API-provided content
 *
 * This app is a third-party client that connects to arbitrary user-chosen
 * instances, so HTML from the API (status content, bios, instance pages)
 * cannot be trusted and must be sanitized before rendering.
 */

import DOMPurify from 'dompurify'

/**
 * Sanitize HTML received from a Mastodon instance before injecting it
 * with dangerouslySetInnerHTML.
 *
 * Returns an empty string during SSR: API content is only fetched
 * client-side, so nothing is lost, and unsanitized markup can never reach
 * the server-rendered output.
 */
export function sanitizeHtml(html: string): string {
    if (typeof window === 'undefined') return ''
    // target is not in DOMPurify's default attribute allowlist
    return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] })
}
