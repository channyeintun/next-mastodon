import { defineCloudflareConfig } from '@opennextjs/cloudflare';

/**
 * OpenNext adapter config.
 *
 * No incremental cache override is set: every route in this app is either
 * static or dynamic (`ƒ`) — there is no ISR — so there is nothing for an
 * incremental cache to store. Add `r2IncrementalCache` here if ISR or
 * `revalidate` is introduced later.
 */
export default defineCloudflareConfig();
