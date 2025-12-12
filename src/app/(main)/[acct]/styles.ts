import styled from '@emotion/styled';

export const PageContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  position: sticky;
  top: 0;
  background: var(--surface-1);
  z-index: 10;
  padding: var(--size-4);
  display: flex;
  align-items: center;
  gap: var(--size-3);
  flex-shrink: 0;
`;

export const HeaderTitle = styled.h1`
  font-size: var(--font-size-4);
  margin-bottom: var(--size-1);
`;

export const HeaderSubtitle = styled.p`
  font-size: var(--font-size-0);
  color: var(--text-2);
`;

export const ScrollableContent = styled.div`
  flex: 1;
  overflow: auto;
`;

export const HeaderImage = styled.div<{ $url: string }>`
  width: 100%;
  height: 200px;
  border-radius: var(--radius-3);
  background-image: url(${({ $url }) => $url});
  background-size: cover;
  background-position: center;
  margin-bottom: calc(-1 * var(--size-8));
`;

export const ProfileSection = styled.div`
  padding: 0;
`;

export const ProfileDetails = styled.div`
  padding: var(--size-2);
  padding-top: var(--size-2);
`;

export const AvatarSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--size-4);
`;

export const NameSection = styled.div`
  margin-bottom: var(--size-4);
`;

export const DisplayName = styled.h2`
  font-size: var(--font-size-5);
  font-weight: var(--font-weight-7);
  margin-bottom: var(--size-1);
  display: flex;
  align-items: center;
  gap: var(--size-2);
  flex-wrap: wrap;
`;

export const BotBadge = styled.span`
  font-size: var(--font-size-0);
  background: var(--surface-3);
  padding: 2px var(--size-2);
  border-radius: var(--radius-1);
`;

export const LockIcon = styled.span`
  font-size: var(--font-size-1);
`;

export const MetaSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-4);
  font-size: var(--font-size-0);
  color: var(--text-2);
  margin-bottom: var(--size-4);
`;

export const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: var(--size-2);
`;

export const MetaLink = styled.a`
  display: flex;
  align-items: center;
  gap: var(--size-2);
  color: var(--blue-6);
  text-decoration: none;
`;

export const ErrorContainer = styled.div`
  text-align: center;
  margin-top: var(--size-8);
`;

export const ErrorTitle = styled.h2`
  color: var(--red-6);
  margin-bottom: var(--size-3);
`;

export const PostsHeader = styled.h3`
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-6);
  margin-bottom: var(--size-4);
  padding-left: var(--size-4);
`;

export const LoadingBorder = styled.div`
  border-top: 1px solid var(--surface-3);
  padding-top: var(--size-4);
  margin-top: var(--size-4);
`;
