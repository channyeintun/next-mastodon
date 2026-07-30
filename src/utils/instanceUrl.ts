/**
 * Validation for user-supplied instance URLs and other outbound fetch targets.
 *
 * The instance URL is chosen by the user and persisted in a non-httpOnly
 * cookie, so it is attacker-controlled input that server code turns into
 * outbound `fetch` calls (`/api/auth/callback`, `/api/auth/revoke`,
 * `lib/serverApi`). Without a check, that is a server-side request forgery
 * primitive pointing at loopback, link-local and private-network addresses.
 *
 * Isomorphic on purpose: no node-only imports, so the sign-in page can reject
 * bad input before it is ever stored.
 */

/** Hostnames that never belong to a public instance. */
const BLOCKED_HOSTNAMES = new Set([
    'localhost',
    'metadata.google.internal',
    'metadata',
])

/** Suffixes reserved for local/private naming. */
const BLOCKED_SUFFIXES = ['.localhost', '.local', '.internal', '.lan', '.home.arpa']

function isPrivateIPv4(hostname: string): boolean {
    const parts = hostname.split('.')
    if (parts.length !== 4) return false

    const octets = parts.map((part) => Number(part))
    if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
        return false
    }

    const [a, b] = octets

    return (
        a === 0 || // 0.0.0.0/8 "this host"
        a === 10 || // private
        a === 127 || // loopback
        (a === 100 && b >= 64 && b <= 127) || // 100.64.0.0/10 CGNAT
        (a === 169 && b === 254) || // link-local, incl. cloud metadata
        (a === 172 && b >= 16 && b <= 31) || // private
        (a === 192 && b === 0) || // 192.0.0.0/24 protocol assignments
        (a === 192 && b === 168) || // private
        (a === 198 && (b === 18 || b === 19)) || // benchmarking
        a >= 224 // multicast, reserved, broadcast
    )
}

function isPrivateIPv6(hostname: string): boolean {
    const address = hostname.replace(/^\[/, '').replace(/\]$/, '').toLowerCase()

    // IPv4-mapped / IPv4-compatible forms (::ffff:127.0.0.1)
    const embeddedIPv4 = address.match(/(\d{1,3}(?:\.\d{1,3}){3})$/)
    if (embeddedIPv4 && isPrivateIPv4(embeddedIPv4[1])) return true

    if (address === '::' || address === '::1') return true

    const firstGroup = address.split(':')[0]
    if (!firstGroup) return true // leading "::" — unspecified/loopback range

    const leading = parseInt(firstGroup, 16)
    if (Number.isNaN(leading)) return false

    return (
        (leading & 0xfe00) === 0xfc00 || // fc00::/7 unique local
        (leading & 0xffc0) === 0xfe80 // fe80::/10 link-local
    )
}

/**
 * True when a hostname points at the host itself, a private network, or a
 * name that cannot resolve publicly. `new URL()` has already normalised
 * numeric IPv4 forms (`http://2130706433` → `127.0.0.1`) by the time this
 * runs, so only canonical shapes need checking.
 */
export function isPrivateHostname(hostname: string): boolean {
    const host = hostname.toLowerCase()

    if (BLOCKED_HOSTNAMES.has(host)) return true
    if (BLOCKED_SUFFIXES.some((suffix) => host.endsWith(suffix))) return true
    if (host.startsWith('[') || host.includes(':')) return isPrivateIPv6(host)
    if (isPrivateIPv4(host)) return true

    // A bare name with no dot is not publicly resolvable (intranet shortcut).
    return !host.includes('.')
}

export interface InstanceUrlOptions {
    /**
     * Allow http:// and private/loopback hosts. Intended for development
     * against a locally running instance — never enable in production.
     */
    allowLocal?: boolean
}

/**
 * Normalise and validate an instance URL.
 *
 * Returns the canonical `https://host[/path]` form, or `null` when the value
 * is unusable or points somewhere an instance cannot legitimately live.
 */
export function sanitizeInstanceUrl(
    raw: string | null | undefined,
    { allowLocal = false }: InstanceUrlOptions = {},
): string | null {
    if (!raw) return null

    const trimmed = raw.trim()
    if (!trimmed) return null

    // A scheme we don't support (file:, data:, javascript:, …) is rejected rather
    // than treated as a hostname — prefixing "https://" would silently turn
    // "file:///etc/passwd" into a request for the host "file". The negative
    // lookahead keeps "mastodon.example:8443" a host:port, not a scheme.
    const hasScheme = /^[a-z][a-z0-9+.\-]*:(?!\d)/i.test(trimmed)
    const isHttpScheme = /^https?:\/\//i.test(trimmed)

    if (hasScheme && !isHttpScheme) return null

    let url: URL
    try {
        url = new URL(isHttpScheme ? trimmed : `https://${trimmed}`)
    } catch {
        return null
    }

    if (url.protocol === 'http:' && !allowLocal) {
        // Upgrade rather than reject: pasting an http:// URL is a normal thing for
        // a user to do, and https is what the old normaliser forced too. The host
        // checks below are what actually keep this from becoming an SSRF target.
        url.protocol = 'https:'
    }

    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        return null
    }

    // Embedded credentials would travel with every API call, and a query or
    // fragment breaks the `${instanceURL}/oauth/token` concatenations.
    if (url.username || url.password || url.search || url.hash) return null

    if (!url.hostname) return null
    if (!allowLocal && isPrivateHostname(url.hostname)) return null

    const path = url.pathname.replace(/\/+$/, '')
    return `${url.protocol}//${url.host}${path}`
}

/**
 * Server-side variant: private hosts are only tolerated outside production so
 * that `bun dev` against a local instance keeps working.
 */
export function sanitizeInstanceUrlForServer(raw: string | null | undefined): string | null {
    return sanitizeInstanceUrl(raw, { allowLocal: process.env.NODE_ENV !== 'production' })
}
