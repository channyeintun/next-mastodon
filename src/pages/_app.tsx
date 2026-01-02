import App, { type AppContext, type AppProps } from 'next/app';
import { useState } from 'react';
import { QueryClient, QueryClientProvider, HydrationBoundary, MutationCache, type DehydratedState } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster, toast } from 'sonner';
import { AxiosError } from 'axios';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { getRootStore, type RootStoreInitialState } from '@/stores/rootStore';
import { parseCookies } from '@/utils/cookies';
import { StoreContext } from '@/hooks/useStores';
import { VideoSyncProvider } from '@/components/providers/VideoSyncProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { GlobalModalProvider } from '@/contexts/GlobalModalContext';
import SkipToMain from '@/components/atoms/SkipToMain';
import '@/app-backup/globals.css';
import '@/components/wrapstodon/wrapstodon.css';

// Create Emotion cache for SSR
const emotionCache = createCache({ key: 'css', prepend: true });

// Extract error message from the error object
function getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        const apiError = error.response?.data?.error;
        if (typeof apiError === 'string') return apiError;
        return error.response?.statusText || error.message || 'An error occurred';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
}

// Initial state passed from getInitialProps
interface PageProps {
    dehydratedState?: DehydratedState;
    initialStoreState?: RootStoreInitialState;
}

function MyApp({ Component, pageProps }: AppProps<PageProps>) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                    },
                },
                mutationCache: new MutationCache({
                    onError: (error) => {
                        toast.error(getErrorMessage(error));
                    },
                }),
            })
    );

    // Initialize store with server-side state
    const [rootStore] = useState(() => getRootStore(pageProps.initialStoreState));

    return (
        <CacheProvider value={emotionCache}>
            <QueryClientProvider client={queryClient}>
                <HydrationBoundary state={pageProps.dehydratedState}>
                    <StoreContext.Provider value={rootStore}>
                        <ThemeProvider />
                        <SkipToMain />
                        <VideoSyncProvider>
                            <GlobalModalProvider>
                                <Component {...pageProps} />
                            </GlobalModalProvider>
                        </VideoSyncProvider>
                    </StoreContext.Provider>
                    <Toaster
                        position="bottom-left"
                        toastOptions={{
                            duration: 4000,
                            className: 'sonner-toast',
                        }}
                    />
                    <ReactQueryDevtools initialIsOpen={false} />
                </HydrationBoundary>
            </QueryClientProvider>
        </CacheProvider>
    );
}

// Read cookies server-side for auth hydration
MyApp.getInitialProps = async (appContext: AppContext) => {
    const appProps = await App.getInitialProps(appContext);

    // Read cookies from request headers (server-side only)
    const cookieHeader = appContext.ctx.req?.headers.cookie || '';
    const cookies = parseCookies(cookieHeader);

    const initialStoreState: RootStoreInitialState = {
        auth: {
            instanceURL: cookies.instanceURL || null,
            accessToken: cookies.accessToken || null,
            clientId: cookies.clientId || null,
            clientSecret: cookies.clientSecret || null,
        },
        annualReportState: cookies.annualReportState as 'available' | 'generating' | 'eligible' | 'ineligible' | undefined,
        wrapstodonYear: cookies.wrapstodonYear ? parseInt(cookies.wrapstodonYear, 10) : undefined,
    };

    return {
        ...appProps,
        pageProps: {
            ...appProps.pageProps,
            initialStoreState,
        },
    };
};

export default MyApp;

