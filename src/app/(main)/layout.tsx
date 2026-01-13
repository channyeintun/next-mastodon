'use client';

import NavigationWrapper from '@/components/organisms/NavigationWrapper';
import { ScrollRestorationProvider } from '@/components/providers/ScrollRestorationProvider';
import { StreamingProvider } from '@/components/providers/StreamingProvider';
import { AuthModalBridge } from '@/components/molecules';

export default function MainLayout({
    children,
    compose,
}: {
    children: React.ReactNode;
    compose: React.ReactNode;
}) {
    return (
        <StreamingProvider>
            <ScrollRestorationProvider />
            <NavigationWrapper />
            <main id="main-content">
                {children}
            </main>
            {compose}
            <AuthModalBridge />
        </StreamingProvider>
    );
}

