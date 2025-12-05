import { Mark, mergeAttributes } from '@tiptap/core';

export interface HashtagOptions {
  HTMLAttributes: Record<string, any>;
  onHashtagClick?: (hashtag: string) => void;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    hashtag: {
      /**
       * Set a hashtag mark
       */
      setHashtag: () => ReturnType;
      /**
       * Toggle a hashtag mark
       */
      toggleHashtag: () => ReturnType;
      /**
       * Unset a hashtag mark
       */
      unsetHashtag: () => ReturnType;
    };
  }
}

export const Hashtag = Mark.create<HashtagOptions>({
  name: 'hashtag',

  priority: 1000,

  addOptions() {
    return {
      HTMLAttributes: {},
      onHashtagClick: undefined,
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a.hashtag',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const href = (node as HTMLElement).getAttribute('href');
          const match = href?.match(/\/tags\/(.+)$/);
          return match ? { hashtag: match[1] } : false;
        },
      },
      {
        tag: 'span[data-type="hashtag"]',
      },
    ];
  },

  addAttributes() {
    return {
      hashtag: {
        default: null,
        parseHTML: (element) => {
          return element.getAttribute('data-hashtag');
        },
        renderHTML: (attributes) => {
          if (!attributes.hashtag) {
            return {};
          }

          return {
            'data-hashtag': attributes.hashtag,
          };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        {
          'data-type': 'hashtag',
          class: 'hashtag',
          style: 'color: var(--indigo-6); font-weight: var(--font-weight-6); cursor: pointer;',
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      0,
    ];
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () => {
        const { state } = this.editor;
        const { selection } = state;
        const { $from } = selection;

        // Check if we're at the start of a hashtag
        const marks = $from.marks();
        const hashtagMark = marks.find((mark) => mark.type.name === 'hashtag');

        if (hashtagMark && $from.parentOffset === 0) {
          return this.editor.commands.unsetHashtag();
        }

        return false;
      },
    };
  },
});
