/**
 * Shorten a URL for display (only if it's very long)
 * e.g., "https://www.example.com/some/long/path/article-name.html" -> "example.com/.../article-name.html"
 */
export function shortenUrl(href: string): string {
  // Only shorten if URL is longer than 50 characters
  if (href.length <= 50) {
    return href;
  }

  try {
    const url = new URL(href);
    // Remove 'www.' prefix for cleaner display
    const hostname = url.hostname.replace(/^www\./, '');
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (pathParts.length === 0) {
      // Just the domain
      return hostname;
    } else if (pathParts.length === 1) {
      // Single path segment
      const part = pathParts[0];
      const truncated = part.length > 30 ? part.slice(0, 30) + '...' : part;
      return `${hostname}/${truncated}`;
    } else {
      // Multiple path segments - show domain/.../last-segment
      const lastPart = pathParts[pathParts.length - 1];
      const truncatedLast = lastPart.length > 30 ? lastPart.slice(0, 30) + '...' : lastPart;
      return `${hostname}/.../` + truncatedLast;
    }
  } catch {
    // If URL parsing fails, return original
    return href;
  }
}