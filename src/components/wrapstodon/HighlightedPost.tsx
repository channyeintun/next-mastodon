/**
 * Wrapstodon Highlighted Post Component
 * Shows the user's most popular post of the year
 */

'use client'

import type { TopStatuses, Status } from '@/types/mastodon'
import { PostCard } from '@/components/organisms/PostCard'
import './wrapstodon.css'

interface HighlightedPostProps {
    data: TopStatuses
    status?: Status
    context: 'modal' | 'standalone'
}

export function HighlightedPost({ data, status, context }: HighlightedPostProps) {
    const { by_reblogs, by_favourites, by_replies: _by_replies } = data

    if (!status) {
        return null
    }

    let label: string
    if (by_reblogs) {
        const count = status.reblogs_count
        label = `This post was boosted ${count === 1 ? 'once' : `${count} times`}.`
    } else if (by_favourites) {
        const count = status.favourites_count
        label = `This post was favorited ${count === 1 ? 'once' : `${count} times`}.`
    } else {
        const count = status.replies_count
        label = `This post got ${count === 1 ? 'one reply' : `${count} replies`}.`
    }

    return (
        <div className="wrapstodon-box wrapstodon-most-boosted-post">
            <div className="wrapstodon-content">
                <h2 className="wrapstodon-section-title">Most popular post</h2>
                {context === 'modal' && <p>{label}</p>}
            </div>

            <div className="wrapstodon-post-embed">
                <PostCard status={status} hideActions hideOptions wrapstodon />
            </div>
        </div>
    )
}

export default HighlightedPost
