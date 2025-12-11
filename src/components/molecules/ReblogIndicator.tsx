'use client';

import styled from '@emotion/styled';
import { Repeat2 } from 'lucide-react';
import { EmojiText } from '@/components/atoms';
import type { Account } from '@/types';

interface ReblogIndicatorProps {
    account: Account;
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

/**
 * Presentation component that displays a reblog/boost indicator
 * showing who boosted the post.
 */
export function ReblogIndicator({ account }: ReblogIndicatorProps) {
    return (
        <Container>
            <Icon size={14} />
            <span>
                <strong>
                    <EmojiText
                        text={account.display_name || account.username}
                        emojis={account.emojis}
                    />
                </strong> boosted
            </span>
        </Container>
    );
}
