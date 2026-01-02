import Head from 'next/head';
import styled from '@emotion/styled';
import Link from 'next/link';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useLists } from '@/api';
import { ArrowLeft, List } from 'lucide-react';
import { IconButton } from '@/components/atoms';
import { useRouter } from 'next/router';

export default function ListsPage() {
    const router = useRouter();
    const { data: lists, isLoading } = useLists();

    return (
        <MainLayout>
            <Head>
                <title>Lists - Mastodon</title>
                <meta name="description" content="Your lists on Mastodon" />
            </Head>
            <Container>
                <Header>
                    <IconButton onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </IconButton>
                    <Title>Lists</Title>
                </Header>

                {isLoading ? (
                    <LoadingContainer>Loading lists...</LoadingContainer>
                ) : lists?.length === 0 ? (
                    <EmptyState>
                        <List size={48} />
                        <p>You don&apos;t have any lists yet.</p>
                    </EmptyState>
                ) : (
                    <ListContainer>
                        {lists?.map((list) => (
                            <Link key={list.id} href={`/lists/${list.id}`}>
                                <ListItem>
                                    <List size={20} />
                                    <span>{list.title}</span>
                                </ListItem>
                            </Link>
                        ))}
                    </ListContainer>
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
  text-align: center;
  color: var(--text-2);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--size-8);
  color: var(--text-2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--size-4);
`;

const ListContainer = styled.div`
  padding: var(--size-2);
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--size-3);
  padding: var(--size-3);
  border-radius: var(--radius-2);
  cursor: pointer;
  
  &:hover {
    background: var(--surface-2);
  }
`;
