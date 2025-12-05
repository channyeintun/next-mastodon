'use client';

import { type CSSProperties, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { animate, inView } from 'motion';
import { Avatar } from '../atoms/Avatar';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { EmojiText } from '../atoms/EmojiText';
import type { Account } from '@/types/mastodon';
import { useFollowAccount, useUnfollowAccount } from '@/api/mutations';
import { useRelationships } from '@/api/queries';

interface UserCardProps {
  account: Account;
  showFollowButton?: boolean;
  style?: CSSProperties;
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function UserCard({ account, showFollowButton = true, style }: UserCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const followMutation = useFollowAccount();
  const unfollowMutation = useUnfollowAccount();
  const { data: relationships } = useRelationships([account.id]);
  const relationship = relationships?.[0];

  // Animate card entrance
  useEffect(() => {
    if (cardRef.current) {
      const unsubscribe = inView(cardRef.current, () => {
        if (cardRef.current) {
          animate(
            cardRef.current,
            { opacity: [0, 1], y: [20, 0] },
            { duration: 0.4, easing: [0.22, 1, 0.36, 1] }
          );
        }
      });
      return unsubscribe;
    }
  }, []);

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (relationship?.following) {
      unfollowMutation.mutate(account.id);
    } else {
      followMutation.mutate(account.id);
    }
  };

  const isFollowing = relationship?.following || false;
  const isLoading = followMutation.isPending || unfollowMutation.isPending;

  return (
    <Card padding="medium" hoverable style={{ ...style, opacity: 0 }} ref={cardRef}>
      <Link
        href={`/accounts/${account.id}`}
        style={{ textDecoration: 'none', display: 'block' }}
      >
        <div style={{ display: 'flex', gap: 'var(--size-3)' }}>
          <Avatar
            src={account.avatar}
            alt={account.display_name || account.username}
            size="large"
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Name and username */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              gap: 'var(--size-2)',
              marginBottom: 'var(--size-2)',
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontWeight: 'var(--font-weight-6)',
                  color: 'var(--text-1)',
                  fontSize: 'var(--font-size-2)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  <EmojiText
                    text={account.display_name || account.username}
                    emojis={account.emojis}
                  />
                  {account.bot && (
                    <span style={{
                      marginLeft: 'var(--size-2)',
                      fontSize: 'var(--font-size-0)',
                      padding: '2px var(--size-1)',
                      background: 'var(--surface-3)',
                      borderRadius: 'var(--radius-1)',
                      fontWeight: 'var(--font-weight-5)',
                    }}>
                      BOT
                    </span>
                  )}
                  {account.locked && (
                    <span style={{
                      marginLeft: 'var(--size-2)',
                      fontSize: 'var(--font-size-0)',
                    }}>
                      🔒
                    </span>
                  )}
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

              {/* Follow button */}
              {showFollowButton && (
                <Button
                  variant={isFollowing ? 'secondary' : 'primary'}
                  size="small"
                  onClick={handleFollowToggle}
                  isLoading={isLoading}
                  style={{ flexShrink: 0 }}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>

            {/* Bio */}
            {account.note && (
              <div style={{
                fontSize: 'var(--font-size-1)',
                color: 'var(--text-2)',
                lineHeight: '1.4',
                marginBottom: 'var(--size-2)',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {stripHtmlTags(account.note)}
              </div>
            )}

            {/* Stats */}
            <div style={{
              display: 'flex',
              gap: 'var(--size-4)',
              fontSize: 'var(--font-size-0)',
              color: 'var(--text-2)',
            }}>
              <div>
                <strong style={{ color: 'var(--text-1)' }}>
                  {account.statuses_count.toLocaleString()}
                </strong>{' '}
                posts
              </div>
              <div>
                <strong style={{ color: 'var(--text-1)' }}>
                  {account.followers_count.toLocaleString()}
                </strong>{' '}
                followers
              </div>
              <div>
                <strong style={{ color: 'var(--text-1)' }}>
                  {account.following_count.toLocaleString()}
                </strong>{' '}
                following
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}
