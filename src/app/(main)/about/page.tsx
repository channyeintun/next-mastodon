'use client';

import { ArrowLeft, Mail, Shield, BookOpen, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useInstance, useExtendedDescription } from '@/api';
import { IconButton, Avatar, TextSkeleton } from '@/components/atoms';
import { useLocale } from '@/hooks/useLocale';
import {
  Container, Header, Content, Section, SectionHeader, ServerTitle, ServerDescription,
  SectionTitle, AdminCard, AdminInfo, AdminName, AdminHandle, ContactEmail,
  DescriptionContent, EmptyMessage, RulesList, RuleItem, RuleNumber, RuleText,
  RuleHint,
  LinkCard, LinkIcon, LinkContent, LinkLabel, LinkDescription, Footer,
} from './AboutStyles';

export default function AboutPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const { data: instance, isLoading: instanceLoading } = useInstance();
  const { data: extendedDescription, isLoading: descriptionLoading } = useExtendedDescription();

  const isLoading = instanceLoading || descriptionLoading;
  const rules = instance?.rules ?? [];
  const adminAccount = instance?.contact?.account;

  return (
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
              {rules.map((rule, index) => {
                const localized = rule.translations?.[locale];
                const text = localized?.text || rule.text;
                const hint = localized?.hint || rule.hint;

                return (
                  <RuleItem key={rule.id}>
                    <RuleNumber>{index + 1}</RuleNumber>
                    <div>
                      <RuleText>{text}</RuleText>
                      {hint && <RuleHint>{hint}</RuleHint>}
                    </div>
                  </RuleItem>
                );
              })}
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
  );
}
