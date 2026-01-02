import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Mail, Shield, BookOpen, ExternalLink } from 'lucide-react';
import { useInstance, useExtendedDescription } from '@/api';
import { MainLayout } from '@/components/layouts/MainLayout';
import { IconButton, Avatar, TextSkeleton } from '@/components/atoms';
import styled from '@emotion/styled';
import Link from 'next/link';

export default function AboutPage() {
  const router = useRouter();
  const { data: instance, isLoading: instanceLoading } = useInstance();
  const { data: extendedDescription, isLoading: descriptionLoading } = useExtendedDescription();

  const isLoading = instanceLoading || descriptionLoading;
  const rules = instance?.rules ?? [];
  const adminAccount = instance?.contact?.account;

  return (
    <MainLayout>
      <Head>
        <title>About - Mastodon</title>
        <meta name="description" content="About this Mastodon server" />
      </Head>
      <Container>
        <Header>
          <IconButton onClick={() => router.back()} aria-label="Go back"><ArrowLeft size={20} /></IconButton>
          <h1>About</h1>
        </Header>

        <Content>
          <Section>
            <SectionHeader>
              {isLoading ? <TextSkeleton width={200} height={28} /> : <ServerTitle>{instance?.domain}</ServerTitle>}
            </SectionHeader>
            <ServerDescription>
              Decentralized social media powered by{' '}
              <a href="https://joinmastodon.org" target="_blank" rel="noopener noreferrer">Mastodon</a>
            </ServerDescription>
          </Section>

          {adminAccount && (
            <Section>
              <SectionTitle>Administered by</SectionTitle>
              <AdminCard href={`/@${adminAccount.acct}`}>
                <Avatar src={adminAccount.avatar} alt={adminAccount.display_name || adminAccount.username} size="medium" />
                <AdminInfo>
                  <AdminName>{adminAccount.display_name || adminAccount.username}</AdminName>
                  <AdminHandle>@{adminAccount.acct}</AdminHandle>
                </AdminInfo>
              </AdminCard>
              {instance?.contact?.email && <ContactEmail href={`mailto:${instance.contact.email}`}><Mail size={16} />{instance.contact.email}</ContactEmail>}
            </Section>
          )}

          <Section>
            <SectionTitle>About this server</SectionTitle>
            {descriptionLoading ? (
              <>
                <TextSkeleton width="100%" height={16} style={{ marginBottom: 8 }} />
                <TextSkeleton width="100%" height={16} style={{ marginBottom: 8 }} />
                <TextSkeleton width="80%" height={16} />
              </>
            ) : extendedDescription?.content ? (
              <DescriptionContent dangerouslySetInnerHTML={{ __html: extendedDescription.content }} />
            ) : (
              <EmptyMessage>No extended description provided.</EmptyMessage>
            )}
          </Section>

          {rules.length > 0 && (
            <Section>
              <SectionTitle>Server rules</SectionTitle>
              <RulesList>
                {rules.map((rule, index) => (
                  <RuleItem key={rule.id}>
                    <RuleNumber>{index + 1}</RuleNumber>
                    <RuleText>{rule.text}</RuleText>
                  </RuleItem>
                ))}
              </RulesList>
            </Section>
          )}

          <Section>
            <SectionTitle>Legal</SectionTitle>
            <LinkCard href="/about/privacy">
              <LinkIcon><Shield size={20} /></LinkIcon>
              <LinkContent><LinkLabel>Privacy Policy</LinkLabel><LinkDescription>Learn how we handle your data</LinkDescription></LinkContent>
              <ExternalLink size={16} />
            </LinkCard>
            <LinkCard href="/about/terms">
              <LinkIcon><BookOpen size={20} /></LinkIcon>
              <LinkContent><LinkLabel>Terms of Service</LinkLabel><LinkDescription>Our terms and conditions</LinkDescription></LinkContent>
              <ExternalLink size={16} />
            </LinkCard>
          </Section>

          <Footer><p>Mastodon is free, open-source software, and a trademark of Mastodon gGmbH.</p></Footer>
        </Content>
      </Container>
    </MainLayout>
  );
}

// Styled components (matching App Router AboutStyles.tsx)
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
  max-width: 680px;
  margin: 0 auto;
  width: 100%;
`;

const Section = styled.section`
  margin-bottom: var(--size-6);
`;

const SectionHeader = styled.div`
  margin-bottom: var(--size-2);
`;

const ServerTitle = styled.h2`
  margin: 0;
  font-size: var(--font-size-5);
  font-weight: 700;
`;

const ServerDescription = styled.p`
  color: var(--text-2);
  margin: 0;

  a {
    color: var(--blue-6);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 var(--size-3) 0;
  font-size: var(--font-size-2);
  font-weight: 600;
  color: var(--text-2);
`;

const AdminCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: var(--size-3);
  padding: var(--size-3);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  text-decoration: none;
  margin-bottom: var(--size-2);

  &:hover {
    background: var(--surface-3);
  }
`;

const AdminInfo = styled.div``;

const AdminName = styled.div`
  font-weight: 600;
  color: var(--text-1);
`;

const AdminHandle = styled.div`
  color: var(--text-2);
  font-size: var(--font-size-0);
`;

const ContactEmail = styled.a`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  color: var(--blue-6);
  text-decoration: none;
  font-size: var(--font-size-1);

  &:hover {
    text-decoration: underline;
  }
`;

const DescriptionContent = styled.div`
  color: var(--text-1);
  line-height: 1.6;

  p {
    margin: 0 0 var(--size-3) 0;
  }

  a {
    color: var(--blue-6);
  }

  h1, h2, h3 {
    margin: var(--size-4) 0 var(--size-2);
  }

  ul, ol {
    margin: 0 0 var(--size-3) 0;
    padding-left: var(--size-5);
  }
`;

const EmptyMessage = styled.p`
  color: var(--text-3);
  font-style: italic;
`;

const RulesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
`;

const RuleItem = styled.div`
  display: flex;
  gap: var(--size-3);
  padding: var(--size-3);
  background: var(--surface-2);
  border-radius: var(--radius-2);
`;

const RuleNumber = styled.div`
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--blue-6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--font-size-0);
`;

const RuleText = styled.div`
  color: var(--text-1);
  line-height: 1.5;
  padding-top: 3px;
`;

const LinkCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: var(--size-3);
  padding: var(--size-3);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  text-decoration: none;
  margin-bottom: var(--size-2);
  color: var(--text-2);

  &:hover {
    background: var(--surface-3);
  }
`;

const LinkIcon = styled.div`
  color: var(--text-2);
`;

const LinkContent = styled.div`
  flex: 1;
`;

const LinkLabel = styled.div`
  font-weight: 600;
  color: var(--text-1);
`;

const LinkDescription = styled.div`
  font-size: var(--font-size-0);
  color: var(--text-2);
`;

const Footer = styled.footer`
  padding: var(--size-4);
  text-align: center;
  border-top: 1px solid var(--surface-3);
  margin-top: var(--size-4);

  p {
    margin: 0;
    color: var(--text-3);
    font-size: var(--font-size-0);
  }
`;
