import { Node, mergeAttributes } from '@tiptap/core';
import type { Emoji } from '@/types/mastodon';

export interface CustomEmojiOptions {
  HTMLAttributes: Record<string, any>;
  emojis: Emoji[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customEmoji: {
      /**
       * Insert a custom emoji
       */
      insertCustomEmoji: (shortcode: string, url: string) => ReturnType;
    };
  }
}

export const CustomEmoji = Node.create<CustomEmojiOptions>({
  name: 'customEmoji',

  group: 'inline',

  inline: true,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      emojis: [],
    };
  },

  addAttributes() {
    return {
      shortcode: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-shortcode') || element.getAttribute('title'),
        renderHTML: (attributes) => {
          if (!attributes.shortcode) {
            return {};
          }

          return {
            'data-shortcode': attributes.shortcode,
            title: `:${attributes.shortcode}:`,
          };
        },
      },
      url: {
        default: null,
        parseHTML: (element) => element.getAttribute('src'),
        renderHTML: (attributes) => {
          if (!attributes.url) {
            return {};
          }

          return {
            src: attributes.url,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img.custom-emoji',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const element = node as HTMLElement;
          const shortcode = element.getAttribute('data-shortcode') || element.getAttribute('title')?.replace(/:/g, '');
          const url = element.getAttribute('src');

          return shortcode && url ? { shortcode, url } : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'img',
      mergeAttributes(
        {
          class: 'custom-emoji',
          style: 'width: 1.2em; height: 1.2em; vertical-align: middle; object-fit: contain;',
          alt: `:${HTMLAttributes.shortcode}:`,
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
    ];
  },

  addCommands() {
    return {
      insertCustomEmoji:
        (shortcode: string, url: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              shortcode,
              url,
            },
          });
        },
    };
  },

  renderText({ node }) {
    return `:${node.attrs.shortcode}:`;
  },
});
