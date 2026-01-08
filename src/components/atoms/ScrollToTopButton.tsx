'use client';

import styled from '@emotion/styled';
import { ChevronUp } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const Button = styled.button<{ $visible: boolean }>`
    position: fixed;
    bottom: calc(var(--app-bottom-nav-height) + var(--size-4));
    left: 50%;
    transform: translateX(-50%) translateY(${props => props.$visible ? '0' : '100px'});
    opacity: ${props => props.$visible ? 1 : 0};
    visibility: ${props => props.$visible ? 'visible' : 'hidden'};
    transition: transform 0.3s ease, opacity 0.3s ease;
    background: var(--blue-6);
    color: white;
    border: none;
    border-radius: var(--radius-round);
    padding: var(--size-3) var(--size-4);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--size-2);
    box-shadow: var(--shadow-4);
    z-index: 999;
    font-size: var(--font-size-0);
    font-weight: 500;
    pointer-events: ${props => props.$visible ? 'auto' : 'none'};
    &:hover {
        background: var(--blue-7);
    }

    /* On desktop, center within the content area (accounting for sidebar) */
    @media (min-width: 768px) {
        bottom: var(--size-6);
        /* Center of content area = sidebar + half of remaining space */
        left: calc(var(--app-sidebar-width) + (100vw - var(--app-sidebar-width)) / 2);
    }
`;

interface ScrollToTopButtonProps {
    visible: boolean;
    onClick: () => void;
}

export function ScrollToTopButton({ visible, onClick }: ScrollToTopButtonProps) {
    const [mounted, setMounted] = useState(false);
    const t = useTranslations('common');

    useEffect(() => {
        setMounted(true);
    }, []);

    const button = (
        <Button
            $visible={visible}
            onClick={onClick}
            aria-label={t('backToTop')}
        >
            <ChevronUp size={16} />
            {t('backToTop')}
        </Button>
    );

    // Use portal to render at document.body level, avoiding container clipping
    if (!mounted) return null;
    return createPortal(button, document.body);
}
