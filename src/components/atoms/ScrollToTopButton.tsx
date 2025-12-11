'use client';

import { ChevronUp } from 'lucide-react';

interface ScrollToTopButtonProps {
    visible: boolean;
    onClick: () => void;
}

export function ScrollToTopButton({ visible, onClick }: ScrollToTopButtonProps) {
    return (
        <button
            onClick={onClick}
            aria-label="Scroll to top"
            style={{
                position: 'sticky',
                bottom: 'var(--size-6)',
                left: '50%',
                transform: `translateX(-50%) translateY(${visible ? '0' : '100px'})`,
                opacity: visible ? 1 : 0,
                visibility: visible ? 'visible' : 'hidden',
                transition: 'transform 0.3s ease, opacity 0.3s ease',
                background: 'var(--blue-6)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-round)',
                padding: 'var(--size-3) var(--size-4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--size-2)',
                boxShadow: 'var(--shadow-4)',
                zIndex: 100,
                fontSize: 'var(--font-size-0)',
                fontWeight: 500,
                pointerEvents: visible ? 'auto' : 'none',
            }}
        >
            <ChevronUp size={16} />
            Back to top
        </button>
    );
}
