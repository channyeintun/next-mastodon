/**
 * Wrapstodon Archetype Component
 * Displays user's archetype with reveal animation
 */

'use client'

import { useState, useCallback } from 'react'
import type { AnnualReport, Account, Archetype as ArchetypeType } from '@/types/mastodon'
import { Avatar } from '@/components/atoms/Avatar'
import { Button } from '@/components/atoms/Button'
import { ShareButton } from './ShareButton'
import './wrapstodon.css'

// Archetype illustration images
const archetypeImages: Record<ArchetypeType, string> = {
    lurker: '/images/archetypes/lurker.png',
    booster: '/images/archetypes/booster.png',
    pollster: '/images/archetypes/pollster.png',
    replier: '/images/archetypes/replier.png',
    oracle: '/images/archetypes/oracle.png',
}

// Space elements overlay (ring decoration)
const spaceElementsImage = '/images/archetypes/space_elements.png'

const archetypeNames: Record<ArchetypeType, string> = {
    lurker: 'The Stoic',
    booster: 'The Archer',
    pollster: 'The Wonderer',
    replier: 'The Butterfly',
    oracle: 'The Oracle',
}

const archetypeDescriptions: Record<ArchetypeType, { self: string; public: string }> = {
    lurker: {
        self: 'We know you were out there, somewhere, enjoying Mastodon in your own quiet way.',
        public: 'Was out there, somewhere, enjoying Mastodon in their own quiet way.',
    },
    booster: {
        self: 'You stayed on the hunt for posts to boost, amplifying other creators with perfect aim.',
        public: 'Stayed on the hunt for posts to boost, amplifying other creators with perfect aim.',
    },
    pollster: {
        self: 'You created more polls than other post types, cultivating curiosity on Mastodon.',
        public: 'Created more polls than other post types, cultivating curiosity on Mastodon.',
    },
    replier: {
        self: "You frequently replied to other people's posts, pollinating Mastodon with new discussions.",
        public: "Frequently replied to other people's posts, pollinating Mastodon with new discussions.",
    },
    oracle: {
        self: 'You created new posts more than replies, keeping Mastodon fresh and future-facing.',
        public: 'Created new posts more than replies, keeping Mastodon fresh and future-facing.',
    },
}

interface ArchetypeProps {
    report: AnnualReport
    account?: Account
    context: 'modal' | 'standalone'
    onClose?: () => void
}

export function Archetype({ report, account, context, onClose }: ArchetypeProps) {
    const [isRevealed, setIsRevealed] = useState(context === 'standalone')
    const isSelfView = context === 'modal'

    const reveal = useCallback(() => {
        setIsRevealed(true)
        // In a real implementation, we'd persist this to localStorage
    }, [])

    const archetype = report.data.archetype
    const name = account?.display_name || account?.username || 'User'
    const description = isSelfView
        ? archetypeDescriptions[archetype].self
        : `${name} ${archetypeDescriptions[archetype].public}`

    return (
        <div className="wrapstodon-box wrapstodon-archetype" tabIndex={0}>
            {/* Artboard with avatar and illustration */}
            <div className="wrapstodon-archetype-artboard">
                {account && (
                    <Avatar
                        src={account.avatar}
                        alt={account.display_name || account.username}
                        size="large"
                        style={{ position: 'absolute', top: 7, left: 4, zIndex: 1 }}
                    />
                )}
                <div className="wrapstodon-archetype-illustration-wrapper">
                    <img
                        src={archetypeImages[archetype]}
                        alt=""
                        className={`wrapstodon-archetype-illustration ${isRevealed ? '' : 'blurred'}`}
                    />
                </div>
                <img
                    src={spaceElementsImage}
                    alt=""
                    className="wrapstodon-archetype-planet-ring"
                />
            </div>

            {/* Content */}
            <div className="wrapstodon-content wrapstodon-comfortable">
                <h2 className="wrapstodon-section-title">
                    {isSelfView ? 'Your archetype' : `${name}'s archetype`}
                </h2>
                <p className="wrapstodon-stat-large">
                    {isRevealed ? archetypeNames[archetype] : '???'}
                </p>
                <p className="wrapstodon-description">
                    {isRevealed
                        ? description
                        : `Thanks for being part of Mastodon! Time to find out which archetype you embodied in ${report.year}.`}
                </p>
            </div>

            {/* Reveal Button */}
            {!isRevealed && (
                <Button onClick={reveal} className="wrapstodon-reveal-button">
                    Reveal my archetype
                </Button>
            )}

            {/* Share Button */}
            {isRevealed && isSelfView && <ShareButton report={report} onClose={onClose} />}
        </div>
    )
}

export default Archetype
