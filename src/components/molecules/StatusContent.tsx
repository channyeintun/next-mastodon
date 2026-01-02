'use client';

import styled from '@emotion/styled';
import { useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import type { Emoji } from '@/types/mastodon';

interface StatusContentProps {
  html: string;
  emojis?: Emoji[];
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Renders Mastodon status content HTML with:
 * - Highlighted mentions and hashtags
 * - Custom emoji rendering
 * - Internal navigation for mentions and hashtags (no external redirects)
 */
export function StatusContent({ html, emojis = [], style, className }: StatusContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Process HTML to replace emoji shortcodes with img tags
  const processedHtml = useMemo(() => {
    if (!emojis || emojis.length === 0) {
      return html;
    }

    // Create a map of shortcode to emoji URL
    // const emojiMap = new Map(emojis.map(e => [e.shortcode, e.url]));

    // Replace :shortcode: with <img> tags
    let processed = html;
    emojis.forEach(emoji => {
      const shortcodePattern = new RegExp(`:${emoji.shortcode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:`, 'g');
      const imgTag = `<img src="${emoji.url}" alt=":${emoji.shortcode}:" title=":${emoji.shortcode}:" class="custom-emoji" style="height: 1.2em; width: 1.2em; vertical-align: middle; object-fit: contain; display: inline-block; margin: 0 0.1em;" />`;
      processed = processed.replace(shortcodePattern, imgTag);
    });

    return processed;
  }, [html, emojis]);

  useEffect(() => {
    if (!contentRef.current) return;

    const container = contentRef.current;

    // Add styling to mentions, hashtags, and regular links
    const mentions = container.querySelectorAll('a.mention, a.u-url.mention');
    mentions.forEach((link) => {
      const anchor = link as HTMLAnchorElement;
      anchor.style.color = 'var(--blue-6)';
      anchor.style.fontWeight = 'var(--font-weight-6)';
      anchor.style.textDecoration = 'none';
    });

    const hashtags = container.querySelectorAll('a.hashtag');
    hashtags.forEach((link) => {
      const anchor = link as HTMLAnchorElement;
      anchor.style.color = 'var(--indigo-6)';
      anchor.style.fontWeight = 'var(--font-weight-6)';
      anchor.style.textDecoration = 'none';
    });

    // Style custom emoji images
    const customEmojis = container.querySelectorAll('img.custom-emoji, img[data-emoji]');
    customEmojis.forEach((img) => {
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
    allLinks.forEach((link) => {
      const anchor = link as HTMLAnchorElement;
      // Skip if it's a mention or hashtag
      if (anchor.classList.contains('mention') ||
        anchor.classList.contains('u-url') ||
        anchor.classList.contains('hashtag')) {
        return;
      }
      // Style regular external links
      anchor.style.color = 'var(--cyan-6)';
      anchor.style.textDecoration = 'underline';
    });

    // Handle clicks on all links
    const handleClick = (e: MouseEvent) => {
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

        // Extract username from the link
        // Mastodon mentions have format: <span>@<span>username</span></span>
        const mentionText = link.textContent?.trim() || '';

        // Remove @ if present at start
        const username = mentionText.startsWith('@')
          ? mentionText.slice(1)
          : mentionText;

        if (username) {
          router.push(`/@${username}`);
        }
        return;
      }

      // For other links, allow default behavior (open in new tab)
      if (link.href && !link.href.startsWith(window.location.origin)) {
        e.preventDefault();
        window.open(link.href, '_blank', 'noopener,noreferrer');
      }
    };

    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [processedHtml, router]);

  return (
    <ContentWrapper
      ref={contentRef}
      style={style}
      className={className}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}

// Styled components
const ContentWrapper = styled.div`
  color: var(--text-1);
  line-height: 1.5;
  word-break: break-word;

  p {
    margin-bottom: 22px;
    white-space: pre-wrap;
    unicode-bidi: plaintext;
    line-height: normal;
  }

  p:last-child {
    margin-bottom: 0;
  }
`;
