'use client';

import { Card } from '../atoms/Card';

interface ScheduledCardSkeletonProps {
    style?: React.CSSProperties;
}

/**
 * Skeleton loading placeholder for ScheduledStatus cards
 */
export function ScheduledCardSkeleton({ style }: ScheduledCardSkeletonProps) {
    return (
        <Card padding="medium" style={style}>
            {/* Scheduled date header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--size-2)',
                marginBottom: 'var(--size-3)',
                paddingBottom: 'var(--size-2)',
                borderBottom: '1px solid var(--surface-3)'
            }}>
                {/* Clock icon placeholder */}
                <div
                    style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: 'var(--surface-3)',
                        flexShrink: 0,
                        animation: 'var(--animation-blink)',
                    }}
                />
                {/* Date text placeholder */}
                <div
                    style={{
                        width: '60%',
                        height: '16px',
                        background: 'var(--surface-3)',
                        borderRadius: 'var(--radius-1)',
                        animation: 'var(--animation-blink)',
                    }}
                />
            </div>

            {/* Content area */}
            <div style={{ marginBottom: 'var(--size-3)' }}>
                <div
                    style={{
                        width: '80%',
                        height: '16px',
                        background: 'var(--surface-3)',
                        borderRadius: 'var(--radius-1)',
                        animation: 'var(--animation-blink)',
                    }}
                />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 'var(--size-2)', justifyContent: 'flex-end' }}>
                <div
                    style={{
                        width: '70px',
                        height: '32px',
                        background: 'var(--surface-3)',
                        borderRadius: 'var(--radius-2)',
                        animation: 'var(--animation-blink)',
                    }}
                />
                <div
                    style={{
                        width: '80px',
                        height: '32px',
                        background: 'var(--surface-3)',
                        borderRadius: 'var(--radius-2)',
                        animation: 'var(--animation-blink)',
                    }}
                />
            </div>
        </Card>
    );
}

/**
 * Multiple skeleton cards for initial loading
 */
export function ScheduledCardSkeletonList({ count = 5 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <ScheduledCardSkeleton key={i} style={{ marginBottom: 'var(--size-3)' }} />
            ))}
        </>
    );
}
