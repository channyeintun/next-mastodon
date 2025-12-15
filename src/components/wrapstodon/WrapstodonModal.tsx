/**
 * Wrapstodon Modal Component
 * Displays the year in review as a modal overlay
 */

'use client'

import { useMemo, useCallback, useState } from 'react'
import { useAnnualReportState, useAnnualReport, useInstance } from '@/api/queries'
import { useGenerateAnnualReport } from '@/api/mutations'
import { Wrapstodon } from '@/components/wrapstodon'
import { Announcement } from '@/components/wrapstodon/Announcement'
import { Spinner } from '@/components/atoms/Spinner'
import { GiRingedPlanet } from 'react-icons/gi'
import './wrapstodon.css'

interface WrapstodonModalProps {
    onClose: () => void
}

export function WrapstodonModal({ onClose }: WrapstodonModalProps) {
    const [isDismissed, setIsDismissed] = useState(false)

    // Get the Wrapstodon year from instance data
    const { data: instance, isLoading: isLoadingInstance } = useInstance()
    const wrapstodonYear = instance?.wrapstodon

    // Fetch state to determine what to show (only if we have a year)
    const {
        data: stateData,
        isLoading: isLoadingState,
        refetch: refetchState,
    } = useAnnualReportState(wrapstodonYear ?? 0, {
        enabled: !!wrapstodonYear,
    })

    const state = stateData?.state

    // Fetch report data if available
    const {
        data: reportData,
        isLoading: isLoadingReport,
    } = useAnnualReport(wrapstodonYear ?? 0, {
        enabled: state === 'available' && !!wrapstodonYear,
    })

    // Generate mutation
    const generateMutation = useGenerateAnnualReport()

    const handleGenerate = useCallback(() => {
        if (!wrapstodonYear) return
        generateMutation.mutate(wrapstodonYear, {
            onSuccess: () => {
                // Poll for state change
                const interval = setInterval(() => {
                    refetchState()
                }, 2000)

                // Stop polling after 30 seconds
                setTimeout(() => clearInterval(interval), 30000)
            },
        })
    }, [generateMutation, refetchState, wrapstodonYear])

    const handleDismiss = useCallback(() => {
        setIsDismissed(true)
        onClose()
    }, [onClose])

    // Parse report data
    const { report, account, statuses } = useMemo(() => {
        if (!reportData) return { report: undefined, account: undefined, statuses: [] }

        const report = reportData.annual_reports[0]
        const account = report
            ? reportData.accounts.find(a => a.id === report.account_id)
            : undefined

        return {
            report,
            account,
            statuses: reportData.statuses,
        }
    }, [reportData])

    // Loading state (instance or annual report state)
    if (isLoadingInstance || isLoadingState) {
        return (
            <div className="wrapstodon-modal-wrapper">
                <div className="wrapstodon-modal-loading">
                    <Spinner size="large" />
                </div>
            </div>
        )
    }



    // No wrapstodon year available from server
    if (!wrapstodonYear) {
        return (
            <div className="wrapstodon-modal-wrapper">
                <div className="wrapstodon-modal-message">
                    <GiRingedPlanet size={48} className="wrapstodon-modal-icon dimmed" />
                    <h2>Wrapstodon not available</h2>
                    <p>Wrapstodon is not available on this instance yet.</p>
                    <button className="wrapstodon-modal-button" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        )
    }

    // Ineligible or dismissed
    if (state === 'ineligible' || isDismissed) {
        return (
            <div className="wrapstodon-modal-wrapper">
                <div className="wrapstodon-modal-message">
                    <GiRingedPlanet size={48} className="wrapstodon-modal-icon dimmed" />
                    <h2>Wrapstodon not available</h2>
                    <p>
                        {state === 'ineligible'
                            ? "Your Wrapstodon isn't available yet. Check back later!"
                            : "You've dismissed your Wrapstodon."}
                    </p>
                    <button className="wrapstodon-modal-button" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        )
    }

    // Eligible or Generating - Show announcement
    if (state === 'eligible' || state === 'generating') {
        return (
            <div className="wrapstodon-modal-wrapper">
                <Announcement
                    year={wrapstodonYear}
                    state={state}
                    onRequestBuild={handleGenerate}
                    onDismiss={handleDismiss}
                />
            </div>
        )
    }

    // Available - Show report
    if (state === 'available' && report) {
        return (
            <div className="wrapstodon-modal-wrapper">
                <Wrapstodon
                    report={report}
                    account={account}
                    statuses={statuses}
                    onClose={onClose}
                    context="modal"
                />
            </div>
        )
    }

    // Loading report
    if (isLoadingReport) {
        return (
            <div className="wrapstodon-modal-wrapper">
                <div className="wrapstodon-modal-loading">
                    <Spinner size="large" />
                </div>
            </div>
        )
    }

    // Fallback
    return (
        <div className="wrapstodon-modal-wrapper">
            <div className="wrapstodon-modal-message">
                <GiRingedPlanet size={48} className="wrapstodon-modal-icon dimmed" />
                <h2>Something went wrong</h2>
                <p>We couldn&apos;t load your Wrapstodon. Please try again later.</p>
                <button className="wrapstodon-modal-button" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    )
}

export default WrapstodonModal
