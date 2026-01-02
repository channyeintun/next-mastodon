/**
 * Wrapstodon Page
 * Year in Review feature showing annual statistics
 */

import Head from 'next/head';
import { useEffect, useMemo, useCallback, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAnnualReportState, useAnnualReport, useInstance } from '@/api/queries'
import { useGenerateAnnualReport } from '@/api/mutations'
import { useAuthStore } from '@/hooks/useStores'
import { Wrapstodon } from '@/components/wrapstodon'
import { Announcement } from '@/components/wrapstodon/Announcement'
import { Spinner } from '@/components/atoms/Spinner'
import { Gift, ArrowLeft } from 'lucide-react'

export default function WrapstodonPage() {
    const router = useRouter()
    const { isAuthenticated, openAuthModal } = useAuthStore()
    const [isDismissed, setIsDismissed] = useState(false)

    // Get the Wrapstodon year from instance data
    const { data: instance, isLoading: isLoadingInstance } = useInstance()
    const wrapstodonYear = instance?.wrapstodon

    // Check auth and redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            openAuthModal()
        }
    }, [isAuthenticated, openAuthModal])

    // Fetch state to determine what to show (only if we have a year)
    const {
        data: stateData,
        isLoading: isLoadingState,
        refetch: refetchState,
    } = useAnnualReportState(wrapstodonYear ?? 0, {
        enabled: isAuthenticated && !!wrapstodonYear,
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
        router.push('/')
    }, [router])

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
            <>
                <Head><title>Wrapstodon - Mastodon</title></Head>
                <div className="min-h-screen flex items-center justify-center">
                    <Spinner size="large" />
                </div>
            </>
        )
    }

    // Not authenticated
    if (!isAuthenticated) {
        return (
            <>
                <Head><title>Wrapstodon - Mastodon</title></Head>
                <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                    <Gift size={48} className="mb-4 text-accent" />
                    <h1 className="text-2xl font-bold mb-2">Sign in to see your Wrapstodon</h1>
                    <p className="text-secondary">
                        Wrapstodon shows your year in review on Mastodon
                    </p>
                </div>
            </>
        )
    }

    // No wrapstodon year available from server
    if (!wrapstodonYear) {
        return (
            <>
                <Head><title>Wrapstodon - Mastodon</title></Head>
                <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                    <Gift size={48} className="mb-4 text-secondary opacity-50" />
                    <h1 className="text-xl font-medium mb-2">Wrapstodon not available</h1>
                    <p className="text-secondary">
                        Wrapstodon is not available on this instance yet.
                    </p>
                </div>
            </>
        )
    }

    // Ineligible or dismissed
    if (state === 'ineligible' || isDismissed) {
        return (
            <>
                <Head><title>Wrapstodon - Mastodon</title></Head>
                <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                    <Gift size={48} className="mb-4 text-secondary opacity-50" />
                    <h1 className="text-xl font-medium mb-2">Wrapstodon not available</h1>
                    <p className="text-secondary">
                        {state === 'ineligible'
                            ? "Your Wrapstodon isn't available yet. Check back later!"
                            : "You've dismissed your Wrapstodon."}
                    </p>
                </div>
            </>
        )
    }

    // Eligible or Generating - Show announcement
    if (state === 'eligible' || state === 'generating') {
        return (
            <>
                <Head><title>Wrapstodon {wrapstodonYear} - Mastodon</title></Head>
                <div className="min-h-screen flex flex-col">
                    <header className="flex items-center gap-3 p-4 border-b border-primary">
                        <Link href="/" className="p-2 rounded-full hover:bg-secondary transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-lg font-semibold">Wrapstodon</h1>
                    </header>
                    <div className="flex-1 flex items-center justify-center p-6">
                        <Announcement
                            year={wrapstodonYear}
                            state={state}
                            onRequestBuild={handleGenerate}
                            onDismiss={handleDismiss}
                        />
                    </div>
                </div>
            </>
        )
    }

    // Available - Show report
    if (state === 'available' && report) {
        return (
            <>
                <Head><title>Wrapstodon {wrapstodonYear} - Mastodon</title></Head>
                <div className="min-h-screen bg-[#17063b] pb-safe">
                    <Wrapstodon
                        report={report}
                        account={account}
                        statuses={statuses}
                        context="standalone"
                    />
                </div>
            </>
        )
    }

    // Loading report
    if (isLoadingReport) {
        return (
            <>
                <Head><title>Wrapstodon - Mastodon</title></Head>
                <div className="min-h-screen flex items-center justify-center">
                    <Spinner size="large" />
                </div>
            </>
        )
    }

    // Fallback
    return (
        <>
            <Head><title>Wrapstodon - Mastodon</title></Head>
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <Gift size={48} className="mb-4 text-secondary opacity-50" />
                <h1 className="text-xl font-medium mb-2">Something went wrong</h1>
                <p className="text-secondary">
                    We couldn&apos;t load your Wrapstodon. Please try again later.
                </p>
            </div>
        </>
    )
}
