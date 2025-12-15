/**
 * Wrapstodon (Year in Review) Component
 * Main display component for annual report statistics
 */

'use client'

import { useMemo } from 'react'
import type { AnnualReport, Account, Status } from '@/types/mastodon'
import { Archetype } from './Archetype'
import { HighlightedPost } from './HighlightedPost'
import { Followers } from './StatsComponents'
import { NewPosts } from './StatsComponents'
import { MostUsedHashtag } from './StatsComponents'
import { ShareButton } from './ShareButton'
import { X } from 'lucide-react'
import './wrapstodon.css'

interface WrapstodonProps {
    report: AnnualReport
    account?: Account
    statuses?: Status[]
    onClose?: () => void
    context?: 'modal' | 'standalone'
}

export function Wrapstodon({
    report,
    account,
    statuses = [],
    onClose,
    context = 'standalone',
}: WrapstodonProps) {
    // Calculate stats from time series
    const stats = useMemo(() => {
        const newPostCount = report.data.time_series.reduce(
            (sum, item) => sum + item.statuses,
            0
        )
        const newFollowerCount = report.data.time_series.reduce(
            (sum, item) => sum + item.followers,
            0
        )
        return { newPostCount, newFollowerCount }
    }, [report.data.time_series])

    const topHashtag = report.data.top_hashtags[0]

    // Find the highlighted status
    const highlightedStatus = useMemo(() => {
        const { by_reblogs, by_favourites, by_replies } = report.data.top_statuses
        const statusId = by_reblogs || by_favourites || by_replies
        return statusId ? statuses.find((s) => s.id === statusId) : undefined
    }, [report.data.top_statuses, statuses])

    return (
        <div className="wrapstodon-wrapper theme-dark">
            {/* Header */}
            <div className="wrapstodon-header">
                <h1 className="wrapstodon-title">Wrapstodon {report.year}</h1>
                {account && <p className="wrapstodon-account">@{account.acct}</p>}
                {context === 'modal' && onClose && (
                    <button
                        className="wrapstodon-close-button"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Content Stack */}
            <div className="wrapstodon-stack">
                {/* Highlighted Post */}
                <HighlightedPost
                    data={report.data.top_statuses}
                    status={highlightedStatus}
                    context={context}
                />

                {/* Stats Grid */}
                <div
                    className={`wrapstodon-stats-grid ${!topHashtag ? 'no-hashtag' : ''
                        } ${!stats.newFollowerCount && !stats.newPostCount ? 'only-hashtag' : ''
                        } ${(!!stats.newFollowerCount) !== (!!stats.newPostCount) ? 'single-number' : ''}`}
                >
                    {!!stats.newFollowerCount && <Followers count={stats.newFollowerCount} />}
                    {!!stats.newPostCount && <NewPosts count={stats.newPostCount} />}
                    {topHashtag && (
                        <MostUsedHashtag
                            hashtag={topHashtag}
                            name={account?.display_name}
                            context={context}
                        />
                    )}
                </div>

                {/* Archetype */}
                <Archetype
                    report={report}
                    account={account}
                    context={context}
                    onClose={onClose}
                />
            </div>

            {/* Share Button (shown at bottom in standalone mode) */}
            {context === 'standalone' && <ShareButton report={report} />}
        </div>
    )
}

export default Wrapstodon
