'use client';

import styled from '@emotion/styled';
import { type CSSProperties } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, Card, Button, EmojiText } from '@/components/atoms';
import type { Account } from '@/types';
import { useFollowAccount, useUnfollowAccount, useRelationships, prefillAccountCache } from '@/api';

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
  const queryClient = useQueryClient();

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (relationship?.following) {
      unfollowMutation.mutate(account.id);
    } else {
      followMutation.mutate({ id: account.id });
    }
  };

  const isFollowing = relationship?.following || false;
  const isLoading = followMutation.isPending || unfollowMutation.isPending;

  // Pre-populate account cache before navigation  
  const handleProfileClick = () => {
    prefillAccountCache(queryClient, account);
  };

  return (
    <Card padding="medium" hoverable style={style}>
      <StyledLink href={`/@${account.acct}`} onClick={handleProfileClick}>
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
                <div className="usercard-display-name text-truncate">
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
                </div>
                <div className="usercard-username text-truncate">
                  @{account.acct}
                </div>
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

/* DisplayNameRow and Username moved to globals.css as .usercard-display-name and .usercard-username */

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

const StyledButton = styled(Button)`
  flex-shrink: 0;
`;

const Bio = styled.div`
  font-size: inherit;
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
