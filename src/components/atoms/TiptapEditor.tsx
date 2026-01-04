'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useMemo } from 'react';
import { MentionWithClick } from '@/lib/tiptap/extensions/MentionWithClick';
import { Hashtag } from '@/lib/tiptap/extensions/Hashtag';
import { CustomEmoji } from '@/lib/tiptap/extensions/CustomEmoji';
import { FilePasteHandler } from '@/lib/tiptap/extensions/FilePasteHandler';
import type { Emoji } from '@/types/mastodon';
import type { SuggestionOptions } from '@tiptap/suggestion';

interface TiptapEditorProps {
  content?: string;
  placeholder?: string;
  emojis?: Emoji[];
  onUpdate?: (html: string, text: string) => void;
  onEditorReady?: (editor: any) => void;
  mentionSuggestion?: Omit<SuggestionOptions, 'editor'>;
  /** Callback when files are pasted or dropped into the editor */
  onFilePaste?: (files: File[]) => void;
  /** Callback when a URL is pasted (for potential link card creation) */
  onUrlPaste?: (url: URL) => void;
  /** Maximum number of files that can be uploaded at once */
  maxFiles?: number;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

/**
 * Rich text editor for composing posts
 * - WYSIWYG editing with live preview
 * - Mention autocomplete with @ detection
 * - Hashtag and custom emoji support
 * - File paste/drop support for media uploads
 */
// eslint-disable-next-line max-lines-per-function
export function TiptapEditor({
  content = '',
  placeholder = "What's on your mind?",
  emojis = [],
  onUpdate,
  onEditorReady,
  mentionSuggestion,
  onFilePaste,
  onUrlPaste,
  maxFiles = 4,
  className,
  style,
  ariaLabel,
}: TiptapEditorProps) {

  // Memoize extensions to avoid recreation on every render
  const extensions = useMemo(() => [
    StarterKit.configure({
      // Disable built-in code block for cleaner output
      codeBlock: false,
      // Disable automatic list conversion (- and space → bullet list)
      bulletList: false,
      orderedList: false,
      listItem: false,
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
    FilePasteHandler.configure({
      onFilePaste,
      onUrlPaste,
      maxFiles,
      allowedMimeTypes: ['image/*', 'video/*'],
    }),
  ], [placeholder, mentionSuggestion, emojis, onFilePaste, onUrlPaste, maxFiles]);

  const editor = useEditor({
    immediatelyRender: true,
    extensions,
    content,
    editable: true,
    // Preserve whitespace when parsing content
    parseOptions: {
      preserveWhitespace: 'full',
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-editable',
        style: 'outline: none;',
        ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
      },
      // Preserve multiple consecutive spaces when pasting plain text
      // HTML normally collapses multiple spaces into one
      // We convert runs of spaces to: first space regular, rest non-breaking
      transformPastedText(text) {
        // Replace runs of 2+ spaces: keep first space, convert rest to nbsp
        return text.replace(/ {2,}/g, (match) => {
          return ' ' + '\u00A0'.repeat(match.length - 1);
        });
      },
      // Preserve multiple consecutive spaces when pasting HTML content
      // Convert regular spaces to non-breaking spaces to prevent collapse
      transformPastedHTML(html) {
        // Replace runs of 2+ spaces in text content with nbsp equivalents
        // Use &#160; (HTML entity for nbsp) instead of &nbsp; for compatibility
        return html.replace(/ {2,}/g, (match) => {
          return ' ' + '&#160;'.repeat(match.length - 1);
        });
      },
    },
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        const html = editor.getHTML();
        // Use single newline as block separator (default is double newline)
        // This matches Mastodon's expected format for status text
        // Also convert non-breaking spaces back to regular spaces for the API
        const text = editor.getText({ blockSeparator: '\n' }).replace(/\u00A0/g, ' ');
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

  // Call onUpdate with initial content when editor is first created
  useEffect(() => {
    if (editor && onUpdate) {
      const html = editor.getHTML();
      const text = editor.getText({ blockSeparator: '\n' }).replace(/\u00A0/g, ' ');
      // Only call if there's actual content
      if (text.trim().length > 0) {
        onUpdate(html, text);
      }
    }
    // Only run once when editor is first created, intentionally omitting onUpdate
  }, [editor]);

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
