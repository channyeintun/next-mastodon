'use client';

import NavigationWrapper from '@/components/organisms/NavigationWrapper';
import { ScrollRestorationProvider } from '@/components/providers/ScrollRestorationProvider';
import { StreamingProvider } from '@/components/providers/StreamingProvider';
import { GlobalModalProvider } from '@/contexts/GlobalModalContext';
import { AuthModalBridge } from '@/components/molecules';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
