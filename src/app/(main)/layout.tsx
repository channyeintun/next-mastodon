import { headers, cookies } from 'next/headers';
import { isMobileDevice } from '@/utils/device';
import { ScrollRestorationProvider } from '@/components/providers/ScrollRestorationProvider';
import { StreamingProvider } from '@/components/providers/StreamingProvider';
import { AuthModalBridge } from '@/components/molecules/AuthModalBridge';

export default async function MainLayout({
    children,
    compose,
    sidebar,
    bottomnav
}: {
    children: React.ReactNode;
    compose: React.ReactNode;
    sidebar: React.ReactNode;
    bottomnav: React.ReactNode;
}) {
    const headerList = await headers();
    const userAgent = headerList.get('user-agent') || '';
    const isMobile = isMobileDevice(userAgent);

    // Check authentication for mobile bottom nav
    const cookieStore = await cookies();
    const isAuthenticated = !!cookieStore.get('accessToken')?.value;

    return (
        <StreamingProvider>
            <ScrollRestorationProvider />

            {!isMobile && sidebar}

            <main id="main-content">
                {children}
            </main>

            {isMobile && isAuthenticated && bottomnav}

            {compose}
            <AuthModalBridge />
        </StreamingProvider>
    );
}

