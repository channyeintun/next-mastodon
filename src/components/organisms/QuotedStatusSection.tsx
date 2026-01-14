'use client';

import type { Status } from '@/types';
import { PostCard } from './PostCard';
import { HiddenQuoteNotice } from './HiddenQuoteNotice';
import {
    QuotedPostWrapper,
    NestedQuoteLink,
    QuoteUnavailable,
} from './postCardStyles';

const MAX_QUOTE_NESTING_LEVEL = 1;

interface QuotedStatusSectionProps {
    displayStatus: Status;
    depth: number;
    t: any;
    showCWContent: boolean;
    hasContentWarning: boolean;
}

/**
 * Sub-component for rendering the quoted status section
 */
export function QuotedStatusSection({
    displayStatus,
    depth,
    t,
    showCWContent,
    hasContentWarning,
}: QuotedStatusSectionProps) {
    if (hasContentWarning && !showCWContent) return null;
    if (!displayStatus.quote || !displayStatus.quote.quoted_status) return null;

    const quoteState = displayStatus.quote.state;

    // Show quote normally for accepted state
    if (quoteState === 'accepted') {
        return (
            <QuotedPostWrapper>
                {depth < MAX_QUOTE_NESTING_LEVEL ? (
                    <PostCard
                        status={displayStatus.quote.quoted_status}
                        hideActions
                        depth={depth + 1}
                        style={{ boxShadow: 'inset 0 4px 8px -4px rgba(0, 0, 0, 0.15)' }}
                    />
                ) : (
                    <NestedQuoteLink href={`/status/${displayStatus.quote.quoted_status.id}`}>
                        {t('quotedBy', { acct: displayStatus.quote.quoted_status.account.acct })}
                    </NestedQuoteLink>
                )}
            </QuotedPostWrapper>
        );
    }

    // Show hidden quote notice for blocked/muted/unauthorized states
    if (['blocked_account', 'blocked_domain', 'muted_account'].includes(quoteState)) {
        return (
            <HiddenQuoteNotice quoteState={quoteState} quotedStatus={displayStatus.quote.quoted_status} depth={depth} />
        );
    }

    // Show unavailable message for deleted/unauthorized
    if (quoteState === 'deleted' || quoteState === 'unauthorized') {
        return (
            <QuoteUnavailable>
                {quoteState === 'deleted' ? 'Quoted post was deleted' : 'Quote not available'}
            </QuoteUnavailable>
        );
    }

    return null;
}
