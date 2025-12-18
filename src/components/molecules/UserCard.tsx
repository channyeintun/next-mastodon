'use client';

import styled from '@emotion/styled';
import { type CSSProperties } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Avatar, Card, Button, EmojiText } from '@/components/atoms';
import type { Account } from '@/types';
import { useFollowAccount, useUnfollowAccount, useRelationships } from '@/api';
import { useAccountStore } from '@/hooks/useStores';

interface UserCardProps {
  account: Account;
  showFollowButton?: boolean;
  style?: CSSProperties;
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function UserCard({ account, showFollowButton = true, style }: UserCardProps) {
  const followMutation = useFollowAccount();
  const unfollowMutation = useUnfollowAccount();
  const { data: relationships } = useRelationships([account.id]);
  const relationship = relationships?.[0];
  const accountStore = useAccountStore();

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
    <Card padding="medium" hoverable style={style}>
      <StyledLink href={`/@${account.acct}`} onClick={() => accountStore.cacheAccount(account)}>
        <ContentContainer>
          <Avatar
            src={account.avatar}
            alt={account.display_name || account.username}
            size="large"
          />

          <InfoSection>
            {/* Name and username */}
            <HeaderRow>
              <NameContainer>
                <DisplayNameRow>
                  <EmojiText
                    text={account.display_name || account.username}
                    emojis={account.emojis}
                  />
                  {account.bot && (
                    <BotBadge>
                      BOT
                    </BotBadge>
                  )}
                  {account.locked && (
                    <LockIcon>
                      <Lock size={12} />
                    </LockIcon>
                  )}
                </DisplayNameRow>
                <Username>
                  @{account.acct}
                </Username>
              </NameContainer>

              {/* Follow button */}
              {showFollowButton && (
                <StyledButton
                  variant={isFollowing ? 'secondary' : 'primary'}
                  size="small"
                  onClick={handleFollowToggle}
                  isLoading={isLoading}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </StyledButton>
              )}
            </HeaderRow>

            {/* Bio */}
            {account.note && (
              <Bio>
                {stripHtmlTags(account.note)}
              </Bio>
            )}

            {/* Stats */}
            <StatsRow>
              <div>
                <StatCount>
                  {account.statuses_count.toLocaleString()}
                </StatCount>{' '}
                posts
              </div>
              <div>
                <StatCount>
                  {account.followers_count.toLocaleString()}
                </StatCount>{' '}
                followers
              </div>
              <div>
                <StatCount>
                  {account.following_count.toLocaleString()}
                </StatCount>{' '}
                following
              </div>
            </StatsRow>
          </InfoSection>
        </ContentContainer>
      </StyledLink>
    </Card>
  );
}

const StyledLink = styled(Link)`
  text-decoration: none;
  display: block;
`;

const ContentContainer = styled.div`
  display: flex;
  gap: var(--size-3);
`;

const InfoSection = styled.div`
  flex: 1;
  min-width: 0;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: var(--size-2);
  margin-bottom: var(--size-2);
`;

const NameContainer = styled.div`
  min-width: 0;
  flex: 1;
`;

const DisplayNameRow = styled.div`
  font-weight: var(--font-weight-6);
  color: var(--text-1);
  font-size: var(--font-size-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BotBadge = styled.span`
  margin-left: var(--size-2);
  font-size: var(--font-size-0);
  padding: 2px var(--size-1);
  background: var(--surface-3);
  border-radius: var(--radius-1);
  font-weight: var(--font-weight-5);
`;

const LockIcon = styled.span`
  margin-left: var(--size-2);
  font-size: var(--font-size-0);
`;

const Username = styled.div`
  font-size: var(--font-size-0);
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledButton = styled(Button)`
  flex-shrink: 0;
`;

const Bio = styled.div`
  font-size: var(--font-size-1);
  color: var(--text-2);
  line-height: 1.4;
  margin-bottom: var(--size-2);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const StatsRow = styled.div`
  display: flex;
  gap: var(--size-4);
  font-size: var(--font-size-0);
  color: var(--text-2);
`;

const StatCount = styled.strong`
  color: var(--text-1);
`;
