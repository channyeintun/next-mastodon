import { lookup } from 'node:dns/promises';
import { NextRequest, NextResponse } from 'next/server';
import { isPrivateHostname } from '@/utils/instanceUrl';

/**
 * Media proxy for cross-origin fetches of *public* instance media.
 *
 * The target URL is fully caller-controlled, which is why every request is
 * constrained before it leaves the server:
 *   - http(s) only, no credentials in the URL
 *   - the hostname and every address it resolves to must be public, so the
 *     proxy cannot be aimed at loopback, link-local (cloud metadata) or
 *     private-network services
 *   - redirects are followed manually so each hop is re-validated
 *   - only media content types come back, under a size cap and a timeout
 *
 * Known limitation: validating DNS and then fetching by hostname leaves a
 * small rebinding window. Closing it fully requires pinning the connection to
 * the validated address, which `fetch` cannot express.
 */

// node:dns is required for the address check, so this route must not run on edge.
export const runtime = 'nodejs';

const MAX_REDIRECTS = 3;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const FETCH_TIMEOUT_MS = 10_000;
const ALLOWED_CONTENT_TYPE = /^(image|video|audio)\//i;

/** Origins allowed to read proxied responses cross-origin. */
function resolveAllowedOrigin(request: NextRequest): string | null {
    const origin = request.headers.get('origin');
    if (!origin) return null;

    let url: URL;
    try {
        url = new URL(origin);
    } catch {
        return null;
    }

    const isOwnOrigin = origin === request.nextUrl.origin;
    const isSiblingDeployment =
        url.protocol === 'https:' &&
        (url.hostname === 'mastodon.website' || url.hostname.endsWith('.mastodon.website'));
    const isLocalDev = process.env.NODE_ENV !== 'production' && isPrivateHostname(url.hostname);

    return isOwnOrigin || isSiblingDeployment || isLocalDev ? origin : null;
}

function corsHeaders(allowedOrigin: string | null): Record<string, string> {
    if (!allowedOrigin) return { Vary: 'Origin' };
    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        Vary: 'Origin',
    };
}

/** Parse and validate one hop, resolving DNS to reject private addresses. */
async function validateTarget(rawUrl: string): Promise<URL | null> {
    let url: URL;
    try {
        url = new URL(rawUrl);
    } catch {
        return null;
    }

    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (url.username || url.password) return null;
    if (isPrivateHostname(url.hostname)) return null;

    try {
        const addresses = await lookup(url.hostname, { all: true });
        if (addresses.length === 0) return null;
        if (addresses.some(({ address }) => isPrivateHostname(address))) return null;
    } catch {
        return null;
    }

    return url;
}

/** Follow up to MAX_REDIRECTS hops, validating each Location. */
async function fetchValidated(rawUrl: string, signal: AbortSignal): Promise<Response | null> {
    let target = rawUrl;

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
        const url = await validateTarget(target);
        if (!url) return null;

        const response = await fetch(url, {
            redirect: 'manual',
            signal,
            headers: { Accept: 'image/*,video/*,audio/*' },
        });

        if (response.status < 300 || response.status > 399) return response;

        const location = response.headers.get('location');
        if (!location) return response;
        target = new URL(location, url).toString();
    }

    return null;
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(resolveAllowedOrigin(request)),
    });
}

export async function GET(request: NextRequest) {
    const headers = corsHeaders(resolveAllowedOrigin(request));
    const targetUrl = request.nextUrl.searchParams.get('url');

    if (!targetUrl) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400, headers });
    }

    try {
        const response = await fetchValidated(targetUrl, AbortSignal.timeout(FETCH_TIMEOUT_MS));

        if (!response) {
            return NextResponse.json({ error: 'URL is not allowed' }, { status: 400, headers });
        }

        if (!response.ok) {
            return NextResponse.json(
                { error: `Target URL returned ${response.status}` },
                { status: response.status === 404 ? 404 : 502, headers }
            );
        }

        const contentType = response.headers.get('content-type') || '';
        if (!ALLOWED_CONTENT_TYPE.test(contentType)) {
            return NextResponse.json(
                { error: 'Only image, video and audio responses are proxied' },
                { status: 415, headers }
            );
        }

        const declaredLength = Number(response.headers.get('content-length'));
        if (Number.isFinite(declaredLength) && declaredLength > MAX_BYTES) {
            return NextResponse.json({ error: 'Response too large' }, { status: 413, headers });
        }

        const body = await response.arrayBuffer();
        if (body.byteLength > MAX_BYTES) {
            return NextResponse.json({ error: 'Response too large' }, { status: 413, headers });
        }

        return new NextResponse(body, {
            headers: {
                ...headers,
                'Content-Type': contentType,
                'Content-Security-Policy': "default-src 'none'; sandbox",
                'X-Content-Type-Options': 'nosniff',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Proxy failed to fetch the URL' },
            { status: 502, headers }
        );
    }
}
