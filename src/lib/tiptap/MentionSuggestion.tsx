import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { Account } from '@/types/mastodon';
import { getMastodonClient } from '@/api/client';
import { Avatar } from '@/components/atoms/Avatar';
import { EmojiText } from '@/components/atoms/EmojiText';

interface MentionListProps {
  items: Account[];
  command: (item: Account) => void;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  if (props.items.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: 'var(--surface-2)',
        borderRadius: 'var(--radius-2)',
        boxShadow: 'var(--shadow-4)',
        padding: 'var(--size-2)',
        maxHeight: '300px',
        overflowY: 'auto',
        minWidth: '250px',
      }}
    >
      {props.items.map((item, index) => (
        <button
          key={item.id}
          onClick={() => selectItem(index)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--size-2)',
            padding: 'var(--size-2)',
            border: 'none',
            background: index === selectedIndex ? 'var(--surface-3)' : 'transparent',
            borderRadius: 'var(--radius-2)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <Avatar src={item.avatar} alt={item.display_name || item.username} size="small" />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div
              style={{
                fontWeight: 'var(--font-weight-6)',
                color: 'var(--text-1)',
                fontSize: 'var(--font-size-1)',
              }}
            >
              <EmojiText text={item.display_name || item.username} emojis={item.emojis} />
            </div>
            <div
              style={{
                fontSize: 'var(--font-size-0)',
                color: 'var(--text-2)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              @{item.acct}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
});

MentionList.displayName = 'MentionList';

export const createMentionSuggestion = (): Omit<SuggestionOptions, 'editor'> => ({
  char: '@',
  allowSpaces: false,

  items: async ({ query }): Promise<Account[]> => {
    if (query.length === 0) {
      return [];
    }

    try {
      const client = getMastodonClient();
      const results = await client.search({ q: query, type: 'accounts', limit: 5 });
      return results.accounts;
    } catch (error) {
      console.error('Failed to search accounts:', error);
      return [];
    }
  },

  render: () => {
    let component: ReactRenderer<MentionListRef, MentionListProps> | undefined;
    let popup: TippyInstance[] | undefined;

    return {
      onStart: (props: SuggestionProps<Account>) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect as () => DOMRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props: SuggestionProps<Account>) {
        component?.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup?.[0]?.setProps({
          getReferenceClientRect: props.clientRect as () => DOMRect,
        });
      },

      onKeyDown(props: { event: KeyboardEvent }) {
        if (props.event.key === 'Escape') {
          popup?.[0]?.hide();
          return true;
        }

        return component?.ref?.onKeyDown(props) ?? false;
      },

      onExit() {
        popup?.[0]?.destroy();
        component?.destroy();
      },
    };
  },

  command: ({ editor, range, props }: { editor: any; range: any; props: Account }) => {
    // Insert mention
    editor
      .chain()
      .focus()
      .deleteRange(range)
      .insertContent([
        {
          type: 'mention',
          attrs: {
            id: props.acct,
            label: props.acct,
          },
        },
        {
          type: 'text',
          text: ' ',
        },
      ])
      .run();
  },
});
