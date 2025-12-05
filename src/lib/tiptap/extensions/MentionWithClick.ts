import Mention from '@tiptap/extension-mention';
import { mergeAttributes } from '@tiptap/core';

export interface MentionWithClickOptions {
  HTMLAttributes: Record<string, any>;
  renderLabel?: (props: { options: any; node: any }) => string;
  suggestion?: any;
  onMentionClick?: (acct: string) => void;
}

export const MentionWithClick = Mention.extend<MentionWithClickOptions>({
  addOptions() {
    const parentOptions = this.parent?.() || {};
    return {
      ...parentOptions,
      HTMLAttributes: {},
      renderLabel({ options, node }) {
        return `@${node.attrs.label ?? node.attrs.id}`;
      },
      onMentionClick: undefined,
    } as MentionWithClickOptions;
  },

  parseHTML() {
    return [
      {
        tag: 'a.mention',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const element = node as HTMLElement;
          const href = element.getAttribute('href');
          const text = element.textContent;

          // Extract username from href or text
          let acct = '';
          if (href) {
            // Match /@username or /@username@domain
            const match = href.match(/@([^/]+)/);
            if (match) {
              acct = match[1];
            }
          } else if (text) {
            acct = text.replace('@', '');
          }

          return acct ? { id: acct, label: acct } : false;
        },
      },
      {
        tag: 'span[data-type="mention"]',
      },
    ];
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }

          return {
            'data-id': attributes.id,
          };
        },
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => {
          if (!attributes.label) {
            return {};
          }

          return {
            'data-label': attributes.label,
          };
        },
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const label = this.options.renderLabel
      ? this.options.renderLabel({ options: this.options, node })
      : `@${node.attrs.label ?? node.attrs.id}`;

    return [
      'span',
      mergeAttributes(
        {
          'data-type': 'mention',
          class: 'mention',
          style: 'color: var(--blue-6); font-weight: var(--font-weight-6); cursor: pointer;',
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      label,
    ];
  },

  renderText({ node }) {
    return this.options.renderLabel
      ? this.options.renderLabel({ options: this.options, node })
      : `@${node.attrs.label ?? node.attrs.id}`;
  },
});
