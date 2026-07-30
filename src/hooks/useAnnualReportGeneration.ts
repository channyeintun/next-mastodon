'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useGenerateAnnualReport } from '@/api/mutations'

const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 30_000

/**
 * Kick off Wrapstodon (annual report) generation and poll for the state to flip
 * from `generating` to `available`.
 *
 * The polling lives here so both entry points (the standalone page and the
 * modal) share one implementation with real cleanup: the interval previously
 * kept refetching for its full 30 s even after the component unmounted.
 */
export function useAnnualReportGeneration(
    year: number | undefined,
    refetchState: () => void,
) {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const generateMutation = useGenerateAnnualReport()

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }, [])

    // Stop polling when the component using this hook goes away.
    useEffect(() => stopPolling, [stopPolling])

    const generate = useCallback(() => {
        if (!year) return

        generateMutation.mutate(year, {
            onSuccess: () => {
                stopPolling()
                intervalRef.current = setInterval(refetchState, POLL_INTERVAL_MS)
                timeoutRef.current = setTimeout(stopPolling, POLL_TIMEOUT_MS)
            },
        })
    }, [generateMutation, refetchState, stopPolling, year])

    return { generate, isGenerating: generateMutation.isPending }
}
