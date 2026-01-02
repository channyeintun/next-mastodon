/**
 * Wrapstodon Stats Components
 * Small stat display components for the stats grid
 */

'use client'

import type { NameAndCount } from '@/types/mastodon'
// wrapstodon.css is imported in _app.tsx for Pages Router

interface FollowersProps {
    count: number
}

export function Followers({ count }: FollowersProps) {
    return (
        <div className="wrapstodon-box wrapstodon-followers wrapstodon-content">
            <div className="wrapstodon-stat-large">
                {count.toLocaleString()}
            </div>
            <div className="wrapstodon-section-title">
                {count === 1 ? 'new follower' : 'new followers'}
            </div>
        </div>
    )
}

interface NewPostsProps {
    count: number
}

export function NewPosts({ count }: NewPostsProps) {
    return (
        <div className="wrapstodon-box wrapstodon-new-posts wrapstodon-content">
            <div className="wrapstodon-stat-large">
                {count.toLocaleString()}
            </div>
            <div className="wrapstodon-section-title">
                {count === 1 ? 'new post' : 'new posts'}
            </div>
        </div>
    )
}

interface MostUsedHashtagProps {
    hashtag: NameAndCount
    name?: string
    context: 'modal' | 'standalone'
}

export function MostUsedHashtag({ hashtag, name, context }: MostUsedHashtagProps) {
    const description =
        context === 'modal'
            ? `You included this hashtag in ${hashtag.count === 1 ? 'one post' : `${hashtag.count} posts`
            }.`
            : name
                ? `${name} included this hashtag in ${hashtag.count === 1 ? 'one post' : `${hashtag.count} posts`
                }.`
                : null

    return (
        <div className="wrapstodon-box wrapstodon-most-used-hashtag wrapstodon-content">
            <div className="wrapstodon-section-title">Most used hashtag</div>
            <div className="wrapstodon-stat-extra-large">#{hashtag.name}</div>
            {description && <p>{description}</p>}
        </div>
    )
}
