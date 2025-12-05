'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { MentionWithClick } from '@/lib/tiptap/extensions/MentionWithClick';
import { Hashtag } from '@/lib/tiptap/extensions/Hashtag';
import { CustomEmoji } from '@/lib/tiptap/extensions/CustomEmoji';
import { ExternalLink } from '@/lib/tiptap/extensions/ExternalLink';
import type { Emoji } from '@/types/mastodon';
import type { SuggestionOptions } from '@tiptap/suggestion';

interface TiptapEditorProps {
  content?: string;
  editable?: boolean;
  placeholder?: string;
  emojis?: Emoji[];
  onUpdate?: (html: string, text: string) => void;
  mentionSuggestion?: Omit<SuggestionOptions, 'editor'>;
  className?: string;
  style?: React.CSSProperties;
}

export function TiptapEditor({
  content = '',
  editable = true,
  placeholder = "What's on your mind?",
  emojis = [],
  onUpdate,
  mentionSuggestion,
  className,
  style,
}: TiptapEditorProps) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Disable built-in code block for cleaner output
        codeBlock: false,
        // Keep paragraph, bold, italic, etc.
      }),
      Placeholder.configure({
        placeholder: editable ? placeholder : '',
      }),
      MentionWithClick.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        ...(mentionSuggestion && { suggestion: mentionSuggestion }),
      }),
      Hashtag.configure({
        HTMLAttributes: {
          class: 'hashtag',
        },
      }),
      CustomEmoji.configure({
        emojis,
        HTMLAttributes: {
          class: 'custom-emoji',
        },
      }),
      ExternalLink.configure({
        openOnClick: !editable, // Only auto-open in read mode
        HTMLAttributes: {
          class: 'external-link',
        },
      }),
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: editable ? 'tiptap-editor-editable' : 'tiptap-editor-readonly',
        style: 'outline: none;',
      },
    },
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        const html = editor.getHTML();
        const text = editor.getText();
        onUpdate(html, text);
      }
    },
  });

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update editable state when prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  // Handle clicks on mentions and hashtags in read-only mode
  useEffect(() => {
    if (!editor || editable) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check for hashtags FIRST (before mentions) to prevent conflicts
      if (target.classList.contains('hashtag') || target.closest('.hashtag')) {
        const hashtagElement = target.classList.contains('hashtag') ? target : target.closest('.hashtag');
        if (hashtagElement) {
          const hashtag = hashtagElement.getAttribute('data-hashtag') || hashtagElement.textContent?.replace('#', '').trim();
          if (hashtag) {
            event.preventDefault();
            event.stopPropagation();
            router.push(`/tags/${hashtag}`);
          }
        }
        return;
      }

      // Handle mention clicks (check this AFTER hashtags)
      if (target.classList.contains('mention') || target.closest('.mention')) {
        const mentionElement = target.classList.contains('mention') ? target : target.closest('.mention');
        if (mentionElement) {
          const acct = mentionElement.getAttribute('data-id') || mentionElement.textContent?.replace('@', '').trim();
          if (acct && !acct.startsWith('#')) { // Extra safety: don't treat hashtags as mentions
            event.preventDefault();
            event.stopPropagation();
            router.push(`/@${acct}`);
          }
        }
        return;
      }

      // External links are handled by the extension itself
    };

    const editorElement = editorRef.current;
    if (editorElement) {
      editorElement.addEventListener('click', handleClick);
      return () => {
        editorElement.removeEventListener('click', handleClick);
      };
    }
  }, [editor, editable, router]);

  if (!editor) {
    return null;
  }

  return (
    <div ref={editorRef} className={className} style={style}>
      <EditorContent editor={editor} />
    </div>
  );
}
