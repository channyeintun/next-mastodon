import Head from 'next/head';
import styled from '@emotion/styled';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useFollowRequests } from '@/api';
import { AccountCard, AccountCardSkeleton } from '@/components/molecules';
import { ArrowLeft } from 'lucide-react';
import { IconButton, Button } from '@/components/atoms';
import { useRouter } from 'next/router';
import { flattenAndUniqById } from '@/utils/fp';
import { useAcceptFollowRequest, useRejectFollowRequest } from '@/api/mutations';

export default function FollowRequestsPage() {
    const router = useRouter();
    const { data, isLoading } = useFollowRequests();
    const accounts = flattenAndUniqById(data?.pages);

    const acceptMutation = useAcceptFollowRequest();
    const rejectMutation = useRejectFollowRequest();

    return (
        <MainLayout>
            <Head>
                <title>Follow Requests - Mastodon</title>
                <meta name="description" content="Manage your follow requests" />
            </Head>
            <Container>
                <Header>
                    <IconButton onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </IconButton>
                    <Title>Follow Requests</Title>
                </Header>

                {isLoading ? (
                    <LoadingContainer>
                        <AccountCardSkeleton />
                        <AccountCardSkeleton />
                    </LoadingContainer>
                ) : accounts.length === 0 ? (
                    <EmptyState>No pending follow requests.</EmptyState>
                ) : (
                    <RequestList>
                        {accounts.map((account) => (
                            <RequestItem key={account.id}>
                                <AccountCard account={account} />
                                <ButtonGroup>
                                    <Button
                                        onClick={() => acceptMutation.mutate(account.id)}
                                        disabled={acceptMutation.isPending}
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        onClick={() => rejectMutation.mutate(account.id)}
                                        disabled={rejectMutation.isPending}
                                    >
                                        Reject
                                    </Button>
                                </ButtonGroup>
                            </RequestItem>
                        ))}
                    </RequestList>
                )}
            </Container>
        </MainLayout>
    );
}

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
  border-bottom: 1px solid var(--surface-3);
  display: flex;
  align-items: center;
  gap: var(--size-3);
`;

const Title = styled.h1`
  font-size: var(--font-size-4);
`;

const LoadingContainer = styled.div`
  padding: var(--size-4);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--size-8);
  color: var(--text-2);
`;

const RequestList = styled.div`
  padding: var(--size-2);
`;

const RequestItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  padding: var(--size-3);
  border-bottom: 1px solid var(--surface-3);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--size-2);
  justify-content: flex-end;
`;
