'use client';

import { Activity } from 'react';
import { Avatar } from '../atoms/Avatar';
import { Card } from '../atoms/Card';
import { EmojiText } from '../atoms/EmojiText';
import type { Account } from '@/types/mastodon';

interface MentionSuggestionsProps {
  accounts: Account[];
  isLoading: boolean;
  onSelect: (account: Account) => void;
  position: { top: number; left: number } | null;
  selectedIndex: number;
}

export function MentionSuggestions({
  accounts,
  isLoading,
  onSelect,
  position,
  selectedIndex,
}: MentionSuggestionsProps) {
  const shouldShow = !!position && (isLoading || accounts.length > 0);

  return (
    <Activity mode={shouldShow ? 'visible' : 'hidden'}>
      <div
        style={{
          position: 'absolute',
          top: `${position?.top || 0}px`,
          left: `${position?.left || 0}px`,
          zIndex: 100,
          minWidth: '300px',
          maxWidth: '400px',
          animation: 'fadeInUp 0.2s ease-out',
        }}
      >
        <Card padding="none">
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
          }}>
            <Activity mode={isLoading ? 'visible' : 'hidden'}>
              <div style={{
                padding: 'var(--size-3)',
                textAlign: 'center',
                color: 'var(--text-2)',
                fontSize: 'var(--font-size-1)',
              }}>
                Searching...
              </div>
            </Activity>

            <Activity mode={!isLoading && accounts.length > 0 ? 'visible' : 'hidden'}>
              {accounts.map((account, index) => (
                <button
                  key={account.id}
                  onClick={() => onSelect(account)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--size-2)',
                    padding: 'var(--size-3)',
                    border: 'none',
                    background: selectedIndex === index ? 'var(--surface-3)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedIndex !== index) {
                      e.currentTarget.style.background = 'var(--surface-3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedIndex !== index) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Avatar
                    src={account.avatar}
                    alt={account.display_name || account.username}
                    size="small"
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 'var(--font-weight-6)',
                      color: 'var(--text-1)',
                      fontSize: 'var(--font-size-1)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      <EmojiText
                        text={account.display_name || account.username}
                        emojis={account.emojis}
                      />
                    </div>
                    <div style={{
                      fontSize: 'var(--font-size-0)',
                      color: 'var(--text-2)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      @{account.acct}
                    </div>
                  </div>
                </button>
              ))}
            </Activity>

            <Activity mode={!isLoading && accounts.length === 0 ? 'visible' : 'hidden'}>
              <div style={{
                padding: 'var(--size-3)',
                textAlign: 'center',
                color: 'var(--text-2)',
                fontSize: 'var(--font-size-1)',
              }}>
                No users found
              </div>
            </Activity>
          </div>
        </Card>
      </div>
    </Activity>
  );
}
