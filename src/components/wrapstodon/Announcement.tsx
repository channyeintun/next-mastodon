/**
 * Wrapstodon Announcement Component
 * Shows when user is eligible to generate their annual report
 */

'use client'

import { Button } from '@/components/atoms/Button'
import type { AnnualReportState } from '@/types/mastodon'
import './wrapstodon.css'

interface AnnouncementProps {
    year: number
    state: Exclude<AnnualReportState, 'ineligible'>
    onRequestBuild: () => void
    onOpen?: () => void
    onDismiss: () => void
}

export function Announcement({
    year,
    state,
    onRequestBuild,
    onOpen,
    onDismiss,
}: AnnouncementProps) {
    return (
        <div className="wrapstodon-announcement theme-dark">
            <h2>Wrapstodon {year} has arrived</h2>
            <p>Discover more about your engagement on Mastodon over the past year.</p>

            {state === 'available' ? (
                <Button onClick={onOpen} className="wrapstodon-button">
                    View my Wrapstodon
                </Button>
            ) : (
                <Button
                    onClick={onRequestBuild}
                    disabled={state === 'generating'}
                    className="wrapstodon-button"
                >
                    {state === 'generating' ? 'Building...' : 'Build my Wrapstodon'}
                </Button>
            )}

            {state === 'eligible' && (
                <button
                    onClick={onDismiss}
                    className="wrapstodon-dismiss-button"
                >
                    No thanks
                </button>
            )}
        </div>
    )
}

export default Announcement
