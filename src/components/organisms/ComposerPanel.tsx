'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useState } from 'react';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { useCurrentAccount } from '@/api/queries';
import { useCreateStatus } from '@/api/mutations';
import { Avatar } from '../atoms/Avatar';
import { Image, Globe, Lock, Users, Mail, X } from 'lucide-react';
import type { CreateStatusParams } from '@/types/mastodon';

const MAX_CHAR_COUNT = 500;

type Visibility = 'public' | 'unlisted' | 'private' | 'direct';

const visibilityOptions: Array<{ value: Visibility; label: string; icon: typeof Globe; description: string }> = [
  { value: 'public', label: 'Public', icon: Globe, description: 'Visible to everyone' },
  { value: 'unlisted', label: 'Unlisted', icon: Lock, description: 'Not shown in public timelines' },
  { value: 'private', label: 'Followers only', icon: Users, description: 'Only visible to followers' },
  { value: 'direct', label: 'Direct', icon: Mail, description: 'Only mentioned users' },
];

export function ComposerPanel() {
  const { data: currentAccount } = useCurrentAccount();
  const createStatusMutation = useCreateStatus();

  const [visibility, setVisibility] = useState<Visibility>('public');
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [contentWarning, setContentWarning] = useState('');
  const [showCWInput, setShowCWInput] = useState(false);
  const [sensitive, setSensitive] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
        style: 'min-height: 120px; max-height: 400px; overflow-y: auto; padding: var(--size-3);',
      },
    },
    onCreate: ({ editor }) => {
      setCharCount(editor.getText().length);
    },
    onUpdate: ({ editor }) => {
      setCharCount(editor.getText().length);
    },
    immediatelyRender: false,
  });
  const isOverLimit = charCount > MAX_CHAR_COUNT;
  const canPost = charCount > 0 && !isOverLimit && !createStatusMutation.isPending;

  const currentVisibility = visibilityOptions.find((v) => v.value === visibility);
  const VisibilityIcon = currentVisibility?.icon || Globe;

  const handlePost = async () => {
    if (!editor || !canPost) return;

    const content = editor.getHTML();
    const plainText = editor.getText();

    if (!plainText.trim()) return;

    const params: CreateStatusParams = {
      status: plainText,
      visibility,
    };

    if (showCWInput && contentWarning.trim()) {
      params.spoiler_text = contentWarning;
      params.sensitive = true;
    } else if (sensitive) {
      params.sensitive = true;
    }

    try {
      await createStatusMutation.mutateAsync(params);
      editor.commands.clearContent();
      setCharCount(0);
      setContentWarning('');
      setShowCWInput(false);
      setSensitive(false);
      // TODO: Show success message or redirect
    } catch (error) {
      // TODO: Show error message
      console.error('Failed to create post:', error);
    }
  };

  if (!currentAccount) {
    return (
      <Card>
        <div style={{ padding: 'var(--size-4)', textAlign: 'center', color: 'var(--text-2)' }}>
          Loading...
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ padding: 'var(--size-4)' }}>
        {/* Header with avatar */}
        <div style={{ display: 'flex', gap: 'var(--size-3)', marginBottom: 'var(--size-3)' }}>
          <Avatar
            src={currentAccount.avatar}
            alt={currentAccount.display_name || currentAccount.username}
            size="medium"
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'var(--font-weight-6)', fontSize: 'var(--font-size-2)' }}>
              {currentAccount.display_name || currentAccount.username}
            </div>
            <div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
              @{currentAccount.acct}
            </div>
          </div>

          {/* Visibility selector */}
          <div style={{ position: 'relative' }}>
            <Button
              variant="ghost"
              size="small"
              onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
              title="Post visibility"
            >
              <VisibilityIcon size={18} />
              <span style={{ fontSize: 'var(--font-size-0)' }}>
                {currentVisibility?.label}
              </span>
            </Button>

            {showVisibilityMenu && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 40,
                  }}
                  onClick={() => setShowVisibilityMenu(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 'var(--size-2)',
                    background: 'var(--surface-2)',
                    borderRadius: 'var(--radius-2)',
                    boxShadow: 'var(--shadow-4)',
                    padding: 'var(--size-2)',
                    minWidth: '250px',
                    zIndex: 50,
                  }}
                >
                  {visibilityOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setVisibility(option.value);
                          setShowVisibilityMenu(false);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'start',
                          gap: 'var(--size-2)',
                          padding: 'var(--size-2)',
                          border: 'none',
                          background: visibility === option.value ? 'var(--surface-3)' : 'transparent',
                          borderRadius: 'var(--radius-2)',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <Icon size={20} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'var(--font-weight-6)', color: 'var(--text-1)' }}>
                            {option.label}
                          </div>
                          <div style={{ fontSize: 'var(--font-size-0)', color: 'var(--text-2)' }}>
                            {option.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content Warning */}
        {showCWInput && (
          <div style={{ marginBottom: 'var(--size-3)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--size-2)',
            }}>
              <label style={{ fontSize: 'var(--font-size-1)', fontWeight: 'var(--font-weight-6)' }}>
                Content Warning
              </label>
              <button
                onClick={() => {
                  setShowCWInput(false);
                  setContentWarning('');
                }}
                style={{
                  padding: 'var(--size-1)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-2)',
                }}
              >
                <X size={16} />
              </button>
            </div>
            <input
              type="text"
              value={contentWarning}
              onChange={(e) => setContentWarning(e.target.value)}
              placeholder="Write your warning here"
              style={{
                width: '100%',
                padding: 'var(--size-2)',
                border: '1px solid var(--surface-4)',
                borderRadius: 'var(--radius-2)',
                background: 'var(--surface-1)',
                color: 'var(--text-1)',
                fontSize: 'var(--font-size-1)',
              }}
            />
          </div>
        )}

        {/* Editor */}
        <div
          style={{
            border: '1px solid var(--surface-4)',
            borderRadius: 'var(--radius-2)',
            background: 'var(--surface-1)',
            marginBottom: 'var(--size-3)',
          }}
        >
          <EditorContent editor={editor} />
        </div>

        {/* Bottom toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 'var(--size-2)' }}>
            {/* Media upload button - TODO: implement */}
            <Button variant="ghost" size="small" disabled title="Media upload (coming soon)">
              <Image size={18} />
            </Button>

            {/* Content Warning toggle */}
            <Button
              variant="ghost"
              size="small"
              onClick={() => setShowCWInput(!showCWInput)}
              style={{
                background: showCWInput ? 'var(--surface-3)' : undefined,
              }}
              title="Add content warning"
            >
              CW
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-3)' }}>
            {/* Character count */}
            <div
              style={{
                fontSize: 'var(--font-size-0)',
                color: isOverLimit ? 'var(--red-6)' : 'var(--text-2)',
                fontWeight: isOverLimit ? 'var(--font-weight-6)' : 'normal',
              }}
            >
              {charCount} / {MAX_CHAR_COUNT}
            </div>

            {/* Post button */}
            <Button
              onClick={handlePost}
              disabled={!canPost}
              isLoading={createStatusMutation.isPending}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
