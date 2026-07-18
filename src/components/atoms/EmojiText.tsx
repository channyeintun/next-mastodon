import styled from '@emotion/styled';
import type { CSSProperties, ReactElement } from 'react';
import type { Emoji } from '@/types/mastodon';
import { sanitizeHtml } from '@/utils/sanitize';

// Styled components
const EmojiImage = styled.img`
  height: 1.25em;
  width: 1.25em;
  vertical-align: middle;
  object-fit: contain;
  display: inline-block;
  margin: 0 0.1em;
`;

interface EmojiTextProps {
  text: string;
  emojis: Emoji[];
  style?: CSSProperties;
  className?: string;
  html?: boolean;
}

/**
 * Renders text with custom Mastodon emojis replaced by images
 * Example: "Hello :custom_emoji:" -> "Hello <img src="..." />"
 * @param html - If true, treats text as HTML and returns processed HTML string for dangerouslySetInnerHTML
 */
export function EmojiText({ text, emojis, style, className, html = false }: EmojiTextProps) {
  if (!emojis || emojis.length === 0) {
    if (html) {
      return <span style={style} className={className} dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }} />;
    }
    return <span style={style} className={className}>{text}</span>;
  }
  
  // If HTML mode, process and return as dangerouslySetInnerHTML
  if (html) {
    let processedHtml = text;
    emojis.forEach(emoji => {
      const shortcodePattern = new RegExp(`:${emoji.shortcode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:`, 'g');
      const emojiImg = `<img src="${emoji.url}" alt=":${emoji.shortcode}:" title=":${emoji.shortcode}:" style="height: 1.25em; width: 1.25em; vertical-align: middle; object-fit: contain; display: inline-block; margin: 0 0.1em;" loading="lazy" />`;
      processedHtml = processedHtml.replace(shortcodePattern, emojiImg);
    });
    return <span style={style} className={className} dangerouslySetInnerHTML={{ __html: sanitizeHtml(processedHtml) }} />;
  }

  // Split text by emoji shortcodes and replace with images
  const parts: (string | ReactElement)[] = [];
  let lastIndex = 0;
  let key = 0;

  // Create a regex pattern that matches all emoji shortcodes
  const emojiMap = new Map(emojis.map(e => [e.shortcode, e]));
  const shortcodes = Array.from(emojiMap.keys());

  if (shortcodes.length === 0) {
    return <span style={style} className={className}>{text}</span>;
  }

  // Create regex: :(shortcode1|shortcode2|...):
  const pattern = new RegExp(`:(?:${shortcodes.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')}):`, 'g');

  let match;
  while ((match = pattern.exec(text)) !== null) {
    // Add text before the emoji
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Extract shortcode (remove colons)
    const shortcode = match[0].slice(1, -1);
    const emoji = emojiMap.get(shortcode);

    if (emoji) {
      parts.push(
        <EmojiImage
          key={key++}
          src={emoji.url}
          alt={`:${shortcode}:`}
          title={`:${shortcode}:`}
          loading="lazy"
        />
      );
    } else {
      // If emoji not found, keep the original text
      parts.push(match[0]);
    }

    lastIndex = pattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return (
    <span style={style} className={className}>
      {parts.map((part, index) => (
        typeof part === 'string' ? part : <span key={index}>{part}</span>
      ))}
    </span>
  );
}
