'use client';

import styled from '@emotion/styled';
import { Repeat2 } from 'lucide-react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { EmojiText } from '@/components/atoms';
import { prefillAccountCache } from '@/api';
import type { Account } from '@/types';

interface ReblogIndicatorProps {
    account: Account;
}

/**
 * Presentation component that displays a reblog/boost indicator
 * showing who boosted the post.
 */
export function ReblogIndicator({ account }: ReblogIndicatorProps) {
    const queryClient = useQueryClient();

    // Pre-populate account cache before navigation
    const handleProfileClick = () => {
        prefillAccountCache(queryClient, account);
    };

    return (
        <Container>
            <Icon size={14} />
            <span>
                <ProfileLink href={`/@${account.acct}`} onClick={handleProfileClick}>
                    <EmojiText
                        text={account.display_name || account.username}
                        emojis={account.emojis}
                    />
                </ProfileLink> boosted
            </span>
        </Container>
    );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  margin-bottom: var(--size-2);
  font-size: var(--font-size-0);
  color: var(--text-2);
`;

const Icon = styled(Repeat2)`
  margin-left: var(--size-6);
`;

const ProfileLink = styled(Link)`
  font-weight: var(--font-weight-6);
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
