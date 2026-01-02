'use client';

import { type ReactNode } from 'react';
import NavigationWrapper from '@/components/organisms/NavigationWrapper';
import { ScrollRestorationProvider } from '@/components/providers/ScrollRestorationProvider';
import { StreamingProvider } from '@/components/providers/StreamingProvider';
import { GlobalModalProvider } from '@/contexts/GlobalModalContext';
import { AuthModalBridge } from '@/components/molecules';

interface MainLayoutProps {
    children: ReactNode;
}

/**
 * Shared layout component for Pages Router pages
 * Provides navigation, streaming, modals, and scroll restoration
 */
export function MainLayout({ children }: MainLayoutProps) {
    return (
        <StreamingProvider>
            <GlobalModalProvider>
                <ScrollRestorationProvider />
                <NavigationWrapper />
                <main id="main-content">
                    {children}
                </main>
                <AuthModalBridge />
            </GlobalModalProvider>
        </StreamingProvider>
    );
}
