import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/getQueryClient';
import { getStatusServer } from '@/lib/serverApi';
import { queryKeys } from '@/api/queryKeys';
import { StatusPageClient } from './StatusPageClient';

interface StatusPageProps {
    params: Promise<{ id: string }>;
}

/**
 * Generate metadata for SEO and Open Graph cards.
 * This runs on the server for both direct visits and crawlers.
 */
export async function generateMetadata({ params }: StatusPageProps): Promise<Metadata> {
    const { id } = await params;
    const status = await getStatusServer(id);

    if (!status) {
        return { title: 'Post Not Found' };
    }

    const displayName = status.account.display_name || status.account.username;
    const plainTextContent = status.content?.replace(/<[^>]*>/g, '').slice(0, 160) || '';
    const title = `${displayName}: "${plainTextContent.slice(0, 50)}${plainTextContent.length > 50 ? '...' : ''}"`;

    // Get the first media attachment for og:image
    const ogImage = status.media_attachments?.[0]?.preview_url || status.account.avatar;

    return {
        title: `${title} - Mastodon`,
        description: plainTextContent,
        openGraph: {
            title: `${displayName} on Mastodon`,
            description: plainTextContent,
            type: 'article',
            images: ogImage ? [{ url: ogImage }] : [],
            siteName: 'Mastodon',
            publishedTime: status.created_at,
            authors: [`@${status.account.acct}`],
        },
        twitter: {
            card: status.media_attachments?.length ? 'summary_large_image' : 'summary',
            title: `${displayName} on Mastodon`,
            description: plainTextContent,
            images: ogImage ? [ogImage] : [],
        },
    };
}

/**
 * Server Component wrapper for the Status/Post detail page.
 * 
 * Hybrid SSR/CSR approach:
 * - Direct visit: Prefetches status data on server, dehydrates to client
 * - Client navigation: Skips prefetch, client uses TanStack Query cache
 * 
 * Detection: Client navigation sends 'rsc' header
 */
export default async function StatusPage({ params }: StatusPageProps) {
    const { id } = await params;

    // Detect client-side navigation via RSC header
    // When navigating via Link/router, Next.js sends RSC request with this header
    const headersList = await headers();
    const isClientNavigation = !!headersList.get('rsc');

    if (isClientNavigation) {
        // Client navigation: Skip prefetch, let client use TanStack Query cache
        // The cache was prepopulated via setQueryData before navigation
        return <StatusPageClient statusId={id} />;
    }

    // Direct visit: Prefetch on server for SSR
    const queryClient = getQueryClient();

    // Fetch status data on server
    const status = await getStatusServer(id);

    if (!status) {
        notFound();
    }

    // Manually set the query data (since we can't use the client API on server)
    queryClient.setQueryData(queryKeys.statuses.detail(id), status);

    // Dehydrate and pass to client
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <StatusPageClient statusId={id} />
        </HydrationBoundary>
    );
}
