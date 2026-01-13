'use client';

import React from 'react';
import styled from '@emotion/styled';

interface ShortcutGroup {
    title: string;
    shortcuts: { keys: string[]; description: string }[];
}

export function KeyboardShortcutsLegend() {

    const groups: ShortcutGroup[] = [
        {
            title: 'Navigation',
            shortcuts: [
                { keys: ['j'], description: 'Next post' },
                { keys: ['k'], description: 'Previous post' },
                { keys: ['0'], description: 'Jump to top' },
                { keys: ['g', 'h'], description: 'Go to home' },
                { keys: ['g', 'n'], description: 'Go to notifications' },
                { keys: ['g', 'l'], description: 'Go to explore' },
                { keys: ['g', 'f'], description: 'Go to bookmarks' },
                { keys: ['g', 'p'], description: 'Go to profile' },
                { keys: ['/'], description: 'Search' },
            ],
        },
        {
            title: 'Post Actions',
            shortcuts: [
                { keys: ['r'], description: 'Reply' },
                { keys: ['f'], description: 'Favorite' },
                { keys: ['b'], description: 'Boost' },
                { keys: ['q'], description: 'Quote' },
                { keys: ['m'], description: 'Mention author' },
                { keys: ['x'], description: 'Toggle hidden content' },
                { keys: ['h'], description: 'Toggle sensitive media' },
                { keys: ['e'], description: 'Open media attachments' },
                { keys: ['t'], description: 'Translate post' },
                { keys: ['enter', 'o'], description: 'Open status' },
            ],
        },
        {
            title: 'General',
            shortcuts: [
                { keys: ['n'], description: 'New post' },
                { keys: ['?'], description: 'Show shortcuts' },
                { keys: ['esc'], description: 'Back / Close' },
            ],
        },
    ];

    return (
        <Container className="bottom-sheet-content">
            <Title>Keyboard Shortcuts</Title>
            <Grid>
                {groups.map((group) => (
                    <Group key={group.title}>
                        <GroupTitle>{group.title}</GroupTitle>
                        <ShortcutList>
                            {group.shortcuts.map((s) => (
                                <ShortcutItem key={s.description}>
                                    <Keys>
                                        {s.keys.map((k, i) => (
                                            <React.Fragment key={k}>
                                                <Kbd>{k}</Kbd>
                                                {i < s.keys.length - 1 && <span style={{ margin: '0 4px' }}>,</span>}
                                            </React.Fragment>
                                        ))}
                                    </Keys>
                                    <Description>{s.description}</Description>
                                </ShortcutItem>
                            ))}
                        </ShortcutList>
                    </Group>
                ))}
            </Grid>
        </Container>
    );
}

const Container = styled.div`
  max-height: 80vh;
  overflow-y: auto;
  padding-bottom: var(--size-8) !important;
`;

const Title = styled.h2`
  font-size: var(--font-size-4);
  margin-bottom: var(--size-6);
  color: var(--text-1);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--size-8);
`;

const Group = styled.div``;

const GroupTitle = styled.h3`
  font-size: var(--font-size-1);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-3);
  margin-bottom: var(--size-4);
`;

const ShortcutList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
`;

const ShortcutItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--size-4);
`;

const Keys = styled.div`
  display: flex;
  align-items: center;
`;

const Kbd = styled.kbd`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 4px;
  background: var(--surface-3);
  border: 1px solid var(--surface-4);
  border-radius: var(--radius-1);
  font-family: var(--font-mono);
  font-size: var(--font-size-0);
  color: var(--text-1);
  box-shadow: 0 2px 0 var(--surface-4);
`;

const Description = styled.span`
  color: var(--text-2);
  font-size: var(--font-size-1);
  text-align: right;
`;
