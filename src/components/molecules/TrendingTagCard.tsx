'use client'

import Link from 'next/link'
import { Hash, TrendingUp } from 'lucide-react'
import type { Tag } from '@/types/mastodon'

interface TrendingTagCardProps {
    tag: Tag
    style?: React.CSSProperties
}

export function TrendingTagCard({ tag, style }: TrendingTagCardProps) {
    // Calculate usage stats from history
    const todayUses = tag.history?.[0] ? parseInt(tag.history[0].uses, 10) : 0
    const todayAccounts = tag.history?.[0] ? parseInt(tag.history[0].accounts, 10) : 0

    // Calculate weekly stats
    const weeklyUses = tag.history?.reduce((sum, day) => sum + parseInt(day.uses, 10), 0) ?? 0

    return (
        <Link
            href={`/tags/${encodeURIComponent(tag.name)}`}
            className="trending-tag-card"
            style={style}
        >
            <div className="trending-tag-icon">
                <Hash size={20} />
            </div>
            <div className="trending-tag-content">
                <div className="trending-tag-name">
                    #{tag.name}
                </div>
                <div className="trending-tag-stats">
                    {todayAccounts > 0 && (
                        <span className="trending-tag-stat">
                            {todayAccounts.toLocaleString()} {todayAccounts === 1 ? 'person' : 'people'} today
                        </span>
                    )}
                    {weeklyUses > 0 && (
                        <span className="trending-tag-stat">
                            <TrendingUp size={12} />
                            {weeklyUses.toLocaleString()} posts this week
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}

export function TrendingTagCardSkeleton({ style }: { style?: React.CSSProperties }) {
    return (
        <div className="trending-tag-card skeleton" style={style}>
            <div className="trending-tag-icon skeleton-loading" style={{ width: 40, height: 40 }} />
            <div className="trending-tag-content">
                <div className="skeleton-loading" style={{ width: '60%', height: '1.2em', borderRadius: 'var(--radius-1)' }} />
                <div className="skeleton-loading" style={{ width: '40%', height: '0.9em', borderRadius: 'var(--radius-1)', marginTop: 'var(--size-2)' }} />
            </div>
        </div>
    )
}
