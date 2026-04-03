/**
 * Pretext integration for accurate virtual list height estimation.
 *
 * Uses @chenglou/pretext to pre-compute text paragraph heights via canvas
 * measurement rather than DOM reflow. This makes TanStack Virtual's
 * `estimateSize` return values close to actual rendered heights, eliminating
 * scroll jumps caused by large deltas between estimated and measured sizes.
 *
 * Architecture:
 *   prepare(text, font)  — one-time segmentation + canvas measurement (~0.04ms)
 *   layout(prepared, w, lh) — pure arithmetic height calc (~0.0002ms)
 */
import { prepare, layout, type PreparedText } from '@chenglou/pretext';
import type { Status } from '@/types';

// ---------------------------------------------------------------------------
// Constants — must match CSS exactly
// ---------------------------------------------------------------------------

/**
 * Canvas font shorthand for post content measurement.
 * Deliberately omits `system-ui` because pretext documents that system-ui
 * resolves to a different optical variant on macOS canvas vs DOM.
 * Using named fallbacks gives consistent results.
 */
const POST_FONT = '15px -apple-system, BlinkMacSystemFont, ".SFNSText-Regular", sans-serif';

/**
 * CSS line-height for body text. Open Props --font-lineheight-3 = 1.5.
 * At 15px font-size → 22.5px, but browsers round to 23px in practice.
 * We use 22.5 to match the CSS computed value as closely as possible.
 */
const POST_LINE_HEIGHT = 22.5;

/**
 * Available width for text content inside a PostCard.
 * Container max-width (680px) minus card padding (16px × 2 = 32px).
 */
const POST_CONTENT_WIDTH = 680 - 32;

/**
 * Fixed pixel overhead per PostCard that is NOT text content.
 * Breakdown:
 *   - Post header (avatar + name + time): ~52px
 *   - Action bar (reply/reblog/fav): ~40px
 *   - Card padding (top + bottom): ~32px
 *   - Margins between sections: ~16px
 * Total: ~140px
 */
const POST_CARD_OVERHEAD = 140;

/**
 * Extra height added when the post has a content warning toggle.
 */
const CW_OVERHEAD = 44;

// ---------------------------------------------------------------------------
// Caches
// ---------------------------------------------------------------------------

/** Maps status ID → precomputed PreparedText handle */
const preparedCache = new Map<string, PreparedText>();

/** Maps status ID → computed text-only pixel height at POST_CONTENT_WIDTH */
const textHeightCache = new Map<string, number>();

// ---------------------------------------------------------------------------
// HTML → plain text
// ---------------------------------------------------------------------------

/**
 * Strips HTML tags and decodes common HTML entities to extract plain text
 * from Mastodon status content. Uses a lightweight regex approach which is
 * faster than DOMParser and sufficient for the tag structures Mastodon APIs
 * produce (<p>, <br>, <a>, <span>).
 */
function stripHtml(html: string): string {
  return html
    // Convert block-level breaks to newlines for accurate line counting
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    // Strip all remaining tags
    .replace(/<[^>]+>/g, '')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Pre-compute text heights for a batch of statuses. Call this when statuses
 * arrive from the API (e.g. in React Query's queryFn). Safe to call multiple
 * times — already-prepared statuses are skipped.
 *
 * Cost: ~0.04ms per status (one-time).
 */
export function precomputeStatusHeights(statuses: Status[]): void {
  for (const status of statuses) {
    const displayStatus = status.reblog ?? status;
    const id = displayStatus.id;

    if (textHeightCache.has(id)) continue;

    const plainText = stripHtml(displayStatus.content || '');

    if (!plainText) {
      textHeightCache.set(id, 0);
      continue;
    }

    const prepared = prepare(plainText, POST_FONT);
    preparedCache.set(id, prepared);

    const { height } = layout(prepared, POST_CONTENT_WIDTH, POST_LINE_HEIGHT);
    textHeightCache.set(id, height);
  }
}

/**
 * Estimate the pixel height of a media section.
 * Uses a conservative approach based on attachment count and type.
 */
function estimateMediaHeight(status: Status): number {
  const displayStatus = status.reblog ?? status;
  const media = displayStatus.media_attachments;

  if (!media || media.length === 0) {
    // Check for link preview card (no media)
    if (displayStatus.card) return 100; // link preview card height
    return 0;
  }

  if (media.length === 1) {
    const attachment = media[0];
    // Single media — use aspect ratio if available
    if (attachment.meta?.original?.aspect) {
      const aspect = attachment.meta.original.aspect;
      // Width of media container = POST_CONTENT_WIDTH + 32 (negative margin)
      const mediaWidth = POST_CONTENT_WIDTH + 32;
      const height = mediaWidth / aspect;
      return Math.min(height, 550); // max-height: 550px in CSS
    }
    if (attachment.type === 'video' || attachment.type === 'gifv') return 350;
    return 300; // default image height
  }

  // Multi-media grid
  if (media.length === 2) return 200;
  if (media.length === 3) return 300;
  return 300; // 4 images in 2×2 grid
}

/**
 * Estimate the pixel height of a poll section.
 */
function estimatePollHeight(status: Status): number {
  const displayStatus = status.reblog ?? status;
  if (!displayStatus.poll) return 0;
  const optionCount = displayStatus.poll.options?.length ?? 0;
  // Each option ~44px + header/footer ~40px
  return optionCount * 44 + 40;
}

/**
 * Returns a precise pixel height estimate for a single Status.
 * Combines pretext text measurement with fixed overhead estimates.
 *
 * Falls back to a reasonable default (250px) if the status hasn't been
 * pre-computed yet.
 */
export function getStatusHeight(status: Status): number {
  const displayStatus = status.reblog ?? status;
  const id = displayStatus.id;

  const textHeight = textHeightCache.get(id);

  if (textHeight === undefined) {
    // Not yet prepared — fall back to default. This can happen if
    // precomputeStatusHeights wasn't called before the virtualizer renders.
    return 250;
  }

  let totalHeight = POST_CARD_OVERHEAD + textHeight;

  // Reblog indicator adds ~28px
  if (status.reblog) totalHeight += 28;

  // Content warning
  if (displayStatus.spoiler_text) totalHeight += CW_OVERHEAD;

  // Media
  totalHeight += estimateMediaHeight(status);

  // Poll
  totalHeight += estimatePollHeight(status);

  // Quoted post (rough estimate)
  if (displayStatus.quote?.quoted_status) totalHeight += 120;

  return Math.round(totalHeight);
}

/**
 * Invalidate caches for a specific status (e.g. after edit or deletion).
 */
export function invalidateStatusHeight(statusId: string): void {
  preparedCache.delete(statusId);
  textHeightCache.delete(statusId);
}

/**
 * Clear all pretext caches. Useful on logout or major state reset.
 */
export function clearPretextCaches(): void {
  preparedCache.clear();
  textHeightCache.clear();
}
