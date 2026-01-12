'use client';

import styled from '@emotion/styled';
import { Reply } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Status } from '@/types';

interface StatusThreadLabelProps {
    status: Status;
}

/**
 * Component that displays a thread label (Continued thread, Replied to, etc.)
 * similar to Mastodon's web UI.
 */
export function StatusThreadLabel({ status }: StatusThreadLabelProps) {
    const t = useTranslations('status');

    const { account, in_reply_to_account_id, mentions } = status;

    if (!in_reply_to_account_id) {
        return null;
    }

    let label;

    if (account.id === in_reply_to_account_id) {
        label = t('continued_thread');
    } else {
        // Look for the account in mentions to get the username/acct
        const replyMention = mentions.find((m) => m.id === in_reply_to_account_id);

        if (replyMention) {
            label = t.rich('replied_to', {
                name: replyMention.username,
                link: (chunk) => (
                    <ProfileLink href={`/@${replyMention.acct}`}>
                        {chunk}
                    </ProfileLink>
                ),
            });
        } else {
            label = t('replied_in_thread');
        }
    }

    return (
        <Container>
            <IconWrapper>
                <Reply size={14} />
            </IconWrapper>
            <LabelText>{label}</LabelText>
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

const IconWrapper = styled.div`
  margin-left: var(--size-6);
  display: flex;
  align-items: center;
  color: var(--text-3);
`;

const LabelText = styled.span`
  line-height: 1;
`;

const ProfileLink = styled(Link)`
  font-weight: var(--font-weight-6);
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
