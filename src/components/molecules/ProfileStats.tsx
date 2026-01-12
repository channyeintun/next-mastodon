'use client';

import styled from '@emotion/styled';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import type { Relationship } from '@/types';

interface ProfileStatsProps {
  acct: string;
  postsCount: number;
  followingCount: number;
  followersCount: number;
  relationship?: Relationship;
}

/**
 * Presentation component for profile posts/follower/following stats.
 */
export function ProfileStats({
  acct,
  postsCount,
  followingCount,
  followersCount,
  relationship,
}: ProfileStatsProps) {
  const t = useTranslations('profile');
  return (
    <Container>
      <StatItem>
        <Count>
          {postsCount.toLocaleString()}
        </Count>{' '}
        <Label>{t('posts')}</Label>
      </StatItem>
      <StatsLink href={`/@${acct}/following`}>
        <Count>
          {followingCount.toLocaleString()}
        </Count>{' '}
        <Label>{t('following')}</Label>
      </StatsLink>
      <StatsLink href={`/@${acct}/followers`}>
        <Count>
          {followersCount.toLocaleString()}
        </Count>{' '}
        <Label>{t('followers')}</Label>
      </StatsLink>
      {relationship && (relationship.followed_by || (relationship.following && relationship.followed_by)) && (
        <RelationshipLabel>
          &middot;{' '}
          {relationship.following && relationship.followed_by ? (
            t('mutual')
          ) : (
            t('follows_you')
          )}
        </RelationshipLabel>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  gap: var(--size-4);
  font-size: var(--font-size-1);
  margin-bottom: var(--size-4);
  flex-wrap: wrap;

  @media (max-width: 400px) {
    gap: var(--size-3);
  }
`;

const StatItem = styled.span`
  text-decoration: none;
`;

const StatsLink = styled(Link)`
  text-decoration: none;
`;

const Count = styled.strong`
  color: var(--text-1);
`;

const Label = styled.span`
  color: var(--text-2);

  @media (max-width: 320px) {
    display: none;
  }
`;

const RelationshipLabel = styled.span`
  color: var(--text-2);
  font-weight: var(--font-weight-4);
`;
