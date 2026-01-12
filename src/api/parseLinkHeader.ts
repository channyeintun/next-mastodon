/**
 * Utility functions for parsing Link headers from Mastodon API responses
 * 
 * Mastodon API returns pagination info in the Link header:
 * Link: <https://mastodon.social/api/v1/timelines/home?max_id=123>; rel="next",
 *       <https://mastodon.social/api/v1/timelines/home?min_id=456>; rel="prev"
 */

export interface LinkRef {
  uri: string
  rel: string
}

/**
 * Parse the Link header string into an array of LinkRef objects
 */
export function parseLinkHeader(linkHeader: string | null | undefined): LinkRef[] {
  if (!linkHeader) return []

  const refs: LinkRef[] = []
  // Split by comma, but be careful of commas inside angle brackets
  const parts = linkHeader.split(/,\s*(?=<)/)

  for (const part of parts) {
    // Match <url>; rel="type"
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/)
    if (match) {
      refs.push({
        uri: match[1],
        rel: match[2],
      })
    }
  }

  return refs
}

/**
 * Extract the "next" link URI from parsed Link refs
 */
export function getNextLink(refs: LinkRef[]): string | undefined {
  return refs.find((link) => link.rel === 'next')?.uri
}

/**
 * Extract the "prev" link URI from parsed Link refs
 */
export function getPrevLink(refs: LinkRef[]): string | undefined {
  return refs.find((link) => link.rel === 'prev')?.uri
}

/**
 * Extract max_id from a pagination URL
 */
export function extractMaxId(url: string | undefined): string | undefined {
  if (!url) return undefined
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get('max_id') ?? urlObj.searchParams.get('offset') ?? undefined
  } catch {
    return undefined
  }
}

/**
 * Extract min_id from a pagination URL
 */
export function extractMinId(url: string | undefined): string | undefined {
  if (!url) return undefined
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get('min_id') ?? undefined
  } catch {
    return undefined
  }
}

/**
 * Convenience function to get the next max_id directly from a Link header
 */
export function getNextMaxId(linkHeader: string | null | undefined): string | undefined {
  const refs = parseLinkHeader(linkHeader)
  const nextLink = getNextLink(refs)
  return extractMaxId(nextLink)
}

/**
 * Convenience function to get the previous min_id directly from a Link header
 */
export function getPrevMinId(linkHeader: string | null | undefined): string | undefined {
  const refs = parseLinkHeader(linkHeader)
  const prevLink = getPrevLink(refs)
  return extractMinId(prevLink)
}
