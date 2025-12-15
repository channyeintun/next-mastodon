/**
 * Wrapstodon Share Button Component
 * Provides sharing functionality via Mastodon or native share
 */

'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { AnnualReport, Archetype } from '@/types/mastodon'
import { Button } from '@/components/atoms/Button'
import { Share2, Send } from 'lucide-react'
import './wrapstodon.css'

const archetypeNames: Record<Archetype, string> = {
    lurker: 'The Stoic',
    booster: 'The Archer',
    pollster: 'The Wonderer',
    replier: 'The Butterfly',
    oracle: 'The Oracle',
}

interface ShareButtonProps {
    report: AnnualReport
    onClose?: () => void
}

export function ShareButton({ report, onClose }: ShareButtonProps) {
    const router = useRouter()

    const handleShareOnMastodon = useCallback(() => {
        const archetypeName = archetypeNames[report.data.archetype]
        const shareLines = [
            `I got the ${archetypeName} archetype!`,
        ]

        // Add share URL if available
        if (report.share_url) {
            shareLines.push(report.share_url)
        }

        shareLines.push(`#Wrapstodon${report.year}`)

        // Navigate to compose with pre-filled text
        const text = encodeURIComponent(shareLines.join('\n\n'))

        // Close modal if provided
        onClose?.()

        router.push(`/compose?text=${text}`)
    }, [report, router, onClose])

    const supportsNativeShare = typeof navigator !== 'undefined' && 'share' in navigator

    const handleSecondaryShare = useCallback(async () => {
        if (report.share_url) {
            if (supportsNativeShare) {
                try {
                    await navigator.share({
                        url: report.share_url,
                    })
                } catch {
                    // User cancelled share
                }
            } else {
                await navigator.clipboard.writeText(report.share_url)
                toast.success('Copied to clipboard')
            }
        }
    }, [report.share_url, supportsNativeShare])

    return (
        <div className="wrapstodon-share-wrapper">
            <Button onClick={handleShareOnMastodon} className="wrapstodon-share-button">
                <Send size={18} />
                Share on Mastodon
            </Button>

            {report.share_url && (
                <Button
                    variant="ghost"
                    onClick={handleSecondaryShare}
                    className="wrapstodon-secondary-share-button"
                >
                    <Share2 size={18} />
                    {supportsNativeShare ? 'Share elsewhere' : 'Copy link'}
                </Button>
            )}
        </div>
    )
}

export default ShareButton
