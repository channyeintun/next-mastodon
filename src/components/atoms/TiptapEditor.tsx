'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import { MentionWithClick } from '@/lib/tiptap/extensions/MentionWithClick';
import { Hashtag } from '@/lib/tiptap/extensions/Hashtag';
import { CustomEmoji } from '@/lib/tiptap/extensions/CustomEmoji';
import type { Emoji } from '@/types/mastodon';
import type { SuggestionOptions } from '@tiptap/suggestion';

interface TiptapEditorProps {
  content?: string;
  placeholder?: string;
  emojis?: Emoji[];
  onUpdate?: (html: string, text: string) => void;
  onEditorReady?: (editor: any) => void;
  mentionSuggestion?: Omit<SuggestionOptions, 'editor'>;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

/**
 * Rich text editor for composing posts
 * - WYSIWYG editing with live preview
 * - Mention autocomplete with @ detection
 * - Hashtag and custom emoji support
 */
export function TiptapEditor({
  content = '',
  placeholder = "What's on your mind?",
  emojis = [],
  onUpdate,
  onEditorReady,
  mentionSuggestion,
  className,
  style,
  ariaLabel,
}: TiptapEditorProps) {

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Disable built-in code block for cleaner output
        codeBlock: false,
        // Keep paragraph, bold, italic, etc.
      }),
      Placeholder.configure({
        placeholder,
      }),
      MentionWithClick.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        ...(mentionSuggestion && { suggestion: mentionSuggestion }),
      }),
      Hashtag,
      CustomEmoji.configure({
        emojis,
      }),
    ],
    content,
    editable: true,
    editorProps: {
      attributes: {
        class: 'tiptap-editor-editable',
        style: 'outline: none;',
        ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
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

  // Notify parent when editor is ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={className} style={style}>
      <EditorContent editor={editor} />
    </div>
  );
}
