'use client';

import styled from '@emotion/styled';
import Link from 'next/link';
import { Heart, Repeat2, MessageSquareQuote } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StatusStatsProps {
    statusId: string;
    favouritesCount: number;
    reblogsCount: number;
    quotesCount?: number;
}

/**
 * Clickable statistics for a status (favourites, boosts, quotes).
 * Links to detail pages showing who interacted with the post.
 * Separated from action buttons for distinct clickability like in Mastodon.
 */
export function StatusStats({
    statusId,
    favouritesCount,
    reblogsCount,
    quotesCount = 0,
}: StatusStatsProps) {
    const t = useTranslations('statusDetail');
    const hasStats = favouritesCount > 0 || reblogsCount > 0 || quotesCount > 0;

    if (!hasStats) {
        return null;
    }

    return (
        <Container>
            {reblogsCount > 0 && (
                <StatLink href={`/status/${statusId}/reblogged_by`}>
                    <StatIcon>
                        <Repeat2 size={16} />
                    </StatIcon>
                    <StatCount>{reblogsCount}</StatCount>
                    <StatLabel>{t('stats.boosts', { count: reblogsCount })}</StatLabel>
                </StatLink>
            )}

            {quotesCount > 0 && (
                <StatLink href={`/status/${statusId}/quotes`}>
                    <StatIcon>
                        <MessageSquareQuote size={16} />
                    </StatIcon>
                    <StatCount>{quotesCount}</StatCount>
                    <StatLabel>{t('stats.quotes', { count: quotesCount })}</StatLabel>
                </StatLink>
            )}

            {favouritesCount > 0 && (
                <StatLink href={`/status/${statusId}/favourited_by`}>
                    <StatIcon>
                        <Heart size={16} />
                    </StatIcon>
                    <StatCount>{favouritesCount}</StatCount>
                    <StatLabel>{t('stats.favourites', { count: favouritesCount })}</StatLabel>
                </StatLink>
            )}
        </Container>
    );
}

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-3);
  padding: var(--size-3) 0;
  border-top: 1px solid var(--surface-3);
  border-bottom: 1px solid var(--surface-3);
  margin: var(--size-3) 0;
`;

const StatLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: var(--size-1);
  color: var(--text-2);
  text-decoration: none;
  padding: var(--size-1) var(--size-2);
  border-radius: var(--radius-2);
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: var(--surface-2);
    color: var(--text-1);
  }
`;

const StatIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-3);
`;

const StatCount = styled.span`
  font-size: var(--font-size-1);
  font-weight: var(--font-weight-6);
  color: var(--text-1);
`;

const StatLabel = styled.span`
  font-size: var(--font-size-0);
  color: var(--text-2);
`;
