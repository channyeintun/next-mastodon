'use client';

import styled from '@emotion/styled';
import { Globe } from 'lucide-react';

interface HandleExplainerProps {
    username: string;
    server: string;
}

const Container = styled.div`
  font-size: var(--font-size-1);
  display: flex;
  flex-direction: column;
`;

const Username = styled.div`
  color: var(--text-2);
  margin-bottom: var(--size-2);
`;

const StyledDetails = styled.details`
  background: none;
  padding: 0;
  margin: 0;
  border: none;
  box-shadow: none;
  outline: none;
`;

const ServerBadge = styled.summary`
  display: inline-flex;
  cursor: pointer;
  padding: var(--size-1) var(--size-2);
  margin: 0;
  background: var(--blue-6);
  color: white;
  border-radius: var(--radius-1);
  font-size: var(--font-size-0);
  font-weight: var(--font-weight-5);
`;

const ExplainerContent = styled.div`
  margin-top: var(--size-3);
  padding: var(--size-4);
  background: var(--surface-2);
  border-radius: var(--radius-2);
  font-size: var(--font-size-1);
`;

const Header = styled.div`
  font-weight: var(--font-weight-6);
  font-size: var(--font-size-3);
  color: var(--text-1);
  margin-bottom: var(--size-4);
`;

const HandleBox = styled.div`
  padding: var(--size-3);
  border: 2px dashed var(--surface-4);
  border-radius: var(--radius-2);
  margin-bottom: var(--size-4);
`;

const HandleLabel = styled.div`
  color: var(--text-2);
  margin-bottom: var(--size-1);
`;

const HandleValue = styled.div`
  color: var(--blue-6);
  font-weight: var(--font-weight-5);
`;

const DefinitionList = styled.dl`
  margin: 0;
`;

const DefinitionItem = styled.div`
  display: flex;
  gap: var(--size-3);
  margin-bottom: var(--size-4);
`;

const IconBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--surface-3);
  border-radius: var(--radius-round);
  color: var(--text-1);
  flex-shrink: 0;
`;

const Term = styled.dt`
  font-weight: var(--font-weight-6);
  color: var(--text-1);
  margin-bottom: var(--size-1);
`;

const Description = styled.dd`
  margin: 0;
  color: var(--text-2);
`;

const ActivityPubSection = styled.div`
  color: var(--text-2);
`;

const InlineDetails = styled.details`
  display: inline;
  background: none;
  padding: 0;
`;

const InlineSummary = styled.summary`
  display: inline;
  color: var(--blue-6);
  cursor: pointer;
  list-style: none;
  background: none;
`;

const Definition = styled.dfn`
  font-style: normal;
`;

const ActivityPubExplanation = styled.div`
  margin-top: var(--size-3);
  color: var(--text-2);
`;

const Paragraph = styled.p<{ $lastChild?: boolean }>`
  margin: ${({ $lastChild }) => ($lastChild ? 0 : '0 0 var(--size-3) 0')};
`;

/**
 * Presentation component that explains what a Mastodon handle is.
 * Uses a details/summary element for progressive disclosure.
 */
export function HandleExplainer({ username, server }: HandleExplainerProps) {
    return (
        <Container>
            <Username>@{username}</Username>
            <StyledDetails>
                <ServerBadge>
                    {server}
                </ServerBadge>
                <ExplainerContent>
                    {/* Header */}
                    <Header>
                        What&apos;s in a handle?
                    </Header>

                    {/* Handle box */}
                    <HandleBox>
                        <HandleLabel>
                            Their handle:
                        </HandleLabel>
                        <HandleValue>
                            @{username}@{server}
                        </HandleValue>
                    </HandleBox>

                    {/* Definitions */}
                    <DefinitionList>
                        <DefinitionItem>
                            <IconBadge>
                                @
                            </IconBadge>
                            <div>
                                <Term>
                                    Username
                                </Term>
                                <Description>
                                    Their unique identifier on their server. It&apos;s possible to find users with the same username on different servers.
                                </Description>
                            </div>
                        </DefinitionItem>
                        <DefinitionItem>
                            <IconBadge>
                                <Globe size={18} />
                            </IconBadge>
                            <div>
                                <Term>
                                    Server
                                </Term>
                                <Description>
                                    Their digital home, where all of their posts live.
                                </Description>
                            </div>
                        </DefinitionItem>
                    </DefinitionList>

                    {/* ActivityPub section */}
                    <ActivityPubSection>
                        Since handles say who someone is and where they are, you can interact with people across the social web of{' '}
                        <InlineDetails>
                            <InlineSummary>
                                <Definition>ActivityPub-powered platforms</Definition>.
                            </InlineSummary>
                            <ActivityPubExplanation>
                                <Paragraph>
                                    ActivityPub is like the language Mastodon speaks with other social networks.
                                </Paragraph>
                                <Paragraph $lastChild>
                                    It lets you connect and interact with people not just on Mastodon, but across different social apps too.
                                </Paragraph>
                            </ActivityPubExplanation>
                        </InlineDetails>
                    </ActivityPubSection>
                </ExplainerContent>
            </StyledDetails>
        </Container>
    );
}
