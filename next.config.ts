import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Baseline security headers.
 *
 * The app renders HTML fetched from arbitrary user-chosen instances and keeps a
 * JS-readable bearer token, so the cheap browser-side mitigations are worth
 * having. The CSP deliberately covers only directives that need no nonce
 * plumbing: `frame-ancestors` (clickjacking), `base-uri` (injected <base> that
 * would re-target relative URLs) and `object-src` (plugin content). A full
 * script-src policy needs per-request nonces for Next's inline bootstrap and is
 * left as follow-up work rather than shipped half-broken.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
];

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  reactCompiler: true,
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        {
          key: 'Service-Worker-Allowed',
          value: '/',
        },
      ],
    },
    {
      source: '/:path*',
      headers: securityHeaders,
    },
  ],
};

export default withNextIntl(nextConfig);
