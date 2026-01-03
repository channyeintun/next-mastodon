import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/getQueryClient';
import { lookupAccountServer } from '@/lib/serverApi';
import { queryKeys } from '@/api/queryKeys';
import { AccountPageClient } from './AccountPageClient';

interface AccountPageProps {
    params: Promise<{ acct: string }>;
}

/**
 * Generate metadata for SEO and Open Graph cards.
 * This runs on the server for both direct visits and crawlers.
 */
export async function generateMetadata({ params }: AccountPageProps): Promise<Metadata> {
    const { acct: acctParam } = await params;
    const decodedAcct = decodeURIComponent(acctParam);

    if (!decodedAcct.startsWith('@')) {
        return { title: 'Profile Not Found' };
    }

    const acct = decodedAcct.slice(1);
    const account = await lookupAccountServer(acct);

    if (!account) {
        return { title: 'Profile Not Found' };
    }

    const displayName = account.display_name || account.username;
    const plainTextBio = account.note?.replace(/<[^>]*>/g, '').slice(0, 160) || '';

    return {
        title: `${displayName} (@${account.acct}) - Mastodon`,
        description: plainTextBio || `Profile of @${account.acct} on Mastodon`,
        openGraph: {
            title: `${displayName} (@${account.acct})`,
            description: plainTextBio || `Profile of @${account.acct} on Mastodon`,
            type: 'profile',
            images: account.avatar ? [{ url: account.avatar, alt: displayName }] : [],
            siteName: 'Mastodon',
        },
        twitter: {
            card: 'summary',
            title: `${displayName} (@${account.acct})`,
            description: plainTextBio || `Profile of @${account.acct}`,
            images: account.avatar ? [account.avatar] : [],
        },
    };
}

/**
 * Server Component wrapper for the Account/Profile page.
 * 
 * Hybrid SSR/CSR approach:
 * - Direct visit: Prefetches account data on server, dehydrates to client
 * - Client navigation: Skips prefetch, client uses TanStack Query cache
 * 
 * Detection: Client navigation sends 'rsc' header
 */
export default async function AccountPage({ params }: AccountPageProps) {
    const { acct: acctParam } = await params;

    // Decode and validate the acct parameter
    const decodedAcct = decodeURIComponent(acctParam);

    // The route expects @username format
    if (!decodedAcct.startsWith('@')) {
        notFound();
    }

    const acct = decodedAcct.slice(1); // Remove @ prefix

    // Detect client-side navigation via RSC header
    // When navigating via Link/router, Next.js sends RSC request with this header
    const headersList = await headers();
    const isClientNavigation = !!headersList.get('rsc');

    if (isClientNavigation) {
        // Client navigation: Skip prefetch, let client use TanStack Query cache
        // The cache was prepopulated via setQueryData before navigation
        return <AccountPageClient acct={acct} />;
    }

    // Direct visit: Prefetch on server for SSR
    const queryClient = getQueryClient();

    // Fetch account data on server
    const account = await lookupAccountServer(acct);

    if (!account) {
        notFound();
    }

    // Manually set the query data (since we can't use the client API on server)
    queryClient.setQueryData(queryKeys.accounts.lookup(acct), account);
    queryClient.setQueryData(queryKeys.accounts.detail(account.id), account);

    // Dehydrate and pass to client
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AccountPageClient acct={acct} />
        </HydrationBoundary>
    );
}
