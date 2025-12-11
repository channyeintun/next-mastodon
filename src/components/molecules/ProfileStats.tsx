'use client';

import styled from '@emotion/styled';
import Link from 'next/link';

interface ProfileStatsProps {
    acct: string;
    followingCount: number;
    followersCount: number;
}

const Container = styled.div`
  display: flex;
  gap: var(--size-4);
  font-size: var(--font-size-1);
  margin-bottom: var(--size-4);
`;

const StatsLink = styled(Link)`
  text-decoration: none;
`;

const Count = styled.strong`
  color: var(--text-1);
`;

const Label = styled.span`
  color: var(--text-2);
`;

/**
 * Presentation component for profile follower/following stats.
 */
export function ProfileStats({
    acct,
    followingCount,
    followersCount,
}: ProfileStatsProps) {
    return (
        <Container>
            <StatsLink href={`/@${acct}/following`}>
                <Count>
                    {followingCount.toLocaleString()}
                </Count>{' '}
                <Label>Following</Label>
            </StatsLink>
            <StatsLink href={`/@${acct}/followers`}>
                <Count>
                    {followersCount.toLocaleString()}
                </Count>{' '}
                <Label>Followers</Label>
            </StatsLink>
        </Container>
    );
}
