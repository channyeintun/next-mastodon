import Head from 'next/head';
import Link from 'next/link';
import styled from '@emotion/styled';

export default function Custom404() {
    return (
        <>
            <Head>
                <title>404 - Page Not Found - Mastodon</title>
            </Head>
            <Container>
                <Title>404</Title>
                <Message>This page could not be found.</Message>
                <Link href="/">
                    <HomeLink>Go back home</HomeLink>
                </Link>
            </Container>
        </>
    );
}

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--size-4);
`;

const Title = styled.h1`
  font-size: 6rem;
  color: var(--brand);
  margin: 0;
`;

const Message = styled.p`
  font-size: var(--font-size-3);
  color: var(--text-2);
`;

const HomeLink = styled.span`
  color: var(--brand);
  text-decoration: underline;
  cursor: pointer;
  
  &:hover {
    text-decoration: none;
  }
`;
