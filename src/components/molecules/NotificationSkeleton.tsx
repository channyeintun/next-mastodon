'use client';

/**
 * Skeleton loading placeholder for NotificationCard
 */
export function NotificationSkeleton() {
    return (
        <div
            style={{
                padding: 'var(--size-3)',
                background: 'var(--surface-2)',
                borderRadius: 'var(--radius-3)',
                display: 'flex',
                gap: 'var(--size-3)',
            }}
        >
            {/* Icon placeholder */}
            <div
                className="skeleton"
                style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    flexShrink: 0,
                }}
            />

            {/* Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
                {/* Avatar and name row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--size-2)' }}>
                    <div
                        className="skeleton"
                        style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            flexShrink: 0,
                        }}
                    />
                    <div
                        className="skeleton"
                        style={{
                            height: '14px',
                            width: '120px',
                            borderRadius: 'var(--radius-1)',
                        }}
                    />
                    <div
                        className="skeleton"
                        style={{
                            height: '12px',
                            width: '40px',
                            borderRadius: 'var(--radius-1)',
                            marginLeft: 'auto',
                        }}
                    />
                </div>

                {/* Content preview placeholder */}
                <div
                    className="skeleton"
                    style={{
                        height: '40px',
                        width: '100%',
                        borderRadius: 'var(--radius-2)',
                    }}
                />
            </div>
        </div>
    );
}

/**
 * Multiple skeleton items for loading state
 */
export function NotificationSkeletonList({ count = 5 }: { count?: number }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--size-2)' }}>
            {Array.from({ length: count }).map((_, i) => (
                <NotificationSkeleton key={i} />
            ))}
        </div>
    );
}
