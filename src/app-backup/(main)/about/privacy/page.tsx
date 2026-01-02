'use client';

import styled from '@emotion/styled';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePrivacyPolicy, useInstance } from '@/api';
import { IconButton, TextSkeleton } from '@/components/atoms';

export default function PrivacyPolicyPage() {
    const router = useRouter();
    const { data: privacyPolicy, isLoading, isError } = usePrivacyPolicy();
    const { data: instance } = useInstance();

    return (
        <Container>
            {/* Header */}
            <Header>
                <IconButton onClick={() => router.back()} aria-label="Go back">
                    <ArrowLeft size={20} />
                </IconButton>
                <h1>Privacy Policy</h1>
            </Header>

            <Content>
                {isLoading ? (
                    <LoadingState>
                        <TextSkeleton width="100%" height={16} style={{ marginBottom: 12 }} />
                        <TextSkeleton width="100%" height={16} style={{ marginBottom: 12 }} />
                        <TextSkeleton width="100%" height={16} style={{ marginBottom: 12 }} />
                        <TextSkeleton width="80%" height={16} style={{ marginBottom: 24 }} />
                        <TextSkeleton width="100%" height={16} style={{ marginBottom: 12 }} />
                        <TextSkeleton width="100%" height={16} style={{ marginBottom: 12 }} />
                        <TextSkeleton width="60%" height={16} />
                    </LoadingState>
                ) : isError || !privacyPolicy?.content ? (
                    <EmptyState>
                        <EmptyTitle>Privacy Policy Not Available</EmptyTitle>
                        <EmptyDescription>
                            {instance?.domain
                                ? `The privacy policy for ${instance.domain} has not been made available.`
                                : 'The privacy policy has not been made available on this server.'}
                        </EmptyDescription>
                    </EmptyState>
                ) : (
                    <>
                        {privacyPolicy.updated_at && (
                            <UpdatedAt>
                                Last updated: {new Date(privacyPolicy.updated_at).toLocaleDateString()}
                            </UpdatedAt>
                        )}
                        <PolicyContent
                            dangerouslySetInnerHTML={{ __html: privacyPolicy.content }}
                        />
                    </>
                )}
            </Content>
        </Container>
    );
}

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: var(--size-3);
  padding: var(--size-3) var(--size-4);
  border-bottom: 1px solid var(--surface-3);
  position: sticky;
  top: 0;
  background: var(--surface-1);
  z-index: 10;

  h1 {
    margin: 0;
    font-size: var(--font-size-3);
    font-weight: 600;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: var(--size-4);
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
`;

const LoadingState = styled.div``;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--size-8);
`;

const EmptyTitle = styled.h2`
  margin: 0 0 var(--size-2) 0;
  color: var(--text-1);
`;

const EmptyDescription = styled.p`
  color: var(--text-2);
`;

const UpdatedAt = styled.div`
  color: var(--text-3);
  font-size: var(--font-size-0);
  margin-bottom: var(--size-4);
`;

const PolicyContent = styled.div`
  color: var(--text-1);
  line-height: 1.7;

  p {
    margin: 0 0 var(--size-4) 0;
  }

  h1 {
    font-size: var(--font-size-4);
    margin: var(--size-6) 0 var(--size-3);
  }

  h2 {
    font-size: var(--font-size-3);
    margin: var(--size-5) 0 var(--size-2);
  }

  h3 {
    font-size: var(--font-size-2);
    margin: var(--size-4) 0 var(--size-2);
  }

  ul, ol {
    margin: 0 0 var(--size-4) 0;
    padding-left: var(--size-5);
  }

  li {
    margin-bottom: var(--size-2);
  }

  a {
    color: var(--blue-6);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  strong {
    font-weight: 600;
  }

  hr {
    border: none;
    border-top: 1px solid var(--surface-3);
    margin: var(--size-6) 0;
  }
`;
