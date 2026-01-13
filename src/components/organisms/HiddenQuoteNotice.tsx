'use client';

import { useState } from 'react';
import type { Status } from '@/types';
import { PostCard } from './PostCard';
import {
    QuotedPostWrapper,
    NestedQuoteLink,
    HiddenQuoteContainer,
    HiddenQuoteText,
    ShowAnywayButton,
} from './postCardStyles';

const MAX_QUOTE_NESTING_LEVEL = 1;

interface HiddenQuoteNoticeProps {
    quoteState: string;
    quotedStatus: Status;
    depth: number;
}

export function HiddenQuoteNotice({
    quoteState,
    quotedStatus,
    depth
}: HiddenQuoteNoticeProps) {
    const [showAnyway, setShowAnyway] = useState(false);

    if (showAnyway) {
        return (
            <QuotedPostWrapper>
                {depth < MAX_QUOTE_NESTING_LEVEL ? (
                    <PostCard
                        status={quotedStatus}
                        hideActions
                        depth={depth + 1}
                        style={{ boxShadow: 'inset 0 4px 8px -4px rgba(0, 0, 0, 0.15)' }}
                    />
                ) : (
                    <NestedQuoteLink href={`/status/${quotedStatus.id}`}>
                        Quoted a post by @{quotedStatus.account.acct}
                    </NestedQuoteLink>
                )}
            </QuotedPostWrapper>
        );
    }

    const getMessage = () => {
        switch (quoteState) {
            case 'blocked_account': return 'Quoted post from a blocked account';
            case 'blocked_domain': return 'Quoted post from a blocked domain';
            case 'muted_account': return 'Quoted post from a muted account';
            default: return 'Quote hidden';
        }
    };

    return (
        <HiddenQuoteContainer>
            <HiddenQuoteText>{getMessage()}</HiddenQuoteText>
            <ShowAnywayButton onClick={() => setShowAnyway(true)}>
                Show anyway
            </ShowAnywayButton>
        </HiddenQuoteContainer>
    );
}
