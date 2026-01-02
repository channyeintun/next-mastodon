import styled from '@emotion/styled';
import Link from 'next/link';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const Header = styled.header`
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

export const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: var(--size-4);
  max-width: 680px;
  margin: 0 auto;
  width: 100%;
`;

export const Section = styled.section`
  margin-bottom: var(--size-6);
`;

export const SectionHeader = styled.div`
  margin-bottom: var(--size-2);
`;

export const ServerTitle = styled.h2`
  margin: 0;
  font-size: var(--font-size-5);
  font-weight: 700;
`;

export const ServerDescription = styled.p`
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

export const SectionTitle = styled.h3`
  margin: 0 0 var(--size-3) 0;
  font-size: var(--font-size-2);
  font-weight: 600;
  color: var(--text-2);
`;

export const AdminCard = styled(Link)`
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

export const AdminInfo = styled.div``;

export const AdminName = styled.div`
  font-weight: 600;
  color: var(--text-1);
`;

export const AdminHandle = styled.div`
  color: var(--text-2);
  font-size: var(--font-size-0);
`;

export const ContactEmail = styled.a`
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

export const DescriptionContent = styled.div`
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

export const EmptyMessage = styled.p`
  color: var(--text-3);
  font-style: italic;
`;

export const RulesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
`;

export const RuleItem = styled.div`
  display: flex;
  gap: var(--size-3);
  padding: var(--size-3);
  background: var(--surface-2);
  border-radius: var(--radius-2);
`;

export const RuleNumber = styled.div`
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

export const RuleText = styled.div`
  color: var(--text-1);
  line-height: 1.5;
  padding-top: 3px;
`;

export const LinkCard = styled(Link)`
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

export const LinkIcon = styled.div`
  color: var(--text-2);
`;

export const LinkContent = styled.div`
  flex: 1;
`;

export const LinkLabel = styled.div`
  font-weight: 600;
  color: var(--text-1);
`;

export const LinkDescription = styled.div`
  font-size: var(--font-size-0);
  color: var(--text-2);
`;

export const Footer = styled.footer`
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
