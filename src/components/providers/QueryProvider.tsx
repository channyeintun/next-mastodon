'use client';

import { MutationCache, QueryClient, QueryClientProvider, HydrationBoundary, type DehydratedState } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { Toaster, toast } from 'sonner';
import { AxiosError } from 'axios';

// Extract error message from the error object
function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    // Mastodon API errors often come in { error: string } format
    const apiError = error.response?.data?.error;
    if (typeof apiError === 'string') return apiError;

    // Fallback to status text or default message
    return error.response?.statusText || error.message || 'An error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

interface QueryProviderProps {
  children: ReactNode;
  /** Dehydrated state from server-side prefetching */
  dehydratedState?: DehydratedState;
}

export function QueryProvider({ children, dehydratedState }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
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

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        {children}
      </HydrationBoundary>
      <Toaster
        position="bottom-left"
        toastOptions={{
          duration: 4000,
          className: 'sonner-toast',
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
