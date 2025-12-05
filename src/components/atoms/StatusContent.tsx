'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface StatusContentProps {
  html: string;
  style?: React.CSSProperties;
}

/**
 * Renders Mastodon status content HTML with:
 * - Highlighted mentions and hashtags
 * - Internal navigation for mentions and hashtags (no external redirects)
 */
export function StatusContent({ html, style }: StatusContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!contentRef.current) return;

    const container = contentRef.current;

    // Add styling to mentions and hashtags
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
  }, [html, router]);

  return (
    <div
      ref={contentRef}
      style={{
        ...style,
        color: 'var(--text-1)',
        lineHeight: '1.5',
        wordBreak: 'break-word',
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
