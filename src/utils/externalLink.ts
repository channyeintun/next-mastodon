/**
 * Safe opening of links that come from the API.
 *
 * URLs in statuses, cards, media attachments and trends are supplied by the
 * instance, so their scheme cannot be assumed. `window.open` does not apply
 * React's `javascript:`-URL protection, and it hands the opened page a
 * `window.opener` reference unless `noopener` is passed — which lets that page
 * navigate this tab. Both are handled here so call sites cannot forget.
 */

const SAFE_PROTOCOLS = new Set(['http:', 'https:'])

/** True when the URL is absolute and uses a scheme that is safe to open. */
export function isSafeExternalUrl(url: string | null | undefined): boolean {
    if (!url) return false

    try {
        return SAFE_PROTOCOLS.has(new URL(url, window.location.href).protocol)
    } catch {
        return false
    }
}

/**
 * Open an API-provided URL in a new tab, dropping anything that is not
 * http(s). Returns whether the URL was opened.
 */
export function openExternalUrl(url: string | null | undefined): boolean {
    if (!isSafeExternalUrl(url)) return false

    window.open(url as string, '_blank', 'noopener,noreferrer')
    return true
}
