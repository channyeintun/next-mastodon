'use client';

import styled from '@emotion/styled';
import { useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Emoji, Mention } from '@/types/mastodon';

interface StatusContentProps {
  html: string;
  emojis?: Emoji[];
  mentions?: Mention[];
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Compare two URLs for equality (ignoring protocol differences and trailing slashes)
 * Similar to official Mastodon's compareUrls function
 */
function compareUrls(href1: string, href2: string): boolean {
  try {
    const url1 = new URL(href1);
    const url2 = new URL(href2);
    return url1.origin === url2.origin && url1.pathname === url2.pathname && url1.search === url2.search;
  } catch {
    return false;
  }
}

/**
 * Shorten a URL for display (only if it's very long)
 * e.g., "https://www.example.com/some/long/path/article-name.html" -> "example.com/.../article-name.html"
 */
function shortenUrl(href: string): string {
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
/**
 * Renders Mastodon status content HTML with:
 * - Highlighted mentions and hashtags
 * - Custom emoji rendering
 * - Internal navigation for mentions and hashtags (no external redirects)
 */
export function StatusContent({ html, emojis = [], mentions = [], style, className }: StatusContentProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  // Process HTML to replace emoji shortcodes with img tags
  const processedHtml = useMemo(() => {
    if (!emojis || emojis.length === 0) {
      return html;
    }

    // Replace :shortcode: with <img> tags
    let processed = html;
    emojis.forEach(emoji => {
      const shortcodePattern = new RegExp(`:${emoji.shortcode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:`, 'g');
      const imgTag = `<img src="${emoji.url}" alt=":${emoji.shortcode}:" title=":${emoji.shortcode}:" class="custom-emoji" style="height: 1.2em; width: 1.2em; vertical-align: middle; object-fit: contain; display: inline-block; margin: 0 0.1em;" />`;
      processed = processed.replace(shortcodePattern, imgTag);
    });

    return processed;
  }, [html, emojis]);

  // Create click handler with mentions in scope
  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');

    if (!link) return;

    // Check if it's a hashtag FIRST (before mentions)
    // Hashtags might also have u-url class, so check them first
    if (link.classList.contains('hashtag')) {
      e.preventDefault();
      e.stopPropagation();

      // Extract hashtag from the link
      const hashtagText = link.textContent?.trim() || '';
      const hashtag = hashtagText.startsWith('#')
        ? hashtagText.slice(1)
        : hashtagText;

      if (hashtag) {
        router.push(`/tags/${encodeURIComponent(hashtag)}`);
      }
      return;
    }

    // Check if it's a mention
    if (link.classList.contains('mention') || link.classList.contains('u-url')) {
      e.preventDefault();
      e.stopPropagation();

      // Find matching mention by comparing URLs
      // This gives us the full acct (username@domain for remote users)
      const mention = mentions.find(m => compareUrls(link.href, m.url));

      if (mention) {
        // Use the full acct from the mentions array
        router.push(`/@${mention.acct}`);
      } else {
        // Fallback: try to extract from href pathname
        try {
          const url = new URL(link.href);
          const pathname = url.pathname;
          // Handle different URL formats: /@username, /users/username, /@username@domain
          if (pathname.startsWith('/@')) {
            router.push(pathname);
          } else {
            // Extract last path segment as username
            const username = pathname.split('/').filter(Boolean).pop();
            if (username) {
              router.push(`/@${username}`);
            }
          }
        } catch {
          // If URL parsing fails, fall back to textContent
          const mentionText = link.textContent?.trim() || '';
          const username = mentionText.startsWith('@')
            ? mentionText.slice(1)
            : mentionText;
          if (username) {
            router.push(`/@${username}`);
          }
        }
      }
      return;
    }

    // For other links, allow default behavior (open in new tab)
    if (link.href && !link.href.startsWith(window.location.origin)) {
      e.preventDefault();
      window.open(link.href, '_blank', 'noopener,noreferrer');
    }
  }, [mentions, router]);

  useEffect(() => {
    if (!contentRef.current) return;

    const container = contentRef.current;

    // Add styling to mentions, hashtags, and regular links
    const mentionLinks = container.querySelectorAll('a.mention, a.u-url.mention');
    mentionLinks.forEach((link: Element) => {
      const anchor = link as HTMLAnchorElement;
      anchor.style.color = 'var(--status-link-color)';
      anchor.style.fontWeight = 'var(--font-weight-6)';
      anchor.style.textDecoration = 'none';
      anchor.classList.add('status-link');
    });

    const hashtags = container.querySelectorAll('a.hashtag');
    hashtags.forEach((link: Element) => {
      const anchor = link as HTMLAnchorElement;
      anchor.style.color = 'var(--status-link-color)';
      anchor.style.fontWeight = 'var(--font-weight-6)';
      anchor.style.textDecoration = 'none';
      anchor.classList.add('status-link');
    });

    // Style custom emoji images
    const customEmojis = container.querySelectorAll('img.custom-emoji, img[data-emoji]');
    customEmojis.forEach((img: Element) => {
      const emojiImg = img as HTMLImageElement;
      emojiImg.style.height = '1.2em';
      emojiImg.style.width = '1.2em';
      emojiImg.style.verticalAlign = 'middle';
      emojiImg.style.objectFit = 'contain';
      emojiImg.style.display = 'inline-block';
      emojiImg.style.margin = '0 0.1em';
    });

    // Style regular links (not mentions or hashtags)
    const allLinks = container.querySelectorAll('a');
    allLinks.forEach((link: Element) => {
      const anchor = link as HTMLAnchorElement;
      // Skip if it's a mention or hashtag
      if (anchor.classList.contains('mention') ||
        anchor.classList.contains('u-url') ||
        anchor.classList.contains('hashtag')) {
        return;
      }
      // Style regular external links
      anchor.style.color = 'var(--status-link-color)';
      anchor.style.textDecoration = 'none';
      anchor.classList.add('status-link');

      // Shorten long URLs for cleaner display
      anchor.textContent = shortenUrl(anchor.href);
    });

    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [processedHtml, handleClick]);

  return (
    <ContentContainer style={style} className={className}>
      <ContentWrapper
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
    </ContentContainer>
  );
}

// Styled components
const ContentContainer = styled.div`
  color: var(--text-1);
  font-size: 0.9375rem;
  line-height: 1.5;
  word-break: break-word;
`;

const ContentWrapper = styled.div`
  display: block;

  p {
    font-size: inherit;
    margin-bottom: 22px;
    white-space: pre-wrap;
    unicode-bidi: plaintext;
    line-height: normal;
  }

  p:last-child {
    margin-bottom: 0;
  }

  /* Underline only on hover for all links */
  a.status-link:hover {
    text-decoration: underline !important;
  }
`;
