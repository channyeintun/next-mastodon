'use client';

import styled from '@emotion/styled';
import { useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Emoji, Mention } from '@/types/mastodon';
import { shortenUrl } from '@/utils/url';

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
 * Renders Mastodon status content HTML with:
 * - Highlighted mentions and hashtags
 * - Custom emoji rendering
 * - Internal navigation for mentions and hashtags (no external redirects)
 */
export function StatusContent({ html, emojis = [], mentions = [], style, className }: StatusContentProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  // Process HTML to replace emoji shortcodes and handle link shortening/styling
  const processedHtml = useMemo(() => {
    let processed = html;

    // 1. Replace :shortcode: with <img> tags (no inline styles)
    if (emojis && emojis.length > 0) {
      emojis.forEach(emoji => {
        const shortcodePattern = new RegExp(`:${emoji.shortcode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:`, 'g');
        const imgTag = `<img src="${emoji.url}" alt=":${emoji.shortcode}:" title=":${emoji.shortcode}:" class="custom-emoji" />`;
        processed = processed.replace(shortcodePattern, imgTag);
      });
    }

    // 2. Process links: Add status-link class and shorten regular URLs
    // This regex matches <a> tags and captures attributes, href, and content
    processed = processed.replace(/<a\s+([^>]*href="([^"]+)"[^>]*)>(.*?)<\/a>/gi, (match, attributes, href, content) => {
      const isMention = attributes.includes('mention') || attributes.includes('u-url');
      const isHashtag = attributes.includes('hashtag');
      const isSpecial = isMention || isHashtag;

      let newAttributes = attributes;
      // Add status-link class if not present
      if (!newAttributes.includes('status-link')) {
        const classMatch = newAttributes.match(/class="([^"]*)"/);
        if (classMatch) {
          newAttributes = newAttributes.replace(/class="([^"]*)"/, `class="${classMatch[1]} status-link"`);
        } else {
          newAttributes += ' class="status-link"';
        }
      }

      // Shorten URL if it's a regular link, otherwise keep content as is
      const newContent = isSpecial ? content : shortenUrl(href);

      return `<a ${newAttributes}>${newContent}</a>`;
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
    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [handleClick]);

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

  /* Links styling */
  a.status-link {
    color: var(--status-link-color);
    text-decoration: none;
    cursor: pointer;
  }

  a.status-link:hover {
    text-decoration: underline;
  }

  /* Mentions and hashtags have specific weight */
  a.mention,
  a.hashtag {
    font-weight: var(--font-weight-6);
  }

  /* Custom emoji images */
  img.custom-emoji {
    height: 1.2em;
    width: 1.2em;
    vertical-align: middle;
    object-fit: contain;
    display: inline-block;
    margin: 0 0.1em;
  }
`;
