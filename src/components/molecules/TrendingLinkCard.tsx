'use client'

import { ExternalLink, Newspaper } from 'lucide-react'
import type { TrendingLink } from '@/types/mastodon'

interface TrendingLinkCardProps {
    link: TrendingLink
    style?: React.CSSProperties
}

export function TrendingLinkCard({ link, style }: TrendingLinkCardProps) {
    // Calculate usage stats from history
    const todayShares = link.history?.[0] ? parseInt(link.history[0].uses, 10) : 0
    const weeklyShares = link.history?.reduce((sum, day) => sum + parseInt(day.uses, 10), 0) ?? 0

    // Extract domain from URL
    const getDomain = (url: string) => {
        try {
            return new URL(url).hostname.replace('www.', '')
        } catch {
            return link.provider_name || ''
        }
    }

    return (
        <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="trending-link-card"
            style={style}
        >
            {link.image ? (
                <div className="trending-link-image">
                    <img src={link.image} alt="" />
                </div>
            ) : (
                <div className="trending-link-image trending-link-placeholder">
                    <Newspaper size={32} />
                </div>
            )}
            <div className="trending-link-content">
                <div className="trending-link-provider">
                    {link.provider_name || getDomain(link.url)}
                </div>
                <div className="trending-link-title">
                    {link.title}
                </div>
                {link.description && (
                    <div className="trending-link-description">
                        {link.description.slice(0, 120)}{link.description.length > 120 ? '...' : ''}
                    </div>
                )}
                <div className="trending-link-stats">
                    <span className="trending-link-stat">
                        {weeklyShares > 0 ? `${weeklyShares.toLocaleString()} shares` : `${todayShares.toLocaleString()} shares today`}
                    </span>
                    <ExternalLink size={12} />
                </div>
            </div>
        </a>
    )
}

export function TrendingLinkCardSkeleton({ style }: { style?: React.CSSProperties }) {
    return (
        <div className="trending-link-card skeleton" style={style}>
            <div className="trending-link-image skeleton-loading" />
            <div className="trending-link-content">
                <div className="skeleton-loading" style={{ width: '30%', height: '0.8em', borderRadius: 'var(--radius-1)' }} />
                <div className="skeleton-loading" style={{ width: '90%', height: '1.2em', borderRadius: 'var(--radius-1)', marginTop: 'var(--size-2)' }} />
                <div className="skeleton-loading" style={{ width: '60%', height: '0.9em', borderRadius: 'var(--radius-1)', marginTop: 'var(--size-2)' }} />
            </div>
        </div>
    )
}
