'use client';

import React from 'react';
import styled from '@emotion/styled';
import { useTranslations } from 'next-intl';

interface ShortcutGroup {
    title: string;
    shortcuts: { keys: string[]; description: string }[];
}

export function KeyboardShortcutsLegend() {
    const t = useTranslations('keyboardShortcuts');

    const groups: ShortcutGroup[] = [
        {
            title: t('navigation.title'),
            shortcuts: [
                { keys: ['j'], description: t('navigation.nextPost') },
                { keys: ['k'], description: t('navigation.prevPost') },
                { keys: ['0'], description: t('navigation.jumpTop') },
                { keys: ['g', 'h'], description: t('navigation.goHome') },
                { keys: ['g', 'n'], description: t('navigation.goNotifications') },
                { keys: ['g', 'l'], description: t('navigation.goExplore') },
                { keys: ['g', 'f'], description: t('navigation.goBookmarks') },
                { keys: ['g', 'p'], description: t('navigation.goProfile') },
                { keys: ['/'], description: t('navigation.search') },
            ],
        },
        {
            title: t('postActions.title'),
            shortcuts: [
                { keys: ['r'], description: t('postActions.reply') },
                { keys: ['f'], description: t('postActions.favorite') },
                { keys: ['b'], description: t('postActions.boost') },
                { keys: ['q'], description: t('postActions.quote') },
                { keys: ['m'], description: t('postActions.mention') },
                { keys: ['x'], description: t('postActions.toggleHidden') },
                { keys: ['h'], description: t('postActions.toggleSensitive') },
                { keys: ['e'], description: t('postActions.openMedia') },
                { keys: ['t'], description: t('postActions.translate') },
                { keys: ['enter', 'o'], description: t('postActions.openStatus') },
            ],
        },
        {
            title: t('general.title'),
            shortcuts: [
                { keys: ['n'], description: t('general.newPost') },
                { keys: ['?'], description: t('general.showShortcuts') },
                { keys: ['esc'], description: t('general.close') },
            ],
        },
    ];

    return (
        <Container className="bottom-sheet-content">
            <Title>{t('title')}</Title>
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
