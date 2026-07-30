import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Makes Cloudflare bindings (ASSETS, WORKER_SELF_REFERENCE, …) available during
 * `next dev`, so local development sees the same env as the deployed Worker.
 * No-op outside dev.
 */
initOpenNextCloudflareForDev();

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
  experimental: {
    /**
     * TypeScript 7 is the native (Go) compiler and no longer exposes the
     * JS compiler API that Next's built-in type check calls into. This makes
     * Next shell out to the `tsc` CLI instead, which TS 7 does still ship.
     * Required as long as `typescript` is on 7.x — remove it if the toolchain
     * ever moves back to a 6.x line.
     */
    useTypeScriptCli: true,
  },
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
