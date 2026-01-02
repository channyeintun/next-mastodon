import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { ArrowLeft } from 'lucide-react';

import { getStatusServer } from '@/lib/serverApi';
import { MainLayout } from '@/components/layouts/MainLayout';
import { PostCard } from '@/components/organisms';
import { PostCardSkeleton, StatusStats } from '@/components/molecules';
import { IconButton } from '@/components/atoms';
import { ComposerPanel } from '@/components/organisms/ComposerPanel';
import { useStatusContext, useStatus } from '@/api';
import { useAuthStore } from '@/hooks/useStores';
import { queryKeys } from '@/api/queryKeys';
import type { Status } from '@/types/mastodon';

interface StatusPageProps {
    // SSR data - null if client navigation (uses cache instead)
    status: Status | null;
    // Status ID for CSR fallback
    statusId: string;
}

/**
 * Hybrid SSR/CSR approach:
 * - Direct visit: getServerSideProps fetches data, returns status
 * - Client navigation: getServerSideProps returns null, client uses TanStack Query cache
 * 
 * Detection: Client navigation sends x-nextjs-data header
 */
export const getServerSideProps: GetServerSideProps<StatusPageProps> = async ({ params, req }) => {
    const id = params?.id;

    if (typeof id !== 'string') {
        return { notFound: true };
    }

    // Detect client-side navigation via x-nextjs-data header
    // When using Link or router.push, Next.js fetches /_next/data/... and sets this header
    const isClientNavigation = !!req.headers['x-nextjs-data'];

    if (isClientNavigation) {
        // Client navigation: Skip server fetch, let client use TanStack Query cache
        return {
            props: {
                status: null,
                statusId: id,
            },
        };
    }

    // Direct visit (SSR): Fetch data on server
    const status = await getStatusServer(id);

    if (!status) {
        return { notFound: true };
    }

    return {
        props: {
            status,
            statusId: id,
        },
    };
};

// Loading skeleton for status page
function StatusLoadingSkeleton() {
    const router = useRouter();
    return (
        <MainLayout>
            <Head><title>Loading... - Mastodon</title></Head>
            <Container>
                <Header>
                    <IconButton onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </IconButton>
                    <Title>Post</Title>
                </Header>
                <div className="virtualized-list-container">
                    <PostCardSkeleton />
                </div>
            </Container>
        </MainLayout>
    );
}

// Not found state
function StatusNotFound() {
    const router = useRouter();
    return (
        <MainLayout>
            <Head><title>Post Not Found - Mastodon</title></Head>
            <Container>
                <Header>
                    <IconButton onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </IconButton>
                    <Title>Post</Title>
                </Header>
                <NotFoundContainer>
                    <h2>Post not found</h2>
                    <p>The post you&apos;re looking for doesn&apos;t exist or may have been deleted.</p>
                </NotFoundContainer>
            </Container>
        </MainLayout>
    );
}

export default function StatusPage({ status: ssrStatus, statusId }: StatusPageProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const authStore = useAuthStore();

    // If SSR provided status data, use it directly
    // If client navigation (ssrStatus is null), use TanStack Query to get from cache
    const { data: csrStatus, isLoading: csrLoading, error: csrError } = useStatus(
        // Only fetch via CSR if SSR didn't provide data
        ssrStatus ? '' : statusId
    );

    // Use SSR data if available, otherwise use CSR data
    const status = ssrStatus || csrStatus;
    const isLoading = !ssrStatus && csrLoading;
    const error = !ssrStatus && csrError;

    // Populate cache with SSR data on mount
    useEffect(() => {
        if (ssrStatus) {
            queryClient.setQueryData(queryKeys.statuses.detail(ssrStatus.id), ssrStatus);
        }
    }, [ssrStatus, queryClient]);

    // Fetch context (ancestors/descendants) on client side
    const { data: context, isLoading: contextLoading } = useStatusContext(status?.id || '');

    // Handle deletion of the current post - redirect to home
    const handlePostDeleted = () => {
        router.push('/');
    };

    // Scroll to main post after context loads
    useEffect(() => {
        if (context && !contextLoading) {
            const mainPost = document.getElementById('main-post');
            if (mainPost) {
                setTimeout(() => {
                    mainPost.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }, [context, contextLoading]);

    // Handle loading state (only for CSR, SSR is already loaded)
    if (isLoading) {
        return <StatusLoadingSkeleton />;
    }

    // Handle error or not found
    if (error || !status) {
        return <StatusNotFound />;
    }

    const ancestors = context?.ancestors ?? [];
    const descendants = context?.descendants ?? [];

    // Generate meta description from post content
    const plainTextContent = status.content
        .replace(/<[^>]*>/g, '')
        .slice(0, 160);

    return (
        <MainLayout>
            <Head>
                <title>{`${status.account.display_name || status.account.username}: "${plainTextContent}" - Mastodon`}</title>
                <meta name="description" content={plainTextContent} />
                <meta property="og:title" content={`${status.account.display_name || status.account.username} on Mastodon`} />
                <meta property="og:description" content={plainTextContent} />
                {status.media_attachments?.[0]?.preview_url && (
                    <meta property="og:image" content={status.media_attachments[0].preview_url} />
                )}
                <meta property="og:type" content="article" />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>

            <Container>
                {/* Header */}
                <Header>
                    <IconButton onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </IconButton>
                    <Title>Post</Title>
                </Header>

                {/* Thread container */}
                <div className="virtualized-list-container">
                    {/* Ancestors (parent posts) */}
                    {ancestors.length > 0 && (
                        <div>
                            {ancestors.map((ancestor) => (
                                <div key={ancestor.id}>
                                    <PostCard status={ancestor} />
                                    <ThreadLineContainer>
                                        <ThreadLine />
                                    </ThreadLineContainer>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Main status (highlighted) */}
                    <HighlightedPost>
                        <PostCard
                            id="main-post"
                            status={status}
                            showEditHistory
                            onDeleteSuccess={handlePostDeleted}
                        />
                        <StatusStatsWrapper>
                            <StatusStats
                                statusId={status.id}
                                favouritesCount={status.favourites_count}
                                reblogsCount={status.reblogs_count}
                                quotesCount={status.quotes_count}
                            />
                        </StatusStatsWrapper>
                    </HighlightedPost>

                    {/* Reply Composer */}
                    {authStore.isAuthenticated && (
                        <ReplyComposerContainer>
                            <ComposerPanel
                                key={`reply-${status.id}`}
                                initialVisibility={status.visibility}
                                mentionPrefix={status.account.acct}
                                inReplyToId={status.id}
                                isReply
                            />
                        </ReplyComposerContainer>
                    )}

                    {/* Descendants (replies) */}
                    {descendants.length > 0 && (
                        <div>
                            <RepliesHeader>
                                Replies ({descendants.length})
                            </RepliesHeader>
                            {descendants.map((descendant, index) => (
                                <div key={descendant.id}>
                                    {index > 0 && (
                                        <ThreadLineContainer>
                                            <ThreadLineShort />
                                        </ThreadLineContainer>
                                    )}
                                    <PostCard status={descendant} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty state for no replies */}
                    {!contextLoading && descendants.length === 0 && (
                        <EmptyState>
                            <p>No replies yet.</p>
                            <EmptySubtext>Be the first to reply!</EmptySubtext>
                        </EmptyState>
                    )}
                </div>
            </Container>
        </MainLayout>
    );
}

// Styled components
const Container = styled.div`
  max-width: 680px;
  margin: 0 auto;
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  background: var(--surface-1);
  z-index: 10;
  padding: var(--size-4);
  margin-bottom: var(--size-4);
  border-bottom: 1px solid var(--surface-3);
  display: flex;
  align-items: center;
  gap: var(--size-3);
`;

const Title = styled.h1`
  font-size: var(--font-size-4);
`;

const HighlightedPost = styled.div`
  margin-bottom: var(--size-3);
`;

const StatusStatsWrapper = styled.div`
  padding: 0 var(--size-3);
`;

const RepliesHeader = styled.h2`
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--size-4);
  color: var(--text-2);
`;

const ThreadLineContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  padding-left: var(--size-5);
`;

const ThreadLine = styled.div`
  width: 2px;
  height: 32px;
  background: var(--surface-4);
  margin-left: 18px;
`;

const ThreadLineShort = styled.div`
  width: 2px;
  height: 24px;
  background: var(--surface-4);
  margin-left: 18px;
`;

const ReplyComposerContainer = styled.div`
  margin-bottom: var(--size-4);
  border: 1px solid var(--surface-3);
  border-radius: var(--radius-3);
  background: var(--surface-2);
  padding: var(--size-3);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--size-8) var(--size-4);
  color: var(--text-2);
  display: grid;
  justify-content: center;
`;

const EmptySubtext = styled.p`
  font-size: var(--font-size-0);
  margin-top: var(--size-2);
`;

const NotFoundContainer = styled.div`
  padding: var(--size-8);
  text-align: center;
  
  h2 {
    font-size: var(--font-size-4);
    margin-bottom: var(--size-2);
  }
  
  p {
    color: var(--text-2);
  }
`;
